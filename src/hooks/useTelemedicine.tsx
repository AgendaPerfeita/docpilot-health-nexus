import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface TelemedicineSession {
  id: string;
  consultaId: string;
  participantId: string;
  status: 'waiting' | 'connecting' | 'connected' | 'ended';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  quality: 'excellent' | 'good' | 'poor';
}

interface UseTelemedicineReturn {
  session: TelemedicineSession | null;
  isInCall: boolean;
  startSession: (consultaId: string, participantId: string) => Promise<void>;
  endSession: () => void;
  updateSessionStatus: (status: TelemedicineSession['status']) => void;
  getSessionStats: () => {
    duration: number;
    quality: string;
    avgLatency: number;
  };
}

export const useTelemedicine = (): UseTelemedicineReturn => {
  const { toast } = useToast();
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const startTimeRef = useRef<Date | null>(null);
  const qualityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = useCallback(async (consultaId: string, participantId: string) => {
    try {
      const newSession: TelemedicineSession = {
        id: `session_${Date.now()}`,
        consultaId,
        participantId,
        status: 'waiting',
        quality: 'excellent'
      };

      setSession(newSession);
      startTimeRef.current = new Date();

      // Iniciar monitoramento de qualidade
      qualityCheckIntervalRef.current = setInterval(() => {
        // Simular verificação de qualidade da conexão
        const qualities: TelemedicineSession['quality'][] = ['excellent', 'good', 'poor'];
        const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
        
        setSession(prev => prev ? { ...prev, quality: randomQuality } : null);
      }, 5000);

      toast({
        title: "Sessão de telemedicina iniciada",
        description: "Preparando conexão para videochamada"
      });
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      toast({
        title: "Erro na telemedicina",
        description: "Não foi possível iniciar a sessão",
        variant: "destructive"
      });
    }
  }, [toast]);

  const endSession = useCallback(() => {
    if (session && startTimeRef.current) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTimeRef.current.getTime()) / 1000);

      setSession(prev => prev ? {
        ...prev,
        status: 'ended',
        endTime,
        duration
      } : null);

      setIsInCall(false);

      // Limpar monitoramento
      if (qualityCheckIntervalRef.current) {
        clearInterval(qualityCheckIntervalRef.current);
        qualityCheckIntervalRef.current = null;
      }

      toast({
        title: "Sessão finalizada",
        description: `Duração: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
      });
    }
  }, [session, toast]);

  const updateSessionStatus = useCallback((status: TelemedicineSession['status']) => {
    setSession(prev => prev ? { ...prev, status } : null);
    
    if (status === 'connected') {
      setIsInCall(true);
      setSession(prev => prev ? { ...prev, startTime: new Date() } : null);
    } else if (status === 'ended') {
      setIsInCall(false);
    }
  }, []);

  const getSessionStats = useCallback(() => {
    if (!session || !startTimeRef.current) {
      return {
        duration: 0,
        quality: 'unknown',
        avgLatency: 0
      };
    }

    const currentTime = session.endTime || new Date();
    const duration = Math.floor((currentTime.getTime() - startTimeRef.current.getTime()) / 1000);

    return {
      duration,
      quality: session.quality,
      avgLatency: Math.random() * 100 + 50 // Simulado
    };
  }, [session]);

  return {
    session,
    isInCall,
    startSession,
    endSession,
    updateSessionStatus,
    getSessionStats
  };
};