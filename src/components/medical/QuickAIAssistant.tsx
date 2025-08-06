
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Send } from 'lucide-react';
import { callSecureGeminiAPI } from '@/lib/secureGemini';

interface QuickAIAssistantProps {
  context?: 'general' | 'prescription' | 'diagnosis' | 'emergency';
  placeholder?: string;
  title?: string;
}

export const QuickAIAssistant = ({ 
  context = 'general', 
  placeholder = "Descreva os sintomas ou faça uma pergunta médica...",
  title = "Assistente de IA"
}: QuickAIAssistantProps) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const result = await callSecureGeminiAPI({ prompt, context });
      
      if (result.success) {
        setResponse(result.response);
      } else {
        setResponse(`Erro: ${result.error || 'Não foi possível processar a solicitação'}`);
      }
    } catch (error) {
      setResponse('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            rows={3}
            disabled={loading}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={!prompt.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Consulta
              </>
            )}
          </Button>
        </div>
        
        {response && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Resposta da IA:</h4>
            <div className="text-sm whitespace-pre-wrap">{response}</div>
            <p className="text-xs text-muted-foreground mt-2">
              ⚠️ Esta é uma sugestão de IA. Sempre confirme com avaliação clínica.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
