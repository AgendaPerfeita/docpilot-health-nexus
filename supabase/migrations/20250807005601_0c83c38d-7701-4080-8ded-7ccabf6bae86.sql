-- Criar tabela de auditoria para documentos
CREATE TABLE public.documentos_auditoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  documento_id UUID NOT NULL,
  acao TEXT NOT NULL, -- 'criado', 'assinado', 'visualizado', 'download', 'compartilhado'
  usuario_id UUID,
  usuario_tipo TEXT, -- 'medico', 'paciente', 'clinica', 'staff'
  dados_contexto JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_documentos_auditoria_documento_id ON public.documentos_auditoria(documento_id);
CREATE INDEX idx_documentos_auditoria_timestamp ON public.documentos_auditoria(timestamp);
CREATE INDEX idx_documentos_auditoria_acao ON public.documentos_auditoria(acao);

-- Habilitar RLS
ALTER TABLE public.documentos_auditoria ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para auditoria
CREATE POLICY "Médicos podem ver auditoria de seus documentos" 
ON public.documentos_auditoria 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM documentos_medicos dm
    JOIN profiles p ON p.id = dm.medico_id
    WHERE dm.id = documentos_auditoria.documento_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Sistema pode inserir logs de auditoria" 
ON public.documentos_auditoria 
FOR INSERT 
WITH CHECK (true);

-- Trigger para auto-auditoria quando documentos são modificados
CREATE OR REPLACE FUNCTION public.audit_documento_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log para novos documentos
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.documentos_auditoria (
      documento_id, acao, usuario_id, dados_contexto
    ) VALUES (
      NEW.id, 
      'criado',
      (SELECT user_id FROM profiles WHERE id = NEW.medico_id),
      jsonb_build_object(
        'tipo', NEW.tipo,
        'titulo', NEW.titulo,
        'numero_documento', NEW.numero_documento
      )
    );
    RETURN NEW;
  END IF;

  -- Log para documentos assinados
  IF TG_OP = 'UPDATE' AND OLD.assinado = false AND NEW.assinado = true THEN
    INSERT INTO public.documentos_auditoria (
      documento_id, acao, usuario_id, dados_contexto
    ) VALUES (
      NEW.id,
      'assinado',
      (SELECT user_id FROM profiles WHERE id = NEW.medico_id),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger
CREATE TRIGGER trigger_audit_documento_changes
  AFTER INSERT OR UPDATE ON public.documentos_medicos
  FOR EACH ROW EXECUTE FUNCTION public.audit_documento_changes();

-- Função para registrar visualizações de documentos
CREATE OR REPLACE FUNCTION public.log_documento_visualization(
  documento_id_param UUID,
  usuario_id_param UUID DEFAULT NULL,
  context_data JSONB DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Função para registrar downloads de documentos
CREATE OR REPLACE FUNCTION public.log_documento_download(
  documento_id_param UUID,
  usuario_id_param UUID DEFAULT NULL,
  file_name TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Adicionar campos de QR Code e validação aos documentos médicos
ALTER TABLE public.documentos_medicos ADD COLUMN IF NOT EXISTS codigo_qr TEXT;
ALTER TABLE public.documentos_medicos ADD COLUMN IF NOT EXISTS url_validacao TEXT;

-- Adicionar campos de auditoria às assinaturas digitais
ALTER TABLE public.assinaturas_digitais ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE public.assinaturas_digitais ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE public.assinaturas_digitais ADD COLUMN IF NOT EXISTS tentativas_validacao INTEGER DEFAULT 0;
ALTER TABLE public.assinaturas_digitais ADD COLUMN IF NOT EXISTS ultima_validacao TIMESTAMP WITH TIME ZONE;

-- Função para gerar código de verificação único
CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Gerar código no formato VER + 8 dígitos
    code := 'VER' || LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
    
    -- Verificar se já existe
    SELECT COUNT(*) INTO exists_check 
    FROM assinaturas_digitais 
    WHERE codigo_verificacao = code;
    
    -- Se não existe, usar este código
    IF exists_check = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Atualizar a função de assinatura digital para usar o novo gerador
CREATE OR REPLACE FUNCTION public.create_digital_signature(
  documento_id_param UUID,
  hash_documento_param TEXT,
  tipo_certificado_param TEXT,
  dados_certificado_param JSONB DEFAULT NULL
)
RETURNS TABLE(
  signature_id UUID,
  verification_code TEXT,
  qr_code_data TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_signature_id UUID;
  new_verification_code TEXT;
  qr_data TEXT;
BEGIN
  -- Gerar código de verificação único
  new_verification_code := generate_verification_code();
  
  -- Gerar dados do QR code (URL de validação)
  qr_data := 'https://seudominio.com/validar-assinatura?code=' || new_verification_code;
  
  -- Inserir assinatura
  INSERT INTO public.assinaturas_digitais (
    documento_id,
    documento_tipo,
    hash_documento,
    codigo_verificacao,
    tipo_certificado,
    dados_certificado
  ) VALUES (
    documento_id_param,
    'receita', -- ou outro tipo
    hash_documento_param,
    new_verification_code,
    tipo_certificado_param,
    dados_certificado_param
  )
  RETURNING id INTO new_signature_id;
  
  -- Atualizar documento com dados do QR code
  UPDATE public.documentos_medicos 
  SET 
    codigo_qr = qr_data,
    url_validacao = qr_data
  WHERE id = documento_id_param;
  
  -- Retornar dados
  RETURN QUERY SELECT 
    new_signature_id,
    new_verification_code,
    qr_data;
END;
$$;