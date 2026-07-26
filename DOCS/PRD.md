# PRD: InkTrace AI

## Problem Statement
Berdasarkan telaah esai kesehatan mental Gen Z tahun 2026, masalah utama yang dihadapi remaja bukan kurangnya kesadaran (*awareness*) kesehatan mental, melainkan:
1.  **Refleksi diri yang bersifat pasif & episodik:** Remaja baru mencari bantuan saat kondisi mental sudah kritis atau mengalami burnout parah karena tidak menyadari perubahan stres yang memburuk secara perlahan.
2.  **Ketergantungan emosional pada AI Companions (*Anestesi Digital*):** Remaja menghabiskan hingga 15 jam sehari untuk curhat pada AI fiktif demi validasi instan bebas konflik, yang berujung pada kerusakan tidur dan isolasi dari hubungan nyata.
3.  **Self-Diagnosis liar di media sosial:** Video pendek 30 detik (seperti di TikTok) mendorong remaja melakukan self-diagnosis klinis keliru (*looping effect*) tanpa verifikasi medis, yang justru menunda pengobatan yang tepat.

InkTrace AI hadir sebagai sistem *early self-awareness* berbasis jurnal tulisan tangan digital untuk mendeteksi perubahan emosi secara longitudinal dan menghubungkan kembali remaja ke dunia nyata.

---

## Goals
- **Refleksi Harian Konsisten:** Pengguna dapat menyelesaikan input jurnal tulisan tangan & log fisik dalam waktu < 2 menit.
- **Deteksi Tren Perilaku:** Memberikan peringatan dini jika tren psikologis/perilaku menulis memburuk selama 3 hari berturut-turut.
- **Koneksi Sosial Autentik:** Mendorong interaksi sosial nyata dengan teman/keluarga (*Trusted Circle*) tanpa membiarkan pengguna kecanduan mengobrol dengan AI chatbot.
- **Edukasi Bebas Halusinasi:** 100% rujukan bantuan terdekat akurat menggunakan koordinat GPS (Places API) tanpa risiko disinformasi AI.

---

## Target Users
- **End User:** Remaja dan mahasiswa (Gen Z) yang membutuhkan ruang aman untuk refleksi diri harian, mendeteksi kecemasan akademik/doomscrolling, serta melacak kestabilan emosi mereka.
- **Trusted Circle (Contacts):** Teman dekat, pasangan, atau orang tua yang ditunjuk pengguna untuk menerima notifikasi otomatis sapaan emosional saat kondisi pengguna menurun.
- **AI/Dev:** Agent AI coding dan pengembang perangkat lunak yang membangun, memelihara, dan menguji fungsionalitas sistem.

---

## User Stories
- **Sebagai pengguna (End User),** aku mau menulis jurnal refleksi dengan coretan tangan di canvas digital supaya aku bisa merasakan efek terapi sensorik menulis tangan secara alami.
  *   *Acceptance Criteria:* Canvas merespon goresan mouse/stylus secara instan (< 100ms delay), mendukung opsi hapus, dan mencatat Stroke JSON (jumlah coretan & durasi).
- **Sebagai pengguna,** aku mau melihat ringkasan visual berupa grafik atas kestabilan emosiku supaya aku menyadari kapan kondisi mentalku mulai menurun.
  *   *Acceptance Criteria:* Dashboard menampilkan grafik radar/bar (aspek tulisan) dan grafik garis tren (mood 7 hari terakhir) secara responsif (RWD).
- **Sebagai pengguna,** aku mau menerima saran latihan pernapasan/meditasi singkat (Micro-Intervention) ketika mendeteksi tingkat stres tinggi supaya aku bisa menenangkan diri di dunia nyata.
  *   *Acceptance Criteria:* Latihan ditampilkan sebagai pop-up overlay yang jelas, sederhana, dan langsung tanpa mengajak pengguna berdiskusi panjang lebar dengan AI.
- **Sebagai kontak (Trusted Circle),** aku mau menerima sapaan notifikasi otomatis (via WA/Email) saat kondisi emosional temanku menurun supaya aku bisa merangkul dan menghubunginya langsung.
  *   *Acceptance Criteria:* Notifikasi WhatsApp/Email terkirim otomatis berisi ajakan ramah tanpa membeberkan isi teks jurnal pribadi pengguna demi menjaga privasi.

