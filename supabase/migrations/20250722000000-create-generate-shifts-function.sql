-- supabase/migrations/20250722000000-create-generate-shifts-function.sql

CREATE OR REPLACE FUNCTION public.generate_monthly_shifts(
    p_user_id uuid,
    p_ano integer,
    p_mes integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    escala RECORD;
    dia_plantao DATE;
    total_plantoes_no_mes INTEGER;
    valor_plantao NUMERIC;
    data_inicio DATE;
    data_fim DATE;
    conflito_existente BOOLEAN;
    data_pagamento_prevista DATE;
BEGIN
    -- Define o início e o fim do mês
    data_inicio := MAKE_DATE(p_ano, p_mes, 1);
    data_fim := (data_inicio + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    -- Apaga apenas os plantões fixos PENDENTES do médico para o mês/ano especificado
    -- Isso garante a idempotência e não afeta plantões já pagos, passados ou cancelados.
    DELETE FROM public.plantonista_plantao_fixo_realizado p
    WHERE p.escala_fixa_id IN (SELECT id FROM public.plantonista_escala_fixa WHERE medico_id = p_user_id)
      AND p.status_pagamento = 'pendente'
      AND EXTRACT(YEAR FROM p.data) = p_ano
      AND EXTRACT(MONTH FROM p.data) = p_mes;

    -- Itera sobre cada escala fixa do médico
    FOR escala IN
        SELECT * FROM public.plantonista_escala_fixa WHERE medico_id = p_user_id
    LOOP
        -- Calcula o número total de plantões para esta escala no mês
        total_plantoes_no_mes := 0;
        FOR dia_plantao IN SELECT generate_series(data_inicio, data_fim, '1 day')::DATE LOOP
            IF EXTRACT(DOW FROM dia_plantao) = escala.dia_semana THEN
                total_plantoes_no_mes := total_plantoes_no_mes + 1;
            END IF;
        END LOOP;

        -- Calcula o valor por plantão
        IF total_plantoes_no_mes > 0 THEN
            valor_plantao := (escala.valor_mensal / total_plantoes_no_mes)::NUMERIC(12, 2);
        ELSE
            valor_plantao := 0;
        END IF;

        -- Gera os plantões para o mês
        FOR dia_plantao IN SELECT generate_series(data_inicio, data_fim, '1 day')::DATE LOOP
            IF EXTRACT(DOW FROM dia_plantao) = escala.dia_semana THEN

                -- Calcula a data de pagamento prevista para o mês seguinte
                data_pagamento_prevista := (date_trunc('month', dia_plantao) + interval '1 month' + (escala.data_pagamento - 1 || ' days')::interval)::date;


                -- Lógica de verificação de conflitos (placeholder, pode ser expandida)
                -- Por enquanto, a lógica de DELETE acima previne duplicatas da mesma escala.
                -- Esta verificação poderia ser usada para checar contra plantões coringa ou de outras escalas.
                conflito_existente := FALSE; -- Simplificado por enquanto

                IF NOT conflito_existente THEN
                    INSERT INTO public.plantonista_plantao_fixo_realizado (
                        escala_fixa_id,
                        data,
                        valor,
                        status_pagamento,
                        data_pagamento_prevista,
                        foi_passado,
                        local_id
                    )
                    VALUES (
                        escala.id,
                        dia_plantao,
                        valor_plantao,
                        'pendente',
                        data_pagamento_prevista,
                        FALSE,
                        escala.local_id
                    );
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END;
$$; 