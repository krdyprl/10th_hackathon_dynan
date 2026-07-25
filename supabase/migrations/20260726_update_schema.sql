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
