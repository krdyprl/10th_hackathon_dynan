# Evaluasi & Spesifikasi Desain: Penyelarasan InkTrace AI

## 1. Ringkasan Eksekutif

Dokumen ini menetapkan desain evaluasi dan penyelarasan untuk **InkTrace AI** guna menjembatani kesenjangan antara paper penelitian akademik *"Classification of Depression, Anxiety, and Stress from Handwriting and Drawing with Stacking Models"* dan implementasi berbasis web yang ditentukan dalam `PRD.md`, `DESIGN.md`, dan `inktrace-design-system.md`.

Untuk menghasilkan MVP yang teruji secara ilmiah namun tetap mudah diakses melalui web tanpa memerlukan pelatihan model ML lokal yang rumit atau perangkat keras digitizer kelas atas (seperti Wacom Intuos), InkTrace AI mengadopsi **Pendekatan Hibrida Pragmatis**. Pendekatan ini memproses koordinat goresan tulisan tangan digital secara dinamis di backend Python, menghitung fitur kinematik fisik (kecepatan, akselerasi, jerk), mengekstrak teks melalui Groq OCR, dan menganalisis indikator kesehatan mental menggunakan Large Language Models (LLM) dari Groq.

---

## 2. Metodologi & Penyelarasan Ilmiah

Paper penelitian referensi menetapkan bahwa kondisi emosional (Depresi, Kecemasan, dan Stres) mengekspresikan karakteristik kinematik dan spasial yang berbeda dalam tulisan tangan. Dalam input digital, hal ini diterjemahkan menjadi variasi dalam kecepatan, akselerasi, angkatan pena, dan mikro-tremor (jerk).

Karena peramban web umum dan layar sentuh tidak dapat menangkap tekanan pena (*pressure*) atau waktu melayang di udara (*airtime*) secara konsisten, InkTrace AI mengadaptasi metodologi penelitian untuk menangkap fitur temporal-spasial fidelitas tinggi langsung dari input kanvas digital:

| Metrik | Sumber Riset | Strategi Implementasi Web |
| :--- | :--- | :--- |
| **Writing Velocity** | Kecepatan coretan | Dihitung secara dinamis melalui delta jarak koordinat dibagi delta waktu ($\Delta d / \Delta t$). |
| **Acceleration** | Akselerasi penulisan | Diturunkan sebagai turunan pertama kecepatan terhadap delta waktu ($\Delta v / \Delta t$). |
| **Jerk Score** | Tremor / kegemeteran tangan | Diturunkan sebagai turunan kedua kecepatan terhadap delta waktu ($\Delta a / \Delta t$). Skor jerk yang tinggi berkorelasi dengan kecemasan/stres. |
| **Pen Lifts** | Jumlah angkatan pen | Dilacak melalui transisi antara array goresan terpisah di kanvas React. |
| **Analisis Semantik & Sentimen** | Skor kuesioner DASS | Dianalisis secara semantik oleh LLM dari teks hasil OCR, menggabungkan status kinematik fisik dengan konten emosional tulisan. |

---

## 3. Arsitektur Sistem & Aliran Data

```
[ BROWSER PENGGUNA (React - Netlify) ]
       │
       ├─► (1) Supabase Auth (Daftar / Masuk)
       ├─► (2) Mengirim Canvas PNG + Stroke JSON + Log Fisik (Tidur/Olahraga)
       ▼
[ BACKEND API (FastAPI - Railway/Render) ]
       │
       ├─► (3) Kalkulator Kinematik: Menghitung rata-rata Kecepatan, Akselerasi, Skor Jerk, Angkatan Pena
       ├─► (4) Groq Vision API (llama-3.2-11b-vision-preview): OCR gambar PNG menjadi Teks
       ├─► (5) Groq Text API (llama-3.3-70b-specdec): Analisis korelasi sentimen, perilaku, & fisiologis
       ▼
[ DATABASE & LAYANAN (Supabase) ]
       ├─► (6) Menyimpan entri Jurnal, nilai Kinematik, dan output JSON analisis LLM
       └─► (7) Memicu notifikasi otomatis Resend (Email) / OpenWA (WhatsApp) jika indikator krisis terpenuhi
```

### 3.1 Perhitungan Fitur Kinematik
Backend menerima array goresan mentah dari `react-sketch-canvas`. Setiap goresan terdiri dari titik-titik $P_i = (x_i, y_i, t_i)$.
*   **Jarak antar titik:** $d_i = \sqrt{(x_i - x_{i-1})^2 + (y_i - y_{i-1})^2}$
*   **Selisih waktu:** $\Delta t_i = t_i - t_{i-1}$
*   **Kecepatan (Velocity):** $v_i = d_i / \Delta t_i$
*   **Akselerasi (Acceleration):** $a_i = (v_i - v_{i-1}) / \Delta t_i$
*   **Jerk:** $j_i = (a_i - a_{i-1}) / \Delta t_i$
*   **Angkatan Pena (Pen Lifts):** Total jumlah jalur goresan (strokes) dikurangi satu.

