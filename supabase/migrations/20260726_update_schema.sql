-- Up Migration
CREATE TABLE IF NOT EXISTS public.users (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  age integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT null
);

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
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies: journals
DROP POLICY IF EXISTS "Users can insert their own journals" ON public.journals;
CREATE POLICY "Users can insert their own journals"
  ON public.journals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own journals" ON public.journals;
CREATE POLICY "Users can view their own journals"
  ON public.journals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies: kinematic_features
DROP POLICY IF EXISTS "Users can insert their own kinematic features" ON public.kinematic_features;
CREATE POLICY "Users can insert their own kinematic features"
  ON public.kinematic_features FOR INSERT
  TO authenticated
  WITH CHECK (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own kinematic features" ON public.kinematic_features;
CREATE POLICY "Users can view their own kinematic features"
  ON public.kinematic_features FOR SELECT
  TO authenticated
  USING (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));

-- RLS Policies: llm_analyses
DROP POLICY IF EXISTS "Users can insert their own llm analyses" ON public.llm_analyses;
CREATE POLICY "Users can insert their own llm analyses"
  ON public.llm_analyses FOR INSERT
  TO authenticated
  WITH CHECK (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view their own llm analyses" ON public.llm_analyses;
CREATE POLICY "Users can view their own llm analyses"
  ON public.llm_analyses FOR SELECT
  TO authenticated
  USING (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));

-- RLS Policies: users
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function: auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, age)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    (NEW.raw_user_meta_data ->> 'age')::integer
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Mood logs (daily check-in from welcome page)
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
  note text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own mood logs" ON public.mood_logs;
CREATE POLICY "Users can insert their own mood logs"
  ON public.mood_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own mood logs" ON public.mood_logs;
CREATE POLICY "Users can view their own mood logs"
  ON public.mood_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Habit logs (sleep + exercise daily)
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date date DEFAULT CURRENT_DATE NOT NULL,
  sleep_hours numeric CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  exercise_status text CHECK (exercise_status IN ('yes', 'no', 'skipped')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, log_date)
);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can insert their own habit logs"
  ON public.habit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can view their own habit logs"
  ON public.habit_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own habit logs" ON public.habit_logs;
CREATE POLICY "Users can update their own habit logs"
  ON public.habit_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trusted circles (social support contacts)
CREATE TABLE IF NOT EXISTS public.trusted_circles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_name text NOT NULL,
  contact_type text NOT NULL CHECK (contact_type IN ('email', 'whatsapp')),
  contact_value text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.trusted_circles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own trusted circles" ON public.trusted_circles;
CREATE POLICY "Users can manage their own trusted circles"
  ON public.trusted_circles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
