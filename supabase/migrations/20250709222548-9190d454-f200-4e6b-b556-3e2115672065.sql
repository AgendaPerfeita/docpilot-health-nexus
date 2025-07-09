-- LIMPEZA COMPLETA DAS POLÍTICAS RLS PARA CORRIGIR PROBLEMAS DE CRIAÇÃO DE PACIENTES

-- 1. REMOVER TODAS AS POLÍTICAS CONFLITANTES DA TABELA PACIENTES
DROP POLICY IF EXISTS "Usuários podem ver pacientes vinculados" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_delete_policy" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_insert_policy" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_select_policy" ON public.pacientes;
DROP POLICY IF EXISTS "pacientes_update_policy" ON public.pacientes;

-- 2. REMOVER POLÍTICAS ANTIGAS DAS TABELAS DE VÍNCULO
DROP POLICY IF EXISTS "Profissionais podem criar vínculos paciente_clinica" ON public.paciente_clinica;
DROP POLICY IF EXISTS "Profissionais só veem vínculos de suas clínicas" ON public.paciente_clinica;
DROP POLICY IF EXISTS "paciente_clinica_delete_policy" ON public.paciente_clinica;
DROP POLICY IF EXISTS "paciente_clinica_insert_policy" ON public.paciente_clinica;
DROP POLICY IF EXISTS "paciente_clinica_select_policy" ON public.paciente_clinica;
DROP POLICY IF EXISTS "paciente_clinica_update_policy" ON public.paciente_clinica;

DROP POLICY IF EXISTS "Profissionais podem criar vínculos paciente_medico" ON public.paciente_medico;
DROP POLICY IF EXISTS "Profissionais só veem vínculos de seus pacientes" ON public.paciente_medico;
DROP POLICY IF EXISTS "paciente_medico_delete_policy" ON public.paciente_medico;
DROP POLICY IF EXISTS "paciente_medico_insert_policy" ON public.paciente_medico;
DROP POLICY IF EXISTS "paciente_medico_select_policy" ON public.paciente_medico;
DROP POLICY IF EXISTS "paciente_medico_update_policy" ON public.paciente_medico;

-- 3. CRIAR POLÍTICAS SIMPLES E FUNCIONAIS PARA PACIENTES

-- INSERT: Médicos, clínicas e staff podem criar pacientes
CREATE POLICY "allow_professionals_insert_patients" 
ON public.pacientes 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.tipo IN ('medico', 'clinica', 'staff')
    AND p.ativo = true
  )
);

-- SELECT: Ver pacientes baseado nos vínculos
CREATE POLICY "allow_view_linked_patients" 
ON public.pacientes 
FOR SELECT 
TO authenticated 
USING (
  -- Médicos veem pacientes vinculados diretamente
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
    AND p.user_id = auth.uid()
  )
  OR
  -- Clínicas veem pacientes vinculados à clínica
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
    AND p.user_id = auth.uid()
  )
  OR
  -- Staff vê pacientes da clínica onde trabalha
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles staff ON staff.clinica_id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
    AND staff.user_id = auth.uid()
    AND staff.tipo = 'staff'
  )
  OR
  -- Médicos veem pacientes de clínicas onde trabalham
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.clinica_medicos cm ON cm.clinica_id = pc.clinica_id
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE pc.paciente_id = pacientes.id
    AND p.user_id = auth.uid()
    AND cm.ativo = true
  )
);

-- UPDATE: Atualizar pacientes vinculados
CREATE POLICY "allow_update_linked_patients" 
ON public.pacientes 
FOR UPDATE 
TO authenticated 
USING (
  -- Mesma lógica do SELECT
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
    AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
    AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles staff ON staff.clinica_id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
    AND staff.user_id = auth.uid()
    AND staff.tipo = 'staff'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.clinica_medicos cm ON cm.clinica_id = pc.clinica_id
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE pc.paciente_id = pacientes.id
    AND p.user_id = auth.uid()
    AND cm.ativo = true
  )
);

