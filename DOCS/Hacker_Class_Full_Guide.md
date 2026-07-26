# Hacker Class: From Code to Impact — Road to MVP
**Speaker / Author:** Akhri F. Ramadhan  
**Sesi 1:** 16 Juli | **Sesi 2:** 23 Juli  

---

## Ringkasan Eksekutif & Philosophy

> *"Gw pernah bikin sesuatu yang nyaris sempurna. Dan nggak ada yang pakai."*

Kalian sudah bisa ngoding, tapi itu bukan fokus utama latihan ini. Kode sekarang murah, tetapi **judgment** yang mahal. AI membuat penulisan kode nyaris gratis. Hal yang paling langka dan bernilai saat ini adalah tahu **apa yang layak dibangun**.

**Prinsip Utama:** Bangun dari keresahan, bukan sekadar karena bisa dibuat. *Fall in love with the problem, not the solution.*

---

## Part 1: Sesi 1 — From Code to Impact (16 Juli)

### 1. Cara Menemukan Keresahan (Problem Discovery)
Jangan lakukan *brainstorming* ide secara abstrak, melainkan lakukan **observasi**:

1. **3-Meter Problem:** Masalah dalam radius 3 meter dari tempat Anda duduk.
2. **Yang Bikin Ngedumel:** Hal-hal yang Anda keluhkan selama 7 hari terakhir.
3. **Manual yang Nyebelin:** Tugas repetitif yang semua orang sudah pasrah menjalankannya secara manual.
4. **Satu Orang Nyata:** Bangun solusi spesifik untuk *satu orang nyata*, bukan untuk "pasar" yang abstrak.
5. **Data Numpuk:** Data yang dikumpulkan tetapi tidak pernah diproses atau dipakai.

---

### 2. The Vibe Coding Loop
Terdapat 6 gerakan dalam alur pengembangan berbasis AI (*muscle memory* untuk speedrun):

```
[01 FRAME] ➔ [02 SCAFFOLD] ➔ [03 INJECT] ➔ [04 VERIFY] ➔ [05 HARDEN] ➔ [06 SHIP]
```

Pada Sesi 1, fokus difokuskan pada 3 gerakan pertama:

#### Gerakan 01: FRAME
* **Aksi:** Tulis PRD (Product Requirement Document) terlebih dahulu.
* **Tujuan:** Mencegah AI "kabur" atau berhalusinasi di tengah *build*.
* **Mengapa AI sering kabur?** AI bersifat *stateless* dan tidak memiliki sumber kebenaran bawaan. Setiap prompt baru adalah dunia baru baginya.
* **Fungsi PRD:** Sebagai **jangkar** (*single source of truth*) yang terus dirujuk AI agar nama field, fitur, dan arsitektur tidak berubah-ubah sendiri.
> *"AI nggak butuh lebih banyak instruksi. Dia butuh satu sumber kebenaran."*

#### Gerakan 02: SCAFFOLD
* **Aksi:** Biarkan AI membangun rangkanya.
* **Struktur Rangka:**
  * **Frontend UI:** Input & tampilan
  * **Core AI (LLM):** Otak produk
  * **Database:** Data nyata tersimpan
* **Peran Builder:** Review keputusan arsitektur, bukan meng-audit setiap baris kode. Target utamanya adalah secepatnya mencapai kondisi *"app hidup + database nyambung"*, lalu langsung deploy skeleton-nya.

#### Gerakan 03: INJECT
* **Aksi:** Sematkan LLM sebagai fungsi inti, bukan sekadar chatbot tempelan.
* **Pemanfaatan LLM Tersembunyi (Non-Chatbot):**
  * *Extract*
  * *Classify*
  * *Generate-in-flow*
  * *Transform*
  * *Score*
  * *Search*
  * *Act*
  * *Enrich*

---

### 3. Toolset & Preparation
Sebelum mengeksekusi proyek, siapkan alur tools pilihan:

* **Jalur Cepat:** Lovable / Bolt / v0 + Supabase
* **Jalur Kontrol:** Cursor / Copilot + Next.js
* **Advanced:** Claude Code / Codex

**Prerequisites:**
* Akun GitHub, Vercel, Supabase.
* API key LLM (disimpan dengan aman di `.env`).
* Login dan coba tool pilihan minimal sekali.
* Satu keresahan nyata yang siap dieksekusi.

---

### 4. Tugas Tryout Mandiri (Take-Home)
* Jalankan loop utuh sekali secara mandiri (durasi ~3 jam) sampai ter-deploy.
* **Tujuan:** Membangun *muscle memory* dan menemukan titik macet (*blocker*) sendiri.
* Bawa repository dan daftar titik macet ke Sesi 2 untuk dibedah bersama.

---

