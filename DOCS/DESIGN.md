---
version: alpha
name: InkTrace-AI-design-tokens
description: Official design tokens and component specifications for InkTrace AI — a Webflow-inspired clean visual interface built for mental health tracking and handwriting analysis.

colors:
  primary: "#080808"
  on-primary: "#ffffff"
  ink: "#080808"
  ink-strong: "#222222"
  body: "#363636"
  body-mid: "#5a5a5a"
  mute: "#898989"
  mute-soft: "#ababab"
  hairline: "#d8d8d8"
  canvas: "#ffffff"
  accent-purple: "#7a3dff" # Pengelolaan Stres / Canvas
  accent-pink: "#ed52cb"   # Dukungan Sosial / Trusted Circle
  accent-blue: "#3b89ff"   # Literasi / Psychoeducation
  accent-orange: "#ff6b00" # Kebiasaan Sehat / Sleep & Exercise logs
  accent-green: "#00d722"  # Akses Bantuan / Smart Routing
  accent-red: "#ee1d36"    # Pencegahan Risiko / Crisis Alert
  accent-yellow: "#ffae13" # Warning / Info

typography:
  display-xxl:
    fontFamily: Inter, system-ui, -apple-system, sans-serif
    fontSize: 80px
    fontWeight: 600
    lineHeight: 83.2px
    letterSpacing: -0.8px
  display-xl:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 56px
    fontWeight: 600
    lineHeight: 58.24px
  display-lg:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 44.8px
    fontWeight: 600
    lineHeight: 46.6px
  display-md:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 32px
    fontWeight: 500
    lineHeight: 41.6px
  display-sm:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 24px
    fontWeight: 500
    lineHeight: 31.2px
  display-xs:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 20px
    fontWeight: 500
    lineHeight: 28px
  eyebrow-uppercase:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 15px
    fontWeight: 500
    lineHeight: 19.5px
    letterSpacing: 1.5px
  eyebrow-uppercase-sm:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 12px
    fontWeight: 500
    lineHeight: 12px
    letterSpacing: 0.6px
  body-lg:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 28.8px
    fontWeight: 400
    lineHeight: 46.08px
    letterSpacing: -0.288px
  body-md:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 25.6px
    letterSpacing: -0.16px
  body-md-strong:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 500
    lineHeight: 25.6px
    letterSpacing: -0.16px
  body-sm:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 22.4px
  body-sm-strong:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 22.4px
  caption:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 12.8px
    fontWeight: 550
    lineHeight: 15.36px
  caption-mono:
    fontFamily: ui-monospace, SFMono-Regular, Menlo, monospace
    fontSize: 12px
    fontWeight: 400
    lineHeight: 18px
  button-md:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 16px
    fontWeight: 500
    lineHeight: 25.6px
    letterSpacing: -0.16px

rounded:
  none: 0px
  xs: 2px
  sm: 4px
  md: 8px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 24px
  3xl: 32px

