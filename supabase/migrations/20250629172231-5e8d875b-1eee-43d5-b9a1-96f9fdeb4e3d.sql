
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create semesters table
CREATE TABLE public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  gpa DECIMAL(3,2) DEFAULT 0,
  total_credits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  grade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create planned_modules table
CREATE TABLE public.planned_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  semester TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_modules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for semesters
CREATE POLICY "Users can view their own semesters" ON public.semesters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own semesters" ON public.semesters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own semesters" ON public.semesters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own semesters" ON public.semesters
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for courses
CREATE POLICY "Users can view their own courses" ON public.courses
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.semesters WHERE id = courses.semester_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own courses" ON public.courses
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.semesters WHERE id = courses.semester_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own courses" ON public.courses
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.semesters WHERE id = courses.semester_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own courses" ON public.courses
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.semesters WHERE id = courses.semester_id AND user_id = auth.uid()
  ));

-- Create RLS policies for planned_modules
CREATE POLICY "Users can view their own planned modules" ON public.planned_modules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own planned modules" ON public.planned_modules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own planned modules" ON public.planned_modules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own planned modules" ON public.planned_modules
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
