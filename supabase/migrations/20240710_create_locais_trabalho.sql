CREATE TABLE plantonista_locais_trabalho (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id uuid NOT NULL,
    nome text NOT NULL,
    tipo text NOT NULL,
    endereco text,
    telefone text,
    email text,
    regra text NOT NULL, -- 'fixo' ou 'faixa'
    faixas jsonb, -- array de objetos { atendimentos, valor }
    contabilidade text, -- 'todas_semanas' ou 'media_mensal'
    status text NOT NULL DEFAULT 'ativo',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_plantonista_locais_trabalho_medico ON plantonista_locais_trabalho(medico_id); 