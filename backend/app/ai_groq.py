import os
import json
import base64
from dotenv import load_dotenv
from groq import Groq

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

groq_api_key = os.getenv("GROQ_API_KEY", "")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

def encode_image(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def process_groq_pipeline(image_path: str, kinematics: dict, sleep_hours: float, exercise_status: str) -> dict:
    if not groq_client:
        raise ValueError("GROQ_API_KEY is not configured in env variables")

    # 1. TAHAP 1: VISION OCR
    base64_image = encode_image(image_path)
    ocr_response = groq_client.chat.completions.create(
        model="llama-3.2-11b-vision-preview",
        messages=[
            {
                "role": "system",
                "content": "Kamu adalah mesin OCR khusus tulisan tangan dalam Bahasa Indonesia dan Bahasa Inggris. Tugasmu adalah membaca gambar tulisan tangan yang diberikan dan mentranskripsikannya menjadi teks biasa secara akurat tanpa komentar."
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Transkripsikan gambar tulisan tangan ini:"},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                ]
            }
        ]
    )
    ocr_text = ocr_response.choices[0].message.content.strip()

    # 2. TAHAP 2: ANALISIS REFLEKSI LLM
    prompt_user = f"""
    Data Pengguna:
    - Teks Jurnal (OCR): "{ocr_text}"
    - Log Jam Tidur: {sleep_hours} jam
    - Log Olahraga: {exercise_status}

    Data Metrik Kinematik Tulisan Tangan:
    - Jumlah Stroke: {kinematics["stroke_count"]}
    - Jumlah Hapus: {kinematics["erase_count"]}
    - Durasi Menulis: {kinematics["duration_seconds"]} detik
    - Rata-rata Kecepatan: {kinematics["average_velocity"]} px/ms
    - Rata-rata Akselerasi: {kinematics["average_acceleration"]}
    - Jerk Score (Tremor): {kinematics["jerk_score"]}
    - Angkatan Pena (Pen Lifts): {kinematics["pen_lifts"]}
    """

    analysis_response = groq_client.chat.completions.create(
        model="llama-3.3-70b-specdec",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": """Kamu adalah seorang Psikolog Empatis dan Pakar Grafologi. Analisis data tersebut untuk menentukan kondisi emosional pengguna.
                Kamu WAJIB mengembalikan output dalam format JSON mentah dengan struktur berikut:
                {
                  "sentiment_label": "Anxious" | "Sad" | "Angry" | "Positive" | "Neutral",
                  "sentiment_score": integer (0-100),
                  "handwriting_insights": string (max 3 kalimat, empatis, ramah Gen Z, tanpa diagnosis klinis atau saran obat),
                  "mood_stress_correlation": string (analisis hubungan fisik dan goresan tulisan dengan emosi hari ini),
                  "recommendations": string (latihan pernapasan/meditasi singkat),
                  "stress_score": integer (0-100),
                  "mood_score": integer (0-100),
                  "future_mood_prediction": [int, int, int, int] (skor mood 4 hari ke depan)
                }"""
            },
            {
                "role": "user",
                "content": prompt_user
            }
        ]
    )

    raw_json = analysis_response.choices[0].message.content
    analysis_result = json.loads(raw_json)
    analysis_result["ocr_text"] = ocr_text

    return analysis_result
