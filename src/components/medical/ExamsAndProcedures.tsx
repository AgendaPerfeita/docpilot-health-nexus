
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { TestTube, Calendar, Download, Plus, Search, ChevronDown, X, Clock, FileText } from 'lucide-react'
import { useExames } from '@/hooks/useExames'
import { cn } from '@/lib/utils'
import type { CheckedState } from '@radix-ui/react-checkbox'

interface ExamsAndProceduresProps {
  pacienteId?: string
}

export function ExamsAndProcedures({ pacienteId }: ExamsAndProceduresProps) {
  const { catalogoExames, solicitacoes, loading, fetchCatalogoExames, criarSolicitacao } = useExames()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExames, setSelectedExames] = useState<any[]>([])
  const [indicacaoClinica, setIndicacaoClinica] = useState('')
  const [convenio, setConvenio] = useState('')
  const [urgente, setUrgente] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const [openCombobox, setOpenCombobox] = useState(false)

  const handleSearchExames = (search: string) => {
    setSearchTerm(search)
    if (search.length > 2) {
      fetchCatalogoExames(search)
    }
  }

  const handleSelectExame = (exame: any) => {
    if (!selectedExames.find(e => e.id === exame.id)) {
      setSelectedExames([...selectedExames, exame])
    }
    setOpenCombobox(false)
  }

  const handleRemoveExame = (exameId: string) => {
    setSelectedExames(selectedExames.filter(e => e.id !== exameId))
  }

  const handleSolicitarExames = async () => {
    if (selectedExames.length === 0 || !pacienteId) return

    try {
      await criarSolicitacao({
        paciente_id: pacienteId,
        exames: selectedExames,
        indicacao_clinica: indicacaoClinica,
        convenio: convenio || undefined,
        urgente,
        status: 'solicitado',
        observacoes: observacoes || undefined
      })

      // Reset form
      setSelectedExames([])
      setIndicacaoClinica('')
      setConvenio('')
      setUrgente(false)
      setObservacoes('')
    } catch (error) {
      console.error('Erro ao solicitar exames:', error)
    }
  }

  // Função para lidar com mudanças no checkbox
  const handleUrgenteChange = (checked: CheckedState) => {
    setUrgente(checked === true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solicitado': return 'bg-yellow-100 text-yellow-800'
      case 'coletado': return 'bg-blue-100 text-blue-800'
      case 'resultado_disponivel': return 'bg-green-100 text-green-800'
      case 'analisado': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'Laboratorial': return 'bg-red-100 text-red-800'
      case 'Imagem': return 'bg-blue-100 text-blue-800'
      case 'Funcional': return 'bg-green-100 text-green-800'
      case 'Procedimento': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const modelos = [
    { nome: 'Checkup Completo', exames: ['Hemograma Completo', 'Glicemia de Jejum', 'Colesterol Total', 'ECG'] },
    { nome: 'Perfil Lipídico', exames: ['Colesterol Total', 'HDL Colesterol', 'LDL Colesterol', 'Triglicerídeos'] },
    { nome: 'Função Renal', exames: ['Ureia', 'Creatinina'] },
    { nome: 'Tireoide', exames: ['TSH', 'T4 Livre'] }
  ]

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
          <Tabs defaultValue="solicitar" className="space-y-4">
            <TabsList>
              <TabsTrigger value="solicitar">Solicitar Exame</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="solicitar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nova Solicitação de Exames</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Campo de busca principal */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Buscar Exames</label>
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className="w-full justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Digite o nome do exame ou código...
                          </span>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Buscar exame..."
                            onValueChange={handleSearchExames}
                          />
                          <CommandList>
                            <CommandEmpty>Nenhum exame encontrado.</CommandEmpty>
                            <CommandGroup>
                              {catalogoExames.map((exame) => (
                                <CommandItem
                                  key={exame.id}
                                  onSelect={() => handleSelectExame(exame)}
                                  className="cursor-pointer"
                                >
                                  <div className="flex flex-col w-full">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{exame.nome}</span>
                                      <Badge className={getCategoriaColor(exame.categoria)}>
                                        {exame.categoria}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-gray-500 flex gap-2">
                                      {exame.codigo_tuss && <span>TUSS: {exame.codigo_tuss}</span>}
                                      {exame.subcategoria && <span>• {exame.subcategoria}</span>}
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Botão usar modelo */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium">Modelos rápidos:</span>
                    {modelos.map((modelo) => (
                      <Button
                        key={modelo.nome}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const examesToAdd = catalogoExames.filter(e => 
                            modelo.exames.includes(e.nome) && 
                            !selectedExames.find(se => se.id === e.id)
                          )
                          setSelectedExames([...selectedExames, ...examesToAdd])
                        }}
                      >
                        {modelo.nome}
                      </Button>
                    ))}
                  </div>

                  {/* Exames selecionados */}
                  {selectedExames.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Exames Selecionados ({selectedExames.length})</label>
                      <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                        {selectedExames.map((exame) => (
                          <div key={exame.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <Badge className={getCategoriaColor(exame.categoria)} variant="secondary">
                                {exame.categoria}
                              </Badge>
                              <span className="text-sm font-medium">{exame.nome}</span>
                              {exame.codigo_tuss && (
                                <span className="text-xs text-gray-500">({exame.codigo_tuss})</span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveExame(exame.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Indicação clínica */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Indicação Clínica</label>
                    <Textarea
                      placeholder="Descreva a indicação clínica para os exames..."
                      value={indicacaoClinica}
                      onChange={(e) => setIndicacaoClinica(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Convênio e urgente */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Convênio</label>
                      <Input
                        placeholder="Nome do convênio..."
                        value={convenio}
                        onChange={(e) => setConvenio(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="urgente"
                        checked={urgente}
                        onCheckedChange={handleUrgenteChange}
                      />
                      <label htmlFor="urgente" className="text-sm font-medium">
                        Exame Urgente
                      </label>
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Observações</label>
                    <Textarea
                      placeholder="Observações adicionais..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-2">
                    <Button 
                      className="gap-2" 
                      onClick={handleSolicitarExames}
                      disabled={selectedExames.length === 0}
                    >
                      <Plus className="h-4 w-4" />
                      Solicitar Exames ({selectedExames.length})
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Gerar Requisição
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historico" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar solicitações..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">Filtros</Button>
              </div>

              <div className="space-y-3">
                {solicitacoes.map((solicitacao) => (
                  <Card key={solicitacao.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(solicitacao.status)}>
                              {solicitacao.status === 'solicitado' && 'Solicitado'}
                              {solicitacao.status === 'coletado' && 'Coletado'}
                              {solicitacao.status === 'resultado_disponivel' && 'Resultado Disponível'}
                              {solicitacao.status === 'analisado' && 'Analisado'}
                            </Badge>
                            {solicitacao.urgente && (
                              <Badge variant="destructive">Urgente</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            Solicitado em: {new Date(solicitacao.data_solicitacao).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {solicitacao.status === 'resultado_disponivel' && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="h-3 w-3" />
                              Baixar Resultado
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <strong>Exames solicitados:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Array.isArray(solicitacao.exames) && solicitacao.exames.map((exame: any, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {exame.nome || exame}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {solicitacao.indicacao_clinica && (
                          <div className="text-sm">
                            <strong>Indicação:</strong> {solicitacao.indicacao_clinica}
                          </div>
                        )}
                        
                        {solicitacao.convenio && (
                          <div className="text-sm">
                            <strong>Convênio:</strong> {solicitacao.convenio}
                          </div>
                        )}

                        {solicitacao.data_resultado && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <Clock className="h-3 w-3" />
                            Resultado em: {new Date(solicitacao.data_resultado).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {solicitacoes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma solicitação de exames encontrada</p>
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
