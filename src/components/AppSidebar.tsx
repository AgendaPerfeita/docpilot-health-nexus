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
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

  return (
    <Sidebar className={open ? "w-64" : "w-16"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.principal.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Clínico</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.clinico.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Médico Individual</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.medico.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Clínica</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.clinica.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Hospital</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.hospital.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.financeiro.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Relatórios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.relatorios.map((item) => (
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

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {groupedItems.sistema.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  )
}