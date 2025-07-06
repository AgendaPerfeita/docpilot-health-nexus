
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Printer, Plus, Calendar, User } from 'lucide-react'

interface Document {
  id: string
  tipo: 'Atestado' | 'Receita' | 'Relatório' | 'Declaração' | 'Solicitação'
  titulo: string
  conteudo: string
  data: string
  status: 'Rascunho' | 'Finalizado' | 'Assinado'
  validade?: string
}

const mockDocuments: Document[] = [
  {
    id: '1',
    tipo: 'Atestado',
    titulo: 'Atestado Médico',
    conteudo: 'Atesto que o paciente necessita de afastamento por 3 dias devido a quadro gripal.',
    data: '04/07/2025',
    status: 'Assinado',
    validade: '07/07/2025'
  },
  {
    id: '2',
    tipo: 'Solicitação',
    titulo: 'Solicitação de Exames',
    conteudo: 'Solicito realização de hemograma completo e glicemia de jejum.',
    data: '04/07/2025',
    status: 'Finalizado'
  }
]

export function DocumentsSection() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [newDocument, setNewDocument] = useState({
    tipo: '' as Document['tipo'] | '',
    titulo: '',
    conteudo: '',
    validade: ''
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Rascunho': return 'bg-yellow-100 text-yellow-800'
      case 'Finalizado': return 'bg-blue-100 text-blue-800'
      case 'Assinado': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Atestado': return 'bg-red-100 text-red-800'
      case 'Receita': return 'bg-blue-100 text-blue-800'
      case 'Relatório': return 'bg-green-100 text-green-800'
      case 'Declaração': return 'bg-purple-100 text-purple-800'
      case 'Solicitação': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateDocument = () => {
    if (newDocument.tipo && newDocument.titulo && newDocument.conteudo) {
      const document: Document = {
        id: Date.now().toString(),
        tipo: newDocument.tipo,
        titulo: newDocument.titulo,
        conteudo: newDocument.conteudo,
        data: new Date().toLocaleDateString('pt-BR'),
        status: 'Rascunho',
        validade: newDocument.validade || undefined
      }
      setDocuments([...documents, document])
      setNewDocument({
        tipo: '',
        titulo: '',
        conteudo: '',
        validade: ''
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos e Atestados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="lista" className="space-y-4">
            <TabsList>
              <TabsTrigger value="lista">Documentos</TabsTrigger>
              <TabsTrigger value="novo">Novo Documento</TabsTrigger>
              <TabsTrigger value="modelos">Modelos</TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Documentos Gerados</h3>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Documento
                </Button>
              </div>

              <div className="space-y-3">
                {documents.map((document) => (
                  <Card key={document.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{document.titulo}</h4>
                            <Badge className={getTipoColor(document.tipo)}>
                              {document.tipo}
                            </Badge>
                            <Badge className={getStatusColor(document.status)}>
                              {document.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{document.conteudo}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {document.data}
                            </div>
                            {document.validade && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Válido até: {document.validade}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-3 w-3" />
                            PDF
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1">
                            <Printer className="h-3 w-3" />
                            Imprimir
                          </Button>
                          <Button variant="outline" size="sm">
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="novo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Documento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Tipo de Documento</label>
                      <Select value={newDocument.tipo} onValueChange={(value: Document['tipo']) => setNewDocument({...newDocument, tipo: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Atestado">Atestado Médico</SelectItem>
                          <SelectItem value="Receita">Receita Médica</SelectItem>
                          <SelectItem value="Relatório">Relatório Médico</SelectItem>
                          <SelectItem value="Declaração">Declaração</SelectItem>
                          <SelectItem value="Solicitação">Solicitação de Exames</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Título</label>
                      <Input
                        placeholder="Título do documento"
                        value={newDocument.titulo}
                        onChange={(e) => setNewDocument({...newDocument, titulo: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {newDocument.tipo === 'Atestado' && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Validade (opcional)</label>
                      <Input
                        type="date"
                        value={newDocument.validade}
                        onChange={(e) => setNewDocument({...newDocument, validade: e.target.value})}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-1 block">Conteúdo</label>
                    <Textarea
                      placeholder="Digite o conteúdo do documento..."
                      value={newDocument.conteudo}
                      onChange={(e) => setNewDocument({...newDocument, conteudo: e.target.value})}
                      rows={6}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCreateDocument} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Documento
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Pré-visualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="modelos" className="space-y-4">
              <h3 className="text-lg font-semibold">Modelos de Documentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Atestado Simples', 'Atestado de Comparecimento', 'Relatório de Consulta', 'Solicitação de Exames', 'Declaração de Saúde'].map((modelo) => (
                  <Card key={modelo} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h4 className="font-medium">{modelo}</h4>
                      <Button variant="outline" size="sm" className="mt-2">
                        Usar Modelo
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
