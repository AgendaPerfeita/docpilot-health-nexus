import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { LogOut, User, Bell, Shield, ShieldCheck } from "lucide-react"
import { useNavigate, Outlet } from "react-router-dom"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { useDigitalSignature } from "@/hooks/useDigitalSignature"
import { Badge } from "@/components/ui/badge"

interface LayoutProps {
  children?: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate("/")
  }
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between border-b px-6 bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold text-primary">SmartDoc</h1>
            </div>
            <div className="flex items-center gap-4">
              {profile && (
                <>
                  <CertificateStatus />
                  <div className="text-right">
                    <p className="text-sm font-medium">{profile.nome}</p>
                    <p className="text-xs text-muted-foreground capitalize">{profile.tipo}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                    {profile.nome.charAt(0).toUpperCase()}
                  </div>
                  {/* Sino de notificação com badge */}
                  <NotificationBell />
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 p-6 bg-muted/20">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

// Substituir NotificationBell por uma versão conectada ao Supabase
function NotificationBell() {
  const { profile } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Agrupa notificações por tipo
  function groupByTipo(notificacoes: any[]) {
    return notificacoes.reduce((acc, n) => {
      acc[n.tipo] = acc[n.tipo] || [];
      acc[n.tipo].push(n);
      return acc;
    }, {} as Record<string, any[]>);
  }

  // Ícone por tipo
  function tipoIcon(tipo: string) {
    switch (tipo) {
      case 'chat': return <Bell className="h-4 w-4 text-blue-500" />;
      case 'agendamento': return <Bell className="h-4 w-4 text-green-500" />;
      case 'sistema': return <Bell className="h-4 w-4 text-yellow-500" />;
      default: return <Bell className="h-4 w-4 text-gray-400" />;
    }
  }

  // Busca inicial e realtime
  useEffect(() => {
    if (!profile?.user_id) return;
    let ignore = false;
    async function fetchUnread() {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', profile.user_id)
        .eq('lida', false)
        .eq('deleted', false)
        .order('criada_em', { ascending: false });
      if (!ignore && data) {
        setUnreadCount(data.length);
        setNotificacoes(data);
      }
    }
    fetchUnread();
    // Realtime: escuta novas notificações e atualiza contador
    const channel = supabase.channel('notificacoes_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notificacoes' }, (payload) => {
        fetchUnread();
      })
      .subscribe();
    return () => { ignore = true; channel.unsubscribe(); };
  }, [profile?.user_id]);

  async function marcarComoLida(id: string) {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id);
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function handleClickNotificacao(n: any) {
    await marcarComoLida(n.id);
    setOpen(false);
    if (n.tipo === 'chat' && n.contexto?.patient_id) {
      navigate(`/acompanhamento-pacientes?chat=${n.contexto.patient_id}`);
    }
    // outros tipos de notificação podem ser tratados aqui
  }

  // Detalhes extras por tipo
  function renderDetalhes(n: any) {
    if (n.tipo === 'chat' && n.contexto?.patient_id) {
      return <span className="text-xs text-muted-foreground">Paciente: {n.contexto.patient_nome || n.contexto.patient_id}</span>;
    }
    if (n.tipo === 'agendamento' && n.contexto?.consulta_id) {
      return <span className="text-xs text-muted-foreground">Consulta: {n.contexto.consulta_id}</span>;
    }
    return null;
  }

  // Agrupamento visual
  const grupos: Record<string, any[]> = groupByTipo(notificacoes);
  const tipoLabels: Record<string, string> = {
    chat: 'Chat',
    agendamento: 'Agendamento',
    sistema: 'Sistema',
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2 relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 min-w-[18px] flex items-center justify-center border border-white shadow">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 max-h-96 overflow-y-auto p-0">
        <div className="p-3 border-b font-semibold">Notificações</div>
        {notificacoes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">Nenhuma notificação não lida.</div>
        ) : (
          <div>
            {(Object.entries(grupos) as [string, any[]][]).map(([tipo, lista]) => (
              <div key={tipo} className="pb-2">
                <div className="px-4 pt-3 pb-1 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  {tipoIcon(tipo)}
                  {tipoLabels[tipo] || tipo}
                </div>
                <ul>
                  {lista.map((n) => (
                    <li key={n.id} className="group hover:bg-muted/50 cursor-pointer px-4 py-3 border-b last:border-b-0 flex items-start gap-2">
                      <div className="pt-1">{tipoIcon(n.tipo)}</div>
                      <div className="flex-1" onClick={() => handleClickNotificacao(n)}>
                        <div className="font-medium text-sm mb-1">{n.titulo || n.tipo}</div>
                        <div className="text-xs text-muted-foreground mb-1">{n.mensagem}</div>
                        {renderDetalhes(n)}
                        <div className="text-xs text-right text-muted-foreground mt-1">{format(new Date(n.criada_em), 'dd/MM/yyyy HH:mm')}</div>
                      </div>
                      <button
                        className="ml-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition"
                        title="Marcar como lida"
                        onClick={e => { e.stopPropagation(); marcarComoLida(n.id); }}
                      >
                        ✓
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Componente para mostrar status do certificado digital
function CertificateStatus() {
  const { hasActiveCertificate, activeCertificate } = useDigitalSignature()
  const navigate = useNavigate()
  
  if (!hasActiveCertificate() || !activeCertificate) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate('/configuracoes')}
        className="text-muted-foreground hover:text-foreground"
      >
        <Shield className="h-4 w-4 mr-2" />
        <span className="text-xs">Sem Certificado</span>
      </Button>
    )
  }
  
  const isExpiringSoon = activeCertificate.validUntil && 
    new Date(activeCertificate.validUntil) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
          <ShieldCheck className="h-4 w-4 mr-2" />
          <span className="text-xs">Certificado Ativo</span>
          {isExpiringSoon && (
            <Badge variant="destructive" className="ml-2 text-xs px-1">
              Expirando
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-3">
          <h4 className="font-semibold">Certificado Digital</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tipo:</span>
              <span className="text-sm font-medium">{activeCertificate.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Nome:</span>
              <span className="text-sm font-medium">{activeCertificate.name || 'Certificado Digital'}</span>
            </div>
            {activeCertificate.validUntil && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Válido até:</span>
                <span className={`text-sm font-medium ${isExpiringSoon ? 'text-red-600' : 'text-green-600'}`}>
                  {format(new Date(activeCertificate.validUntil), 'dd/MM/yyyy')}
                </span>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/configuracoes')}
            className="w-full"
          >
            Gerenciar Certificados
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}