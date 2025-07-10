-- Reabilitar RLS e criar políticas que funcionem corretamente
-- Baseado nos testes, sabemos que o problema era com as políticas

-- 1. Reabilitar RLS
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- 2. Remover todas as políticas existentes
DROP POLICY IF EXISTS "allow_delete_linked_patients" ON public.pacientes;
DROP POLICY IF EXISTS "allow_update_linked_patients" ON public.pacientes;
DROP POLICY IF EXISTS "allow_view_linked_patients" ON public.pacientes;
DROP POLICY IF EXISTS "test_insert_simple" ON public.pacientes;

-- 3. Criar políticas simples e funcionais

-- INSERT: Qualquer usuário autenticado pode criar pacientes
CREATE POLICY "pacientes_insert" 
ON public.pacientes 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- SELECT: Usuários podem ver pacientes vinculados
CREATE POLICY "pacientes_select" 
ON public.pacientes 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.clinica_medicos cm ON pc.clinica_id = cm.clinica_id
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE pc.paciente_id = pacientes.id AND p.user_id = auth.uid() AND cm.ativo = true
  )
);

-- UPDATE: Usuários podem atualizar pacientes vinculados
CREATE POLICY "pacientes_update" 
ON public.pacientes 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.clinica_medicos cm ON pc.clinica_id = cm.clinica_id
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE pc.paciente_id = pacientes.id AND p.user_id = auth.uid() AND cm.ativo = true
  )
);

-- DELETE: Usuários podem deletar pacientes vinculados
CREATE POLICY "pacientes_delete" 
ON public.pacientes 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    JOIN public.profiles p ON p.id = pm.medico_id
    WHERE pm.paciente_id = pacientes.id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.profiles p ON p.id = pc.clinica_id
    WHERE pc.paciente_id = pacientes.id AND p.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    JOIN public.clinica_medicos cm ON pc.clinica_id = cm.clinica_id
    JOIN public.profiles p ON p.id = cm.medico_id
    WHERE pc.paciente_id = pacientes.id AND p.user_id = auth.uid() AND cm.ativo = true
  )
);

-- 4. Comentários
COMMENT ON POLICY "pacientes_insert" ON public.pacientes IS 'Permite que qualquer usuário autenticado crie pacientes';
COMMENT ON POLICY "pacientes_select" ON public.pacientes IS 'Permite que usuários vejam pacientes vinculados via tabelas de vínculo';
COMMENT ON POLICY "pacientes_update" ON public.pacientes IS 'Permite que usuários atualizem pacientes vinculados';
COMMENT ON POLICY "pacientes_delete" ON public.pacientes IS 'Permite que usuários deletem pacientes vinculados';

-- 5. Limpar comentário da tabela
COMMENT ON TABLE public.pacientes IS 'Tabela de pacientes com RLS habilitado e políticas funcionais'; 