components:
  nav-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm-strong}"
    padding: "{spacing.lg} {spacing.3xl}"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.body-sm-strong}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md} {spacing.xl}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.button-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md} {spacing.xl}"
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md} {spacing.lg}"
  badge-info:
    backgroundColor: "{colors.accent-blue}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.sm}"
  badge-info-soft:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.accent-blue}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.sm}"

  # --- InkTrace AI Specific Components ---
  ex-journal-canvas:
    description: "Handwriting Canvas drawing area with custom styled borders."
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.accent-purple}"
    rounded: "{rounded.md}"
    strokeColor: "{colors.accent-purple}"
    padding: "{spacing.3xl}"
  ex-radar-chart:
    description: "Handwriting Metrics Chart container (Radar/Bar) displaying analysis scores."
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline}"
    fillColor: "rgba(122, 61, 255, 0.2)" # Accent purple with opacity
    strokeColor: "{colors.accent-purple}"
    rounded: "{rounded.md}"
    padding: "{spacing.3xl}"
  ex-trend-chart:
    description: "Mood Trend Line Chart showing 7-day logs and future 4-day predictions."
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline}"
    lineColor: "{colors.accent-blue}"
    dotColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.3xl}"
  ex-trusted-circle:
    description: "Dukungan Sosial setup panel for configuring trusted contacts."
    backgroundColor: "#fffafc" # Light pink tint
    borderColor: "{colors.accent-pink}"
    rounded: "{rounded.md}"
    padding: "{spacing.3xl}"
  ex-smart-routing:
    description: "Smart Help access panel displaying professional consultant coordinates."
    backgroundColor: "#f9fff9" # Light green tint
    borderColor: "{colors.accent-green}"
    rounded: "{rounded.md}"
    padding: "{spacing.3xl}"
  ex-detox-overlay:
    description: "Jomblo Mode (Digital Detox Timer) overlay blocking interaction during journaling."
    backgroundColor: "rgba(8, 8, 8, 0.95)" # Solid ink black overlay
    textColor: "{colors.on-primary}"
    timerTypography: "{typography.caption-mono}"
    padding: "{spacing.3xl}"
  ex-crisis-modal:
    description: "Emergency alert pop-up modal when self-harm keywords are detected."
    backgroundColor: "{colors.accent-red}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.3xl}"
  ex-insight-card:
    description: "LLM Reflection output card showing daily empathetic summary."
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.md}"
    padding: "{spacing.3xl}"
  ex-toast:
    description: "Toast notification or feedback banner (flash messages)."
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "{spacing.md} {spacing.lg}"

---

## Overview

InkTrace AI mengadopsi bahasa desain visual Webflow yang minimalis, modern, dan berorientasi fokus. Antarmuka aplikasi didominasi oleh kanvas putih bersih (`{colors.canvas}`) yang kontras dengan teks dan aksi utama berwarna hitam pekat (`{colors.primary}`).

Untuk memetakan aspek fungsionalitas dan **6 Pilar Kesejahteraan Mental (PETA Framework)**, kami menggunakan sistem aksen warna kromatik 5-stop + 1 status darurat. Aksen warna ini diaplikasikan murni pada elemen visual spesifik (seperti batas kiri kartu, grafik, dan aksen canvas) untuk menjaga fokus tanpa membuat pengguna lelah akibat stimulasi warna berlebihan.

Tipografi didorong secara eksklusif oleh keluarga font **Inter** dengan pembatasan berat (*weight ceiling*) maksimal 600 untuk menonjolkan kerapian visual yang solid. Judul utama halaman menggunakan *negative tracking* (kerning rapat) untuk memberi kesan premium, sedangkan tiap kluster informasi didahului oleh *uppercase eyebrow tag* (label kapital) berukuran kecil dengan letter-spacing lebar.

---

## Panduan Implementasi Frontend (React + Tailwind CSS)

