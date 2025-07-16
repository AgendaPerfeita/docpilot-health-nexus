import { useState, useEffect, useMemo, useRef } from "react"
import { User, FileText, Calendar, Upload, Download, MessageCircle, Send, FileImage, File, Plus, Search, Phone, Mail, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useChatMensagens } from "@/hooks/useChatMensagens";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom"
import { Tabs as UITabs, TabsList as UITabsList, TabsTrigger as UITabsTrigger, TabsContent as UITabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  lastMessage?: string
  lastMessageDate?: string
  unreadMessages: number
  pendingExams: number
  status: 'active' | 'inactive'
}

interface Message {
  id: string
  patientId: string
  from: 'patient' | 'doctor'
  content: string
  timestamp: string
  read: boolean
}

interface Exam {
  id: string
  patientId: string
  name: string
  type: 'uploaded' | 'requested'
  date: string
  status: 'pending' | 'completed' | 'requested' | 'in_progress'
  file?: string
  requestedBy?: string
  observations?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  resultDate?: string
  resultSummary?: string
  labName?: string
  cost?: number
  insurance?: string
  scheduledDate?: string
  notes?: string
}

export default function AcompanhamentoPacientes() {
  const [activeTab, setActiveTab] = useState('patients')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isRequestExamDialogOpen, setIsRequestExamDialogOpen] = useState(false)
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const { profile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [messages, setMessages] = useState<Message[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const { mensagens, loading: loadingMensagens, fetchMensagens, sendMensagem, markAsRead } = useChatMensagens();
  const location = useLocation();
  const navigate = useNavigate();
  // CORREÇÃO: chamar o hook no topo do componente, não dentro de useMemo
  const anexosMedicos = useAnexosMedicos(selectedPatient?.id);
  const [previewArquivo, setPreviewArquivo] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [errorPreview, setErrorPreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [naturalWidth, setNaturalWidth] = useState<number | null>(null);
  const [naturalHeight, setNaturalHeight] = useState<number | null>(null);
  const mensagensContainerRef = useRef<HTMLDivElement | null>(null);

  // Função utilitária para extrair o path relativo do storage
  const getStoragePath = (url_storage: string) => {
    if (!url_storage) return '';
    if (url_storage.startsWith('http')) {
      const idx = url_storage.indexOf('/anexos-medicos/');
      if (idx !== -1) {
        return url_storage.substring(idx + '/anexos-medicos/'.length);
      }
      return '';
    }
    return url_storage;
  };

  // Função para abrir o preview
  const handlePreviewArquivo = async (arquivo: any) => {
    setPreviewArquivo(arquivo);
    setLoadingPreview(true);
    setErrorPreview(null);
    setPreviewUrl(null);
    setZoom(1);
    // Extrai o path relativo do arquivo de forma segura
    const path = getStoragePath(arquivo.url_storage);
    try {
      const { data, error } = await supabase.storage
        .from('anexos-medicos')
        .createSignedUrl(path, 60); // 60 segundos
      if (error || !data?.signedUrl) {
        setErrorPreview('Não foi possível gerar o link seguro para visualização.');
        setLoadingPreview(false);
        return;
      }
      setPreviewUrl(data.signedUrl);
    } catch (e) {
      setErrorPreview('Erro ao gerar preview.');
    }
    setLoadingPreview(false);
  };

  const handleDownload = async () => {
    if (!previewUrl) return;
    const response = await fetch(previewUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = previewArquivo.nome_arquivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  // Buscar pacientes reais do novo modelo multi-clínica/multi-médico
  useEffect(() => {
    async function fetchPatients() {
      setLoadingPatients(true);
      console.log('[ACOMPANHAMENTO] Iniciando fetchPatients. Profile:', profile);
      let data = [];
      let error = null;
      // Exemplo: buscar pacientes da clínica selecionada (ou do médico solo)
      try {
        if (profile.tipo === 'clinica' || profile.tipo === 'staff') {
          // Pacientes da clínica
          const { data: pacientes, error: err } = await supabase
            .from('paciente_clinica')
            .select('paciente:paciente_id(id, nome, email, telefone)')
            .eq('clinica_id', profile.tipo === 'clinica' ? profile.id : profile.clinica_id);
          error = err;
          data = pacientes?.map(pc => pc.paciente) || [];
        } else if (profile.tipo === 'medico') {
          // Pacientes do médico solo (consultório próprio)
          const { data: pacientesSolo, error: errSolo } = await supabase
            .from('paciente_medico')
            .select('paciente:paciente_id(id, nome, email, telefone)')
            .eq('medico_id', profile.id)
            .eq('clinica_id', profile.id); // solo: clinica_id = medico_id
          // Pacientes do médico em clínicas
          const { data: pacientesClinicas, error: errClinicas } = await supabase
            .from('paciente_medico')
            .select('paciente:paciente_id(id, nome, email, telefone)')
            .eq('medico_id', profile.id)
            .neq('clinica_id', profile.id); // clínicas reais
          error = errSolo || errClinicas;
          data = [
            ...(pacientesSolo?.map(pm => pm.paciente) || []),
            ...(pacientesClinicas?.map(pm => pm.paciente) || [])
          ];
        }
      } catch (e) {
        error = e;
      }
      if (error) {
        console.error('[ACOMPANHAMENTO] Erro ao buscar pacientes:', error);
      } else {
        console.log('[ACOMPANHAMENTO] Pacientes encontrados:', data);
      }
      setPatients((data || []).map((p: any) => ({
        id: p.id,
        name: p.nome,
        email: p.email,
        phone: p.telefone,
        status: 'active' as const,
        unreadMessages: 0,
        pendingExams: 0
      })));
      setLoadingPatients(false);
    }
    fetchPatients();
  }, [profile]);

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedPatient) return
    // Enviar mensagem real para o Supabase
    await sendMensagem({
      patient_id: selectedPatient.id,
      clinica_id: null, // ou defina conforme contexto
      author_id: profile.id, // id real do usuário logado
      // Garantir tipo correto para o chat
      author_type: profile.tipo === 'medico' ? 'doctor'
        : profile.tipo === 'paciente' ? 'patient'
        : profile.tipo === 'clinica' ? 'clinic'
        : profile.tipo === 'staff' ? 'staff'
        : 'clinic', // fallback seguro
      content: newMessage,
      media_url: null,
      media_type: null
    });
    setNewMessage('');
    // Remover: setIsMessageDialogOpen(false); // Não fechar o chat após enviar
  }

  // Abrir chat automaticamente se vier parâmetro ?chat=PATIENT_ID
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatPatientId = params.get('chat');
    if (chatPatientId) {
      const patient = patients.find(p => p.id === chatPatientId);
      if (patient) {
        setSelectedPatient(patient);
        setIsMessageDialogOpen(true);
      }
    }
    // eslint-disable-next-line
  }, [location.search, patients]);

  // Ao abrir o chat de um paciente, buscar mensagens reais
  useEffect(() => {
    if (isMessageDialogOpen && selectedPatient) {
      fetchMensagens(selectedPatient.id);
      markAsRead(selectedPatient.id);
    }
  }, [isMessageDialogOpen, selectedPatient]);

  // Carregar mensagens de todos os pacientes para a aba "Mensagens"
  useEffect(() => {
    if (patients.length > 0) {
      // Buscar mensagens de todos os pacientes
      patients.forEach(patient => {
        fetchMensagens(patient.id);
      });
    }
  }, [patients]);

  const getPatientMessages = (patientId: string) => {
    return messages.filter(m => m.patientId === patientId)
  }

  const getPatientExams = (patientId: string) => {
    return exams.filter(e => e.patientId === patientId)
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('.pdf')) return <File className="h-4 w-4 text-red-500" />
    if (fileName.includes('.jpg') || fileName.includes('.png')) return <FileImage className="h-4 w-4 text-blue-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'in_progress': return 'Em Andamento'
      case 'requested': return 'Solicitado'
      case 'pending': return 'Pendente'
      default: return 'Desconhecido'
    }
  }

  // Hook para anexos médicos do paciente
  function useAnexosMedicos(pacienteId?: string) {
    const [arquivos, setArquivos] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Listar arquivos do paciente
    const fetchArquivos = async () => {
      if (!pacienteId) return;
      const { data, error } = await supabase
        .from('anexos_medicos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('data_upload', { ascending: false });
      if (error) setError(error.message);
      setArquivos(data || []);
    };

    // Upload de arquivo
    const uploadArquivo = async (file: File) => {
      if (!pacienteId) return;
      setUploading(true);
      setError(null);
      // Limites
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (file.size > maxSize) {
        setError('Arquivo muito grande (máx 10MB)');
        setUploading(false);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de arquivo não permitido');
        setUploading(false);
        return;
      }
      // Path organizado
      const path = `paciente_${pacienteId}/${Date.now()}_${file.name}`;
      console.log('Tentando upload para bucket:', path, file);
      // Upload para bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from('anexos-medicos')
        .upload(path, file, { upsert: false });
      if (storageError) {
        setError(storageError.message);
        setUploading(false);
        return;
      }
      // URL pública
      const { data: publicUrlData } = supabase.storage.from('anexos-medicos').getPublicUrl(path);
      const url = publicUrlData?.publicUrl || '';
      // Salvar metadados na tabela
      const insertData = {
        paciente_id: pacienteId,
        nome_arquivo: file.name,
        tipo_arquivo: file.type,
        tamanho_bytes: file.size,
        url_storage: url,
        categoria: 'outros',
        data_upload: new Date().toISOString(),
        ...(profile?.tipo === 'medico' && { medico_id: profile.id }),
        ...(profile?.tipo === 'staff' && { staff_id: profile.id }),
        ...(profile?.tipo === 'clinica' && { clinica_id: profile.id }),
        ...(profile?.tipo === 'paciente' && { paciente_upload_id: profile.id }),
      };
      console.log('profile:', profile);
      console.log('insertData:', insertData);
      const { error: dbError } = await supabase
        .from('anexos_medicos')
        .insert(insertData);
      if (dbError) setError(dbError.message);
      setUploading(false);
      fetchArquivos();
    };

    // Excluir arquivo
    const excluirArquivo = async (arquivo: any) => {
      // Remove do storage
      const path = arquivo.url_storage.split('/anexos-medicos/')[1];
      await supabase.storage.from('anexos-medicos').remove([path]);
      // Remove da tabela
      await supabase.from('anexos_medicos').delete().eq('id', arquivo.id);
      fetchArquivos();
    };

    useEffect(() => { fetchArquivos(); }, [pacienteId]);

    return { arquivos, uploading, error, uploadArquivo, excluirArquivo, fetchArquivos };
  }

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (
      isMessageDialogOpen &&
      mensagensContainerRef.current &&
      selectedPatient
    ) {
      const mensagensPaciente = mensagens.filter(m => m.patient_id === selectedPatient.id);
      if (mensagensPaciente.length > 0) {
        timeout = setTimeout(() => {
          mensagensContainerRef.current!.scrollTop = mensagensContainerRef.current!.scrollHeight;
        }, 400); // ajuste o tempo conforme necessário
      }
    }
    return () => clearTimeout(timeout);
  }, [isMessageDialogOpen, mensagens, selectedPatient]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Acompanhamento de Pacientes</h1>
          <p className="text-muted-foreground">Gerencie comunicação e exames dos pacientes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients" className="gap-2">
            <User className="h-4 w-4" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2">
            <FileText className="h-4 w-4" />
            Exames
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Última Mensagem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            {patient.unreadMessages > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {patient.unreadMessages} nova{patient.unreadMessages > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.lastMessage ? (
                          <div className="max-w-xs">
                            <p className="text-sm truncate">{patient.lastMessage}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(patient.lastMessageDate!).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Nenhuma mensagem</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                          {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setIsMessageDialogOpen(true)
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setIsRequestExamDialogOpen(true)
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversas com Pacientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  // Agrupar mensagens por paciente usando o array mensagens do hook
                  const patientConversations = patients.map(patient => {
                    const patientMessages = mensagens.filter(m => m.patient_id === patient.id)
                    const lastMessage = patientMessages[patientMessages.length - 1]
                    const unreadCount = patientMessages.filter(m => !m.read && m.author_type === 'patient').length
                    
                    return {
                      patient,
                      lastMessage,
                      unreadCount,
                      messageCount: patientMessages.length
                    }
                  }).filter(conv => conv.messageCount > 0) // Só mostrar pacientes com mensagens
                    .sort((a, b) => {
                      // Ordenar por data da última mensagem (mais recente primeiro)
                      if (!a.lastMessage && !b.lastMessage) return 0
                      if (!a.lastMessage) return 1
                      if (!b.lastMessage) return -1
                      return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
                    })

                  return patientConversations.length > 0 ? (
                    patientConversations.map((conversation) => (
                      <div key={conversation.patient.id} className="border rounded-xl p-4 hover:bg-muted/30 transition-all duration-200 hover:shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Cabeçalho da conversa */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg truncate">{conversation.patient.name}</h3>
                                  {conversation.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs px-2 py-1">
                                      {conversation.unreadCount} nova{conversation.unreadCount > 1 ? 's' : ''}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">
                                    {conversation.messageCount} mensagem{conversation.messageCount > 1 ? 'ns' : ''}
                                  </Badge>
                                  <span>•</span>
                                  <span>{conversation.patient.email}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Última mensagem */}
                            {conversation.lastMessage && (
                              <div className="bg-muted/20 rounded-lg p-3 border-l-4 border-l-primary/20">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={conversation.lastMessage.author_type === 'patient' ? 'secondary' : 'default'}
                                      className="text-xs"
                                    >
                                      {conversation.lastMessage.author_type === 'patient' ? '👤 Paciente' : 
                                       conversation.lastMessage.author_type === 'doctor' ? '👨‍⚕️ Médico' :
                                       conversation.lastMessage.author_type === 'clinic' ? '🏥 Clínica' : '👥 Staff'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(conversation.lastMessage.created_at).toLocaleString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">
                                  {conversation.lastMessage.content || '[Anexo]'}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          {/* Botão de ação */}
                          <div className="flex items-center gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(conversation.patient)
                                setIsMessageDialogOpen(true)
                              }}
                              className="hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Ver Conversa
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedPatient(conversation.patient)
                                setIsPatientDetailsOpen(true)
                              }}
                            >
                              <User className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-12">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="h-8 w-8 opacity-50" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Nenhuma conversa encontrada</h3>
                      <p className="text-sm">Inicie conversas enviando mensagens para os pacientes</p>
                    </div>
                  )
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Exames por Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(() => {
                  // Agrupar exames por paciente
                  const patientExams = patients.map(patient => {
                    const patientExamsList = exams.filter(e => e.patientId === patient.id)
                    const uploadedExams = patientExamsList.filter(e => e.type === 'uploaded')
                    const requestedExams = patientExamsList.filter(e => e.type === 'requested')
                    
                    return {
                      patient,
                      uploadedExams,
                      requestedExams,
                      totalExams: patientExamsList.length
                    }
                  }).filter(p => p.totalExams > 0) // Só mostrar pacientes com exames
                    .sort((a, b) => b.totalExams - a.totalExams) // Ordenar por quantidade de exames

                  return patientExams.map((patientExam) => (
                    <div key={patientExam.patient.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{patientExam.patient.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {patientExam.totalExams} exame{patientExam.totalExams > 1 ? 'ns' : ''} no total
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {patientExam.uploadedExams.length} anexado{patientExam.uploadedExams.length > 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="secondary">
                            {patientExam.requestedExams.length} solicitado{patientExam.requestedExams.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Todos os Exames do Paciente */}
                        {patientExam.uploadedExams.concat(patientExam.requestedExams)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((exam) => (
                          <div key={exam.id} className="border rounded-lg p-4 bg-muted/20">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-base">{exam.name}</h4>
                                  <Badge className={`text-xs ${getStatusColor(exam.status)}`}>
                                    {getStatusText(exam.status)}
                                  </Badge>
                                  <Badge className={`text-xs ${getPriorityColor(exam.priority)}`}>
                                    {exam.priority === 'urgent' ? 'Urgente' : 
                                     exam.priority === 'high' ? 'Alta' : 
                                     exam.priority === 'medium' ? 'Média' : 'Baixa'}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-1">
                                    <p><span className="font-medium">Solicitado por:</span> {exam.requestedBy}</p>
                                    <p><span className="font-medium">Data da solicitação:</span> {new Date(exam.date).toLocaleDateString('pt-BR')}</p>
                                    <p><span className="font-medium">Laboratório:</span> {exam.labName}</p>
                                    <p><span className="font-medium">Convênio:</span> {exam.insurance}</p>
                                    {exam.scheduledDate && (
                                      <p><span className="font-medium">Data agendada:</span> {new Date(exam.scheduledDate).toLocaleDateString('pt-BR')}</p>
                                    )}
                                    {exam.cost && (
                                      <p><span className="font-medium">Valor:</span> R$ {exam.cost.toFixed(2)}</p>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-1">
                                    {exam.observations && (
                                      <div>
                                        <p className="font-medium">Observações médicas:</p>
                                        <p className="text-muted-foreground text-xs bg-white p-2 rounded border">
                                          {exam.observations}
                                        </p>
                                      </div>
                                    )}
                                    {exam.notes && (
                                      <div>
                                        <p className="font-medium">Instruções:</p>
                                        <p className="text-muted-foreground text-xs bg-white p-2 rounded border">
                                          {exam.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Resultados (se disponível) */}
                                {exam.resultSummary && (
                                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FileText className="h-4 w-4 text-green-600" />
                                      <span className="font-medium text-green-800">Resultado</span>
                                      {exam.resultDate && (
                                        <span className="text-xs text-green-600">
                                          {new Date(exam.resultDate).toLocaleDateString('pt-BR')}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-green-700">{exam.resultSummary}</p>
                                  </div>
                                )}

                                {/* Ações */}
                                <div className="flex items-center gap-2 mt-3">
                                  {exam.file && (
                                    <Button variant="outline" size="sm">
                                      <Download className="h-3 w-3 mr-1" />
                                      Baixar Resultado
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Enviar Lembrete
                                  </Button>
                                  {exam.status === 'requested' && (
                                    <Button variant="outline" size="sm">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Reagendar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para enviar mensagem */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversa com {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="mb-2">
              <div className="font-semibold text-lg">{selectedPatient?.name}</div>
              <div className="text-sm text-muted-foreground">{selectedPatient?.email} | {selectedPatient?.phone}</div>
              <div className="text-xs mt-1">
                <Badge variant={selectedPatient?.status === 'active' ? 'default' : 'secondary'}>
                  {selectedPatient?.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
            {selectedPatient && anexosMedicos && (
              <UITabs defaultValue="mensagens" className="space-y-2">
                <UITabsList>
                  <UITabsTrigger value="mensagens">Mensagens</UITabsTrigger>
                  <UITabsTrigger value="exames">Exames</UITabsTrigger>
                  <UITabsTrigger value="arquivos">Arquivos</UITabsTrigger>
                </UITabsList>
                <UITabsContent value="mensagens">
                    <div
                      ref={mensagensContainerRef}
                      className="max-h-80 overflow-y-auto space-y-3 p-4 bg-muted/20 rounded-lg"
                      style={{ position: 'relative' }}
                    >
                      {selectedPatient && mensagens.filter(m => m.patient_id === selectedPatient.id)
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                        .map((message) => {
                          // Usar o nome do autor que já vem do profile (com Dr./Dra. incluído)
                          const remetente = message.author_id === profile?.id ? 'Você' : (message.author_nome || 'Usuário');
                          return (
                            <div key={message.id} className={`flex ${message.author_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs p-3 rounded-lg text-sm shadow-sm ${
                                message.author_id === profile?.id
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-white text-gray-900 border'
                              }`}>
                                <div className="mb-1">
                                  <span className="text-xs opacity-70">{remetente}</span>
                                </div>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                {message.media_url && message.media_type && (
                                  anexosMedicos.arquivos.some(
                                    a => a.url_storage === message.media_url || a.url_storage.endsWith(message.media_url)
                                  ) ? (
                                    <ChatMediaPreview 
                                      path={message.media_url} 
                                      nome={message.content.split(': ')[1]?.split('.')[0] || 'anexo'} 
                                      tipo={message.media_type} 
                                      onPreview={arquivo => handlePreviewArquivo({
                                        nome_arquivo: arquivo.nome_arquivo || message.content.split(': ')[1]?.split('.')[0] || 'anexo',
                                        tipo_arquivo: arquivo.tipo_arquivo || message.media_type,
                                        url_storage: arquivo.url_storage || message.media_url,
                                      })}
                                    />
                                  ) : (
                                    <div className="text-xs text-red-500 mt-2">Anexo removido</div>
                                  )
                                )}
                                <div className="mt-2 text-xs opacity-70">
                                  {new Date(message.created_at).toLocaleString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {selectedPatient && mensagens.filter(m => m.patient_id === selectedPatient.id).length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma mensagem ainda</p>
                          <p className="text-sm">Inicie uma conversa enviando uma mensagem</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Textarea 
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </UITabsContent>
                  <UITabsContent value="exames">
                    <div className="max-h-80 overflow-y-auto space-y-3 p-4 bg-muted/20 rounded-lg">
                      {selectedPatient && exams.filter(e => e.patientId === selectedPatient.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((exam) => (
                          <div key={exam.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                            <div className="flex-1">
                              <p className="font-medium">{exam.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(exam.date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <Badge variant={exam.status === 'completed' ? 'default' : 'secondary'}>
                              {getStatusText(exam.status)}
                            </Badge>
                          </div>
                        ))}
                      {selectedPatient && exams.filter(e => e.patientId === selectedPatient.id).length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum exame solicitado</p>
                        </div>
                      )}
                    </div>
                  </UITabsContent>
                  <UITabsContent value="arquivos">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,application/pdf"
                          style={{ display: 'none' }}
                          id="upload-arquivo-input"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) anexosMedicos.uploadArquivo(file);
                          }}
                        />
                        <Button variant="outline" onClick={() => document.getElementById('upload-arquivo-input')?.click()} disabled={anexosMedicos.uploading}>
                          {anexosMedicos.uploading ? 'Enviando...' : 'Fazer Upload'}
                        </Button>
                        {anexosMedicos.error && <span className="text-sm text-red-500">{anexosMedicos.error}</span>}
                      </div>
                      <div className="space-y-2">
                        {anexosMedicos.arquivos.length === 0 && <span className="text-sm text-muted-foreground">Nenhum arquivo enviado</span>}
                        {anexosMedicos.arquivos.map(arquivo => (
                          <div key={arquivo.id} className="flex items-center gap-3 border rounded p-2 bg-muted/20">
                            {getFileIcon(arquivo.nome_arquivo)}
                            <span
                              className="flex-1 truncate hover:underline cursor-pointer text-blue-700"
                              onClick={() => handlePreviewArquivo(arquivo)}
                              title="Visualizar arquivo"
                            >
                              {arquivo.nome_arquivo}
                            </span>
                            <span className="text-xs text-muted-foreground">{(arquivo.tamanho_bytes/1024/1024).toFixed(2)} MB</span>
                            <Button size="sm" variant="outline" onClick={() => anexosMedicos.excluirArquivo(arquivo)}>Excluir</Button>
                            <Button size="sm" variant="ghost" title="Enviar na conversa" onClick={async () => {
                              // Salvar apenas o path relativo do arquivo no media_url
                              let path = arquivo.url_storage;
                              // Se for URL completo, extrai o path relativo
                              if (path.startsWith('http')) {
                                const idx = path.indexOf('/anexos-medicos/');
                                if (idx !== -1) {
                                  path = path.substring(idx + '/anexos-medicos/'.length);
                                }
                              }
                              await sendMensagem({
                                patient_id: selectedPatient.id,
                                clinica_id: null,
                                author_id: profile.id,
                                author_type: profile.tipo === 'medico' ? 'doctor'
                                  : profile.tipo === 'paciente' ? 'patient'
                                  : profile.tipo === 'clinica' ? 'clinic'
                                  : profile.tipo === 'staff' ? 'staff'
                                  : 'clinic',
                                content: `Anexamos um arquivo:\n${arquivo.nome_arquivo}.\nVocê pode visualizar aqui na conversa ou na aba Arquivos.`,
                                media_url: path, // path relativo do storage
                                media_type: arquivo.tipo_arquivo,
                              });
                            }}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </UITabsContent>
                </UITabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para solicitar exame */}
      <Dialog open={isRequestExamDialogOpen} onOpenChange={setIsRequestExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Exame para {selectedPatient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Exame</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o exame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hemograma">Hemograma Completo</SelectItem>
                  <SelectItem value="glicemia">Glicemia em Jejum</SelectItem>
                  <SelectItem value="colesterol">Perfil Lipídico</SelectItem>
                  <SelectItem value="raio-x">Raio-X Tórax</SelectItem>
                  <SelectItem value="ecg">Eletrocardiograma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Observações sobre o exame..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRequestExamDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsRequestExamDialogOpen(false)}>
                Solicitar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para detalhes do paciente */}
      <Dialog open={isPatientDetailsOpen} onOpenChange={setIsPatientDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalhes do Paciente: {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Informações básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                    <p className="font-medium">{selectedPatient?.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedPatient?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{selectedPatient?.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={selectedPatient?.status === 'active' ? 'default' : 'secondary'}>
                      {selectedPatient?.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{mensagens.filter(m => m.patient_id === selectedPatient?.id).length}</div>
                    <div className="text-sm text-muted-foreground">Mensagens</div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{mensagens.filter(m => m.patient_id === selectedPatient?.id && !m.read && m.author_type === 'patient').length}</div>
                    <div className="text-sm text-muted-foreground">Não Lidas</div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{anexosMedicos?.arquivos?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Arquivos</div>
                  </div>
                  <div className="text-center p-4 bg-muted/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{exams.filter(e => e.patientId === selectedPatient?.id).length}</div>
                    <div className="text-sm text-muted-foreground">Exames</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Últimas mensagens */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Últimas Mensagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mensagens
                    .filter(m => m.patient_id === selectedPatient?.id)
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((message) => (
                      <div key={message.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {message.author_type === 'patient' ? '👤' : message.author_type === 'doctor' ? '👨‍⚕️' : '🏥'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.author_nome || 'Usuário'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {message.author_type === 'patient' ? 'Paciente' : 
                               message.author_type === 'doctor' ? 'Médico' : 'Clínica'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.created_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {message.content || '[Anexo]'}
                          </p>
                        </div>
                      </div>
                    ))}
                  {mensagens.filter(m => m.patient_id === selectedPatient?.id).length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma mensagem ainda</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ações rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => {
                      setIsPatientDetailsOpen(false)
                      setIsMessageDialogOpen(true)
                    }}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar Mensagem
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsPatientDetailsOpen(false)
                      setIsRequestExamDialogOpen(true)
                    }}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Solicitar Exame
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setIsPatientDetailsOpen(false)
                      navigate(`/prontuario/paciente/${selectedPatient?.id}`)
                    }}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Ver Prontuário
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de preview de arquivo */}
      {previewArquivo && (
        <Dialog open={!!previewArquivo} onOpenChange={() => { setPreviewArquivo(null); setPreviewUrl(null); setErrorPreview(null); }}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Preview: {previewArquivo.nome_arquivo}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {loadingPreview && <div>Carregando preview...</div>}
              {errorPreview && <div className="text-red-500">{errorPreview || 'Anexo não disponível ou removido'}</div>}
              {previewUrl && (
                <div className="flex flex-col items-center">
                  {previewArquivo.tipo_arquivo.startsWith('image/') ? (
                    <div className="flex flex-col items-center w-full">
                      <div className="flex gap-2 mb-2">
                        <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(0.2, z - 0.2))}>-</Button>
                        <span className="text-xs">Zoom: {(zoom * 100).toFixed(0)}%</span>
                        <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(5, z + 0.2))}>+</Button>
                        <Button size="sm" variant="outline" onClick={() => setZoom(1)}>Resetar</Button>
                      </div>
                      <div
                        style={{
                          overflow: 'auto',
                          border: '1px solid #eee',
                          maxHeight: '70vh',
                          maxWidth: '100%',
                          width: '100%',
                          position: 'relative',
                          background: '#fafbfc',
                        }}
                      >
                        <img
                          src={previewUrl}
                          alt={previewArquivo.nome_arquivo}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '70vh',
                            width: 'auto',
                            height: 'auto',
                            display: 'block',
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left',
                            transition: 'transform 0.2s',
                          }}
                          className="rounded shadow select-none pointer-events-none"
                          draggable={false}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">Use os botões de zoom e o scroll para ver detalhes</span>
                    </div>
                  ) : previewArquivo.tipo_arquivo === 'application/pdf' ? (
                    <div className="flex flex-col items-center w-full">
                      <iframe src={previewUrl} title="PDF Preview" className="w-full h-[70vh] border rounded" />
                      <Button
                        className="mt-4"
                        onClick={() => window.open(previewUrl, '_blank')}
                      >
                        Abrir PDF em nova aba
                      </Button>
                    </div>
                  ) : (
                    <div>Preview não suportado para este tipo de arquivo.</div>
                  )}
                  <Button
                    className="mt-4"
                    onClick={handleDownload}
                  >
                    Baixar
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 

function ChatMediaPreview({ path, nome, tipo, onPreview }: { path: string, nome: string, tipo: string, onPreview: (file: any) => void }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;
    setSignedUrl(null);
    setError(null);
    supabase.storage.from('anexos-medicos').createSignedUrl(path, 60)
      .then(({ data, error }) => {
        if (error || !data?.signedUrl) {
          setError('Anexo não disponível ou removido');
        } else {
          setSignedUrl(data.signedUrl);
        }
      });
  }, [path]);

  if (error) return <div className="text-xs text-red-500 mt-2">{error}</div>;
  if (!signedUrl) return <div className="text-xs text-muted-foreground mt-2">Carregando anexo...</div>;
  if (tipo.startsWith('image/')) {
    return (
      <img
        src={signedUrl}
        alt={nome}
        className="mt-2 max-w-[120px] max-h-[120px] rounded cursor-pointer border"
        onClick={() => onPreview({
          nome_arquivo: nome,
          tipo_arquivo: tipo,
          url_storage: path,
        })}
      />
    );
  }
  if (tipo === 'application/pdf') {
    return (
      <div
        className="mt-2 flex items-center gap-2 cursor-pointer text-blue-700 hover:underline"
        onClick={() => onPreview({
          nome_arquivo: nome,
          tipo_arquivo: tipo,
          url_storage: path,
        })}
      >
        <FileText className="h-5 w-5" />
        <span>Visualizar PDF</span>
      </div>
    );
  }
  return null;
} 