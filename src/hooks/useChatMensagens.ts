import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ChatMensagem {
  id: string;
  patient_id: string;
  clinica_id?: string;
  author_id: string;
  author_type: "doctor" | "patient" | "clinic" | "staff";
  author_nome?: string; // Nome do autor da mensagem
  content: string | null;
  media_url?: string | null;
  media_type?: string | null;
  read: boolean;
  read_at?: string | null;
  created_at: string;
  deleted: boolean;
}

export function useChatMensagens() {
  const [mensagens, setMensagens] = useState<ChatMensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  // Buscar mensagens de um paciente com nome do autor
  async function fetchMensagens(patientId: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from("chat_mensagens")
      .select(`
        *,
        author:profiles!author_id(nome)
      `)
      .eq("patient_id", patientId)
      .eq("deleted", false)
      .order("created_at", { ascending: true });
    setLoading(false);
    if (error) throw error;
    
    // Mapear os dados para incluir o nome do autor
    const mensagensComNome = (data || []).map((msg: any) => ({
      ...msg,
      author_nome: msg.author?.nome || 'Usuário'
    }));
    
    setMensagens(mensagensComNome);
    return mensagensComNome;
  }

  // Enviar nova mensagem
  async function sendMensagem(mensagem: Omit<ChatMensagem, "id" | "created_at" | "deleted" | "read" | "read_at">) {
    const { data, error } = await supabase
      .from("chat_mensagens")
      .insert([{ ...mensagem }])
      .select(`
        *,
        author:profiles!author_id(nome)
      `)
      .single();
    if (error) throw error;
    
    // Mapear os dados para incluir o nome do autor
    const mensagemComNome = {
      ...data,
      author_nome: data.author?.nome || 'Usuário'
    };
    
    setMensagens((prev) => [...prev, mensagemComNome]);
    return mensagemComNome;
  }

  // Marcar mensagens como lidas para o usuário logado
  async function markAsRead(patientId: string) {
    if (!profile) return;
    // Marcar como lidas todas as mensagens destinadas ao usuário logado (exceto as já lidas)
    const { error } = await supabase
      .from("chat_mensagens")
      .update({ read: true, read_at: new Date().toISOString() })
      .eq("patient_id", patientId)
      .eq("deleted", false)
      .eq("read", false)
      .neq("author_id", profile.id); // Não marca as próprias mensagens como lidas
    if (error) throw error;
    // Atualizar localmente
    setMensagens((prev) => prev.map(m =>
      m.patient_id === patientId && !m.read && m.author_id !== profile.id
        ? { ...m, read: true, read_at: new Date().toISOString() }
        : m
    ));
  }

  // Realtime: escutar novas mensagens
  useEffect(() => {
    const channel = supabase.channel('chat_mensagens_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_mensagens' }, (payload) => {
        setMensagens((prev) => {
          // Evitar duplicidade
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new as ChatMensagem];
        });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  return {
    mensagens,
    loading,
    fetchMensagens,
    sendMensagem,
    markAsRead,
  };
} 