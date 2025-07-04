import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Prontuario from "./pages/Prontuario";
import Agenda from "./pages/Agenda";
import CRM from "./pages/CRM";
import AreaPaciente from "./pages/AreaPaciente";
import Financeiro from "./pages/Financeiro";
import DRE from "./pages/DRE";
import Comissoes from "./pages/Comissoes";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pacientes" element={<Pacientes />} />
            <Route path="/prontuario" element={<Prontuario />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/area-paciente" element={<AreaPaciente />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/dre" element={<DRE />} />
            <Route path="/comissoes" element={<Comissoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
