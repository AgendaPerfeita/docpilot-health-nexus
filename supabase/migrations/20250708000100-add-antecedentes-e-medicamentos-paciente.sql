ALTER TABLE pacientes ADD COLUMN antecedentes_clinicos TEXT;
ALTER TABLE pacientes ADD COLUMN antecedentes_cirurgicos TEXT;
ALTER TABLE pacientes ADD COLUMN antecedentes_familiares TEXT;
ALTER TABLE pacientes ADD COLUMN antecedentes_habitos TEXT;
ALTER TABLE pacientes ADD COLUMN antecedentes_alergias TEXT;
ALTER TABLE pacientes ADD COLUMN medicamentos_em_uso JSONB; 