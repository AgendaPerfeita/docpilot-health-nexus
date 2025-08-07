-- Fix all function security warnings by setting search_path

-- 1. generate_monthly_shifts
CREATE OR REPLACE FUNCTION public.generate_monthly_shifts(p_user_id uuid, p_ano integer, p_mes integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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

-- 2. audit_documento_changes
CREATE OR REPLACE FUNCTION public.audit_documento_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.documentos_auditoria (
      documento_id, acao, usuario_id, dados_contexto
    ) VALUES (
      NEW.id, 
      'criado',
      (SELECT user_id FROM public.profiles WHERE id = NEW.medico_id),
      jsonb_build_object(
        'tipo', NEW.tipo,
        'titulo', NEW.titulo,
        'numero_documento', NEW.numero_documento
      )
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.assinado = false AND NEW.assinado = true THEN
    INSERT INTO public.documentos_auditoria (
      documento_id, acao, usuario_id, dados_contexto
    ) VALUES (
      NEW.id,
      'assinado',
      (SELECT user_id FROM public.profiles WHERE id = NEW.medico_id),
      jsonb_build_object(
        'hash_assinatura', NEW.hash_assinatura,
        'status_anterior', OLD.status,
        'status_novo', NEW.status
      )
    );
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;

-- 3. log_documento_visualization
CREATE OR REPLACE FUNCTION public.log_documento_visualization(documento_id_param uuid, usuario_id_param uuid DEFAULT NULL::uuid, context_data jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.documentos_auditoria (
    documento_id,
    acao,
    usuario_id,
    dados_contexto
  ) VALUES (
    documento_id_param,
    'visualizado',
    usuario_id_param,
    COALESCE(context_data, jsonb_build_object('timestamp', now()))
  );
END;
$function$;

-- 4. log_documento_download
CREATE OR REPLACE FUNCTION public.log_documento_download(documento_id_param uuid, usuario_id_param uuid DEFAULT NULL::uuid, file_name text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.documentos_auditoria (
    documento_id,
    acao,
    usuario_id,
    dados_contexto
  ) VALUES (
    documento_id_param,
    'download',
    usuario_id_param,
    jsonb_build_object(
      'file_name', file_name,
      'timestamp', now()
    )
  );
END;
$function$;

-- 5. generate_verification_code
CREATE OR REPLACE FUNCTION public.generate_verification_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    code := 'VER' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    SELECT COUNT(*) INTO exists_check 
    FROM public.assinaturas_digitais 
    WHERE codigo_verificacao = code;
    
    IF exists_check = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$function$;

-- 6. create_digital_signature
CREATE OR REPLACE FUNCTION public.create_digital_signature(documento_id_param uuid, hash_documento_param text, tipo_certificado_param text, dados_certificado_param jsonb DEFAULT NULL::jsonb)
 RETURNS TABLE(signature_id uuid, verification_code text, qr_code_data text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  new_signature_id UUID;
  new_verification_code TEXT;
  qr_data TEXT;
BEGIN
  new_verification_code := public.generate_verification_code();
  
  qr_data := 'https://seudominio.com/validar-assinatura?code=' || new_verification_code;
  
  INSERT INTO public.assinaturas_digitais (
    documento_id,
    documento_tipo,
    hash_documento,
    codigo_verificacao,
    tipo_certificado,
    dados_certificado
  ) VALUES (
    documento_id_param,
    'receita',
    hash_documento_param,
    new_verification_code,
    tipo_certificado_param,
    dados_certificado_param
  )
  RETURNING id INTO new_signature_id;
  
  UPDATE public.documentos_medicos 
  SET 
    codigo_qr = qr_data,
    url_validacao = qr_data
  WHERE id = documento_id_param;
  
  RETURN QUERY SELECT 
    new_signature_id,
    new_verification_code,
    qr_data;
END;
$function$;

-- 7. reenable_pacientes_rls
CREATE OR REPLACE FUNCTION public.reenable_pacientes_rls()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
  COMMENT ON TABLE public.pacientes IS 'RLS reabilitado';
  RAISE NOTICE 'RLS reabilitado na tabela pacientes';
END;
$function$;

-- 8. get_user_complete_data
CREATE OR REPLACE FUNCTION public.get_user_complete_data(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  result JSONB := '{}';
  profile_data JSONB;
  pacientes_data JSONB;
  consultas_data JSONB;
  prontuarios_data JSONB;
  anexos_data JSONB;
BEGIN
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT to_jsonb(p.*) INTO profile_data
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
  
  result := jsonb_set(result, '{profile}', COALESCE(profile_data, 'null'));

  SELECT COALESCE(jsonb_agg(to_jsonb(pac.*)), '[]') INTO pacientes_data
  FROM public.pacientes pac
  WHERE EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles prof ON prof.id = pm.medico_id
    WHERE pm.paciente_id = pac.id AND prof.user_id = target_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles prof ON prof.id = pc.clinica_id
    WHERE pc.paciente_id = pac.id AND prof.user_id = target_user_id
  );
  
  result := jsonb_set(result, '{pacientes}', COALESCE(pacientes_data, '[]'));

  SELECT COALESCE(jsonb_agg(to_jsonb(c.*)), '[]') INTO consultas_data
  FROM public.consultas c
  JOIN public.profiles prof ON prof.id = c.medico_id
  WHERE prof.user_id = target_user_id;
  
  result := jsonb_set(result, '{consultas}', COALESCE(consultas_data, '[]'));

  SELECT COALESCE(jsonb_agg(to_jsonb(pr.*)), '[]') INTO prontuarios_data
  FROM public.prontuarios pr
  JOIN public.profiles prof ON prof.id = pr.medico_id
  WHERE prof.user_id = target_user_id;
  
  result := jsonb_set(result, '{prontuarios}', COALESCE(prontuarios_data, '[]'));

  SELECT COALESCE(jsonb_agg(to_jsonb(am.*)), '[]') INTO anexos_data
  FROM public.anexos_medicos am
  JOIN public.profiles prof ON prof.id = am.medico_id
  WHERE prof.user_id = target_user_id;
  
  result := jsonb_set(result, '{anexos_medicos}', COALESCE(anexos_data, '[]'));

  RETURN result;
END;
$function$;

-- 9. get_pacientes_clinica
CREATE OR REPLACE FUNCTION public.get_pacientes_clinica(clinica_id_param uuid)
 RETURNS TABLE(id uuid, nome text, email text, telefone text, cpf text, data_nascimento date, endereco text, bairro text, cidade text, estado text, cep text, convenio text, numero_convenio text, origem text, created_at timestamp with time zone, updated_at timestamp with time zone, antecedentes_clinicos text, antecedentes_cirurgicos text, antecedentes_familiares text, antecedentes_habitos text, antecedentes_alergias text, medicamentos_em_uso jsonb, ticket_medio numeric, total_consultas integer, total_gasto numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.nome, p.email, p.telefone, p.cpf, p.data_nascimento,
    p.endereco, p.bairro, p.cidade, p.estado, p.cep, p.convenio,
    p.numero_convenio, p.origem, p.created_at, p.updated_at,
    p.antecedentes_clinicos, p.antecedentes_cirurgicos, p.antecedentes_familiares,
    p.antecedentes_habitos, p.antecedentes_alergias, p.medicamentos_em_uso,
    p.ticket_medio, p.total_consultas, p.total_gasto
  FROM public.pacientes p
  INNER JOIN public.paciente_clinica pc ON p.id = pc.paciente_id
  WHERE pc.clinica_id = clinica_id_param
  ORDER BY p.nome;
END;
$function$;

-- 10. get_pacientes_medico
CREATE OR REPLACE FUNCTION public.get_pacientes_medico(medico_id_param uuid)
 RETURNS TABLE(id uuid, nome text, email text, telefone text, cpf text, data_nascimento date, endereco text, bairro text, cidade text, estado text, cep text, convenio text, numero_convenio text, origem text, created_at timestamp with time zone, updated_at timestamp with time zone, antecedentes_clinicos text, antecedentes_cirurgicos text, antecedentes_familiares text, antecedentes_habitos text, antecedentes_alergias text, medicamentos_em_uso jsonb, ticket_medio numeric, total_consultas integer, total_gasto numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.nome, p.email, p.telefone, p.cpf, p.data_nascimento,
    p.endereco, p.bairro, p.cidade, p.estado, p.cep, p.convenio,
    p.numero_convenio, p.origem, p.created_at, p.updated_at,
    p.antecedentes_clinicos, p.antecedentes_cirurgicos, p.antecedentes_familiares,
    p.antecedentes_habitos, p.antecedentes_alergias, p.medicamentos_em_uso,
    p.ticket_medio, p.total_consultas, p.total_gasto
  FROM public.pacientes p
  INNER JOIN public.paciente_medico pm ON p.id = pm.paciente_id
  WHERE pm.medico_id = medico_id_param
  ORDER BY p.nome;
END;
$function$;