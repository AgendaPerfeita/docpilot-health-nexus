-- Funções para buscar pacientes usando o novo modelo multi-clínica/multi-médico

-- Função para buscar pacientes de uma clínica
CREATE OR REPLACE FUNCTION get_pacientes_clinica(clinica_id_param uuid)
RETURNS TABLE (
  id uuid,
  nome text,
  email text,
  telefone text,
  cpf text,
  data_nascimento date,
  endereco text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  convenio text,
  numero_convenio text,
  origem text,
  created_at timestamptz,
  updated_at timestamptz,
  antecedentes_clinicos text,
  antecedentes_cirurgicos text,
  antecedentes_familiares text,
  antecedentes_habitos text,
  antecedentes_alergias text,
  medicamentos_em_uso jsonb,
  ticket_medio numeric,
  total_consultas integer,
  total_gasto numeric
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar pacientes de um médico
CREATE OR REPLACE FUNCTION get_pacientes_medico(medico_id_param uuid)
RETURNS TABLE (
  id uuid,
  nome text,
  email text,
  telefone text,
  cpf text,
  data_nascimento date,
  endereco text,
  bairro text,
  cidade text,
  estado text,
  cep text,
  convenio text,
  numero_convenio text,
  origem text,
  created_at timestamptz,
  updated_at timestamptz,
  antecedentes_clinicos text,
  antecedentes_cirurgicos text,
  antecedentes_familiares text,
  antecedentes_habitos text,
  antecedentes_alergias text,
  medicamentos_em_uso jsonb,
  ticket_medio numeric,
  total_consultas integer,
  total_gasto numeric
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar apenas IDs dos pacientes de uma clínica
CREATE OR REPLACE FUNCTION get_paciente_ids_clinica(clinica_id_param uuid)
RETURNS uuid[] AS $$
DECLARE
  paciente_ids uuid[];
BEGIN
  SELECT ARRAY_AGG(pc.paciente_id) INTO paciente_ids
  FROM public.paciente_clinica pc
  WHERE pc.clinica_id = clinica_id_param;
  
  RETURN COALESCE(paciente_ids, ARRAY[]::uuid[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar apenas IDs dos pacientes de um médico
CREATE OR REPLACE FUNCTION get_paciente_ids_medico(medico_id_param uuid)
RETURNS uuid[] AS $$
DECLARE
  paciente_ids uuid[];
BEGIN
  SELECT ARRAY_AGG(pm.paciente_id) INTO paciente_ids
  FROM public.paciente_medico pm
  WHERE pm.medico_id = medico_id_param;
  
  RETURN COALESCE(paciente_ids, ARRAY[]::uuid[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar vínculo paciente-clínica
CREATE OR REPLACE FUNCTION criar_vinculo_paciente_clinica(paciente_id_param uuid, clinica_id_param uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.paciente_clinica (paciente_id, clinica_id)
  VALUES (paciente_id_param, clinica_id_param)
  ON CONFLICT (paciente_id, clinica_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar vínculo paciente-médico
CREATE OR REPLACE FUNCTION criar_vinculo_paciente_medico(paciente_id_param uuid, medico_id_param uuid, clinica_id_param uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.paciente_medico (paciente_id, medico_id, clinica_id)
  VALUES (paciente_id_param, medico_id_param, clinica_id_param)
  ON CONFLICT (paciente_id, medico_id, clinica_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 