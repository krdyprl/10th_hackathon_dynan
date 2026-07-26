# InkTrace AI — Full Integration Design

## Overview
Menyelesaikan 4 fase integrasi: Auth (Supabase), Persistensi Data, Notifikasi (Resend), Smart Routing GPS (OpenStreetMap).

## Fase 1: Autentikasi Supabase & RLS Security
### Task 1: Integrasi Supabase Auth di Frontend & Profil Pengguna
- **Frontend:**
  - Buat `frontend/src/lib/supabase.js` — client `@supabase/supabase-js`
  - Buat `frontend/src/components/Auth.jsx` — form Login/Signup (email + Google OAuth)
  - Edit `App.jsx` — conditional render Auth vs Dashboard
- **Backend:**
  - Buat `backend/app/database.py` — koneksi `supabase-py`
  - Verifikasi token JWT di header Authorization
- **Supabase:**
  - RLS policies di migrasi SQL
  - Trigger insert `public.users` saat registrasi

### Task 2: RLS Policies
- `journals`: `user_id = auth.uid()`
- `kinematic_features`: via join journals
- `llm_analyses`: via join journals

## Fase 2: Persistensi Data (FastAPI + Supabase)
### Task 3: Koneksi FastAPI & Penyimpanan Jurnal
- Simpan hasil analisis ke Supabase di endpoint `/api/analyze`
- Data: journals, kinematic_features, llm_analyses

### Task 4: API Riwayat Longitudinal
- `GET /api/history?range=7|30|90`
- Frontend MoodTrendChart ganti mock data

## Fase 3: Notifikasi Trusted Circle (Resend)
### Task 5: Notifikasi Otomatis
- `backend/app/notifications.py` — kirim email via Resend
- Trigger jika `stress_score > 70`

## Fase 4: Smart Routing GPS
### Task 6: Deteksi GPS & Routing
- Frontend: `navigator.geolocation.getCurrentPosition()`
- Backend: `backend/app/helplines.py` — query OpenStreetMap Nominatim
- `GET /api/helplines?lat=&lon=`
