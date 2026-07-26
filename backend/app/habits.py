from datetime import date, timedelta
from fastapi import APIRouter, Depends
from app.database import supabase
from app.auth import get_current_user

router = APIRouter()

@router.post("/api/habits")
async def save_habits(
    sleep_hours: float,
    exercise_status: str,
    log_date: str = None,
    user = Depends(get_current_user)
):
    result = supabase.table("habit_logs").upsert({
        "user_id": user.id,
        "log_date": log_date or str(date.today()),
        "sleep_hours": sleep_hours,
        "exercise_status": exercise_status,
    }, on_conflict="user_id,log_date").execute()
    return {"status": "saved", "data": result.data[0]}


@router.get("/api/habits")
async def get_habits(log_date: str = None, user = Depends(get_current_user)):
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
    result = supabase.table("habit_logs") \
        .select("log_date") \
        .eq("user_id", user.id) \
        .order("log_date", desc=True) \
        .limit(90) \
        .execute()

    dates = sorted(set(r["log_date"] for r in (result.data or [])), reverse=True)
    streak = 0
    today = date.today()
    for i, d in enumerate(dates):
        expected = today - timedelta(days=i)
        if d == str(expected):
            streak += 1
        else:
            break

    return {"streak": streak, "logs": dates[:7]}
