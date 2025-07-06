-- Adicionar campo bairro na tabela pacientes
ALTER TABLE public.pacientes 
ADD COLUMN bairro TEXT;

COMMENT ON COLUMN pacientes.bairro IS 'Bairro do endereço do paciente'; 