import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  DollarSign,
  History,
  Settings,
  Plus,
  Clock,
  Users,
  Calendar,
  Building,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Componentes das abas (serão implementados depois)
import AtendimentoAtivo from './tabs/AtendimentoAtivo';
import GestaoFinanceira from './GestaoFinanceira';
import Historico from './Historico';
import Configuracoes from './tabs/Configuracoes';

const PlantonistaDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('atendimento');

  // Dados mockados para demonstração
  const sessaoAtiva = {
    ativa: true,
    local: 'Hospital ABC',
    turno: 'Noite',
    inicio: '20:00',
    atendimentos: 8,
    reavaliacoes: 3
  };

  const resumoFinanceiro = {
    mesAtual: 'Janeiro 2024',
    total: 1650,
    pago: 120,
    pendente: 450,
    plantoesFixos: 2,
    plantoesAvulsos: 3
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏥 Área do Plantonista
            </h1>
            <p className="text-gray-600">
              Sistema de apoio para médicos plantonistas
            </p>
          </div>

          {/* Status da sessão */}
          {sessaoAtiva.ativa && (
            <Card className="bg-green-50 order-green-20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold text-green-800">
                      Sessão Ativa
                    </p>
                    <p className="text-sm text-green-600">
                      {sessaoAtiva.local} - {sessaoAtiva.turno}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Atendimentos Hoje */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Atendimentos</p>
                  <p className="text-2xl font-bold text-blue-600">{sessaoAtiva.atendimentos}</p>
                </div>
                <Stethoscope className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Reavaliações Pendentes */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reavaliações</p>
                  <p className="text-2xl font-bold text-orange-600">{sessaoAtiva.reavaliacoes}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          {/* Ganhos do Mês */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ganhos (Mês)</p>
                  <p className="text-2xl font-bold text-green-600">R$ {resumoFinanceiro.total}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Plantões */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Plantões</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {resumoFinanceiro.plantoesFixos + resumoFinanceiro.plantoesAvulsos}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Abas Principais */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger
              value="atendimento"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Stethoscope className="h-4 w-4" />
              <span className="hidden sm:inline">Atendimento</span>
            </TabsTrigger>

            <TabsTrigger
              value="financeiro"
              className="flex items-center space-x-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>

            <TabsTrigger
              value="historico"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>

            <TabsTrigger
              value="configuracoes"
              className="flex items-center space-x-2 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das Abas */}
          <div className="mt-6">
            <TabsContent value="atendimento" className="space-y-4">
              <AtendimentoAtivo />
            </TabsContent>

            <TabsContent value="financeiro" className="space-y-4">
              <GestaoFinanceira />
            </TabsContent>

            <TabsContent value="historico" className="space-y-4">
              <Historico />
            </TabsContent>

            <TabsContent value="configuracoes" className="space-y-4">
              <Configuracoes />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default PlantonistaDashboard; 