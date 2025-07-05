-- Verificar e corrigir a função handle_new_user para incluir todos os campos obrigatórios
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Inserir profile completo com todos os campos obrigatórios
  INSERT INTO public.profiles (
    user_id, 
    email, 
    nome, 
    tipo,
    documento,
    telefone,
    especialidade,
    crm
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', 'Usuário'),
    COALESCE((NEW.raw_user_meta_data ->> 'tipo')::public.user_type, 'paciente'::public.user_type),
    COALESCE(NEW.raw_user_meta_data ->> 'documento', '00000000000'),
    NEW.raw_user_meta_data ->> 'telefone',
    NEW.raw_user_meta_data ->> 'especialidade',
    NEW.raw_user_meta_data ->> 'crm'
  );
  RETURN NEW;
END;
$$;

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();