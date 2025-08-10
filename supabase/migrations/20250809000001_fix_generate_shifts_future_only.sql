-- Corrigir a função generate_monthly_shifts para só gerar plantões futuros
CREATE OR REPLACE FUNCTION public.generate_monthly_shifts(p_user_id uuid, p_ano integer, p_mes integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
DECLARE
    escala RECORD;
    dia_plantao DATE;
    total_plantoes_no_mes INTEGER;
    valor_plantao NUMERIC;
    data_inicio DATE;
    data_fim DATE;
    data_pagamento_prevista DATE;
    hoje DATE;
BEGIN
    hoje := CURRENT_DATE;
    data_inicio := MAKE_DATE(p_ano, p_mes, 1);
    data_fim := (data_inicio + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

    -- Se o mês já passou, não gera plantões
    IF data_fim < hoje THEN
        RETURN;
    END IF;

    -- Se estamos no mês atual, começa a partir de hoje
    IF data_inicio <= hoje AND data_fim >= hoje THEN
        data_inicio := hoje;
    END IF;

    FOR escala IN
        SELECT * FROM public.plantonista_escala_fixa WHERE medico_id = p_user_id
    LOOP
        -- Conta quantos plantões para esta escala neste mês (apenas futuros)
        total_plantoes_no_mes := 0;
        FOR dia_plantao IN SELECT generate_series(data_inicio, data_fim, '1 day')::DATE LOOP
            IF EXTRACT(DOW FROM dia_plantao) = escala.dia_semana THEN
                total_plantoes_no_mes := total_plantoes_no_mes + 1;
            END IF;
        END LOOP;

        IF total_plantoes_no_mes > 0 THEN
            valor_plantao := (escala.valor_mensal / total_plantoes_no_mes)::NUMERIC(12, 2);
        ELSE
            valor_plantao := 0;
        END IF;

        FOR dia_plantao IN SELECT generate_series(data_inicio, data_fim, '1 day')::DATE LOOP
            IF EXTRACT(DOW FROM dia_plantao) = escala.dia_semana THEN
                data_pagamento_prevista := (date_trunc('month', dia_plantao) + interval '1 month' + (escala.data_pagamento - 1 || ' days')::interval)::date;

                -- Só insere se NÃO existir plantão para esta escala, data e local
                IF NOT EXISTS (
                    SELECT 1 FROM public.plantonista_plantao_fixo_realizado p
                    WHERE p.escala_fixa_id = escala.id
                      AND p.data = dia_plantao
                ) THEN
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
$function$;
