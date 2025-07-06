
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TestTube, FileText, Calendar, Download, Upload, Plus, Search } from 'lucide-react'

interface Exam {
  id: string
  nome: string
  tipo: 'Laboratorial' | 'Imagem' | 'Funcional'
  status: 'Solicitado' | 'Coletado' | 'Resultado' | 'Analisado'
  dataSolicitacao: string
  dataResultado?: string
  resultado?: string
  observacoes: string
}

const mockExams: Exam[] = [
  {
    id: '1',
    nome: 'Hemograma Completo',
    tipo: 'Laboratorial',
    status: 'Resultado',
    dataSolicitacao: '04/07/2025',
    dataResultado: '05/07/2025',
    resultado: 'Valores dentro da normalidade',
    observacoes: 'Controle de rotina'
  },
  {
    id: '2',
    nome: 'Raio-X Tórax',
    tipo: 'Imagem',
    status: 'Solicitado',
    dataSolicitacao: '04/07/2025',
    observacoes: 'Investigação de tosse persistente'
  }
]

export function ExamsAndProcedures() {
  const [exams, setExams] = useState<Exam[]>(mockExams)
  const [searchTerm, setSearchTerm] = useState('')
  const [newExam, setNewExam] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Solicitado': return 'bg-yellow-100 text-yellow-800'
      case 'Coletado': return 'bg-blue-100 text-blue-800'
      case 'Resultado': return 'bg-green-100 text-green-800'
      case 'Analisado': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Laboratorial': return 'bg-red-100 text-red-800'
      case 'Imagem': return 'bg-blue-100 text-blue-800'
      case 'Funcional': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredExams = exams.filter(exam =>
    exam.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Exames e Procedimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="lista" className="space-y-4">
            <TabsList>
              <TabsTrigger value="lista">Lista de Exames</TabsTrigger>
              <TabsTrigger value="solicitar">Solicitar Exame</TabsTrigger>
              <TabsTrigger value="resultados">Resultados</TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar exames..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Exame
                </Button>
              </div>

              <div className="space-y-3">
                {filteredExams.map((exam) => (
                  <Card key={exam.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{exam.nome}</h4>
                          <div className="flex gap-2 mt-1">
                            <Badge className={getTipoColor(exam.tipo)}>
                              {exam.tipo}
                            </Badge>
                            <Badge className={getStatusColor(exam.status)}>
                              {exam.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {exam.status === 'Resultado' && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="h-3 w-3" />
                              Baixar
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Solicitado em: {exam.dataSolicitacao}
                        </div>
                        {exam.dataResultado && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Resultado em: {exam.dataResultado}
                          </div>
                        )}
                        <p><strong>Observações:</strong> {exam.observacoes}</p>
                        {exam.resultado && (
                          <p><strong>Resultado:</strong> {exam.resultado}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="solicitar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Novo Exame</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Nome do exame..."
                    value={newExam}
                    onChange={(e) => setNewExam(e.target.value)}
                  />
                  <Textarea
                    placeholder="Indicação clínica e observações..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Solicitar Exame
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Gerar Requisição
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resultados" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upload de Resultados</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Arraste arquivos aqui ou clique para selecionar</p>
                    <Button variant="outline">Selecionar Arquivos</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
