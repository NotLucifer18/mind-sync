-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users / Profiles
-- Use IF NOT EXISTS to prevent error, then ensure policy drops
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('patient', 'caretaker', 'doctor')),
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for Profiles (Drop before create to be safe)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Mood Logs
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 0 AND mood_score <= 100),
  sleep_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mood logs" ON public.mood_logs;
CREATE POLICY "Users can view their own mood logs" 
ON public.mood_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own mood logs" ON public.mood_logs;
CREATE POLICY "Users can insert their own mood logs" 
ON public.mood_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Journal Entries
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_voice BOOLEAN DEFAULT FALSE,
  sentiment_score FLOAT, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can view their own journal entries" 
ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own journal entries" ON public.journal_entries;
CREATE POLICY "Users can insert their own journal entries" 
ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Patient Access
CREATE TABLE IF NOT EXISTS public.patient_access (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(patient_id, provider_id)
);

-- Add column if missing (for migrations)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patient_access' AND column_name = 'status') THEN
        ALTER TABLE public.patient_access ADD COLUMN status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending';
    END IF;
END $$;

ALTER TABLE public.patient_access ENABLE ROW LEVEL SECURITY;

-- Policies for Linked Access
DROP POLICY IF EXISTS "Providers can view patient moods" ON public.mood_logs;
CREATE POLICY "Providers can view patient moods"
ON public.mood_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_access 
    WHERE patient_id = mood_logs.user_id 
    AND provider_id = auth.uid()
    AND status = 'approved' -- Ensure approved only
  )
);

DROP POLICY IF EXISTS "Providers can view patient journals" ON public.journal_entries;
CREATE POLICY "Providers can view patient journals"
ON public.journal_entries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patient_access 
    WHERE patient_id = journal_entries.user_id 
    AND provider_id = auth.uid()
    AND status = 'approved'
  )
);

-- Allow reading access links involved in
DROP POLICY IF EXISTS "Users can view their access links" ON public.patient_access;
CREATE POLICY "Users can view their access links"
ON public.patient_access FOR SELECT
USING (auth.uid() = patient_id OR auth.uid() = provider_id);

-- Allow creating access links
DROP POLICY IF EXISTS "Providers can request access" ON public.patient_access;
CREATE POLICY "Providers can request access"
ON public.patient_access FOR INSERT
WITH CHECK (auth.uid() = provider_id);

-- Allow updating access links (approving)
DROP POLICY IF EXISTS "Patients can approve access" ON public.patient_access;
CREATE POLICY "Patients can approve access"
ON public.patient_access FOR UPDATE
USING (auth.uid() = patient_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
