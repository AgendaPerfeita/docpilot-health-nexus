
-- Criar tabela de catálogo de exames médicos
CREATE TABLE public.catalogo_exames (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  codigo_tuss text,
  codigo_amb text,
  categoria text NOT NULL CHECK (categoria IN ('Laboratorial', 'Imagem', 'Funcional', 'Procedimento')),
  subcategoria text,
  descricao text,
  valor_referencia numeric,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de solicitações de exames
CREATE TABLE public.solicitacoes_exames (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prontuario_id uuid REFERENCES public.prontuarios(id),
  medico_id uuid NOT NULL REFERENCES public.profiles(id),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id),
  exames jsonb NOT NULL, -- Array de exames solicitados
  indicacao_clinica text,
  convenio text,
  urgente boolean DEFAULT false,
  status text DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'coletado', 'resultado_disponivel', 'analisado')),
  data_solicitacao timestamp with time zone NOT NULL DEFAULT now(),
  data_resultado timestamp with time zone,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de documentos médicos
CREATE TABLE public.documentos_medicos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prontuario_id uuid REFERENCES public.prontuarios(id),
  medico_id uuid NOT NULL REFERENCES public.profiles(id),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id),
  tipo text NOT NULL CHECK (tipo IN ('atestado', 'receita', 'relatório', 'declaração', 'solicitação', 'laudo')),
  titulo text NOT NULL,
  conteudo text NOT NULL,
  template_usado text,
  numero_documento text,
  validade_ate date,
  assinado boolean DEFAULT false,
  hash_assinatura text,
  status text DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizado', 'assinado', 'cancelado')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de anexos/imagens
CREATE TABLE public.anexos_medicos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prontuario_id uuid REFERENCES public.prontuarios(id),
  paciente_id uuid NOT NULL REFERENCES public.pacientes(id),
  medico_id uuid NOT NULL REFERENCES public.profiles(id),
  nome_arquivo text NOT NULL,
  tipo_arquivo text NOT NULL,
  categoria text NOT NULL CHECK (categoria IN ('exame', 'documento', 'imagem', 'outros')),
  subcategoria text,
  tamanho_bytes bigint,
  url_storage text NOT NULL,
  descricao text,
  data_upload timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de templates de documentos
CREATE TABLE public.templates_documentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  tipo text NOT NULL,
  especialidade text,
  conteudo_template text NOT NULL,
  variaveis jsonb, -- Variáveis que podem ser substituídas no template
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de medicamentos para autocompletar
CREATE TABLE public.medicamentos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  principio_ativo text,
  categoria text,
  dosagens_comuns text[], -- Array com dosagens típicas
  frequencias_comuns text[], -- Array com frequências típicas
  interacoes text[], -- Array com medicamentos que interagem
  observacoes text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Inserir dados iniciais no catálogo de exames
INSERT INTO public.catalogo_exames (nome, codigo_tuss, categoria, subcategoria, descricao) VALUES
-- Exames Laboratoriais
('Hemograma Completo', '40301012', 'Laboratorial', 'Hematologia', 'Contagem completa de células sanguíneas'),
('Glicemia de Jejum', '40301000', 'Laboratorial', 'Bioquímica', 'Dosagem de glicose no sangue em jejum'),
('Colesterol Total', '40301001', 'Laboratorial', 'Bioquímica', 'Dosagem de colesterol total'),
('HDL Colesterol', '40301002', 'Laboratorial', 'Bioquímica', 'Dosagem de colesterol HDL'),
('LDL Colesterol', '40301003', 'Laboratorial', 'Bioquímica', 'Dosagem de colesterol LDL'),
('Triglicerídeos', '40301004', 'Laboratorial', 'Bioquímica', 'Dosagem de triglicerídeos'),
('Ureia', '40301005', 'Laboratorial', 'Bioquímica', 'Dosagem de ureia sérica'),
('Creatinina', '40301006', 'Laboratorial', 'Bioquímica', 'Dosagem de creatinina sérica'),
('TSH', '40301007', 'Laboratorial', 'Hormônios', 'Hormônio estimulante da tireoide'),
('T4 Livre', '40301008', 'Laboratorial', 'Hormônios', 'Tiroxina livre'),

-- Exames de Imagem
('Raio-X de Tórax', '40701001', 'Imagem', 'Radiografia', 'Radiografia simples do tórax'),
('Ultrassom Abdominal', '40801001', 'Imagem', 'Ultrassonografia', 'Ultrassonografia do abdome total'),
('Tomografia de Crânio', '40901001', 'Imagem', 'Tomografia', 'Tomografia computadorizada do crânio'),
('Ressonância Magnética', '41001001', 'Imagem', 'Ressonância', 'Ressonância magnética'),
('Ecocardiograma', '40801010', 'Imagem', 'Ultrassonografia', 'Ultrassonografia do coração'),

