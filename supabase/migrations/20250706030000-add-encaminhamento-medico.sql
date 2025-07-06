-- Adicionar opção "Encaminhamento Médico" ao campo origem
ALTER TABLE public.pacientes 
DROP CONSTRAINT IF EXISTS pacientes_origem_check;

ALTER TABLE public.pacientes 
ADD CONSTRAINT pacientes_origem_check 
CHECK (origem IN ('Google', 'Instagram', 'Facebook', 'Indicação', 'Marketplace', 'WhatsApp', 'Encaminhamento Médico'));

COMMENT ON COLUMN pacientes.origem IS 'Como o paciente chegou até a clínica (Google, Instagram, Indicação, Encaminhamento Médico, etc)'; 