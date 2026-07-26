import os
import shutil
import json
import tempfile
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from app.kinematics import calculate_kinematics
from app.ai_groq import process_groq_pipeline
from app.database import supabase
from app.auth import get_current_user
from app.notifications import notify_trusted_circle
from app.helplines import find_nearby_helplines
from app.ai_companion import get_companion_response

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

app = FastAPI()

_cors_env = os.environ.get("CORS_ORIGINS", "")
CORS_ORIGINS = [o.strip() for o in _cors_env.split(",") if o.strip()] or [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Catch FastAPI HTTPExceptions agar CORS tetap disisipkan untuk error response (seperti 401, 404, 422)
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in CORS_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers
    )

# Catch all unhandled exceptions agar crash backend (500) mengembalikan CORS header dan detail traceback yang bersih
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    origin = request.headers.get("origin", "")
    headers = {}
    if origin in CORS_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Access-Control-Allow-Methods"] = "*"
        headers["Access-Control-Allow-Headers"] = "*"
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers=headers
    )

class JournalSaveRequest(BaseModel):
    sleep_hours: float
    exercise_status: str
    ocr_text: str = ""
    kinematics: dict
    sentiment_label: str = ""
    sentiment_score: int = 0
    handwriting_insights: str = ""
    mood_stress_correlation: str = ""
    recommendations: str = ""
    stress_score: int = 0
    mood_score: int = 0
    future_mood_prediction: list = []

