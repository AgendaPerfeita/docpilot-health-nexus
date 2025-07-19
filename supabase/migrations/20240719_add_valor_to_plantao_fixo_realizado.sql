-- Adiciona o campo valor para rastreio financeiro dos plantões fixos realizados
ALTER TABLE plantonista_plantao_fixo_realizado
ADD COLUMN valor numeric(12,2); 