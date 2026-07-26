# Wireframe: InkTrace AI Redesign

## Prinsip Desain
- **Dark & cozy** — latar gradient ungu gelap, nyaman untuk pengguna dengan energi rendah
- **Satu langkah per layar** — mengurangi beban kognitif
- **Hangat & personal** — font Lora serif, copy ramah, emoji
- **No hardcode** — semua warna/font/spacing via CSS variables + Tailwind theme

---

## 1. Palet Warna (CSS Variables)

```css
--bg-deep: #0f0720;
--bg-mid: #1a103f;
--bg-surface: #2c1469;
--text-primary: #e9d5ff;     /* heading, teks utama */
--text-secondary: #c4b5fd;   /* body */
--text-muted: #9a8ab5;       /* label, caption */
--accent: #8b5cf6;           /* tombol, aksen */
--accent-hover: #7c3aed;
--accent-soft: rgba(139, 92, 246, 0.15);  /* card bg */
--accent-border: rgba(139, 92, 246, 0.25);
--success: #34d399;
--warning: #fbbf24;
--danger: #f87171;
```

---

## 2. Tipografi

| Level | Font | Size | Weight |
|-------|------|------|--------|
| Display (logo/splash) | Lora Bold | 3xl | 700 |
| H1 (judul step) | Lora Bold | 2xl | 700 |
| H2 (card title) | Lora Medium | xl | 500 |
| Body | Lora Regular | base | 400 |
| Caption | Lora Italic | sm | 400 |
| Label step | Inter | xs | 600 |

Font Lora dari Google Fonts, Inter fallback system.

---

## 3. Layout

### Struktur Halaman

Satu halaman utama (`/`) dengan **wizard step** (desktop & mobile):

```
┌─────────────────────────────────────┐
│         Progress Bar (step 1/5)      │
├─────────────────────────────────────┤
│                                     │
│                                     │
│         [Konten Step Saat Ini]      │
│         - 1 pertanyaan/fitur       │
│         - tombol besar             │
│         - icon lucide-react        │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  [Kembali]              [Lanjut]    │
└─────────────────────────────────────┘
```

### Step Wizard

| Step | Konten | Icon |
|------|--------|------|
| **1. Check-in** | "Hai, apa kabar?" — 5 emoji mood 😭😔😐🙂😄 | Heart |
| **2. Tulis** | Kanvas + guided prompt + timer | PenLine |
| **3. Analisis** | Loading animasi + stage progress | Brain |
| **4. Insight** | Mood vs AI + rekomendasi | Sparkles |
| **5. Riwayat** | Grafik mood + timeline entry | ChartBar |

### Navigasi

- **Desktop**: wizard step (progress bar di atas)
- **Mobile**: wizard step (progress bar di atas)
- **Bottom bar** (opsional): shortcut ke riwayat & profil — hanya 3 icon:
  - ✏️ Tulis (step 1-3)
  - 📊 Insight (step 4)
  - 📖 Riwayat (step 5)

---

## 4. Atmosfer Visual

Setiap layar memiliki elemen dekoratif konsisten:
- **Blur orb** di pojok kanan atas (lingkaran glow besar)
- **Blur orb** di pojok kiri bawah
- **Pulsing dot** kecil di sudut (opsional, animasi lembut)
- Gradient background: `--bg-deep` → `--bg-mid` (vertikal)

---

## 5. Komponen Kunci

### A. Check-in (Step 1)
```
[Hai, apa kabar hari ini?]
[😭] [😔] [😐] [🙂] [😄]
[Lanjut →] (disabled sampai dipilih)
```

### B. Mood Card (di Step Insight)
```
┌─────────────────────────────┐
│  Perasaanmu    │  Kata AI    │
│  😐 (5/10)     │  😊 (68/100)│
│  "Biasa aja"   │  "Stabil"   │
└─────────────────────────────┘
```

### C. Timeline Insight (Step 5)
```
● Hari ini — Mood 68 — Stres Rendah
│
● Kemarin — Mood 45 — Stres Tinggi
│
● 2 hari lalu — Mood 72 — Stres Rendah
```

---

## 6. Icon Mapping (lucide-react)

| Konteks | Icon |
|---------|------|
| Mood / Check-in | `<Heart />` |
| Tulis / Kanvas | `<PenLine />` |
| AI / Analisis | `<Brain />` |
| Insight | `<Sparkles />` |
| Riwayat | `<BarChart3 />` |
| Rekomendasi | `<Lightbulb />` |
| Navigasi kembali | `<ChevronLeft />` |
| Navigasi lanjut | `<ChevronRight />` |
| Selesai | `<Check />` |
| Profil | `<User />` |
| Dukungan | `<MessageCircle />` |
| Bantuan | `<MapPin />` |

---

## 7. Aturan Copywriting

| Konteks | Gaya Lama | Gaya Baru |
|---------|-----------|-----------|
| Check-in | "Bagaimana perasaanmu sekarang?" | "Hai, apa kabar hari ini?" |
| Tulis | "Tulis Jurnal" | "Ceritakan harimu..." |
| Submit | "Kirim & Analisis" | "Selesai — Lihat Hasilnya" |
| Loading | "Menganalisis..." | "Membaca tulisamu..." |
| Insight | "Hasil Analisis AI" | "Apa yang Ditemukan" |
| Error | "Gagal analisis." | "Tidak apa-apa, coba lagi ya." |
| Trusted Circle | "Tambah Kontak" | "Hubungi orang terdekat" |

---

## 8. Flow Lengkap

```
Splash (logo + tagline) → Auth (login/signup)
  → Step 1: Check-in mood
  → Step 2: Guided prompt + kanvas
  → Step 3: Loading animasi (AI pipeline)
  → Step 4: Insight — mood vs AI + rekomendasi
  → Step 5: Riwayat (setelah minimal 1 entry)

Setiap hari: buka app → langsung Step 1 (check-in)
  → kalau sudah nulis hari ini, langsung ke Step 4 (insight terakhir)
```

---

*Dokumen ini sebagai acuan implementasi. Semua nilai desain didefinisikan di CSS variables, bukan hardcode.*
