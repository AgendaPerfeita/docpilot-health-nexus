import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ActiveClinicaProvider } from "./hooks/useActiveClinica";
import Layout from "./components/Layout";
import { ThemeProvider } from 'next-themes';

// Auth
import Landing from "./pages/auth/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Dashboard Global
import Dashboard from "./pages/dashboard/Dashboard";

// SISTEMA GLOBAL DE PRONTUÁRIOS (acessível por todos os tipos de usuário)
import ProntuarioList from "./pages/prontuario/index";
import PacienteProntuario from "./pages/prontuario/PacienteProntuario";
import NovaEvolucaoProntuario from "./pages/prontuario/NovaEvolucao";
import VisualizarProntuario from "./pages/prontuario/VisualizarProntuario";
import EditarProntuario from "./pages/prontuario/EditarProntuario";

// ÁREAS ESPECÍFICAS POR TIPO DE USUÁRIO
// Área do Paciente
import AreaPaciente from "./pages/paciente/AreaPaciente";

// Área do Médico Individual
import AgendaMedico from "./pages/clinica/Agenda";
import CRMMedico from "./pages/clinica/CRM";

// Área da Clínica
// (reutiliza algumas páginas de médico + funcionalidades específicas)

// CRM Global (funcionalidade compartilhada)
import CRMGlobal from "./pages/CRM";

// Index
import Index from "./pages/Index";
import PrescricaoDigital from "./pages/PrescricaoDigital";

// Configurações
import Configuracoes from "./pages/Configuracoes";

// Clínica
import GestaoMedicos from "./pages/clinica/GestaoMedicos";
import WhatsAppAPI from "./pages/WhatsAppAPI";

// Hospital
import GestaoHospitalar from "./pages/GestaoHospitalar";

// Financeiro
import Financeiro from "./pages/Financeiro";
import DRE from "./pages/DRE";
import Comissoes from "./pages/Comissoes";

// Relatórios
import Relatorios from "./pages/Relatorios";
import BIAvancado from "./pages/BIAvancado";

// Acompanhamento
import AcompanhamentoPacientes from "./pages/AcompanhamentoPacientes";

// Plantonista
import PlantonistaIndex from "./pages/plantonista/index";
import GestaoFinanceira from "./pages/plantonista/GestaoFinanceira";
import LocaisTrabalho from "./pages/plantonista/LocaisTrabalho";

// Shared components
import { PermissionGuard } from "./components/PermissionGuard";
import { PlantonistaProvider } from './hooks/usePlantonista';

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ActiveClinicaProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/landing" element={<Landing />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route element={<PermissionGuard children={<Layout />} />}>
                    
                    {/* Dashboard Global */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* ===== SISTEMA GLOBAL DE PRONTUÁRIOS ===== */}
                    {/* Acessível por TODOS os tipos de usuário */}
                    <Route path="/prontuario" element={<ProntuarioList />} />
                    <Route path="/prontuario/paciente/:id" element={<PacienteProntuario />} />
                    <Route path="/prontuario/paciente/:id/nova" element={<NovaEvolucaoProntuario />} />
                    <Route path="/prontuario/paciente/:id/visualizar/:prontuarioId" element={<VisualizarProntuario />} />
                    <Route path="/prontuario/paciente/:id/editar/:prontuarioId" element={<EditarProntuario />} />
                    
                    {/* ===== ÁREAS ESPECÍFICAS POR TIPO DE USUÁRIO ===== */}
                    
                    {/* Área do Paciente */}
                    <Route path="/paciente" element={<AreaPaciente />} />
                    <Route path="/paciente/*" element={<AreaPaciente />} />
                    
                    {/* Área do Médico Individual */}
                    <Route path="/medico/agenda" element={<AgendaMedico />} />
                    <Route path="/medico/crm" element={<CRMMedico />} />
                    
                    {/* Área da Clínica (reutiliza componentes + específicos) */}
                    <Route path="/clinica/agenda" element={<AgendaMedico />} />
                    <Route path="/clinica/crm" element={<CRMMedico />} />
                    
                    {/* Agenda Global - acessível por todos */}
                    <Route path="/agenda" element={<AgendaMedico />} />
                    
                    {/* CRM Global - acessível por todos */}
                    <Route path="/crm" element={<CRMGlobal />} />
                    
                    {/* Prescrição Digital - acessível por médicos */}
                    <Route path="/prescricao-digital" element={<PrescricaoDigital />} />

                    {/* Clínica */}
                    <Route path="/clinica/gestao-medicos" element={<GestaoMedicos />} />
                    <Route path="/clinica/whatsapp-api" element={<WhatsAppAPI />} />

                    {/* Hospital */}
                    <Route path="/hospital" element={<GestaoHospitalar />} />
                    <Route path="/hospital/gestao" element={<GestaoHospitalar />} />

                    {/* Financeiro */}
                    <Route path="/financeiro" element={<Financeiro />} />
                    <Route path="/financeiro/dre" element={<DRE />} />
                    <Route path="/financeiro/comissoes" element={<Comissoes />} />

                    {/* Relatórios */}
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/relatorios/bi-avancado" element={<BIAvancado />} />

                    {/* Acompanhamento */}
                    <Route path="/acompanhamento-pacientes" element={<AcompanhamentoPacientes />} />

                     {/* Plantonista - ENVOLVER COM PROVIDER */}
                    <Route path="/plantonista" element={
                      <PlantonistaProvider>
                        <PlantonistaIndex />
                      </PlantonistaProvider>
                    } />
                    <Route path="/plantonista/atendimento" element={<div>Atendimento em desenvolvimento</div>} />
                    <Route path="/plantonista/financeiro" element={
                      <PlantonistaProvider>
                        <GestaoFinanceira />
                      </PlantonistaProvider>
                    } />
                    <Route path="/plantonista/historico" element={<div>Histórico em desenvolvimento</div>} />
                    <Route path="/plantonista/locais" element={
                      <PlantonistaProvider>
                        <LocaisTrabalho />
                      </PlantonistaProvider>
                    } />

                    {/* Rotas de teste para debug */}
                    <Route path="/teste-clinica" element={<div>Teste Clínica</div>} />
                    <Route path="/teste-hospital" element={<div>Teste Hospital</div>} />
                    <Route path="/teste-financeiro" element={<div>Teste Financeiro</div>} />

                    {/* Configurações - acessível por todos */}
                    <Route path="/configuracoes" element={<Configuracoes />} />

                  </Route>
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ActiveClinicaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;