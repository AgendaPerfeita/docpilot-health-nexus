-- Teste ultra-simples para confirmar se o problema é com as políticas
-- Se isso não funcionar, o problema é mais fundamental

-- 1. Remover todas as políticas de INSERT
DROP POLICY IF EXISTS "allow_professionals_insert_patients" ON public.pacientes;
DROP POLICY IF EXISTS "insert_pacientes_rpc" ON public.pacientes;

-- 2. Criar política ultra-simples
CREATE POLICY "test_insert_simple" 
ON public.pacientes 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 3. Comentário
COMMENT ON POLICY "test_insert_simple" ON public.pacientes IS 'Política ultra-simples para teste - permite qualquer INSERT de usuário autenticado'; 