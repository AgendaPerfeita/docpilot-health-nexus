import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, Monitor, MessageCircle, Phone, Circle, Square, Download, Users } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useChatMensagens } from '@/hooks/useChatMensagens';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VideoCallRealProps {
  consultaId: string;
  participantName: string;
  onCallEnd: () => void;
  isHost: boolean;
  userName: string;
  userId: string;
}

const VideoCallReal: React.FC<VideoCallRealProps> = ({
  consultaId,
  participantName,
  onCallEnd,
  isHost,
  userName,
  userId
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // WebRTC hook para gerenciar a conexão
  const {
    isConnected,
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    isRecording,
    participants,
    chatMessages,
    joinCall,
    leaveCall,
    toggleVideo,
    toggleAudio,
    shareScreen,
    startRecording,
    stopRecording,
    sendChatMessage,
    downloadRecording
  } = useWebRTC(consultaId, userId, userName);

  // Chat interno integrado
  const { mensagens, sendMensagem, markAsRead, fetchMensagens } = useChatMensagens();

  // Buscar mensagens do paciente
  useEffect(() => {
    if (consultaId && profile?.tipo === 'medico') {
      fetchMensagens(consultaId);
    }
  }, [consultaId, profile]);

  // Configurar streams de vídeo
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Efeito para iniciar o timer quando conectado
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Auto-conectar quando o componente monta
  useEffect(() => {
    joinCall();
    
    return () => {
      leaveCall();
    };
  }, [joinCall, leaveCall]);

  const handleEndCall = () => {
    leaveCall();
    onCallEnd();
  };

  // Enviar mensagem do chat interno
  const handleSendChatMessage = async () => {
    if (!chatMessage.trim() || !profile) return;

    try {
      await sendMensagem({
        patient_id: consultaId,
        author_id: profile.id,
        author_type: profile.tipo === 'medico' ? 'doctor' : 'patient',
        content: `💬 [Telemedicina] ${chatMessage}`,
        author_nome: profile.nome
      });
      setChatMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatus = () => {
    if (isConnected) {
      return { text: 'Conectado', color: 'text-green-500' };
    }
    return { text: 'Conectando...', color: 'text-yellow-500' };
  };

  // Filtrar mensagens da telemedicina
  const telemedicineMensagens = mensagens.filter(m => 
    m.patient_id === consultaId && 
    m.content?.includes('[Telemedicina]')
  );

  const status = getConnectionStatus();

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant={isConnected ? "default" : "secondary"} className={status.color}>
            {status.text}
          </Badge>
          <h1 className="text-lg font-semibold">{participantName}</h1>
          {isConnected && (
            <span className="text-sm text-gray-400">
              {formatDuration(callDuration)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-gray-300">
            <Users className="h-3 w-3 mr-1" />
            {participants.length}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Vídeo remoto */}
        <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold">
                    {participantName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <p className="text-lg font-medium">{participantName}</p>
                <p className="text-gray-400">Aguardando conexão...</p>
              </div>
            </div>
          )}
          
          {/* Vídeo local (picture-in-picture) */}
          <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
            {localStream ? (
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white text-xs">
                Sem vídeo
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel - Integrado com chat interno */}
        {showChat && (
          <Card className="w-80 h-full bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white">Chat da Consulta</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-full">
              <ScrollArea className="flex-1 p-4">
                {telemedicineMensagens.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {telemedicineMensagens.map((msg) => (
                      <div key={msg.id} className="text-sm">
                        <div className="font-medium text-xs text-muted-foreground mb-1">
                          {msg.author_nome}
                        </div>
                        <div className="bg-muted p-2 rounded text-black">
                          {msg.content?.replace('[Telemedicina] ', '')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              <div className="border-t border-gray-700 p-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    className="flex-1 bg-gray-700 border-gray-600 text-white"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendChatMessage}
                    disabled={!chatMessage.trim()}
                  >
                    Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 flex items-center justify-center gap-4">
        <Button
          variant={isVideoEnabled ? "default" : "secondary"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full"
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={isAudioEnabled ? "default" : "secondary"}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full"
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={isScreenSharing ? "default" : "outline"}
          size="lg"
          onClick={shareScreen}
          className="rounded-full"
        >
          <Monitor className="h-5 w-5" />
        </Button>

        {isHost && (
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="lg"
            onClick={isRecording ? stopRecording : startRecording}
            className="rounded-full"
          >
            {isRecording ? <Square className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
          </Button>
        )}

        <Button
          variant="outline"
          size="lg"
          onClick={() => setShowChat(!showChat)}
          className="rounded-full relative"
        >
          <MessageCircle className="h-5 w-5" />
          {telemedicineMensagens.length > 0 && !showChat && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {telemedicineMensagens.length > 99 ? '99+' : telemedicineMensagens.length}
            </Badge>
          )}
        </Button>

        {isRecording && (
          <Button
            variant="outline"
            size="lg"
            onClick={downloadRecording}
            className="rounded-full"
          >
            <Download className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="destructive"
          size="lg"
          onClick={handleEndCall}
          className="rounded-full"
        >
          <Phone className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default VideoCallReal;