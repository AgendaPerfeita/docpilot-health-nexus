import { useState } from "react"
import { AgendaGridPro } from "@/components/agenda/AgendaGridPro"
import { AgendamentoModal } from "@/components/agenda/AgendamentoModal"
import { AgendaHeader } from "@/components/agenda/AgendaHeader"

function getSemanaBase(date: Date) {
  // Retorna array de 7 datas, começando no domingo da semana de 'date'
  const diaSemana = date.getDay()
  const domingo = new Date(date)
  domingo.setDate(date.getDate() - diaSemana)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(domingo)
    d.setDate(domingo.getDate() + i)
    return d
  })
}

const Agenda = () => {
  const [dataBase, setDataBase] = useState(new Date())
  const semana = getSemanaBase(dataBase)
  const [modal, setModal] = useState<{ open: boolean; dia: Date; hora: string } | null>(null)
  const [agendamentos, setAgendamentos] = useState<{ id: string; dia: string; hora: string; duracao: number; paciente?: string }[]>([])
  const [clinicaSelecionada, setClinicaSelecionada] = useState<string | null>(null)
  const [pacienteSelecionado, setPacienteSelecionado] = useState<string | null>(null)

  const handleCellClick = (dia: Date, hora: string) => {
    setModal({ open: true, dia, hora })
  }

  const handleSaveAgendamento = (data: any) => {
    setAgendamentos((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        dia: data.data,
        hora: data.hora,
        paciente: data.paciente,
        duracao: 30,
      },
    ])
    setModal(null)
  }

  const handleMoveAgendamento = (id: string, novoDia: string, novoHora: string) => {
    setAgendamentos((prev) =>
      prev.map(a => a.id === id ? { ...a, dia: novoDia, hora: novoHora, duracao: a.duracao } : a)
    )
  }

  const handleResizeAgendamento = (id: string, novaDuracao: number) => {
    setAgendamentos((prev) =>
      prev.map(a => a.id === id ? { ...a, duracao: novaDuracao } : a)
    )
  }

  const handleImprimir = () => {
    window.print()
  }

  return (
    <div className="space-y-4 p-4">
      <AgendaHeader
        clinicaSelecionada={clinicaSelecionada}
        onChangeClinica={setClinicaSelecionada}
        pacienteSelecionado={pacienteSelecionado}
        onChangePaciente={setPacienteSelecionado}
        onImprimir={handleImprimir}
      />
      <div className="flex items-center gap-4 mb-2">
        <button
          className="px-2 py-1 border rounded"
          onClick={() => setDataBase((d) => {
            const newDate = new Date(d)
            newDate.setDate(d.getDate() - 7)
            return newDate
          })}
        >
          Semana anterior
        </button>
        <span className="font-semibold text-lg">
          Semana de {semana[0].toLocaleDateString("pt-BR")} a {semana[6].toLocaleDateString("pt-BR")}
        </span>
        <button
          className="px-2 py-1 border rounded"
          onClick={() => setDataBase((d) => {
            const newDate = new Date(d)
            newDate.setDate(d.getDate() + 7)
            return newDate
          })}
        >
          Próxima semana
        </button>
      </div>
      <AgendaGridPro
        semana={semana}
        onCellClick={handleCellClick}
        agendamentos={agendamentos}
        onMoveAgendamento={handleMoveAgendamento}
        onResizeAgendamento={handleResizeAgendamento}
      />
      {modal && (
        <AgendamentoModal
          open={modal.open}
          onClose={() => setModal(null)}
          onSave={handleSaveAgendamento}
          dataInicial={modal.dia}
          horaInicial={modal.hora}
        />
      )}
    </div>
  )
}

export default Agenda
 