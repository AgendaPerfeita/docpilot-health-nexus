-- Adicionar coluna cancelado à tabela plantonista_plantao_fixo_realizado
ALTER TABLE plantonista_plantao_fixo_realizado 
ADD COLUMN cancelado boolean NOT NULL DEFAULT false;

-- Adicionar coluna cancelado à tabela plantonista_plantao_coringa também
ALTER TABLE plantonista_plantao_coringa 
ADD COLUMN cancelado boolean NOT NULL DEFAULT false;

-- Adicionar índices para melhor performance nas consultas de cancelamento
CREATE INDEX idx_plantao_fixo_cancelado ON plantonista_plantao_fixo_realizado(cancelado);
CREATE INDEX idx_plantao_coringa_cancelado ON plantonista_plantao_coringa(cancelado);
