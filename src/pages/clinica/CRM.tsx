import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PacientesList } from "@/components/modules/pacientes/PacientesList"
import { PacienteForm } from "@/components/modules/pacientes/PacienteForm"
import { usePacientes } from "@/hooks/usePacientes";
import { useEffect, useState } from "react"
import { Users, UserPlus, TrendingUp, DollarSign, Activity, Target } from "lucide-react"

const CRM = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);
  const { buscarPacientePorId } = usePacientes();

  // Função para editar paciente
  const handleEditPaciente = async (paciente) => {
    const pacienteAtualizado = await buscarPacientePorId(paciente.id);
    setEditingPaciente(pacienteAtualizado);
    setShowForm(true);
  };

  const stats = [
    {
      title: "Total de Pacientes",
      value: "1,247",
      change: "+12.5%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Novos este Mês",
      value: "89",
      change: "+23.1%",
      icon: UserPlus,
      color: "text-green-600"
    },
    {
      title: "Receita Total",
      value: "R$ 125.840",
      change: "+8.2%",
      icon: DollarSign,
      color: "text-emerald-600"
    },
    {
      title: "Ticket Médio",
      value: "R$ 185",
      change: "+5.3%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Taxa de Retorno",
      value: "68%",
      change: "+2.1%",
      icon: Activity,
      color: "text-orange-600"
    },
    {
      title: "Meta Mensal",
      value: "92%",
      change: "+15.7%",
      icon: Target,
      color: "text-pink-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM</h1>
          <p className="text-muted-foreground">
            Gestão completa de relacionamento com pacientes
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> vs mês anterior
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Separator />

      {/* Patients Management */}
      <div className="space-y-6">
        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>{editingPaciente ? "Editar Paciente" : "Cadastrar Novo Paciente"}</CardTitle>
              <CardDescription>
                Preencha as informações do paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PacienteForm 
                paciente={editingPaciente}
                onCancel={() => { setShowForm(false); setEditingPaciente(null); }}
                onSuccess={() => { setShowForm(false); setEditingPaciente(null); }}
              />
            </CardContent>
          </Card>
        ) : (
          <PacientesList onEdit={handleEditPaciente} onNew={() => { setShowForm(true); setEditingPaciente(null); }} />
        )}
      </div>
    </div>
  )
}

export default CRM