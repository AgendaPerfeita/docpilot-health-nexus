-- Novas policies para modelo multi-clínica/multi-médico (corrigidas para vínculo via CPF)

-- 1. chat_mensagens
CREATE POLICY "Participantes podem ver suas mensagens" ON public.chat_mensagens
FOR SELECT USING (
  -- O usuário é o paciente (via CPF)
  EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = chat_mensagens.patient_id
      AND p.cpf IS NOT NULL
      AND p.cpf = (SELECT documento FROM public.profiles WHERE user_id = auth.uid() AND tipo = 'paciente')
  )
  -- O usuário é um médico vinculado ao paciente na clínica do chat
  OR EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles prof ON prof.id = pm.medico_id
    WHERE pm.paciente_id = chat_mensagens.patient_id
      AND pm.clinica_id = chat_mensagens.clinica_id
      AND prof.user_id = auth.uid()
  )
  -- O usuário é staff da clínica do chat
  OR EXISTS (
    SELECT 1 FROM public.profiles staff
    WHERE staff.tipo = 'staff'
      AND staff.user_id = auth.uid()
      AND staff.clinica_id = chat_mensagens.clinica_id
  )
);

-- 2. exames_uploads
CREATE POLICY "Paciente pode ver seus uploads" ON public.exames_uploads
FOR SELECT USING (
  -- O usuário é o paciente (via CPF)
  EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = exames_uploads.paciente_id
      AND p.cpf IS NOT NULL
      AND p.cpf = (SELECT documento FROM public.profiles WHERE user_id = auth.uid() AND tipo = 'paciente')
  )
  -- O usuário é um médico vinculado ao paciente
  OR EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles prof ON prof.id = pm.medico_id
    WHERE pm.paciente_id = exames_uploads.paciente_id
      AND prof.user_id = auth.uid()
  )
  -- O usuário é staff (ajuste conforme seu modelo de staff)
  OR EXISTS (
    SELECT 1 FROM public.profiles staff
    WHERE staff.tipo = 'staff'
      AND staff.user_id = auth.uid()
      -- staff.clinica_id pode ser null para staff global, ajuste conforme seu modelo
  )
);

-- 3. documentos_compartilhados
CREATE POLICY "Paciente pode ver seus compartilhamentos" ON public.documentos_compartilhados
FOR SELECT USING (
  -- O usuário é o paciente (via CPF)
  EXISTS (
    SELECT 1 FROM public.exames_uploads eu
    JOIN public.pacientes p ON p.id = eu.paciente_id
    WHERE eu.id = documentos_compartilhados.exame_id
      AND p.cpf IS NOT NULL
      AND p.cpf = (SELECT documento FROM public.profiles WHERE user_id = auth.uid() AND tipo = 'paciente')
  )
  -- O usuário é um médico vinculado ao paciente
  OR EXISTS (
    SELECT 1 FROM public.exames_uploads eu
    JOIN public.paciente_medico pm ON pm.paciente_id = eu.paciente_id
    JOIN public.profiles prof ON prof.id = pm.medico_id
    WHERE eu.id = documentos_compartilhados.exame_id
      AND prof.user_id = auth.uid()
  )
  -- O usuário é staff (ajuste conforme seu modelo de staff)
  OR EXISTS (
    SELECT 1 FROM public.profiles staff
    WHERE staff.tipo = 'staff'
      AND staff.user_id = auth.uid()
      -- staff.clinica_id pode ser null para staff global, ajuste conforme seu modelo
  )
);

-- 4. documentos_visualizacoes
CREATE POLICY "Paciente pode ver logs dos seus exames" ON public.documentos_visualizacoes
FOR SELECT USING (
  -- O usuário é o paciente (via CPF)
  EXISTS (
    SELECT 1 FROM public.exames_uploads eu
    JOIN public.pacientes p ON p.id = eu.paciente_id
    WHERE eu.id = documentos_visualizacoes.exame_id
      AND p.cpf IS NOT NULL
      AND p.cpf = (SELECT documento FROM public.profiles WHERE user_id = auth.uid() AND tipo = 'paciente')
  )
  -- O usuário é um médico vinculado ao paciente
  OR EXISTS (
    SELECT 1 FROM public.exames_uploads eu
    JOIN public.paciente_medico pm ON pm.paciente_id = eu.paciente_id
    JOIN public.profiles prof ON prof.id = pm.medico_id
    WHERE eu.id = documentos_visualizacoes.exame_id
      AND prof.user_id = auth.uid()
  )
  -- O usuário é staff (ajuste conforme seu modelo de staff)
  OR EXISTS (
    SELECT 1 FROM public.profiles staff
    WHERE staff.tipo = 'staff'
      AND staff.user_id = auth.uid()
      -- staff.clinica_id pode ser null para staff global, ajuste conforme seu modelo
  )
);

-- Comentário: Quando implementar o vínculo explícito (profile_id) em pacientes, basta atualizar as policies para usar esse campo. 