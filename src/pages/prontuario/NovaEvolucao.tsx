import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePacientes } from "@/hooks/usePacientes";
import { useProntuarios } from "@/hooks/useProntuarios";
import { useConsultationState } from "@/hooks/useConsultationState";
import { formatarTelefone } from "@/lib/formatters";
import { ArrowLeft, User, Save, Pill, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MedicalLayout } from "@/components/medical/MedicalLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Medicamento {
  nome: string;
  dosagem: string;
  quantidade: string;
  frequencia: string;
  tempoUso: string;
}



const NovaEvolucao = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pacientes, loading: loadingPacientes, atualizarPaciente } = usePacientes();
  const { criarProntuario } = useProntuarios();
  const {
    hasActiveConsultation,
    elapsedTime,
    formattedElapsedTime,
    saveConsultationState,
    updateConsultationState,
    clearConsultationState,
    getConsultationState
  } = useConsultationState(id);
  
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const [showResumeAlert, setShowResumeAlert] = useState(false);
  const [currentProntuarioId, setCurrentProntuarioId] = useState<string | undefined>();
  const [pacienteFromDB, setPacienteFromDB] = useState<any>(null);
  const [fetchingPatient, setFetchingPatient] = useState(false);
  const [hasAttemptedDirectFetch, setHasAttemptedDirectFetch] = useState(false);
  const [prontuarioData, setProntuarioData] = useState({
    queixa_principal: '',
    historia_doenca_atual: '',
    exame_fisico: '',
    hipotese_diagnostica: '',
    conduta: '',
    observacoes: ''
  });
  const [antecedentes, setAntecedentes] = useState({
    clinicos: "",
    cirurgicos: "",
    familiares: "",
    habitos: "",
    alergias: "",
    medicamentos: ""
  });
  const [modalAberto, setModalAberto] = useState<null | keyof typeof antecedentes>(null);
  const [campoTemp, setCampoTemp] = useState("");
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [modalMedicamentosAberto, setModalMedicamentosAberto] = useState(false);
  const [novoMedicamento, setNovoMedicamento] = useState<Medicamento>({
    nome: "",
    dosagem: "",
    quantidade: "",
    frequencia: "",
    tempoUso: ""
  });



  // Debug logs para estados (apenas quando necessário)
  if (process.env.NODE_ENV === 'development') {
    console.log('NovaEvolucao - Estado atual dos antecedentes:', antecedentes);
    console.log('NovaEvolucao - Estado atual dos medicamentos:', medicamentos);
    console.log('NovaEvolucao - isConsultationActive:', isConsultationActive);
  }

  const paciente = pacientes.find(p => p.id === id) || pacienteFromDB;
  if (process.env.NODE_ENV === 'development') {
    console.log('NovaEvolucao - Found paciente:', paciente);
  }



  useEffect(() => {
    console.log('NovaEvolucao - useEffect triggered:', { loadingPacientes, paciente: !!paciente, id, fetchingPatient, pacientesCount: pacientes.length, hasAttemptedDirectFetch });
    
    // If we're still loading pacientes, wait
    if (loadingPacientes) {
      console.log('NovaEvolucao - Still loading pacientes, waiting...');
      return;
    }
    
    // If we have pacientes loaded but no match found, and we're not already fetching directly
    if (pacientes.length > 0 && !paciente && id && !fetchingPatient && !hasAttemptedDirectFetch) {
      console.log('NovaEvolucao - Pacientes loaded but patient not found in list, attempting direct fetch');
      setFetchingPatient(true);
      setHasAttemptedDirectFetch(true);
      
      const fetchPatientDirectly = async () => {
        try {
          console.log('NovaEvolucao - Fetching patient directly with ID:', id);
          const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            console.error('NovaEvolucao - Direct fetch error:', error);
            throw error;
          }
          
          if (data) {
            console.log('NovaEvolucao - Found patient directly:', data);
            setPacienteFromDB(data);
            setFetchingPatient(false);
            return;
          }
          
          // If we get here, no patient was found
          throw new Error('Patient not found');
        } catch (error) {
          console.error('NovaEvolucao - Failed to fetch patient directly:', error);
          setFetchingPatient(false);
          toast({
            title: "Paciente não encontrado",
            description: "O paciente selecionado não foi encontrado.",
            variant: "destructive"
          });
          navigate('/prontuario');
        }
      };
      
      fetchPatientDirectly();
    }
    
    // If we have no pacientes loaded and we're not loading, try direct fetch as fallback
    if (pacientes.length === 0 && !loadingPacientes && id && !fetchingPatient && !pacienteFromDB && !hasAttemptedDirectFetch) {
      console.log('NovaEvolucao - No pacientes loaded and not loading, attempting direct fetch as fallback');
      setFetchingPatient(true);
      setHasAttemptedDirectFetch(true);
      
      const fetchPatientDirectly = async () => {
        try {
          console.log('NovaEvolucao - Fetching patient directly with ID (fallback):', id);
          const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            console.error('NovaEvolucao - Direct fetch error (fallback):', error);
            throw error;
          }
          
          if (data) {
            console.log('NovaEvolucao - Found patient directly (fallback):', data);
            setPacienteFromDB(data);
            setFetchingPatient(false);
            return;
          }
          
          // If we get here, no patient was found
          throw new Error('Patient not found');
        } catch (error) {
          console.error('NovaEvolucao - Failed to fetch patient directly (fallback):', error);
          setFetchingPatient(false);
          toast({
            title: "Paciente não encontrado",
            description: "O paciente selecionado não foi encontrado.",
            variant: "destructive"
          });
          navigate('/prontuario');
        }
      };
      
      fetchPatientDirectly();
    }
  }, [paciente, loadingPacientes, navigate, toast, id, fetchingPatient, pacientes.length, pacienteFromDB, hasAttemptedDirectFetch]);

  useEffect(() => {
    if (!id) {
      toast({
        title: "ID do paciente não fornecido",
        description: "É necessário selecionar um paciente para criar uma evolução.",
        variant: "destructive"
      });
      navigate('/prontuario');
    }
  }, [id, navigate, toast]);

  // Verificar se há uma consulta ativa persistida
  useEffect(() => {
    if (paciente && hasActiveConsultation && !isConsultationActive) {
      setShowResumeAlert(true);
    }
  }, [paciente, hasActiveConsultation, isConsultationActive]);

  // Carregar dados dos antecedentes e medicamentos quando o paciente for encontrado (apenas uma vez)
  useEffect(() => {
    console.log('NovaEvolucao - useEffect carregar dados executado:', { 
      paciente: !!paciente, 
      isConsultationActive, 
      timestamp: new Date().toISOString() 
    });
    
    if (paciente && !isConsultationActive) {
      console.log('NovaEvolucao - Carregando dados do paciente:', paciente);
      console.log('NovaEvolucao - Antecedentes do paciente:', {
        clinicos: paciente.antecedentes_clinicos,
        cirurgicos: paciente.antecedentes_cirurgicos,
        familiares: paciente.antecedentes_familiares,
        habitos: paciente.antecedentes_habitos,
        alergias: paciente.antecedentes_alergias
      });
      console.log('NovaEvolucao - Medicamentos do paciente:', paciente.medicamentos_em_uso);
      
      // Carregar antecedentes apenas se ainda não foram carregados
      const novosAntecedentes = {
        clinicos: paciente.antecedentes_clinicos || "",
        cirurgicos: paciente.antecedentes_cirurgicos || "",
        familiares: paciente.antecedentes_familiares || "",
        habitos: paciente.antecedentes_habitos || "",
        alergias: paciente.antecedentes_alergias || "",
        medicamentos: ""
      };
      
      console.log('NovaEvolucao - Definindo antecedentes:', novosAntecedentes);
      setAntecedentes(novosAntecedentes);

      // Carregar medicamentos apenas se ainda não foram carregados
      if (paciente.medicamentos_em_uso && Array.isArray(paciente.medicamentos_em_uso)) {
        console.log('NovaEvolucao - Medicamentos carregados:', paciente.medicamentos_em_uso);
        setMedicamentos(paciente.medicamentos_em_uso);
      } else {
        console.log('NovaEvolucao - Nega medicamento encontrado ou formato inválido:', paciente.medicamentos_em_uso);
        setMedicamentos([]);
      }
    }
  }, [paciente, isConsultationActive]);





  const handleStartConsultation = () => {
    setIsConsultationActive(true);
    setShowResumeAlert(false);
    
    // Salvar estado inicial da consulta
    saveConsultationState({
      antecedentes,
      medicamentos,
      prontuarioData
    });
  };

  const handleResumeConsultation = () => {
    const savedState = getConsultationState();
    if (savedState) {
      setAntecedentes(savedState.antecedentes);
      setMedicamentos(savedState.medicamentos);
      setProntuarioData(savedState.prontuarioData);
      setIsConsultationActive(true);
      setShowResumeAlert(false);
    }
  };

  const handleDiscardConsultation = () => {
    clearConsultationState();
    setShowResumeAlert(false);
  };

  const handleFinishConsultation = async () => {
    console.log('handleFinishConsultation chamado');
    if (!paciente) {
      console.log('Paciente não encontrado, abortando update');
      return;
    }
    console.log('Vai atualizar paciente:', paciente.id, {
      antecedentes_clinicos: antecedentes.clinicos,
      antecedentes_cirurgicos: antecedentes.cirurgicos,
      antecedentes_familiares: antecedentes.familiares,
      antecedentes_habitos: antecedentes.habitos,
      antecedentes_alergias: antecedentes.alergias,
      medicamentos_em_uso: medicamentos
    });
    try {
      // Atualizar antecedentes e medicamentos no paciente
      await atualizarPaciente(paciente.id, {
        antecedentes_clinicos: antecedentes.clinicos,
        antecedentes_cirurgicos: antecedentes.cirurgicos,
        antecedentes_familiares: antecedentes.familiares,
        antecedentes_habitos: antecedentes.habitos,
        antecedentes_alergias: antecedentes.alergias,
        medicamentos_em_uso: medicamentos // será salvo como JSON
      });

      const novoProntuario = await criarProntuario({
        paciente_id: paciente.id,
        data_atendimento: new Date().toISOString(),
        ...prontuarioData
      });

      toast({
        title: "Evolução salva com sucesso",
        description: "A evolução médica e os antecedentes foram registrados no prontuário do paciente."
      });

      // Limpar estado da consulta após finalizar
      clearConsultationState();
      navigate(`/prontuario/paciente/${paciente.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar evolução",
        description: error.message || "Ocorreu um erro ao salvar a evolução ou antecedentes.",
        variant: "destructive"
      });
    }
    setIsConsultationActive(false);
  };

  // Atualizar estado persistente quando os dados mudam
  useEffect(() => {
    if (isConsultationActive) {
      updateConsultationState({
        antecedentes,
        medicamentos,
        prontuarioData
      });
    }
  }, [antecedentes, medicamentos, prontuarioData, isConsultationActive]);

  // Cálculo da idade para visualização e para patientData
  const calcularIdadeObj = (dataNasc?: string) => {
    if (!dataNasc) return { anos: 0, meses: 0, dias: 0 };
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let anos = hoje.getFullYear() - nasc.getFullYear();
    let meses = hoje.getMonth() - nasc.getMonth();
    let dias = hoje.getDate() - nasc.getDate();
    if (dias < 0) {
      meses--;
      dias += new Date(hoje.getFullYear(), hoje.getMonth(), 0).getDate();
    }
    if (meses < 0) {
      anos--;
      meses += 12;
    }
    return { anos, meses, dias };
  };
  const calcularIdadeStr = (dataNasc?: string) => {
    const idade = calcularIdadeObj(dataNasc);
    if (!dataNasc) return "-";
    const partes = [];
    if (idade.anos > 0) partes.push(`${idade.anos} ano${idade.anos > 1 ? 's' : ''}`);
    if (idade.meses > 0) partes.push(`${idade.meses} mes${idade.meses > 1 ? 'es' : ''}`);
    if (idade.dias > 0) partes.push(`${idade.dias} dia${idade.dias > 1 ? 's' : ''}`);
    return partes.length ? partes.join(' ') : '0 dia';
  };

  // Exemplo fictício de última consulta (substitua por real se disponível)
  const ultimaConsulta = paciente?.ultima_consulta || null;

  // Show loading spinner while either loading from usePacientes or fetching directly
  if (loadingPacientes || fetchingPatient) {
    console.log('NovaEvolucao - Showing loading state:', { loadingPacientes, fetchingPatient });
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando dados do paciente...</span>
      </div>
    );
  }

  // Only show error if we're not loading anything and have attempted all fetch methods
  if (!paciente && !loadingPacientes && !fetchingPatient && hasAttemptedDirectFetch) {
    console.log('NovaEvolucao - No patient found after all attempts');
    return null;
  }

  // If we don't have a patient yet but haven't attempted direct fetch, show loading
  if (!paciente) {
    console.log('NovaEvolucao - Patient not loaded yet, showing loading state');
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando dados do paciente...</span>
      </div>
    );
  }

  // Create patient data from real patient information
  const patientData = {
    nome: paciente.nome,
    idade: calcularIdadeObj(paciente.data_nascimento),
    convenio: paciente.convenio || "Particular",
    primeiraConsulta: new Date().toLocaleDateString('pt-BR'),
    antecedentes: {
      clinicos: paciente.antecedentes_clinicos || null,
      cirurgicos: paciente.antecedentes_cirurgicos || null,
      familiares: paciente.antecedentes_familiares || null,
      habitos: paciente.antecedentes_habitos || null,
      alergias: paciente.antecedentes_alergias || null,
      medicamentos: paciente.medicamentos_em_uso && Array.isArray(paciente.medicamentos_em_uso) 
        ? paciente.medicamentos_em_uso.map(med => {
            const partes = [];
            if (med.nome) partes.push(med.nome);
            if (med.dosagem) partes.push(med.dosagem);
            if (med.quantidade && med.frequencia) {
              partes.push('-', med.quantidade, med.frequencia);
            } else if (med.quantidade) {
              partes.push('-', med.quantidade);
            } else if (med.frequencia) {
              partes.push('-', med.frequencia);
            }
            if (med.tempoUso) partes.push('por', med.tempoUso);
            return partes.join(' ');
          }).join('\n')
        : null
    },
    ultimosDiagnosticos: []
  };

  return (
    <div>
      {/* Removido botão nativo de teste */}
      {!isConsultationActive ? (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/prontuario')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nova Evolução</h1>
              <p className="text-muted-foreground text-sm sm:text-base break-words">
                Registrar nova evolução para {paciente.nome}
              </p>
            </div>
          </div>

          {/* Alerta de consulta em andamento */}
          {showResumeAlert && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <strong>Consulta em andamento!</strong> Você tem uma consulta não finalizada para este paciente.
                    <div className="text-sm mt-1">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Tempo decorrido: {formattedElapsedTime}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleResumeConsultation}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Continuar Consulta
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleDiscardConsultation}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Descartar
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Informações básicas do paciente */}
          <Card className="mb-4">
            <CardContent className="p-4 sm:p-6">
              <div className="font-bold text-lg sm:text-xl truncate mb-2">{paciente.nome}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-muted-foreground text-sm">
                <span><strong>Idade:</strong> {calcularIdadeStr(paciente.data_nascimento)}</span>
                <span><strong>Convênio:</strong> {paciente.convenio || "Particular"}</span>
                {paciente.telefone && <span><strong>Telefone:</strong> {formatarTelefone(paciente.telefone)}</span>}
                {paciente.email && <span><strong>E-mail:</strong> {paciente.email}</span>}
                {ultimaConsulta && <span><strong>Última consulta:</strong> {new Date(ultimaConsulta).toLocaleDateString("pt-BR")}</span>}
              </div>
            </CardContent>
          </Card>

          {/* Antecedentes em 6 cards separados, grid 3x2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
            {[
              { key: "clinicos", label: "História Patológica Pregressa (HPP)" },
              { key: "cirurgicos", label: "Antec. Cirúrgicos" },
              { key: "familiares", label: "História Familiar (HF)" },
              { key: "habitos", label: "Hábitos de Vida" },
              { key: "alergias", label: "Alergias e Reações Adversas" },
              { key: "medicamentos", label: "Med. em uso", isMedicamentos: true },
            ].map(({ key, label, isMedicamentos }) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col gap-2">
                  {isMedicamentos ? (
                    <>
                      <div className="text-muted-foreground text-sm min-h-[32px]">
                        {medicamentos.length === 0 ? (
                          "Nenhum medicamento informado"
                        ) : (
                          <ul className="list-disc pl-4">
                            {medicamentos.slice(0, 3).map((med, idx) => (
                              <li key={idx} className="mb-1">
                                <span className="font-medium">{med.nome}</span> {med.dosagem && `- ${med.dosagem}`} {med.quantidade && `- ${med.quantidade}`} {med.frequencia && `- ${med.frequencia}`} {med.tempoUso && `- ${med.tempoUso}`}
                              </li>
                            ))}
                            {medicamentos.length > 3 && (
                              <li className="text-blue-600 cursor-pointer" onClick={() => setModalMedicamentosAberto(true)}>
                                Ver mais ({medicamentos.length})
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={modalMedicamentosAberto} onOpenChange={setModalMedicamentosAberto}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                              setNovoMedicamento({ nome: "", dosagem: "", quantidade: "", frequencia: "", tempoUso: "" });
                            }}>
                              {medicamentos.length === 0 ? "Inserir informação" : "Editar"}
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Medicamentos em uso</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Lista de medicamentos já adicionados */}
                            {medicamentos.length > 0 && (
                              <div className="mb-2 space-y-2">
                                {medicamentos.map((med, idx) => (
                                  <div key={idx} className="flex items-center gap-2 border-b pb-1">
                                    <Pill className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{med.nome}</span>
                                    <span className="text-muted-foreground text-sm">{med.dosagem} - {med.quantidade} - {med.frequencia} - {med.tempoUso}</span>
                                    <Button variant="ghost" size="icon" onClick={() => setMedicamentos(medicamentos.filter((_, i) => i !== idx))}>
                                      ×
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* Formulário de novo medicamento em linha */}
                            <div className="flex flex-wrap gap-2 items-end">
                              <div className="flex flex-col">
                                <label className="text-xs font-medium mb-0.5">Nome</label>
                                <Input
                                  placeholder="Losartana, AAS..."
                                  value={novoMedicamento.nome}
                                  onChange={e => setNovoMedicamento({ ...novoMedicamento, nome: e.target.value })}
                                  className="min-w-[120px]"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-medium mb-0.5">Dosagem</label>
                                <Input
                                  placeholder="50mg, 100mg..."
                                  value={novoMedicamento.dosagem}
                                  onChange={e => setNovoMedicamento({ ...novoMedicamento, dosagem: e.target.value })}
                                  className="min-w-[90px]"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-medium mb-0.5">Qtd.</label>
                                <Input
                                  placeholder="1 comp, 1 gota..."
                                  value={novoMedicamento.quantidade}
                                  onChange={e => setNovoMedicamento({ ...novoMedicamento, quantidade: e.target.value })}
                                  className="min-w-[80px]"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-medium mb-0.5">Frequência</label>
                                <Input
                                  placeholder="1x/dia, 12/12h, SOS..."
                                  value={novoMedicamento.frequencia}
                                  onChange={e => {
                                    const freq = e.target.value;
                                    setNovoMedicamento(med => ({
                                      ...med,
                                      frequencia: freq,
                                      tempoUso: freq.trim().toLowerCase() === 'sos' ? '' : med.tempoUso
                                    }));
                                  }}
                                  className="min-w-[90px]"
                                />
                              </div>
                              <div className="flex flex-col">
                                <label className="text-xs font-medium mb-0.5">Tempo de uso</label>
                                <Input
                                  placeholder="2 anos, 6 meses..."
                                  value={novoMedicamento.tempoUso}
                                  onChange={e => setNovoMedicamento({ ...novoMedicamento, tempoUso: e.target.value })}
                                  className="min-w-[90px]"
                                />
                              </div>
                              <Button
                                className="mb-1"
                                variant="default"
                                onClick={() => {
                                  if (novoMedicamento.nome) {
                                    setMedicamentos([...medicamentos, novoMedicamento]);
                                    setNovoMedicamento({ nome: "", dosagem: "", quantidade: "", frequencia: "", tempoUso: "" });
                                  }
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="default" onClick={async () => {
                                try {
                                  await atualizarPaciente(paciente.id, {
                                    medicamentos_em_uso: medicamentos
                                  });
                                  toast({ title: 'Medicamentos salvos', description: 'Informação salva com sucesso.' });
                                } catch (error: any) {
                                  toast({ title: 'Erro ao salvar', description: error.message || 'Não foi possível salvar.', variant: 'destructive' });
                                }
                                setModalMedicamentosAberto(false);
                              }}>
                                Salvar
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={async () => {
                            setMedicamentos([]);
                            try {
                              await atualizarPaciente(paciente.id, {
                                medicamentos_em_uso: []
                              });
                              toast({ title: 'Medicamentos limpos', description: 'Campo marcado como "Nenhum".' });
                            } catch (error: any) {
                              toast({ title: 'Erro ao salvar', description: error.message || 'Não foi possível salvar.', variant: 'destructive' });
                            }
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Nenhum
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground text-sm min-h-[32px]">
                        {antecedentes[key as keyof typeof antecedentes] && antecedentes[key as keyof typeof antecedentes].trim() !== "" && antecedentes[key as keyof typeof antecedentes] !== "Nega"
                          ? antecedentes[key as keyof typeof antecedentes].slice(0, 40) + (antecedentes[key as keyof typeof antecedentes].length > 40 ? "..." : "")
                          : "Nega"}
                      </span>
                      <div className="flex gap-2">
                        <Dialog open={modalAberto === key} onOpenChange={open => setModalAberto(open ? key as keyof typeof antecedentes : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => {
                              setCampoTemp(antecedentes[key as keyof typeof antecedentes] || "");
                            }}>
                              {antecedentes[key as keyof typeof antecedentes] && antecedentes[key as keyof typeof antecedentes].trim() !== "" && antecedentes[key as keyof typeof antecedentes] !== "Nega" ? "Editar" : "Inserir informação"}
                            </Button>
                          </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{label}</DialogTitle>
                          </DialogHeader>
                          <Textarea
                            value={campoTemp}
                            onChange={e => setCampoTemp(e.target.value)}
                            placeholder={`Descreva os antecedentes ${label.toLowerCase()}...`}
                            rows={5}
                          />
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="default" onClick={async () => {
                                setAntecedentes(prev => ({ ...prev, [key]: campoTemp }));
                                try {
                                  await atualizarPaciente(paciente.id, {
                                    [`antecedentes_${key}`]: campoTemp
                                  });
                                  toast({ title: 'Antecedente salvo', description: 'Informação salva com sucesso.' });
                                } catch (error: any) {
                                  toast({ title: 'Erro ao salvar', description: error.message || 'Não foi possível salvar.', variant: 'destructive' });
                                }
                                setModalAberto(null);
                              }}>
                                Salvar
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={async () => {
                            setAntecedentes(prev => ({ ...prev, [key]: "Nega" }));
                            try {
                              await atualizarPaciente(paciente.id, {
                                [`antecedentes_${key}`]: "Nega"
                              });
                              toast({ title: 'Campo limpo', description: 'Campo marcado como "Nega".' });
                            } catch (error: any) {
                              toast({ title: 'Erro ao salvar', description: error.message || 'Não foi possível salvar.', variant: 'destructive' });
                            }
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Nega
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Start Consultation */}
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Iniciar Atendimento</h2>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Clique para iniciar o atendimento e acessar a interface completa de evolução médica
              </p>
              <Button size="lg" onClick={handleStartConsultation} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Iniciar Atendimento
              </Button>
            </CardContent>
          </Card>

          {/* Botão principal de salvar ao final do formulário */}
          {/* Removido: Não deve haver botão 'Salvar' geral aqui */}
        </div>
      ) : (
        <MedicalLayout
          patientData={patientData}
          onStartConsultation={handleStartConsultation}
          onFinishConsultation={handleFinishConsultation}
          isConsultationActive={isConsultationActive}
          pacienteId={paciente.id}
          prontuarioId={currentProntuarioId}
        />
      )}
    </div>
  );
};

export default NovaEvolucao;
