-- Fix last 3 function security warnings by setting search_path

-- 20. can_insert_paciente
CREATE OR REPLACE FUNCTION public.can_insert_paciente()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.tipo::text = ANY (ARRAY['medico', 'clinica', 'staff'])
    AND p.ativo = true
  );
$function$;

-- 21. debug_auth_context
CREATE OR REPLACE FUNCTION public.debug_auth_context()
 RETURNS TABLE(current_user_id uuid, profile_exists boolean, profile_tipo text, profile_ativo boolean, profile_id uuid, profile_nome text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    auth.uid() as current_user_id,
    EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid()) as profile_exists,
    (SELECT tipo::text FROM public.profiles WHERE user_id = auth.uid()) as profile_tipo,
    (SELECT ativo FROM public.profiles WHERE user_id = auth.uid()) as profile_ativo,
    (SELECT id FROM public.profiles WHERE user_id = auth.uid()) as profile_id,
    (SELECT nome FROM public.profiles WHERE user_id = auth.uid()) as profile_nome;
$function$;

-- 22. debug_paciente_access  
CREATE OR REPLACE FUNCTION public.debug_paciente_access(paciente_id_param uuid)
 RETURNS TABLE(can_access boolean, reason text, via_medico boolean, via_clinica boolean, via_clinica_medico boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
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
$function$;