-- Fix remaining database functions with proper search_path
CREATE OR REPLACE FUNCTION public.generate_monthly_shifts(p_user_id uuid, p_ano integer, p_mes integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
    escala RECORD;
    dia_plantao DATE;
    total_plantoes_no_mes INTEGER;
    valor_plantao NUMERIC;
    data_inicio DATE;
    data_fim DATE;
    data_pagamento_prevista DATE;
BEGIN
    data_inicio := MAKE_DATE(p_ano, p_mes, 1);
    data_fim := (data_inicio + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    FOR escala IN
        SELECT * FROM public.plantonista_escala_fixa WHERE medico_id = p_user_id
    LOOP
        -- Conta quantos plantões para esta escala neste mês
        total_plantoes_no_mes := 0;
        FOR dia_plantao IN SELECT generate_series(data_inicio, data_fim, '1 day')::DATE LOOP
            IF EXTRACT(DOW FROM dia_plantao) = escala.dia_semana THEN
                total_plantoes_no_mes := total_plantoes_no_mes + 1;
            END IF;
        END LOOP;

        IF total_plantoes_no_mes > 0 THEN
            valor_plantao := (escala.valor_mensal / total_plantoes_no_mes)::NUMERIC(12, 2);
        ELSE
            valor_plantao := 0;
        END IF;

        FOR dia_plantao IN SELECT generate_series(data_inicio, data_fim, '1 day')::DATE LOOP
            IF EXTRACT(DOW FROM dia_plantao) = escala.dia_semana THEN
                data_pagamento_prevista := (date_trunc('month', dia_plantao) + interval '1 month' + (escala.data_pagamento - 1 || ' days')::interval)::date;

                -- Só insere se NÃO existir plantão para esta escala, data e local
                IF NOT EXISTS (
                    SELECT 1 FROM public.plantonista_plantao_fixo_realizado p
                    WHERE p.escala_fixa_id = escala.id
                      AND p.data = dia_plantao
                ) THEN
                    INSERT INTO public.plantonista_plantao_fixo_realizado (
                        escala_fixa_id,
                        data,
                        valor,
                        status_pagamento,
                        data_pagamento_prevista,
                        foi_passado,
                        local_id
                    )
                    VALUES (
                        escala.id,
                        dia_plantao,
                        valor_plantao,
                        'pendente',
                        data_pagamento_prevista,
                        FALSE,
                        escala.local_id
                    );
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.reenable_pacientes_rls()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
  COMMENT ON TABLE public.pacientes IS 'RLS reabilitado';
  RAISE NOTICE 'RLS reabilitado na tabela pacientes';
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_paciente(nome_param text, email_param text DEFAULT NULL::text, telefone_param text DEFAULT NULL::text, cpf_param text DEFAULT NULL::text, data_nascimento_param date DEFAULT NULL::date, endereco_param text DEFAULT NULL::text, bairro_param text DEFAULT NULL::text, cidade_param text DEFAULT NULL::text, estado_param text DEFAULT NULL::text, cep_param text DEFAULT NULL::text, convenio_param text DEFAULT NULL::text, numero_convenio_param text DEFAULT NULL::text, origem_param text DEFAULT 'Indicação'::text)
RETURNS TABLE(id uuid, nome text, email text, telefone text, cpf text, data_nascimento date, endereco text, bairro text, cidade text, estado text, cep text, convenio text, numero_convenio text, origem text, created_at timestamp with time zone, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  paciente_record record;
BEGIN
  -- Verificar se usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Inserir paciente
  INSERT INTO public.pacientes (
    nome, email, telefone, cpf, data_nascimento, 
    endereco, bairro, cidade, estado, cep,
    convenio, numero_convenio, origem
  ) VALUES (
    nome_param, email_param, telefone_param, cpf_param, data_nascimento_param,
    endereco_param, bairro_param, cidade_param, estado_param, cep_param,
    convenio_param, numero_convenio_param, origem_param
  ) RETURNING * INTO paciente_record;
  
  -- Retornar dados do paciente inserido
  RETURN QUERY SELECT 
    paciente_record.id,
    paciente_record.nome,
    paciente_record.email,
    paciente_record.telefone,
    paciente_record.cpf,
    paciente_record.data_nascimento,
    paciente_record.endereco,
    paciente_record.bairro,
    paciente_record.cidade,
    paciente_record.estado,
    paciente_record.cep,
    paciente_record.convenio,
    paciente_record.numero_convenio,
    paciente_record.origem,
    paciente_record.created_at,
    paciente_record.updated_at;
END;
$function$;

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
    (SELECT tipo = ANY (ARRAY['medico'::user_type, 'clinica'::user_type, 'staff'::user_type]) FROM public.profiles WHERE user_id = auth.uid()) as tipo_allowed,
    (SELECT ativo = true FROM public.profiles WHERE user_id = auth.uid()) as insert_allowed,
    -- Esta é exatamente a condição da política de INSERT
    (EXISTS (SELECT 1 FROM public.profiles p WHERE ((p.user_id = auth.uid()) AND (p.tipo = ANY (ARRAY['medico'::user_type, 'clinica'::user_type, 'staff'::user_type])) AND (p.ativo = true)))) as policy_condition_result;
$function$;

CREATE OR REPLACE FUNCTION public.get_pacientes_clinica(clinica_id_param uuid)
RETURNS TABLE(id uuid, nome text, email text, telefone text, cpf text, data_nascimento date, endereco text, bairro text, cidade text, estado text, cep text, convenio text, numero_convenio text, origem text, created_at timestamp with time zone, updated_at timestamp with time zone, antecedentes_clinicos text, antecedentes_cirurgicos text, antecedentes_familiares text, antecedentes_habitos text, antecedentes_alergias text, medicamentos_em_uso jsonb, ticket_medio numeric, total_consultas integer, total_gasto numeric)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.email,
    p.telefone,
    p.cpf,
    p.data_nascimento,
    p.endereco,
    p.bairro,
    p.cidade,
    p.estado,
    p.cep,
    p.convenio,
    p.numero_convenio,
    p.origem,
    p.created_at,
    p.updated_at,
    p.antecedentes_clinicos,
    p.antecedentes_cirurgicos,
    p.antecedentes_familiares,
    p.antecedentes_habitos,
    p.antecedentes_alergias,
    p.medicamentos_em_uso,
    p.ticket_medio,
    p.total_consultas,
    p.total_gasto
  FROM public.pacientes p
  INNER JOIN public.paciente_clinica pc ON p.id = pc.paciente_id
  WHERE pc.clinica_id = clinica_id_param
  ORDER BY p.nome;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_pacientes_medico(medico_id_param uuid)
RETURNS TABLE(id uuid, nome text, email text, telefone text, cpf text, data_nascimento date, endereco text, bairro text, cidade text, estado text, cep text, convenio text, numero_convenio text, origem text, created_at timestamp with time zone, updated_at timestamp with time zone, antecedentes_clinicos text, antecedentes_cirurgicos text, antecedentes_familiares text, antecedentes_habitos text, antecedentes_alergias text, medicamentos_em_uso jsonb, ticket_medio numeric, total_consultas integer, total_gasto numeric)
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    p.email,
    p.telefone,
    p.cpf,
    p.data_nascimento,
    p.endereco,
    p.bairro,
    p.cidade,
    p.estado,
    p.cep,
    p.convenio,
    p.numero_convenio,
    p.origem,
    p.created_at,
    p.updated_at,
    p.antecedentes_clinicos,
    p.antecedentes_cirurgicos,
    p.antecedentes_familiares,
    p.antecedentes_habitos,
    p.antecedentes_alergias,
    p.medicamentos_em_uso,
    p.ticket_medio,
    p.total_consultas,
    p.total_gasto
  FROM public.pacientes p
  INNER JOIN public.paciente_medico pm ON p.id = pm.paciente_id
  WHERE pm.medico_id = medico_id_param
  ORDER BY p.nome;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_paciente_ids_clinica(clinica_id_param uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.get_paciente_ids_medico(medico_id_param uuid)
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.criar_vinculo_paciente_clinica(paciente_id_param uuid, clinica_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.paciente_clinica (paciente_id, clinica_id)
  VALUES (paciente_id_param, clinica_id_param)
  ON CONFLICT (paciente_id, clinica_id) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.criar_vinculo_paciente_medico(paciente_id_param uuid, medico_id_param uuid, clinica_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.paciente_medico (paciente_id, medico_id, clinica_id)
  VALUES (paciente_id_param, medico_id_param, clinica_id_param)
  ON CONFLICT (paciente_id, medico_id, clinica_id) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS TABLE(current_user_id uuid, profile_exists boolean, profile_tipo text, profile_ativo boolean, profile_id uuid, profile_nome text)
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT 
    auth.uid() as current_user_id,
    EXISTS(SELECT 1 FROM public.profiles WHERE user_id = auth.uid()) as profile_exists,
    (SELECT tipo::text FROM public.profiles WHERE user_id = auth.uid()) as profile_tipo,
    (SELECT ativo FROM public.profiles WHERE user_id = auth.uid()) as profile_ativo,
    (SELECT id FROM public.profiles WHERE user_id = auth.uid()) as profile_id,
    (SELECT nome FROM public.profiles WHERE user_id = auth.uid()) as profile_nome;
$function$;

CREATE OR REPLACE FUNCTION public.debug_paciente_access(paciente_id_param uuid)
RETURNS TABLE(can_access boolean, reason text, via_medico boolean, via_clinica boolean, via_clinica_medico boolean)
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.debug_pacientes_policies()
RETURNS TABLE(policy_name text, policy_cmd text, policy_roles text[], policy_qual text, policy_with_check text)
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.can_insert_paciente()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.tipo = ANY (ARRAY['medico'::user_type, 'clinica'::user_type, 'staff'::user_type])
    AND p.ativo = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
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
    COALESCE((NEW.raw_user_meta_data ->> 'tipo')::public.user_type, 'paciente'::public.user_type),
    COALESCE(NEW.raw_user_meta_data ->> 'documento', '00000000000'),
    NEW.raw_user_meta_data ->> 'telefone',
    NEW.raw_user_meta_data ->> 'especialidade',
    NEW.raw_user_meta_data ->> 'crm'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_clinica_medico()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
  clinica_tipo TEXT;
  medico_tipo TEXT;
  medicos_count INTEGER;
BEGIN
  -- Verificar se clinica_id é realmente uma clínica
  SELECT tipo INTO clinica_tipo FROM public.profiles WHERE id = NEW.clinica_id;
  IF clinica_tipo != 'clinica' THEN
    RAISE EXCEPTION 'O clinica_id deve referenciar um perfil do tipo clínica';
  END IF;
  
  -- Verificar se medico_id é realmente um médico
  SELECT tipo INTO medico_tipo FROM public.profiles WHERE id = NEW.medico_id;
  IF medico_tipo != 'medico' THEN
    RAISE EXCEPTION 'O medico_id deve referenciar um perfil do tipo médico';
  END IF;
  
  -- Verificar limite de 5 médicos por clínica
  SELECT COUNT(*) INTO medicos_count 
  FROM public.clinica_medicos 
  WHERE clinica_id = NEW.clinica_id AND ativo = true;
  
  IF medicos_count >= 5 THEN
    RAISE EXCEPTION 'Uma clínica pode ter no máximo 5 médicos vinculados';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.medico_tem_permissao(medico_id uuid, permissao text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = ''
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