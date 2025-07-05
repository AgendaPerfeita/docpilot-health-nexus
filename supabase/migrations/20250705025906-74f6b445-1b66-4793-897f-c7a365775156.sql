-- Adicionar campos de origem e informações financeiras aos pacientes
ALTER TABLE public.pacientes 
ADD COLUMN origem TEXT DEFAULT 'Indicação' CHECK (origem IN ('Google', 'Instagram', 'Facebook', 'Indicação', 'Marketplace', 'WhatsApp')),
ADD COLUMN total_gasto DECIMAL(10,2) DEFAULT 0,
ADD COLUMN ticket_medio DECIMAL(10,2) DEFAULT 0,
ADD COLUMN total_consultas INTEGER DEFAULT 0;