import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function HistoricoEvolucoes({ evolucoes }) {
  const [selected, setSelected] = useState(null)
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Histórico de Evoluções</CardTitle>
      </CardHeader>
      <CardContent>
        {evolucoes.length === 0 && <div className="text-muted-foreground">Nenhuma evolução registrada.</div>}
        <ul className="divide-y">
          {evolucoes.map(ev => (
            <li key={ev.id} className="py-2 flex items-center justify-between">
              <div>
                <span className="font-medium">{new Date(ev.data).toLocaleDateString('pt-BR')}</span> — {ev.queixa}
              </div>
              <Button size="sm" variant="outline" onClick={() => setSelected(ev)}>Ver detalhes</Button>
            </li>
          ))}
        </ul>
        {selected && (
          <div className="mt-4 border rounded p-4 bg-muted">
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold">Evolução de {new Date(selected.data).toLocaleDateString('pt-BR')}</div>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Fechar</Button>
            </div>
            <div><strong>Queixa:</strong> {selected.queixa}</div>
            <div><strong>História da Doença Atual:</strong> {selected.historia}</div>
            <div><strong>Exame Físico:</strong> {selected.exameFisico}</div>
            <div><strong>Hipótese Diagnóstica:</strong> {selected.hipoteseDiagnostica}</div>
            <div><strong>Conduta/Prescrição:</strong> {selected.conduta}</div>
            {selected.medicamentos && selected.medicamentos.length > 0 && (
              <div className="mt-2">
                <strong>Medicamentos Prescritos:</strong>
                <ul className="list-disc ml-6">
                  {selected.medicamentos.map((med, idx) => (
                    <li key={idx}>
                      {med.nome} — {med.dose}, {med.posologia} ({med.duracao})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 