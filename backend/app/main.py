import os
import shutil
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.kinematics import calculate_kinematics
from app.ai_groq import process_groq_pipeline
from app.database import supabase
from app.notifications import notify_trusted_circle

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

async def get_current_user(authorization: str = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        return user.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

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
            contacts = [{"name": "Trusted Circle", "type": "email", "value": user.email}]
            notify_trusted_circle(user_name=user_name, stress_score=stress, contacts=contacts)

        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline failed: {str(e)}")

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.get("/api/history")
async def get_history(range: int = 7, user = Depends(get_current_user)):
    if not supabase:
        return {"entries": []}

    result = supabase.table("llm_analyses") \
        .select("journals!inner(created_at), sentiment_label, sentiment_score, stress_score, mood_score") \
        .gte("journals.created_at", f"now() - interval '{range} days'") \
        .eq("journals.user_id", user.id) \
        .order("journals.created_at", desc=True) \
        .limit(100) \
        .execute()

    entries = []
    for row in result.data:
        entries.append({
            "date": row["journals"]["created_at"],
            "sentiment_label": row["sentiment_label"],
            "sentiment_score": row["sentiment_score"],
            "stress_score": row["stress_score"],
            "mood_score": row["mood_score"],
        })

    entries.reverse()
    return {"entries": entries}
