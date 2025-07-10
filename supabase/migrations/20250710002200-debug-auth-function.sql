-- Função de debug para verificar o contexto de autenticação
-- Útil para diagnosticar problemas com RLS policies

CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS TABLE (
  current_user_id uuid,
  profile_exists boolean,
  profile_tipo text,
  profile_ativo boolean,
  profile_id uuid,
  profile_nome text
) 
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() as current_user_id,
    EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid()) as profile_exists,
    (SELECT tipo::text FROM profiles WHERE user_id = auth.uid()) as profile_tipo,
    (SELECT ativo FROM profiles WHERE user_id = auth.uid()) as profile_ativo,
    (SELECT id FROM profiles WHERE user_id = auth.uid()) as profile_id,
    (SELECT nome FROM profiles WHERE user_id = auth.uid()) as profile_nome;
$$;

-- Função para testar se um usuário pode acessar um paciente específico
CREATE OR REPLACE FUNCTION debug_paciente_access(paciente_id_param uuid)
RETURNS TABLE (
  can_access boolean,
  reason text,
  via_medico boolean,
  via_clinica boolean,
  via_clinica_medico boolean
) 
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT 
    -- Pode acessar se qualquer uma das condições for verdadeira
    (EXISTS (
      SELECT 1 FROM public.paciente_medico pm
      JOIN public.profiles p ON p.id = pm.medico_id
      WHERE pm.paciente_id = paciente_id_param AND p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.paciente_clinica pc
      JOIN public.profiles p ON p.id = pc.clinica_id
      WHERE pc.paciente_id = paciente_id_param AND p.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.paciente_clinica pc
      JOIN public.clinica_medicos cm ON pc.clinica_id = cm.clinica_id
      JOIN public.profiles p ON p.id = cm.medico_id
      WHERE pc.paciente_id = paciente_id_param AND p.user_id = auth.uid() AND cm.ativo = true
    )) as can_access,
    
    -- Razão do acesso
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM public.paciente_medico pm
        JOIN public.profiles p ON p.id = pm.medico_id
        WHERE pm.paciente_id = paciente_id_param AND p.user_id = auth.uid()
      ) THEN 'Acesso via paciente_medico'
      WHEN EXISTS (
        SELECT 1 FROM public.paciente_clinica pc
        JOIN public.profiles p ON p.id = pc.clinica_id
        WHERE pc.paciente_id = paciente_id_param AND p.user_id = auth.uid()
      ) THEN 'Acesso via paciente_clinica'
      WHEN EXISTS (
        SELECT 1 FROM public.paciente_clinica pc
        JOIN public.clinica_medicos cm ON pc.clinica_id = cm.clinica_id
        JOIN public.profiles p ON p.id = cm.medico_id
        WHERE pc.paciente_id = paciente_id_param AND p.user_id = auth.uid() AND cm.ativo = true
      ) THEN 'Acesso via clinica_medicos'
      ELSE 'Sem acesso'
    END as reason,
    
    -- Detalhes dos vínculos
    EXISTS (
      SELECT 1 FROM public.paciente_medico pm
      JOIN public.profiles p ON p.id = pm.medico_id
      WHERE pm.paciente_id = paciente_id_param AND p.user_id = auth.uid()
    ) as via_medico,
    
    EXISTS (
      SELECT 1 FROM public.paciente_clinica pc
      JOIN public.profiles p ON p.id = pc.clinica_id
      WHERE pc.paciente_id = paciente_id_param AND p.user_id = auth.uid()
    ) as via_clinica,
    
    EXISTS (
      SELECT 1 FROM public.paciente_clinica pc
      JOIN public.clinica_medicos cm ON pc.clinica_id = cm.clinica_id
      JOIN public.profiles p ON p.id = cm.medico_id
      WHERE pc.paciente_id = paciente_id_param AND p.user_id = auth.uid() AND cm.ativo = true
    ) as via_clinica_medico;
$$;

-- Função para listar todas as políticas da tabela pacientes
CREATE OR REPLACE FUNCTION debug_pacientes_policies()
RETURNS TABLE (
  policy_name text,
  policy_cmd text,
  policy_roles text[],
  policy_qual text,
  policy_with_check text
) 
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT 
    policyname::text,
    cmd::text,
    roles,
    qual,
    with_check
  FROM pg_policies 
  WHERE tablename = 'pacientes' AND schemaname = 'public'
  ORDER BY policyname;
$$;

-- Comentários para documentação
COMMENT ON FUNCTION debug_auth_context() IS 'Função para debugar o contexto de autenticação atual';
COMMENT ON FUNCTION debug_paciente_access(uuid) IS 'Função para testar se um usuário pode acessar um paciente específico';
COMMENT ON FUNCTION debug_pacientes_policies() IS 'Função para listar todas as políticas RLS da tabela pacientes'; 