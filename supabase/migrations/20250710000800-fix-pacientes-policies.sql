-- Corrigir policies da tabela pacientes para permitir criação de novos pacientes

-- 1. Remover a policy que está bloqueando tudo
DROP POLICY IF EXISTS "Profissionais podem gerenciar pacientes de suas clínicas" ON public.pacientes;

-- 2. Criar policy específica para SELECT (ver pacientes)
CREATE POLICY "Profissionais podem ver pacientes vinculados" ON public.pacientes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
);

-- 3. Criar policy específica para INSERT (criar novos pacientes)
CREATE POLICY "Profissionais podem criar pacientes" ON public.pacientes
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND (p.tipo = 'medico' OR p.tipo = 'clinica' OR p.tipo = 'staff')
  )
);

-- 4. Criar policy específica para UPDATE (atualizar pacientes vinculados)
CREATE POLICY "Profissionais podem atualizar pacientes vinculados" ON public.pacientes
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
);

-- 5. Criar policy específica para DELETE (deletar pacientes vinculados)
CREATE POLICY "Profissionais podem deletar pacientes vinculados" ON public.pacientes
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
);

-- 6. Adicionar policies para as tabelas de vínculo permitirem INSERT
CREATE POLICY "Profissionais podem criar vínculos paciente_clinica" ON public.paciente_clinica
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_clinica.clinica_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Profissionais podem criar vínculos paciente_medico" ON public.paciente_medico
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.medico_id AND p.user_id = auth.uid()
  )
); 