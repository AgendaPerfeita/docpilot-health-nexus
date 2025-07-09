-- Final migration to remove responsavel_id field and clean up pacientes table structure

-- 1. Ensure responsavel_id column is removed
ALTER TABLE public.pacientes DROP COLUMN IF EXISTS responsavel_id;

-- 2. Ensure clinica_id column is removed (should use paciente_clinica table instead)
ALTER TABLE public.pacientes DROP COLUMN IF EXISTS clinica_id;

-- 3. Make sure the table structure is clean for the new linking model
-- The pacientes table should only contain patient data, not relationship data

-- 4. Add any missing columns that might be needed
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id);

-- 5. Create index for profile_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_pacientes_profile_id ON public.pacientes(profile_id);

-- 6. Ensure all the linking tables exist and have proper RLS
-- (These should already exist from previous migrations)

-- 7. Verify the table structure is correct
-- pacientes table should now only contain:
-- - id, nome, email, telefone, cpf, data_nascimento, endereco, bairro, cidade, estado, cep
-- - convenio, numero_convenio, origem, antecedentes_*, medicamentos_em_uso
-- - ticket_medio, total_consultas, total_gasto, profile_id (optional)
-- - created_at, updated_at 