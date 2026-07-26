import os
import shutil
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.kinematics import calculate_kinematics
from app.ai_groq import process_groq_pipeline
from app.database import supabase
from app.auth import get_current_user
from app.notifications import notify_trusted_circle
from app.helplines import find_nearby_helplines
from app.ai_companion import get_companion_response

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

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
    os.makedirs("/tmp", exist_ok=True)
    temp_file_path = f"/tmp/{file.filename}"

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save temp file: {str(e)}")

    try:
        strokes = json.loads(strokes_json)
        kinematics = calculate_kinematics(strokes, erase_count, duration_seconds)
        analysis_result = process_groq_pipeline(temp_file_path, kinematics, sleep_hours, exercise_status)

        response_data = {
            "kinematics": kinematics,
            **analysis_result
        }

        if supabase:
            journal = supabase.table("journals").insert({
                "user_id": user.id,
                "no_of_hours_sleep": sleep_hours,
                "exercise_status": exercise_status,
                "ocr_text": analysis_result.get("ocr_text", ""),
            }).execute()

            journal_id = journal.data[0]["id"]

            supabase.table("kinematic_features").insert({
                "journal_id": journal_id,
                "stroke_count": kinematics["stroke_count"],
                "erase_count": kinematics["erase_count"],
                "duration_seconds": kinematics["duration_seconds"],
                "average_velocity": kinematics["average_velocity"],
                "average_acceleration": kinematics["average_acceleration"],
                "jerk_score": kinematics["jerk_score"],
                "pen_lifts": kinematics["pen_lifts"],
            }).execute()

            supabase.table("llm_analyses").insert({
                "journal_id": journal_id,
                "sentiment_label": analysis_result.get("sentiment_label", ""),
                "sentiment_score": analysis_result.get("sentiment_score", 0),
                "handwriting_insights": analysis_result.get("handwriting_insights", ""),
                "mood_stress_correlation": analysis_result.get("mood_stress_correlation", ""),
                "recommendations": analysis_result.get("recommendations", ""),
                "stress_score": analysis_result.get("stress_score", 0),
                "mood_score": analysis_result.get("mood_score", 0),
                "future_mood_prediction": json.dumps(analysis_result.get("future_mood_prediction", [])),
            }).execute()

        stress = analysis_result.get("stress_score", 0)
        if stress > 70:
            user_profile = supabase.table("users").select("full_name").eq("id", user.id).execute()
            user_name = user_profile.data[0]["full_name"] if user_profile.data else user.email
            tc = supabase.table("trusted_circles").select("*").eq("user_id", user.id).execute()
            contacts = [{"name": r["contact_name"], "type": r["contact_type"], "value": r["contact_value"]} for r in tc.data] if tc.data else []
            if contacts:
                notify_trusted_circle(user_name=user_name, stress_score=stress, contacts=contacts)

        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline failed: {str(e)}")

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

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

    journal_result = supabase.table("llm_analyses") \
        .select("journals!inner(created_at, user_id), sentiment_label, sentiment_score, stress_score, mood_score") \
        .gte("journals.created_at", f"now() - interval '{range} days'") \
        .eq("journals.user_id", user.id) \
        .order("journals.created_at", desc=True) \
        .limit(100) \
        .execute()

    mood_result = supabase.table("mood_logs") \
        .select("*") \
        .eq("user_id", user.id) \
        .gte("created_at", f"now() - interval '{range} days'") \
        .order("created_at", desc=True) \
        .limit(100) \
        .execute()

    entries = []
    for row in journal_result.data:
        entries.append({
            "type": "journal",
            "date": row["journals"]["created_at"],
            "sentiment_label": row["sentiment_label"],
            "sentiment_score": row["sentiment_score"],
            "stress_score": row["stress_score"],
            "mood_score": row["mood_score"],
        })
    for row in mood_result.data:
        mood_desc = {1: "Sangat Buruk", 2: "Buruk", 3: "Biasa", 4: "Baik", 5: "Sangat Baik"}
        entries.append({
            "type": "mood",
            "date": row["created_at"],
            "sentiment_label": mood_desc.get(row["mood_score"], "Biasa"),
            "sentiment_score": row["mood_score"] * 20,
            "mood_score": row["mood_score"] * 20,
            "stress_score": None,
            "note": row.get("note", ""),
        })

    entries.sort(key=lambda e: e["date"])
    return {"entries": entries}

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

@app.post("/api/notify")
async def send_notification(contact_ids: list[str] = None, user = Depends(get_current_user)):
    if not supabase:
        return {"status": "skipped", "reason": "No database"}

    query = supabase.table("trusted_circles").select("*").eq("user_id", user.id)
    if contact_ids:
        query = query.in_("id", contact_ids)
    contacts = query.execute().data

    user_profile = supabase.table("users").select("full_name").eq("id", user.id).execute()
    user_name = user_profile.data[0]["full_name"] if user_profile.data else user.email

    results = notify_trusted_circle(user_name=user_name, stress_score=80, contacts=contacts or [])
    return {"results": results}

# --- AI Companion ---

class CompanionRequest(BaseModel):
    messages: list
    stress_score: int = None

@app.post("/api/ai-companion")
async def ai_companion_chat(req: CompanionRequest, user = Depends(get_current_user)):
    result = get_companion_response(req.messages, req.stress_score)
    return result
