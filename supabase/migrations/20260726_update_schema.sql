-- =============================================================
-- InkTrace AI — Full Schema Migration
-- Jalankan seluruh file ini di Supabase SQL Editor (Run All)
-- Aman dijalankan berulang (idempotent: IF NOT EXISTS / OR REPLACE)
-- =============================================================

-- ─────────────────────────────────────────
-- TABEL: users
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id         uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name  text,
  age        integer,
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile saat user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, age)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'age')::integer
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────
-- TABEL: journals
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.journals (
  id                uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  no_of_hours_sleep numeric NOT NULL,
  exercise_status   text    NOT NULL,
  ocr_text          text,
  created_at        timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own journals" ON public.journals;
CREATE POLICY "Users can insert their own journals"
  ON public.journals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own journals" ON public.journals;
CREATE POLICY "Users can view their own journals"
  ON public.journals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────
-- TABEL: kinematic_features
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kinematic_features (
  id                   uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id           uuid    REFERENCES public.journals(id) ON DELETE CASCADE NOT NULL,
  stroke_count         integer NOT NULL,
  erase_count          integer NOT NULL,
  duration_seconds     integer NOT NULL,
  average_velocity     numeric NOT NULL,
  average_acceleration numeric NOT NULL,
  jerk_score           numeric NOT NULL,
  pen_lifts            integer NOT NULL,
  created_at           timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.kinematic_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own kinematic features" ON public.kinematic_features;
CREATE POLICY "Users can insert their own kinematic features"
  ON public.kinematic_features FOR INSERT TO authenticated
  WITH CHECK (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own kinematic features" ON public.kinematic_features;
CREATE POLICY "Users can view their own kinematic features"
  ON public.kinematic_features FOR SELECT TO authenticated
  USING (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));


-- ─────────────────────────────────────────
-- TABEL: llm_analyses
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.llm_analyses (
  id                    uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id            uuid    REFERENCES public.journals(id) ON DELETE CASCADE NOT NULL,
  sentiment_label       text    NOT NULL,
  sentiment_score       integer NOT NULL,
  handwriting_insights  text    NOT NULL,
  mood_stress_correlation text  NOT NULL,
  recommendations       text    NOT NULL,
  stress_score          integer NOT NULL,
  mood_score            integer NOT NULL,
  future_mood_prediction jsonb  NOT NULL,
  created_at            timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.llm_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own llm analyses" ON public.llm_analyses;
CREATE POLICY "Users can insert their own llm analyses"
  ON public.llm_analyses FOR INSERT TO authenticated
  WITH CHECK (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own llm analyses" ON public.llm_analyses;
CREATE POLICY "Users can view their own llm analyses"
  ON public.llm_analyses FOR SELECT TO authenticated
  USING (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));


-- ─────────────────────────────────────────
-- TABEL: mood_logs
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id         uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  note       text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own mood logs" ON public.mood_logs;
CREATE POLICY "Users can insert their own mood logs"
  ON public.mood_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own mood logs" ON public.mood_logs;
CREATE POLICY "Users can view their own mood logs"
  ON public.mood_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);


-- ─────────────────────────────────────────
-- TABEL: habit_logs
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id              uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date        date    DEFAULT CURRENT_DATE NOT NULL,
  sleep_hours     numeric CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  exercise_status text,   -- nilai bebas: 'no','lari','jalan','berenang','custom','skipped'
  water_glasses   integer DEFAULT 0,
  sleep_note      text    DEFAULT '',
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, log_date)
);

-- Hapus constraint lama jika tabel sudah ada sebelum migrasi ini
ALTER TABLE public.habit_logs DROP CONSTRAINT IF EXISTS habit_logs_exercise_status_check;

-- Tambah kolom baru jika belum ada (aman dijalankan ulang)
ALTER TABLE public.habit_logs ADD COLUMN IF NOT EXISTS water_glasses integer DEFAULT 0;
ALTER TABLE public.habit_logs ADD COLUMN IF NOT EXISTS sleep_note    text    DEFAULT '';

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can insert their own habit logs"
  ON public.habit_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can view their own habit logs"
  ON public.habit_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can update their own habit logs"
  ON public.habit_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────
-- TABEL: trusted_circles
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trusted_circles (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_name  text NOT NULL,
  contact_type  text NOT NULL CHECK (contact_type IN ('email', 'whatsapp')),
  contact_value text NOT NULL,
  created_at    timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.trusted_circles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own trusted circles" ON public.trusted_circles;
CREATE POLICY "Users can manage their own trusted circles"
  ON public.trusted_circles FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
