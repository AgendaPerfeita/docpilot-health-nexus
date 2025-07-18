-- Migration: Drop plantonista tables
-- Description: Remove plantonista tables to start fresh
-- Date: 2025
-- Drop tables in correct order (due to foreign key constraints)
DROP TABLE IF EXISTS plantonista_atendimentos CASCADE;
DROP TABLE IF EXISTS plantonista_sessoes CASCADE; 