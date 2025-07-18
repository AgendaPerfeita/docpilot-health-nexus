import React, { useEffect, useState } from 'react';
import {
  Stethoscope,
  Plus,
  Clock,
  Users,
  Calendar,
  Building,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlantonista } from '@/hooks/usePlantonista';
import { Tables } from '@/integrations/supabase/types';

type PlantonistaSessao = Tables<'plantonista_sessoes'>;
type PlantonistaAtendimento = Tables<'plantonista_atendimentos'>;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { analyzeMedicalDataAdvanced, analyzePlantonistaData } from '@/lib/gemini';
import {
  calculateBMI,
  calculateQSOFA,
  calculateCRB65,
  calculateCreatinineClearance,
  calculateCentor
} from '@/lib/medical-calculators';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

// Componente Calculadora Automática para o modal (fora do AtendimentoAtivo)
const CalculadoraAutomaticaPlantonista = ({
  sinaisVitais,
  idade,
  sexo,
  peso,
  altura,
  editFields,
  setEditFields
}: any) => {
  // Campos extras para calculadoras
  const [glasgow, setGlasgow] = React.useState(15);
  const [confusao, setConfusao] = React.useState(false);
  const [creatinina, setCreatinina] = React.useState('');
  const [tonsilar, setTonsilar] = React.useState(false);
  const [linfonodo, setLinfonodo] = React.useState(false);
  const [febre, setFebre] = React.useState(false);
  const [tosse, setTosse] = React.useState(false);

  // IMC
  let imcResult = null;
  if (peso && altura) {
    imcResult = calculateBMI(Number(peso), Number(altura));
  }

  // qSOFA
  let qsofaResult = null;
  if (sinaisVitais?.fr && sinaisVitais?.pa_sistolica) {
    qsofaResult = calculateQSOFA(
      Number(sinaisVitais.fr),
      Number(sinaisVitais.pa_sistolica),
      glasgow
    );
  }

  // CRB-65
  let crb65Result = null;
  if (idade && sinaisVitais?.fr && sinaisVitais?.pa_sistolica && sinaisVitais?.pa_diastolica) {
    crb65Result = calculateCRB65(
      confusao,
      Number(sinaisVitais.fr),
      { systolic: Number(sinaisVitais.pa_sistolica), diastolic: Number(sinaisVitais.pa_diastolica) },
      Number(idade)
    );
  }

  // ClCr
  let clcrResult = null;
  if (idade && peso && sexo && creatinina) {
    clcrResult = calculateCreatinineClearance(
      Number(idade),
      Number(peso),
      Number(creatinina),
      sexo
    );
  }

  // Centor
  let centorResult = null;
  if (idade) {
    centorResult = calculateCentor(
      tonsilar,
      linfonodo,
      febre,
      Number(idade),
      tosse
    );
  }

  return (
    <div className="w-full md:w-80 bg-gray-50 rounded-lg p-4 border border-gray-200 ml-0 md:ml-6 mt-6 md:mt-0">
      <h3 className="font-bold text-lg mb-2">Calculadora Automática</h3>
      {/* IMC */}
      <div className="mb-3">
        <div className="font-semibold">IMC</div>
        {imcResult ? (
          <div>
            <span className="font-mono">{imcResult.bmi}</span> - {imcResult.classification}
            <div className="text-xs text-gray-500">{imcResult.recommendations.join(', ')}</div>
          </div>
        ) : <div className="text-xs text-gray-400">Preencha peso e altura</div>}
      </div>
      {/* qSOFA */}
      <div className="mb-3">
        <div className="font-semibold">qSOFA</div>
        <div className="flex items-center space-x-2 text-xs">
          <span>Glasgow:</span>
          <Input type="number" min="3" max="15" className="w-16" value={glasgow} onChange={e => setGlasgow(Number(e.target.value))} />
        </div>
        {qsofaResult ? (
          <div>
            <span className="font-mono">{qsofaResult.score}</span> - {qsofaResult.risk}
            <div className="text-xs text-gray-500">{qsofaResult.recommendation}</div>
          </div>
        ) : <div className="text-xs text-gray-400">Preencha FR e PA sistólica</div>}
      </div>
      {/* CRB-65 */}
      <div className="mb-3">
        <div className="font-semibold">CRB-65</div>
        <div className="flex items-center space-x-2 text-xs">
          <span>Confusão mental:</span>
          <input type="checkbox" checked={confusao} onChange={e => setConfusao(e.target.checked)} />
        </div>
        {crb65Result ? (
          <div>
            <span className="font-mono">{crb65Result.score}</span> - {crb65Result.risk}
            <div className="text-xs text-gray-500">{crb65Result.recommendation}</div>
          </div>
        ) : <div className="text-xs text-gray-400">Preencha idade, FR, PA e confusão</div>}
      </div>
      {/* ClCr */}
      <div className="mb-3">
        <div className="font-semibold">ClCr (Cockcroft-Gault)</div>
        <div className="flex items-center space-x-2 text-xs">
          <span>Creatinina:</span>
          <Input type="number" min="0" step="0.01" className="w-20" value={creatinina} onChange={e => setCreatinina(e.target.value)} />
        </div>
        {clcrResult ? (
          <div>
            <span className="font-mono">{clcrResult.toFixed(1)} mL/min</span>
          </div>
        ) : <div className="text-xs text-gray-400">Preencha idade, peso, sexo e creatinina</div>}
      </div>
      {/* Centor */}
      <div className="mb-3">
        <div className="font-semibold">Centor</div>
        <div className="flex flex-col text-xs space-y-1">
          <label><input type="checkbox" checked={tonsilar} onChange={e => setTonsilar(e.target.checked)} /> Exsudato tonsilar</label>
          <label><input type="checkbox" checked={linfonodo} onChange={e => setLinfonodo(e.target.checked)} /> Linfonodo doloroso</label>
          <label><input type="checkbox" checked={febre} onChange={e => setFebre(e.target.checked)} /> Febre</label>
          <label><input type="checkbox" checked={tosse} onChange={e => setTosse(e.target.checked)} /> Tosse ausente</label>
        </div>
        {centorResult ? (
          <div>
            <span className="font-mono">{centorResult.score}</span> - {centorResult.risk}
            <div className="text-xs text-gray-500">{centorResult.recommendation}</div>
          </div>
        ) : <div className="text-xs text-gray-400">Preencha idade e sintomas</div>}
      </div>
    </div>
  );
};

