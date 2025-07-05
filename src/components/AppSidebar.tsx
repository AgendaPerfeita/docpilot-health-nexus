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
  Activity
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

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    group: "principal"
  },
  {
    title: "Pacientes",
    url: "/pacientes",
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
    title: "CRM Clínico",
    url: "/crm",
    icon: UserCheck,
    group: "clinico"
  },
  {
    title: "Área do Paciente",
    url: "/area-paciente",
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
    url: "/gestao-medicos",
    icon: UserPlus,
    group: "clinica"
  },
  {
    title: "WhatsApp API",
    url: "/whatsapp-api",
    icon: Send,
    group: "clinica"
  },
  {
    title: "BI Avançado",
    url: "/bi-avancado",
    icon: BarChart3,
    group: "clinica"
  },
  {
    title: "Gestão Hospitalar",
    url: "/gestao-hospitalar",
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
    url: "/dre",
    icon: TrendingUp,
    group: "financeiro"
  },
  {
    title: "Comissões",
    url: "/comissoes",
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
  sistema: menuItems.filter(item => item.group === "sistema")
}

export function AppSidebar() {
  const { open } = useSidebar()
  const { profile } = useAuth()
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
        visibleGroups.clinico = groupedItems.clinico
        visibleGroups.medico = groupedItems.medico
        visibleGroups.relatorios = groupedItems.relatorios.filter(item => 
          item.title === "Relatórios"
        )
        visibleGroups.sistema = groupedItems.sistema
        break

      case 'paciente':
        visibleGroups.paciente = [
          { title: "Área do Paciente", url: "/area-paciente", icon: Stethoscope, group: "paciente" },
          { title: "Meus Agendamentos", url: "/agenda", icon: Calendar, group: "paciente" }
        ]
        visibleGroups.sistema = groupedItems.sistema
        break

      case 'clinica':
        visibleGroups.clinico = groupedItems.clinico
        visibleGroups.medico = groupedItems.medico
        visibleGroups.clinica = groupedItems.clinica
        visibleGroups.financeiro = groupedItems.financeiro
        visibleGroups.relatorios = groupedItems.relatorios
        visibleGroups.sistema = groupedItems.sistema
        break

      case 'hospital':
        visibleGroups.clinico = groupedItems.clinico
        visibleGroups.medico = groupedItems.medico
        visibleGroups.clinica = groupedItems.clinica
        visibleGroups.hospital = groupedItems.hospital
        visibleGroups.financeiro = groupedItems.financeiro
        visibleGroups.relatorios = groupedItems.relatorios
        visibleGroups.sistema = groupedItems.sistema
        break

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
    paciente: "Paciente"
  }

  return (
    <Sidebar className={open ? "w-64" : "w-16"}>
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