# Rencana Implementasi Penyelarasan InkTrace AI (Kinematika Backend & Groq API)

> **Untuk Pekerja Agen (Agentic Workers):** SUB-SKILL WAJIB: Gunakan `superpowers:subagent-driven-development` (direkomendasikan) atau `superpowers:executing-plans` untuk mengimplementasikan rencana ini tugas demi tugas. Langkah-langkah menggunakan sintaks kotak centang (`- [ ]`) untuk pelacakan.

**Tujuan:** Mengintegrasikan kalkulator kinematika (kecepatan, akselerasi, jerk) di backend FastAPI, menghubungkan Groq API untuk OCR (Llama 3.2 Vision) & analisis emosi/sentimen (Llama 3.3 Text), serta menyimpan hasilnya di database Supabase sesuai dengan design tokens yang diselaraskan.

**Arsitektur:** Mengirim array goresan (X, Y, t) dan canvas PNG dari React ke FastAPI. FastAPI menghitung metrik kinematik secara matematis menggunakan rumus fisika, memanggil Groq Vision untuk OCR, memanggil Groq Text untuk analisis sentimen & emosi terstruktur JSON, lalu menyimpan seluruh metrik & analisis tersebut ke Supabase PostgreSQL.

**Teknologi Utama:** FastAPI (Python), Supabase SDK, Groq SDK, `react-sketch-canvas`, Tailwind CSS, Recharts.

## Batasan Global
- **Model Groq OCR:** `llama-3.2-11b-vision-preview` untuk ekstraksi teks gambar kanvas.
- **Model Groq Analisis:** `llama-3.3-70b-specdec` untuk interpretasi emosi/sentimen JSON terstruktur.
- **Privasi Data:** Hapus file PNG sementara dari folder `/tmp` backend segera setelah analisis selesai di blok `finally`.
- **Bahasa Output Analisis:** Bahasa Indonesia yang empatis, suportif, ramah Gen Z, dan bebas diagnosis klinis.

---

### Tugas 1: Pembaruan Skema Database Supabase

Tugas ini memperbarui skema database di database PostgreSQL Supabase dengan tabel yang mendukung penyimpanan data metrik kinematik menulis dan analisis emosi dari Groq.

**File:**
- Modify: `supabase/migrations/20260726_update_schema.sql` (File baru/migrasi baru)

**Antarmuka (Interfaces):**
- Mengonsumsi: Skema profil pengguna yang sudah ada di tabel `users`.
- Menghasilkan: Tabel `journals`, `kinematic_features`, dan `llm_analyses` dengan relasi kunci asing yang tepat.

- [ ] **Langkah 1: Tulis skrip SQL untuk migrasi database**

Tulis kode SQL berikut di `supabase/migrations/20260726_update_schema.sql`:
```sql
-- Up Migration
CREATE TABLE IF NOT EXISTS public.journals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT null,
  no_of_hours_sleep numeric NOT null,
  exercise_status text NOT null,
  ocr_text text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT null
);

CREATE TABLE IF NOT EXISTS public.kinematic_features (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id uuid REFERENCES public.journals(id) ON DELETE CASCADE NOT null,
  stroke_count integer NOT null,
  erase_count integer NOT null,
  duration_seconds integer NOT null,
  average_velocity numeric NOT null,
  average_acceleration numeric NOT null,
  jerk_score numeric NOT null,
  pen_lifts integer NOT null,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT null
);

CREATE TABLE IF NOT EXISTS public.llm_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id uuid REFERENCES public.journals(id) ON DELETE CASCADE NOT null,
  sentiment_label text NOT null,
  sentiment_score integer NOT null,
  handwriting_insights text NOT null,
  mood_stress_correlation text NOT null,
  recommendations text NOT null,
  stress_score integer NOT null,
  mood_score integer NOT null,
  future_mood_prediction jsonb NOT null,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT null
);

ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kinematic_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_analyses ENABLE ROW LEVEL SECURITY;
```

