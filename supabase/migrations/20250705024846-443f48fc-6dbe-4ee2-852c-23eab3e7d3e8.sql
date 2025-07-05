-- Adicionar campos de plano aos médicos
ALTER TABLE public.profiles 
ADD COLUMN plano_medico TEXT DEFAULT 'free' CHECK (plano_medico IN ('free', 'premium')),
ADD COLUMN permite_atendimento_individual BOOLEAN DEFAULT false,
ADD COLUMN permite_ia BOOLEAN DEFAULT false,
ADD COLUMN permite_relatorios_avancados BOOLEAN DEFAULT false;

-- Criar função para verificar permissões do médico
CREATE OR REPLACE FUNCTION public.medico_tem_permissao(medico_id UUID, permissao TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    CASE 
      WHEN permissao = 'atendimento_individual' THEN permite_atendimento_individual
      WHEN permissao = 'ia' THEN permite_ia  
      WHEN permissao = 'relatorios_avancados' THEN permite_relatorios_avancados
      ELSE false
    END
  FROM public.profiles 
  WHERE id = medico_id AND tipo = 'medico';
$$;

-- Atualizar política de consultas para médicos free só verem consultas via clínica
DROP POLICY IF EXISTS "Médicos podem gerenciar suas consultas" ON public.consultas;

CREATE POLICY "Médicos podem gerenciar suas consultas" ON public.consultas
FOR ALL USING (
  -- Médico direto (para consultas individuais - só premium)
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND id = consultas.medico_id 
    AND plano_medico = 'premium'
  ))
  OR
  -- Médico via clínica (free e premium)
  (EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN clinica_medicos cm ON p.id = cm.medico_id
    WHERE p.user_id = auth.uid() 
    AND cm.clinica_id = consultas.clinica_id 
    AND cm.ativo = true
  ))
);

-- Política para pacientes - médicos free só veem pacientes via clínica
DROP POLICY IF EXISTS "Médicos/Clínicas podem gerenciar seus pacientes" ON public.pacientes;

CREATE POLICY "Médicos/Clínicas podem gerenciar seus pacientes" ON public.pacientes
FOR ALL USING (
  -- Clínica dona do paciente
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND id = pacientes.responsavel_id
  ))
  OR
  -- Médico premium com pacientes próprios
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND id = pacientes.responsavel_id 
    AND tipo = 'medico' 
    AND plano_medico = 'premium'
  ))
  OR
  -- Médico (free/premium) via clínica
  (EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN clinica_medicos cm ON p.id = cm.medico_id
    WHERE p.user_id = auth.uid() 
    AND cm.clinica_id = pacientes.responsavel_id 
    AND cm.ativo = true
  ))
);