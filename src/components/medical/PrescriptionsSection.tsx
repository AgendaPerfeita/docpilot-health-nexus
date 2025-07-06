
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pill, Plus, Printer, Download, Trash2, Edit } from 'lucide-react'
import { useProntuarios } from "@/hooks/useProntuarios"

interface PrescriptionsSectionProps {
  pacienteId?: string;
  prontuarioId?: string;
}

export function PrescriptionsSection({ pacienteId, prontuarioId }: PrescriptionsSectionProps) {
  const { prontuarios, loading, adicionarPrescricao, removerPrescricao } = useProntuarios();
  const [newPrescription, setNewPrescription] = useState({
    medicamento: '',
    dosagem: '',
    frequencia: '',
    duracao: '',
    observacoes: ''
  });

  // Get prescriptions from prontuarios
  const allPrescriptions = prontuarios.flatMap(p => 
    (p.prescricoes || []).map(prescricao => ({
      ...prescricao,
      prontuario_id: p.id,
      data: new Date(prescricao.created_at).toLocaleDateString('pt-BR'),
      status: 'Ativa' as const
    }))
  );

  // Filter by patient if provided
  const filteredPrescriptions = pacienteId 
    ? allPrescriptions.filter(p => {
        const prontuario = prontuarios.find(pr => pr.id === p.prontuario_id);
        return prontuario?.paciente_id === pacienteId;
      })
    : allPrescriptions;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': return 'bg-green-100 text-green-800'
      case 'Finalizada': return 'bg-gray-100 text-gray-800'
      case 'Cancelada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddPrescription = async () => {
    if (!prontuarioId || !newPrescription.medicamento || !newPrescription.dosagem) {
      return;
    }

    try {
      await adicionarPrescricao(prontuarioId, newPrescription);
      setNewPrescription({
        medicamento: '',
        dosagem: '',
        frequencia: '',
        duracao: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao adicionar prescrição:', error);
    }
  };

  const handleRemovePrescription = async (prescricaoId: string) => {
    try {
      await removerPrescricao(prescricaoId);
    } catch (error) {
      console.error('Erro ao remover prescrição:', error);
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
            <Pill className="h-5 w-5" />
            Prescrições Médicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ativas" className="space-y-4">
            <TabsList>
              <TabsTrigger value="ativas">Prescrições Ativas</TabsTrigger>
              {prontuarioId && <TabsTrigger value="nova">Nova Prescrição</TabsTrigger>}
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="ativas" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Medicamentos Ativos</h3>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Printer className="h-4 w-4" />
                    Imprimir Receita
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredPrescriptions.filter(p => p.status === 'Ativa').map((prescription) => (
                  <Card key={prescription.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{prescription.medicamento}</h4>
                            <Badge className={getStatusColor(prescription.status)}>
                              {prescription.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Dosagem:</span>
                              <p>{prescription.dosagem}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Frequência:</span>
                              <p>{prescription.frequencia}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Duração:</span>
                              <p>{prescription.duracao}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Data:</span>
                              <p>{prescription.data}</p>
                            </div>
                          </div>
                          {prescription.observacoes && (
                            <div className="mt-2">
                              <span className="font-medium text-gray-600">Observações:</span>
                              <p className="text-sm">{prescription.observacoes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemovePrescription(prescription.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredPrescriptions.filter(p => p.status === 'Ativa').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma prescrição ativa encontrada</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {prontuarioId && (
              <TabsContent value="nova" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Adicionar Nova Prescrição</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Medicamento</label>
                        <Input
                          placeholder="Nome do medicamento"
                          value={newPrescription.medicamento}
                          onChange={(e) => setNewPrescription({...newPrescription, medicamento: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Dosagem</label>
                        <Input
                          placeholder="Ex: 50mg, 1 comprimido"
                          value={newPrescription.dosagem}
                          onChange={(e) => setNewPrescription({...newPrescription, dosagem: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Frequência</label>
                        <Select value={newPrescription.frequencia} onValueChange={(value) => setNewPrescription({...newPrescription, frequencia: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1x ao dia">1x ao dia</SelectItem>
                            <SelectItem value="2x ao dia">2x ao dia</SelectItem>
                            <SelectItem value="3x ao dia">3x ao dia</SelectItem>
                            <SelectItem value="4x ao dia">4x ao dia</SelectItem>
                            <SelectItem value="De 8/8 horas">De 8/8 horas</SelectItem>
                            <SelectItem value="De 12/12 horas">De 12/12 horas</SelectItem>
                            <SelectItem value="SOS">SOS (se necessário)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Duração</label>
                        <Input
                          placeholder="Ex: 7 dias, 30 dias"
                          value={newPrescription.duracao}
                          onChange={(e) => setNewPrescription({...newPrescription, duracao: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Observações</label>
                      <Textarea
                        placeholder="Instruções especiais, horários, restrições..."
                        value={newPrescription.observacoes}
                        onChange={(e) => setNewPrescription({...newPrescription, observacoes: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleAddPrescription} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Prescrição
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="historico" className="space-y-4">
              <h3 className="text-lg font-semibold">Histórico de Prescrições</h3>
              <div className="space-y-3">
                {filteredPrescriptions.map((prescription) => (
                  <Card key={prescription.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{prescription.medicamento} - {prescription.dosagem}</h4>
                          <p className="text-sm text-gray-600">{prescription.frequencia} por {prescription.duracao}</p>
                          <p className="text-xs text-gray-500">Prescrito em {prescription.data}</p>
                        </div>
                        <Badge className={getStatusColor(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredPrescriptions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma prescrição encontrada</p>
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
