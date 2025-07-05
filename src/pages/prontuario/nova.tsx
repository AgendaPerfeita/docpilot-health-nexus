import React, { useState, useRef, useEffect } from "react"
import { Users, FileText, Calendar, Stethoscope, AlertCircle, Clock, CheckCircle, Edit, ChevronLeft, ChevronRight, Menu, X, ArrowLeft, ArrowRight, RefreshCw, Save, BarChart2, Download, MoreHorizontal, Search, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { buscarMedicamentos, autocompleteMedicamentos, obterPosologiasSugeridas, type Medicamento } from "@/lib/gemini"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const mockPatient = {
  name: "Maria Silva",
  age: 35,
  gender: "Feminino",
  convenio: "Particular",
  firstConsult: "2025-07-04",
  tags: ["Diabetes", "Hipertensão"],
}

const mockAntecedentes = [
  { key: "clinicos", label: "Clínicos", value: "Hipertensão, Diabetes" },
  { key: "cirurgicos", label: "Cirúrgicos", value: "Cesariana (2015)" },
  { key: "familiares", label: "Familiares", value: "Pai com diabetes" },
  { key: "habitos", label: "Hábitos", value: "Não fuma, não bebe" },
  { key: "alergias", label: "Alergias", value: "Dipirona" },
  { key: "medicamentos", label: "Medicamentos", value: "Metformina, Losartana" },
]

const mockHistorico = [
  {
    date: "2025-07-04",
    type: "Exames",
    author: "Dr. Thiago Anver",
    time: "19:13",
    content: [
      "Solicitação de Exames: 40502112 - Ensaios enzimáticos em leucócitos, eritrócitos ou tecidos para diagnóstico de EIM, incluindo preparo do material, dosagem de proteína e enzima de referência (cada)"
    ]
  },
  {
    date: "2025-06-27",
    type: "Atendimento",
    author: "Dr. Thiago Anver",
    time: "05:30",
    content: [
      "Queixa principal: Dor na barriga",
      "HMA: Há mais ou menos 20 dias, evolui com desconforto abdominal constante que piora com café e comidas ácidas...",
      "Hipótese diagnóstica: K29 - Gastrite e duodenite",
      "Condutas: solicito EDA, PHmetria, exames laboratoriais",
      "Prescrição: Annita de 12/12hs por 3 dias"
    ]
  }
]

// Mock de exames para autocomplete
const examesTUSS = [
  { code: "40304361", name: "Hemograma com contagem de plaquetas ou frações (eritrograma, leucograma, plaquetas)" },
  { code: "40304957", name: "Adenograma (inclui hemograma)" },
  { code: "40301567", name: "Glicemia em jejum" },
  { code: "40301890", name: "Creatinina" },
  { code: "40302123", name: "TSH" },
  { code: "40302456", name: "T4 Livre" },
]

// Mock de medicamentos para autocomplete
const medicamentos = [
  { name: "Rivotril 2 mg, Comprimido", substancia: "Clonazepam 2 mg", apresentacao: "30 un", preco: 30.95 },
  { name: "Rivotril 0,5 mg, Comprimido", substancia: "Clonazepam 0,5 mg", apresentacao: "30 un", preco: 16.73 },
  { name: "Dipirona 500 mg, Comprimido", substancia: "Dipirona", apresentacao: "20 un", preco: 8.50 },
  { name: "Losartana 50 mg, Comprimido", substancia: "Losartana", apresentacao: "30 un", preco: 12.00 },
]

// Array completo de medicamentos mockados para busca
const medicamentosCompletos: Medicamento[] = [
  {
    nome: "Amoxicilina 500mg",
    principioAtivo: "Amoxicilina",
    apresentacao: "Cápsula 500mg, 21 unidades",
    fabricante: "EMS",
    tipo: "Genérico",
    preco: 15.90,
    tarja: "Vermelha",
    posologias: ["1 cápsula, via oral, a cada 8 horas, por 7 dias"],
    observacoes: "Tomar com ou sem alimentos"
  },
  {
    nome: "Dipirona 500mg",
    principioAtivo: "Dipirona",
    apresentacao: "Comprimido 500mg, 20 unidades",
    fabricante: "Neo Química",
    tipo: "Similar",
    preco: 8.50,
    tarja: "Livre",
    posologias: ["1 comprimido, via oral, a cada 6-8 horas, quando necessário"],
    observacoes: "Não usar em caso de alergia à dipirona"
  },
  {
    nome: "Paracetamol 750mg",
    principioAtivo: "Paracetamol",
    apresentacao: "Comprimido 750mg, 10 unidades",
    fabricante: "EMS",
    tipo: "Genérico",
    preco: 6.80,
    tarja: "Livre",
    posologias: ["1 comprimido, via oral, a cada 6-8 horas, quando necessário"],
    observacoes: "Não exceder 4g por dia"
  },
  {
    nome: "Ibuprofeno 600mg",
    principioAtivo: "Ibuprofeno",
    apresentacao: "Comprimido 600mg, 12 unidades",
    fabricante: "Aché",
    tipo: "Similar",
    preco: 12.90,
    tarja: "Vermelha",
    posologias: ["1 comprimido, via oral, a cada 8 horas, com alimentos"],
    observacoes: "Tomar com alimentos para evitar irritação gástrica"
  },
  {
    nome: "Omeprazol 20mg",
    principioAtivo: "Omeprazol",
    apresentacao: "Cápsula 20mg, 14 unidades",
    fabricante: "Neo Química",
    tipo: "Genérico",
    preco: 18.50,
    tarja: "Vermelha",
    posologias: ["1 cápsula, via oral, uma vez ao dia, pela manhã, em jejum"],
    observacoes: "Tomar 30 minutos antes do café da manhã"
  },
  {
    nome: "Losartana 50mg",
    principioAtivo: "Losartana",
    apresentacao: "Comprimido 50mg, 30 unidades",
    fabricante: "EMS",
    tipo: "Genérico",
    preco: 22.00,
    tarja: "Vermelha",
    posologias: ["1 comprimido, via oral, uma vez ao dia"],
    observacoes: "Controla a pressão arterial"
  },
  {
    nome: "Metformina 850mg",
    principioAtivo: "Metformina",
    apresentacao: "Comprimido 850mg, 30 unidades",
    fabricante: "EMS",
    tipo: "Genérico",
    preco: 25.00,
    tarja: "Vermelha",
    posologias: ["1 comprimido, via oral, duas vezes ao dia, com as refeições"],
    observacoes: "Controla o diabetes"
  },
  {
    nome: "Sinvastatina 20mg",
    principioAtivo: "Sinvastatina",
    apresentacao: "Comprimido 20mg, 30 unidades",
    fabricante: "EMS",
    tipo: "Genérico",
    preco: 28.00,
    tarja: "Vermelha",
    posologias: ["1 comprimido, via oral, uma vez ao dia, à noite"],
    observacoes: "Controla o colesterol"
  }
]

const mockIMCHistorico = [
  { data: "04/07/2025", valor: 27.77 },
  { data: "20/06/2025", valor: 28.12 },
  { data: "10/06/2025", valor: 27.50 },
]

// Mock para timeline do resumo
const mockTimeline = [
  {
    data: "04/07/2025",
    hora: "19:13",
    autor: "Thiago Anver",
    tipo: "Exames",
    conteudo: [
      {
        titulo: "Solicitação de Exames",
        exames: [
          {
            code: "40502112",
            desc: "Ensaios enzimáticos em leucócitos, eritrócitos ou tecidos para diagnóstico de EIM, incluindo preparo do material, dosagem de proteína e enzima de referência (cada)",
            qtd: 1
          }
        ],
        particular: true
      }
    ]
  },
  {
    data: "27/06/2025",
    hora: "05:30",
    autor: "Thiago Anver",
    tipo: "Atendimento",
    conteudo: [
      {
        titulo: "Atendimento",
        queixa: "Dor na barriga",
        hma: "Há mais ou menos 20 dias, evolui com desconforto abdominal constante que piora com café e comidas ácidas. Se permanece longos períodos em jejum, também sente o aumento da dor. Rela aumento da halitose.",
        antecedentes: "Hipertensão, Diabetes"
      }
    ]
  }
]

// Mock para exames
const mockExamesTUSS = [
  { code: "40304361", name: "Hemograma completo" },
  { code: "40304957", name: "Adenograma" },
  { code: "40301567", name: "Glicemia em jejum" },
]

// Mock para prescrições
const mockMedicamentos = [
  { name: "Rivotril 2 mg, Comprimido", substancia: "Clonazepam 2 mg", apresentacao: "30 un", preco: 30.95 },
  { name: "Dipirona 500 mg, Comprimido", substancia: "Dipirona", apresentacao: "20 un", preco: 8.50 },
]

const mockMedicamentosCompleto = [
  { name: "Rivotril 2 mg, Comprimido", substancia: "Clonazepam 2 mg", apresentacao: "30 un", preco: 30.95, fabricante: "Blanver", tipo: "Referência" },
  { name: "Dipirona 500 mg, Comprimido", substancia: "Dipirona", apresentacao: "20 un", preco: 8.50, fabricante: "Neo Química", tipo: "Similar" },
  { name: "Neosoro 0,5 mg/mL, Solução nasal", substancia: "Cloridrato de Nafazolina 0,5 mg/mL", apresentacao: "1 un de 30 mL", preco: 6.18, fabricante: "Neo Química", tipo: "Similar" },
]

const mockSugestoesPosologia = [
  {
    indicacao: "Depressão maior",
    texto: "Tomar 1 comprimido, via oral, uma vez, à noite, uso contínuo."
  },
  {
    indicacao: "Distúrbio do pânico",
    texto: "Tomar 1 comprimido, via oral, uma vez à noite, uso contínuo."
  },
  {
    indicacao: "Síndrome das pernas inquietas, Tratamento dos movimentos periódicos das pernas durante o sono",
    texto: "Tomar 1 comprimido, via oral, uma vez à noite, uso contínuo."
  }
]

const modelosAtestado = [
  {
    nome: "Atestado Simples",
    texto: "Atesto, para os devidos fins, que o(a) paciente [NOME] esteve sob meus cuidados nesta data, necessitando de afastamento de suas atividades por [X] dias."
  },
  {
    nome: "Declaração de Comparecimento",
    texto: "Declaro, para os devidos fins, que o(a) paciente [NOME] compareceu a esta unidade de saúde na data de hoje para atendimento médico."
  }
]

function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2 relative animate-in fade-in-0 zoom-in-95">
        <button className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" onClick={onClose} aria-label="Fechar">
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  )
}

