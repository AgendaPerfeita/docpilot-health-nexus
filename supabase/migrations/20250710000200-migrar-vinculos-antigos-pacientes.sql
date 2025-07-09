-- MIGRAR VÍNCULOS ANTIGOS DE PACIENTES PARA O NOVO MODELO MULTICLÍNICA/MULTI-MÉDICO

-- 1. Migrar vínculos para paciente_clinica
-- Se clinica_id for nulo, usa responsavel_id (médico solo) como clinica_id
INSERT INTO public.paciente_clinica (paciente_id, clinica_id, status, data_vinculo)
SELECT id, COALESCE(clinica_id, responsavel_id), 'ativo', COALESCE(created_at, now())
FROM public.pacientes
WHERE (clinica_id IS NOT NULL OR responsavel_id IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1 FROM public.paciente_clinica pc
    WHERE pc.paciente_id = pacientes.id AND pc.clinica_id = COALESCE(pacientes.clinica_id, pacientes.responsavel_id)
  );

-- 2. Migrar vínculos para paciente_medico
-- Se clinica_id for nulo, usa responsavel_id (médico solo) como clinica_id
INSERT INTO public.paciente_medico (paciente_id, medico_id, clinica_id, status, data_vinculo)
SELECT
  p.id,
  p.responsavel_id,
  COALESCE(p.clinica_id, p.responsavel_id),
  'em acompanhamento',
  COALESCE(p.created_at, now())
FROM public.pacientes p
JOIN public.profiles prof ON prof.id = p.responsavel_id AND prof.tipo = 'medico'
WHERE p.responsavel_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.paciente_medico pm
    WHERE pm.paciente_id = p.id
      AND pm.medico_id = p.responsavel_id
      AND pm.clinica_id = COALESCE(p.clinica_id, p.responsavel_id)
  );

-- 3. (Opcional) Marcar pacientes migrados para revisão
-- UPDATE public.pacientes SET migrado_multiclinica = true WHERE clinica_id IS NOT NULL OR responsavel_id IS NOT NULL;

-- 4. (Opcional) Após revisão e testes, pode remover os campos antigos:
-- ALTER TABLE public.pacientes DROP COLUMN IF EXISTS responsavel_id;
-- ALTER TABLE public.pacientes DROP COLUMN IF EXISTS clinica_id;
-- (Só faça isso após garantir que todos os vínculos foram migrados e o sistema está usando as novas tabelas!)

-- 5. Comentários
-- Esta migration pode ser removida após a migração completa dos dados e validação do novo modelo. 