### 1. Layout & Breakpoints (Responsive Web Design - RWD)
Layout dirancang dengan prinsip **mobile-first** untuk memastikan aksesibilitas di perangkat seluler (HP) maupun komputer desktop/laptop:
*   **Grid Halaman Utama:**
    *   *Tailwind:* `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (Menumpuk vertikal 1 kolom di HP, melebar menjadi 2 kolom di tablet, dan 3 kolom di desktop).
*   **Gutters & Container:**
    *   *Tailwind:* `max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-8` (Padding horizontal horizontal lebar).

### 2. Komponen Typography
*   **Eyebrow Tags (Label Kapital):**
    *   *Tailwind:* `text-[12px] font-medium tracking-[0.15em] text-[#5a5a5a] uppercase mb-2 block`
*   **Hero Title (Display):**
    *   *Tailwind:* `text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] text-[#080808] leading-tight`
*   **Card Headings:**
    *   *Tailwind:* `text-xl md:text-2xl font-medium tracking-tight text-[#080808]`

### 3. Komponen Form & Primitif Input
*   **Text Input Field (`text-input`):**
    *   *Tailwind:* `w-full bg-white text-[#080808] border border-[#d8d8d8] rounded-[4px] px-4 py-3 text-base outline-none focus:border-[#7a3dff] transition-colors`
*   **Primary Button (Black Fill):**
    *   *Tailwind:* `bg-[#080808] hover:bg-[#222222] text-white font-medium text-base py-3 px-6 rounded-[4px] transition-all duration-150 inline-flex items-center justify-center`
*   **Secondary Button (Outline):**
    *   *Tailwind:* `bg-white hover:bg-[#fafafa] text-[#080808] border border-[#d8d8d8] font-medium text-base py-3 px-6 rounded-[4px] transition-all duration-150 inline-flex items-center justify-center`

### 4. Kartu Fungsional (PETA Framework Accents)
Gunakan layout minimalis dengan visualisasi aksen warna di tepi kiri kartu (`border-l-4`) untuk membedakan kategori pilar:

*   **Kanvas Tulisan Tangan (Pengelolaan Stres - Aksen Ungu):**
    *   *Tailwind:* `bg-white border border-[#d8d8d8] rounded-[8px] p-6 md:p-8 hover:shadow-[0_13px_13px_rgba(0,0,0,0.04)] transition-all`
    *   *Canvas Coretan:* Coretan tinta canvas menggunakan warna dasar ungu `#7a3dff`.
*   **Dukungan Sosial / Trusted Circle Setup (Aksen Pink):**
    *   *Tailwind:* `border-l-4 border-[#ed52cb] bg-[#fffafc] rounded-r-[8px] p-6`
*   **Psychoeducation / Literasi Insights (Aksen Biru):**
    *   *Tailwind:* `border-l-4 border-[#3b89ff] bg-[#f9fcff] rounded-r-[8px] p-6`
*   **Sleep & Exercise Logs (Aksen Oranye):**
    *   *Tailwind:* `border-l-4 border-[#ff6b00] bg-[#fffbf9] rounded-r-[8px] p-6`
*   **Akses Bantuan / Smart Routing Map (Aksen Hijau):**
    *   *Tailwind:* `border-l-4 border-[#00d722] bg-[#f9fff9] rounded-r-[8px] p-6`
*   **Crisis Alert Overlay / Pencegahan Risiko (Aksen Merah):**
    *   Overlay modal darurat yang menutupi seluruh layar saat terindikasi kata-kata kritis:
    *   *Tailwind:* `fixed inset-0 z-50 bg-[#ee1d36] text-white flex flex-col items-center justify-center p-8 text-center`

### 5. Aturan Styling Grafik (Recharts)
*   **Handwriting Radar Chart:**
    *   Background container: Transparan.
    *   Grid Stroke: `#d8d8d8`.
    *   Radar Fill: `rgba(122, 61, 255, 0.2)` (Ungu transparan).
    *   Radar Stroke: `#7a3dff` (Ungu solid).
*   **Mood Trend Line Chart:**
    *   Line Stroke: `#3b89ff` (Biru solid, ketebalan `2.5px`).
    *   Line Active Dots: `#080808` (HItam solid).
    *   Reference Line (Baseline emosi normal): `#ababab` (Abu-abu putus-putus).

---

## Do's and Don'ts

### Do
*   Gunakan `#080808` sebagai warna utama untuk teks, judul, dan tombol utama.
*   Pertahankan layout kanvas putih bersih `#ffffff` untuk memelihara ketenangan fokus pengguna.
*   Gunakan aksen warna kromatik (Ungu, Pink, Biru, Oranye, Hijau) secara hemat—hanya pada border kiri kartu, garis grafik, atau coretan tinta.
*   Pertahankan radius sudut tajam 4px (`rounded-[4px]`) untuk tombol/input dan 8px (`rounded-[8px]`) untuk kartu.

### Don't
*   Jangan pernah menggunakan aksen warna kromatik (seperti ungu atau pink) sebagai warna latar belakang penuh untuk tombol utama. Tombol utama harus tetap hitam `#080808`.
*   Jangan pernah menggunakan radius sudut bulat penuh (*pill*) untuk tombol CTA. Tombol InkTrace selalu berbentuk persegi panjang dengan lekukan minimal 4px.
*   Jangan menggunakan font tebal berat 700+; batas atas ketebalan tulisan adalah semibold (600).
