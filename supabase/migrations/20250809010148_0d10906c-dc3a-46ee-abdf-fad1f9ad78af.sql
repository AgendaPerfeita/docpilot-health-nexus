
-- Observação: este script mantém a lógica atual, mas otimiza o desempenho:
-- - Troca auth.uid() -> (select auth.uid())
-- - Consolida políticas duplicadas por ação
-- Revise os nomes das políticas: usamos exatamente os nomes reportados pelo Advisor quando possível.

---------------------------
-- PERF: profiles
---------------------------
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff pode ver seu próprio profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff pode atualizar seu próprio profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff pode inserir seu próprio profile" ON public.profiles;

-- Uma política por ação, válida tanto para "Users" quanto para "Staff" (perfil do próprio usuário)
CREATE POLICY "Usuário pode ver seu próprio profile"
  ON public.profiles
  FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "Usuário pode inserir seu próprio profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Usuário pode atualizar seu próprio profile"
  ON public.profiles
  FOR UPDATE
  USING (user_id = (select auth.uid()));

CREATE POLICY "Usuário pode deletar seu próprio profile"
  ON public.profiles
  FOR DELETE
  USING (user_id = (select auth.uid()));

---------------------------
-- PERF: clinica_medicos
---------------------------
DROP POLICY IF EXISTS "Clínicas podem gerenciar seus médicos" ON public.clinica_medicos;
DROP POLICY IF EXISTS "Clínicas podem ver seus médicos" ON public.clinica_medicos;
DROP POLICY IF EXISTS "Médicos podem ver suas clínicas" ON public.clinica_medicos;

-- SELECT único para participantes (clínica ou médico)
CREATE POLICY "Participantes podem ver seus vínculos"
  ON public.clinica_medicos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND (p.id = clinica_medicos.clinica_id OR p.id = clinica_medicos.medico_id)
    )
  );

-- Gerenciamento pela clínica sem sobrepor SELECT
CREATE POLICY "Clínica pode inserir vínculos"
  ON public.clinica_medicos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND p.id = clinica_medicos.clinica_id
    )
  );

CREATE POLICY "Clínica pode atualizar vínculos"
  ON public.clinica_medicos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND p.id = clinica_medicos.clinica_id
    )
  );

CREATE POLICY "Clínica pode deletar vínculos"
  ON public.clinica_medicos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND p.id = clinica_medicos.clinica_id
    )
  );

---------------------------
-- PERF: documentos_compartilhados (consolidar SELECT)
---------------------------
DROP POLICY IF EXISTS "Médico/Clínica pode ver compartilhamentos feitos com ele" ON public.documentos_compartilhados;
DROP POLICY IF EXISTS "Paciente pode ver seus compartilhamentos" ON public.documentos_compartilhados;

CREATE POLICY "Participantes e paciente podem ver compartilhamentos"
  ON public.documentos_compartilhados
  FOR SELECT
  USING (
    -- Médico/Clínica explicitamente compartilhados
    (medico_id = (SELECT id FROM public.profiles WHERE user_id = (select auth.uid()))
     OR
     clinica_id = (SELECT id FROM public.profiles WHERE user_id = (select auth.uid()))
    )
    OR
    -- Paciente autenticado (via CPF vinculado ao profile)
    EXISTS (
      SELECT 1
      FROM public.exames_uploads eu
      JOIN public.pacientes p ON p.id = eu.paciente_id
      WHERE eu.id = documentos_compartilhados.exame_id
        AND p.cpf IS NOT NULL
        AND p.cpf = (
          SELECT documento
          FROM public.profiles
          WHERE user_id = (select auth.uid()) AND tipo = 'paciente'
        )
    )
    OR
    -- Médico vinculado ao paciente do exame
    EXISTS (
      SELECT 1
      FROM public.exames_uploads eu
      JOIN public.paciente_medico pm ON pm.paciente_id = eu.paciente_id
      JOIN public.profiles prof ON prof.id = pm.medico_id
      WHERE eu.id = documentos_compartilhados.exame_id
        AND prof.user_id = (select auth.uid())
    )
    OR
    -- Staff autenticado (mantém a lógica anterior)
    EXISTS (
      SELECT 1
      FROM public.profiles staff
      WHERE staff.tipo = 'staff' AND staff.user_id = (select auth.uid())
    )
  );

