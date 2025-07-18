-- Migration: Atualizar estrutura de plantonista_atendimentos para novos campos clínicos
-- Data: 2025-07-17

-- Remover campo antigo de exame físico
ALTER TABLE plantonista_atendimentos
  DROP COLUMN IF EXISTS exame_fisico;

-- Adicionar campos clínicos novos
ALTER TABLE plantonista_atendimentos
  ADD COLUMN IF NOT EXISTS medicamentos_uso TEXT,
  ADD COLUMN IF NOT EXISTS alergias TEXT,
  ADD COLUMN IF NOT EXISTS comorbidades TEXT,
  ADD COLUMN IF NOT EXISTS habitos TEXT;

-- Atualizar comentário do sinais_vitais para documentar HGT
COMMENT ON COLUMN plantonista_atendimentos.sinais_vitais IS 'JSONB com sinais vitais: pa_sistolica, pa_diastolica, fc, fr, temp, sat_o2, peso, altura, hgt'; 