-- DELETE: Deletar pacientes vinculados
CREATE POLICY "allow_delete_linked_patients" 
ON public.pacientes 
FOR DELETE 
TO authenticated 
USING (
  -- Mesma lógica do SELECT
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
    AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
    AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles staff ON staff.clinica_id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
    AND staff.user_id = auth.uid()
    AND staff.tipo = 'staff'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.clinica_medicos cm ON cm.clinica_id = pc.clinica_id
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE pc.paciente_id = pacientes.id
    AND p.user_id = auth.uid()
    AND cm.ativo = true
  )
);

-- 4. POLÍTICAS PARA PACIENTE_CLINICA

-- INSERT: Profissionais podem criar vínculos
CREATE POLICY "allow_create_clinic_links" 
ON public.paciente_clinica 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.tipo IN ('medico', 'clinica', 'staff')
    AND p.ativo = true
  )
);

-- SELECT: Ver vínculos onde o usuário tem acesso
CREATE POLICY "allow_view_clinic_links" 
ON public.paciente_clinica 
FOR SELECT 
TO authenticated 
USING (
  -- Clínica vê seus próprios vínculos
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_clinica.clinica_id 
    AND p.user_id = auth.uid()
  )
  OR
  -- Staff vê vínculos da clínica onde trabalha
  EXISTS (
    SELECT 1 FROM public.profiles staff
    WHERE staff.clinica_id = paciente_clinica.clinica_id
    AND staff.user_id = auth.uid()
    AND staff.tipo = 'staff'
  )
  OR
  -- Médicos veem vínculos de clínicas onde trabalham
  EXISTS (
    SELECT 1 FROM public.clinica_medicos cm
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE cm.clinica_id = paciente_clinica.clinica_id
    AND p.user_id = auth.uid()
    AND cm.ativo = true
  )
);

-- UPDATE e DELETE para paciente_clinica
CREATE POLICY "allow_update_clinic_links" 
ON public.paciente_clinica 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_clinica.clinica_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "allow_delete_clinic_links" 
ON public.paciente_clinica 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_clinica.clinica_id 
    AND p.user_id = auth.uid()
  )
);

-- 5. POLÍTICAS PARA PACIENTE_MEDICO

-- INSERT: Profissionais podem criar vínculos
CREATE POLICY "allow_create_doctor_links" 
ON public.paciente_medico 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() 
    AND p.tipo IN ('medico', 'clinica', 'staff')
    AND p.ativo = true
  )
);

-- SELECT: Ver vínculos onde o usuário tem acesso
CREATE POLICY "allow_view_doctor_links" 
ON public.paciente_medico 
FOR SELECT 
TO authenticated 
USING (
  -- Médico vê seus próprios vínculos
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.medico_id 
    AND p.user_id = auth.uid()
  )
  OR
  -- Clínica vê vínculos dos médicos que trabalham nela
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.clinica_id 
    AND p.user_id = auth.uid()
  )
  OR
  -- Staff vê vínculos da clínica onde trabalha
  EXISTS (
    SELECT 1 FROM public.profiles staff
    WHERE staff.clinica_id = paciente_medico.clinica_id
    AND staff.user_id = auth.uid()
    AND staff.tipo = 'staff'
  )
);

-- UPDATE e DELETE para paciente_medico
CREATE POLICY "allow_update_doctor_links" 
ON public.paciente_medico 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.medico_id 
    AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.clinica_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "allow_delete_doctor_links" 
ON public.paciente_medico 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.medico_id 
    AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.clinica_id 
    AND p.user_id = auth.uid()
  )
);

-- 6. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON POLICY "allow_professionals_insert_patients" ON public.pacientes IS 'Permite que médicos, clínicas e staff criem pacientes';
COMMENT ON POLICY "allow_view_linked_patients" ON public.pacientes IS 'Permite visualizar pacientes baseado em vínculos diretos ou através de clínicas';
COMMENT ON POLICY "allow_update_linked_patients" ON public.pacientes IS 'Permite atualizar pacientes vinculados';
COMMENT ON POLICY "allow_delete_linked_patients" ON public.pacientes IS 'Permite deletar pacientes vinculados';