---------------------------
-- PERF: documentos_visualizacoes (consolidar SELECT)
---------------------------
DROP POLICY IF EXISTS "Médico/Clínica pode ver logs de exames compartilhados" ON public.documentos_visualizacoes;
DROP POLICY IF EXISTS "Paciente pode ver logs dos seus exames" ON public.documentos_visualizacoes;
DROP POLICY IF EXISTS "Visualizador pode ver seus próprios logs" ON public.documentos_visualizacoes;

CREATE POLICY "Todos participantes podem ver logs de exames"
  ON public.documentos_visualizacoes
  FOR SELECT
  USING (
    -- Médico/Clínica com compartilhamento do exame
    EXISTS (
      SELECT 1
      FROM public.documentos_compartilhados dc
      WHERE dc.exame_id = documentos_visualizacoes.exame_id
        AND (
          dc.medico_id = (SELECT id FROM public.profiles WHERE user_id = (select auth.uid()))
          OR
          dc.clinica_id = (SELECT id FROM public.profiles WHERE user_id = (select auth.uid()))
        )
    )
    OR
    -- Paciente autenticado via CPF
    EXISTS (
      SELECT 1
      FROM public.exames_uploads eu
      JOIN public.pacientes p ON p.id = eu.paciente_id
      WHERE eu.id = documentos_visualizacoes.exame_id
        AND p.cpf IS NOT NULL
        AND p.cpf = (
          SELECT documento
          FROM public.profiles
          WHERE user_id = (select auth.uid()) AND tipo = 'paciente'
        )
    )
    OR
    -- Médico vinculado ao paciente
    EXISTS (
      SELECT 1
      FROM public.exames_uploads eu
      JOIN public.paciente_medico pm ON pm.paciente_id = eu.paciente_id
      JOIN public.profiles prof ON prof.id = pm.medico_id
      WHERE eu.id = documentos_visualizacoes.exame_id
        AND prof.user_id = (select auth.uid())
    )
    OR
    -- Visualizador vê seus próprios logs
    visualizador_id = (SELECT id FROM public.profiles WHERE user_id = (select auth.uid()))
    OR
    -- Staff autenticado (mantém lógica anterior se existir)
    EXISTS (
      SELECT 1
      FROM public.profiles staff
      WHERE staff.tipo = 'staff' AND staff.user_id = (select auth.uid())
    )
  );

---------------------------
-- PERF: exames_uploads (consolidar SELECT)
---------------------------
DROP POLICY IF EXISTS "Médico/Clínica pode ver exames compartilhados" ON public.exames_uploads;
DROP POLICY IF EXISTS "Paciente pode ver seus uploads" ON public.exames_uploads;

CREATE POLICY "Participantes e paciente podem ver exames"
  ON public.exames_uploads
  FOR SELECT
  USING (
    -- Compartilhado com médico/clínica
    EXISTS (
      SELECT 1
      FROM public.documentos_compartilhados dc
      WHERE dc.exame_id = exames_uploads.id
        AND (
          dc.medico_id = (SELECT id FROM public.profiles WHERE user_id = (select auth.uid()))
          OR
          dc.clinica_id = (SELECT id FROM public.profiles WHERE user_id = (select auth.uid()))
        )
    )
    OR
    -- Paciente autenticado (via CPF do profile)
    EXISTS (
      SELECT 1
      FROM public.pacientes p
      WHERE p.id = exames_uploads.paciente_id
        AND p.cpf IS NOT NULL
        AND p.cpf = (
          SELECT documento
          FROM public.profiles
          WHERE user_id = (select auth.uid()) AND tipo = 'paciente'
        )
    )
    OR
    -- Médico vinculado ao paciente do upload
    EXISTS (
      SELECT 1
      FROM public.paciente_medico pm
      JOIN public.profiles prof ON prof.id = pm.medico_id
      WHERE pm.paciente_id = exames_uploads.paciente_id
        AND prof.user_id = (select auth.uid())
    )
    OR
    -- Staff autenticado (mantém lógica anterior)
    EXISTS (
      SELECT 1
      FROM public.profiles staff
      WHERE staff.tipo = 'staff' AND staff.user_id = (select auth.uid())
    )
  );

