import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  Building2, 
  Users, 
  Bed, 
  Activity, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  UserCheck,
  FileText,
  TrendingUp,
  Shield,
  Zap
} from "lucide-react"

const departmentData = [
  {
    id: 1,
    name: "Cardiologia",
    head: "Dr. João Silva",
    beds: { total: 24, occupied: 18, available: 6 },
    staff: { doctors: 8, nurses: 16, others: 12 },
    status: "operacional",
    occupancy: 75,
    surgeries: { scheduled: 5, completed: 3, pending: 2 }
  },
  {
    id: 2,
    name: "Pediatria",
    head: "Dra. Maria Santos",
    beds: { total: 32, occupied: 28, available: 4 },
    staff: { doctors: 12, nurses: 24, others: 18 },
    status: "operacional",
    occupancy: 87,
    surgeries: { scheduled: 2, completed: 2, pending: 0 }
  },
  {
    id: 3,
    name: "Ortopedia",
    head: "Dr. Carlos Lima",
    beds: { total: 16, occupied: 12, available: 4 },
    staff: { doctors: 6, nurses: 12, others: 8 },
    status: "alerta",
    occupancy: 75,
    surgeries: { scheduled: 8, completed: 5, pending: 3 }
  },
  {
    id: 4,
    name: "UTI Geral",
    head: "Dra. Ana Costa",
    beds: { total: 20, occupied: 19, available: 1 },
    staff: { doctors: 15, nurses: 45, others: 20 },
    status: "critico",
    occupancy: 95,
    surgeries: { scheduled: 0, completed: 0, pending: 0 }
  }
]

const surgerySchedule = [
  {
    id: 1,
    patient: "Maria Silva",
    procedure: "Cirurgia Cardíaca",
    surgeon: "Dr. João Silva",
    room: "Centro Cirúrgico 1",
    start: "08:00",
    duration: "4h",
    status: "em andamento",
    department: "Cardiologia"
  },
  {
    id: 2,
    patient: "Pedro Santos",
    procedure: "Artroscopia de Joelho",
    surgeon: "Dr. Carlos Lima",
    room: "Centro Cirúrgico 2",
    start: "10:30",
    duration: "2h",
    status: "agendada",
    department: "Ortopedia"
  },
  {
    id: 3,
    patient: "Ana Costa",
    procedure: "Apendicectomia",
    surgeon: "Dr. Roberto Alves",
    room: "Centro Cirúrgico 3",
    start: "14:00",
    duration: "1h30",
    status: "agendada",
    department: "Cirurgia Geral"
  }
]

