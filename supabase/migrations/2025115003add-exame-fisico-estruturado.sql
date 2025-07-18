-- Migration: Add exame_fisico_estruturado field to plantonista_atendimentos
-- Description: Add structured physical exam field for better AI analysis
-- Date: 2025

-- Add exame_fisico_estruturado column to plantonista_atendimentos table
ALTER TABLE plantonista_atendimentos 
ADD COLUMN exame_fisico_estruturado TEXT;

-- Add comment to document the field
COMMENT ON COLUMN plantonista_atendimentos.exame_fisico_estruturado IS 'Exame físico estruturado em formato texto livre para análise da IA'; 