---

## Functional Requirements
- [ ] **Autentikasi Pengguna & Profil**
  - Mendaftar dan masuk menggunakan Supabase Auth (Email & Password).
  - Menyimpan data profil dasar (Nama Lengkap, Umur) ke database.
- [ ] **Canvas Journaling (Visual & Temporal Input)**
  - Canvas gambar responsif (`react-sketch-canvas`) untuk menulis tangan.
  - Form input log fisik harian: jam tidur (slider) dan status olahraga (dropdown).
  - Pengambilan stroke metadata (jumlah stroke, jumlah hapus, durasi menulis).
- [ ] **Pipeline AI FastAPI & Groq**
  - Upload gambar PNG canvas & Stroke JSON ke FastAPI.
  - OCR otomatis mengubah coretan gambar menjadi teks menggunakan API Groq (`llama-3.2-11b-vision-preview`).
  - *Feature extraction* temporal dan visual dari baseline tulisan tangan.
  - LLM Reflection Engine (`llama-3.3-70b-specdec` pada Groq) untuk generate analisis JSON terstruktur.
- [ ] **Privacy by Design**
  - Penghancuran otomatis file gambar PNG tulisan tangan dari server setelah ekstraksi AI selesai.
- [ ] **Notifikasi Trusted Circle (Social Support)**
  - Pengaturan daftar kontak Trusted Circle (Nama, Email, WhatsApp).
  - Integrasi **Resend API** untuk mengirim notifikasi sapaan otomatis via email.
  - Integrasi **OpenWA Gateway API** untuk mengirim notifikasi sapaan otomatis via WhatsApp.
- [ ] **Smart Routing Konseling Terdekat (Smart Access)**
  - Deteksi lokasi GPS pengguna untuk mencari koordinat bantuan terdekat.
  - Integrasi **Google Places API / OpenStreetMap** untuk menyajikan kontak psikolog terdekat tanpa halusinasi LLM.
- [ ] **Dashboard Longitudinal & Tren (Behavior AI)**
  - Visualisasi grafik data aspek tulisan tangan (Radar/Bar Chart) menggunakan Recharts.
  - Visualisasi grafik data prediksi mood 4 hari ke depan (Line Chart).
  - Skrining awal tren emosi 7, 30, dan 90 hari terakhir.

---

## Non-Functional Requirements
- **Performa:**
  - Waktu respons pemrosesan AI (OCR + Analisis Groq) di backend < 3 detik (berkat kecepatan Groq LPU).
  - Waktu pemuatan halaman awal dashboard < 2 detik.
- **Keamanan & Privasi:**
  - Mengaktifkan Row-Level Security (RLS) di Supabase secara ketat (user hanya bisa membaca datanya sendiri).
  - Tidak menyimpan file gambar tulisan tangan pengguna di database jangka panjang.
- **Reliability:**
  - Uptime API server backend > 99%.
- **Usability (Responsive Web Design):**
  - Desain web responsif (Tailwind breakpoints) yang ramah layar sentuh HP, tablet, maupun layar desktop laptop.
  - Layout bersih berorientasi fokus (Webflow-inspired design system).

---

## Scope
### In Scope (MVP):
- Autentikasi user dengan Supabase.
- Web Canvas untuk tulisan tangan & Input data fisik (tidur, olahraga).
- Pipeline AI (OCR & Analisis) menggunakan Groq API.
- Dashboard hasil dengan grafik Recharts responsif.
- Notifikasi Trusted Circle otomatis (Resend Email & OpenWA WhatsApp) jika tren stres mendeteksi penurunan emosi berturut-turut.
- Fitur Jomblo Mode (Digital Detox Timer) sederhana saat menulis jurnal.

### Out of Scope (Ditunda):
- Chatbot AI pendamping interaktif berkelanjutan (karena bertentangan dengan tujuan mencegah kecanduan AI).
- Skrining klinis psikologis resmi (aplikasi hanya untuk refleksi diri).
- Integrasi IoT wearable devices (misal Apple Watch / Fitbit untuk deteksi detak jantung secara langsung).
