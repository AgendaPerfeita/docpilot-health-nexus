-- 1. Escalas fixas do plantonista
CREATE TABLE plantonista_escala_fixa (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id uuid NOT NULL,
    dia_semana integer NOT NULL, -- 0=Domingo, 1=Segunda, ..., 6=Sábado
    valor_mensal numeric(12,2) NOT NULL,
    horario_inicio time NOT NULL,
    horario_fim time NOT NULL,
    carga_horaria interval NOT NULL,
    data_pagamento integer NOT NULL, -- dia do mês para pagamento (ex: 15)
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Plantões fixos realizados (um por data)
CREATE TABLE plantonista_plantao_fixo_realizado (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    escala_fixa_id uuid REFERENCES plantonista_escala_fixa(id) ON DELETE CASCADE,
    data date NOT NULL,
    valor numeric(12,2) NOT NULL,
    status_pagamento text NOT NULL DEFAULT 'pendente', -- 'pendente', 'pago'
    data_pagamento_prevista date NOT NULL,
    data_pagamento_efetiva date,
    foi_passado boolean NOT NULL DEFAULT false,
    substituto_id uuid, -- pode ser null se não for cadastrado
    substituto_nome text, -- opcional, se não for cadastrado
    justificativa_passagem text, -- opcional, visível só para o plantonista
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Plantões coringa (avulsos)
CREATE TABLE plantonista_plantao_coringa (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id uuid NOT NULL,
    data date NOT NULL,
    horario_inicio time NOT NULL,
    horario_fim time NOT NULL,
    valor numeric(12,2) NOT NULL,
    status_pagamento text NOT NULL DEFAULT 'pendente', -- 'pendente', 'pago'
    data_pagamento_prevista date NOT NULL,
    data_pagamento_efetiva date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Índices para performance (opcional)
CREATE INDEX idx_escala_fixa_medico ON plantonista_escala_fixa(medico_id);
CREATE INDEX idx_plantao_fixo_escala ON plantonista_plantao_fixo_realizado(escala_fixa_id);
CREATE INDEX idx_plantao_fixo_data ON plantonista_plantao_fixo_realizado(data);
CREATE INDEX idx_plantao_coringa_medico ON plantonista_plantao_coringa(medico_id);
CREATE INDEX idx_plantao_coringa_data ON plantonista_plantao_coringa(data);