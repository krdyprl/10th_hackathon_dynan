import os
import shutil
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from app.kinematics import calculate_kinematics
from app.ai_groq import process_groq_pipeline

app = FastAPI()

@app.post("/api/analyze")
async def analyze_journal(
    file: UploadFile = File(...),
    strokes_json: str = Form(...),
    sleep_hours: float = Form(...),
    erase_count: int = Form(...),
    duration_seconds: int = Form(...),
    exercise_status: str = Form(...)
):
    # Buat direktori tmp jika belum ada
    os.makedirs("/tmp", exist_ok=True)
    temp_file_path = f"/tmp/{file.filename}"

    # 1. Simpan file PNG secara lokal sementara
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save temp file: {str(e)}")

    try:
        # 2. Parsing Stroke JSON
        strokes = json.loads(strokes_json)

        # 3. Hitung Kinematika
        kinematics = calculate_kinematics(strokes, erase_count, duration_seconds)

        # 4. Jalankan Pipeline AI Groq (OCR & LLM)
        analysis_result = process_groq_pipeline(temp_file_path, kinematics, sleep_hours, exercise_status)

        # Gabungkan hasil untuk respons
        response_data = {
            "kinematics": kinematics,
            **analysis_result
        }
        return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis pipeline failed: {str(e)}")

    finally:
        # 5. PRIVACY BY DESIGN: Hapus file PNG sementara secara permanen
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
