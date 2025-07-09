-- Adiciona campo profile_id em pacientes para vínculo explícito com profiles
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_pacientes_profile_id ON public.pacientes(profile_id);

-- No futuro, ao cadastrar um paciente autenticado, preencha esse campo para garantir vínculo seguro.
-- As policies podem ser atualizadas para usar profile_id em vez de CPF quando o vínculo for implementado. 