-- Criar tabela de transações financeiras para substituir mock data
CREATE TABLE IF NOT EXISTS public.transacoes_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao TEXT NOT NULL,
  valor NUMERIC(12, 2) NOT NULL,
  categoria TEXT NOT NULL,
  data DATE NOT NULL,
  forma_pagamento TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'realizado' CHECK (status IN ('realizado', 'pendente', 'cancelado')),
  paciente_id UUID REFERENCES public.pacientes(id),
  medico_id UUID REFERENCES public.profiles(id),
  consulta_id UUID REFERENCES public.consultas(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transacoes_financeiras ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Usuários podem gerenciar transações de suas clínicas/consultórios"
ON public.transacoes_financeiras
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND (
      p.tipo = 'clinica' OR 
      p.tipo = 'staff' OR 
      (p.tipo = 'medico' AND p.permite_atendimento_individual = true)
    )
    AND p.ativo = true
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_transacoes_financeiras_updated_at
  BEFORE UPDATE ON public.transacoes_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.transacoes_financeiras (tipo, descricao, valor, categoria, data, forma_pagamento, status) VALUES
('entrada', 'Consulta Cardiologia', 200.00, 'Consultas', '2024-01-15', 'Cartão', 'realizado'),
('entrada', 'Exame Ecocardiograma', 150.00, 'Exames', '2024-01-14', 'PIX', 'realizado'),
('entrada', 'Procedimento Pequena Cirurgia', 350.00, 'Procedimentos', '2024-01-13', 'Dinheiro', 'realizado'),
('saida', 'Aluguel da Clínica', 3000.00, 'Aluguel', '2024-01-10', 'Transferência', 'realizado'),
('saida', 'Material Médico', 500.00, 'Materiais Médicos', '2024-01-12', 'Cartão', 'realizado'),
('saida', 'Energia Elétrica', 280.00, 'Utilities', '2024-01-11', 'Boleto', 'realizado'),
('entrada', 'Consulta Pediatria', 180.00, 'Consultas', '2024-01-16', 'PIX', 'realizado'),
('saida', 'Salário Enfermeira', 2500.00, 'Salários', '2024-01-05', 'Transferência', 'realizado');

-- Adicionar colunas extras para melhor controle
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS valor_consulta NUMERIC(10, 2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS comissao_percentual NUMERIC(5, 2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Corrigir search_path em functions existentes (para resolver warnings de segurança)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    nome, 
    tipo,
    documento,
    telefone,
    especialidade,
    crm
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data ->> 'tipo', 'paciente')::public.user_type,
    COALESCE(NEW.raw_user_meta_data ->> 'documento', '00000000000'),
    NEW.raw_user_meta_data ->> 'telefone',
    NEW.raw_user_meta_data ->> 'especialidade',
    NEW.raw_user_meta_data ->> 'crm'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;