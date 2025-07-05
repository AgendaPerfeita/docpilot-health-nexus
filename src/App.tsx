import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ActiveClinicaProvider } from "./hooks/useActiveClinica";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import ProntuarioIndex from "./pages/prontuario/index";
import Agenda from "./pages/Agenda";
import CRM from "./pages/CRM";
import AreaPaciente from "./pages/AreaPaciente";
import Financeiro from "./pages/Financeiro";
import DRE from "./pages/DRE";
import Comissoes from "./pages/Comissoes";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import NovaEvolucao from "./pages/prontuario/nova";
import AcompanhamentoPacientes from "./pages/AcompanhamentoPacientes";
import PrescricaoDigital from "./pages/PrescricaoDigital";
import GestaoMedicos from "./pages/GestaoMedicos";
import WhatsAppAPI from "./pages/WhatsAppAPI";
import BIAvancado from "./pages/BIAvancado";
import GestaoHospitalar from "./pages/GestaoHospitalar";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// App Routes Component
const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/pacientes" element={
        <ProtectedRoute>
          <Layout><Pacientes /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/prontuario" element={
        <ProtectedRoute>
          <Layout><ProntuarioIndex /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/prontuario/nova" element={
        <ProtectedRoute>
          <Layout><NovaEvolucao /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/agenda" element={
        <ProtectedRoute>
          <Layout><Agenda /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/crm" element={
        <ProtectedRoute>
          <Layout><CRM /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/area-paciente" element={
        <ProtectedRoute>
          <Layout><AreaPaciente /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/prescricao-digital" element={
        <ProtectedRoute>
          <Layout><PrescricaoDigital /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/gestao-medicos" element={
        <ProtectedRoute>
          <Layout><GestaoMedicos /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/whatsapp-api" element={
        <ProtectedRoute>
          <Layout><WhatsAppAPI /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/bi-avancado" element={
        <ProtectedRoute>
          <Layout><BIAvancado /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/gestao-hospitalar" element={
        <ProtectedRoute>
          <Layout><GestaoHospitalar /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/financeiro" element={
        <ProtectedRoute>
          <Layout><Financeiro /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/dre" element={
        <ProtectedRoute>
          <Layout><DRE /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/comissoes" element={
        <ProtectedRoute>
          <Layout><Comissoes /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/relatorios" element={
        <ProtectedRoute>
          <Layout><Relatorios /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/configuracoes" element={
        <ProtectedRoute>
          <Layout><Configuracoes /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/acompanhamento-pacientes" element={
        <ProtectedRoute>
          <Layout><AcompanhamentoPacientes /></Layout>
        </ProtectedRoute>
      } />
      
      {/* Redirect root to landing for non-authenticated users */}
      <Route path="*" element={
        user ? <Navigate to="/" replace /> : <Navigate to="/landing" replace />
      } />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ActiveClinicaProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ActiveClinicaProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
