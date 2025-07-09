-- Migration: Estrutura de staff em profiles (após enum)

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clinica_id UUID REFERENCES public.profiles(id);

COMMENT ON COLUMN public.profiles.clinica_id IS 'Vínculo do staff à clínica. Só deve ser preenchido para profiles do tipo staff.';

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover policy antiga problemática (se existir)
DROP POLICY IF EXISTS "Staff pode ver seu próprio profile" ON public.profiles;

-- Staff pode ver o próprio profile
CREATE POLICY "Staff pode ver seu próprio profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff pode atualizar seu próprio profile" ON public.profiles;
CREATE POLICY "Staff pode atualizar seu próprio profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff pode inserir seu próprio profile" ON public.profiles;
CREATE POLICY "Staff pode inserir seu próprio profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id); 