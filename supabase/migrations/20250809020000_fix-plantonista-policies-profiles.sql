-- Ajusta policies das tabelas de Plantonista para usar o vínculo via public.profiles
-- Compatível com bases onde medico_id armazena profile.id (mais comum no app)
-- e também com bases onde medico_id = auth.users.id (modo alternativo).

-- plantonista_sessoes
DROP POLICY IF EXISTS "Médico vê apenas suas sessões" ON public.plantonista_sessoes;
CREATE POLICY "Médico vê apenas suas sessões"
ON public.plantonista_sessoes
FOR ALL
USING (
  -- Caso medico_id seja auth.users.id
  medico_id = auth.uid()
  OR
  -- Caso medico_id seja public.profiles.id
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.id = public.plantonista_sessoes.medico_id
  )
);

-- plantonista_atendimentos
DROP POLICY IF EXISTS "Médico vê apenas seus atendimentos" ON public.plantonista_atendimentos;
CREATE POLICY "Médico vê apenas seus atendimentos"
ON public.plantonista_atendimentos
FOR ALL
USING (
  medico_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.id = public.plantonista_atendimentos.medico_id
  )
);

-- plantonista_escala_fixa
DROP POLICY IF EXISTS "plantonista_escala_fixa_policy" ON public.plantonista_escala_fixa;
CREATE POLICY "plantonista_escala_fixa_policy"
ON public.plantonista_escala_fixa
FOR ALL
USING (
  -- Preferir checagem via profiles (medico_id armazena profiles.id)
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.id = public.plantonista_escala_fixa.medico_id
  )
  OR
  -- Compatibilidade caso medico_id seja auth.users.id
  public.plantonista_escala_fixa.medico_id = auth.uid()
);

-- plantonista_locais_trabalho
DROP POLICY IF EXISTS "plantonista_locais_trabalho_policy" ON public.plantonista_locais_trabalho;
CREATE POLICY "plantonista_locais_trabalho_policy"
ON public.plantonista_locais_trabalho
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.id = public.plantonista_locais_trabalho.medico_id
  )
  OR
  public.plantonista_locais_trabalho.medico_id = auth.uid()
);

-- plantonista_plantao_fixo_realizado
DROP POLICY IF EXISTS "plantonista_plantao_fixo_realizado_policy" ON public.plantonista_plantao_fixo_realizado;
CREATE POLICY "plantonista_plantao_fixo_realizado_policy"
ON public.plantonista_plantao_fixo_realizado
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.plantonista_escala_fixa ef
    JOIN public.profiles p ON p.id = ef.medico_id
    WHERE ef.id = public.plantonista_plantao_fixo_realizado.escala_fixa_id
      AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1
    FROM public.plantonista_escala_fixa ef
    WHERE ef.id = public.plantonista_plantao_fixo_realizado.escala_fixa_id
      AND ef.medico_id = auth.uid()
  )
);

-- plantonista_plantao_coringa
DROP POLICY IF EXISTS "plantonista_plantao_coringa_policy" ON public.plantonista_plantao_coringa;
CREATE POLICY "plantonista_plantao_coringa_policy"
ON public.plantonista_plantao_coringa
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.id = public.plantonista_plantao_coringa.medico_id
  )
  OR
  public.plantonista_plantao_coringa.medico_id = auth.uid()
);

-- plantonista_escala_fixa_cancelamentos (usuario_id referencia profiles.id)
DROP POLICY IF EXISTS "plantonista_escala_fixa_cancelamentos_policy" ON public.plantonista_escala_fixa_cancelamentos;
CREATE POLICY "plantonista_escala_fixa_cancelamentos_policy"
ON public.plantonista_escala_fixa_cancelamentos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.id = public.plantonista_escala_fixa_cancelamentos.usuario_id
  )
);


