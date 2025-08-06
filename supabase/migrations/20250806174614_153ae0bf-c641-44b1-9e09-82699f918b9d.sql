-- Fix functions with proper enum handling for profiles.tipo
CREATE OR REPLACE FUNCTION public.debug_insert_policy()
RETURNS TABLE(auth_uid uuid, profile_exists boolean, profile_tipo text, profile_ativo boolean, tipo_allowed boolean, insert_allowed boolean, policy_condition_result boolean)
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT 
    auth.uid() as auth_uid,
    EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid()) as profile_exists,
    (SELECT tipo::text FROM public.profiles WHERE user_id = auth.uid()) as profile_tipo,
    (SELECT ativo FROM public.profiles WHERE user_id = auth.uid()) as profile_ativo,
    (SELECT tipo::text = ANY (ARRAY['medico', 'clinica', 'staff']) FROM public.profiles WHERE user_id = auth.uid()) as tipo_allowed,
    (SELECT ativo = true FROM public.profiles WHERE user_id = auth.uid()) as insert_allowed,
    -- Esta é exatamente a condição da política de INSERT
    (EXISTS (SELECT 1 FROM public.profiles p WHERE ((p.user_id = auth.uid()) AND (p.tipo::text = ANY (ARRAY['medico', 'clinica', 'staff'])) AND (p.ativo = true)))) as policy_condition_result;
$function$;

CREATE OR REPLACE FUNCTION public.can_insert_paciente()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.tipo::text = ANY (ARRAY['medico', 'clinica', 'staff'])
    AND p.ativo = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  -- Inserir profile completo com todos os campos obrigatórios
  INSERT INTO public.profiles (
    user_id, 
    email, 
    nome, 
    tipo,
    documento,
    telefone,
    especialidade,
    crm
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data ->> 'tipo', 'paciente')::public.profiles_tipo_enum,
    COALESCE(NEW.raw_user_meta_data ->> 'documento', '00000000000'),
    NEW.raw_user_meta_data ->> 'telefone',
    NEW.raw_user_meta_data ->> 'especialidade',
    NEW.raw_user_meta_data ->> 'crm'
  );
  RETURN NEW;
END;
$function$;