-- Migração para implementar nova arquitetura de status com dois campos separados
-- Campo status_plantao: Para controle operacional/execução do plantão
-- Campo status_pagamento já existe: Para controle financeiro

-- Criar ENUM para status_plantao
CREATE TYPE status_plantao_enum AS ENUM ('agendado', 'realizado', 'transferido', 'faltou', 'cancelado');

-- Adicionar coluna status_plantao à tabela plantonista_plantao_fixo_realizado
ALTER TABLE plantonista_plantao_fixo_realizado 
ADD COLUMN status_plantao status_plantao_enum NOT NULL DEFAULT 'agendado';

-- Adicionar coluna status_plantao à tabela plantonista_plantao_coringa
ALTER TABLE plantonista_plantao_coringa 
ADD COLUMN status_plantao status_plantao_enum NOT NULL DEFAULT 'agendado';

-- Adicionar coluna foi_passado à tabela plantonista_plantao_coringa para consistência
-- (verifica se já existe antes de adicionar)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plantonista_plantao_coringa' 
                   AND column_name = 'foi_passado') THEN
        ALTER TABLE plantonista_plantao_coringa 
        ADD COLUMN foi_passado boolean NOT NULL DEFAULT false;
    END IF;
END $$;

-- Adicionar colunas de substituto na tabela plantonista_plantao_coringa se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plantonista_plantao_coringa' 
                   AND column_name = 'substituto_nome') THEN
        ALTER TABLE plantonista_plantao_coringa 
        ADD COLUMN substituto_nome text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plantonista_plantao_coringa' 
                   AND column_name = 'justificativa_passagem') THEN
        ALTER TABLE plantonista_plantao_coringa 
        ADD COLUMN justificativa_passagem text;
    END IF;
END $$;

-- Migrar dados existentes do campo status_pagamento para status_plantao
-- Lógica de conversão baseada no sistema atual:

-- Para plantões fixos realizados
UPDATE plantonista_plantao_fixo_realizado 
SET status_plantao = CASE 
    WHEN cancelado = true OR status_pagamento = 'cancelado' THEN 'cancelado'::status_plantao_enum
    WHEN foi_passado = true THEN 'transferido'::status_plantao_enum
    WHEN status_pagamento = 'faltou' THEN 'faltou'::status_plantao_enum
    WHEN status_pagamento = 'realizado' OR status_pagamento = 'pago' THEN 'realizado'::status_plantao_enum
    WHEN status_pagamento = 'pendente' THEN 'agendado'::status_plantao_enum
    ELSE 'agendado'::status_plantao_enum
END;

-- Para plantões coringa (agora com coluna foi_passado adicionada)
UPDATE plantonista_plantao_coringa 
SET status_plantao = CASE 
    WHEN cancelado = true OR status_pagamento = 'cancelado' THEN 'cancelado'::status_plantao_enum
    WHEN foi_passado = true OR status_pagamento = 'passou' THEN 'transferido'::status_plantao_enum
    WHEN status_pagamento = 'faltou' THEN 'faltou'::status_plantao_enum
    WHEN status_pagamento = 'realizado' OR status_pagamento = 'pago' THEN 'realizado'::status_plantao_enum
    WHEN status_pagamento = 'pendente' THEN 'agendado'::status_plantao_enum
    ELSE 'agendado'::status_plantao_enum
END;

-- Normalizar status_pagamento para usar apenas 'pendente' e 'pago'
-- Para plantões fixos realizados
UPDATE plantonista_plantao_fixo_realizado 
SET status_pagamento = CASE 
    WHEN status_pagamento = 'pago' THEN 'pago'
    ELSE 'pendente'
END;

-- Para plantões coringa
UPDATE plantonista_plantao_coringa 
SET status_pagamento = CASE 
    WHEN status_pagamento = 'pago' THEN 'pago'
    ELSE 'pendente'
END;

-- Adicionar índices para melhor performance
CREATE INDEX idx_plantao_fixo_status_plantao ON plantonista_plantao_fixo_realizado(status_plantao);
CREATE INDEX idx_plantao_coringa_status_plantao ON plantonista_plantao_coringa(status_plantao);

-- Índices compostos para consultas de contabilização financeira
CREATE INDEX idx_plantao_fixo_status_combo ON plantonista_plantao_fixo_realizado(status_plantao, status_pagamento);
CREATE INDEX idx_plantao_coringa_status_combo ON plantonista_plantao_coringa(status_plantao, status_pagamento);

-- Comentários para documentação
COMMENT ON COLUMN plantonista_plantao_fixo_realizado.status_plantao IS 'Status operacional do plantão: agendado, realizado, transferido, faltou, cancelado';
COMMENT ON COLUMN plantonista_plantao_coringa.status_plantao IS 'Status operacional do plantão: agendado, realizado, transferido, faltou, cancelado';
COMMENT ON COLUMN plantonista_plantao_fixo_realizado.status_pagamento IS 'Status financeiro do plantão: pendente, pago';
COMMENT ON COLUMN plantonista_plantao_coringa.status_pagamento IS 'Status financeiro do plantão: pendente, pago';
