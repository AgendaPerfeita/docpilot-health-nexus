import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, Mic, MicOff, Monitor, Phone, PhoneOff, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VideoCallProps {
  consultaId: string;
  participantName: string;
  onCallEnd?: () => void;
  isHost?: boolean;
}

interface CallState {
  isConnected: boolean;
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  callDuration: number;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  consultaId,
  participantName,
  onCallEnd,
  isHost = false
}) => {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isVideoOn: true,
    isAudioOn: true,
    isScreenSharing: false,
    callDuration: 0
  });

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (callState.isConnected) {
      const interval = setInterval(() => {
        setCallState(prev => ({ ...prev, callDuration: prev.callDuration + 1 }));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState.isConnected]);

  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === 'connected') {
          setConnectionStatus('connected');
          setCallState(prev => ({ ...prev, isConnected: true }));
          toast({
            title: "Conexão estabelecida",
            description: "Videochamada conectada com sucesso"
          });
        } else if (state === 'disconnected' || state === 'failed') {
          setConnectionStatus('disconnected');
          setCallState(prev => ({ ...prev, isConnected: false }));
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Em uma implementação real, enviaria via WebSocket/Supabase realtime
          console.log('ICE candidate:', event.candidate);
        }
      };

      // Simular conexão bem-sucedida para demo
      setTimeout(() => {
        setConnectionStatus('connected');
        setCallState(prev => ({ ...prev, isConnected: true }));
      }, 2000);

    } catch (error) {
      console.error('Erro ao inicializar chamada:', error);
      toast({
        title: "Erro na videochamada",
        description: "Não foi possível acessar câmera/microfone",
        variant: "destructive"
      });
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !callState.isVideoOn;
        setCallState(prev => ({ ...prev, isVideoOn: !prev.isVideoOn }));
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !callState.isAudioOn;
        setCallState(prev => ({ ...prev, isAudioOn: !prev.isAudioOn }));
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!callState.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });

        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );

        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        videoTrack.onended = () => {
          setCallState(prev => ({ ...prev, isScreenSharing: false }));
          // Voltar para câmera
          if (localStreamRef.current) {
            const cameraTrack = localStreamRef.current.getVideoTracks()[0];
            if (sender) {
              sender.replaceTrack(cameraTrack);
            }
          }
        };

        setCallState(prev => ({ ...prev, isScreenSharing: true }));
      } else {
        // Voltar para câmera
        if (localStreamRef.current) {
          const cameraTrack = localStreamRef.current.getVideoTracks()[0];
          const sender = peerConnectionRef.current?.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(cameraTrack);
          }
        }
        setCallState(prev => ({ ...prev, isScreenSharing: false }));
      }
    } catch (error) {
      console.error('Erro ao compartilhar tela:', error);
      toast({
        title: "Erro no compartilhamento",
        description: "Não foi possível compartilhar a tela",
        variant: "destructive"
      });
    }
  };

  const endCall = () => {
    cleanup();
    onCallEnd?.();
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header da videochamada */}
      <div className="flex items-center justify-between p-4 bg-card border-b">
        <div className="flex items-center gap-3">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'secondary'}>
            {connectionStatus === 'connecting' && 'Conectando...'}
            {connectionStatus === 'connected' && 'Conectado'}
            {connectionStatus === 'disconnected' && 'Desconectado'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {participantName}
          </span>
        </div>
        {callState.isConnected && (
          <div className="text-sm font-mono">
            {formatDuration(callState.callDuration)}
          </div>
        )}
      </div>

      {/* Área dos vídeos */}
      <div className="flex-1 relative bg-muted">
        {/* Vídeo remoto (principal) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Vídeo local (picture-in-picture) */}
        <Card className="absolute top-4 right-4 w-48 h-36 overflow-hidden">
          <CardContent className="p-0 h-full">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!callState.isVideoOn && (
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <CameraOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status de compartilhamento de tela */}
        {callState.isScreenSharing && (
          <Badge className="absolute top-4 left-4" variant="outline">
            <Monitor className="h-3 w-3 mr-1" />
            Compartilhando tela
          </Badge>
        )}
      </div>

      {/* Controles da videochamada */}
      <div className="flex items-center justify-center gap-2 p-4 bg-card border-t">
        <Button
          variant={callState.isVideoOn ? "default" : "destructive"}
          size="icon"
          onClick={toggleVideo}
        >
          {callState.isVideoOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
        </Button>

        <Button
          variant={callState.isAudioOn ? "default" : "destructive"}
          size="icon"
          onClick={toggleAudio}
        >
          {callState.isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>

        <Button
          variant={callState.isScreenSharing ? "default" : "outline"}
          size="icon"
          onClick={toggleScreenShare}
        >
          <Monitor className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>

        <Button
          variant="destructive"
          onClick={endCall}
          className="ml-4"
        >
          <PhoneOff className="h-4 w-4 mr-2" />
          Encerrar
        </Button>
      </div>
    </div>
  );
};