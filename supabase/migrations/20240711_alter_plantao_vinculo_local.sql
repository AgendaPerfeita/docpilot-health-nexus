-- Adiciona campo local_id obrigatório nas tabelas de plantão
ALTER TABLE plantonista_plantao_fixo_realizado
  ADD COLUMN local_id uuid NOT NULL REFERENCES plantonista_locais_trabalho(id);

ALTER TABLE plantonista_plantao_coringa
  ADD COLUMN local_id uuid NOT NULL REFERENCES plantonista_locais_trabalho(id);

-- Remove campo valor de plantonista_plantao_fixo_realizado, se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='plantonista_plantao_fixo_realizado' AND column_name='valor'
  ) THEN
    ALTER TABLE plantonista_plantao_fixo_realizado DROP COLUMN valor;
  END IF;
END $$; 