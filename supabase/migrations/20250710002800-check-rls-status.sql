-- Verificar e corrigir o status do RLS na tabela pacientes
-- O problema pode ser que o RLS não está funcionando corretamente

-- 1. Verificar se RLS está habilitado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'pacientes' 
    AND rowsecurity = true
  ) THEN
    RAISE NOTICE 'RLS não está habilitado na tabela pacientes';
  ELSE
    RAISE NOTICE 'RLS está habilitado na tabela pacientes';
  END IF;
END $$;

-- 2. Forçar reabilitação do RLS
ALTER TABLE public.pacientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- 3. Verificar se há políticas conflitantes
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'pacientes';
  
  RAISE NOTICE 'Número de políticas na tabela pacientes: %', policy_count;
END $$;

-- 4. Criar política de teste novamente
DROP POLICY IF EXISTS "test_insert_simple" ON public.pacientes;

CREATE POLICY "test_insert_simple" 
ON public.pacientes 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 5. Comentário
COMMENT ON POLICY "test_insert_simple" ON public.pacientes IS 'Política de teste após reabilitação do RLS'; 