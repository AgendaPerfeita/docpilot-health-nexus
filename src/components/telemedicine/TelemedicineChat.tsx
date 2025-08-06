import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  attachment?: {
    name: string;
    url: string;
    size: number;
  };
}

interface TelemedicineChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, attachment?: File) => void;
  currentUserId: string;
  currentUserName: string;
  isVisible: boolean;
}

export const TelemedicineChat: React.FC<TelemedicineChatProps> = ({
  messages,
  onSendMessage,
  currentUserId,
  currentUserName,
  isVisible
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMessage(`Arquivo enviado: ${file.name}`, file);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="w-80 h-full bg-background border-l flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          Chat da Consulta
          {messages.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {messages.length}
            </Badge>
          )}
        </h3>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm">
              <p>Nenhuma mensagem ainda.</p>
              <p>Inicie a conversa!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.userId === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.userId === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {/* Message header */}
                  <div className="flex items-center gap-2 mb-1">
                    {msg.userId !== currentUserId && (
                      <span className="text-xs font-medium opacity-75">
                        {msg.userName}
                      </span>
                    )}
                    <span className="text-xs opacity-60">
                      {formatTime(msg.timestamp)}
                    </span>
                    {getMessageIcon(msg.type)}
                  </div>

                  {/* Message content */}
                  <div className="text-sm">
                    {msg.message}
                    {msg.attachment && (
                      <div className="mt-2 p-2 rounded bg-black/10 text-xs">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-3 h-3" />
                          <span>{msg.attachment.name}</span>
                          <span className="opacity-60">
                            ({(msg.attachment.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>Digitando</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFileUpload}
            className="px-2"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </div>
    </div>
  );
};