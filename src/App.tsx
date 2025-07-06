import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ActiveClinicaProvider } from "./hooks/useActiveClinica";
import Layout from "./components/Layout";

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

// Shared components
import { PermissionGuard } from "./components/PermissionGuard";

const queryClient = new QueryClient();

function App() {
  return (
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

                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ActiveClinicaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;