const AtendimentoAtivo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('novo-atendimento');
  const [sessaoAtiva, setSessaoAtiva] = useState<PlantonistaSessao | null>(null);
  const [atendimentos, setAtendimentos] = useState<PlantonistaAtendimento[]>([]);
  const [reavaliacoes, setReavaliacoes] = useState<PlantonistaAtendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [novoAtendimento, setNovoAtendimento] = useState({
    paciente_nome: '',
    paciente_idade: '',
    paciente_sexo: '',
    queixa_principal: '',
    anamnese: '',
    // Novos campos para IA
    habitos: '',
    antecedentes_familiares: '',
    medicamentos_uso: '',
    alergias: '',
    comorbidades: '',
    caracterizacao_dor: '',
    sintomas_associados: {
      tosse: false,
      dispneia: false,
      sudorese: false,
      nauseas: false,
      outros: ''
    },
    exame_fisico_estruturado: '',
    sinais_vitais: {
      pa_sistolica: '',
      pa_diastolica: '',
      fc: '',
      fr: '',
      temp: '',
      sat_o2: '',
      peso: '',
      altura: '',
      hgt: '',
    },
    conduta_inicial: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [modalAtendimento, setModalAtendimento] = useState<PlantonistaAtendimento | null>(null);
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResposta, setIaResposta] = useState<string | null>(null);
  const [iaLoadingNovo, setIaLoadingNovo] = useState(false);
  const [iaSugestaoNovo, setIaSugestaoNovo] = useState<string | null>(null);
  const [novoAtendimentoErro, setNovoAtendimentoErro] = useState<string | null>(null);
  const [novoAtendimentoSucesso, setNovoAtendimentoSucesso] = useState<string | null>(null);
  const [showPlantaoModal, setShowPlantaoModal] = useState(false);
  const [novoPlantao, setNovoPlantao] = useState({ local_trabalho: '', turno: '' });
  const {
    buscarSessaoAtiva,
    buscarAtendimentos,
    buscarReavaliacoesPendentes,
    criarAtendimento,
    atualizarAtendimento,
    loading: loadingHook,
    error: errorHook,
  } = usePlantonista();
  const { toast } = useToast();
  const { profile } = useAuth();

  // Carregar sessão ativa e dados relacionados
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const sessao = await buscarSessaoAtiva();
        setSessaoAtiva(sessao);
        if (sessao?.id) {
          await buscarAtendimentos(sessao.id);
          const reavs = await buscarReavaliacoesPendentes(sessao.id);
          setReavaliacoes(reavs || []);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados do plantão');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Atualizar atendimentos quando hook atualizar
  useEffect(() => {
    if (sessaoAtiva?.id) {
      buscarAtendimentos(sessaoAtiva.id).then(() => {});
    }
    // eslint-disable-next-line
  }, [sessaoAtiva]);

  // Receber atendimentos do hook
  const { atendimentos: atendimentosHook } = usePlantonista();
  console.log('DEBUG valor inicial atendimentosHook:', atendimentosHook);
  useEffect(() => {
    console.log('DEBUG useEffect de atendimentosHook rodou');
    console.log('DEBUG atendimentosHook antes do filtro:', atendimentosHook);
    atendimentosHook.forEach(a => console.log('Status do atendimento:', a.status));
    setAtendimentos(atendimentosHook); // Removido filtro para teste
  }, [atendimentosHook]);

  // Handler para novo atendimento
  const isEmpty = (v: any) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
  const handleNovoAtendimento = async () => {
    console.log('clicou em Iniciar Atendimento');
    if (!sessaoAtiva) {
      console.log('ERRO: Não há sessão ativa!', sessaoAtiva);
      return;
    }
    setNovoAtendimentoErro(null);
    setNovoAtendimentoSucesso(null);
    setIaSugestaoNovo(null);
    if (
      isEmpty(novoAtendimento.paciente_nome) ||
      isEmpty(novoAtendimento.paciente_idade) ||
      isEmpty(novoAtendimento.paciente_sexo) ||
      isEmpty(novoAtendimento.queixa_principal) ||
      isEmpty(novoAtendimento.sinais_vitais.pa_sistolica) ||
      isEmpty(novoAtendimento.sinais_vitais.pa_diastolica) ||
      isEmpty(novoAtendimento.sinais_vitais.fc) ||
      isEmpty(novoAtendimento.sinais_vitais.fr)
    ) {
      console.log('erro: campos obrigatórios faltando');
      setNovoAtendimentoErro('Preencha todos os campos obrigatórios.');
      console.log('toast chamado');
      toast({
        title: 'Erro ao iniciar atendimento',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    try {
      const payload = {
        sessao_id: sessaoAtiva.id,
        medico_id: sessaoAtiva.medico_id,
        paciente_nome: novoAtendimento.paciente_nome,
        paciente_idade: Number(novoAtendimento.paciente_idade),
        paciente_sexo: novoAtendimento.paciente_sexo as 'M' | 'F',
        queixa_principal: novoAtendimento.queixa_principal,
        anamnese: { texto: novoAtendimento.anamnese },
        exame_fisico_estruturado: novoAtendimento.exame_fisico_estruturado,
        sinais_vitais: {
          ...novoAtendimento.sinais_vitais,
          pa_sistolica: novoAtendimento.sinais_vitais.pa_sistolica ? Number(novoAtendimento.sinais_vitais.pa_sistolica) : null,
          pa_diastolica: novoAtendimento.sinais_vitais.pa_diastolica ? Number(novoAtendimento.sinais_vitais.pa_diastolica) : null,
          fc: novoAtendimento.sinais_vitais.fc ? Number(novoAtendimento.sinais_vitais.fc) : null,
          fr: novoAtendimento.sinais_vitais.fr ? Number(novoAtendimento.sinais_vitais.fr) : null,
          temp: novoAtendimento.sinais_vitais.temp ? Number(novoAtendimento.sinais_vitais.temp) : null,
          sat_o2: novoAtendimento.sinais_vitais.sat_o2 ? Number(novoAtendimento.sinais_vitais.sat_o2) : null,
          peso: novoAtendimento.sinais_vitais.peso ? Number(novoAtendimento.sinais_vitais.peso) : null,
          altura: novoAtendimento.sinais_vitais.altura ? Number(novoAtendimento.sinais_vitais.altura) : null,
          hgt: novoAtendimento.sinais_vitais.hgt ? Number(novoAtendimento.sinais_vitais.hgt) : null,
        },
        conduta_inicial: { texto: novoAtendimento.conduta_inicial },
        status: 'primeiro_atendimento' as 'primeiro_atendimento',
        medicamentos_uso: novoAtendimento.medicamentos_uso,
        alergias: novoAtendimento.alergias,
        comorbidades: novoAtendimento.comorbidades,
        habitos: novoAtendimento.habitos,
      };
      console.log('Payload para insert em plantonista_atendimentos:', payload);
      const { data, error } = await criarAtendimento(payload);
      console.log('Resposta do insert de atendimento:', { data, error });
      if (error) throw error;
      setNovoAtendimento({ 
        paciente_nome: '', 
        paciente_idade: '', 
        paciente_sexo: '', 
        queixa_principal: '', 
        anamnese: '', 
        habitos: '',
        antecedentes_familiares: '',
        medicamentos_uso: '',
        alergias: '',
        comorbidades: '',
        caracterizacao_dor: '',
        sintomas_associados: { tosse: false, dispneia: false, sudorese: false, nauseas: false, outros: '' },
        exame_fisico_estruturado: '',
        sinais_vitais: { pa_sistolica: '', pa_diastolica: '', fc: '', fr: '', temp: '', sat_o2: '', peso: '', altura: '', hgt: '' }, 
        conduta_inicial: '' 
      });
      setNovoAtendimentoSucesso('Atendimento iniciado com sucesso!');
      if (sessaoAtiva.id) await buscarAtendimentos(sessaoAtiva.id);
    } catch (err: any) {
      console.error('Erro ao criar atendimento:', err);
      setNovoAtendimentoErro(err.message || 'Erro ao criar atendimento');
      toast({
        title: 'Erro ao iniciar atendimento',
        description: err.message || 'Erro ao criar atendimento',
        variant: 'destructive',
      });
    }
  };

  // Handler para IA novo atendimento
  const handleIANovoAtendimento = async () => {
    setIaLoadingNovo(true);
    setIaSugestaoNovo(null);
    try {
      const patientData = {
        name: novoAtendimento.paciente_nome,
        age: novoAtendimento.paciente_idade,
        gender: novoAtendimento.paciente_sexo,
      };
      const vitalSigns = {
        ...novoAtendimento.sinais_vitais,
        pa_sistolica: novoAtendimento.sinais_vitais.pa_sistolica,
        pa_diastolica: novoAtendimento.sinais_vitais.pa_diastolica,
      };
      const additionalData = {
        anamnese: novoAtendimento.anamnese,
        medicamentos_uso: novoAtendimento.medicamentos_uso,
        alergias: novoAtendimento.alergias,
        habitos: novoAtendimento.habitos,
        antecedentes_familiares: novoAtendimento.antecedentes_familiares,
        caracterizacao_dor: novoAtendimento.caracterizacao_dor,
        sintomas_associados: novoAtendimento.sintomas_associados,
        exame_fisico_estruturado: novoAtendimento.exame_fisico_estruturado,
      };
      const symptoms = novoAtendimento.queixa_principal || '';
      const resp = await analyzePlantonistaData(patientData, symptoms, vitalSigns, {}, additionalData);
      setIaSugestaoNovo(resp);
    } catch (err: any) {
      setIaSugestaoNovo('Erro ao obter sugestão da IA.');
    } finally {
      setIaLoadingNovo(false);
    }
  };

  // Handler para iniciar plantão
  const handleIniciarPlantao = async () => {
    console.log('Iniciar Plantão: profile', profile);
    if (!novoPlantao.local_trabalho.trim() || !novoPlantao.turno.trim()) {
      toast({
        title: 'Preencha todos os campos',
        description: 'Local de trabalho e turno são obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    try {
      if (sessaoAtiva) {
        setShowPlantaoModal(false);
        return;
      }
      const payload = {
        medico_id: profile?.user_id, // Corrigido para user_id
        local_trabalho: novoPlantao.local_trabalho,
        turno: novoPlantao.turno,
        status: 'ativa' as 'ativa', // Garantir tipo literal
      };
      console.log('Payload para insert em plantonista_sessoes:', payload);
      const { data, error } = await supabase
        .from('plantonista_sessoes')
        .insert(payload);
      console.log('Resposta do insert:', { data, error });
      if (error) throw error;
      setShowPlantaoModal(false);
      toast({
        title: 'Plantão iniciado',
        description: 'Sua sessão de plantão foi iniciada com sucesso.',
        variant: 'default',
      });
      const sessao = await buscarSessaoAtiva();
      setSessaoAtiva(sessao);
    } catch (err: any) {
      console.error('Erro ao iniciar plantão:', err);
      toast({
        title: 'Erro ao iniciar plantão',
        description: err.message || 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  // Estado para edição dos campos clínicos no modal
  const [editFields, setEditFields] = useState<any>({});
  useEffect(() => {
    if (modalAtendimento) {
      setEditFields({
        anamnese: modalAtendimento.anamnese?.texto || '',
        sinais_vitais: {
          pa_sistolica: modalAtendimento.sinais_vitais?.pa_sistolica ?? '',
          pa_diastolica: modalAtendimento.sinais_vitais?.pa_diastolica ?? '',
          fc: modalAtendimento.sinais_vitais?.fc ?? '',
          fr: modalAtendimento.sinais_vitais?.fr ?? '',
          temp: modalAtendimento.sinais_vitais?.temp ?? '',
          sat_o2: modalAtendimento.sinais_vitais?.sat_o2 ?? '',
          peso: modalAtendimento.sinais_vitais?.peso ?? '',
          altura: modalAtendimento.sinais_vitais?.altura ?? '',
          hgt: modalAtendimento.sinais_vitais?.hgt ?? '',
        },
        conduta_inicial: modalAtendimento.conduta_inicial?.texto || '',
        evolucao: modalAtendimento.evolucao || '',
        resultados_exames: modalAtendimento.resultados_exames || '',
        conduta_final: modalAtendimento.conduta_final || '',
        diagnostico_final: modalAtendimento.diagnostico_final || '',
      });
    }
  }, [modalAtendimento]);

  // Handler para salvar alterações
  const handleSalvarEdicao = async () => {
    if (!modalAtendimento) return;
    setIaLoading(true);
    try {
      await atualizarAtendimento(modalAtendimento.id, {
        anamnese: { texto: editFields.anamnese },
        sinais_vitais: {
          ...editFields.sinais_vitais,
          pa_sistolica: editFields.sinais_vitais.pa_sistolica ? Number(editFields.sinais_vitais.pa_sistolica) : null,
          pa_diastolica: editFields.sinais_vitais.pa_diastolica ? Number(editFields.sinais_vitais.pa_diastolica) : null,
          fc: editFields.sinais_vitais.fc ? Number(editFields.sinais_vitais.fc) : null,
          fr: editFields.sinais_vitais.fr ? Number(editFields.sinais_vitais.fr) : null,
          temp: editFields.sinais_vitais.temp ? Number(editFields.sinais_vitais.temp) : null,
          sat_o2: editFields.sinais_vitais.sat_o2 ? Number(editFields.sinais_vitais.sat_o2) : null,
          peso: editFields.sinais_vitais.peso ? Number(editFields.sinais_vitais.peso) : null,
          altura: editFields.sinais_vitais.altura ? Number(editFields.sinais_vitais.altura) : null,
          hgt: editFields.sinais_vitais.hgt ? Number(editFields.sinais_vitais.hgt) : null,
        },
        conduta_inicial: { texto: editFields.conduta_inicial },
        evolucao: editFields.evolucao,
        resultados_exames: editFields.resultados_exames,
        conduta_final: editFields.conduta_final,
        diagnostico_final: editFields.diagnostico_final,
      });
      setIaResposta('Dados salvos com sucesso!');
      if (sessaoAtiva?.id) await buscarAtendimentos(sessaoAtiva.id);
    } catch (err: any) {
      setIaResposta('Erro ao salvar dados.');
    } finally {
      setIaLoading(false);
    }
  };

  // Handler para acionar IA Gemini (agora usando campos editados)
  const handleIA = async () => {
    if (!modalAtendimento) return;
    setIaLoading(true);
    setIaResposta(null);
    try {
      // Montar prompt clínico estruturado para reavaliação
      const dadosIniciais = `Queixa principal: ${modalAtendimento.queixa_principal || '-'}
Anamnese: ${modalAtendimento.anamnese?.texto || '-'}
Exame físico estruturado: ${modalAtendimento.exame_fisico_estruturado || '-'}
Sinais vitais: ${modalAtendimento.sinais_vitais ? Object.entries(modalAtendimento.sinais_vitais).map(([k, v]) => `${k}: ${v}`).join(', ') : '-'}
Medicamentos em uso: ${modalAtendimento['medicamentos_uso'] || '-'}
Alergias: ${modalAtendimento['alergias'] || '-'}
Comorbidades: ${modalAtendimento['comorbidades'] || '-'}
Hábitos: ${modalAtendimento['habitos'] || '-'}
Medicação hospitalar já administrada: ${modalAtendimento.conduta_inicial?.texto || '-'}
`;
      const dadosReavaliacao = `Evolução: ${editFields.evolucao || '-'}
Resultados de exames: ${editFields.resultados_exames || '-'}
`;
      const prompt = `Você é um médico plantonista experiente. Considere os dados do atendimento inicial e da reavaliação abaixo. Gere um novo parecer clínico prático, direto e estruturado para o plantonista, incluindo:
- Diagnósticos diferenciais (atualizados)
- Exames necessários (apenas novos exames, se necessário, considerando os já realizados e seus resultados)
- Medicação imediata (hospital): utilize o checklist FASTHUG (Feeding, Analgesia, Sedation, Thromboembolic prophylaxis, Head of bed elevation, Ulcer prophylaxis, Glycemic control) para sugerir uma prescrição hospitalar completa e personalizada, considerando os dados do paciente. Justifique cada item.
- Medicação para casa (se aplicável)
- Justificativa clínica (baseada na evolução e nos resultados dos exames)
- Decisão (internar, liberar, reavaliar, etc)
- CID-10 sugerido
Evite respostas longas e genéricas. Seja objetivo e direto, como em um plantão.

Dados iniciais:
${dadosIniciais}
Dados da reavaliação:
${dadosReavaliacao}

Ao final da sua resposta, gere um resumo clínico objetivo, seguindo o modelo abaixo, adaptando para o caso do paciente:

# NEGA ALERGIAS
# NEGA COMORBIDADES

RELATA DOR LOMBAR E ABDOMINAL  HÁ 6 MESES, PORÉM HOJE INTENSIFICOU. RELATA DOR EM QUEIMAÇÃO EM CANAL URINARIO, NÃO CONSEGUINDO  URINAR E EVACUAR POR CONTA DA DOR. DOR REFRATÁRIA Á ANALGESIA COM TRAMAL.  RELATA FEBRE ALTA HÁ 5 DIAS. HISTORICO DE NEFROLITIASE; 

Paciente lúcido, orientado no tempo e espaço, normocorado, hidratado, acianótico, anictérico.
ACV: Ritmo cardíaco regular em 2 tempos, bulhas normofoneticas, sem extra-sístoles. 
AP: Murmúrio vesicular universalmente audível, sem ruídos adventícios.
ABDOME: Indolor à palpação superficial e profunda. Sem sinais de peritonite ou descompressão dolorosa.
MMII: Sem alterações, edemas ou sinais de empastamento.
 
CD: 
- TC ABD
- LAB
- MEDICAÇÃO

reav:
- PACIENTE ORIENTADO A MANTER HIDRATAÇÃO ORAL, USO DE MEDICAÇÃO ANALGÉSICA E TANSULOSINA POR ATÉ 30 DIAS. RETORNAR COM PIORA DA DOR, FEBRE OU ANÚRIA. ENCAMINHADO PARA ACOMPANHAMENTO COM UROLOGIA AMBULATORIAL.
`;
      // Chamar IA com o prompt customizado
      const resp = await analyzeMedicalDataAdvanced({}, prompt, {}, {});
      setIaResposta(resp);
    } catch (err: any) {
      setIaResposta('Erro ao obter sugestão da IA.');
    } finally {
      setIaLoading(false);
    }
  };

  // Handler para marcar como reavaliação
  const handleReavaliar = async () => {
    if (!modalAtendimento) return;
    setIaLoading(true);
    try {
      await atualizarAtendimento(modalAtendimento.id, {
        status: 'reavaliacao',
      });
      setIaResposta('Atendimento marcado para reavaliação!');
      if (sessaoAtiva?.id) await buscarAtendimentos(sessaoAtiva.id);
      setModalAtendimento(null);
    } catch (err: any) {
      setIaResposta('Erro ao marcar reavaliação.');
    } finally {
      setIaLoading(false);
    }
  };

  console.log('DEBUG atendimentos para render:', atendimentos);
  console.log('DEBUG FINAL atendimentosHook antes do render:', atendimentosHook);
  // Filtros das abas
  // Atendimentos Ativos: status em_andamento ou reavaliacao
  const atendimentosAtivos = atendimentos.filter(a => a.status === 'em_andamento' || a.status === 'reavaliacao' || a.status === 'primeiro_atendimento');
  // Reavaliações: status reavaliacao
  const reavaliacoesAba = atendimentos.filter(a => a.status === 'reavaliacao');
  // Finalizados: status finalizado
  const finalizadosAba = atendimentos.filter(a => a.status === 'finalizado');
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏥 Plantão Ativo
            </h1>
            <p className="text-gray-600">
              Gestão de atendimentos em tempo real
            </p>
          </div>
          {/* Status da sessão */}
          {sessaoAtiva && sessaoAtiva.status === 'ativa' && (
            <Card className="bg-green-50 order-green-20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold text-green-800">
                      Sessão Ativa
                    </p>
                    <p className="text-sm text-green-600">
                      {sessaoAtiva.local_trabalho} - {sessaoAtiva.turno}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Botão para iniciar plantão se não houver sessão ativa */}
          {!sessaoAtiva && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowPlantaoModal(true)}>
              Iniciar Plantão
            </Button>
          )}
        </div>
      </div>
      {/* Modal para iniciar plantão */}
      <Dialog open={showPlantaoModal} onOpenChange={setShowPlantaoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Plantão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Local de Trabalho</Label>
              <Input value={novoPlantao.local_trabalho} onChange={e => setNovoPlantao(p => ({ ...p, local_trabalho: e.target.value }))} />
            </div>
            <div>
              <Label>Turno</Label>
              <Select value={novoPlantao.turno} onValueChange={v => setNovoPlantao(p => ({ ...p, turno: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manhã">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleIniciarPlantao} className="bg-blue-600 hover:bg-blue-700 w-full">Iniciar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Cards de Resumo */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Atendimentos Hoje */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Atendimentos</p>
                  <p className="text-2xl font-bold text-blue-600">{atendimentos.length}</p>
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
                  <p className="text-2xl font-bold text-orange-600">{reavaliacoes.length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          {/* Em Andamento */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-yellow-600">{atendimentos.filter(a => a.status === 'primeiro_atendimento').length}</p>
                </div>
                <Activity className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          {/* Reavaliados */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reavaliados</p>
                  <p className="text-2xl font-bold text-purple-600">{atendimentos.filter(a => a.status === 'reavaliado').length}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Abas Principais */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger
              value="novo-atendimento"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Novo Atendimento</span>
            </TabsTrigger>
            <TabsTrigger
              value="atendimentos-ativos"
              className="flex items-center space-x-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <Activity className="h-4 w-4" />
              <span>Atendimentos Ativos</span>
            </TabsTrigger>
            <TabsTrigger
              value="reavaliacoes"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
            >
              <Clock className="h-4 w-4" />
              <span>Reavaliações</span>
            </TabsTrigger>
          </TabsList>
          {/* Conteúdo das Abas */}
          <div className="mt-6">
            {/* Nova Aba - Novo Atendimento */}
            <TabsContent value="novo-atendimento" className="space-y-6">
              <div className="md:grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Novo Atendimento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paciente">Nome do Paciente</Label>
                        <Input id="paciente" placeholder="Digite o nome completo" value={novoAtendimento.paciente_nome} onChange={e => setNovoAtendimento(v => ({ ...v, paciente_nome: e.target.value }))} />
                      </div>
                      <div>
                        <Label htmlFor="idade">Idade</Label>
                        <Input id="idade" type="number" placeholder="Idade" value={novoAtendimento.paciente_idade} onChange={e => setNovoAtendimento(v => ({ ...v, paciente_idade: e.target.value }))} />
                      </div>
                      <div>
                        <Label htmlFor="sexo">Sexo</Label>
                        <Select value={novoAtendimento.paciente_sexo} onValueChange={v => setNovoAtendimento(val => ({ ...val, paciente_sexo: v }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Feminino</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="queixa">Queixa Principal</Label>
                        <Textarea 
                        id="queixa" 
                        placeholder="Descreva a queixa principal do paciente"
                        rows={3}
                        value={novoAtendimento.queixa_principal}
                        onChange={e => setNovoAtendimento(v => ({ ...v, queixa_principal: e.target.value }))}
                      />
                      </div>
                    </div>
                    {/* Sinais Vitais estruturados */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <Label>PA (mmHg)</Label>
                        <div className="flex flex-row items-center space-x-2">
                          <Input type="number" min="0" placeholder="Sistólica" className="w-20" value={novoAtendimento.sinais_vitais.pa_sistolica} onChange={e => setNovoAtendimento(v => ({ ...v, sinais_vitais: { ...v.sinais_vitais, pa_sistolica: e.target.value } }))} />
                          <span className="text-lg">/</span>
                          <Input type="number" min="0" placeholder="Diastólica" className="w-20" value={novoAtendimento.sinais_vitais.pa_diastolica} onChange={e => setNovoAtendimento(v => ({ ...v, sinais_vitais: { ...v.sinais_vitais, pa_diastolica: e.target.value } }))} />
                        </div>
                      </div>
                      <div>
                        <Label>FC (bpm)</Label>
                        <Input type="number" value={novoAtendimento.sinais_vitais.fc} onChange={e => setNovoAtendimento(v => ({ ...v, sinais_vitais: { ...v.sinais_vitais, fc: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>FR (irpm)</Label>
                        <Input type="number" value={novoAtendimento.sinais_vitais.fr} onChange={e => setNovoAtendimento(v => ({ ...v, sinais_vitais: { ...v.sinais_vitais, fr: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>Temperatura (°C)</Label>
                        <Input type="number" step="0.1" value={novoAtendimento.sinais_vitais.temp} onChange={e => setNovoAtendimento(v => ({ ...v, sinais_vitais: { ...v.sinais_vitais, temp: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>Saturação O2 (%)</Label>
                        <Input type="number" value={novoAtendimento.sinais_vitais.sat_o2} onChange={e => setNovoAtendimento(v => ({ ...v, sinais_vitais: { ...v.sinais_vitais, sat_o2: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>Peso (kg)</Label>
                        <Input type="number" step="0.1" value={novoAtendimento.sinais_vitais.peso} onChange={e => setNovoAtendimento(v => ({ ...v, sinais_vitais: { ...v.sinais_vitais, peso: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>Altura (cm)</Label>
                        <Input type="number" value={novoAtendimento.sinais_vitais.altura} onChange={e => setNovoAtendimento(v => ({ ...v, sinais_vitais: { ...v.sinais_vitais, altura: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>HGT (mg/dL)</Label>
                        <Input type="number" value={novoAtendimento.sinais_vitais.hgt} onChange={e => setNovoAtendimento(v => ({ ...v, sinais_vitais: { ...v.sinais_vitais, hgt: e.target.value } }))} />
                      </div>
                    </div>
                    {/* Campos clínicos adicionais */}
                    <div>
                      <Label>Anamnese</Label>
                      <Textarea rows={2} value={novoAtendimento.anamnese} onChange={e => setNovoAtendimento(v => ({ ...v, anamnese: e.target.value }))} />
                    </div>
                    {/* Novos campos para IA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Medicamentos em Uso</Label>
                        <Textarea rows={2} placeholder="Liste medicamentos atuais" value={novoAtendimento.medicamentos_uso} onChange={e => setNovoAtendimento(v => ({ ...v, medicamentos_uso: e.target.value }))} />
                      </div>
                      <div>
                        <Label>Alergias</Label>
                        <Textarea rows={2} placeholder="Liste alergias conhecidas" value={novoAtendimento.alergias} onChange={e => setNovoAtendimento(v => ({ ...v, alergias: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <Label>Comorbidades</Label>
                      <Textarea rows={2} placeholder="Ex: hipertensão, diabetes, asma" value={novoAtendimento.comorbidades} onChange={e => setNovoAtendimento(v => ({ ...v, comorbidades: e.target.value }))} />
                    </div>
                    {/* Hábitos */}
                    <div>
                      <Label>Hábitos</Label>
                      <Textarea rows={2} placeholder="Ex: tabagismo 1 maço/dia há 10 anos, etilismo 2 doses/dia, drogas maconha ocasional" value={novoAtendimento.habitos} onChange={e => setNovoAtendimento(v => ({ ...v, habitos: e.target.value }))} />
                    </div>
                    {/* Antecedentes familiares */}
                    <div>
                      <Label>Antecedentes Familiares</Label>
                      <Textarea rows={2} placeholder="Ex: pai infartou aos 50 anos, mãe diabetes" value={novoAtendimento.antecedentes_familiares} onChange={e => setNovoAtendimento(v => ({ ...v, antecedentes_familiares: e.target.value }))} />
                    </div>
                    {/* Caracterização da dor */}
                    <div>
                      <Label>Caracterização da Dor</Label>
                      <Textarea rows={2} placeholder="Ex: localização região precordial, tipo aperto, irradiação braço esquerdo, duração 2 horas" value={novoAtendimento.caracterizacao_dor} onChange={e => setNovoAtendimento(v => ({ ...v, caracterizacao_dor: e.target.value }))} />
                    </div>
                    {/* Sintomas associados */}
                    <div>
                      <Label>Sintomas Associados</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="tosse" checked={novoAtendimento.sintomas_associados.tosse} onChange={e => setNovoAtendimento(v => ({ ...v, sintomas_associados: { ...v.sintomas_associados, tosse: e.target.checked } }))} />
                          <Label htmlFor="tosse" className="text-sm">Tosse</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="dispneia" checked={novoAtendimento.sintomas_associados.dispneia} onChange={e => setNovoAtendimento(v => ({ ...v, sintomas_associados: { ...v.sintomas_associados, dispneia: e.target.checked } }))} />
                          <Label htmlFor="dispneia" className="text-sm">Dispneia</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="sudorese" checked={novoAtendimento.sintomas_associados.sudorese} onChange={e => setNovoAtendimento(v => ({ ...v, sintomas_associados: { ...v.sintomas_associados, sudorese: e.target.checked } }))} />
                          <Label htmlFor="sudorese" className="text-sm">Sudorese</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="nauseas" checked={novoAtendimento.sintomas_associados.nauseas} onChange={e => setNovoAtendimento(v => ({ ...v, sintomas_associados: { ...v.sintomas_associados, nauseas: e.target.checked } }))} />
                          <Label htmlFor="nauseas" className="text-sm">Náuseas</Label>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Input placeholder="Outros sintomas" value={novoAtendimento.sintomas_associados.outros} onChange={e => setNovoAtendimento(v => ({ ...v, sintomas_associados: { ...v.sintomas_associados, outros: e.target.value } }))} />
                      </div>
                    </div>
                    {/* Exame físico estruturado */}
                    <div>
                      <Label>Exame Físico Estruturado</Label>
                      <Textarea rows={3} placeholder="Ex: Estado geral: regular. Cardiovascular: ritmo regular, sem sopros. Respiratório: MV presente, sem roncos. Abdominal: flácido, sem dor. Neurológico: consciência preservada" value={novoAtendimento.exame_fisico_estruturado} onChange={e => setNovoAtendimento(v => ({ ...v, exame_fisico_estruturado: e.target.value }))} />
                    </div>
                    {/* Botão IA e sugestão */}
                    <div className="flex flex-col space-y-2">
                      <Button className="bg-blue-600 hover:bg-blue-700 w-full" onClick={handleIANovoAtendimento} disabled={iaLoadingNovo}>Gerar sugestão com IA</Button>
                      {iaSugestaoNovo && (
                        <div className="mt-2 p-3 bg-blue-50 rounded text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: `<b>Sugestão da IA:</b><br />` + iaSugestaoNovo.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      )}
                      {/* Campo Conduta Inicial movido para cá */}
                      <div>
                        <Label>Conduta Inicial</Label>
                        <Textarea rows={2} value={novoAtendimento.conduta_inicial} onChange={e => setNovoAtendimento(v => ({ ...v, conduta_inicial: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleNovoAtendimento} disabled={loading || loadingHook}>
                        <Plus className="h-4 w-4 mr-2" /> Iniciar Atendimento
                      </Button>
                      <Button variant="outline" disabled>
                        <FileText className="h-4 w-4 mr-2" /> Salvar Rascunho
                      </Button>
                    </div>
                    {novoAtendimentoErro && <div className="text-red-600 text-sm mt-2">{novoAtendimentoErro}</div>}
                    {novoAtendimentoSucesso && <div className="text-green-600 text-sm mt-2">{novoAtendimentoSucesso}</div>}
                  </CardContent>
                </Card>
                {/* Painel Calculadora Automática à direita */}
                <div className="mt-6 md:mt-0">
                  <CalculadoraAutomaticaPlantonista
                    sinaisVitais={novoAtendimento.sinais_vitais}
                    idade={novoAtendimento.paciente_idade}
                    sexo={novoAtendimento.paciente_sexo}
                    peso={novoAtendimento.sinais_vitais.peso}
                    altura={novoAtendimento.sinais_vitais.altura}
                    editFields={novoAtendimento}
                    setEditFields={setNovoAtendimento}
                  />
                </div>
              </div>
            </TabsContent>
            {/* Aba - Atendimentos Ativos */}
            <TabsContent value="atendimentos-ativos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Atendimentos em Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {atendimentosAtivos.map((atendimento) => (
                      <div key={atendimento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col">
                            <h3 className="font-semibold text-gray-900">{atendimento.paciente_nome}</h3>
                            <p className="text-sm text-gray-600">{atendimento.paciente_idade} anos - {atendimento.queixa_principal}</p>
                            <p className="text-xs text-gray-500">Início: {new Date(atendimento.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={
                              atendimento.status === 'primeiro_atendimento' || atendimento.status === 'em_andamento' ? 'default' :
                              atendimento.status === 'reavaliacao' ? 'secondary' :
                              atendimento.status === 'finalizado' ? 'outline' : 'outline'
                            }
                          >
                            {atendimento.status === 'primeiro_atendimento' || atendimento.status === 'em_andamento' ? 'Em Andamento' :
                             atendimento.status === 'reavaliacao' ? 'Reavaliação' :
                             atendimento.status === 'finalizado' ? 'Finalizado' : atendimento.status}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => { setModalAtendimento(atendimento); setIaResposta(null); }}>
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Aba - Reavaliações */}
            <TabsContent value="reavaliacoes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reavaliações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reavaliacoesAba.map((atendimento) => (
                      <div key={atendimento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col">
                            <h3 className="font-semibold text-gray-900">{atendimento.paciente_nome}</h3>
                            <p className="text-sm text-gray-600">{atendimento.paciente_idade} anos - {atendimento.queixa_principal}</p>
                            <p className="text-xs text-gray-500">Início: {new Date(atendimento.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Reavaliação</Badge>
                          <Button size="sm" variant="outline" onClick={() => { setModalAtendimento(atendimento); setIaResposta(null); }}>
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
      {/* Modal de Detalhes do Atendimento */}
      <Dialog open={!!modalAtendimento} onOpenChange={open => { if (!open) setModalAtendimento(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Atendimento</DialogTitle>
          </DialogHeader>
          <div className="md:grid md:grid-cols-2 gap-6">
            <div>
              {modalAtendimento && (
                <div className="space-y-4">
                  {/* Header fixo com informações principais */}
                  <div className="mb-2 p-2 rounded bg-gray-50 border flex flex-wrap gap-4 items-center text-sm">
                    <div><b>Paciente:</b> {modalAtendimento.paciente_nome}</div>
                    <div><b>Idade:</b> {modalAtendimento.paciente_idade}</div>
                    <div><b>Sexo:</b> {modalAtendimento.paciente_sexo}</div>
                    <div><b>Status:</b> {modalAtendimento.status === 'primeiro_atendimento' ? 'Em Andamento' : modalAtendimento.status === 'reavaliado' ? 'Reavaliado' : modalAtendimento.status === 'finalizado' ? 'Finalizado' : modalAtendimento.status}</div>
                    <div><b>Início:</b> {new Date(modalAtendimento.created_at).toLocaleString()}</div>
                  </div>
                  {/* Seção: Dados Iniciais (read-only) - agora com Accordions compactos */}
                  <Accordion type="multiple" defaultValue={["queixa"]} className="mb-2">
                    <AccordionItem value="queixa">
                      <AccordionTrigger className="text-xs py-2">Queixa Principal</AccordionTrigger>
                      <AccordionContent className="text-xs leading-tight p-2">{modalAtendimento.queixa_principal || '-'}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="anamnese">
                      <AccordionTrigger className="text-xs py-2">Anamnese Inicial</AccordionTrigger>
                      <AccordionContent className="text-xs leading-tight p-2">
                        <Textarea rows={2} value={modalAtendimento.anamnese?.texto || ''} readOnly disabled className="text-xs min-h-[32px]" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="sinais_vitais">
                      <AccordionTrigger className="text-xs py-2">Sinais Vitais Iniciais</AccordionTrigger>
                      <AccordionContent className="text-xs leading-tight p-2">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className="col-span-2">
                            <Label className="text-xs">PA (mmHg)</Label>
                            <div className="flex flex-row items-center space-x-1">
                              <Input type="number" min="0" placeholder="Sistólica" className="w-16 text-xs" value={modalAtendimento.sinais_vitais?.pa_sistolica ?? ''} readOnly disabled />
                              <span className="text-xs">/</span>
                              <Input type="number" min="0" placeholder="Diastólica" className="w-16 text-xs" value={modalAtendimento.sinais_vitais?.pa_diastolica ?? ''} readOnly disabled />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">FC (bpm)</Label>
                            <Input type="number" value={modalAtendimento.sinais_vitais?.fc ?? ''} readOnly disabled className="text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">FR (irpm)</Label>
                            <Input type="number" value={modalAtendimento.sinais_vitais?.fr ?? ''} readOnly disabled className="text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">Temperatura (°C)</Label>
                            <Input type="number" step="0.1" value={modalAtendimento.sinais_vitais?.temp ?? ''} readOnly disabled className="text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">Saturação O2 (%)</Label>
                            <Input type="number" value={modalAtendimento.sinais_vitais?.sat_o2 ?? ''} readOnly disabled className="text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">Peso (kg)</Label>
                            <Input type="number" step="0.1" value={modalAtendimento.sinais_vitais?.peso ?? ''} readOnly disabled className="text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">Altura (cm)</Label>
                            <Input type="number" value={modalAtendimento.sinais_vitais?.altura ?? ''} readOnly disabled className="text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">HGT (mg/dL)</Label>
                            <Input type="number" value={modalAtendimento.sinais_vitais?.hgt ?? ''} readOnly disabled className="text-xs" />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="exame_fisico_estruturado">
                      <AccordionTrigger className="text-xs py-2">Exame Físico Estruturado</AccordionTrigger>
                      <AccordionContent className="text-xs leading-tight p-2">
                        <Textarea rows={3} value={modalAtendimento.exame_fisico_estruturado || ''} readOnly disabled className="text-xs min-h-[32px]" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="conduta_inicial">
                      <AccordionTrigger className="text-xs py-2">Conduta Inicial</AccordionTrigger>
                      <AccordionContent className="text-xs leading-tight p-2">
                        <Textarea rows={2} value={modalAtendimento.conduta_inicial?.texto || ''} readOnly disabled className="text-xs min-h-[32px]" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="medicamentos_uso">
                      <AccordionTrigger className="text-xs py-2">Medicamentos em Uso</AccordionTrigger>
                      <AccordionContent className="text-xs leading-tight p-2">
                        <Textarea rows={2} value={modalAtendimento.medicamentos_uso || ''} readOnly disabled className="text-xs min-h-[32px]" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="alergias">
                      <AccordionTrigger className="text-xs py-2">Alergias</AccordionTrigger>
                      <AccordionContent className="text-xs leading-tight p-2">
                        <Textarea rows={2} value={modalAtendimento.alergias || ''} readOnly disabled className="text-xs min-h-[32px]" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="comorbidades">
                      <AccordionTrigger className="text-xs py-2">Comorbidades</AccordionTrigger>
                      <AccordionContent className="text-xs leading-tight p-2">
                        <Textarea rows={2} value={modalAtendimento.comorbidades || ''} readOnly disabled className="text-xs min-h-[32px]" />
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="habitos">
                      <AccordionTrigger className="text-xs py-2">Hábitos</AccordionTrigger>
                      <AccordionContent className="text-xs leading-tight p-2">
                        <Textarea rows={2} value={modalAtendimento.habitos || ''} readOnly disabled className="text-xs min-h-[32px]" />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  {/* Seção: Histórico de Reavaliações anteriores (read-only) */}
                  {modalAtendimento.reavaliacoes && modalAtendimento.reavaliacoes.length > 0 && (
                    <div className="border-b pb-2 mb-2">
                      <Label>Reavaliações Anteriores</Label>
                      <div className="space-y-2 mt-2">
                        {modalAtendimento.reavaliacoes.map((reav, idx) => (
                          <div key={reav.id || idx} className="p-2 bg-gray-100 rounded">
                            <div className="text-xs text-gray-500 mb-1">{reav.created_at ? new Date(reav.created_at).toLocaleString() : ''}</div>
                            <div><b>Evolução:</b> <span className="whitespace-pre-line">{reav.evolucao || '-'}</span></div>
                            {reav.resultados_exames && <div><b>Resultados de Exames:</b> <span className="whitespace-pre-line">{reav.resultados_exames}</span></div>}
                            {reav.sinais_vitais && (
                              <div><b>Sinais Vitais:</b> {Object.entries(reav.sinais_vitais).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                            )}
                            <div><b>Conduta Final:</b> <span className="whitespace-pre-line">{reav.conduta_final || '-'}</span></div>
                            <div><b>Diagnóstico Final:</b> <span className="whitespace-pre-line">{reav.diagnostico_final || '-'}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Seção: Nova Reavaliação */}
                  <div className="space-y-2">
                    <Label>Evolução</Label>
                    <Textarea rows={2} value={editFields.evolucao} onChange={e => setEditFields(f => ({ ...f, evolucao: e.target.value }))} required />
                    <Label>Resultados de Exames</Label>
                    <Textarea rows={2} value={editFields.resultados_exames} onChange={e => setEditFields(f => ({ ...f, resultados_exames: e.target.value }))} />
                    <Label>Sinais Vitais (opcional)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <Label>PA (mmHg)</Label>
                        <div className="flex flex-row items-center space-x-2">
                          <Input type="number" min="0" placeholder="Sistólica" className="w-20" value={editFields.sinais_vitais?.pa_sistolica ?? ''} onChange={e => setEditFields(f => ({ ...f, sinais_vitais: { ...f.sinais_vitais, pa_sistolica: e.target.value } }))} />
                          <span className="text-lg">/</span>
                          <Input type="number" min="0" placeholder="Diastólica" className="w-20" value={editFields.sinais_vitais?.pa_diastolica ?? ''} onChange={e => setEditFields(f => ({ ...f, sinais_vitais: { ...f.sinais_vitais, pa_diastolica: e.target.value } }))} />
                        </div>
                      </div>
                      <div>
                        <Label>FC (bpm)</Label>
                        <Input type="number" value={editFields.sinais_vitais?.fc ?? ''} onChange={e => setEditFields(f => ({ ...f, sinais_vitais: { ...f.sinais_vitais, fc: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>FR (irpm)</Label>
                        <Input type="number" value={editFields.sinais_vitais?.fr ?? ''} onChange={e => setEditFields(f => ({ ...f, sinais_vitais: { ...f.sinais_vitais, fr: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>Temperatura (°C)</Label>
                        <Input type="number" step="0.1" value={editFields.sinais_vitais?.temp ?? ''} onChange={e => setEditFields(f => ({ ...f, sinais_vitais: { ...f.sinais_vitais, temp: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>Saturação O2 (%)</Label>
                        <Input type="number" value={editFields.sinais_vitais?.sat_o2 ?? ''} onChange={e => setEditFields(f => ({ ...f, sinais_vitais: { ...f.sinais_vitais, sat_o2: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>Peso (kg)</Label>
                        <Input type="number" step="0.1" value={editFields.sinais_vitais?.peso ?? ''} onChange={e => setEditFields(f => ({ ...f, sinais_vitais: { ...f.sinais_vitais, peso: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>Altura (cm)</Label>
                        <Input type="number" value={editFields.sinais_vitais?.altura ?? ''} onChange={e => setEditFields(f => ({ ...f, sinais_vitais: { ...f.sinais_vitais, altura: e.target.value } }))} />
                      </div>
                      <div>
                        <Label>HGT (mg/dL)</Label>
                        <Input type="number" value={editFields.sinais_vitais?.hgt ?? ''} onChange={e => setEditFields(f => ({ ...f, sinais_vitais: { ...f.sinais_vitais, hgt: e.target.value } }))} />
                      </div>
                    </div>
                    <Label>Conduta Final</Label>
                    <Textarea rows={2} value={editFields.conduta_final} onChange={e => setEditFields(f => ({ ...f, conduta_final: e.target.value }))} required />
                    <Label>Diagnóstico Final</Label>
                    <Textarea rows={2} value={editFields.diagnostico_final} onChange={e => setEditFields(f => ({ ...f, diagnostico_final: e.target.value }))} required />
                    <div className="flex space-x-2 mt-2">
                      <Button onClick={handleSalvarEdicao} disabled={iaLoading} className="bg-green-600 hover:bg-green-700 w-full">Salvar Reavaliação</Button>
                      <Button onClick={handleIA} disabled={iaLoading} className="bg-blue-600 hover:bg-blue-700 w-full">{iaLoading ? 'Consultando IA...' : 'Sugerir conduta com IA'}</Button>
                    </div>
                    {iaResposta && (
                      <div className="mt-4 p-3 bg-blue-50 rounded text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: `<b>Sugestão da IA:</b><br />` + iaResposta.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    )}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setModalAtendimento(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </div>
            {/* Painel Calculadora Automática à direita */}
            <div>
              {modalAtendimento && (
                <CalculadoraAutomaticaPlantonista
                  sinaisVitais={editFields.sinais_vitais}
                  idade={modalAtendimento.paciente_idade}
                  sexo={modalAtendimento.paciente_sexo}
                  peso={editFields.sinais_vitais?.peso ?? ''}
                  altura={editFields.sinais_vitais?.altura ?? ''}
                  editFields={editFields}
                  setEditFields={setEditFields}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}
    </div>
  );
};

export default AtendimentoAtivo; 