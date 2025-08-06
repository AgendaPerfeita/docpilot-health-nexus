import React, { useState, useEffect } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Phone, Monitor, 
  StopCircle, Download, MessageCircle, Users,
  Circle, Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useToast } from '@/components/ui/use-toast';

interface VideoCallRealProps {
  consultaId: string;
  participantName: string;
  onCallEnd: () => void;
  isHost: boolean;
  userName: string;
  userId: string;
}

export const VideoCallReal: React.FC<VideoCallRealProps> = ({
  consultaId,
  participantName,
  onCallEnd,
  isHost,
  userName,
  userId
}) => {
  const { toast } = useToast();
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime] = useState<Date>(new Date());

  const {
    isConnected,
    isConnecting,
    localStream,
    remoteStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    isRecording,
    recordingBlob,
    chatMessages,
    participants,
    localVideoRef,
    remoteVideoRef,
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

  // Call duration timer
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isConnected, callStartTime]);

  // Auto-join call when component mounts
  useEffect(() => {
    joinCall();
  }, [joinCall]);

  const handleEndCall = () => {
    leaveCall();
    onCallEnd();
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendChatMessage(chatMessage.trim());
      setChatMessage('');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatus = () => {
    if (isConnecting) return { text: 'Conectando...', color: 'bg-yellow-500' };
    if (isConnected) return { text: 'Conectado', color: 'bg-green-500' };
    return { text: 'Desconectado', color: 'bg-red-500' };
  };

  const status = getConnectionStatus();

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-background/90 backdrop-blur-sm border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.color}`} />
            {status.text}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Consulta com {participantName}
          </span>
          {isConnected && (
            <Badge variant="secondary">
              {formatDuration(callDuration)}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Users className="w-3 h-3" />
            {participants.length + 1}
          </Badge>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Circle className="w-3 h-3 mr-1 fill-current" />
              REC
            </Badge>
          )}
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {/* Remote Video */}
        <div className="absolute inset-0">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-semibold">
                    {participantName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-sm opacity-75">Aguardando {participantName}...</p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <VideoOff className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute top-0 right-0 w-80 h-full bg-background border-l flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Chat da Consulta</h3>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.userId === userId
                        ? 'bg-primary text-primary-foreground ml-4'
                        : 'bg-muted mr-4'
                    }`}
                  >
                    <div className="text-xs opacity-75 mb-1">
                      {msg.userName} • {msg.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="text-sm">{msg.message}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="sm">
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-background/90 backdrop-blur-sm border-t p-4">
        <div className="flex items-center justify-center gap-3">
          {/* Media Controls */}
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12 p-0"
          >
            {isVideoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12 p-0"
          >
            {isAudioEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </Button>

          {/* Screen Share */}
          <Button
            variant={isScreenSharing ? "secondary" : "outline"}
            size="lg"
            onClick={shareScreen}
            className="rounded-full w-12 h-12 p-0"
          >
            <Monitor className="w-5 h-5" />
          </Button>

          {/* Recording Controls */}
          {isHost && (
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className="rounded-full w-12 h-12 p-0"
            >
              {isRecording ? (
                <Square className="w-5 h-5" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </Button>
          )}

          {/* Chat Toggle */}
          <Button
            variant={showChat ? "secondary" : "outline"}
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className="rounded-full w-12 h-12 p-0 relative"
          >
            <MessageCircle className="w-5 h-5" />
            {chatMessages.length > 0 && !showChat && (
              <Badge className="absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center">
                {chatMessages.length}
              </Badge>
            )}
          </Button>

          {/* Download Recording */}
          {recordingBlob && (
            <Button
              variant="outline"
              size="lg"
              onClick={downloadRecording}
              className="rounded-full w-12 h-12 p-0"
            >
              <Download className="w-5 h-5" />
            </Button>
          )}

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full w-12 h-12 p-0 ml-4"
          >
            <Phone className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};