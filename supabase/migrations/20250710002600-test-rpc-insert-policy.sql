-- Testar política de INSERT usando função RPC
-- Isso pode resolver problemas de contexto de autenticação

-- 1. Criar função para verificar se usuário pode inserir
CREATE OR REPLACE FUNCTION can_insert_paciente()
RETURNS boolean
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND p.tipo = ANY (ARRAY['medico'::user_type, 'clinica'::user_type, 'staff'::user_type])
    AND p.ativo = true
  );
$$;

-- 2. Remover política atual
DROP POLICY IF EXISTS "allow_professionals_insert_patients" ON public.pacientes;

-- 3. Criar nova política usando a função RPC
CREATE POLICY "insert_pacientes_rpc" 
ON public.pacientes 
FOR INSERT 
TO authenticated 
WITH CHECK (can_insert_paciente());

-- 4. Comentários
COMMENT ON FUNCTION can_insert_paciente() IS 'Função para verificar se usuário pode inserir pacientes';
COMMENT ON POLICY "insert_pacientes_rpc" ON public.pacientes IS 'Política de INSERT usando função RPC'; 