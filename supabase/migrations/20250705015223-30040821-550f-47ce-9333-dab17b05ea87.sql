-- Verificar e adicionar política DELETE para permitir que usuários deletem seus próprios perfis se necessário
-- (útil para testes e correção de problemas)
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Verificar se há índices necessários para performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tipo ON public.profiles(tipo);
CREATE INDEX IF NOT EXISTS idx_profiles_documento ON public.profiles(documento);