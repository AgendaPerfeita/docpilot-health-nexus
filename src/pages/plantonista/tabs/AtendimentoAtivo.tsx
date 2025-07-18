import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  Plus, 
  Clock, 
  User,
  Stethoscope,
  AlertCircle
} from 'lucide-react';

const AtendimentoAtivo: React.FC = () => {
  const [sessaoAtiva, setSessaoAtiva] = useState(false);
  const [atendimentos, setAtendimentos] = useState(8);
  const [reavaliacoes, setReavaliacoes] = useState([
    { id: 1, nome: 'João Silva', tempo: '15min', queixa: 'Dor torácica' },
    { id: 2, nome: 'Maria Santos', tempo: '30min', queixa: 'Cefaleia' },
    { id: 3, nome: 'Pedro Costa', tempo: '45min', queixa: 'Dispneia' }
  ]);

  const iniciarSessao = () => { setSessaoAtiva(true); };
  const finalizarSessao = () => { setSessaoAtiva(false); };

  return (
    <div className="space-y-6">
      {/* Controles de Sessão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Controle de Sessão</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!sessaoAtiva ? (
            <div className="flex items-center space-x-4">
              <Button onClick={iniciarSessao} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Sessão de Plantão
              </Button>
              <p className="text-gray-600">Clique para iniciar uma nova sessão de plantão</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-700">Sessão Ativa</span>
                </div>
                <Badge variant="secondary">Hospital ABC - Noite</Badge>
                <Badge variant="outline">{atendimentos} atendimentos</Badge>
              </div>
              <Button onClick={finalizarSessao} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Finalizar Sessão
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Novo Atendimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Novo Atendimento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            disabled={!sessaoAtiva} 
            className="w-full bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Atendimento Rápido
          </Button>
          {!sessaoAtiva && (
            <p className="text-sm text-gray-500 mt-2">
              Inicie uma sessão para começar a atender pacientes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reavaliações Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Pacientes para Reavaliação</span>
            <Badge variant="secondary">{reavaliacoes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reavaliacoes.length > 0 ? (
            <div className="space-y-3">
              {reavaliacoes.map((paciente) => (
                <div 
                  key={paciente.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{paciente.nome}</p>
                      <p className="text-sm text-gray-600">{paciente.queixa}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-orange-600">
                      <Clock className="h-3 w-3 mr-1" />{paciente.tempo}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Reavaliar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-2" />
              <p>Nenhuma reavaliação pendente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Atendimentos em Andamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Atendimentos em Andamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 mx-auto mb-2" />
            <p>Nenhum atendimento em andamento</p>
            <p className="text-sm">Os atendimentos aparecerão aqui quando iniciados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AtendimentoAtivo; 