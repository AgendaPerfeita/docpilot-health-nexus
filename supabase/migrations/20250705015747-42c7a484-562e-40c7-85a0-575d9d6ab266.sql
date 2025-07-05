-- Criar tabela para vincular médicos a clínicas
CREATE TABLE public.clinica_medicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinica_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medico_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(clinica_id, medico_id)
);

-- Função para validar tipos de usuário e limite de médicos
CREATE OR REPLACE FUNCTION public.validate_clinica_medico()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_clinica_medico
  BEFORE INSERT OR UPDATE ON public.clinica_medicos
  FOR EACH ROW EXECUTE FUNCTION public.validate_clinica_medico();

-- Enable RLS
ALTER TABLE public.clinica_medicos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para clinica_medicos
CREATE POLICY "Clínicas podem ver seus médicos" 
ON public.clinica_medicos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = clinica_id
  )
);

CREATE POLICY "Médicos podem ver suas clínicas" 
ON public.clinica_medicos 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = medico_id
  )
);

CREATE POLICY "Clínicas podem gerenciar seus médicos" 
ON public.clinica_medicos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = clinica_id
  )
);

-- Criar tabela para pacientes das clínicas/médicos
CREATE TABLE public.pacientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf TEXT UNIQUE,
  data_nascimento DATE,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  convenio TEXT,
  numero_convenio TEXT,
  responsavel_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS para pacientes
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- Políticas para pacientes
CREATE POLICY "Médicos/Clínicas podem ver seus pacientes" 
ON public.pacientes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = responsavel_id
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.clinica_medicos cm ON p.id = cm.medico_id
    WHERE p.user_id = auth.uid() AND cm.clinica_id = responsavel_id AND cm.ativo = true
  )
);

CREATE POLICY "Médicos/Clínicas podem gerenciar seus pacientes" 
ON public.pacientes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = responsavel_id
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.clinica_medicos cm ON p.id = cm.medico_id
    WHERE p.user_id = auth.uid() AND cm.clinica_id = responsavel_id AND cm.ativo = true
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_clinica_medicos_updated_at
  BEFORE UPDATE ON public.clinica_medicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at
  BEFORE UPDATE ON public.pacientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();