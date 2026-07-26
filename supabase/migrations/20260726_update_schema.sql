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
CREATE POLICY "Users can insert their own journals"
  ON public.journals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own journals"
  ON public.journals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies: kinematic_features
CREATE POLICY "Users can insert their own kinematic features"
  ON public.kinematic_features FOR INSERT
  TO authenticated
  WITH CHECK (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own kinematic features"
  ON public.kinematic_features FOR SELECT
  TO authenticated
  USING (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));

-- RLS Policies: llm_analyses
CREATE POLICY "Users can insert their own llm analyses"
  ON public.llm_analyses FOR INSERT
  TO authenticated
  WITH CHECK (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their own llm analyses"
  ON public.llm_analyses FOR SELECT
  TO authenticated
  USING (journal_id IN (SELECT id FROM public.journals WHERE user_id = auth.uid()));

-- RLS Policies: users
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

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