---------------------------
-- PERF: prescricoes (consolidar SELECT e gerenciar)
---------------------------
DROP POLICY IF EXISTS "Ver prescrições via prontuário" ON public.prescricoes;
DROP POLICY IF EXISTS "Gerenciar prescrições via prontuário" ON public.prescricoes;

-- SELECT único (via vínculo ao prontuário do médico)
CREATE POLICY "Prescrições: ver via prontuário do médico"
  ON public.prescricoes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.prontuarios pr
      JOIN public.profiles p ON p.id = pr.medico_id
      WHERE pr.id = prescricoes.prontuario_id
        AND p.user_id = (select auth.uid())
    )
  );

-- Gerenciar (INSERT/UPDATE/DELETE) com a mesma condição
CREATE POLICY "Prescrições: inserir via prontuário do médico"
  ON public.prescricoes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.prontuarios pr
      JOIN public.profiles p ON p.id = pr.medico_id
      WHERE pr.id = prescricoes.prontuario_id
        AND p.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Prescrições: atualizar via prontuário do médico"
  ON public.prescricoes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.prontuarios pr
      JOIN public.profiles p ON p.id = pr.medico_id
      WHERE pr.id = prescricoes.prontuario_id
        AND p.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Prescrições: deletar via prontuário do médico"
  ON public.prescricoes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.prontuarios pr
      JOIN public.profiles p ON p.id = pr.medico_id
      WHERE pr.id = prescricoes.prontuario_id
        AND p.user_id = (select auth.uid())
    )
  );

---------------------------
-- PERF: prontuarios (consolidar SELECT e gerenciar)
---------------------------
DROP POLICY IF EXISTS "Médicos podem ver seus prontuários" ON public.prontuarios;
DROP POLICY IF EXISTS "Médicos podem gerenciar seus prontuários" ON public.prontuarios;

CREATE POLICY "Prontuários: médico pode ver seus próprios"
  ON public.prontuarios
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = prontuarios.medico_id
        AND p.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Prontuários: médico pode inserir"
  ON public.prontuarios
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = prontuarios.medico_id
        AND p.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Prontuários: médico pode atualizar"
  ON public.prontuarios
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = prontuarios.medico_id
        AND p.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Prontuários: médico pode deletar"
  ON public.prontuarios
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = prontuarios.medico_id
        AND p.user_id = (select auth.uid())
    )
  );

---------------------------
-- PERF: plantonista_sessoes (evitar ALL sobrepor INSERT)
---------------------------
DROP POLICY IF EXISTS "Médico vê apenas suas sessões" ON public.plantonista_sessoes;
DROP POLICY IF EXISTS "Médico pode criar sua própria sessão" ON public.plantonista_sessoes;

-- Recriar sem ALL
CREATE POLICY "Plantonista: inserir própria sessão"
  ON public.plantonista_sessoes
  FOR INSERT
  WITH CHECK ((select auth.uid()) = medico_id);

CREATE POLICY "Plantonista: ver próprias sessões"
  ON public.plantonista_sessoes
  FOR SELECT
  USING (medico_id = (select auth.uid()));

CREATE POLICY "Plantonista: atualizar próprias sessões"
  ON public.plantonista_sessoes
  FOR UPDATE
  USING (medico_id = (select auth.uid()));

CREATE POLICY "Plantonista: deletar próprias sessões"
  ON public.plantonista_sessoes
  FOR DELETE
  USING (medico_id = (select auth.uid()));

---------------------------
-- PERF: consultas (initplan)
---------------------------
DROP POLICY IF EXISTS "Médicos podem gerenciar suas consultas" ON public.consultas;

