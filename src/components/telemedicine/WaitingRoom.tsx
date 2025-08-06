import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Video, Users, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface WaitingRoomProps {
  consultaId: string;
  pacienteNome: string;
  medicoNome: string;
  horarioAgendado: string;
  onJoinCall: () => void;
  isPatient?: boolean;
}

interface WaitingState {
  isWaiting: boolean;
  estimatedWait: number;
  participantsCount: number;
  canJoin: boolean;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  consultaId,
  pacienteNome,
  medicoNome,
  horarioAgendado,
  onJoinCall,
  isPatient = false
}) => {
  const { toast } = useToast();
  const [waitingState, setWaitingState] = useState<WaitingState>({
    isWaiting: true,
    estimatedWait: 5,
    participantsCount: 1,
    canJoin: false
  });

  const [connectionTest, setConnectionTest] = useState<{
    video: boolean;
    audio: boolean;
    connection: 'testing' | 'good' | 'poor';
  }>({
    video: false,
    audio: false,
    connection: 'testing'
  });

  useEffect(() => {
    // Teste de conexão inicial
    testConnection();
    
    // Simular chegada do médico/paciente
    const timer = setTimeout(() => {
      setWaitingState(prev => ({
        ...prev,
        participantsCount: 2,
        canJoin: true,
        isWaiting: false
      }));
      
      toast({
        title: isPatient ? "Médico chegou" : "Paciente chegou",
        description: "A videochamada pode ser iniciada agora"
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPatient]);

  const testConnection = async () => {
    try {
      // Teste de vídeo e áudio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setConnectionTest(prev => ({
        ...prev,
        video: true,
        audio: true
      }));

      // Teste de velocidade de conexão simulado
      setTimeout(() => {
        setConnectionTest(prev => ({
          ...prev,
          connection: 'good'
        }));
      }, 1500);

      // Liberar recursos do teste
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      setConnectionTest(prev => ({
        ...prev,
        video: false,
        audio: false,
        connection: 'poor'
      }));
      
      toast({
        title: "Problema de conexão",
        description: "Verifique as permissões de câmera e microfone",
        variant: "destructive"
      });
    }
  };

  const getStatusMessage = () => {
    if (waitingState.isWaiting) {
      return isPatient 
        ? "Aguardando o médico entrar na sala"
        : "Aguardando o paciente entrar na sala";
    }
    return "Todos os participantes estão presentes";
  };

  const getConnectionStatus = () => {
    switch (connectionTest.connection) {
      case 'testing':
        return { text: 'Testando...', color: 'secondary' as const };
      case 'good':
        return { text: 'Excelente', color: 'default' as const };
      case 'poor':
        return { text: 'Ruim', color: 'destructive' as const };
      default:
        return { text: 'Desconhecido', color: 'secondary' as const };
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Video className="h-6 w-6" />
            Sala de Espera - Telemedicina
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Informações da consulta */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Consulta Agendada</h3>
            <p className="text-muted-foreground">
              {new Date(horarioAgendado).toLocaleString('pt-BR')}
            </p>
          </div>

          {/* Participantes */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage src="/placeholder-doctor.jpg" />
                  <AvatarFallback>{medicoNome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h4 className="font-medium">{medicoNome}</h4>
                <p className="text-sm text-muted-foreground">Médico</p>
                {waitingState.participantsCount >= 1 && (
                  <Badge className="mt-2" variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-2">
                  <AvatarImage src="/placeholder-patient.jpg" />
                  <AvatarFallback>{pacienteNome.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <h4 className="font-medium">{pacienteNome}</h4>
                <p className="text-sm text-muted-foreground">Paciente</p>
                {waitingState.participantsCount >= 2 && (
                  <Badge className="mt-2" variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status da conexão */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Status da Conexão
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Vídeo</p>
                  <Badge variant={connectionTest.video ? "default" : "destructive"}>
                    {connectionTest.video ? "OK" : "Erro"}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Áudio</p>
                  <Badge variant={connectionTest.audio ? "default" : "destructive"}>
                    {connectionTest.audio ? "OK" : "Erro"}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Qualidade</p>
                  <Badge variant={getConnectionStatus().color}>
                    {getConnectionStatus().text}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status de espera */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {getStatusMessage()}
              </span>
            </div>

            {waitingState.isWaiting && (
              <div className="text-sm text-muted-foreground">
                Tempo estimado: {waitingState.estimatedWait} minutos
              </div>
            )}
          </div>

          {/* Botão de entrada */}
          <div className="text-center">
            <Button
              onClick={onJoinCall}
              disabled={!waitingState.canJoin || connectionTest.connection === 'testing'}
              size="lg"
              className="w-full max-w-md"
            >
              {waitingState.canJoin ? (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Iniciar Videochamada
                </>
              ) : (
                'Aguardando participantes...'
              )}
            </Button>
          </div>

          {/* Instruções */}
          <Card className="bg-muted">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Instruções:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Certifique-se de que sua câmera e microfone estão funcionando</li>
                <li>• Use fones de ouvido para melhor qualidade de áudio</li>
                <li>• Mantenha um ambiente bem iluminado</li>
                <li>• Evite ruídos de fundo durante a consulta</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};