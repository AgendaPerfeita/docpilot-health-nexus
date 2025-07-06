
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

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Paciente
import AreaPaciente from "./pages/paciente/AreaPaciente";

// Clínica
import Agenda from "./pages/clinica/Agenda";
import CRM from "./pages/clinica/CRM";

// Prontuário - NOVA ESTRUTURA
import ProntuarioList from "./pages/prontuario/index";
import PacienteProntuario from "./pages/prontuario/PacienteProntuario";
import NovaEvolucaoProntuario from "./pages/prontuario/NovaEvolucao";

// CRM Global
import CRMGlobal from "./pages/CRM";

// Index
import Index from "./pages/Index";

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
                  
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Área do Paciente */}
                  <Route path="/paciente" element={<AreaPaciente />} />
                  <Route path="/paciente/*" element={<AreaPaciente />} />
                  
                  {/* Área da Clínica */}
                  <Route path="/clinica/agenda" element={<Agenda />} />
                  <Route path="/clinica/crm" element={<CRM />} />
                  
                  {/* Sistema de Prontuários - NOVA ESTRUTURA */}
                  <Route path="/prontuario" element={<ProntuarioList />} />
                  <Route path="/prontuario/paciente/:id" element={<PacienteProntuario />} />
                  <Route path="/prontuario/paciente/:id/nova" element={<NovaEvolucaoProntuario />} />
                  
                  {/* CRM Global */}
                  <Route path="/crm" element={<CRMGlobal />} />

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
