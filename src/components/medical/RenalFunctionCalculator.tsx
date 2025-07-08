import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, AlertTriangle } from 'lucide-react'
import { calculateCreatinineClearance, getRenalDoseAdjustment } from '@/lib/medical-calculators'

interface RenalFunctionCalculatorProps {
  age?: number
  weight?: string
  gender?: string
}

export function RenalFunctionCalculator({ age, weight, gender }: RenalFunctionCalculatorProps) {
  const [calculatorData, setCalculatorData] = useState({
    age: age?.toString() || '',
    weight: weight || '',
    creatinine: '',
    gender: gender || ''
  })
  
  const [clearance, setClearance] = useState<number | null>(null)
  const [renalFunction, setRenalFunction] = useState<string>('')

  useEffect(() => {
    const ageNum = parseFloat(calculatorData.age)
    const weightNum = parseFloat(calculatorData.weight)
    const creatinineNum = parseFloat(calculatorData.creatinine)
    
    if (ageNum > 0 && weightNum > 0 && creatinineNum > 0 && calculatorData.gender) {
      const calc = calculateCreatinineClearance(
        ageNum, 
        weightNum, 
        creatinineNum, 
        calculatorData.gender as 'M' | 'F'
      )
      setClearance(calc)
      
      if (calc >= 90) setRenalFunction('Normal')
      else if (calc >= 60) setRenalFunction('Leve redução')
      else if (calc >= 30) setRenalFunction('Moderada redução')
      else if (calc >= 15) setRenalFunction('Severa redução')
      else setRenalFunction('Falência renal')
    } else {
      setClearance(null)
      setRenalFunction('')
    }
  }, [calculatorData])

  const handleChange = (field: string, value: string) => {
    setCalculatorData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getRiskColor = (clearance: number) => {
    if (clearance >= 60) return 'bg-green-100 text-green-800'
    if (clearance >= 30) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          <span className="hidden sm:inline">Calculadora de Função Renal</span>
          <span className="sm:hidden">Função Renal</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div>
            <Label htmlFor="calc_age" className="text-xs">Idade (anos)</Label>
            <Input
              id="calc_age"
              type="number"
              placeholder="65"
              value={calculatorData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="calc_weight" className="text-xs">Peso (kg)</Label>
            <Input
              id="calc_weight"
              type="number"
              placeholder="70"
              value={calculatorData.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label htmlFor="calc_creatinine" className="text-xs">Creatinina (mg/dL)</Label>
            <Input
              id="calc_creatinine"
              type="number"
              step="0.1"
              placeholder="1.2"
              value={calculatorData.creatinine}
              onChange={(e) => handleChange('creatinine', e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Sexo</Label>
            <Select value={calculatorData.gender} onValueChange={(value) => handleChange('gender', value)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {clearance && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium">Clearance:</span>
              <Badge variant="secondary" className={`text-xs ${getRiskColor(clearance)}`}>
                {clearance.toFixed(1)} mL/min
              </Badge>
              <Badge variant="outline" className="text-xs">
                {renalFunction}
              </Badge>
            </div>
            
            {clearance < 60 && (
              <div className="flex items-start gap-2 p-2 bg-orange-50 rounded-md">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-800 min-w-0">
                  <p className="font-medium">Ajuste de dose necessário:</p>
                  <p className="break-words">{getRenalDoseAdjustment(clearance, 'medicamentos')}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}