CREATE POLICY "Consultas: médicos e clínicas gerenciam"
  ON public.consultas
  FOR ALL
  USING (
    (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.user_id = (select auth.uid())
          AND p.id = consultas.medico_id
          AND p.plano_medico = 'premium'
      )
    )
    OR
    (
      EXISTS (
        SELECT 1
        FROM public.profiles p
        JOIN public.clinica_medicos cm ON p.id = cm.medico_id
        WHERE p.user_id = (select auth.uid())
          AND cm.clinica_id = consultas.clinica_id
          AND cm.ativo = true
      )
    )
  );

---------------------------
-- PERF: backup_configuracoes (initplan)
---------------------------
DROP POLICY IF EXISTS "Usuários podem gerenciar suas configurações de backup" ON public.backup_configuracoes;

CREATE POLICY "Backup: usuário gerencia suas configs"
  ON public.backup_configuracoes
  FOR ALL
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

---------------------------
-- PERF: backup_logs (initplan)
---------------------------
DROP POLICY IF EXISTS "Usuários podem ver seus logs de backup" ON public.backup_logs;
DROP POLICY IF EXISTS "Usuários podem criar logs de backup" ON public.backup_logs;
DROP POLICY IF EXISTS "Usuários podem atualizar seus logs de backup" ON public.backup_logs;

CREATE POLICY "Backup logs: ver"
  ON public.backup_logs
  FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "Backup logs: inserir"
  ON public.backup_logs
  FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Backup logs: atualizar"
  ON public.backup_logs
  FOR UPDATE
  USING (user_id = (select auth.uid()));

---------------------------
-- PERF: documentos_medicos (initplan)
---------------------------
DROP POLICY IF EXISTS "Médicos podem gerenciar seus documentos" ON public.documentos_medicos;

CREATE POLICY "Documentos: médico gerencia seus documentos"
  ON public.documentos_medicos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND p.id = documentos_medicos.medico_id
    )
  );

---------------------------
-- PERF: assinaturas_digitais (initplan)
---------------------------
DROP POLICY IF EXISTS "Médicos podem ver suas assinaturas" ON public.assinaturas_digitais;

CREATE POLICY "Assinaturas digitais: médico vê as suas"
  ON public.assinaturas_digitais
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.documentos_medicos dm
      JOIN public.profiles p ON p.id = dm.medico_id
      WHERE dm.id = assinaturas_digitais.documento_id
        AND p.user_id = (select auth.uid())
    )
  );

-- A política de INSERT "Sistema pode inserir assinaturas" permanece aberta ao sistema (sem USING), não alteramos.

---------------------------
-- PERF: documentos_auditoria (initplan)
---------------------------
DROP POLICY IF EXISTS "Médicos podem ver auditoria de seus documentos" ON public.documentos_auditoria;

CREATE POLICY "Docs auditoria: médico vê seus logs"
  ON public.documentos_auditoria
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.documentos_medicos dm
      JOIN public.profiles p ON p.id = dm.medico_id
      WHERE dm.id = documentos_auditoria.documento_id
        AND p.user_id = (select auth.uid())
    )
  );

-- A política de INSERT do sistema permanece.

---------------------------
-- PERF: transacoes_financeiras (initplan)
---------------------------
-- Ajuste para evitar reavaliação por linha; substituir por um conjunto consolidado.
DROP POLICY IF EXISTS "Usuários podem gerenciar transações de suas clínicas/consul" ON public.transacoes_financeiras;

CREATE POLICY "Transações: usuário gerencia do seu contexto"
  ON public.transacoes_financeiras
  FOR ALL
  USING (
    -- usuário é médico dono do registro
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND (p.id = transacoes_financeiras.medico_id
             OR p.id = transacoes_financeiras.clinica_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND (p.id = transacoes_financeiras.medico_id
             OR p.id = transacoes_financeiras.clinica_id)
    )
  );

---------------------------
-- PERF: solicitacoes_exames (initplan)
---------------------------
DROP POLICY IF EXISTS "Médicos podem gerenciar suas solicitações de exames" ON public.solicitacoes_exames;

CREATE POLICY "Solicitações de exames: médico gerencia as suas"
  ON public.solicitacoes_exames
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND p.id = solicitacoes_exames.medico_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.user_id = (select auth.uid())
        AND p.id = solicitacoes_exames.medico_id
    )
  );

