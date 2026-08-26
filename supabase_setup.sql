-- SQL Setup script for Workout Tracker
-- Execute isso no SQL Editor do seu projeto Supabase para configurar as tabelas e políticas de segurança.

-- 1. Tabela de Perfis (Criada automaticamente ou vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    username TEXT UNIQUE,
    full_name TEXT
);

-- Habilitar RLS em profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem criar seu próprio perfil" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 2. Tabela de Fichas de Treino (workout_sheets)
CREATE TABLE IF NOT EXISTS public.workout_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.workout_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias fichas" 
ON public.workout_sheets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias fichas" 
ON public.workout_sheets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias fichas" 
ON public.workout_sheets FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias fichas" 
ON public.workout_sheets FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Tabela de Exercícios (exercises)
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_sheet_id UUID NOT NULL REFERENCES public.workout_sheets(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_sets INTEGER DEFAULT 4,
    target_reps INTEGER DEFAULT 10,
    rest_seconds INTEGER DEFAULT 90,
    youtube_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Garante a coluna em bancos que ja rodaram este script antes de
-- rest_seconds existir (CREATE TABLE IF NOT EXISTS acima nao altera uma
-- tabela existente). Reexecutar este arquivo e seguro nesses casos.
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS rest_seconds INTEGER DEFAULT 90;

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver exercícios de suas fichas" 
ON public.exercises FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.workout_sheets 
        WHERE public.workout_sheets.id = public.exercises.workout_sheet_id 
        AND public.workout_sheets.user_id = auth.uid()
    )
);

CREATE POLICY "Usuários podem inserir exercícios em suas fichas" 
ON public.exercises FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.workout_sheets 
        WHERE public.workout_sheets.id = public.exercises.workout_sheet_id 
        AND public.workout_sheets.user_id = auth.uid()
    )
);

CREATE POLICY "Usuários podem atualizar exercícios de suas fichas" 
ON public.exercises FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.workout_sheets 
        WHERE public.workout_sheets.id = public.exercises.workout_sheet_id 
        AND public.workout_sheets.user_id = auth.uid()
    )
);

CREATE POLICY "Usuários podem deletar exercícios de suas fichas" 
ON public.exercises FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.workout_sheets 
        WHERE public.workout_sheets.id = public.exercises.workout_sheet_id 
        AND public.workout_sheets.user_id = auth.uid()
    )
);

-- 4. Tabela de Histórico de Treino (workout_logs)
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workout_sheet_id UUID REFERENCES public.workout_sheets(id) ON DELETE SET NULL,
    workout_sheet_name TEXT NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    duration_seconds INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu histórico de treinos" 
ON public.workout_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem salvar histórico de treinos" 
ON public.workout_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seu histórico de treinos" 
ON public.workout_logs FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Tabela de Logs de Séries Realizadas (set_logs)
CREATE TABLE IF NOT EXISTS public.set_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_log_id UUID NOT NULL REFERENCES public.workout_logs(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
    set_number INTEGER NOT NULL,
    weight NUMERIC NOT NULL DEFAULT 0,
    reps INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT true
);

ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver registros de séries" 
ON public.set_logs FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.workout_logs 
        WHERE public.workout_logs.id = public.set_logs.workout_log_id 
        AND public.workout_logs.user_id = auth.uid()
    )
);

CREATE POLICY "Usuários podem inserir registros de séries" 
ON public.set_logs FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.workout_logs 
        WHERE public.workout_logs.id = public.set_logs.workout_log_id 
        AND public.workout_logs.user_id = auth.uid()
    )
);

-- Trigger para criar perfil de usuário ao fazer cadastro no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, username)
    VALUES (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', new.email),
        split_part(new.email, '@', 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
