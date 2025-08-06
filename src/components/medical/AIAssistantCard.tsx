
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { callSecureGeminiAPI } from '@/lib/secureGemini';

interface AIAssistantCardProps {
  context?: 'general' | 'prescription' | 'diagnosis' | 'emergency';
  title?: string;
  placeholder?: string;
}

export const AIAssistantCard: React.FC<AIAssistantCardProps> = ({
  context = 'general',
  title = "Assistente de IA",
  placeholder = "Digite sua pergunta médica..."
}) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    try {
      const result = await callSecureGeminiAPI({ prompt: query, context });
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
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          rows={3}
        />
        <Button 
          onClick={handleSubmit}
          disabled={!query.trim() || loading}
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
              Consultar IA
            </>
          )}
        </Button>
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
