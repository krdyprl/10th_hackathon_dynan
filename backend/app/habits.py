from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Form
from app.database import supabase
from app.auth import get_current_user
import os, json

router = APIRouter()

@router.post("/api/habits")
async def save_habits(
    sleep_hours: float = Form(None),
    exercise_status: str = Form(None),
    water_glasses: int = Form(None),
    sleep_note: str = Form(None),
    log_date: str = Form(None),
    user = Depends(get_current_user)
):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")
    try:
        update_data = {
            "user_id": user.id,
            "log_date": log_date or str(date.today()),
        }
        if sleep_hours is not None:
            update_data["sleep_hours"] = sleep_hours
        if exercise_status is not None:
            update_data["exercise_status"] = exercise_status
        if water_glasses is not None:
            update_data["water_glasses"] = water_glasses
        if sleep_note is not None:
            update_data["sleep_note"] = sleep_note

        result = supabase.table("habit_logs").upsert(update_data, on_conflict="user_id,log_date").execute()
        return {"status": "saved", "data": result.data[0] if result.data else {}}
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save habits: {str(e)}")


@router.get("/api/habits")
async def get_habits(log_date: str = None, user = Depends(get_current_user)):
    if not supabase:
        return {"habits": None}
    target_date = log_date or str(date.today())
    result = supabase.table("habit_logs") \
        .select("*") \
        .eq("user_id", user.id) \
        .eq("log_date", target_date) \
        .limit(1) \
        .execute()
    return {"habits": result.data[0] if result.data else None}


@router.get("/api/habits/streak")
async def get_streak(user = Depends(get_current_user)):
    if not supabase:
        return {"streak": 0, "logs": [], "sleep_history": []}

    result = supabase.table("habit_logs") \
        .select("log_date, sleep_hours, exercise_status, water_glasses, sleep_note") \
        .eq("user_id", user.id) \
        .order("log_date", desc=True) \
        .limit(90) \
        .execute()

    rows = result.data or []
    dates = sorted(set(r["log_date"] for r in rows), reverse=True)

    # Hitung streak
    streak = 0
    today = date.today()
    for i, d in enumerate(dates):
        expected = today - timedelta(days=i)
        if d == str(expected):
            streak += 1
        else:
            break

    # History 7 hari terakhir untuk diagram
    sleep_history = []
    for i in range(6, -1, -1):
        target = str(today - timedelta(days=i))
        row = next((r for r in rows if r["log_date"] == target), None)
        sleep_history.append({
            "date": target,
            "sleep_hours": row["sleep_hours"] if row else None,
            "exercise_status": row["exercise_status"] if row else None,
            "water_glasses": row["water_glasses"] if row else None,
            "sleep_note": row.get("sleep_note", "") if row else "",
        })

    return {"streak": streak, "logs": dates[:7], "sleep_history": sleep_history}


@router.post("/api/habits/ai-summary")
async def get_habits_ai_summary(user = Depends(get_current_user)):
    """Generate AI summary dan saran dari data kebiasaan 7 hari terakhir"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not connected")

    result = supabase.table("habit_logs") \
        .select("log_date, sleep_hours, exercise_status, water_glasses, sleep_note") \
        .eq("user_id", user.id) \
        .order("log_date", desc=True) \
        .limit(7) \
        .execute()

    rows = result.data or []
    if not rows:
        return {"summary": "Belum ada data kebiasaan. Mulai log hari ini!", "advice": []}

    # Format data untuk prompt
    today = date.today()
    data_lines = []
    for r in rows:
        d = r["log_date"]
        sleep = r.get("sleep_hours") or "-"
        ex = r.get("exercise_status") or "tidak ada data"
        water = r.get("water_glasses") or 0
        note = r.get("sleep_note") or ""
        data_lines.append(f"- {d}: tidur {sleep}j, olahraga: {ex}, minum air: {water} gelas{', catatan: '+note if note else ''}")

    data_str = "\n".join(data_lines)

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return {"summary": "AI tidak tersedia (GROQ_API_KEY belum dikonfigurasi).", "advice": []}

    try:
        from groq import Groq
        client = Groq(api_key=api_key)

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": """Kamu adalah konselor kesehatan yang ramah dan suportif untuk remaja Gen Z Indonesia.
Analisis data kebiasaan sehat dan berikan insight personal. Bahasa: Indonesia santai, hangat, tidak menghakimi.

Kembalikan JSON:
{
  "summary": "2-3 kalimat ringkasan pola kebiasaan minggu ini secara keseluruhan",
  "sleep_insight": "1-2 kalimat tentang pola tidur",
  "exercise_insight": "1-2 kalimat tentang pola olahraga",
  "water_insight": "1-2 kalimat tentang hidrasi",
  "advice": ["saran 1 yang spesifik dan actionable", "saran 2", "saran 3"],
  "mood_prediction": "1 kalimat prediksi mood minggu depan berdasarkan tren kebiasaan"
}"""
                },
                {
                    "role": "user",
                    "content": f"Data kebiasaan 7 hari terakhirku:\n{data_str}\n\nBerikan analisis dan saran personalnya."
                }
            ],
            temperature=0.7,
            max_tokens=600,
        )

        raw = completion.choices[0].message.content
        result_json = json.loads(raw)
        return result_json
    except Exception as e:
        import traceback; traceback.print_exc()
        return {"summary": f"Gagal generate summary: {str(e)}", "advice": []}
