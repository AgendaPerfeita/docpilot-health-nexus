-- Limpar todas as políticas existentes da tabela pacientes e criar novas políticas seguras
-- Esta migração remove todas as políticas conflitantes e cria um conjunto limpo de políticas

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- Remover políticas antigas que podem estar causando conflitos
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
DROP POLICY IF EXISTS "Usuários autenticados podem inserir pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Usuários podem visualizar pacientes vinculados" ON public.pacientes;
DROP POLICY IF EXISTS "Usuários podem atualizar pacientes vinculados" ON public.pacientes;
DROP POLICY IF EXISTS "Usuários podem deletar pacientes vinculados" ON public.pacientes;
DROP POLICY IF EXISTS "Qualquer usuário autenticado pode criar pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer tudo" ON public.pacientes;
DROP POLICY IF EXISTS "DELETE - Deletar pacientes vinculados" ON public.pacientes;
DROP POLICY IF EXISTS "INSERT - Usuários autenticados" ON public.pacientes;
DROP POLICY IF EXISTS "SELECT - Ver pacientes vinculados" ON public.pacientes;
DROP POLICY IF EXISTS "UPDATE - Atualizar pacientes vinculados" ON public.pacientes;

-- 2. GARANTIR QUE RLS ESTÁ HABILITADO
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR NOVAS POLÍTICAS LIMPAS E SEGURAS

-- INSERT: Qualquer usuário autenticado pode criar pacientes
-- (Isso permite que médicos e clínicas criem pacientes)
CREATE POLICY "pacientes_insert_policy" 
ON public.pacientes 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- SELECT: Usuários podem ver pacientes vinculados a eles via tabelas de vínculo
-- (Médicos veem pacientes vinculados a eles via paciente_medico)
-- (Clínicas veem pacientes vinculados a elas via paciente_clinica)
CREATE POLICY "pacientes_select_policy" 
ON public.pacientes 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    -- Médico vê pacientes vinculados a ele
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    -- Clínica vê pacientes vinculados a ela
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    -- Médico vê pacientes de clínicas onde ele trabalha
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.clinica_medicos cm ON pc.clinica_id = cm.clinica_id
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE pc.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
      AND cm.ativo = true
  )
);

-- UPDATE: Usuários podem atualizar pacientes vinculados a eles
CREATE POLICY "pacientes_update_policy" 
ON public.pacientes 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    -- Médico pode atualizar pacientes vinculados a ele
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    -- Clínica pode atualizar pacientes vinculados a ela
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    -- Médico pode atualizar pacientes de clínicas onde ele trabalha
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.clinica_medicos cm ON pc.clinica_id = cm.clinica_id
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE pc.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
      AND cm.ativo = true
  )
);

-- DELETE: Usuários podem deletar pacientes vinculados a eles
CREATE POLICY "pacientes_delete_policy" 
ON public.pacientes 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    -- Médico pode deletar pacientes vinculados a ele
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    -- Clínica pode deletar pacientes vinculados a ela
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    -- Médico pode deletar pacientes de clínicas onde ele trabalha
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.clinica_medicos cm ON pc.clinica_id = cm.clinica_id
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE pc.paciente_id = pacientes.id
      AND p.user_id = auth.uid()
      AND cm.ativo = true
  )
);

-- 4. GARANTIR QUE AS TABELAS DE VÍNCULO TÊM POLÍTICAS ADEQUADAS

-- Políticas para paciente_clinica
DROP POLICY IF EXISTS "Usuários podem criar vínculos paciente_clinica" ON public.paciente_clinica;
DROP POLICY IF EXISTS "Usuários podem ver vínculos paciente_clinica" ON public.paciente_clinica;
DROP POLICY IF EXISTS "Usuários podem atualizar vínculos paciente_clinica" ON public.paciente_clinica;
DROP POLICY IF EXISTS "Usuários podem deletar vínculos paciente_clinica" ON public.paciente_clinica;

CREATE POLICY "paciente_clinica_insert_policy" 
ON public.paciente_clinica 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "paciente_clinica_select_policy" 
ON public.paciente_clinica 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_clinica.clinica_id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.clinica_medicos cm
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE cm.clinica_id = paciente_clinica.clinica_id AND p.user_id = auth.uid() AND cm.ativo = true
  )
);

CREATE POLICY "paciente_clinica_update_policy" 
ON public.paciente_clinica 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_clinica.clinica_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "paciente_clinica_delete_policy" 
ON public.paciente_clinica 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_clinica.clinica_id AND p.user_id = auth.uid()
  )
);

-- Políticas para paciente_medico
DROP POLICY IF EXISTS "Usuários podem criar vínculos paciente_medico" ON public.paciente_medico;
DROP POLICY IF EXISTS "Usuários podem ver vínculos paciente_medico" ON public.paciente_medico;
DROP POLICY IF EXISTS "Usuários podem atualizar vínculos paciente_medico" ON public.paciente_medico;
DROP POLICY IF EXISTS "Usuários podem deletar vínculos paciente_medico" ON public.paciente_medico;

CREATE POLICY "paciente_medico_insert_policy" 
ON public.paciente_medico 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "paciente_medico_select_policy" 
ON public.paciente_medico 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.medico_id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.clinica_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "paciente_medico_update_policy" 
ON public.paciente_medico 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.medico_id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.clinica_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "paciente_medico_delete_policy" 
ON public.paciente_medico 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.medico_id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = paciente_medico.clinica_id AND p.user_id = auth.uid()
  )
);

-- 5. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON POLICY "pacientes_insert_policy" ON public.pacientes IS 'Permite que qualquer usuário autenticado crie pacientes';
COMMENT ON POLICY "pacientes_select_policy" ON public.pacientes IS 'Permite que usuários vejam pacientes vinculados a eles via tabelas de vínculo';
COMMENT ON POLICY "pacientes_update_policy" ON public.pacientes IS 'Permite que usuários atualizem pacientes vinculados a eles';
COMMENT ON POLICY "pacientes_delete_policy" ON public.pacientes IS 'Permite que usuários deletem pacientes vinculados a eles'; 