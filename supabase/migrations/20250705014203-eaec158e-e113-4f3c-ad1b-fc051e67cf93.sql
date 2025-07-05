-- Limpar dados existentes para permitir a migração
DELETE FROM public.profiles;

-- Tornar o campo documento obrigatório (não pode ser nulo)
ALTER TABLE public.profiles ALTER COLUMN documento SET NOT NULL;