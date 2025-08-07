-- Fix remaining 10 functions security warnings by setting search_path

-- 11. get_paciente_ids_clinica  
CREATE OR REPLACE FUNCTION public.get_paciente_ids_clinica(clinica_id_param uuid)
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  paciente_ids uuid[];
BEGIN
  SELECT ARRAY_AGG(pc.paciente_id) INTO paciente_ids
  FROM public.paciente_clinica pc
  WHERE pc.clinica_id = clinica_id_param;
  
  RETURN COALESCE(paciente_ids, ARRAY[]::uuid[]);
END;
$function$;

-- 12. get_paciente_ids_medico
CREATE OR REPLACE FUNCTION public.get_paciente_ids_medico(medico_id_param uuid)
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  paciente_ids uuid[];
BEGIN
  SELECT ARRAY_AGG(pm.paciente_id) INTO paciente_ids
  FROM public.paciente_medico pm
  WHERE pm.medico_id = medico_id_param;
  
  RETURN COALESCE(paciente_ids, ARRAY[]::uuid[]);
END;
$function$;

-- 13. criar_vinculo_paciente_clinica
CREATE OR REPLACE FUNCTION public.criar_vinculo_paciente_clinica(paciente_id_param uuid, clinica_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.paciente_clinica (paciente_id, clinica_id)
  VALUES (paciente_id_param, clinica_id_param)
  ON CONFLICT (paciente_id, clinica_id) DO NOTHING;
END;
$function$;

-- 14. criar_vinculo_paciente_medico
CREATE OR REPLACE FUNCTION public.criar_vinculo_paciente_medico(paciente_id_param uuid, medico_id_param uuid, clinica_id_param uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.paciente_medico (paciente_id, medico_id, clinica_id)
  VALUES (paciente_id_param, medico_id_param, clinica_id_param)
  ON CONFLICT (paciente_id, medico_id, clinica_id) DO NOTHING;
END;
$function$;

-- 15. insert_paciente
CREATE OR REPLACE FUNCTION public.insert_paciente(nome_param text, email_param text DEFAULT NULL::text, telefone_param text DEFAULT NULL::text, cpf_param text DEFAULT NULL::text, data_nascimento_param date DEFAULT NULL::date, endereco_param text DEFAULT NULL::text, bairro_param text DEFAULT NULL::text, cidade_param text DEFAULT NULL::text, estado_param text DEFAULT NULL::text, cep_param text DEFAULT NULL::text, convenio_param text DEFAULT NULL::text, numero_convenio_param text DEFAULT NULL::text, origem_param text DEFAULT 'Indicação'::text)
 RETURNS TABLE(id uuid, nome text, email text, telefone text, cpf text, data_nascimento date, endereco text, bairro text, cidade text, estado text, cep text, convenio text, numero_convenio text, origem text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  paciente_record record;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  INSERT INTO public.pacientes (
    nome, email, telefone, cpf, data_nascimento, 
    endereco, bairro, cidade, estado, cep,
    convenio, numero_convenio, origem
  ) VALUES (
    nome_param, email_param, telefone_param, cpf_param, data_nascimento_param,
    endereco_param, bairro_param, cidade_param, estado_param, cep_param,
    convenio_param, numero_convenio_param, origem_param
  ) RETURNING * INTO paciente_record;
  
  RETURN QUERY SELECT 
    paciente_record.id, paciente_record.nome, paciente_record.email,
    paciente_record.telefone, paciente_record.cpf, paciente_record.data_nascimento,
    paciente_record.endereco, paciente_record.bairro, paciente_record.cidade,
    paciente_record.estado, paciente_record.cep, paciente_record.convenio,
    paciente_record.numero_convenio, paciente_record.origem,
    paciente_record.created_at, paciente_record.updated_at;
END;
$function$;

-- 16. validate_clinica_medico
CREATE OR REPLACE FUNCTION public.validate_clinica_medico()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  clinica_tipo TEXT;
  medico_tipo TEXT;
  medicos_count INTEGER;
BEGIN
  SELECT tipo INTO clinica_tipo FROM public.profiles WHERE id = NEW.clinica_id;
  IF clinica_tipo != 'clinica' THEN
    RAISE EXCEPTION 'O clinica_id deve referenciar um perfil do tipo clínica';
  END IF;
  
  SELECT tipo INTO medico_tipo FROM public.profiles WHERE id = NEW.medico_id;
  IF medico_tipo != 'medico' THEN
    RAISE EXCEPTION 'O medico_id deve referenciar um perfil do tipo médico';
  END IF;
  
  SELECT COUNT(*) INTO medicos_count 
  FROM public.clinica_medicos 
  WHERE clinica_id = NEW.clinica_id AND ativo = true;
  
  IF medicos_count >= 5 THEN
    RAISE EXCEPTION 'Uma clínica pode ter no máximo 5 médicos vinculados';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 17. update_updated_at_column (used by triggers, keep SET search_path TO 'public')
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 18. handle_new_user (used by auth triggers, keep SET search_path TO 'public')
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data ->> 'tipo', 'paciente')::public.user_type,
    COALESCE(NEW.raw_user_meta_data ->> 'documento', '00000000000'),
    NEW.raw_user_meta_data ->> 'telefone',
    NEW.raw_user_meta_data ->> 'especialidade',
    NEW.raw_user_meta_data ->> 'crm'
  );
  RETURN NEW;
END;
$function$;

-- 19. medico_tem_permissao
CREATE OR REPLACE FUNCTION public.medico_tem_permissao(medico_id uuid, permissao text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT 
    CASE 
      WHEN permissao = 'atendimento_individual' THEN permite_atendimento_individual
      WHEN permissao = 'ia' THEN permite_ia  
      WHEN permissao = 'relatorios_avancados' THEN permite_relatorios_avancados
      ELSE false
    END
  FROM public.profiles 
  WHERE id = medico_id AND tipo = 'medico';
$function$;