export default function GestaoHospitalar() {
  const [selectedDepartment, setSelectedDepartment] = useState("todos")
  const [selectedView, setSelectedView] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão Hospitalar</h1>
          <p className="text-muted-foreground">Central de comando para integração completa de departamentos</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Departamentos</SelectItem>
              <SelectItem value="cardiologia">Cardiologia</SelectItem>
              <SelectItem value="pediatria">Pediatria</SelectItem>
              <SelectItem value="ortopedia">Ortopedia</SelectItem>
              <SelectItem value="uti">UTI Geral</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            SLA Status
          </Button>
        </div>
      </div>

      {/* Dashboard Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</p>
                <p className="text-2xl font-bold">83%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Otimizado
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bed className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Staff Ativo</p>
                <p className="text-2xl font-bold">284</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  4 departamentos
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cirurgias Hoje</p>
                <p className="text-2xl font-bold">15</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  8 concluídas
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SLA Compliance</p>
                <p className="text-2xl font-bold">97.2%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <Shield className="h-3 w-3 mr-1" />
                  Excelente
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="departments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="departments">Departamentos</TabsTrigger>
          <TabsTrigger value="surgeries">Centro Cirúrgico</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {departmentData.map((dept) => (
              <Card key={dept.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-lg">{dept.name}</CardTitle>
                        <CardDescription>Chefia: {dept.head}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        dept.status === 'operacional' ? 'default' :
                        dept.status === 'alerta' ? 'secondary' : 'destructive'
                      }
                    >
                      {dept.status === 'operacional' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {dept.status === 'alerta' && <Clock className="h-3 w-3 mr-1" />}
                      {dept.status === 'critico' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {dept.status.charAt(0).toUpperCase() + dept.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Ocupação de Leitos</span>
                      <span className="font-semibold">{dept.occupancy}%</span>
                    </div>
                    <Progress value={dept.occupancy} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{dept.beds.occupied} ocupados</span>
                      <span>{dept.beds.available} disponíveis</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600">{dept.staff.doctors}</p>
                      <p className="text-xs text-muted-foreground">Médicos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-green-600">{dept.staff.nurses}</p>
                      <p className="text-xs text-muted-foreground">Enfermeiros</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-purple-600">{dept.staff.others}</p>
                      <p className="text-xs text-muted-foreground">Outros</p>
                    </div>
                  </div>

                  {dept.surgeries.scheduled > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span>Cirurgias Hoje</span>
                        <div className="flex gap-4">
                          <span className="text-green-600">{dept.surgeries.completed} ✓</span>
                          <span className="text-yellow-600">{dept.surgeries.pending} ⏳</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="surgeries" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">3</div>
                <p className="text-xs text-muted-foreground">Salas ocupadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Agendadas Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">7</div>
                <p className="text-xs text-muted-foreground">Próximas cirurgias</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">8</div>
                <p className="text-xs text-muted-foreground">Hoje</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cronograma Cirúrgico</CardTitle>
              <CardDescription>Controle em tempo real do centro cirúrgico</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Procedimento</TableHead>
                    <TableHead>Cirurgião</TableHead>
                    <TableHead>Sala</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surgerySchedule.map((surgery) => (
                    <TableRow key={surgery.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{surgery.patient}</div>
                          <div className="text-sm text-muted-foreground">{surgery.department}</div>
                        </div>
                      </TableCell>
                      <TableCell>{surgery.procedure}</TableCell>
                      <TableCell>{surgery.surgeon}</TableCell>
                      <TableCell>{surgery.room}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{surgery.start}</div>
                          <div className="text-sm text-muted-foreground">{surgery.duration}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            surgery.status === 'em andamento' ? 'default' :
                            surgery.status === 'agendada' ? 'secondary' : 'outline'
                          }
                        >
                          {surgery.status === 'em andamento' && <Zap className="h-3 w-3 mr-1" />}
                          {surgery.status === 'agendada' && <Clock className="h-3 w-3 mr-1" />}
                          {surgery.status === 'concluida' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {surgery.status.charAt(0).toUpperCase() + surgery.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Equipamentos Críticos</CardTitle>
                <CardDescription>Status dos equipamentos hospitalares</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Respiradores UTI", total: 12, available: 3, maintenance: 1 },
                  { name: "Monitores Cardiacos", total: 24, available: 8, maintenance: 0 },
                  { name: "Maquinas de Dialise", total: 6, available: 2, maintenance: 1 },
                  { name: "Equipamentos Cirurgicos", total: 8, available: 3, maintenance: 0 }
                ].map((equipment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{equipment.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {equipment.total - equipment.available - equipment.maintenance} em uso
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">{equipment.available} disponíveis</span>
                      {equipment.maintenance > 0 && (
                        <span className="text-yellow-600">{equipment.maintenance} manutenção</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gestão de Leitos</CardTitle>
                <CardDescription>Distribuição por unidade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {departmentData.map((dept) => (
                  <div key={dept.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{dept.name}</span>
                      <span>{dept.beds.occupied}/{dept.beds.total}</span>
                    </div>
                    <Progress value={dept.occupancy} className="h-2" />
                  </div>
                ))}
                <div className="pt-4 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total Hospital</span>
                    <span>77/92 leitos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sistemas Integrados</CardTitle>
                <CardDescription>Status das integrações ativas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Sistema de Laboratório", status: "ativo", lastSync: "2 min atrás" },
                  { name: "Sistema de Imagem (PACS)", status: "ativo", lastSync: "5 min atrás" },
                  { name: "Farmácia Hospitalar", status: "ativo", lastSync: "1 min atrás" },
                  { name: "Sistema de Estoque", status: "alerta", lastSync: "15 min atrás" },
                  { name: "Contabilidade", status: "ativo", lastSync: "10 min atrás" },
                  { name: "Recursos Humanos", status: "ativo", lastSync: "3 min atrás" }
                ].map((system, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        system.status === 'ativo' ? 'bg-green-500' : 
                        system.status === 'alerta' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <h4 className="font-medium">{system.name}</h4>
                        <p className="text-sm text-muted-foreground">Sincronizado {system.lastSync}</p>
                      </div>
                    </div>
                    <Badge variant={system.status === 'ativo' ? 'default' : 'secondary'}>
                      {system.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suporte 24/7</CardTitle>
                <CardDescription>Central de suporte dedicado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900">Consultor Dedicado</h4>
                  <p className="text-sm text-green-700 mt-1">João Silva - Especialista SmartDoc</p>
                  <p className="text-sm text-green-700">Telefone: (11) 99999-9999</p>
                  <p className="text-sm text-green-700">Email: joao.silva@smartdoc.com</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Tempo Médio de Resposta</span>
                    <span className="font-semibold text-green-600">< 5 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">SLA de Resolução</span>
                    <span className="font-semibold text-blue-600">97.8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Disponibilidade do Sistema</span>
                    <span className="font-semibold text-green-600">99.94%</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Contatar Suporte
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}