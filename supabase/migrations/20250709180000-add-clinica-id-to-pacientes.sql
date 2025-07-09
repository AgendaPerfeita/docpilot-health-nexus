-- Adiciona o campo clinica_id na tabela pacientes
ALTER TABLE public.pacientes
ADD COLUMN clinica_id uuid REFERENCES public.profiles(id);

-- Índice para busca rápida por clínica
CREATE INDEX IF NOT EXISTS idx_pacientes_clinica_id ON public.pacientes(clinica_id); 