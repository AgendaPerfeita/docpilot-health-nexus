
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Printer, Plus, Calendar, User } from 'lucide-react'
import { useDocumentos } from '@/hooks/useDocumentos'

interface DocumentsSectionProps {
  pacienteId?: string;
}

export function DocumentsSection({ pacienteId }: DocumentsSectionProps) {
  const { documentos, templates, loading, criarDocumento } = useDocumentos();
  const [newDocument, setNewDocument] = useState({
    tipo: '' as 'atestado' | 'receita' | 'relatório' | 'declaração' | 'solicitação' | 'laudo' | '',
    titulo: '',
    conteudo: '',
    validade: ''
  });

  // Filter documents by patient if provided
  const filteredDocuments = pacienteId 
    ? documentos.filter(doc => doc.paciente_id === pacienteId)
    : documentos;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-yellow-100 text-yellow-800'
      case 'finalizado': return 'bg-blue-100 text-blue-800'
      case 'assinado': return 'bg-green-100 text-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'atestado': return 'bg-red-100 text-red-800'
      case 'receita': return 'bg-blue-100 text-blue-800'
      case 'relatório': return 'bg-green-100 text-green-800'
      case 'declaração': return 'bg-purple-100 text-purple-800'
      case 'solicitação': return 'bg-orange-100 text-orange-800'
      case 'laudo': return 'bg-teal-100 text-teal-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateDocument = async () => {
    if (!pacienteId || !newDocument.tipo || !newDocument.titulo || !newDocument.conteudo) {
      return;
    }

    try {
      await criarDocumento({
        paciente_id: pacienteId,
        tipo: newDocument.tipo,
        titulo: newDocument.titulo,
        conteudo: newDocument.conteudo,
        validade_ate: newDocument.validade || undefined,
        status: 'rascunho',
        assinado: false
      });

      setNewDocument({
        tipo: '',
        titulo: '',
        conteudo: '',
        validade: ''
      });
    } catch (error) {
      console.error('Erro ao criar documento:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
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
              {pacienteId && <TabsTrigger value="novo">Novo Documento</TabsTrigger>}
              <TabsTrigger value="modelos">Modelos</TabsTrigger>
            </TabsList>

            <TabsContent value="lista" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Documentos Gerados</h3>
                {pacienteId && (
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Documento
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {filteredDocuments.map((document) => (
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
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{document.conteudo}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(document.created_at).toLocaleDateString('pt-BR')}
                            </div>
                            {document.validade_ate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Válido até: {new Date(document.validade_ate).toLocaleDateString('pt-BR')}
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

                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum documento encontrado</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {pacienteId && (
              <TabsContent value="novo" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Criar Novo Documento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Tipo de Documento</label>
                        <Select value={newDocument.tipo} onValueChange={(value: typeof newDocument.tipo) => setNewDocument({...newDocument, tipo: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="atestado">Atestado Médico</SelectItem>
                            <SelectItem value="receita">Receita Médica</SelectItem>
                            <SelectItem value="relatório">Relatório Médico</SelectItem>
                            <SelectItem value="declaração">Declaração</SelectItem>
                            <SelectItem value="solicitação">Solicitação de Exames</SelectItem>
                            <SelectItem value="laudo">Laudo Médico</SelectItem>
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
                    
                    {newDocument.tipo === 'atestado' && (
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
            )}

            <TabsContent value="modelos" className="space-y-4">
              <h3 className="text-lg font-semibold">Modelos de Documentos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h4 className="font-medium">{template.nome}</h4>
                      <Badge variant="outline" className="mt-1">{template.tipo}</Badge>
                      <Button variant="outline" size="sm" className="mt-2">
                        Usar Modelo
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {templates.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum modelo disponível</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
