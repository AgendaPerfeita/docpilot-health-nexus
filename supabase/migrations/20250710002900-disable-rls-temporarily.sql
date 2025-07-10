-- Desabilitar temporariamente o RLS para confirmar que o problema é com as políticas
-- Se funcionar sem RLS, sabemos que o problema é nas políticas

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.pacientes DISABLE ROW LEVEL SECURITY;

-- 2. Comentário para lembrar de reabilitar depois
COMMENT ON TABLE public.pacientes IS 'RLS DESABILITADO TEMPORARIAMENTE PARA TESTE - REABILITAR DEPOIS';

-- 3. Função para reabilitar RLS depois
CREATE OR REPLACE FUNCTION reenable_pacientes_rls()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
  COMMENT ON TABLE public.pacientes IS 'RLS reabilitado';
  RAISE NOTICE 'RLS reabilitado na tabela pacientes';
END;
$$;

COMMENT ON FUNCTION reenable_pacientes_rls() IS 'Função para reabilitar RLS na tabela pacientes'; 