function EditorRico({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder?: string }) {
  // Simples textarea, pode ser trocado por editor rico real
  return <Textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4} className="resize-y" />
}

function getIMCClassificacao(imc: number): string {
  if (imc <= 0 || isNaN(imc)) return ""
  if (imc < 18.5) return "Abaixo do Peso"
  if (imc < 25) return "Normal"
  if (imc < 30) return "Sobrepeso"
  if (imc < 35) return "Obesidade Grau I"
  if (imc < 40) return "Obesidade Grau II"
  return "Obesidade Grau III"
}

// Função para imprimir apenas o conteúdo do documento
function printDocConteudo(conteudo: string, data: string, paciente: string) {
  // Dados mockados do médico e paciente
  const medico = {
    nome: "Thiago Anver",
    telefone: "(21) 98662-6544",
    crm: "CRM 123456/RJ"
  }
  const pacienteNome = paciente
  const pacienteCPF = "918.724.940-56" // mock, pode ser dinâmico
  const dataFormatada = new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  const printWindow = window.open('', '', 'width=800,height=1100')
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Documento</title>
          <style>
            @media print {
              body { margin: 0; }
              .print-header { position: fixed; top: 0; left: 0; right: 0; height: 60px; background: #fff; z-index: 10; }
              .print-footer { position: fixed; bottom: 0; left: 0; right: 0; height: 40px; background: #fff; z-index: 10; display: flex; flex-direction: column; justify-content: flex-end; }
              .print-content { margin-top: 120px; margin-bottom: 70px; }
              .footer-row { position: fixed; bottom: 40px; left: 32px; right: 32px; width: calc(100% - 64px); display: flex; justify-content: space-between; align-items: center; font-size: 0.98em; color: #222; }
            }
            body { font-family: Arial, sans-serif; margin: 0; }
            .print-header { padding: 12px 32px 0 32px; border-bottom: 1.5px solid #222; font-size: 1em; display: flex; flex-direction: column; align-items: flex-start; }
            .print-header .medico { font-weight: bold; }
            .print-header .crm { font-size: 0.97em; color: #444; margin-top: 1px; margin-bottom: 1px; }
            .print-header .tel { font-size: 0.98em; margin-top: 2px; }
            .print-content { padding: 0 32px; min-height: 900px; }
            .paciente { font-weight: bold; margin-top: 18px; margin-bottom: 0; font-size: 1.05em; }
            .cpf { margin: 2px 0 0 0; font-weight: normal; font-size: 1.01em; }
            .linha { border-bottom: 1.5px solid #222; margin: 8px 0 18px 0; }
            .print-footer { padding: 0 32px; font-size: 0.95em; color: #2a2a2a; text-align: center; }
            .footer-line { border-top: 1.5px solid #222; width: 100%; margin-bottom: 2px; }
            .footer-center { width: 100%; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <span class="medico">${medico.nome}</span>
            <span class="crm">${medico.crm}</span>
            <span class="tel">Telefones: ${medico.telefone}</span>
          </div>
          <div class="print-content">
            <div class="paciente">${pacienteNome}</div>
            <div class="cpf">CPF: ${pacienteCPF}</div>
            <div class="linha"></div>
            <div style="margin-top: 12px;">${conteudo}</div>
          </div>
          <div class="footer-row">
            <span>${dataFormatada}</span>
            <span>${medico.nome}</span>
          </div>
          <div class="print-footer">
            <div class="footer-line"></div>
            <div class="footer-center">
              Documento gerado por SmartDoc - Sistema para gestão de clínicas e consultórios
            </div>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }
}

export default function AtendimentoInteligente() {
  const [timer, setTimer] = useState(0)
  const [started, setStarted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [antecedentes, setAntecedentes] = useState(mockAntecedentes)
  const [modalIndex, setModalIndex] = useState<number|null>(null)
  const [modalValue, setModalValue] = useState("")
  const [atendimento, setAtendimento] = useState({
    queixa: "",
    hma: "",
    historico: "",
    exame: "",
    peso: "",
    altura: "",
    imc: "",
    diagnostico: "",
    condutas: ""
  })
  const [exames, setExames] = useState<{ code: string, name: string, quantidade: number }[]>([])
  const [exameBusca, setExameBusca] = useState("")
  const [exameSugestoes, setExameSugestoes] = useState<typeof mockExamesTUSS>([])
  const [exameQtd, setExameQtd] = useState(1)
  const [prescricoes, setPrescricoes] = useState<Array<Medicamento & { posologia: string, tipoReceita: string, uso: string, apresentacaoTipo: string }>>([])
  const [prescricaoTab, setPrescricaoTab] = useState("medicamentos")
  const [prescricaoBusca, setPrescricaoBusca] = useState("")
  const [prescricaoSugestoes, setPrescricaoSugestoes] = useState<Medicamento[]>([])
  const [prescricaoAutocomplete, setPrescricaoAutocomplete] = useState<string[]>([])
  const [buscandoMedicamentos, setBuscandoMedicamentos] = useState(false)
  const [posologiasSugeridas, setPosologiasSugeridas] = useState<string[]>([])
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState<Medicamento | null>(null)
  const [documento, setDocumento] = useState("")
  const [imagemFiles, setImagemFiles] = useState<File[]>([])
  const [abaAtiva, setAbaAtiva] = useState("resumo")
  const [imcModalOpen, setImcModalOpen] = useState(false)
  const [finalizarOpen, setFinalizarOpen] = useState(false)
  const [assinatura, setAssinatura] = useState("nao_assinar")
  const [finalizado, setFinalizado] = useState(false)
  const [docData, setDocData] = useState({
    data: new Date().toISOString().slice(0, 10),
    conteudo: "",
  })
  const [showModelos, setShowModelos] = useState(false)

  const imcValue = parseFloat(atendimento.imc)
  const imcClass = getIMCClassificacao(imcValue)

  React.useEffect(() => {
    let interval: any
    if (started) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [started])

  React.useEffect(() => {
    const peso = parseFloat(atendimento.peso.replace(",", "."))
    const altura = parseFloat(atendimento.altura.replace(",", "."))
    if (peso > 0 && altura > 0) {
      const imc = peso / ((altura/100) ** 2)
      setAtendimento(a => ({ ...a, imc: imc.toFixed(2) }))
    } else {
      setAtendimento(a => ({ ...a, imc: "" }))
    }
  }, [atendimento.peso, atendimento.altura])

  // Autocomplete exames
  React.useEffect(() => {
    if (exameBusca.length > 1) {
      setExameSugestoes(mockExamesTUSS.filter(e => e.name.toLowerCase().includes(exameBusca.toLowerCase()) || e.code.includes(exameBusca)))
    } else {
      setExameSugestoes([])
    }
  }, [exameBusca])

  // Autocomplete prescrições com dados locais (mais rápido)
  useEffect(() => {
    if (prescricaoBusca.length > 1) {
      const termo = prescricaoBusca.toLowerCase()
      const medicamentosFiltrados = medicamentosCompletos.filter(m => 
        m.nome.toLowerCase().includes(termo) ||
        m.principioAtivo.toLowerCase().includes(termo) ||
        m.fabricante.toLowerCase().includes(termo)
      ).slice(0, 8)
      setPrescricaoSugestoes(medicamentosFiltrados)
    } else {
      setPrescricaoSugestoes([])
    }
  }, [prescricaoBusca])

  // Função para obter posologias sugeridas (local)
  const obterPosologias = async (medicamento: Medicamento) => {
    setMedicamentoSelecionado(medicamento)
    // Posologias baseadas no tipo de medicamento
    const posologiasComuns = [
      "1 comprimido, via oral, a cada 8 horas",
      "1 comprimido, via oral, a cada 12 horas", 
      "1 comprimido, via oral, uma vez ao dia, pela manhã",
      "1 comprimido, via oral, duas vezes ao dia",
      "1 comprimido, via oral, três vezes ao dia"
    ]
    setPosologiasSugeridas(posologiasComuns)
  }

  const formatTimer = (t: number) => {
    const min = String(Math.floor(t/60)).padStart(2, '0')
    const sec = String(t%60).padStart(2, '0')
    return `${min}:${sec}`
  }

  const openModal = (idx: number) => {
    setModalIndex(idx)
    setModalValue(antecedentes[idx].value)
  }
  const closeModal = () => setModalIndex(null)
  const saveModal = () => {
    if (modalIndex !== null) {
      setAntecedentes(ants => ants.map((a, i) => i === modalIndex ? { ...a, value: modalValue } : a))
      setModalIndex(null)
    }
  }
  const goPrev = () => {
    if (modalIndex !== null && modalIndex > 0) openModal(modalIndex - 1)
  }
  const goNext = () => {
    if (modalIndex !== null && modalIndex < antecedentes.length - 1) openModal(modalIndex + 1)
  }

  return (
    <div className="flex flex-col h-full w-full min-w-0">
      {/* Header do paciente + relógio e iniciar/finalizar */}
      <div className="sticky top-0 z-20 bg-white border-b px-4 md:px-8 py-4 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary text-white w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-xl md:text-2xl font-bold">
            {mockPatient.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-bold text-base md:text-lg">{mockPatient.name}</div>
            <div className="text-xs md:text-sm text-muted-foreground">
              {mockPatient.age} anos • {mockPatient.gender} • {mockPatient.convenio}
            </div>
            <div className="text-xs text-muted-foreground">
              Primeira consulta: {new Date(mockPatient.firstConsult).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex gap-1 mt-1 flex-wrap">
              {mockPatient.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs text-muted-foreground">Duração</span>
            <span className="font-mono text-lg">{started ? formatTimer(timer) : "00:00"}</span>
          </div>
          {!started && !finalizado && (
            <Button variant="default" size="lg" className="font-bold px-6 py-2" onClick={() => setStarted(true)}>
              Iniciar atendimento
            </Button>
          )}
          {started && !finalizado && (
            <Button variant="destructive" size="lg" className="font-bold px-6 py-2" onClick={() => setFinalizarOpen(true)}>
              Finalizar atendimento
            </Button>
          )}
          {finalizado && (
            <Badge variant="outline" className="text-green-700 border-green-600 bg-green-50 font-bold text-base">Atendimento finalizado</Badge>
          )}
        </div>
      </div>
      {/* Modal lateral de finalizar atendimento */}
      <Sheet open={finalizarOpen} onOpenChange={setFinalizarOpen}>
        <SheetContent side="right" className="max-w-md w-full">
          <SheetHeader>
            <SheetTitle>Finalizar atendimento</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Ao finalizar um atendimento, você não poderá alterá-lo novamente. Deseja prosseguir?
            </div>
            <div className="font-semibold mb-2">Assinar com:</div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="assinatura" value="nao_assinar" checked={assinatura === "nao_assinar"} onChange={() => setAssinatura("nao_assinar")}/>
                Não assinar
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="assinatura" value="assinatura_digital" checked={assinatura === "assinatura_digital"} onChange={() => setAssinatura("assinatura_digital")}/>
                Assinatura digital
              </label>
            </div>
          </div>
          <SheetFooter className="mt-8">
            <Button variant="default" className="w-full" onClick={() => { setFinalizado(true); setFinalizarOpen(false); setStarted(false); }}>
              Finalizar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {/* Layout interno: menu lateral do prontuário + conteúdo */}
      <div className="flex flex-1 min-h-0 w-full">
        {/* Menu lateral interno do prontuário */}
        <nav className="hidden md:flex flex-col w-56 min-w-[180px] max-w-xs border-r bg-white py-4 px-2 space-y-1">
          <Button variant={abaAtiva === "resumo" ? "secondary" : "ghost"} className="justify-start" onClick={() => setAbaAtiva("resumo")}> <Users className="h-4 w-4 mr-2" />Resumo</Button>
          <Button variant={abaAtiva === "atendimento" ? "secondary" : "ghost"} className="justify-start" onClick={() => setAbaAtiva("atendimento")}> <FileText className="h-4 w-4 mr-2" />Atendimento</Button>
          <Button variant={abaAtiva === "exames" ? "secondary" : "ghost"} className="justify-start" onClick={() => setAbaAtiva("exames")}> <Calendar className="h-4 w-4 mr-2" />Exames</Button>
          <Button variant={abaAtiva === "prescricoes" ? "secondary" : "ghost"} className="justify-start" onClick={() => setAbaAtiva("prescricoes")}> <Stethoscope className="h-4 w-4 mr-2" />Prescrições</Button>
          <Button variant={abaAtiva === "documentos" ? "secondary" : "ghost"} className="justify-start" onClick={() => setAbaAtiva("documentos")}> <AlertCircle className="h-4 w-4 mr-2" />Documentos</Button>
          <Button variant={abaAtiva === "imagens" ? "secondary" : "ghost"} className="justify-start" onClick={() => setAbaAtiva("imagens")}> <FileText className="h-4 w-4 mr-2" />Imagens</Button>
        </nav>
        {/* Conteúdo principal do atendimento */}
        <section className="flex-1 min-w-0 px-1 sm:px-2 md:px-6 py-2 sm:py-4 bg-white flex flex-col gap-y-4" style={finalizado ? { pointerEvents: 'none', opacity: 0.7 } : {}}>
          {abaAtiva === "resumo" && (
            <div className="w-full max-w-2xl mx-auto">
              {/* Timeline vertical */}
              <div className="flex flex-col gap-6">
                {mockTimeline.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    {/* Data vertical */}
                    <div className="flex flex-col items-center min-w-[56px]">
                      <div className="bg-primary text-white rounded px-2 py-1 text-xs font-bold">{item.data.split("/")[0]}</div>
                      <div className="bg-muted text-primary rounded-b px-2 pb-1 text-xs">{item.data.split("/")[1]}<br/>{item.data.split("/")[2]}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Por: {item.autor}</span>
                        <span className="text-muted-foreground text-xs flex items-center gap-1"><Clock className="h-4 w-4" />{item.hora}</span>
                      </div>
                      {item.tipo === "Exames" && item.conteudo.map((c, i) => (
                        <Card key={i} className="mb-2">
                          <CardHeader className="bg-muted/40 py-2 px-4 rounded-t">
                            <CardTitle className="text-sm font-semibold">Solicitação de Exames</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2 px-4">
                            <div className="mb-2 flex gap-2 items-center">
                              <span className="font-bold">Particular ({item.data})</span>
                              <Button size="sm" variant="outline">Imprimir SADT</Button>
                              <Button size="sm" variant="outline">Imprimir Particular</Button>
                            </div>
                            <ul className="list-disc ml-6">
                              {c.exames.map((e, j) => (
                                <li key={j}>{e.code} - {e.desc}<br/><span className="text-xs text-muted-foreground">Quantidade: {e.qtd}</span></li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                      {item.tipo === "Atendimento" && item.conteudo.map((c, i) => (
                        <Card key={i} className="mb-2">
                          <CardHeader className="bg-muted/40 py-2 px-4 rounded-t">
                            <CardTitle className="text-sm font-semibold">Atendimento</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2 px-4 space-y-2">
                            <div><span className="font-semibold">Queixa principal:</span> {c.queixa} <Button size="sm" variant="outline">Imprimir</Button></div>
                            <div><span className="font-semibold">História da moléstia atual:</span> {c.hma} <Button size="sm" variant="outline">Imprimir</Button></div>
                            <div><span className="font-semibold">Histórico e antecedentes:</span> {c.antecedentes} <Button size="sm" variant="outline">Imprimir</Button></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {abaAtiva === "atendimento" && (
            <Card className="shadow-md w-full max-w-2xl mx-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base md:text-lg">Atendimento <span className="text-xs text-muted-foreground ml-2">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 w-full">
                {/* Queixa principal */}
                <div>
                  <label className="block font-medium text-sm mb-1">Queixa principal:</label>
                  <ReactQuill theme="snow" value={atendimento.queixa} onChange={val => setAtendimento(a => ({ ...a, queixa: val }))} placeholder="Descreva a queixa principal..." style={{ minHeight: 80 }} />
                </div>
                {/* HMA */}
                <div>
                  <label className="block font-medium text-sm mb-1">História da moléstia atual:</label>
                  <ReactQuill theme="snow" value={atendimento.hma} onChange={val => setAtendimento(a => ({ ...a, hma: val }))} placeholder="Descreva a evolução dos sintomas..." style={{ minHeight: 100 }} />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm">Salvar Modelo</Button>
                    <Button variant="outline" size="sm">Usar modelo</Button>
                  </div>
                </div>
                {/* Exame físico */}
                <div>
                  <label className="block font-medium text-sm mb-1">Exame físico:</label>
                  <ReactQuill theme="snow" value={atendimento.exame} onChange={val => setAtendimento(a => ({ ...a, exame: val }))} placeholder="Descreva os achados do exame físico..." style={{ minHeight: 100 }} />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm">Salvar Modelo</Button>
                    <Button variant="outline" size="sm">Usar modelo</Button>
                  </div>
                </div>
                {/* Bloco IMC destacado */}
                <div className="bg-muted/50 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div>
                      <label className="block text-xs font-medium mb-1">Peso (kg)</label>
                      <Input type="number" min="0" step="0.1" className="w-32" placeholder="Peso" value={atendimento.peso} onChange={e => setAtendimento(a => ({ ...a, peso: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Altura (cm)</label>
                      <Input type="number" min="0" step="0.1" className="w-32" placeholder="Altura" value={atendimento.altura} onChange={e => setAtendimento(a => ({ ...a, altura: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-end gap-1 text-lg font-bold text-center sm:text-right mt-2 sm:mt-0">
                    <div className="flex items-center gap-2">
                      IMC: <span className="text-primary">{atendimento.imc || 0}</span>
                      <button className="ml-2 p-1 rounded hover:bg-muted transition" title="Histórico de IMC" onClick={() => setImcModalOpen(true)}>
                        <BarChart2 className="h-5 w-5 text-primary" />
                      </button>
                    </div>
                    {imcValue > 0 && (
                      <span className="text-xs text-muted-foreground font-normal">{imcClass}</span>
                    )}
                  </div>
                </div>
                {/* Diagnóstico com autocomplete (placeholder) */}
                <div>
                  <label className="block font-medium text-sm mb-1">Hipótese diagnóstica:</label>
                  <ReactQuill theme="snow" value={atendimento.diagnostico} onChange={val => setAtendimento(a => ({ ...a, diagnostico: val }))} placeholder="Descreva o diagnóstico..." style={{ minHeight: 60 }} />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="default" size="sm">Adicionar</Button>
                  </div>
                </div>
                {/* Condutas */}
                <div>
                  <label className="block font-medium text-sm mb-1">Condutas:</label>
                  <ReactQuill theme="snow" value={atendimento.condutas} onChange={val => setAtendimento(a => ({ ...a, condutas: val }))} placeholder="Descreva as condutas..." style={{ minHeight: 60 }} />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" size="sm">Salvar Modelo</Button>
                    <Button variant="outline" size="sm">Usar modelo</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {abaAtiva === "exames" && (
            <Card className="shadow-md w-full max-w-2xl mx-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base md:text-lg">Exames e procedimentos <span className="text-xs text-muted-foreground ml-2">{new Date().toLocaleDateString('pt-BR')}</span></CardTitle>
                <Button variant="outline" size="sm">Usar modelo de exames</Button>
              </CardHeader>
              <CardContent className="space-y-4 w-full">
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <Input className="flex-1" placeholder="Buscar exame (ex: hemograma)" value={exameBusca} onChange={e => setExameBusca(e.target.value)} />
                  <Input type="number" min="1" className="w-20" value={exameQtd} onChange={e => setExameQtd(Number(e.target.value))} />
                  <Button onClick={() => {
                    const found = mockExamesTUSS.find(e => e.name.toLowerCase() === exameBusca.toLowerCase() || e.code === exameBusca)
                    if (found) {
                      setExames([...exames, { ...found, quantidade: exameQtd }])
                      setExameBusca("")
                      setExameQtd(1)
                    }
                  }}>Adicionar</Button>
                </div>
                {exameSugestoes.length > 0 && (
                  <div className="bg-muted border rounded p-2 mt-1">
                    {exameSugestoes.map(e => (
                      <div key={e.code} className="cursor-pointer hover:bg-primary/10 p-1 rounded" onClick={() => {
                        setExames([...exames, { ...e, quantidade: exameQtd }])
                        setExameBusca("")
                        setExameQtd(1)
                      }}>
                        <span className="font-mono text-xs text-muted-foreground">{e.code}</span> - {e.name}
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  {exames.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 border-b py-1">
                      <span className="font-mono text-xs text-muted-foreground">{e.code}</span>
                      <span className="flex-1">{e.name}</span>
                      <span className="text-xs">Qtd: {e.quantidade}</span>
                      <Button size="icon" variant="ghost" onClick={() => setExames(exames.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col md:flex-row justify-end gap-2 mt-4">
                  <Button variant="outline">Salvar como modelo</Button>
                  <Button variant="default">Imprimir</Button>
                  <Button variant="default">Salvar</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {abaAtiva === "prescricoes" && (
            <Card className="shadow-md w-full max-w-3xl mx-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base md:text-lg">Prescrição <span className="text-xs text-muted-foreground ml-2">{new Date().toLocaleDateString('pt-BR')}</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 w-full">
                <Tabs value={prescricaoTab} onValueChange={setPrescricaoTab} className="w-full">
                  <TabsList className="mb-2">
                    <TabsTrigger value="medicamentos">Medicamentos</TabsTrigger>
                    <TabsTrigger value="exames">Exames</TabsTrigger>
                    <TabsTrigger value="vacinas">Vacinas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="medicamentos">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <div className="flex-1 relative">
                        <Input 
                          className="w-full" 
                          placeholder="Buscar medicamento (ex: amoxicilina, dipirona)" 
                          value={prescricaoBusca} 
                          onChange={e => setPrescricaoBusca(e.target.value)} 
                        />
                      </div>
                      <Button 
                        onClick={() => {
                          if (prescricaoSugestoes.length > 0) {
                            const medicamento = prescricaoSugestoes[0]
                            setPrescricoes([...prescricoes, { 
                              ...medicamento, 
                              posologia: "", 
                              tipoReceita: "Receituário simples", 
                              uso: "Não Informada", 
                              apresentacaoTipo: "comprimidos" 
                            }])
                            setPrescricaoBusca("")
                            setPrescricaoSugestoes([])
                          }
                        }}
                        disabled={prescricaoSugestoes.length === 0}
                      >
                        Adicionar
                      </Button>
                    </div>
                    {prescricaoSugestoes.length > 0 && (
                      <div className="bg-muted border rounded p-2 mt-1 max-h-48 overflow-y-auto">
                        {prescricaoSugestoes.map((medicamento, index) => (
                          <div 
                            key={`${medicamento.nome}-${index}`} 
                            className="cursor-pointer hover:bg-primary/10 p-2 rounded flex items-center justify-between border-b last:border-b-0" 
                            onClick={() => {
                              setPrescricoes([...prescricoes, { 
                                ...medicamento, 
                                posologia: "", 
                                tipoReceita: "Receituário simples", 
                                uso: "Não Informada", 
                                apresentacaoTipo: "comprimidos" 
                              }])
                              setPrescricaoBusca("")
                              setPrescricaoSugestoes([])
                            }}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{medicamento.nome}</span>
                                <Badge variant="outline" className="text-xs">
                                  {medicamento.tipo}
                                </Badge>
                                {medicamento.tarja && (
                                  <Badge variant="secondary" className="text-xs">
                                    {medicamento.tarja}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {medicamento.principioAtivo} • {medicamento.apresentacao}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {medicamento.fabricante}
                              </div>
                            </div>
                            {medicamento.preco && (
                              <span className="text-xs text-muted-foreground ml-2">
                                R$ {medicamento.preco.toFixed(2)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-4 mt-4">
                      {prescricoes.map((p, i) => (
                        <Card key={i} className="border shadow-sm">
                          <CardContent className="py-3 px-4 flex flex-col gap-2">
                            {/* Header: tipo de receita */}
                            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between border-b pb-2">
                              <Select value={p.tipoReceita} onValueChange={val => setPrescricoes(prescricoes.map((item, idx) => idx === i ? { ...item, tipoReceita: val } : item))}>
                                <SelectTrigger className="w-48 h-8 text-xs">
                                  <SelectValue placeholder="Tipo de receita" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Receituário simples">Receituário simples</SelectItem>
                                  <SelectItem value="Receituário especial">Receituário especial</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button size="icon" variant="ghost" onClick={() => setPrescricoes(prescricoes.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>
                            </div>
                            {/* Linha principal: nome, apresentação, fabricante */}
                            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-base">{p.nome}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {p.tipo}
                                  </Badge>
                                  {p.tarja && (
                                    <Badge variant="secondary" className="text-xs">
                                      {p.tarja}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {p.principioAtivo} • {p.apresentacao}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {p.fabricante}
                                </div>
                              </div>
                              <div className="flex gap-2 items-center">
                                <Select value={p.apresentacaoTipo} onValueChange={val => setPrescricoes(prescricoes.map((item, idx) => idx === i ? { ...item, apresentacaoTipo: val } : item))}>
                                  <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue placeholder="Apresentação" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="comprimidos">comprimidos</SelectItem>
                                    <SelectItem value="gotas">gotas</SelectItem>
                                    <SelectItem value="ml">ml</SelectItem>
                                    <SelectItem value="unidades">unidades</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select value={p.uso} onValueChange={val => setPrescricoes(prescricoes.map((item, idx) => idx === i ? { ...item, uso: val } : item))}>
                                  <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue placeholder="Uso" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Não Informada">Não Informada</SelectItem>
                                    <SelectItem value="uso contínuo">uso contínuo</SelectItem>
                                    <SelectItem value="comprimidos">comprimidos</SelectItem>
                                    <SelectItem value="embalagens">embalagens</SelectItem>
                                    <SelectItem value="unidades">unidades</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            {/* Campo de posologia */}
                            <div>
                              <Input className="w-full" placeholder="Digite a posologia..." value={p.posologia} onChange={e => setPrescricoes(prescricoes.map((item, idx) => idx === i ? { ...item, posologia: e.target.value } : item))} />
                            </div>
                            {/* Sugestões de posologia com Gemini */}
                            <div className="bg-muted/40 rounded p-3 mt-2">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-xs text-muted-foreground">SUGESTÕES DE POSOLOGIA</span>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => obterPosologias(p)}
                                >
                                  <Search className="h-3 w-3 mr-1" />
                                  Buscar Sugestões
                                </Button>
                              </div>
                              <div className="space-y-1">
                                {posologiasSugeridas.length > 0 && medicamentoSelecionado?.nome === p.nome ? (
                                  posologiasSugeridas.map((posologia, idx) => (
                                    <div 
                                      key={idx} 
                                      className="cursor-pointer hover:bg-primary/10 p-2 rounded text-sm"
                                      onClick={() => setPrescricoes(prescricoes.map((item, idx) => idx === i ? { ...item, posologia } : item))}
                                    >
                                      {posologia}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-muted-foreground">
                                    Clique em "Buscar Sugestões" para obter posologias recomendadas pelo Gemini
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="flex flex-col md:flex-row justify-between gap-2 mt-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Adicionar Texto Livre</Button>
                        <Button variant="ghost" size="sm">Histórico</Button>
                        <Button variant="ghost" size="sm">Usar Modelo</Button>
                      </div>
                      <Button variant="outline" size="sm">Salvar Como Modelo</Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="exames">
                    <div className="text-muted-foreground text-sm">[Em breve: prescrição de exames]</div>
                  </TabsContent>
                  <TabsContent value="vacinas">
                    <div className="text-muted-foreground text-sm">[Em breve: prescrição de vacinas]</div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
          {abaAtiva === "documentos" && (
            <Card className="shadow-md w-full max-w-2xl mx-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base md:text-lg">Documentos e atestados</CardTitle>
                <div className="text-xs text-muted-foreground">{new Date(docData.data).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</div>
              </CardHeader>
              <CardContent className="space-y-4 w-full">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <Input type="date" value={docData.data} onChange={e => setDocData(d => ({ ...d, data: e.target.value }))} className="w-40" />
                  <div className="flex-1 flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowModelos(true)}>Usar modelo de atestado</Button>
                    <Button variant="secondary" onClick={() => setDocData(d => ({ ...d, conteudo: "" }))}>Novo documento</Button>
                  </div>
                </div>
                <div>
                  <ReactQuill theme="snow" value={docData.conteudo} onChange={val => setDocData(d => ({ ...d, conteudo: val }))} placeholder="Digite o texto do documento ou atestado..." style={{ minHeight: 120 }} />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="default" onClick={() => alert('Documento salvo!')}>Salvar</Button>
                  <Button variant="outline" onClick={() => printDocConteudo(docData.conteudo, docData.data, mockPatient.name)}><Printer className="h-4 w-4 mr-1" />Imprimir</Button>
                  <Button variant="outline" disabled>Enviar para assinatura do paciente</Button>
                </div>
              </CardContent>
              {/* Modal de modelos de atestado */}
              {showModelos && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                  <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2 relative animate-in fade-in-0 zoom-in-95 p-6">
                    <div className="font-bold text-lg mb-4">Modelos de atestado</div>
                    <div className="space-y-2">
                      {modelosAtestado.map((m, idx) => (
                        <div key={idx} className="border rounded p-3 cursor-pointer hover:bg-primary/10" onClick={() => { setDocData(d => ({ ...d, conteudo: m.texto })); setShowModelos(false) }}>
                          <div className="font-semibold">{m.nome}</div>
                          <div className="text-xs text-muted-foreground mt-1">{m.texto.slice(0, 60)}...</div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="mt-4 w-full" onClick={() => setShowModelos(false)}>Cancelar</Button>
                  </div>
                </div>
              )}
            </Card>
          )}
          {abaAtiva === "imagens" && (
            <div className="p-4 bg-pink-50 rounded w-full">Bloco de Imagens (teste visível)</div>
          )}
        </section>
      </div>
      {/* Modal de histórico de IMC */}
      <Dialog open={imcModalOpen} onOpenChange={setImcModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Histórico de valores de IMC</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="tabela" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="tabela">Tabela</TabsTrigger>
              <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            </TabsList>
            <TabsContent value="tabela">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 py-2 text-left font-semibold">Data</th>
                      <th className="px-4 py-2 text-left font-semibold">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockIMCHistorico.map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{item.data}</td>
                        <td className="px-4 py-2">{item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="default" size="sm"><Download className="h-4 w-4 mr-1" />Download</Button>
              </div>
            </TabsContent>
            <TabsContent value="grafico">
              <div className="flex items-center justify-center h-40 text-muted-foreground">[Gráfico de IMC aqui]</div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
} 