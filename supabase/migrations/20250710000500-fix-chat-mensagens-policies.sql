-- Migration: Corrigir policies da tabela chat_mensagens para o novo modelo multi-clínica/multi-médico

-- Remover policies antigas baseadas no modelo antigo
DROP POLICY IF EXISTS "Participantes podem ver suas mensagens" ON public.chat_mensagens;
DROP POLICY IF EXISTS "Participantes podem inserir mensagens" ON public.chat_mensagens;
DROP POLICY IF EXISTS "Participantes podem atualizar suas mensagens" ON public.chat_mensagens;
DROP POLICY IF EXISTS "Participantes podem deletar suas mensagens (soft delete)" ON public.chat_mensagens;

-- Novas policies para o modelo multi-clínica/multi-médico

-- SELECT: Participantes podem ver mensagens de pacientes vinculados a eles
CREATE POLICY "Participantes podem ver mensagens de pacientes vinculados"
ON public.chat_mensagens
FOR SELECT USING (
  -- Autor da mensagem
  (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id))
  OR
  -- Médico vinculado ao paciente via paciente_medico
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    WHERE pm.paciente_id = chat_mensagens.patient_id
      AND pm.medico_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
  OR
  -- Staff da clínica vinculada ao paciente via paciente_clinica
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    WHERE pc.paciente_id = chat_mensagens.patient_id
      AND pc.clinica_id = (SELECT clinica_id FROM public.profiles WHERE user_id = auth.uid() AND tipo = 'staff')
  )
  OR
  -- Clínica vinculada ao paciente via paciente_clinica
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    WHERE pc.paciente_id = chat_mensagens.patient_id
      AND pc.clinica_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND tipo = 'clinica')
  )
  OR
  -- Paciente autenticado vendo suas próprias mensagens (via CPF)
  EXISTS (
    SELECT 1 FROM public.pacientes p
    WHERE p.id = chat_mensagens.patient_id
      AND p.cpf = (SELECT documento FROM public.profiles WHERE user_id = auth.uid() AND tipo = 'paciente')
  )
);

-- INSERT: Qualquer usuário autenticado pode inserir mensagens
CREATE POLICY "Usuários autenticados podem inserir mensagens"
ON public.chat_mensagens
FOR INSERT WITH CHECK (
  -- Verificar se o usuário está autenticado
  auth.uid() IS NOT NULL
  AND
  -- Verificar se o author_id corresponde ao profile do usuário logado
  (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id))
  AND
  -- Verificar se o usuário tem vínculo com o paciente (para evitar spam)
  (
    -- Médico vinculado ao paciente
    EXISTS (
      SELECT 1 FROM public.paciente_medico pm
      WHERE pm.paciente_id = chat_mensagens.patient_id
        AND pm.medico_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR
    -- Staff da clínica vinculada ao paciente
    EXISTS (
      SELECT 1 FROM public.paciente_clinica pc
      WHERE pc.paciente_id = chat_mensagens.patient_id
        AND pc.clinica_id = (SELECT clinica_id FROM public.profiles WHERE user_id = auth.uid() AND tipo = 'staff')
    )
    OR
    -- Clínica vinculada ao paciente
    EXISTS (
      SELECT 1 FROM public.paciente_clinica pc
      WHERE pc.paciente_id = chat_mensagens.patient_id
        AND pc.clinica_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND tipo = 'clinica')
    )
    OR
    -- Paciente autenticado enviando mensagem para si mesmo
    EXISTS (
      SELECT 1 FROM public.pacientes p
      WHERE p.id = chat_mensagens.patient_id
        AND p.cpf = (SELECT documento FROM public.profiles WHERE user_id = auth.uid() AND tipo = 'paciente')
    )
  )
);

-- UPDATE: Apenas o autor pode atualizar suas mensagens
CREATE POLICY "Autor pode atualizar suas mensagens"
ON public.chat_mensagens
FOR UPDATE USING (
  (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id))
);

-- DELETE: Apenas o autor pode deletar suas mensagens (soft delete)
CREATE POLICY "Autor pode deletar suas mensagens"
ON public.chat_mensagens
FOR DELETE USING (
  (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id))
); 