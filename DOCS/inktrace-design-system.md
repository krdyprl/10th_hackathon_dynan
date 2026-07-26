---
name: inktrace-design
description: Design specification for InkTrace AI, a handwriting analysis and wellness tracking application.
metadata:
  type: project
---

# Design Specification: InkTrace AI

## 1. Executive Summary
InkTrace AI is an early self-awareness system designed for Gen Z to track and understand their emotional patterns through longitudinal analysis of handwriting dynamics, sleep history, exercise data, and journal content. It is built as a lightweight, responsive web application using React + Vite, FastAPI, and Supabase.

## 2. Technical Stack
- **Frontend:** React, Vite, Tailwind CSS, `react-sketch-canvas`, `@supabase/supabase-js`, `recharts` (or `chart.js` for RWD charts).
- **Backend:** FastAPI (Python 3.10+), OpenCV/Pillow (Visual analysis), `google-generativeai` (Gemini 3.1 Flash Lite API).
- **Database & Services:** Supabase (Auth, PostgreSQL database, Storage buckets, pgvector).
- **Deployment:** Vercel (Frontend), Railway/Render (Backend).

## 3. Component Architecture & Data Flow
### Frontend Components (React + Vite)
1. **Auth Modules:** Sign Up / Sign In forms using Supabase Auth.
2. **Dashboard:** Responsive layout containing:
   - Handwriting Insights card (Markdown rendering).
   - Handwriting Scores Graph (Recharts Radar or Bar chart).
   - Future Mood Prediction Graph (Recharts Line chart).
   - Mood-Stress Correlation panel.
   - Recommended Micro-Interventions.
3. **Journal Canvas:** An interactive writing area (`react-sketch-canvas`) allowing users to write reflections with mouse/stylus. Logs temporal metadata (timestamp of strokes, erase events, total duration).
4. **Log Form:** Slider for sleep hours and dropdown for exercise status.
5. **Trusted Circle Configuration:** Form to add trusted contacts (Email/Telegram).

### Backend Pipeline (FastAPI)
1. **API Router:** Exposes `/api/analyze` to receive multi-part form data (image upload and Stroke JSON).
2. **Feature Extractor (Visual AI):**
   - Parses the Stroke JSON to compute: `duration`, `stroke_count`, `erase_count`, `writing_speed` (strokes per second), and `pen_lifts`.
   - Uses OpenCV on the uploaded image to calculate geometric features like word spacing and line slant.
3. **OCR Engine:** Sends the handwriting PNG to `gemini-3.1-flash-lite` to convert image handwriting to text.
4. **Language AI & LLM Reflector:**
   - Queries Supabase for the user's historical scores (past 7 to 90 days).
   - Constructs a prompt containing user inputs (sleep, exercise, current mood, visual features, OCR text, and historical trends).
   - Calls Gemini API with a strict system prompt to generate a structured JSON containing:
     - `handwritingInsights` (max 3 sentences, empathetic, constructive)
     - `moodStressCorrelation`
     - `personalizedRecommendations`
     - `summary`
     - `conclusion`
     - `stress_score` (0-100)
     - `mood_score` (0-100)
     - `future_mood_prediction` (4-day integer array)
5. **Privacy Handler:** Immediately deletes the temporary image file from the server after analysis is complete.

## 4. Supabase Database Schema
```sql
-- Profile information
create table public.users (
  id uuid references auth.users not null primary key,
  full_name text not null,
  age integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Daily journal entries
create table public.journals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  no_of_hours_sleep numeric not null,
  exercise_status text not null,
  ocr_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quantitative metrics from handwriting strokes
create table public.visual_features (
  id uuid default gen_random_uuid() primary key,
  journal_id uuid references public.journals(id) on delete cascade not null,
  stroke_count integer not null,
  erase_count integer not null,
  duration_seconds integer not null,
  writing_speed numeric not null,
  pressure_score integer not null,
  slant_score integer not null,
  spacing_score integer not null
);

-- AI insights and scores
create table public.llm_analyses (
  id uuid default gen_random_uuid() primary key,
  journal_id uuid references public.journals(id) on delete cascade not null,
  handwriting_insights text not null,
  mood_stress_correlation text not null,
  recommendations text not null,
  summary text not null,
  conclusion text not null,
  stress_score integer not null,
  mood_score integer not null,
  future_mood_prediction jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trusted Circle contacts for automated notification
create table public.trusted_circles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  contact_name text not null,
  contact_type text not null, -- 'email' or 'telegram'
  contact_value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 5. Security & Privacy Controls
- **Data Protection:** No long-term storage of writing image PNG files. Transcription text stored in PostgreSQL can be encrypted at rest.
- **Row-Level Security (RLS):** All tables in Supabase have RLS enabled, ensuring users can only read and write their own data.
- **Safe LLM Scope:** System prompt forbids Gemini from producing clinical diagnoses or prescribing medications.
