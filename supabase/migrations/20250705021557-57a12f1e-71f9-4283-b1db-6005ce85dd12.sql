-- Criar tabela para gerenciar convites de médicos
CREATE TABLE public.convites_medicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  especialidade TEXT,
  crm TEXT,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, aceito, expirado
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT convites_medicos_clinica_id_fkey FOREIGN KEY (clinica_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- RLS para convites_medicos
ALTER TABLE public.convites_medicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clínicas podem gerenciar seus convites"
ON public.convites_medicos
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.id = convites_medicos.clinica_id
));

-- Adicionar trigger para updated_at em convites_medicos
CREATE TRIGGER update_convites_medicos_updated_at
BEFORE UPDATE ON public.convites_medicos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar campo clinica_id nas consultas se não existir (já existe)
-- Modificar RLS das consultas para considerar múltiplas clínicas por médico
DROP POLICY IF EXISTS "Médicos podem gerenciar suas consultas" ON public.consultas;
DROP POLICY IF EXISTS "Médicos podem ver suas consultas" ON public.consultas;

CREATE POLICY "Médicos podem gerenciar suas consultas"
ON public.consultas
FOR ALL
USING (
  -- Médico é o responsável direto pela consulta
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = consultas.medico_id
  ) 
  OR 
  -- Médico está vinculado à clínica da consulta
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN clinica_medicos cm ON p.id = cm.medico_id
    WHERE p.user_id = auth.uid() 
    AND cm.clinica_id = consultas.clinica_id 
    AND cm.ativo = true
  )
);

-- Modificar RLS dos pacientes para considerar múltiplas clínicas por médico
DROP POLICY IF EXISTS "Médicos/Clínicas podem gerenciar seus pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Médicos/Clínicas podem ver seus pacientes" ON public.pacientes;

CREATE POLICY "Médicos/Clínicas podem gerenciar seus pacientes"
ON public.pacientes
FOR ALL
USING (
  -- Clínica/Médico é o responsável direto
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = pacientes.responsavel_id
  ) 
  OR 
  -- Médico está vinculado à clínica responsável
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN clinica_medicos cm ON p.id = cm.medico_id
    WHERE p.user_id = auth.uid() 
    AND cm.clinica_id = pacientes.responsavel_id 
    AND cm.ativo = true
  )
);

-- Índices para otimizar consultas multi-clínica
CREATE INDEX IF NOT EXISTS idx_consultas_clinica_data ON public.consultas(clinica_id, data_consulta);
CREATE INDEX IF NOT EXISTS idx_clinica_medicos_medico_ativo ON public.clinica_medicos(medico_id, ativo) WHERE ativo = true;