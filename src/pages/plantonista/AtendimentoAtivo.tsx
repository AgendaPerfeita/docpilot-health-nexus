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
import { QuickAIAssistant } from '@/components/medical/QuickAIAssistant';

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
    buscarReavaliacoesPendentes
  } = usePlantonista();

  const [sessaoAtiva, setSessaoAtiva] = useState<any>(null);
  const [reavaliacoes, setReavaliacoes] = useState<any[]>([]);
  const [showNovoAtendimento, setShowNovoAtendimento] = useState(false);
  const [showAtendimentoModal, setShowAtendimentoModal] = useState(false);
  const [atendimentoAtual, setAtendimentoAtual] = useState<any>(null);
  
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
    if (!sessaoAtiva?.id || !profile?.id) return;

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
            <span>Controle de Sessão</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!sessaoAtiva ? (
            <div className="flex items-center space-x-4">
              <Button onClick={iniciarSessao} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Sessão de Plantão
              </Button>
              <p className="text-gray-600">Clique para iniciar uma nova sessão de plantão</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-700">Sessão Ativa</span>
                </div>
                <Badge variant="secondary">{sessaoAtiva.local_trabalho} - {sessaoAtiva.turno}</Badge>
                <Badge variant="outline">
                  {format(new Date(sessaoAtiva.data_inicio), 'HH:mm', { locale: ptBR })}
                </Badge>
              </div>
              <Button onClick={finalizarSessaoAtiva} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Finalizar Sessão
              </Button>
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
                disabled={!sessaoAtiva} 
                onClick={() => setShowNovoAtendimento(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Atendimento Rápido
              </Button>
              {!sessaoAtiva && (
                <p className="text-sm text-gray-500 mt-2">
                  Inicie uma sessão para começar a atender pacientes
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
          <QuickAIAssistant 
            context="emergency"
            title="Assistente IA - Emergência"
            placeholder="Descreva o caso clínico ou peça sugestões diagnósticas..."
          />
        </CardContent>
      </Card>

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