-- Exames Funcionais
('Eletrocardiograma', '41101001', 'Funcional', 'Cardiologia', 'ECG de repouso'),
('Teste Ergométrico', '41101002', 'Funcional', 'Cardiologia', 'ECG de esforço'),
('Espirometria', '41201001', 'Funcional', 'Pneumologia', 'Prova de função pulmonar'),
('Endoscopia Digestiva', '41301001', 'Funcional', 'Gastroenterologia', 'Endoscopia do trato digestivo superior');

-- Inserir medicamentos comuns
INSERT INTO public.medicamentos (nome, principio_ativo, categoria, dosagens_comuns, frequencias_comuns) VALUES
('Losartana', 'Losartana Potássica', 'Anti-hipertensivo', ARRAY['25mg', '50mg', '100mg'], ARRAY['1x ao dia', '2x ao dia']),
('Omeprazol', 'Omeprazol', 'Protetor Gástrico', ARRAY['20mg', '40mg'], ARRAY['1x ao dia', '2x ao dia']),
('Metformina', 'Metformina', 'Antidiabético', ARRAY['500mg', '850mg', '1000mg'], ARRAY['1x ao dia', '2x ao dia', '3x ao dia']),
('Sinvastatina', 'Sinvastatina', 'Hipolipemiante', ARRAY['10mg', '20mg', '40mg'], ARRAY['1x ao dia']),
('Enalapril', 'Enalapril', 'Anti-hipertensivo', ARRAY['5mg', '10mg', '20mg'], ARRAY['1x ao dia', '2x ao dia']),
('Dipirona', 'Dipirona Sódica', 'Analgésico', ARRAY['500mg', '1g'], ARRAY['4x ao dia', '6x ao dia', 'SOS']),
('Paracetamol', 'Paracetamol', 'Analgésico', ARRAY['500mg', '750mg', '1g'], ARRAY['4x ao dia', '6x ao dia', 'SOS']),
('Ibuprofeno', 'Ibuprofeno', 'Anti-inflamatório', ARRAY['200mg', '400mg', '600mg'], ARRAY['2x ao dia', '3x ao dia']);

-- Inserir templates de documentos
INSERT INTO public.templates_documentos (nome, tipo, especialidade, conteudo_template, variaveis) VALUES
('Atestado Médico Simples', 'atestado', NULL, 
'Atesto que o(a) paciente {{NOME_PACIENTE}}, portador(a) do documento {{DOCUMENTO_PACIENTE}}, esteve sob meus cuidados médicos e necessita de afastamento de suas atividades por {{DIAS_AFASTAMENTO}} dias, a partir de {{DATA_INICIO}}, devido a {{MOTIVO_AFASTAMENTO}}.', 
'{"NOME_PACIENTE": "string", "DOCUMENTO_PACIENTE": "string", "DIAS_AFASTAMENTO": "number", "DATA_INICIO": "date", "MOTIVO_AFASTAMENTO": "string"}'::jsonb),
('Receita Médica Padrão', 'receita', NULL,
'Paciente: {{NOME_PACIENTE}}\nIdade: {{IDADE_PACIENTE}}\n\nPrescrevo:\n{{MEDICAMENTOS}}\n\nObservações: {{OBSERVACOES}}',
'{"NOME_PACIENTE": "string", "IDADE_PACIENTE": "number", "MEDICAMENTOS": "array", "OBSERVACOES": "string"}'::jsonb);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.catalogo_exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_exames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para catálogo_exames (público para leitura)
CREATE POLICY "Todos podem ver catálogo de exames" ON public.catalogo_exames FOR SELECT USING (true);

-- Políticas RLS para solicitacoes_exames
CREATE POLICY "Médicos podem gerenciar suas solicitações de exames" ON public.solicitacoes_exames 
FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = solicitacoes_exames.medico_id));

-- Políticas RLS para documentos_medicos
CREATE POLICY "Médicos podem gerenciar seus documentos" ON public.documentos_medicos 
FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = documentos_medicos.medico_id));

-- Políticas RLS para anexos_medicos
CREATE POLICY "Médicos podem gerenciar seus anexos" ON public.anexos_medicos 
FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = anexos_medicos.medico_id));

-- Políticas RLS para templates_documentos (público para leitura)
CREATE POLICY "Todos podem ver templates" ON public.templates_documentos FOR SELECT USING (true);

-- Políticas RLS para medicamentos (público para leitura)
CREATE POLICY "Todos podem ver medicamentos" ON public.medicamentos FOR SELECT USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_catalogo_exames_updated_at BEFORE UPDATE ON public.catalogo_exames FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solicitacoes_exames_updated_at BEFORE UPDATE ON public.solicitacoes_exames FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documentos_medicos_updated_at BEFORE UPDATE ON public.documentos_medicos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