- [ ] **Langkah 2: Verifikasi migrasi SQL**

Jalankan perintah pengujian SQL secara manual pada konsol Supabase Anda untuk memastikan tidak ada kesalahan sintaks PostgreSQL.

- [ ] **Langkah 3: Commit perubahan**

```bash
git add supabase/migrations/20260726_update_schema.sql
git commit -m "database: membuat migrasi sql untuk menyimpan fitur kinematik dan analisis llm"
```

---

### Tugas 2: Kalkulator Kinematika Python di FastAPI

Tugas ini membuat modul kalkulator kinematika di backend Python untuk menghitung rata-rata kecepatan, akselerasi, jerk score (tremor), dan angkatan pena dari koordinat goresan mentah.

**File:**
- Create: `backend/app/kinematics.py`
- Create: `backend/tests/test_kinematics.py`

**Antarmuka:**
- Mengonsumsi: Data goresan dari frontend berupa list of dict `strokes`: `[{"points": [{"x": float, "y": float, "time": int}]}]`.
- Menghasilkan: Dict berisi metrik ringkasan:
  ```python
  {
      "stroke_count": int,
      "erase_count": int,
      "duration_seconds": int,
      "average_velocity": float,
      "average_acceleration": float,
      "jerk_score": float,
      "pen_lifts": int
  }
  ```

- [ ] **Langkah 1: Tulis unit test untuk kalkulator kinematika**

Tulis kode pengujian berikut di `backend/tests/test_kinematics.py`:
```python
import pytest
from app.kinematics import calculate_kinematics

def test_calculate_kinematics_valid_data():
    # Simulasi goresan satu garis lurus dengan peningkatan waktu stabil
    mock_strokes = [
        {
            "points": [
                {"x": 10.0, "y": 10.0, "time": 0},
                {"x": 20.0, "y": 10.0, "time": 100},
                {"x": 30.0, "y": 10.0, "time": 200}
            ]
        }
    ]
    erase_count = 0
    duration_seconds = 2
    
    result = calculate_kinematics(mock_strokes, erase_count, duration_seconds)
    
    assert result["stroke_count"] == 1
    assert result["erase_count"] == 0
    assert result["duration_seconds"] == 2
    assert result["average_velocity"] > 0
    assert result["average_acceleration"] == 0.0 # Kecepatan konstan
    assert result["jerk_score"] == 0.0 # Tidak ada tremor
    assert result["pen_lifts"] == 0
```

- [ ] **Langkah 2: Jalankan tes untuk memverifikasi kegagalan (TDD)**

Jalankan perintah:
```bash
pytest backend/tests/test_kinematics.py
```
Diharapkan: GAGAL karena modul `app.kinematics` belum dibuat.

- [ ] **Langkah 3: Tulis implementasi kalkulator kinematika**

Tulis kode berikut di `backend/app/kinematics.py`:
```python
import math

def calculate_kinematics(strokes, erase_count: int, duration_seconds: int) -> dict:
    if not strokes:
        return {
            "stroke_count": 0,
            "erase_count": erase_count,
            "duration_seconds": duration_seconds,
            "average_velocity": 0.0,
            "average_acceleration": 0.0,
            "jerk_score": 0.0,
            "pen_lifts": 0
        }
    
    velocities = []
    accelerations = []
    jerks = []
    
    for stroke in strokes:
        points = stroke.get("points", [])
        if len(points) < 2:
            continue
            
        for i in range(1, len(points)):
            p1 = points[i-1]
            p2 = points[i]
            
            dt = (p2["time"] - p1["time"]) / 1000.0  # Konversi ke detik
            if dt <= 0:
                continue
                
            dist = math.sqrt((p2["x"] - p1["x"])**2 + (p2["y"] - p1["y"])**2)
            v = dist / dt
            velocities.append(v)
            
            # Akselerasi
            if i > 1 and len(velocities) >= 2:
                dv = velocities[-1] - velocities[-2]
                a = dv / dt
                accelerations.append(a)
                
                # Jerk
                if len(accelerations) >= 2:
                    da = accelerations[-1] - accelerations[-2]
                    j = da / dt
                    jerks.append(j)

    avg_v = sum(velocities) / len(velocities) if velocities else 0.0
    avg_a = sum(map(abs, accelerations)) / len(accelerations) if accelerations else 0.0
    avg_j = sum(map(abs, jerks)) / len(jerks) if jerks else 0.0
    pen_lifts = max(0, len(strokes) - 1)
    
    return {
        "stroke_count": len(strokes),
        "erase_count": erase_count,
        "duration_seconds": duration_seconds,
        "average_velocity": round(avg_v, 4),
        "average_acceleration": round(avg_a, 4),
        "jerk_score": round(avg_j, 4),
        "pen_lifts": pen_lifts
    }
```

