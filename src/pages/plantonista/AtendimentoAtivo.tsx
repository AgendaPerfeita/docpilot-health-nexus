import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  Plus, 
  Clock, 
  User,
  Stethoscope,
  AlertCircle,
  Save,
  FileText,
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Gauge,
  Eye,
  Ear,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';
import { usePlantonista } from '@/hooks/usePlantonista';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import ImprovedQuickAI from '@/components/medical/QuickAIAssistant';

const AtendimentoAtivo: React.FC = () => {
  const { profile } = useAuth();
  const {
    sessoes,
    atendimentos,
    loading,
    error,
    buscarSessaoAtiva,
    criarSessao,
    finalizarSessao,
    criarAtendimento,
    atualizarAtendimento,
    buscarReavaliacoesPendentes,
    buscarPlantoesMes
  } = usePlantonista();

  const [sessaoAtiva, setSessaoAtiva] = useState<any>(null);
  const [reavaliacoes, setReavaliacoes] = useState<any[]>([]);
  const [showNovoAtendimento, setShowNovoAtendimento] = useState(false);
  const [showAtendimentoModal, setShowAtendimentoModal] = useState(false);
  const [atendimentoAtual, setAtendimentoAtivo] = useState<any>(null);
  
  // Estados para nova arquitetura
  const [showIniciarPlantao, setShowIniciarPlantao] = useState(false);
  const [plantaoSelecionado, setPlantaoSelecionado] = useState<any>(null);
  const [modoAtendimento, setModoAtendimento] = useState<'plantao' | 'livre' | null>(null);
  const [plantoesReais, setPlantoesReais] = useState<any[]>([]);
  
  // Form states
  const [dadosPaciente, setDadosPaciente] = useState({
    nome: '',
    idade: '',
    sexo: 'masculino',
    documento: '',
    telefone: '',
    convenio: '',
    numero_convenio: ''
  });

  const [dadosAtendimento, setDadosAtendimento] = useState({
    queixa_principal: '',
    historia_doenca_atual: '',
    anamnese: '',
    exame_fisico: '',
    hipotese_diagnostica: '',
    conduta_inicial: '',
    medicamentos_prescritos: '',
    observacoes: ''
  });

  const [sinaisVitais, setSinaisVitais] = useState({
    pressao_arterial: '',
    frequencia_cardiaca: '',
    frequencia_respiratoria: '',
    temperatura: '',
    saturacao_o2: '',
    glicemia: '',
    peso: '',
    altura: ''
  });

  useEffect(() => {
    carregarSessaoAtiva();
    carregarPlantoesMes();
  }, []);

  useEffect(() => {
    if (sessaoAtiva) {
      carregarReavaliacoes();
    }
  }, [sessaoAtiva]);

  const carregarSessaoAtiva = async () => {
    const sessao = await buscarSessaoAtiva();
    setSessaoAtiva(sessao);
  };

  const carregarPlantoesMes = async () => {
    if (!profile?.id) return;
    
    const plantoes = await buscarPlantoesMes(profile.id);
    setPlantoesReais(plantoes || []);
  };

  const carregarReavaliacoes = async () => {
    if (sessaoAtiva?.id) {
      const reavs = await buscarReavaliacoesPendentes(sessaoAtiva.id);
      setReavaliacoes(reavs || []);
    }
  };

  const iniciarSessao = async () => {
    if (!profile?.id) return;
    
    const novaSessao = await criarSessao({
      medico_id: profile.id,
      local_trabalho: 'Hospital ABC',
      turno: 'noite',
      data_inicio: new Date().toISOString(),
      status: 'ativa'
    });

    if (novaSessao) {
      setSessaoAtiva(novaSessao);
      toast.success('Sessão de plantão iniciada!');
    }
  };

  const finalizarSessaoAtiva = async () => {
    if (!sessaoAtiva?.id) return;
    
    await finalizarSessao(sessaoAtiva.id);
    setSessaoAtiva(null);
    toast.success('Sessão finalizada!');
  };

  const criarNovoAtendimento = async () => {
    if (!modoAtendimento || !profile?.id) return;

    // Se for modo livre, não salva no banco
    if (modoAtendimento === 'livre') {
      toast.success('Atendimento em modo livre - Sem histórico');
      setShowNovoAtendimento(false);
      limparFormularios();
      return;
    }

    // Se for plantão, precisa de sessão ativa
    if (!sessaoAtiva?.id) {
      toast.error('Sessão não encontrada. Inicie um plantão primeiro.');
      return;
    }

    const novoAtendimento = await criarAtendimento({
      sessao_id: sessaoAtiva.id,
      medico_id: profile.id,
      paciente_nome: dadosPaciente.nome,
      paciente_idade: parseInt(dadosPaciente.idade) || null,
      paciente_sexo: dadosPaciente.sexo,
      queixa_principal: dadosAtendimento.queixa_principal,
      descricao: dadosAtendimento.historia_doenca_atual,
      anamnese: { texto: dadosAtendimento.anamnese },
      exame_fisico: { texto: dadosAtendimento.exame_fisico },
      conduta_inicial: { texto: dadosAtendimento.conduta_inicial },
      reavaliacao_agendada: null,
      evolucao: null,
      resultados_exames: null,
      sinais_vitais: sinaisVitais,
      conduta_final: null,
      diagnostico_final: null,
      status: 'primeiro_atendimento'
    });

    if (novoAtendimento) {
      toast.success('Atendimento criado com sucesso!');
      setShowNovoAtendimento(false);
      limparFormularios();
    }
  };

  const limparFormularios = () => {
    setDadosPaciente({
      nome: '',
      idade: '',
      sexo: 'masculino',
      documento: '',
      telefone: '',
      convenio: '',
      numero_convenio: ''
    });
    setDadosAtendimento({
      queixa_principal: '',
      historia_doenca_atual: '',
      anamnese: '',
      exame_fisico: '',
      hipotese_diagnostica: '',
      conduta_inicial: '',
      medicamentos_prescritos: '',
      observacoes: ''
    });
    setSinaisVitais({
      pressao_arterial: '',
      frequencia_cardiaca: '',
      frequencia_respiratoria: '',
      temperatura: '',
      saturacao_o2: '',
      glicemia: '',
      peso: '',
      altura: ''
    });
  };

  // Funções para nova arquitetura
  const iniciarPlantao = async (plantao: any) => {
    try {
      // Criar sessão para o plantão
      const novaSessao = await criarSessao({
        medico_id: profile?.id || '',
        local_trabalho: 'Plantão',
        turno: 'plantão',
        data_inicio: new Date().toISOString(),
        status: 'ativa'
      });

      if (novaSessao) {
        setSessaoAtiva(novaSessao);
        setPlantaoSelecionado(plantao);
        setModoAtendimento('plantao');
        setShowIniciarPlantao(false);
        
        const dataFormatada = formatarDataExibicao(plantao.data);
        toast.success(`Plantão iniciado: ${dataFormatada.data} - ${plantao.horario}`);
      }
    } catch (error) {
      toast.error('Erro ao iniciar plantão');
    }
  };

  const iniciarModoLivre = () => {
    setPlantaoSelecionado(null);
    setModoAtendimento('livre');
    setShowIniciarPlantao(false);
    toast.success('Modo livre ativado - Sem histórico');
  };

  const finalizarModoAtendimento = async () => {
    try {
      // Se estiver em plantão, finalizar a sessão
      if (modoAtendimento === 'plantao' && sessaoAtiva?.id) {
        await finalizarSessao(sessaoAtiva.id);
        setSessaoAtiva(null);
      }

      setPlantaoSelecionado(null);
      setModoAtendimento(null);
      
      const mensagem = modoAtendimento === 'plantao' 
        ? 'Plantão finalizado com sucesso!' 
        : 'Modo livre finalizado';
      
      toast.success(mensagem);
    } catch (error) {
      toast.error('Erro ao finalizar modo de atendimento');
    }
  };

  // Função para formatar data para exibição
  const formatarDataExibicao = (dataString: string) => {
    const data = new Date(dataString);
    const dia = data.getDate().toString().padStart(2, '0');
    const mes = data.toLocaleDateString('pt-BR', { month: 'short' });
    const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' });
    
    return {
      data: `${dia} ${mes}`,
      dia: diaSemana
    };
  };

  // Função para formatar valor monetário
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Controles de Sessão */}
      <Card>
        <CardHeader>
                     <CardTitle className="flex items-center space-x-2">
             <Stethoscope className="h-5 w-5" />
             <span>Iniciar Plantão</span>
             {plantoesReais.length > 0 && (
               <Badge variant="secondary" className="ml-2">
                 {plantoesReais.length} plantão{plantoesReais.length > 1 ? 'ões' : ''} futuro{plantoesReais.length > 1 ? 's' : ''}
               </Badge>
             )}
           </CardTitle>
        </CardHeader>
        <CardContent>
          {!modoAtendimento ? (
            <div className="space-y-4">
                             <Button 
                 onClick={() => setShowIniciarPlantao(true)} 
                 className="w-full bg-green-600 hover:bg-green-700"
                 size="lg"
               >
                 <Play className="h-4 w-4 mr-2" />
                 {plantoesReais.length > 0 ? `Iniciar Plantão (${plantoesReais.length} futuro${plantoesReais.length > 1 ? 's' : ''})` : 'Iniciar Plantão'}
               </Button>
                                              <p className="text-gray-600 text-center">
                   {plantoesReais.length > 0 
                     ? `Clique para selecionar um dos ${plantoesReais.length} plantão${plantoesReais.length > 1 ? 'ões' : ''} futuro${plantoesReais.length > 1 ? 's' : ''} ou iniciar modo livre`
                     : 'Clique para iniciar modo livre (sem plantões futuros agendados)'
                   }
                 </p>
            </div>
          ) : (
            <div className="space-y-4">
                             {modoAtendimento === 'plantao' && plantaoSelecionado && (
                 <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                   <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-2">
                       <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                       <span className="font-semibold text-green-700">Plantão Ativo</span>
                     </div>
                     <Badge variant="secondary">
                       {formatarDataExibicao(plantaoSelecionado.data).data} - {formatarDataExibicao(plantaoSelecionado.data).dia}
                     </Badge>
                     <Badge variant="outline">
                       {plantaoSelecionado.horario}
                     </Badge>
                     <Badge variant="outline" className="text-green-700">
                       {formatarValor(plantaoSelecionado.valor)}
                     </Badge>
                   </div>
                   <Button onClick={finalizarModoAtendimento} variant="destructive" size="sm">
                     <Square className="h-4 w-4 mr-2" />
                     Finalizar Plantão
                   </Button>
                 </div>
               )}
              
              {modoAtendimento === 'livre' && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-blue-700">Modo Livre Ativo</span>
                    </div>
                    <Badge variant="outline" className="text-blue-700">
                      Sem histórico - Consultas pessoais
                    </Badge>
                  </div>
                  <Button onClick={finalizarModoAtendimento} variant="destructive" size="sm">
                    <Square className="h-4 w-4 mr-2" />
                    Finalizar Modo Livre
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Novo Atendimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Novo Atendimento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!showNovoAtendimento ? (
            <div>
              <Button 
                disabled={!modoAtendimento} 
                onClick={() => setShowNovoAtendimento(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Atendimento Rápido
              </Button>
              {!modoAtendimento && (
                <p className="text-sm text-gray-500 mt-2">
                  Inicie um plantão ou modo livre para começar a atender pacientes
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <Tabs defaultValue="paciente" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="paciente">Paciente</TabsTrigger>
                  <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
                  <TabsTrigger value="exame">Exame</TabsTrigger>
                  <TabsTrigger value="conduta">Conduta</TabsTrigger>
                </TabsList>

                <TabsContent value="paciente" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={dadosPaciente.nome}
                        onChange={(e) => setDadosPaciente(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Nome do paciente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="idade">Idade</Label>
                      <Input
                        id="idade"
                        type="number"
                        value={dadosPaciente.idade}
                        onChange={(e) => setDadosPaciente(prev => ({ ...prev, idade: e.target.value }))}
                        placeholder="Idade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="documento">CPF/RG</Label>
                      <Input
                        id="documento"
                        value={dadosPaciente.documento}
                        onChange={(e) => setDadosPaciente(prev => ({ ...prev, documento: e.target.value }))}
                        placeholder="Documento"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={dadosPaciente.telefone}
                        onChange={(e) => setDadosPaciente(prev => ({ ...prev, telefone: e.target.value }))}
                        placeholder="Telefone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="convenio">Convênio</Label>
                      <Input
                        id="convenio"
                        value={dadosPaciente.convenio}
                        onChange={(e) => setDadosPaciente(prev => ({ ...prev, convenio: e.target.value }))}
                        placeholder="Nome do convênio"
                      />
                    </div>
                    <div>
                      <Label htmlFor="numero_convenio">Número do Convênio</Label>
                      <Input
                        id="numero_convenio"
                        value={dadosPaciente.numero_convenio}
                        onChange={(e) => setDadosPaciente(prev => ({ ...prev, numero_convenio: e.target.value }))}
                        placeholder="Número da carteirinha"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="anamnese" className="space-y-4">
                  <div>
                    <Label htmlFor="queixa">Queixa Principal *</Label>
                    <Textarea
                      id="queixa"
                      value={dadosAtendimento.queixa_principal}
                      onChange={(e) => setDadosAtendimento(prev => ({ ...prev, queixa_principal: e.target.value }))}
                      placeholder="Descreva a queixa principal do paciente"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hda">História da Doença Atual</Label>
                    <Textarea
                      id="hda"
                      value={dadosAtendimento.historia_doenca_atual}
                      onChange={(e) => setDadosAtendimento(prev => ({ ...prev, historia_doenca_atual: e.target.value }))}
                      placeholder="História da doença atual"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="anamnese">Anamnese Complementar</Label>
                    <Textarea
                      id="anamnese"
                      value={dadosAtendimento.anamnese}
                      onChange={(e) => setDadosAtendimento(prev => ({ ...prev, anamnese: e.target.value }))}
                      placeholder="Antecedentes, medicações em uso, alergias, etc."
                      rows={4}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="exame" className="space-y-4">
                  {/* Sinais Vitais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Sinais Vitais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="pa">PA (mmHg)</Label>
                          <Input
                            id="pa"
                            value={sinaisVitais.pressao_arterial}
                            onChange={(e) => setSinaisVitais(prev => ({ ...prev, pressao_arterial: e.target.value }))}
                            placeholder="120/80"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fc">FC (bpm)</Label>
                          <Input
                            id="fc"
                            value={sinaisVitais.frequencia_cardiaca}
                            onChange={(e) => setSinaisVitais(prev => ({ ...prev, frequencia_cardiaca: e.target.value }))}
                            placeholder="80"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fr">FR (irpm)</Label>
                          <Input
                            id="fr"
                            value={sinaisVitais.frequencia_respiratoria}
                            onChange={(e) => setSinaisVitais(prev => ({ ...prev, frequencia_respiratoria: e.target.value }))}
                            placeholder="16"
                          />
                        </div>
                        <div>
                          <Label htmlFor="temp">Temperatura (°C)</Label>
                          <Input
                            id="temp"
                            value={sinaisVitais.temperatura}
                            onChange={(e) => setSinaisVitais(prev => ({ ...prev, temperatura: e.target.value }))}
                            placeholder="36.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sat">SatO2 (%)</Label>
                          <Input
                            id="sat"
                            value={sinaisVitais.saturacao_o2}
                            onChange={(e) => setSinaisVitais(prev => ({ ...prev, saturacao_o2: e.target.value }))}
                            placeholder="98"
                          />
                        </div>
                        <div>
                          <Label htmlFor="glicemia">Glicemia (mg/dL)</Label>
                          <Input
                            id="glicemia"
                            value={sinaisVitais.glicemia}
                            onChange={(e) => setSinaisVitais(prev => ({ ...prev, glicemia: e.target.value }))}
                            placeholder="90"
                          />
                        </div>
                        <div>
                          <Label htmlFor="peso">Peso (kg)</Label>
                          <Input
                            id="peso"
                            value={sinaisVitais.peso}
                            onChange={(e) => setSinaisVitais(prev => ({ ...prev, peso: e.target.value }))}
                            placeholder="70"
                          />
                        </div>
                        <div>
                          <Label htmlFor="altura">Altura (cm)</Label>
                          <Input
                            id="altura"
                            value={sinaisVitais.altura}
                            onChange={(e) => setSinaisVitais(prev => ({ ...prev, altura: e.target.value }))}
                            placeholder="170"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div>
                    <Label htmlFor="exame_fisico">Exame Físico</Label>
                    <Textarea
                      id="exame_fisico"
                      value={dadosAtendimento.exame_fisico}
                      onChange={(e) => setDadosAtendimento(prev => ({ ...prev, exame_fisico: e.target.value }))}
                      placeholder="Descrição do exame físico..."
                      rows={6}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="conduta" className="space-y-4">
                  <div>
                    <Label htmlFor="hipotese">Hipótese Diagnóstica</Label>
                    <Textarea
                      id="hipotese"
                      value={dadosAtendimento.hipotese_diagnostica}
                      onChange={(e) => setDadosAtendimento(prev => ({ ...prev, hipotese_diagnostica: e.target.value }))}
                      placeholder="Hipóteses diagnósticas..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="conduta">Conduta Inicial</Label>
                    <Textarea
                      id="conduta"
                      value={dadosAtendimento.conduta_inicial}
                      onChange={(e) => setDadosAtendimento(prev => ({ ...prev, conduta_inicial: e.target.value }))}
                      placeholder="Conduta e tratamento inicial..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={dadosAtendimento.observacoes}
                      onChange={(e) => setDadosAtendimento(prev => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNovoAtendimento(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={criarNovoAtendimento}
                  disabled={!dadosPaciente.nome || !dadosAtendimento.queixa_principal}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Atendimento
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reavaliações Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Pacientes para Reavaliação</span>
            <Badge variant="secondary">{reavaliacoes.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reavaliacoes.length > 0 ? (
            <div className="space-y-3">
              {reavaliacoes.map((paciente) => (
                <div 
                  key={paciente.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{paciente.paciente_nome}</p>
                      <p className="text-sm text-gray-600">{paciente.queixa_principal}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-orange-600">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(paciente.created_at), 'HH:mm', { locale: ptBR })}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Reavaliar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Nenhuma reavaliação pendente</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assistente IA */}
      <Card>
        <CardContent className="pt-6">
          <ImprovedQuickAI />
        </CardContent>
      </Card>

      {/* Modal para Selecionar Plantão */}
      {showIniciarPlantao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Selecionar Plantão ou Modo Livre</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIniciarPlantao(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
                             {/* Plantões Agendados */}
               <div>
                 <h4 className="font-medium text-gray-800 mb-3">🏥 Plantões Agendados (a partir de hoje)</h4>
                 {plantoesReais.length > 0 ? (
                   <div className="space-y-2">
                     {plantoesReais.map((plantao) => {
                       const dataFormatada = formatarDataExibicao(plantao.data);
                       return (
                         <div
                           key={plantao.id}
                           className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                           onClick={() => iniciarPlantao(plantao)}
                         >
                           <div className="flex items-center space-x-3">
                             <div className="text-center">
                               <div className="text-lg font-bold text-blue-600">{dataFormatada.data}</div>
                               <div className="text-xs text-gray-500">{dataFormatada.dia}</div>
                             </div>
                             <div>
                               <div className="font-medium">{profile?.nome || 'Médico'}</div>
                               <div className="text-sm text-gray-600">{plantao.horario}</div>
                             </div>
                           </div>
                           <div className="text-right">
                             <div className="font-semibold text-green-600">{formatarValor(plantao.valor)}</div>
                             <Badge variant="outline" className="text-xs">
                               {plantao.status}
                             </Badge>
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 ) : (
                   <div className="text-center py-4 text-gray-500">
                     <p>Nenhum plantão agendado a partir de hoje</p>
                     <p className="text-sm">Os plantões futuros aparecerão aqui quando agendados</p>
                   </div>
                 )}
               </div>

              {/* Separador */}
              <div className="border-t pt-4">
                <div className="text-center text-gray-500 mb-3">OU</div>
              </div>

              {/* Modo Livre */}
              <div>
                <h4 className="font-medium text-gray-800 mb-3">🆓 Modo Livre</h4>
                <div className="p-4 border-2 border-dashed border-blue-300 rounded-lg text-center hover:bg-blue-50 cursor-pointer"
                     onClick={iniciarModoLivre}>
                  <div className="text-2xl mb-2">🆓</div>
                  <div className="font-medium text-blue-800">Atendimento Livre</div>
                  <div className="text-sm text-blue-600 mt-1">
                    Para consultas pessoais, testes ou uso sem vínculo a plantão
                  </div>
                  <div className="text-xs text-blue-500 mt-2">
                    ⚠️ Não salva no histórico • Sem reavaliação
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Atendimentos em Andamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>Atendimentos em Andamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">Nenhum atendimento em andamento</p>
            <p className="text-sm text-gray-500">Os atendimentos aparecerão aqui quando iniciados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AtendimentoAtivo;
