-- Função RPC para inserir pacientes
-- Isso pode contornar problemas de contexto de políticas RLS

CREATE OR REPLACE FUNCTION insert_paciente(
  nome_param text,
  email_param text DEFAULT NULL,
  telefone_param text DEFAULT NULL,
  cpf_param text DEFAULT NULL,
  data_nascimento_param date DEFAULT NULL,
  endereco_param text DEFAULT NULL,
  bairro_param text DEFAULT NULL,
  cidade_param text DEFAULT NULL,
  estado_param text DEFAULT NULL,
  cep_param text DEFAULT NULL,
  convenio_param text DEFAULT NULL,
  numero_convenio_param text DEFAULT NULL,
  origem_param text DEFAULT 'Indicação'
)
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
  updated_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  paciente_record record;
BEGIN
  -- Verificar se usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Inserir paciente
  INSERT INTO pacientes (
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
$$;

-- Comentário
COMMENT ON FUNCTION insert_paciente(text, text, text, text, date, text, text, text, text, text, text, text, text) IS 'Função RPC para inserir pacientes, contornando problemas de políticas RLS'; 