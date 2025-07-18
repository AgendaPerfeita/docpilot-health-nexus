import { NavLink, useLocation } from "react-router-dom"
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  UserCheck,
  Settings,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Home,
  Stethoscope,
  Pill,
  UserPlus,
  Send,
  Building2,
  Activity,
  Clock,
  History,
  MapPin
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useMedicoPermissions } from "@/hooks/useMedicoPermissions"
import { ClinicaSelector } from "@/components/ui/clinica-selector"

  const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    group: "principal"
  },
  {
    title: "CRM",
    url: "/crm",
    icon: Users,
    group: "clinico"
  },
  {
    title: "Prontuário",
    url: "/prontuario",
    icon: FileText,
    group: "clinico"
  },
  {
    title: "Agenda",
    url: "/agenda",
    icon: Calendar,
    group: "clinico"
  },
  {
    title: "Área do Paciente",
            url: "/paciente",
    icon: Stethoscope,
    group: "clinico"
  },
  {
    title: "Prescrição Digital",
    url: "/prescricao-digital",
    icon: Pill,
    group: "medico"
  },
  {
    title: "Gestão de Médicos",
    url: "/clinica/gestao-medicos",
    icon: UserPlus,
    group: "clinica"
  },
  {
    title: "WhatsApp API",
    url: "/clinica/whatsapp-api",
    icon: Send,
    group: "clinica"
  },
  {
    title: "BI Avançado",
    url: "/relatorios/bi-avancado",
    icon: BarChart3,
    group: "clinica"
  },
  {
    title: "Gestão Hospitalar",
    url: "/hospital",
    icon: Building2,
    group: "hospital"
  },
  {
    title: "Fluxo de Caixa",
    url: "/financeiro",
    icon: DollarSign,
    group: "financeiro"
  },
  {
    title: "DRE",
    url: "/financeiro/dre",
    icon: TrendingUp,
    group: "financeiro"
  },
  {
    title: "Comissões",
    url: "/financeiro/comissoes",
    icon: CreditCard,
    group: "financeiro"
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
    group: "relatorios"
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    group: "sistema"
  },
  {
    title: "Acompanhamento Pacientes",
    url: "/acompanhamento-pacientes",
    icon: MessageSquare,
    group: "clinico"
  },
  {
    title: "Plantão Ativo",
    url: "/plantonista/atendimento",
    icon: Clock,
    group: "plantonista"
  },
  {
    title: "Gestão de Plantões",
    url: "/plantonista/financeiro",
    icon: DollarSign,
    group: "plantonista"
  },
  {
    title: "Histórico de Plantões",
    url: "/plantonista/historico",
    icon: History,
    group: "plantonista"
  },
  {
    title: "Locais de Trabalho (Plantão)",
    url: "/plantonista/locais",
    icon: MapPin,
    group: "plantonista"
  },
  {
    title: "Agenda",
    url: "/plantonista/agenda",
    icon: Calendar,
    group: "plantonista"
  }
]

const groupedItems = {
  principal: menuItems.filter(item => item.group === "principal"),
  clinico: menuItems.filter(item => item.group === "clinico"),
  medico: menuItems.filter(item => item.group === "medico"),
  clinica: menuItems.filter(item => item.group === "clinica"),
  hospital: menuItems.filter(item => item.group === "hospital"),
  financeiro: menuItems.filter(item => item.group === "financeiro"),
  relatorios: menuItems.filter(item => item.group === "relatorios"),
  sistema: menuItems.filter(item => item.group === "sistema"),
  plantonista: menuItems.filter(item => item.group === "plantonista")
}

export function AppSidebar() {
  const { open } = useSidebar()
  const { profile } = useAuth()
  const { permissions, temPermissao } = useMedicoPermissions()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  // Filter menu items based on user type
  const getVisibleGroups = () => {
    if (!profile) return {}

    const userType = profile.tipo

    const visibleGroups: { [key: string]: any[] } = {
      principal: groupedItems.principal
    }

    switch (userType) {
      case 'medico':
        // Funcionalidades básicas sempre disponíveis
        visibleGroups.clinico = groupedItems.clinico.filter(item => {
          // Médicos free só veem funcionalidades básicas
          const basicItems = ['CRM', 'Prontuário', 'Agenda', 'Acompanhamento Pacientes'];
          return basicItems.includes(item.title);
        });
        
        // Prescrição digital sempre disponível
        visibleGroups.medico = groupedItems.medico;
        
        // Relatórios apenas para premium
        if (temPermissao('permiteRelatoriosAvancados')) {
          visibleGroups.relatorios = groupedItems.relatorios.filter(item => 
            item.title === "Relatórios"
          );
        }
        
        visibleGroups.sistema = groupedItems.sistema;
        break

      case 'plantonista':
        visibleGroups.plantonista = groupedItems.plantonista;
        visibleGroups.sistema = groupedItems.sistema;
        break;

      case 'paciente':
        visibleGroups.paciente = [
          { title: "Área do Paciente", url: "/paciente", icon: Stethoscope, group: "paciente" },
          { title: "Meus Agendamentos", url: "/agenda", icon: Calendar, group: "paciente" }
        ]
        visibleGroups.sistema = groupedItems.sistema
        break

      case 'clinica':
        visibleGroups.clinico = groupedItems.clinico;
        visibleGroups.medico = groupedItems.medico;
        visibleGroups.clinica = groupedItems.clinica;
        visibleGroups.financeiro = groupedItems.financeiro;
        visibleGroups.relatorios = groupedItems.relatorios;
        visibleGroups.sistema = groupedItems.sistema;
        break

      case 'hospital':
        visibleGroups.clinico = groupedItems.clinico;
        visibleGroups.medico = groupedItems.medico;
        visibleGroups.clinica = groupedItems.clinica;
        visibleGroups.hospital = groupedItems.hospital;
        visibleGroups.financeiro = groupedItems.financeiro;
        visibleGroups.relatorios = groupedItems.relatorios;
        visibleGroups.sistema = groupedItems.sistema;
        break

      case 'staff':
        visibleGroups.principal = groupedItems.principal;
        visibleGroups.clinico = groupedItems.clinico.filter(item => ['CRM', 'Agenda', 'Acompanhamento Pacientes'].includes(item.title));
        visibleGroups.clinica = groupedItems.clinica.filter(item => item.title === 'Gestão de Médicos');
        visibleGroups.financeiro = groupedItems.financeiro.filter(item => ['Fluxo de Caixa', 'Comissões'].includes(item.title));
        // Não exibe relatorios, sistema, hospital, etc
        break;

      default:
        return {}
    }

    return visibleGroups
  }

  const visibleGroups = getVisibleGroups()

  const groupLabels = {
    principal: "Principal",
    clinico: "Clínico", 
    medico: "Médico Individual",
    clinica: "Clínica",
    hospital: "Hospital",
    financeiro: "Financeiro",
    relatorios: "Relatórios",
    sistema: "Sistema",
    paciente: "Paciente",
    plantonista: "Plantonista"
  }

  return (
    <Sidebar className={open ? "w-64" : "w-16"}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          {open && <span className="font-bold text-lg">SmartDoc</span>}
        </div>
        {open && <ClinicaSelector />}
      </div>
      <SidebarContent>
        {Object.entries(visibleGroups).map(([groupKey, items]) => {
          if (!items || items.length === 0) return null
          
          return (
            <SidebarGroup key={groupKey}>
              <SidebarGroupLabel>{groupLabels[groupKey as keyof typeof groupLabels]}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={({ isActive }) => 
                            isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          }
                        >
                          <item.icon className="h-4 w-4" />
                          {open && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
    </Sidebar>
  )
}