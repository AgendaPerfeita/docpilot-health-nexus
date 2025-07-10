-- Teste ultra-simples para INSERT
-- Se isso não funcionar, há algo muito estranho acontecendo

-- 1. Remover política atual
DROP POLICY IF EXISTS "pacientes_insert" ON public.pacientes;

-- 2. Criar política ultra-simples
CREATE POLICY "insert_test" 
ON public.pacientes 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 3. Comentário
COMMENT ON POLICY "insert_test" ON public.pacientes IS 'Política ultra-simples para teste - WITH CHECK (true)'; 