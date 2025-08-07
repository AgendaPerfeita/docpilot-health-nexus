import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageCircle, X } from 'lucide-react';
import { useChatMensagens } from '@/hooks/useChatMensagens';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface NotificacoesChatMedicoProps {
  onOpenChat: (pacienteId: string, patientName: string) => void;
}

export const NotificacoesChatMedico: React.FC<NotificacoesChatMedicoProps> = ({
  onOpenChat
}) => {
  const { mensagens } = useChatMensagens();
  const { profile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [pacientes, setPacientes] = useState<any[]>([]);

  // Buscar dados dos pacientes
  useEffect(() => {
    const fetchPacientes = async () => {
      if (!profile) return;

      try {
        const { data, error } = await supabase
          .from('pacientes')
          .select('id, nome, cpf');
        
        if (error) throw error;
        setPacientes(data || []);
      } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
      }
    };

    fetchPacientes();
  }, [profile]);

  // Agrupar mensagens não lidas por paciente
  const unreadMessagesByPatient = mensagens.reduce((acc, msg) => {
    if (!msg.read && msg.author_id !== profile?.id) {
      if (!acc[msg.patient_id]) {
        acc[msg.patient_id] = {
          count: 0,
          lastMessage: msg,
          patientName: pacientes.find(p => p.id === msg.patient_id)?.nome || 'Paciente'
        };
      }
      acc[msg.patient_id].count++;
      if (new Date(msg.created_at) > new Date(acc[msg.patient_id].lastMessage.created_at)) {
        acc[msg.patient_id].lastMessage = msg;
      }
    }
    return acc;
  }, {} as Record<string, { count: number; lastMessage: any; patientName: string }>);

  const totalUnreadCount = Object.values(unreadMessagesByPatient).reduce(
    (sum, patient) => sum + patient.count, 0
  );

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (totalUnreadCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-20 z-40">
      <Button
        variant="outline"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {totalUnreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
            {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute top-12 right-0 w-80 max-h-96 overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="p-3 border-b flex items-center justify-between">
              <h4 className="font-medium text-sm">Mensagens não lidas</h4>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowNotifications(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {Object.entries(unreadMessagesByPatient).map(([patientId, data]) => (
                <div
                  key={patientId}
                  className="p-3 border-b last:border-b-0 hover:bg-muted cursor-pointer"
                  onClick={() => {
                    onOpenChat(patientId, data.patientName);
                    setShowNotifications(false);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm truncate">
                          {data.patientName}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {data.count}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {data.lastMessage.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(data.lastMessage.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};