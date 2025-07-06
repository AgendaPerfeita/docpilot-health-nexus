-- Adicionar campo origem na tabela pacientes
ALTER TABLE pacientes ADD COLUMN origem TEXT DEFAULT 'Indicação';

-- Adicionar comentário na coluna
COMMENT ON COLUMN pacientes.origem IS 'Como o paciente chegou até a clínica (Google, Instagram, Indicação, etc)';

-- Atualizar os dados existentes
UPDATE pacientes SET origem = 'Indicação' WHERE origem IS NULL;