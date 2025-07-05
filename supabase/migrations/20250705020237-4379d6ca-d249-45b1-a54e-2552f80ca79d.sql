-- Criar tabela para consultas/agendamentos
CREATE TABLE public.consultas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  medico_id UUID NOT NULL REFERENCES public.profiles(id),
  clinica_id UUID REFERENCES public.profiles(id),
  data_consulta TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'confirmada', 'em_andamento', 'concluida', 'cancelada')),
  tipo_consulta TEXT NOT NULL DEFAULT 'consulta' CHECK (tipo_consulta IN ('consulta', 'retorno', 'emergencia')),
  valor DECIMAL(10,2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para prontuários/evoluções
CREATE TABLE public.prontuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES public.consultas(id),
  medico_id UUID NOT NULL REFERENCES public.profiles(id),
  data_atendimento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  queixa_principal TEXT,
  historia_doenca_atual TEXT,
  exame_fisico TEXT,
  hipotese_diagnostica TEXT,
  conduta TEXT,
  prescricao TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para prescrições
CREATE TABLE public.prescricoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prontuario_id UUID NOT NULL REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  medicamento TEXT NOT NULL,
  dosagem TEXT NOT NULL,
  frequencia TEXT NOT NULL,
  duracao TEXT NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para convênios
CREATE TABLE public.convenios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  telefone TEXT,
  email TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS para todas as tabelas
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescricoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;

-- Políticas para consultas
CREATE POLICY "Médicos podem ver suas consultas" 
ON public.consultas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = medico_id
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.clinica_medicos cm ON p.id = cm.medico_id
    WHERE p.user_id = auth.uid() AND cm.clinica_id = clinica_id AND cm.ativo = true
  )
);

CREATE POLICY "Médicos podem gerenciar suas consultas" 
ON public.consultas 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = medico_id
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.clinica_medicos cm ON p.id = cm.medico_id
    WHERE p.user_id = auth.uid() AND cm.clinica_id = clinica_id AND cm.ativo = true
  )
);

-- Políticas para prontuários
CREATE POLICY "Médicos podem ver seus prontuários" 
ON public.prontuarios 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = medico_id
  )
);

CREATE POLICY "Médicos podem gerenciar seus prontuários" 
ON public.prontuarios 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = medico_id
  )
);

-- Políticas para prescrições
CREATE POLICY "Ver prescrições via prontuário" 
ON public.prescricoes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.prontuarios pr
    JOIN public.profiles p ON pr.medico_id = p.id
    WHERE pr.id = prontuario_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Gerenciar prescrições via prontuário" 
ON public.prescricoes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.prontuarios pr
    JOIN public.profiles p ON pr.medico_id = p.id
    WHERE pr.id = prontuario_id AND p.user_id = auth.uid()
  )
);

-- Políticas para convênios (todos podem ver, só admins gerenciam)
CREATE POLICY "Todos podem ver convênios" 
ON public.convenios 
FOR SELECT 
USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_consultas_updated_at
  BEFORE UPDATE ON public.consultas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prontuarios_updated_at
  BEFORE UPDATE ON public.prontuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_convenios_updated_at
  BEFORE UPDATE ON public.convenios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns convênios padrão
INSERT INTO public.convenios (nome, telefone) VALUES 
('Particular', ''),
('Unimed', '0800-123-4567'),
('Bradesco Saúde', '0800-234-5678'),
('Amil', '0800-345-6789'),
('SulAmérica', '0800-456-7890');