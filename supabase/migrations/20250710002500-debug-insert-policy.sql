-- Função para debugar a política de INSERT
CREATE OR REPLACE FUNCTION debug_insert_policy()
RETURNS TABLE (
  auth_uid uuid,
  profile_exists boolean,
  profile_tipo text,
  profile_ativo boolean,
  tipo_allowed boolean,
  insert_allowed boolean,
  policy_condition_result boolean
) 
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() as auth_uid,
    EXISTS(SELECT 1 FROM profiles WHERE user_id = auth.uid()) as profile_exists,
    (SELECT tipo::text FROM profiles WHERE user_id = auth.uid()) as profile_tipo,
    (SELECT ativo FROM profiles WHERE user_id = auth.uid()) as profile_ativo,
    (SELECT tipo = ANY (ARRAY['medico'::user_type, 'clinica'::user_type, 'staff'::user_type]) FROM profiles WHERE user_id = auth.uid()) as tipo_allowed,
    (SELECT ativo = true FROM profiles WHERE user_id = auth.uid()) as insert_allowed,
    -- Esta é exatamente a condição da política de INSERT
    (EXISTS (SELECT 1 FROM profiles p WHERE ((p.user_id = auth.uid()) AND (p.tipo = ANY (ARRAY['medico'::user_type, 'clinica'::user_type, 'staff'::user_type])) AND (p.ativo = true)))) as policy_condition_result;
$$;

-- Comentário
COMMENT ON FUNCTION debug_insert_policy() IS 'Função para debugar a política de INSERT da tabela pacientes'; 