- [ ] **Langkah 4: Jalankan tes untuk memastikan kelulusan**

Jalankan perintah:
```bash
pytest backend/tests/test_kinematics.py
```
Diharapkan: LULUS (PASS).

- [ ] **Langkah 5: Commit perubahan**

```bash
git add backend/tests/test_kinematics.py backend/app/kinematics.py
git commit -m "feat: membuat modul kalkulator kinematika di backend python"
```

---

### Tugas 3: Integrasi API Groq (OCR & LLM Analisis)

Tugas ini membuat modul AI di backend FastAPI untuk mengintegrasikan Groq SDK guna melakukan OCR menggunakan Llama 3.2 Vision dan analisis mental emosional menggunakan Llama 3.3 Text.

**File:**
- Create: `backend/app/ai_groq.py`
- Create: `backend/tests/test_ai_groq.py`

**Antarmuka:**
- Mengonsumsi: File gambar PNG kanvas, metrik kinematik hasil perhitungan, log jam tidur & olahraga.
- Menghasilkan: Dict terstruktur yang siap dimasukkan ke database:
  ```python
  {
      "ocr_text": string,
      "sentiment_label": string,
      "sentiment_score": int,
      "handwriting_insights": string,
      "mood_stress_correlation": string,
      "recommendations": string,
      "stress_score": int,
      "mood_score": int,
      "future_mood_prediction": list[int]
  }
  ```

- [ ] **Langkah 1: Tulis unit test mock untuk Groq API**

Tulis kode berikut di `backend/tests/test_ai_groq.py` menggunakan unittest mock:
```python
import pytest
from unittest.mock import patch, MagicMock
from app.ai_groq import process_groq_pipeline

@patch("app.ai_groq.groq_client")
def test_process_groq_pipeline(mock_groq):
    # Mock respons Groq Vision OCR
    mock_ocr_resp = MagicMock()
    mock_ocr_resp.choices = [MagicMock(message=MagicMock(content="Aku sangat cemas besok ujian"))]
    
    # Mock respons Groq Text Analysis JSON
    mock_analysis_resp = MagicMock()
    mock_analysis_resp.choices = [MagicMock(message=MagicMock(content="""{
      "sentiment_label": "Anxious",
      "sentiment_score": 80,
      "handwriting_insights": "Tulisan menunjukkan kecemasan akademis.",
      "mood_stress_correlation": "Kurang tidur memicu stres.",
      "recommendations": "Tarik napas dalam 5 detik.",
      "stress_score": 75,
      "mood_score": 40,
      "future_mood_prediction": [45, 50, 60, 70]
    }"""))]
    
    mock_groq.chat.completions.create.side_effect = [mock_ocr_resp, mock_analysis_resp]
    
    kinematics = {
        "stroke_count": 10,
        "erase_count": 2,
        "duration_seconds": 90,
        "average_velocity": 12.5,
        "average_acceleration": 2.1,
        "jerk_score": 8.4,
        "pen_lifts": 4
    }
    
    result = process_groq_pipeline("path/to/mock.png", kinematics, 6.0, "no")
    
    assert result["ocr_text"] == "Aku sangat cemas besok ujian"
    assert result["sentiment_label"] == "Anxious"
    assert result["stress_score"] == 75
```