FastAPI menghitung rata-rata dari sifat-sifat ini dan menormalisasinya sebelum dikirim ke analisis LLM dan database.

---

## 4. Integrasi API Groq

### 4.1 Vision OCR (Tahap 1)
*   **Model:** `llama-3.2-11b-vision-preview`
*   **Prompt System:**
    ```text
    Kamu adalah mesin OCR khusus tulisan tangan dalam Bahasa Indonesia dan Bahasa Inggris. 
    Tugasmu adalah membaca gambar tulisan tangan yang diberikan dan mentranskripsikannya menjadi teks ketikan biasa secara akurat tanpa menambahkan komentar, interpretasi, atau analisis apapun. 
    Jika tulisan tangan tidak terbaca atau kosong, kembalikan string kosong "".
    ```

### 4.2 LLM Reflector (Tahap 2)
*   **Model:** `llama-3.3-70b-specdec`
*   **Prompt System:**
    ```text
    Kamu adalah seorang Psikolog Empatis dan Pakar Grafologi (Analisis Tulisan Tangan). 
    Kamu akan menerima data berupa:
    1. Teks jurnal hasil tulisan tangan pengguna (OCR).
    2. Log fisik (Jam tidur dan Status olahraga).
    3. Metrik kinematik menulis (Kecepatan menulis, Jumlah hapus, Durasi, dan Jerk/Tremor Score).
    
    Analisis data tersebut untuk menentukan kondisi emosional pengguna:
    - Analisis Sentimen: Evaluasi emosi dominan dalam teks jurnal (misal: Anxious, Sad, Angry, Positive, Neutral).
    - Korelasi Stres: Korelasikan apakah jerk score tinggi (tangan gemetar) atau durasi menulis yang sangat lama berbanding lurus dengan sentimen cemas di teks jurnal dan kurang tidur.
    - Nada Bicara: Harus sangat empatis, membangun, ramah Gen Z, dan TIDAK BOLEH mengandung diagnosis klinis (seperti "Anda menderita Depresi Klinis/Bipolar") atau menyarankan obat-obatan medis.
    
    Kamu WAJIB mengembalikan output dalam format JSON mentah dengan struktur berikut:
    {
      "sentiment_label": string,
      "sentiment_score": integer (0-100),
      "handwriting_insights": string (max 3 kalimat, empatis dan konstruktif),
      "mood_stress_correlation": string (ulasan hubungan durasi tidur, olahraga, dan metrik goresan dengan emosi hari ini),
      "recommendations": string (latihan pernapasan/meditasi singkat),
      "stress_score": integer (0-100),
      "mood_score": integer (0-100),
      "future_mood_prediction": [int, int, int, int] (array 4 angka skor mood prediktif untuk 4 hari ke depan)
    }
    ```

---

## 5. Pembaruan Skema Database & Sistem Desain

### 5.1 Pembaruan Skema PostgreSQL (Supabase)
Untuk menyimpan hasil perhitungan kinematika dan evaluasi Groq dengan benar, skema yang ditentukan dalam `DESIGN.md` diperbarui sebagai berikut:

```sql
-- Entri jurnal harian
create table public.journals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  no_of_hours_sleep numeric not null,
  exercise_status text not null,
  ocr_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Metrik kuantitatif hasil perhitungan goresan tulisan tangan
create table public.kinematic_features (
  id uuid default gen_random_uuid() primary key,
  journal_id uuid references public.journals(id) on delete cascade not null,
  stroke_count integer not null,
  erase_count integer not null,
  duration_seconds integer not null,
  average_velocity numeric not null,
  average_acceleration numeric not null,
  jerk_score numeric not null,
  pen_lifts integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Hasil analisis AI dan skor emosi
create table public.llm_analyses (
  id uuid default gen_random_uuid() primary key,
  journal_id uuid references public.journals(id) on delete cascade not null,
  sentiment_label text not null,
  sentiment_score integer not null,
  handwriting_insights text not null,
  mood_stress_correlation text not null,
  recommendations text not null,
  stress_score integer not null,
  mood_score integer not null,
  future_mood_prediction jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### 5.2 Sistem Desain Token (PETA Framework Visualizer)
*   **Stress Management Radar Chart:** Memetakan metrik kecepatan, akselerasi, skor jerk, jumlah hapus, dan angkatan pena. Diberi gaya dengan warna utama Accent Purple (`#7a3dff`) dan isian `rgba(122, 61, 255, 0.2)`.
*   **Mood Trend Line Chart:** Memetakan skor emosi longitudinal (skor hari ini + prediksi masa depan 4 hari). Diberi gaya dengan warna Accent Blue (`#3b89ff`) untuk garis tren dan Ink (`#080808`) untuk titik data aktif.
*   **Privacy Guard (Keamanan Data):** Penghapusan langsung berkas PNG kanvas yang diunggah dari direktori `/tmp` di dalam blok `finally` Python untuk melindungi kerahasiaan identitas pengguna.
