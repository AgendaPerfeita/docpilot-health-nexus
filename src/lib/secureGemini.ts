
import { supabase } from '@/integrations/supabase/client';

interface GeminiRequest {
  prompt: string;
  context?: 'general' | 'prescription' | 'diagnosis' | 'emergency';
}

interface GeminiResponse {
  response: string;
  success: boolean;
  error?: string;
}

export const callSecureGeminiAPI = async ({ prompt, context = 'general' }: GeminiRequest): Promise<GeminiResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-medical-assistant', {
      body: { prompt, context }
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error calling secure Gemini API:', error);
    return {
      response: 'Erro ao conectar com o assistente de IA. Tente novamente.',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