- [ ] **Langkah 2: Jalankan tes untuk memverifikasi kegagalan (TDD)**

Jalankan perintah:
```bash
pytest backend/tests/test_ai_groq.py
```
Diharapkan: GAGAL karena modul `app.ai_groq` belum dibuat.

- [ ] **Langkah 3: Tulis implementasi integrasi Groq SDK**

Tulis kode berikut di `backend/app/ai_groq.py` (pastikan mengimpor Groq dan mengonfigurasi API Key):
```python
import os
import json
import base64
from groq import Groq

# Inisialisasi client Groq menggunakan API key dari env
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
```

- [ ] **Langkah 4: Jalankan tes untuk memverifikasi kelulusan**

Jalankan perintah:
```bash
pytest backend/tests/test_ai_groq.py
```
Diharapkan: LULUS (PASS).

- [ ] **Langkah 5: Commit perubahan**

```bash
git add backend/tests/test_ai_groq.py backend/app/ai_groq.py
git commit -m "feat: mengintegrasikan pipeline ocr dan analisis llm dengan groq sdk"
```

---

### Tugas 4: Rute API `/api/analyze` di FastAPI & Pembersihan File

Tugas ini membuat rute HTTP POST `/api/analyze` di FastAPI yang menerima unggahan file gambar canvas dan metadata stroke JSON, menjalankan kalkulator kinematika, memanggil pipeline Groq, lalu membersihkan file PNG dari direktori penyimpanan lokal `/tmp`.

**File:**
- Create: `backend/app/main.py` (atau modifikasi router API utama)
- Create: `backend/tests/test_main.py`

**Antarmuka:**
- Mengonsumsi: Multi-part form request berisi:
  - `file`: UploadFile (Gambar PNG canvas)
  - `strokes_json`: String (Format string JSON dari array goresan)
  - `sleep_hours`: Float
  - `erase_count`: Int
  - `duration_seconds`: Int
  - `exercise_status`: String
- Menghasilkan: Objek JSON hasil analisis lengkap yang siap disimpan ke database.

- [ ] **Langkah 1: Tulis unit test untuk HTTP API Endpoint**

Tulis kode berikut di `backend/tests/test_main.py` menggunakan FastAPI TestClient:
```python
import pytest
import io
import json
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)

@patch("app.main.calculate_kinematics")
@patch("app.main.process_groq_pipeline")
def test_analyze_endpoint(mock_groq, mock_kinematic):
    mock_kinematic.return_value = {"stroke_count": 1}
    mock_groq.return_value = {
        "ocr_text": "Aku lelah",
        "sentiment_label": "Sad",
        "stress_score": 60,
        "mood_score": 40
    }
    
    # Mock canvas file upload
    file_data = {"file": ("canvas.png", io.BytesIO(b"dummyimagebytes"), "image/png")}
    
    data = {
        "strokes_json": json.dumps([{"points": []}]),
        "sleep_hours": 7.0,
        "erase_count": 0,
        "duration_seconds": 45,
        "exercise_status": "yes"
    }
    
    response = client.post("/api/analyze", files=file_data, data=data)
    
    assert response.status_code == 200
    assert response.json()["sentiment_label"] == "Sad"
    assert response.json()["ocr_text"] == "Aku lelah"
```

- [ ] **Langkah 2: Jalankan tes untuk memverifikasi kegagalan (TDD)**

Jalankan perintah:
```bash
pytest backend/tests/test_main.py
```
Diharapkan: GAGAL karena file `app/main.py` belum mengekspos endpoint `/api/analyze`.

- [ ] **Langkah 3: Tulis implementasi Endpoint FastAPI & Pembersihan File `/tmp`**

