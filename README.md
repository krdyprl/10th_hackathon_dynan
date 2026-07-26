# InkTrace AI

Early self-awareness system berbasis jurnal tulisan tangan digital. Menganalisis emosi dari goresan tangan + teks, memberikan insight, dan menghubungkan pengguna dengan dukungan sosial.

---

## Persyaratan

- **Node.js** >= 20
- **Python** >= 3.10
- **Akun Supabase** (gratis di [supabase.com](https://supabase.com))
- **API Key Groq** ([console.groq.com/keys](https://console.groq.com/keys))
- **API Key Resend** ([resend.com/api-keys](https://resend.com/api-keys)) — opsional, untuk notifikasi email

---

## 1. Clone & Setup

```bash
git clone https://github.com/krdyprl/10th_hackathon_dynan.git
cd 10th_hackathon_dynan
```

---

## 2. Setup Frontend

```bash
cd frontend
npm install
```

Buat file `frontend/.env`:

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

Jalankan:

```bash
npm run dev
```

Frontend berjalan di **http://localhost:5173**

---

## 3. Setup Backend

```bash
cd backend
pip install -r requirements.txt
```

Buat file `backend/.env`:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
GROQ_API_KEY=gsk_...
RESEND_API_KEY=re_...          # opsional
```

Jalankan:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend berjalan di **http://localhost:8000**

Dokumentasi API: **http://localhost:8000/docs**

---

## 4. Setup Database (Supabase)

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project → **SQL Editor**
3. Paste isi file `supabase/migrations/20260726_update_schema.sql`
4. Klik **Run**

Ini akan membuat semua tabel:
- `users` — profil pengguna
- `journals` — jurnal harian
- `kinematic_features` — metrik goresan tangan
- `llm_analyses` — hasil analisis AI
- `mood_logs` — log emosi harian
- `habit_logs` — log tidur & olahraga
- `trusted_circles` — kontak dukungan

### Aktifkan Google OAuth (opsional)

1. Supabase Dashboard → **Authentication** → **Providers**
2. Aktifkan **Google**
3. Masukkan Client ID & Secret dari [Google Cloud Console](https://console.cloud.google.com)

---

## 5. Run (Keduanya)

Terminal 1 — Backend:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Terminal 2 — Frontend:

```bash
cd frontend
npm run dev
```

Buka **http://localhost:5173** di browser.

---

## 5 Pillar Navigasi

| Route | Halaman | Warna |
|-------|---------|-------|
| `/welcome` | Check-in mood + ringkasan | Ungu |
| `/stres` | Tulis jurnal + analisis AI | Ungu |
| `/sehat` | Log tidur/olahraga + streak | Oranye |
| `/literasi` | Grafik + insight + timeline | Biru |
| `/sosial` | Trusted Circle + notifikasi | Pink |
| `/bantuan` | GPS + klinik terdekat | Hijau |
| `/darurat` | Hotline + panduan napas | Merah |
| `/profil` | Statistik + riwayat | —

---

## API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `POST` | `/api/analyze` | Analisis tulisan tangan (OCR + kinematika + LLM) |
| `POST` | `/api/mood-logs` | Simpan mood harian |
| `GET` | `/api/history?range=7` | Riwayat mood + jurnal |
| `POST` | `/api/habits` | Simpan tidur/olahraga |
| `GET` | `/api/habits` | Ambil log hari ini |
| `GET` | `/api/habits/streak` | Hitung streak |
| `CRUD` | `/api/trusted-circles` | Kelola kontak dukungan |
| `POST` | `/api/notify` | Kirim notifikasi ke kontak |
| `POST` | `/api/ai-companion` | Chat suportif anti-kecanduan |
| `GET` | `/api/helplines` | Cari klinik/psikolog terdekat |

---

## Environment Variables

### `frontend/.env`
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### `backend/.env`
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
RESEND_API_KEY=
```

> ⚠️ File `.env` sudah di `.gitignore` — tidak akan ter-commit.

---

## Tests

```bash
cd backend
pytest tests/ -v
```

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts, lucide-react |
| Backend | FastAPI, Groq SDK, Supabase-py |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI | Groq (llama-3.2-11b-vision, llama-3.3-70b-specdec) |
| Notifikasi | Resend API |
| Peta | OpenStreetMap Overpass API |
| Font | Inter (Google Fonts) |
