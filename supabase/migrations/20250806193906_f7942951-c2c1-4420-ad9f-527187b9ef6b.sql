-- Criar tabela para logs de backup
CREATE TABLE public.backup_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('export_completo', 'export_seletivo', 'import', 'restore')),
  status TEXT NOT NULL DEFAULT 'iniciado' CHECK (status IN ('iniciado', 'processando', 'concluido', 'erro')),
  user_id UUID REFERENCES auth.users(id),
  parametros JSONB,
  resultado JSONB,
  arquivo_url TEXT,
  tamanho_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Criar tabela para configurações de backup
CREATE TABLE public.backup_configuracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  backup_automatico BOOLEAN NOT NULL DEFAULT true,
  frequencia TEXT NOT NULL DEFAULT 'diario' CHECK (frequencia IN ('diario', 'semanal', 'mensal')),
  horario TIME NOT NULL DEFAULT '02:00:00',
  retencao_dias INTEGER NOT NULL DEFAULT 30,
  incluir_anexos BOOLEAN NOT NULL DEFAULT true,
  incluir_imagens BOOLEAN NOT NULL DEFAULT true,
  compressao BOOLEAN NOT NULL DEFAULT true,
  notificar_email BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS para backup_logs
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus logs de backup" 
ON public.backup_logs 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Usuários podem criar logs de backup" 
ON public.backup_logs 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar seus logs de backup" 
ON public.backup_logs 
FOR UPDATE 
USING (user_id = auth.uid());

-- RLS para backup_configuracoes
ALTER TABLE public.backup_configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas configurações de backup" 
ON public.backup_configuracoes 
FOR ALL 
USING (user_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_backup_configuracoes_updated_at
BEFORE UPDATE ON public.backup_configuracoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para obter dados completos do usuário
CREATE OR REPLACE FUNCTION public.get_user_complete_data(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  profile_data JSONB;
  pacientes_data JSONB;
  consultas_data JSONB;
  prontuarios_data JSONB;
  anexos_data JSONB;
BEGIN
  -- Verificar se o usuário pode acessar os dados
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Profile
  SELECT to_jsonb(p.*) INTO profile_data
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
  
  result := jsonb_set(result, '{profile}', COALESCE(profile_data, 'null'));

  -- Pacientes (se for médico ou clínica)
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

  -- Consultas
  SELECT COALESCE(jsonb_agg(to_jsonb(c.*)), '[]') INTO consultas_data
  FROM public.consultas c
  JOIN public.profiles prof ON prof.id = c.medico_id
  WHERE prof.user_id = target_user_id;
  
  result := jsonb_set(result, '{consultas}', COALESCE(consultas_data, '[]'));

  -- Prontuários
  SELECT COALESCE(jsonb_agg(to_jsonb(pr.*)), '[]') INTO prontuarios_data
  FROM public.prontuarios pr
  JOIN public.profiles prof ON prof.id = pr.medico_id
  WHERE prof.user_id = target_user_id;
  
  result := jsonb_set(result, '{prontuarios}', COALESCE(prontuarios_data, '[]'));

  -- Anexos médicos
  SELECT COALESCE(jsonb_agg(to_jsonb(am.*)), '[]') INTO anexos_data
  FROM public.anexos_medicos am
  JOIN public.profiles prof ON prof.id = am.medico_id
  WHERE prof.user_id = target_user_id;
  
  result := jsonb_set(result, '{anexos_medicos}', COALESCE(anexos_data, '[]'));

  RETURN result;
END;
$$;