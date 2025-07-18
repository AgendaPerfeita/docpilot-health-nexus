-- Migration: Create plantonista tables for emergency room doctors
-- Description: Separate tables for plantonista (emergency room doctors) to avoid conflicts with clinic/doctor data
-- Date: 2025
-- Create plantonista_sessoes table
CREATE TABLE plantonista_sessoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medico_id UUID REFERENCES auth.users(id) NOT NULL,
  local_trabalho TEXT NOT NULL,
  turno TEXT NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_fim TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plantonista_atendimentos table
CREATE TABLE plantonista_atendimentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sessao_id UUID REFERENCES plantonista_sessoes(id) NOT NULL,
  medico_id UUID REFERENCES auth.users(id) NOT NULL,
  paciente_nome TEXT,
  paciente_idade INTEGER,
  paciente_sexo TEXT,
  queixa_principal TEXT,
  descricao TEXT,
  anamnese JSONB,
  conduta_inicial JSONB,
  reavaliacao_agendada TEXT,
  evolucao TEXT,
  resultados_exames JSONB,
  sinais_vitais JSONB,
  conduta_final TEXT,
  diagnostico_final TEXT,
  status TEXT DEFAULT 'primeiro_atendimento',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE plantonista_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantonista_atendimentos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for plantonista_sessoes
CREATE POLICY "Médico vê apenas suas sessões" ON plantonista_sessoes
  FOR ALL USING (medico_id = auth.uid());

-- Create RLS policies for plantonista_atendimentos
CREATE POLICY "Médico vê apenas seus atendimentos" ON plantonista_atendimentos
  FOR ALL USING (medico_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_plantonista_sessoes_medico ON plantonista_sessoes(medico_id);
CREATE INDEX idx_plantonista_atendimentos_sessao ON plantonista_atendimentos(sessao_id);
CREATE INDEX idx_plantonista_atendimentos_medico ON plantonista_atendimentos(medico_id); 