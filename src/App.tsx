import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ActiveClinicaProvider } from "./hooks/useActiveClinica";
import Layout from "./components/Layout";

// Lazy load components for better performance
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Landing = lazy(() => import("./pages/auth/Landing"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ProntuarioList = lazy(() => import("./pages/prontuario/index"));
const PacienteProntuario = lazy(() => import("./pages/prontuario/PacienteProntuario"));
const NovaEvolucaoProntuario = lazy(() => import("./pages/prontuario/NovaEvolucao"));
const VisualizarProntuario = lazy(() => import("./pages/prontuario/VisualizarProntuario"));
const EditarProntuario = lazy(() => import("./pages/prontuario/EditarProntuario"));
const AreaPaciente = lazy(() => import("./pages/paciente/AreaPaciente"));
const AgendaMedico = lazy(() => import("./pages/clinica/Agenda"));
const CRMMedico = lazy(() => import("./pages/clinica/CRM"));
const CRMGlobal = lazy(() => import("./pages/CRM"));
const PrescricaoDigital = lazy(() => import("./pages/PrescricaoDigital"));
const GestaoMedicos = lazy(() => import("./pages/clinica/GestaoMedicos"));
const WhatsAppAPI = lazy(() => import("./pages/WhatsAppAPI"));
const GestaoHospitalar = lazy(() => import("./pages/GestaoHospitalar"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const DRE = lazy(() => import("./pages/DRE"));
const Comissoes = lazy(() => import("./pages/Comissoes"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const BIAvancado = lazy(() => import("./pages/BIAvancado"));
const AcompanhamentoPacientes = lazy(() => import("./pages/AcompanhamentoPacientes"));
const BackupGestao = lazy(() => import("./pages/BackupGestao"));
const ValidarAssinatura = lazy(() => import("./pages/ValidarAssinatura"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const PlantonistaIndex = lazy(() => import("./pages/plantonista/index"));
const AtendimentoAtivo = lazy(() => import("./pages/plantonista/AtendimentoAtivo"));
const GestaoFinanceira = lazy(() => import("./pages/plantonista/GestaoFinanceira"));
const Historico = lazy(() => import("./pages/plantonista/Historico"));
const LocaisTrabalho = lazy(() => import("./pages/plantonista/LocaisTrabalho"));
const AgendaPlantonista = lazy(() => import("./pages/plantonista/Agenda"));


// Import shared components normally (they are critical for app structure)
import Index from "./pages/Index";
import { PermissionGuard } from "./components/PermissionGuard";
import { PlantonistaProvider } from './hooks/usePlantonista';

// Optimize QueryClient configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ActiveClinicaProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-blue-600" />
                  </div>
                }>
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
                    <Route path="/plantonista/atendimento" element={
                      <PlantonistaProvider>
                        <AtendimentoAtivo />
                      </PlantonistaProvider>
                    } />
                    <Route path="/plantonista/financeiro" element={
                      <PlantonistaProvider>
                        <GestaoFinanceira />
                      </PlantonistaProvider>
                    } />
                    <Route path="/plantonista/historico" element={
                      <PlantonistaProvider>
                        <Historico />
                      </PlantonistaProvider>
                    } />
                    <Route path="/plantonista/locais" element={
                      <PlantonistaProvider>
                        <LocaisTrabalho />
                      </PlantonistaProvider>
                    } />
                    <Route path="/plantonista/agenda" element={
                      <PlantonistaProvider>
                        <AgendaPlantonista />
                      </PlantonistaProvider>
                    } />

                    {/* Rotas de teste para debug */}
                    <Route path="/teste-clinica" element={<div>Teste Clínica</div>} />
                    <Route path="/teste-hospital" element={<div>Teste Hospital</div>} />
                    <Route path="/teste-financeiro" element={<div>Teste Financeiro</div>} />

                    {/* Backup - acessível por todos */}
                    <Route path="/backup" element={<BackupGestao />} />

                    {/* Validação de Assinatura Digital - público */}
                    <Route path="/validar-assinatura" element={<ValidarAssinatura />} />

                    {/* Configurações - acessível por todos */}
                    <Route path="/configuracoes" element={<Configuracoes />} />

                  </Route>
                </Routes>
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </ActiveClinicaProvider>
        </AuthProvider>
      </QueryClientProvider>
  );
}

export default App;