Tulis kode berikut di `backend/app/main.py` (sesuaikan port dan routing FastAPI yang ada):
```python
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
```

- [ ] **Langkah 4: Jalankan tes untuk memastikan kelulusan**

Jalankan perintah:
```bash
pytest backend/tests/test_main.py
```
Diharapkan: LULUS (PASS).

- [ ] **Langkah 5: Commit perubahan**

```bash
git add backend/tests/test_main.py backend/app/main.py
git commit -m "feat: membuat endpoint api/analyze dan memastikan penghancuran file png sementara"
```

---

### Tugas 5: Penyelarasan Frontend Canvas & Radar Chart (React)

Tugas ini memperbarui komponen canvas di frontend untuk menangkap metadata koordinat goresan dengan stempel waktu, mengirimkannya ke backend FastAPI, dan memvisualisasikan data kinematik pada Radar Chart dan tren mood pada Line Chart sesuai design token.

**File:**
- Modify: `frontend/src/components/JournalCanvas.jsx`
- Modify: `frontend/src/components/HandwritingRadarChart.jsx`
- Modify: `frontend/src/components/MoodTrendChart.jsx`

**Antarmuka:**
- Mengonsumsi: Data API `/api/analyze` yang mengembalikan objek `kinematics` dan `llm_analyses` dari server.
- Menghasilkan:
  - Canvas goresan dengan stempel waktu real-time.
  - Radar Chart interaktif menggunakan Recharts dengan token warna ungu `#7a3dff`.
  - Line Chart dengan tren mood menggunakan token warna biru `#3b89ff`.

- [ ] **Langkah 1: Menangkap koordinat strokes di React Canvas**

Modifikasi file `frontend/src/components/JournalCanvas.jsx` untuk merekam `time` relatif milidetik pada setiap titik goresan:
```javascript
// Tambahkan event handler untuk menangkap timestamp
const handleStrokeStart = (e) => {
  const startTime = Date.now();
  // Menyimpan waktu awal stroke
};

// Pastikan react-sketch-canvas menyimpan array goresan dengan properti time relatif
// Contoh format output goresan yang direkam:
// { points: [{ x: 10, y: 20, time: 245 }] } // time adalah delta ms dari awal goresan dimulai
```

- [ ] **Langkah 2: Integrasi Warna Aksen pada Recharts Radar Chart**

Perbarui styling Recharts Radar Chart di `frontend/src/components/HandwritingRadarChart.jsx` menggunakan Accent Purple `#7a3dff` dari design system:
```jsx
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function HandwritingRadarChart({ data }) {
  // data berisi metrik kinematik ternormalisasi (0-100)
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#d8d8d8" />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="Kinematika Tulisan"
          dataKey="value"
          stroke="#7a3dff" // Accent Purple
          fill="#7a3dff"
          fillOpacity={0.2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Langkah 3: Integrasi Warna Aksen pada Recharts Line Chart**

Perbarui styling Recharts Line Chart di `frontend/src/components/MoodTrendChart.jsx` menggunakan Accent Blue `#3b89ff` dari design system:
```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MoodTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d8d8d8" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="mood"
          stroke="#3b89ff" // Accent Blue
          strokeWidth={2.5}
          activeDot={{ r: 6, fill: "#080808" }} // Ink Black Active Dot
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

- [ ] **Langkah 4: Jalankan aplikasi lokal untuk memverifikasi visualisasi**

Jalankan perintah frontend development server:
```bash
npm run dev
```
Diharapkan: Halaman dashboard memuat grafis radar dan line chart tanpa error CSS atau javascript crash.

- [ ] **Langkah 5: Commit perubahan**

```bash
git add frontend/src/components/JournalCanvas.jsx frontend/src/components/HandwritingRadarChart.jsx frontend/src/components/MoodTrendChart.jsx
git commit -m "style: menyelaraskan warna aksen grafik recharts dengan token design system"
```
