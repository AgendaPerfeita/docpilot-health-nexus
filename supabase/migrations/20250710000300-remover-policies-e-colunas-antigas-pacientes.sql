-- Remover policies antigas que dependem de responsavel_id em pacientes
DROP POLICY IF EXISTS "Participantes podem ver suas mensagens" ON public.chat_mensagens;
DROP POLICY IF EXISTS "Paciente pode ver seus uploads" ON public.exames_uploads;
DROP POLICY IF EXISTS "Paciente pode ver seus compartilhamentos" ON public.documentos_compartilhados;
DROP POLICY IF EXISTS "Paciente pode ver logs dos seus exames" ON public.documentos_visualizacoes;

-- Remover colunas antigas de vínculo direto da tabela pacientes
ALTER TABLE public.pacientes DROP COLUMN IF EXISTS responsavel_id;
ALTER TABLE public.pacientes DROP COLUMN IF EXISTS clinica_id;

-- Observação: As novas policies já foram criadas na migration multiclinica-paciente-medico.sql
-- Se necessário, crie novas policies específicas em migrations futuras, já usando o novo modelo de vínculo. 