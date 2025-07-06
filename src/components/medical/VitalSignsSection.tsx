
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface VitalSigns {
  peso: string
  altura: string
  imc: string
  pa_sistolica: string
  pa_diastolica: string
  fc: string
  temp: string
  sat_o2: string
  fr: string
  hgt: string
}

interface VitalSignsSectionProps {
  sinaisVitais: VitalSigns
  onChange: (field: keyof VitalSigns, value: string) => void
  isRequired?: boolean
}

export function VitalSignsSection({ sinaisVitais, onChange, isRequired }: VitalSignsSectionProps) {
  const handlePesoAlturaChange = (field: 'peso' | 'altura', value: string) => {
    onChange(field, value)
    
    // Calcular IMC automaticamente
    const peso = parseFloat(field === 'peso' ? value.replace(',', '.') : sinaisVitais.peso.replace(',', '.'))
    const alturaCm = parseFloat(field === 'altura' ? value.replace(',', '.') : sinaisVitais.altura.replace(',', '.'))
    
    if (!isNaN(peso) && !isNaN(alturaCm) && alturaCm > 0) {
      const alturaM = alturaCm / 100
      const imc = (peso / (alturaM * alturaM)).toFixed(2)
      onChange('imc', imc)
    }
  }

  const getIMCClassification = (imc: string) => {
    const imcValue = parseFloat(imc)
    if (isNaN(imcValue)) return ''
    if (imcValue < 18.5) return 'Abaixo do peso'
    if (imcValue < 25) return 'Normal'
    if (imcValue < 30) return 'Sobrepeso'
    if (imcValue < 35) return 'Obesidade Grau I'
    if (imcValue < 40) return 'Obesidade Grau II'
    return 'Obesidade Grau III'
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Dados Antropométricos e Sinais Vitais {isRequired && <span className="text-red-500">*</span>}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <Label htmlFor="peso">Peso (kg)</Label>
            <Input
              id="peso"
              type="number"
              step="0.1"
              placeholder="70.5"
              value={sinaisVitais.peso}
              onChange={(e) => handlePesoAlturaChange('peso', e.target.value)}
              className={isRequired && !sinaisVitais.peso ? 'border-red-500' : ''}
            />
          </div>
          <div>
            <Label htmlFor="altura">Altura (cm)</Label>
            <Input
              id="altura"
              type="number"
              step="0.1"
              placeholder="170"
              value={sinaisVitais.altura}
              onChange={(e) => handlePesoAlturaChange('altura', e.target.value)}
              className={isRequired && !sinaisVitais.altura ? 'border-red-500' : ''}
            />
          </div>
          <div>
            <Label htmlFor="imc">IMC</Label>
            <Input
              id="imc"
              value={sinaisVitais.imc}
              readOnly
              className="bg-gray-50"
            />
            {sinaisVitais.imc && (
              <p className="text-xs text-gray-600 mt-1">{getIMCClassification(sinaisVitais.imc)}</p>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          <div>
            <Label htmlFor="pa_sistolica">PA Sistólica</Label>
            <Input
              id="pa_sistolica"
              type="number"
              placeholder="120"
              value={sinaisVitais.pa_sistolica}
              onChange={(e) => onChange('pa_sistolica', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="pa_diastolica">PA Diastólica</Label>
            <Input
              id="pa_diastolica"
              type="number"
              placeholder="80"
              value={sinaisVitais.pa_diastolica}
              onChange={(e) => onChange('pa_diastolica', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fc">FC (bpm)</Label>
            <Input
              id="fc"
              type="number"
              placeholder="72"
              value={sinaisVitais.fc}
              onChange={(e) => onChange('fc', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="temp">Temp (°C)</Label>
            <Input
              id="temp"
              type="number"
              step="0.1"
              placeholder="36.5"
              value={sinaisVitais.temp}
              onChange={(e) => onChange('temp', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="sat_o2">Sat O2 (%)</Label>
            <Input
              id="sat_o2"
              type="number"
              placeholder="98"
              value={sinaisVitais.sat_o2}
              onChange={(e) => onChange('sat_o2', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fr">FR (irpm)</Label>
            <Input
              id="fr"
              type="number"
              placeholder="16"
              value={sinaisVitais.fr}
              onChange={(e) => onChange('fr', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hgt">HGT (mg/dL)</Label>
            <Input
              id="hgt"
              type="number"
              placeholder="90"
              value={sinaisVitais.hgt}
              onChange={(e) => onChange('hgt', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
