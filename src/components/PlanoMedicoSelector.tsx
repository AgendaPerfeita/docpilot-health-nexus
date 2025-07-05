import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Users } from 'lucide-react';
import { useMedicoPermissions } from '@/hooks/useMedicoPermissions';
import { useToast } from '@/hooks/use-toast';

export const PlanoMedicoSelector = () => {
  const { permissions, updatePlano, loading } = useMedicoPermissions();
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    try {
      setUpdating(true);
      await updatePlano('premium');
      toast({
        title: "Plano atualizado!",
        description: "Você agora tem acesso completo aos recursos Premium.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar plano",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-muted h-96 rounded-lg" />;
  }

  const currentPlan = permissions?.plano || 'free';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Planos de Acesso</h2>
        <p className="text-muted-foreground">
          Escolha o plano que melhor atende suas necessidades profissionais
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plano Free */}
        <Card className={`relative ${currentPlan === 'free' ? 'border-primary' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Funcionário de Clínica</CardTitle>
              </div>
              {currentPlan === 'free' && (
                <Badge variant="default">Atual</Badge>
              )}
            </div>
            <CardDescription>
              Ideal para médicos que trabalham exclusivamente em clínicas parceiras
            </CardDescription>
            <div className="text-3xl font-bold text-green-600">Gratuito</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Atendimento em clínicas parceiras</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Prontuário eletrônico básico</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Agenda de consultas</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Prescrição digital</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="w-4 h-4 border rounded-sm" />
                <span>Sem acesso à IA</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="w-4 h-4 border rounded-sm" />
                <span>Sem atendimento individual</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Plano Premium */}
        <Card className={`relative ${currentPlan === 'premium' ? 'border-primary' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <CardTitle>Médico Autônomo</CardTitle>
              </div>
              {currentPlan === 'premium' && (
                <Badge variant="default">Atual</Badge>
              )}
            </div>
            <CardDescription>
              Para médicos que desejam atendimento individual e recursos avançados
            </CardDescription>
            <div className="text-3xl font-bold text-blue-600">R$ 99/mês</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Todos os recursos do plano Free</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Atendimento individual</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Acesso completo à IA médica</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Relatórios avançados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Gestão de convênios próprios</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Suporte prioritário</span>
              </li>
            </ul>
            
            {currentPlan === 'free' && (
              <Button 
                onClick={handleUpgrade}
                disabled={updating}
                className="w-full"
                size="lg"
              >
                {updating ? 'Atualizando...' : 'Fazer Upgrade'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};