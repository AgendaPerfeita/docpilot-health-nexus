-- Migration: Criação da tabela de mensagens do chat médico, uploads/compartilhamento de arquivos e logs de visualização

-- 1. Tabelas
CREATE TABLE public.chat_mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  clinica_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_type TEXT NOT NULL CHECK (author_type IN ('doctor', 'patient', 'clinic', 'staff')),
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE public.exames_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nome TEXT,
  descricao TEXT
);

CREATE TABLE public.documentos_compartilhados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exame_id UUID NOT NULL REFERENCES public.exames_uploads(id) ON DELETE CASCADE,
  medico_id UUID REFERENCES public.profiles(id),
  clinica_id UUID REFERENCES public.profiles(id),
  compartilhado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.documentos_visualizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exame_id UUID NOT NULL REFERENCES public.exames_uploads(id) ON DELETE CASCADE,
  visualizador_id UUID NOT NULL REFERENCES public.profiles(id),
  visualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Índices
CREATE INDEX idx_chat_mensagens_patient_id ON public.chat_mensagens(patient_id);
CREATE INDEX idx_chat_mensagens_clinica_id ON public.chat_mensagens(clinica_id);
CREATE INDEX idx_chat_mensagens_created_at ON public.chat_mensagens(created_at DESC);
CREATE INDEX idx_chat_mensagens_read_false ON public.chat_mensagens(read) WHERE read = false;
CREATE INDEX idx_chat_mensagens_author_id ON public.chat_mensagens(author_id);
CREATE INDEX idx_chat_mensagens_not_deleted ON public.chat_mensagens(deleted) WHERE deleted = false;

CREATE INDEX idx_exames_uploads_paciente_id ON public.exames_uploads(paciente_id);
CREATE INDEX idx_exames_uploads_created_at ON public.exames_uploads(created_at DESC);

CREATE INDEX idx_documentos_compartilhados_exame_id ON public.documentos_compartilhados(exame_id);
CREATE INDEX idx_documentos_compartilhados_medico_id ON public.documentos_compartilhados(medico_id);
CREATE INDEX idx_documentos_compartilhados_clinica_id ON public.documentos_compartilhados(clinica_id);

CREATE INDEX idx_documentos_visualizacoes_exame_id ON public.documentos_visualizacoes(exame_id);
CREATE INDEX idx_documentos_visualizacoes_visualizador_id ON public.documentos_visualizacoes(visualizador_id);

-- 3. Trigger para deletar compartilhamentos ao deletar um exame
CREATE OR REPLACE FUNCTION delete_documentos_compartilhados_on_exame_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.documentos_compartilhados WHERE exame_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_documentos_compartilhados
AFTER DELETE ON public.exames_uploads
FOR EACH ROW
EXECUTE FUNCTION delete_documentos_compartilhados_on_exame_delete();

-- 4. RLS e políticas
-- chat_mensagens
ALTER TABLE public.chat_mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participantes podem ver suas mensagens"
ON public.chat_mensagens
FOR SELECT USING (
  (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id)) OR
  (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = (SELECT responsavel_id FROM public.pacientes WHERE id = patient_id))) OR
  (clinica_id IS NOT NULL AND auth.uid() = (SELECT user_id FROM public.profiles WHERE id = clinica_id))
);
DROP POLICY IF EXISTS "Participantes podem inserir mensagens" ON public.chat_mensagens;
CREATE POLICY "Participantes podem inserir mensagens"
ON public.chat_mensagens
FOR INSERT WITH CHECK (
  (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id))
);
CREATE POLICY "Participantes podem atualizar suas mensagens"
ON public.chat_mensagens
FOR UPDATE USING (
  (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id))
);
CREATE POLICY "Participantes podem deletar suas mensagens (soft delete)"
ON public.chat_mensagens
FOR DELETE USING (
  (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id))
);

-- exames_uploads
ALTER TABLE public.exames_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Paciente pode ver seus uploads"
ON public.exames_uploads
FOR SELECT USING (
  paciente_id = (SELECT id FROM public.pacientes WHERE responsavel_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Médico/Clínica pode ver exames compartilhados"
ON public.exames_uploads
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.documentos_compartilhados dc
    WHERE dc.exame_id = exames_uploads.id
      AND (
        dc.medico_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR dc.clinica_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
  )
);

-- documentos_compartilhados
ALTER TABLE public.documentos_compartilhados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Paciente pode ver seus compartilhamentos"
ON public.documentos_compartilhados
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.exames_uploads eu
    WHERE eu.id = documentos_compartilhados.exame_id
      AND eu.paciente_id = (SELECT id FROM public.pacientes WHERE responsavel_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  )
);
CREATE POLICY "Médico/Clínica pode ver compartilhamentos feitos com ele"
ON public.documentos_compartilhados
FOR SELECT USING (
  (medico_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  OR (clinica_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);

-- documentos_visualizacoes
ALTER TABLE public.documentos_visualizacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Paciente pode ver logs dos seus exames"
ON public.documentos_visualizacoes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.exames_uploads eu
    WHERE eu.id = documentos_visualizacoes.exame_id
      AND eu.paciente_id = (SELECT id FROM public.pacientes WHERE responsavel_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  )
);
CREATE POLICY "Visualizador pode ver seus próprios logs"
ON public.documentos_visualizacoes
FOR SELECT USING (
  visualizador_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Médico/Clínica pode ver logs de exames compartilhados"
ON public.documentos_visualizacoes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.documentos_compartilhados dc
    WHERE dc.exame_id = documentos_visualizacoes.exame_id
      AND (
        dc.medico_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR dc.clinica_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      )
  )
); 