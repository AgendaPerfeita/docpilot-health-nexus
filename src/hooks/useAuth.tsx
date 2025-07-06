import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  nome: string;
  tipo: 'medico' | 'paciente' | 'clinica' | 'hospital';
  documento: string; // Agora obrigatório
  telefone?: string;
  especialidade?: string;
  crm?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  avatar_url?: string;
  ativo: boolean;
  plano_medico?: 'free' | 'premium';
  permite_atendimento_individual?: boolean;
  permite_ia?: boolean;
  permite_relatorios_avancados?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  loadingProfile: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const createProfileIfNotExists = async (userId: string, user: User) => {
    try {
      // Extrair dados do user_metadata
      const userData = user.user_metadata || {};
      
      const profileData = {
        user_id: userId,
        email: user.email || '',
        nome: userData.nome || 'Usuário',
        tipo: userData.tipo || 'paciente',
        documento: userData.documento || '00000000000',
        telefone: userData.telefone || '',
        especialidade: userData.especialidade || '',
        crm: userData.crm || ''
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }
      
      setProfile(data as UserProfile);
      return data;
    } catch (error) {
      console.error('Error in createProfileIfNotExists:', error);
      throw error;
    }
  };

  const fetchProfile = async (userId: string) => {
    console.log('🔍 fetchProfile started for user:', userId);
    
    try {
      console.log('📡 Fetching profile...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, email, nome, tipo, documento, telefone, especialidade, crm, endereco, cidade, estado, cep, avatar_url, ativo, plano_medico, permite_atendimento_individual, permite_ia, permite_relatorios_avancados')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.log('❌ Error fetching profile:', error.message);
        setProfile(null);
        return;
      }
      
      console.log('✅ Profile fetched successfully:', data);
      setProfile(data as UserProfile);
    } catch (error) {
      console.log('💥 Exception in fetchProfile:', error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect started');
    
    let isMounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, 'Session user:', session?.user?.id);
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User found, will fetch profile later...');
          // Por enquanto, apenas definir loading como false
          setProfile(null);
          setLoadingProfile(true);
        } else {
          console.log('🚪 No user, clearing profile');
          setProfile(null);
        }
        
        console.log('✅ Setting loading to false (auth state change)');
        setLoading(false);
      }
    );

    // Check for existing session
    const checkSession = async () => {
      try {
        console.log('🔍 Checking existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('📋 Session check result:', session?.user?.id);
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Existing user found, will fetch profile later...');
          // Por enquanto, apenas definir loading como false
          setProfile(null);
          setLoadingProfile(true);
        } else {
          console.log('🚪 No existing session');
        }
        console.log('✅ Setting loading to false (session check)');
        setLoading(false);
      } catch (error) {
        console.error('❌ Error in checkSession:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // useEffect separado para buscar o perfil
  useEffect(() => {
    if (!loading && user && !profile) {
      console.log('🔄 Loading finished, user exists but no profile, fetching...');
      fetchProfile(user.id);
    }
  }, [loading, user, profile]);

  const signUp = async (email: string, password: string, userData: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Garantir que todos os campos obrigatórios estão presentes
    const completeUserData = {
      nome: userData.nome || 'Usuário',
      tipo: userData.tipo || 'paciente',
      documento: userData.documento || '00000000000',
      telefone: userData.telefone || '',
      especialidade: userData.especialidade || '',
      crm: userData.crm || ''
    };
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: completeUserData
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('SignIn error:', error);
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('SignIn exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    loadingProfile,
    signUp,
    signIn,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};