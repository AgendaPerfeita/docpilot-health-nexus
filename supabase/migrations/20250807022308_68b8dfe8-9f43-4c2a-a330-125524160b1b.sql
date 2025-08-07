-- Fix the last function security warning by setting search_path

-- 23. debug_pacientes_policies
CREATE OR REPLACE FUNCTION public.debug_pacientes_policies()
 RETURNS TABLE(policy_name text, policy_cmd text, policy_roles text[], policy_qual text, policy_with_check text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    policyname::text,
    cmd::text,
    roles,
    qual,
    with_check
  FROM pg_policies 
  WHERE tablename = 'pacientes' AND schemaname = 'public'
  ORDER BY policyname;
$function$;