## Part 2: Sesi 2 — Road to MVP (23 Juli)

> *"Mentok itu bagian dari desainnya. Bikin gampang, Ship susah."*

Ada jurang lebar antara *"jalan di laptop gue"* dan *"produk yang orang lain bisa buka"*. Jurang tersebut diisi oleh debugging, arsitektur, dan deployment.

---

### 1. Loop 04: VERIFY (Jangan Percaya Buta)
* **Checklist Verifikasi:**
  1. **Buka DB:** Apakah data beneran masuk dan tersimpan sesuai skema?
  2. **Tes Sambungan:** Pastikan alur `Frontend ➔ API ➔ DB` berjalan lancar.
  3. **Cek Halusinasi:** Verifikasi apakah package/API yang digunakan benar-benar ada.
* **Aturan Utama:**
  > *"Kalau kamu nggak bisa jelasin satu baris itu ngapain, kamu belum boleh nge-ship baris itu."*

---

### 2. The AI Debugging Loop
Error message adalah teks paling berharga di layar Anda. **Baca dulu, baru buat prompt.**

```
1. Capture ➔ Error log lengkap
2. Feed    ➔ Berikan AI error PENUH + kode + ekspektasi/harapan
3. Root    ➔ Minta AKAR masalah, bukan sekadar tambalan
4. Verify  ➔ Pastikan pembenahan benar-benar menyentuh akar
```

---

### 3. Level Up: Superpowers (Agentic AI Plugins)
Gunakan plugin open-source untuk Claude Code atau agentic tools (seperti Codex) untuk memindahkan disiplin dari kepala ke tool:

* **Systematic Debugging:** Menganalisis akar masalah terlebih dahulu sebelum memberikan *fix*.
* **Test-Driven:** Membuat test gagal terlebih dahulu sebelum mengimplementasikan solusi.
* **Brainstorming:** Mempertajam dan me-refine kebutuhan fitur terlebih dahulu.
* **Code Review:** Melakukan review kode secara otomatis via *subagent*.

---

### 4. Architecture & State Management
Gunakan pendekatan modular dengan memisahkan concern:

* **Frontend:** Mengurus UI/UX dan tampilan.
* **API:** Mengurus logika bisnis dan pemrosesan.
* **Database:** Mengurus penyimpanan data.

> *Jika dicampur, satu perubahan kecil bisa merusak tiga hal lainnya. Semakin modular, semakin mudah di-debug.*

---

### 5. Loop 05: HARDEN (Amankan Sebelum Ship)
* **Security Checklist:**
  * **Secrets / Environment Variables:** Simpan di `.env`, jangan pernah ditaruh di client-side atau di-commit ke Git repo.
  * **Row Level Security (RLS):** Wajib dinyalakan pada database (tanpa RLS, DB praktis menjadi publik).
  * **Validasi Input User:** Cegah input berbahaya.
  * **Rate Limiting:** Mencegah eksploitasi API dan kuota membengkak (*boncos*).
  * **Prompt Injection Awareness:** Proteksi alur AI dari manipulasi prompt.
  * **Security Audit:** Gunakan skill audit keamanan bawaan/plugin untuk menyisir celah keamanan.

---

### 6. Loop 06: SHIP (Produksi vs Lokal)
"Jalan di laptop gue" $\neq$ produksi. Kendala umum saat deploy:
* Environment variable lupa di-set di server produksi.
* Perbedaan versi *dependency*.
* Asset / file yang cuma ada di lokal.

**Strategi:** Deploy dari awal dan lakukan secara sering. Setiap kali deploy gagal, berikan error log-nya langsung ke AI. Lakukan commit kecil yang bermakna.

---

## Part 3: The 3-Hour Speedrun & Assessment Criteria

Tantangan akhir: Membangun MVP dari nol dalam waktu 3 jam melalui 4 langkah + Loop utuh, lalu di-submit untuk dinilai secara otomatis menggunakan AI.

### Bobot & Kriteria Penilaian:

| Kriteria | Bobot | Indikator Utama |
| :--- | :---: | :--- |
| **Keresahan** | **30%** | Apakah masalah yang diangkat nyata & spesifik? |
| **Problem-fit** | **20%** | Apakah solusi yang ditawarkan pas dengan masalahnya? |
| **Eksekusi** | **25%** | Pipeline nyata, fungsional, dan ter-deploy dengan baik. |
| **Craft & Aman** | **15%** | Kebersihan kode, secrets aman, RLS aktif, commit rapi. |
| **Demo** | **10%** | Alur penjelasan dari masalah ke solusi tersaji dengan runtut. |

---

### Penutup
> *"Bangun sampe jadi sampe orang lain bisa pake. Itu bedanya builder sama yang cuma ngoding."*
