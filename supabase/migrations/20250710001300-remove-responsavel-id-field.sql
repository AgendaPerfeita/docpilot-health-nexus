-- Remover definitivamente o campo responsavel_id da tabela pacientes
-- Este campo não é mais necessário no modelo multi-clínica/multi-médico

-- 1. Verificar se o campo existe e removê-lo
DO $$ 
BEGIN
    -- Verificar se a coluna responsavel_id existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pacientes' 
        AND column_name = 'responsavel_id'
        AND table_schema = 'public'
    ) THEN
        -- Remover a coluna se existir
        ALTER TABLE public.pacientes DROP COLUMN responsavel_id;
        RAISE NOTICE 'Coluna responsavel_id removida da tabela pacientes';
    ELSE
        RAISE NOTICE 'Coluna responsavel_id não existe na tabela pacientes';
    END IF;
END $$;

-- 2. Verificar se o campo clinica_id existe e removê-lo também (se não foi removido antes)
DO $$ 
BEGIN
    -- Verificar se a coluna clinica_id existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pacientes' 
        AND column_name = 'clinica_id'
        AND table_schema = 'public'
    ) THEN
        -- Remover a coluna se existir
        ALTER TABLE public.pacientes DROP COLUMN clinica_id;
        RAISE NOTICE 'Coluna clinica_id removida da tabela pacientes';
    ELSE
        RAISE NOTICE 'Coluna clinica_id não existe na tabela pacientes';
    END IF;
END $$;

-- 3. Verificar se o campo profile_id existe e removê-lo também (se não for necessário)
DO $$ 
BEGIN
    -- Verificar se a coluna profile_id existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pacientes' 
        AND column_name = 'profile_id'
        AND table_schema = 'public'
    ) THEN
        -- Remover a coluna se existir
        ALTER TABLE public.pacientes DROP COLUMN profile_id;
        RAISE NOTICE 'Coluna profile_id removida da tabela pacientes';
    ELSE
        RAISE NOTICE 'Coluna profile_id não existe na tabela pacientes';
    END IF;
END $$; 