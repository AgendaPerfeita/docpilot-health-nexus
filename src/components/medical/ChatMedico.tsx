import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Paperclip, X, Upload } from 'lucide-react';
import { useChatMensagens, ChatMensagem } from '@/hooks/useChatMensagens';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMedicoProps {
  pacienteId: string;
  patientName: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatMedico: React.FC<ChatMedicoProps> = ({
  pacienteId,
  patientName,
  isOpen,
  onToggle
}) => {
  const { mensagens, loading, fetchMensagens, sendMensagem, markAsRead } = useChatMensagens();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const patientMessages = mensagens.filter(m => m.patient_id === pacienteId);
  const unreadCount = patientMessages.filter(m => !m.read && m.author_id !== profile?.id).length;

  useEffect(() => {
    if (pacienteId) {
      fetchMensagens(pacienteId);
    }
  }, [pacienteId]);

  useEffect(() => {
    if (isOpen) {
      markAsRead(pacienteId);
    }
  }, [isOpen, pacienteId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [patientMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !profile) return;

    setSending(true);
    try {
      await sendMensagem({
        patient_id: pacienteId,
        author_id: profile.id,
        author_type: profile.tipo === 'medico' ? 'doctor' : profile.tipo === 'clinica' ? 'clinic' : 'staff',
        content: newMessage.trim(),
        author_nome: profile.nome
      });
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      // Upload do arquivo para o storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `chat/${pacienteId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('anexos-medicos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Salvar mensagem com arquivo
      await sendMensagem({
        patient_id: pacienteId,
        author_id: profile.id,
        author_type: profile.tipo === 'medico' ? 'doctor' : profile.tipo === 'clinica' ? 'clinic' : 'staff',
        content: `📎 ${file.name}`,
        media_url: uploadData.path,
        media_type: file.type,
        media_storage_path: filePath,
        author_nome: profile.nome
      });

      toast({
        title: "Arquivo enviado",
        description: "Arquivo compartilhado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const getAuthorTypeLabel = (authorType: string) => {
    switch (authorType) {
      case 'doctor': return 'Médico';
      case 'patient': return 'Paciente';
      case 'clinic': return 'Clínica';
      case 'staff': return 'Equipe';
      default: return 'Sistema';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          className="rounded-full w-14 h-14 shadow-lg relative"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 z-50 shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">
            Chat - {patientName}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-80">
        <ScrollArea className="flex-1 px-4">
          {loading && (
            <div className="text-center text-muted-foreground py-4">
              Carregando mensagens...
            </div>
          )}
          
          {patientMessages.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs">Inicie uma conversa com o paciente</p>
            </div>
          )}

          {patientMessages.map((message, index) => {
            const isNewDay = index === 0 || 
              formatDate(message.created_at) !== formatDate(patientMessages[index - 1].created_at);
            const isMyMessage = message.author_id === profile?.id;

            return (
              <div key={message.id}>
                {isNewDay && (
                  <div className="text-center my-2">
                    <span className="bg-muted px-2 py-1 rounded text-xs text-muted-foreground">
                      {formatDate(message.created_at)}
                    </span>
                  </div>
                )}
                
                <div className={`mb-3 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[80%] rounded-lg px-3 py-2 ${
                    isMyMessage 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {!isMyMessage && (
                      <div className="text-xs opacity-70 mb-1">
                        {message.author_nome} ({getAuthorTypeLabel(message.author_type)})
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>
                    {message.media_url && (
                      <div className="mt-1 text-xs opacity-70">
                        📎 Arquivo anexado
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.created_at)}
                    {!message.read && !isMyMessage && (
                      <span className="ml-1 text-blue-500">●</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t p-3">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Upload className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
            </Button>
            <Input
              placeholder="Digite sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={sending}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};