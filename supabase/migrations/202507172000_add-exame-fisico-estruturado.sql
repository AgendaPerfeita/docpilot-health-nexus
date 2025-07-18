-- Migration: Adicionar campo exame_fisico_estruturado na tabela plantonista_atendimentos
-- Data: 2025-07-17

ALTER TABLE plantonista_atendimentos
  ADD COLUMN IF NOT EXISTS exame_fisico_estruturado TEXT;

COMMENT ON COLUMN plantonista_atendimentos.exame_fisico_estruturado IS 'Exame físico estruturado em formato texto livre para análise da IA'; 