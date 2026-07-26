# InkTrace AI

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20FastAPI%20%7C%20Supabase%20%7C%20Groq-purple)](https://github.com/Kardynan/d--10th-hackathon-dynan)
[![Testing](https://img.shields.io/badge/Tests-Pytest-green)](https://github.com/Kardynan/d--10th-hackathon-dynan)
[![Design](https://img.shields.io/badge/Design-Minimalist%20Webflow-black)](https://github.com/Kardynan/d--10th-hackathon-dynan)

**InkTrace AI** adalah sistem *early self-awareness* berbasis jurnal tulisan tangan digital untuk mendeteksi perubahan emosional secara longitudinal dan menghubungkan kembali remaja (Gen Z) ke dunia nyata melalui analisis kinematika motorik menulis serta refleksi AI.

---

## 📌 Masalah yang Diselesaikan

Berdasarkan analisis kesehatan mental Gen Z saat ini (tahun 2026), aplikasi ini memecahkan 3 masalah utama:
1. **Refleksi Diri yang Bersifat Pasif & Episodik**: Remaja baru mencari bantuan saat kondisi mental sudah kritis atau mengalami *burnout* parah karena tidak menyadari penurunan stres yang memburuk secara perlahan dari hari ke hari.
2. **Ketergantungan Emosional pada AI Companions (*Anestesi Digital*)**: Remaja menghabiskan terlalu banyak waktu curhat pada AI fiktif demi validasi instan bebas konflik, yang memicu isolasi dari hubungan nyata.
3. **Self-Diagnosis Liar di Media Sosial**: Informasi keliru di media sosial mendorong remaja melakukan *self-diagnosis* klinis keliru tanpa verifikasi medis, yang menunda pengobatan yang tepat.

---

## ✨ Fitur Utama

Aplikasi dirancang berdasarkan **PETA Framework (6 Pilar Kesejahteraan Mental)** dengan fungsionalitas berikut:

*   **Canvas Journaling (Visual & Temporal Input)**: Kanvas gambar responsif menggunakan `react-sketch-canvas` untuk menulis tangan dengan sensasi sensorik menulis alami.
*   **Kinematics Analysis Engine**: Backend mengekstrak metrik kinematika dari Stroke JSON (jumlah stroke, rata-rata kecepatan, akselerasi, *jerk score* / tremor halus, *pen lifts*, serta frekuensi penghapusan).
*   **Vision & LLM FastAPI Pipeline**:
    *   **Vision OCR**: Gambar canvas PNG diubah menjadi teks oleh `llama-3.2-11b-vision-preview` di Groq API.
    *   **LLM Reflection Engine**: Menganalisis korelasi fisik, tulisan tangan, dan log kesehatan harian secara terstruktur menggunakan `llama-3.3-70b-specdec` pada Groq dengan format JSON dalam < 3 detik.
*   **Privacy by Design**: File gambar PNG sementara yang diunggah ke server backend segera dihancurkan setelah ekstraksi AI selesai untuk menjaga privasi pengguna.
*   **Trusted Circle (Social Support)**: Notifikasi email (via **Resend API**) dan WhatsApp (simulasi **OpenWA**) akan terkirim otomatis ke kontak terdekat untuk mengajak mereka menyapa pengguna jika tingkat stres terdeteksi tinggi (>70), tanpa membocorkan isi jurnal pribadi.
*   **Jomblo Mode (Digital Detox Timer)**: Fitur pembatasan fokus di mana antarmuka diblokir oleh overlay gelap dengan penghitung waktu mundur 2 menit, mendorong pengguna menulis jurnal dengan tenang tanpa distraksi digital.
*   **Crisis Alert (Pencegahan Risiko)**: Deteksi otomatis kata kunci sensitif (seperti *self-harm*, *bunuh diri*) yang segera menampilkan modal bantuan darurat (*Crisis Helpline*).
*   **Smart Routing Konseling Terdekat**: Menggunakan GPS lokasi pengguna untuk mencari klinik, rumah sakit, psikiater, atau psikolog terdekat lewat **Overpass API (OpenStreetMap)** secara real-time dan bebas halusinasi AI.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 (Webflow-inspired design system)
- **Library Canvas**: `react-sketch-canvas`
- **Charts**: Recharts (Radar & Line Chart responsif)
- **Database Client**: `@supabase/supabase-js`

### Backend
- **Framework**: FastAPI (Python 3.13)
- **SDK AI**: Groq SDK (`llama-3.2-11b-vision-preview`, `llama-3.3-70b-specdec`)
- **Database Client**: Supabase Python SDK
- **Testing**: Pytest & TestClient

### Database
- **Provider**: Supabase PostgreSQL
- **Security**: Row-Level Security (RLS) diaktifkan penuh di semua tabel.

---

## 📐 Arsitektur & Alur Data

```
[ Frontend Canvas & Logs ] 
          │
          │ (PNG Canvas + Stroke JSON + Physical Log Form)
          ▼
[ FastAPI Backend ] 
          │
          ├──► [ Kinematics Engine ] ──► (Calculate velocity, acceleration, jerk, pen lifts)
          │
          ├──► [ Groq Vision OCR ] ──► (llama-3.2-11b-vision-preview transcribes PNG to Text)
          │
          ├──► [ Groq LLM Analyzer ] ──► (llama-3.3-70b-specdec generates JSON insight & prediction)
          │
          ├──► [ Supabase DB ] ──► (Saves Journals, Kinematic Features, & LLM Analysis results)
          │
          ├──► [ Resend Email API / WhatsApp Gateway ] ──► (Trigger alert to Trusted Circle if stress > 70)
          ▼
[ Clean Up ] ──► (Destroys temporary PNG file on Backend server)
```

---

## 🔑 Role & Hak Akses

1. **Authenticated Users**:
   - Hanya pengguna terautentikasi (registrasi via Supabase Auth) yang dapat mengakses halaman analisis, membuat jurnal baru, serta melihat dashboard longitudinal mereka sendiri.
   - Keamanan data dijamin secara ketat dengan **Row-Level Security (RLS)** pada level tabel PostgreSQL di Supabase. Kebijakan RLS membatasi hak akses agar user hanya bisa membaca, menambah, dan menghapus baris data milik mereka sendiri berdasarkan `auth.uid()`.
2. **Database Trigger**:
   - Memiliki fungsi trigger otomatis `public.handle_new_user()` yang dijalankan setelah akun baru terdaftar di `auth.users`, secara otomatis menginisialisasi profil pengguna ke tabel `public.users` dengan aman.

---

## 🗄 Database Schema

Migrasi database tersimpan di berkas `supabase/migrations/20260726_update_schema.sql`. Berikut relasi antar-tabel utama:

### 1. `public.users`
Menyimpan data profil dasar pengguna setelah terdaftar di Supabase Auth.
- `id` (uuid, Primary Key, REFERENCES auth.users)
- `full_name` (text)
- `age` (integer)
- `created_at` (timestamp)

### 2. `public.journals`
Menyimpan entri jurnal dasar, log kesehatan fisik harian, dan hasil OCR.
- `id` (uuid, Primary Key)
- `user_id` (uuid, REFERENCES auth.users)
- `no_of_hours_sleep` (numeric, jam tidur semalam)
- `exercise_status` (text, log olahraga)
- `ocr_text` (text, hasil ekstraksi Groq Vision OCR)
- `created_at` (timestamp)

### 3. `public.kinematic_features`
Menyimpan fitur kinematik motorik menulis yang dihitung di backend.
- `id` (uuid, Primary Key)
- `journal_id` (uuid, REFERENCES public.journals, ON DELETE CASCADE)
- `stroke_count` (integer, jumlah goresan)
- `erase_count` (integer, jumlah penghapusan)
- `duration_seconds` (integer, durasi menulis)
- `average_velocity` (numeric, kecepatan rata-rata px/ms)
- `average_acceleration` (numeric, akselerasi rata-rata)
- `jerk_score` (numeric, tremor halus motorik)
- `pen_lifts` (integer, frekuensi angkatan pena)

### 4. `public.llm_analyses`
Menyimpan analisis emosi, skor psikologis, korelasi, dan prediksi mood masa depan dari LLM.
- `id` (uuid, Primary Key)
- `journal_id` (uuid, REFERENCES public.journals, ON DELETE CASCADE)
- `sentiment_label` (text, label sentimen emosi)
- `sentiment_score` (integer, tingkat akurasi sentimen)
- `handwriting_insights` (text, analisis empatis Gen Z)
- `mood_stress_correlation` (text, korelasi fisik & goresan pena)
- `recommendations` (text, latihan pernapasan/mikro-intervensi)
- `stress_score` (integer, tingkat stres 0-100)
- `mood_score` (integer, tingkat mood 0-100)
- `future_mood_prediction` (jsonb, array prediksi mood 4 hari ke depan)

---

## 🚀 Cara Install & Menjalankan

### Persyaratan Awal
- **Node.js** (v18+) dan **npm**
- **Python 3.13**
- Akun **Supabase** (URL & Service Role Key)
- API Key **Groq Cloud**
- API Key **Resend** (Opsional untuk pengiriman email asli)

### 1. Backend Setup (FastAPI)
1. Pindah ke direktori backend:
   ```bash
   cd backend
   ```
2. Buat file `.env` berdasarkan `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Lalu isi variabel lingkungan yang dibutuhkan:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GROQ_API_KEY=your_groq_api_key
   RESEND_API_KEY=your_resend_api_key
   ```
3. Install dependensi Python:
   ```bash
   pip install -r requirements.txt
   ```
4. Jalankan server FastAPI:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API akan berjalan di `http://localhost:8000`.

### 2. Frontend Setup (React/Vite)
1. Pindah ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Buat file `.env` di root folder `frontend` dan isikan kredensial Supabase Anda:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Install paket dependensi:
   ```bash
   npm install
   ```
4. Jalankan aplikasi web di mode development:
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:5173`.

---

## 🧪 Testing

Pengujian backend ditulis menggunakan `pytest` untuk menjamin integritas fungsionalitas API, kalkulator kinematika menulis, dan integrasi parser pipa Groq AI.

Untuk menjalankan pengujian unit & integrasi backend:
```bash
cd backend
pytest -v
```

---

## 🏁 Sejauh Mana Project Ini? (Status Proyek)

Proyek ini telah berhasil menyelesaikan tahap **MVP (Minimum Viable Product)**:
- [x] **Backend FastAPI**: Menyediakan endpoint analisis `/api/analyze`, pencarian bantuan medis `/api/helplines` berbasis lokasi GPS, dan penarikan histori tren `/api/history`.
- [x] **Infrastruktur DB Supabase**: Migrasi tabel PostgreSQL, RLS Policy, dan database trigger saat user register sudah dikonfigurasi dan teruji sepenuhnya.
- [x] **Pipeline AI (Groq)**: Terintegrasi dengan Vision OCR (`llama-3.2`) dan LLM Reflection (`llama-3.3`) yang mengembalikan data JSON terstruktur secara cepat dan andal.
- [x] **Kalkulator Kinematika**: Menghitung secara matematis tremor (*jerk*), kecepatan, akselerasi, durasi, dan angkatan pena dari goresan digital.
- [x] **Desain Frontend Webflow Style**: Implementasi UI React dengan design tokens warna Ink, Canvas, Aksen Ungu, Pink, Biru, Oranye, Hijau, dan Merah.
- [x] **Dashboard Longitudinal**: Menampilkan metrik visual Radar Chart (Recharts) dan Line Chart responsif untuk memantau mood.
- [x] **Digital Detox (Jomblo Mode)**: Berfungsi penuh memblokir distraksi selama pengguna menulis jurnal.
- [x] **Crisis Modal & GPS Helplines**: Lokasi GPS pengguna diolah melalui Overpass API (OpenStreetMap) untuk menampilkan daftar 20 RS/Psikolog terdekat yang valid jika terdeteksi kata-kata kritis atau stres ekstrem.

*Catatan: Integrasi notifikasi WhatsApp saat ini masih berjalan secara simulasi di console backend.*

---

## 📄 Dokumentasi Lain

Untuk pemahaman teknis dan desain yang lebih mendalam, silakan baca dokumentasi pendukung berikut:
*   [PRD.md](DOCS/PRD.md) - Product Requirement Document detail.
*   [DESIGN.md](DOCS/DESIGN.md) - Spesifikasi token warna, tipografi, dan panduan layout RWD.
*   [inktrace-design-system.md](DOCS/inktrace-design-system.md) - Dokumentasi sistem desain UI.
