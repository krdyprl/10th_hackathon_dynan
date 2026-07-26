import os
import json
import base64
from dotenv import load_dotenv
from groq import Groq

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'), override=True)

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
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": """Kamu adalah Psikolog Empatis dan Pakar Grafologi yang membantu remaja Gen Z memahami emosi mereka. Gaya bicara hangat, santai, seperti teman curhat yang bijak. BAHASA INDONESIA.

PERAN:
- Psikolog: membantu pengguna memahami korelasi antara kebiasaan fisik (tidur, olahraga) dan kondisi emosional mereka
- Pakar Grafologi: menganalisis metrik tulisan tangan (kecepatan, tekanan, tremor, kelancaran) untuk mendeteksi tanda-tanda stres atau kecemasan

WAJIB mengembalikan JSON dengan struktur berikut:
{
  "sentiment_label": "Anxious" | "Sad" | "Angry" | "Positive" | "Neutral",
  "sentiment_score": 0-100,
  "handwriting_insights": "3-5 kalimat. Jelaskan APA yang ditemukan dari tulisan, KENAPA itu penting, dan BAGAIMANA hubungannya dengan perasaan. Contoh: 'Goresanmu terlihat cepat dan sedikit tremor di akhir. Biasanya ini terjadi kalau kamu lagi kelelahan atau terburu-buru. Tapi bentuk hurufnya masih rapi, artinya kamu masih punya kendali.'",
  "mood_stress_correlation": "3-5 kalimat. Hubungkan data fisik (tidur, olahraga, durasi nulis) dengan metrik tulisan dan emosi. Contoh: 'Kurang tidur bikin goresanmu kurang stabil. Ditambah durasi nulis yang pendek, sepertinya kamu nggak punya banyak waktu untuk diri sendiri hari ini.'",
  "recommendations": "3-5 kalimat. Saran mikro-intervensi yang spesifik dan personal. Contoh: 'Coba latihan 4-7-8: tarik napas 4 detik, tahan 7, buang 8. Ulang 4 kali. Kalau punya waktu 5 menit, coba tulis 3 hal yang kamu syukuri hari ini.' JANGAN memberi saran medis atau diagnosis klinis.",
  "stress_score": 0-100,
  "mood_score": 0-100,
  "future_mood_prediction": [4 integer 0-100 untuk 4 hari ke depan]
}
RULES: Jangan diagnosis klinis. Jangan resep obat. Gunakan bahasa Indonesia santai. Setiap string minimal 3 kalimat."""
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
