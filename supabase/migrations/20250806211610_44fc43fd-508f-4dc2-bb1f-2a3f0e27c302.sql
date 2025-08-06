-- Criar tabela de assinaturas digitais
CREATE TABLE public.assinaturas_digitais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  documento_id UUID NOT NULL,
  documento_tipo TEXT NOT NULL,
  hash_documento TEXT NOT NULL,
  timestamp_assinatura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  codigo_verificacao TEXT NOT NULL UNIQUE,
  tipo_certificado TEXT NOT NULL CHECK (tipo_certificado IN ('A1', 'A3')),
  status TEXT NOT NULL DEFAULT 'assinado' CHECK (status IN ('assinado', 'revogado')),
  dados_certificado JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.assinaturas_digitais ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Médicos podem ver suas assinaturas"
  ON public.assinaturas_digitais FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.documentos_medicos dm
      JOIN public.profiles p ON p.id = dm.medico_id
      WHERE dm.id = assinaturas_digitais.documento_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Sistema pode inserir assinaturas"
  ON public.assinaturas_digitais FOR INSERT
  WITH CHECK (true);

-- Função para atualizar updated_at
CREATE TRIGGER update_assinaturas_digitais_updated_at
  BEFORE UPDATE ON public.assinaturas_digitais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_assinaturas_digitais_documento_id ON public.assinaturas_digitais(documento_id);
CREATE INDEX idx_assinaturas_digitais_codigo_verificacao ON public.assinaturas_digitais(codigo_verificacao);
CREATE INDEX idx_assinaturas_digitais_timestamp ON public.assinaturas_digitais(timestamp_assinatura);

-- Comentários
COMMENT ON TABLE public.assinaturas_digitais IS 'Registro de assinaturas digitais de documentos médicos';
COMMENT ON COLUMN public.assinaturas_digitais.hash_documento IS 'Hash SHA-256 do documento assinado';
COMMENT ON COLUMN public.assinaturas_digitais.codigo_verificacao IS 'Código único para validação pública da assinatura';
COMMENT ON COLUMN public.assinaturas_digitais.dados_certificado IS 'Metadados do certificado digital utilizado';