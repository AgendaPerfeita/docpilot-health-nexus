-- MULTICLÍNICA/MULTI-MÉDICO: Tabelas de vínculo e novas policies

-- 1. Criar tabela de vínculo paciente_clinica
CREATE TABLE public.paciente_clinica (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  clinica_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status varchar DEFAULT 'ativo',
  data_vinculo timestamptz DEFAULT now(),
  UNIQUE (paciente_id, clinica_id)
);

-- 2. Criar tabela de vínculo paciente_medico
CREATE TABLE public.paciente_medico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  medico_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  clinica_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status varchar DEFAULT 'em acompanhamento',
  data_vinculo timestamptz DEFAULT now(),
  UNIQUE (paciente_id, medico_id, clinica_id)
);

-- 3. Remover policies antigas de pacientes
DROP POLICY IF EXISTS "Médicos/Clínicas podem gerenciar seus pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Médicos/Clínicas podem ver seus pacientes" ON public.pacientes;

-- 4. Criar novas policies para pacientes
-- Médicos e staff só podem ver pacientes vinculados a eles via paciente_clinica OU paciente_medico
CREATE POLICY "Profissionais podem ver pacientes de suas clínicas" ON public.pacientes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
      AND (
        -- Médico ou staff autenticado
        (p.user_id = auth.uid() AND (p.tipo = 'medico' OR p.tipo = 'staff'))
      )
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Profissionais podem gerenciar pacientes de suas clínicas" ON public.pacientes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
      AND (
        p.user_id = auth.uid() AND (p.tipo = 'medico' OR p.tipo = 'staff')
      )
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
);

-- 5. (Opcional) Comentar/remover campos antigos (NÃO apaga dados ainda)
-- ALTER TABLE public.pacientes DROP COLUMN IF EXISTS responsavel_id;
-- ALTER TABLE public.pacientes DROP COLUMN IF EXISTS clinica_id;
-- (Sugestão: manter por enquanto para migração de dados/legado)

-- 6. Habilitar RLS nas tabelas de vínculo
ALTER TABLE public.paciente_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paciente_medico ENABLE ROW LEVEL SECURITY;

-- 7. Policies para tabelas de vínculo
CREATE POLICY "Profissionais só veem vínculos de suas clínicas" ON public.paciente_clinica
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_clinica.clinica_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Profissionais só veem vínculos de seus pacientes" ON public.paciente_medico
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.medico_id AND p.user_id = auth.uid()
  )
);

-- 8. Comentários para revisão
-- Revise as queries do frontend/backend para usar as tabelas de vínculo.
-- Revise as policies de consultas/prontuários para garantir segmentação por clínica. 