@app.post("/api/analyze")
async def analyze_journal(
    file: UploadFile = File(...),
    strokes_json: str = Form(...),
    sleep_hours: float = Form(...),
    erase_count: int = Form(...),
    duration_seconds: int = Form(...),
    exercise_status: str = Form(...),
    user = Depends(get_current_user)
):
    # Gunakan tempfile agar cross-platform (Windows tidak punya /tmp)
    suffix = os.path.splitext(file.filename or "image.png")[1] or ".png"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_file_path = tmp.name
    tmp.close()

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save temp file: {str(e)}")

    try:
        strokes = json.loads(strokes_json)
        kinematics = calculate_kinematics(strokes, erase_count, duration_seconds)
        analysis_result = process_groq_pipeline(temp_file_path, kinematics, sleep_hours, exercise_status)

        # HANYA mengembalikan data hasil analisis, TIDAK otomatis menyimpan ke database.
        response_data = {
            "kinematics": kinematics,
            **analysis_result
        }
        return response_data

    except Exception as e:
        import traceback
        print(f"ANALYZE ERROR: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis pipeline failed: {str(e)}")

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/api/journals")
async def save_journal(req: JournalSaveRequest, user = Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")
    try:
        # 1. Simpan ke tabel journals
        journal = supabase.table("journals").insert({
            "user_id": user.id,
            "no_of_hours_sleep": req.sleep_hours,
            "exercise_status": req.exercise_status,
            "ocr_text": req.ocr_text,
        }).execute()

        if not journal.data:
            raise HTTPException(status_code=500, detail="Failed to save journal record")

        journal_id = journal.data[0]["id"]

        # 2. Simpan ke tabel kinematic_features
        supabase.table("kinematic_features").insert({
            "journal_id": journal_id,
            "stroke_count": req.kinematics.get("stroke_count", 0),
            "erase_count": req.kinematics.get("erase_count", 0),
            "duration_seconds": req.kinematics.get("duration_seconds", 0),
            "average_velocity": req.kinematics.get("average_velocity", 0.0),
            "average_acceleration": req.kinematics.get("average_acceleration", 0.0),
            "jerk_score": req.kinematics.get("jerk_score", 0.0),
            "pen_lifts": req.kinematics.get("pen_lifts", 0),
        }).execute()

        # 3. Simpan ke tabel llm_analyses
        supabase.table("llm_analyses").insert({
            "journal_id": journal_id,
            "sentiment_label": req.sentiment_label,
            "sentiment_score": req.sentiment_score,
            "handwriting_insights": req.handwriting_insights,
            "mood_stress_correlation": req.mood_stress_correlation,
            "recommendations": req.recommendations,
            "stress_score": req.stress_score,
            "mood_score": req.mood_score,
            "future_mood_prediction": json.dumps(req.future_mood_prediction),
        }).execute()

        # 4. Kirim notifikasi ke trusted circle jika tingkat stres tinggi (exceeds 70)
        stress = req.stress_score
        if stress > 70:
            user_profile = supabase.table("users").select("full_name").eq("id", user.id).execute()
            user_name = user_profile.data[0]["full_name"] if user_profile.data else user.email
            tc = supabase.table("trusted_circles").select("*").eq("user_id", user.id).execute()
            contacts = [{"name": r["contact_name"], "type": r["contact_type"], "value": r["contact_value"]} for r in tc.data] if tc.data else []
            if contacts:
                notify_trusted_circle(user_name=user_name, stress_score=int(stress), contacts=contacts)

        return {"status": "saved", "journal_id": journal_id}
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save journal: {str(e)}")

@app.get("/api/helplines")
async def get_helplines(lat: float, lon: float, radius: int = 5000):
    return find_nearby_helplines(lat, lon, radius)

# --- Mood Logs ---

@app.post("/api/mood-logs")
async def create_mood_log(mood_score: int, note: str = None, user = Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")
    if mood_score < 1 or mood_score > 5:
        raise HTTPException(status_code=400, detail="mood_score must be 1-5")

    result = supabase.table("mood_logs").insert({
        "user_id": user.id,
        "mood_score": mood_score,
        "note": note or "",
    }).execute()

    return {"status": "saved", "data": result.data[0]}


@app.get("/api/history")
async def get_history_with_mood(range: int = 7, user = Depends(get_current_user)):
    if not supabase:
        return {"entries": []}

    from datetime import datetime, timedelta, timezone
    since = (datetime.now(timezone.utc) - timedelta(days=range)).isoformat()

    try:
        journals = supabase.table("journals").select("id, created_at, ocr_text").eq("user_id", user.id).gte("created_at", since).order("created_at", desc=True).limit(100).execute()
        journal_ids = [j["id"] for j in (journals.data or [])]

        entries = []
        mood_desc = {1: "Sangat Buruk", 2: "Buruk", 3: "Biasa", 4: "Baik", 5: "Sangat Baik"}

        if journal_ids:
            llm = supabase.table("llm_analyses").select("*").in_("journal_id", journal_ids).execute()
            llm_map = {r["journal_id"]: r for r in (llm.data or [])}
            for j in (journals.data or []):
                lid = j["id"]
                if lid in llm_map:
                    lr = llm_map[lid]
                    entries.append({"type": "journal", "date": j["created_at"], "ocr_text": j.get("ocr_text", ""), "sentiment_label": lr.get("sentiment_label", ""), "sentiment_score": lr.get("sentiment_score", 0), "stress_score": lr.get("stress_score", 0), "mood_score": lr.get("mood_score", 0), "handwriting_insights": lr.get("handwriting_insights", ""), "recommendations": lr.get("recommendations", "")})

        moods = supabase.table("mood_logs").select("*").eq("user_id", user.id).gte("created_at", since).order("created_at", desc=True).limit(100).execute()
        for row in (moods.data or []):
            entries.append({"type": "mood", "date": row["created_at"], "sentiment_label": mood_desc.get(row["mood_score"], "Biasa"), "sentiment_score": row["mood_score"] * 20, "mood_score": row["mood_score"] * 20, "stress_score": None, "note": row.get("note", "")})

        entries.sort(key=lambda e: e["date"])
        return {"entries": entries}
    except Exception as e:
        print(f"HISTORY ERROR: {e}")
        import traceback; traceback.print_exc()
        return {"entries": []}

# --- Habits — using habits router ---

from app.habits import router as habits_router
app.include_router(habits_router)

# --- Trusted Circles ---

@app.get("/api/trusted-circles")
async def get_trusted_circles(user = Depends(get_current_user)):
    if not supabase:
        return {"contacts": []}
    result = supabase.table("trusted_circles") \
        .select("*") \
        .eq("user_id", user.id) \
        .order("created_at") \
        .execute()
    return {"contacts": result.data or []}

class ContactCreate(BaseModel):
    contact_name: str
    contact_type: str
    contact_value: str

@app.post("/api/trusted-circles")
async def create_trusted_circle(contact: ContactCreate, user = Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")
    if contact.contact_type not in ("email", "whatsapp"):
        raise HTTPException(status_code=400, detail="Invalid contact_type")

    result = supabase.table("trusted_circles").insert({
        "user_id": user.id,
        "contact_name": contact.contact_name,
        "contact_type": contact.contact_type,
        "contact_value": contact.contact_value,
    }).execute()

    return {"status": "created", "data": result.data[0]}

@app.delete("/api/trusted-circles/{contact_id}")
async def delete_trusted_circle(contact_id: str, user = Depends(get_current_user)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")
    result = supabase.table("trusted_circles") \
        .delete() \
        .eq("id", contact_id) \
        .eq("user_id", user.id) \
        .execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Contact not found")
    return {"status": "deleted"}

# --- Notify ---

class NotifyRequest(BaseModel):
    contact_ids: list = None
    custom_message: str = None
    stress_score: int = 50

@app.post("/api/notify")
async def send_notification(req: NotifyRequest = None, user = Depends(get_current_user)):
    if not supabase:
        return {"status": "skipped", "reason": "No database"}

    req = req or NotifyRequest()
    query = supabase.table("trusted_circles").select("*").eq("user_id", user.id)
    if req.contact_ids:
        query = query.in_("id", req.contact_ids)
    raw_contacts = query.execute().data or []

    if not raw_contacts:
        return {"status": "no_contacts", "results": []}

    user_profile = supabase.table("users").select("full_name").eq("id", user.id).execute()
    user_name = user_profile.data[0]["full_name"] if user_profile.data else user.email

    results = notify_trusted_circle(
        user_name=user_name,
        stress_score=req.stress_score,
        contacts=raw_contacts,  # notify_trusted_circle sekarang support raw Supabase rows
        custom_message=req.custom_message,
    )
    sent = sum(1 for r in results if r.get("status") == "sent")
    return {"status": "done", "sent": sent, "total": len(results), "results": results}

# --- AI Companion ---

class CompanionRequest(BaseModel):
    messages: list
    stress_score: int = None

@app.post("/api/ai-companion")
async def ai_companion_chat(req: CompanionRequest, user = Depends(get_current_user)):
    result = get_companion_response(req.messages, req.stress_score)
    return result
