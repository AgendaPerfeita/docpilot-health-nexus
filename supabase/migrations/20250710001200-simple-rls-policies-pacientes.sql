-- Políticas RLS simples para a tabela pacientes seguindo recomendação do Supabase
-- Adaptadas para o modelo multi-clínica/multi-médico

-- 1. Remover todas as políticas existentes conflitantes
DROP POLICY IF EXISTS "Médicos/Clínicas podem ver seus pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Médicos/Clínicas podem gerenciar seus pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Profissionais podem ver pacientes de suas clínicas" ON public.pacientes;
DROP POLICY IF EXISTS "Profissionais podem gerenciar pacientes de suas clínicas" ON public.pacientes;
DROP POLICY IF EXISTS "Profissionais podem ver pacientes vinculados" ON public.pacientes;
DROP POLICY IF EXISTS "Profissionais podem criar pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Profissionais podem atualizar pacientes vinculados" ON public.pacientes;
DROP POLICY IF EXISTS "Profissionais podem deletar pacientes vinculados" ON public.pacientes;
DROP POLICY IF EXISTS "Users can see linked patients" ON public.pacientes;
DROP POLICY IF EXISTS "Authenticated users can create patients" ON public.pacientes;
DROP POLICY IF EXISTS "Users can update linked patients" ON public.pacientes;
DROP POLICY IF EXISTS "Users can delete linked patients" ON public.pacientes;

-- 2. Criar políticas simples seguindo recomendação do Supabase

-- INSERT: Qualquer usuário autenticado pode criar pacientes
CREATE POLICY "Usuários autenticados podem inserir pacientes" 
ON public.pacientes 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- SELECT: Usuários podem ver pacientes vinculados a eles via tabelas de vínculo
CREATE POLICY "Usuários podem visualizar pacientes vinculados" 
ON public.pacientes 
FOR SELECT 
TO authenticated 
USING (
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

-- UPDATE: Usuários podem atualizar pacientes vinculados a eles
CREATE POLICY "Usuários podem atualizar pacientes vinculados" 
ON public.pacientes 
FOR UPDATE 
TO authenticated 
USING (
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
)
WITH CHECK (
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

-- DELETE: Usuários podem deletar pacientes vinculados a eles
CREATE POLICY "Usuários podem deletar pacientes vinculados" 
ON public.pacientes 
FOR DELETE 
TO authenticated 
USING (
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

-- 3. Garantir que RLS está habilitado
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY; 