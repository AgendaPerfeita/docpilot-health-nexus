import React, { useState } from 'react';
import VideoCallReal from './VideoCallReal';
import { WaitingRoom } from './WaitingRoom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, User, FileText, X } from 'lucide-react';

interface TelemedicineInterfaceProps {
  consultaId: string;
  paciente: {
    id: string;
    nome: string;
    idade: number;
  };
  medico: {
    id: string;
    nome: string;
    especialidade: string;
  };
  consulta: {
    dataHora: string;
    tipo: string;
    status: string;
  };
  onClose: () => void;
  userType: 'medico' | 'paciente';
}

type TelemedicineState = 'waiting' | 'in-call' | 'ended';

export const TelemedicineInterface: React.FC<TelemedicineInterfaceProps> = ({
  consultaId,
  paciente,
  medico,
  consulta,
  onClose,
  userType
}) => {
  const [currentState, setCurrentState] = useState<TelemedicineState>('waiting');

  const handleJoinCall = () => {
    setCurrentState('in-call');
  };

  const handleEndCall = () => {
    setCurrentState('ended');
  };

  const handleReturnToConsultation = () => {
    onClose();
  };

  if (currentState === 'waiting') {
    return (
      <div className="fixed inset-0 bg-background z-50">
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <WaitingRoom
          consultaId={consultaId}
          pacienteNome={paciente.nome}
          medicoNome={medico.nome}
          horarioAgendado={consulta.dataHora}
          onJoinCall={handleJoinCall}
          isPatient={userType === 'paciente'}
        />
      </div>
    );
  }

  if (currentState === 'in-call') {
    return (
      <div className="fixed inset-0 bg-background z-50">
        <VideoCallReal
          consultaId={consultaId}
          participantName={userType === 'medico' ? paciente.nome : medico.nome}
          onCallEnd={handleEndCall}
          isHost={userType === 'medico'}
          userName={userType === 'medico' ? medico.nome : paciente.nome}
          userId={userType === 'medico' ? medico.id : paciente.id}
        />
      </div>
    );
  }

  // Estado 'ended' - Resumo da consulta
  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Video className="h-6 w-6" />
            Consulta Finalizada
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Resumo da consulta */}
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              Consulta Concluída
            </Badge>
            <h3 className="text-lg font-semibold">
              {userType === 'medico' ? `Consulta com ${paciente.nome}` : `Consulta com Dr. ${medico.nome}`}
            </h3>
            <p className="text-muted-foreground">
              {new Date(consulta.dataHora).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Informações da consulta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Paciente</span>
                </div>
                <p className="text-sm">{paciente.nome}</p>
                <p className="text-xs text-muted-foreground">{paciente.idade} anos</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Médico</span>
                </div>
                <p className="text-sm">Dr. {medico.nome}</p>
                <p className="text-xs text-muted-foreground">{medico.especialidade}</p>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas da chamada */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Detalhes da Videochamada
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Duração</p>
                  <p className="font-medium">15:42</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Qualidade</p>
                  <Badge variant="default">Excelente</Badge>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="font-medium">Telemedicina</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximos passos */}
          <Card className="bg-muted">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Próximos Passos
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {userType === 'medico' ? (
                  <>
                    <li>• Complete o prontuário eletrônico</li>
                    <li>• Envie prescrições se necessário</li>
                    <li>• Agende retorno se indicado</li>
                    <li>• Documento da consulta será salvo automaticamente</li>
                  </>
                ) : (
                  <>
                    <li>• Aguarde o relatório médico</li>
                    <li>• Verifique prescrições enviadas</li>
                    <li>• Acompanhe orientações médicas</li>
                    <li>• Entre em contato se tiver dúvidas</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex gap-3 justify-center">
            <Button onClick={handleReturnToConsultation} className="flex-1 max-w-xs">
              {userType === 'medico' ? 'Voltar para Prontuário' : 'Voltar para Área do Paciente'}
            </Button>
            {userType === 'medico' && (
              <Button variant="outline" className="flex-1 max-w-xs">
                <FileText className="h-4 w-4 mr-2" />
                Relatório da Consulta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};