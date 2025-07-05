
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PhysicalExam {
  geral: string
  cardiovascular: string
  respiratorio: string
  abdominal: string
  neurologico: string
  pele: string
  orl: string
  outros: string
}

interface PhysicalExamSectionProps {
  exame: PhysicalExam
  onChange: (field: keyof PhysicalExam, value: string) => void
  isRequired?: boolean
}

export function PhysicalExamSection({ exame, onChange, isRequired }: PhysicalExamSectionProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Exame Físico Dirigido {isRequired && <span className="text-red-500">*</span>}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="cardiovascular">CV</TabsTrigger>
            <TabsTrigger value="respiratorio">Resp</TabsTrigger>
            <TabsTrigger value="abdominal">Abd</TabsTrigger>
            <TabsTrigger value="neurologico">Neuro</TabsTrigger>
            <TabsTrigger value="pele">Pele</TabsTrigger>
            <TabsTrigger value="orl">ORL</TabsTrigger>
            <TabsTrigger value="outros">Outros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="geral" className="mt-4">
            <Label htmlFor="exame_geral">Estado Geral, Hidratação, Consciência</Label>
            <Textarea
              id="exame_geral"
              placeholder="Ex: Paciente em bom estado geral, hidratado, consciente e orientado..."
              value={exame.geral}
              onChange={(e) => onChange('geral', e.target.value)}
              rows={3}
            />
          </TabsContent>
          
          <TabsContent value="cardiovascular" className="mt-4">
            <Label htmlFor="exame_cv">Ausculta Cardíaca</Label>
            <Textarea
              id="exame_cv"
              placeholder="Ex: Ritmo cardíaco regular, bulhas normofonéticas, sem sopros..."
              value={exame.cardiovascular}
              onChange={(e) => onChange('cardiovascular', e.target.value)}
              rows={3}
            />
          </TabsContent>
          
          <TabsContent value="respiratorio" className="mt-4">
            <Label htmlFor="exame_resp">Ausculta Pulmonar</Label>
            <Textarea
              id="exame_resp"
              placeholder="Ex: Murmúrio vesicular presente bilateralmente, sem ruído adventício..."
              value={exame.respiratorio}
              onChange={(e) => onChange('respiratorio', e.target.value)}
              rows={3}
            />
          </TabsContent>
          
          <TabsContent value="abdominal" className="mt-4">
            <Label htmlFor="exame_abd">Exame Abdominal</Label>
            <Textarea
              id="exame_abd"
              placeholder="Ex: Abdome plano, ruídos hidroaéreos presentes, indolor à palpação..."
              value={exame.abdominal}
              onChange={(e) => onChange('abdominal', e.target.value)}
              rows={3}
            />
          </TabsContent>
          
          <TabsContent value="neurologico" className="mt-4">
            <Label htmlFor="exame_neuro">Exame Neurológico</Label>
            <Textarea
              id="exame_neuro"
              placeholder="Ex: Consciente, orientado, força muscular preservada, reflexos normais..."
              value={exame.neurologico}
              onChange={(e) => onChange('neurologico', e.target.value)}
              rows={3}
            />
          </TabsContent>
          
          <TabsContent value="pele" className="mt-4">
            <Label htmlFor="exame_pele">Pele e Mucosas</Label>
            <Textarea
              id="exame_pele"
              placeholder="Ex: Pele normocorada, sem lesões, mucosas úmidas e coradas..."
              value={exame.pele}
              onChange={(e) => onChange('pele', e.target.value)}
              rows={3}
            />
          </TabsContent>
          
          <TabsContent value="orl" className="mt-4">
            <Label htmlFor="exame_orl">Otorrinolaringológico</Label>
            <Textarea
              id="exame_orl"
              placeholder="Ex: Orofaringe sem alterações, tímpanos íntegros..."
              value={exame.orl}
              onChange={(e) => onChange('orl', e.target.value)}
              rows={3}
            />
          </TabsContent>
          
          <TabsContent value="outros" className="mt-4">
            <Label htmlFor="exame_outros">Outros Achados</Label>
            <Textarea
              id="exame_outros"
              placeholder="Outros achados relevantes do exame físico..."
              value={exame.outros}
              onChange={(e) => onChange('outros', e.target.value)}
              rows={3}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
