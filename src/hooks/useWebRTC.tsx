import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface MediaRecorderChunk {
  data: Blob;
  timecode: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface WebRTCState {
  isConnected: boolean;
  isConnecting: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  recordingBlob: Blob | null;
  chatMessages: ChatMessage[];
  participants: string[];
}

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

export const useWebRTC = (roomId: string, userId: string, userName: string) => {
  const { toast } = useToast();
  const [state, setState] = useState<WebRTCState>({
    isConnected: false,
    isConnecting: false,
    localStream: null,
    remoteStream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    isRecording: false,
    recordingBlob: null,
    chatMessages: [],
    participants: []
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const signalingRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Initialize signaling connection
  const initializeSignaling = useCallback(() => {
    if (signalingRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const signalingUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname.includes('localhost') ? 'localhost:54321' : window.location.hostname.replace('app', 'functions')}/functions/v1/webrtc-signaling`;
    
    const ws = new WebSocket(signalingUrl);
    signalingRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to signaling server');
      ws.send(JSON.stringify({
        type: 'join-room',
        roomId,
        userId,
        data: { userName }
      }));
    };

    ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      await handleSignalingMessage(message);
    };

    ws.onclose = () => {
      console.log('Signaling connection closed');
      setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
    };

    ws.onerror = (error) => {
      console.error('Signaling error:', error);
      toast({
        title: "Erro de conexão",
        description: "Falha na conexão com o servidor de sinalização",
        variant: "destructive"
      });
    };
  }, [roomId, userId, userName, toast]);

  // Handle signaling messages
  const handleSignalingMessage = useCallback(async (message: any) => {
    const { type, data } = message;

    switch (type) {
      case 'room-members':
        setState(prev => ({ ...prev, participants: data.members }));
        break;

      case 'user-joined':
        setState(prev => ({ ...prev, participants: [...prev.participants, data.userId] }));
        if (peerConnectionRef.current && state.localStream) {
          await createOffer();
        }
        break;

      case 'user-left':
        setState(prev => ({ 
          ...prev, 
          participants: prev.participants.filter(p => p !== data.userId) 
        }));
        break;

      case 'offer':
        await handleOffer(data);
        break;

      case 'answer':
        await handleAnswer(data);
        break;

      case 'ice-candidate':
        await handleIceCandidate(data);
        break;

      case 'chat-message':
        setState(prev => ({
          ...prev,
          chatMessages: [...prev.chatMessages, {
            id: `${data.userId}-${Date.now()}`,
            userId: data.userId,
            userName: data.userName || data.userId,
            message: data.message,
            timestamp: new Date(data.timestamp)
          }]
        }));
        break;
    }
  }, [state.localStream]);

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate && signalingRef.current?.readyState === WebSocket.OPEN) {
        signalingRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          roomId,
          userId,
          data: event.candidate
        }));
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track');
      setState(prev => ({ ...prev, remoteStream: event.streams[0] }));
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setState(prev => ({ ...prev, isConnected: true, isConnecting: false }));
        toast({
          title: "Conectado!",
          description: "Videochamada estabelecida com sucesso"
        });
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));
      }
    };

    return pc;
  }, [roomId, userId, toast]);

  // Get user media
  const getUserMedia = useCallback(async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      });

      setState(prev => ({ ...prev, localStream: stream }));
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          peerConnectionRef.current!.addTrack(track, stream);
        });
      }

      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      toast({
        title: "Erro de mídia",
        description: "Não foi possível acessar câmera/microfone",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast]);

  // Create offer
  const createOffer = useCallback(async () => {
    if (!peerConnectionRef.current || !signalingRef.current) return;

    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);

      signalingRef.current.send(JSON.stringify({
        type: 'offer',
        roomId,
        userId,
        data: offer
      }));
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [roomId, userId]);

  // Handle offer
  const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current || !signalingRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      signalingRef.current.send(JSON.stringify({
        type: 'answer',
        roomId,
        userId,
        data: answer
      }));
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [roomId, userId]);

  // Handle answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  // Join call
  const joinCall = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      initializeSignaling();
      initializePeerConnection();
      await getUserMedia();
    } catch (error) {
      console.error('Error joining call:', error);
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  }, [initializeSignaling, initializePeerConnection, getUserMedia]);

  // Leave call
  const leaveCall = useCallback(() => {
    // Stop recording if active
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }

    // Stop local stream
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Close signaling connection
    if (signalingRef.current) {
      signalingRef.current.send(JSON.stringify({
        type: 'leave-room',
        roomId,
        userId
      }));
      signalingRef.current.close();
      signalingRef.current = null;
    }

    setState({
      isConnected: false,
      isConnecting: false,
      localStream: null,
      remoteStream: null,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isScreenSharing: false,
      isRecording: false,
      recordingBlob: null,
      chatMessages: [],
      participants: []
    });
  }, [state.localStream, state.isRecording, roomId, userId]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState(prev => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
      }
    }
  }, [state.localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({ ...prev, isAudioEnabled: audioTrack.enabled }));
      }
    }
  }, [state.localStream]);

  // Share screen
  const shareScreen = useCallback(async () => {
    if (state.isScreenSharing) {
      // Stop screen sharing, return to camera
      await getUserMedia();
      setState(prev => ({ ...prev, isScreenSharing: false }));
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current?.getSenders().find(s => 
        s.track?.kind === 'video'
      );

      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      setState(prev => ({ ...prev, isScreenSharing: true }));

      // Handle screen share end
      videoTrack.onended = async () => {
        await getUserMedia();
        setState(prev => ({ ...prev, isScreenSharing: false }));
      };

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
    } catch (error) {
      console.error('Error sharing screen:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar a tela",
        variant: "destructive"
      });
    }
  }, [state.isScreenSharing, getUserMedia, toast]);

  // Start recording
  const startRecording = useCallback(() => {
    if (!state.localStream) return;

    try {
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(state.localStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setState(prev => ({ ...prev, recordingBlob: blob, isRecording: false }));
        
        toast({
          title: "Gravação finalizada",
          description: "A consulta foi gravada com sucesso"
        });
      };

      mediaRecorder.start(1000); // Record in 1-second chunks
      mediaRecorderRef.current = mediaRecorder;
      setState(prev => ({ ...prev, isRecording: true }));

      toast({
        title: "Gravação iniciada",
        description: "A consulta está sendo gravada"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a gravação",
        variant: "destructive"
      });
    }
  }, [state.localStream, toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
    }
  }, [state.isRecording]);

  // Send chat message
  const sendChatMessage = useCallback((message: string) => {
    if (signalingRef.current?.readyState === WebSocket.OPEN) {
      signalingRef.current.send(JSON.stringify({
        type: 'chat-message',
        roomId,
        userId,
        data: { message, userName }
      }));
    }
  }, [roomId, userId, userName]);

  // Download recording
  const downloadRecording = useCallback(() => {
    if (state.recordingBlob) {
      const url = URL.createObjectURL(state.recordingBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `consulta-${roomId}-${new Date().toISOString()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [state.recordingBlob, roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveCall();
    };
  }, [leaveCall]);

  return {
    ...state,
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
  };
};