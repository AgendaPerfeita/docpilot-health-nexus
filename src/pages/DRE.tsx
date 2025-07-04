import { useState } from "react"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Download, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

interface DREData {
  periodo: string
  receitas: {
    consultas: number
    exames: number
    procedimentos: number
    outros: number
  }
  custos: {
    materiaisMedicos: number
    laboratorio: number
    equipamentos: number
  }
  despesas: {
    salarios: number
    aluguel: number
    utilities: number
    marketing: number
    administrativas: number
    outras: number
  }
}

const mockDREData: DREData[] = [
  {
    periodo: '2024-01',
    receitas: {
      consultas: 15000,
      exames: 8000,
      procedimentos: 12000,
      outros: 2000
    },
    custos: {
      materiaisMedicos: 3000,
      laboratorio: 2000,
      equipamentos: 1500
    },
    despesas: {
      salarios: 8000,
      aluguel: 3000,
      utilities: 800,
      marketing: 1200,
      administrativas: 600,
      outras: 400
    }
  },
  {
    periodo: '2023-12',
    receitas: {
      consultas: 14000,
      exames: 7500,
      procedimentos: 11000,
      outros: 1800
    },
    custos: {
      materiaisMedicos: 2800,
      laboratorio: 1900,
      equipamentos: 1400
    },
    despesas: {
      salarios: 8000,
      aluguel: 3000,
      utilities: 750,
      marketing: 1000,
      administrativas: 550,
      outras: 350
    }
  }
]

export default function DRE() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01')
  const [comparisonPeriod, setComparisonPeriod] = useState('2023-12')

  const currentData = mockDREData.find(d => d.periodo === selectedPeriod) || mockDREData[0]
  const comparisonData = mockDREData.find(d => d.periodo === comparisonPeriod) || mockDREData[1]

  const calculateTotals = (data: DREData) => {
    const receitaBruta = Object.values(data.receitas).reduce((sum, value) => sum + value, 0)
    const custosVariaveis = Object.values(data.custos).reduce((sum, value) => sum + value, 0)
    const receitaLiquida = receitaBruta - custosVariaveis
    const despesasFixas = Object.values(data.despesas).reduce((sum, value) => sum + value, 0)
    const lucroLiquido = receitaLiquida - despesasFixas
    
    const margemBruta = (receitaLiquida / receitaBruta) * 100
    const margemLiquida = (lucroLiquido / receitaBruta) * 100
    
    return {
      receitaBruta,
      custosVariaveis,
      receitaLiquida,
      despesasFixas,
      lucroLiquido,
      margemBruta,
      margemLiquida
    }
  }

  const currentTotals = calculateTotals(currentData)
  const comparisonTotals = calculateTotals(comparisonData)

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">DRE - Demonstrativo de Resultado</h1>
          <p className="text-muted-foreground">Análise financeira detalhada da clínica</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">Janeiro 2024</SelectItem>
              <SelectItem value="2023-12">Dezembro 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Receita Bruta</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(currentTotals.receitaBruta)}
            </div>
            <div className={`text-sm ${calculateGrowth(currentTotals.receitaBruta, comparisonTotals.receitaBruta) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calculateGrowth(currentTotals.receitaBruta, comparisonTotals.receitaBruta) >= 0 ? '+' : ''}{formatPercentage(calculateGrowth(currentTotals.receitaBruta, comparisonTotals.receitaBruta))} vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Receita Líquida</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(currentTotals.receitaLiquida)}
            </div>
            <div className={`text-sm ${calculateGrowth(currentTotals.receitaLiquida, comparisonTotals.receitaLiquida) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calculateGrowth(currentTotals.receitaLiquida, comparisonTotals.receitaLiquida) >= 0 ? '+' : ''}{formatPercentage(calculateGrowth(currentTotals.receitaLiquida, comparisonTotals.receitaLiquida))} vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Lucro Líquido</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(currentTotals.lucroLiquido)}
            </div>
            <div className={`text-sm ${calculateGrowth(currentTotals.lucroLiquido, comparisonTotals.lucroLiquido) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calculateGrowth(currentTotals.lucroLiquido, comparisonTotals.lucroLiquido) >= 0 ? '+' : ''}{formatPercentage(calculateGrowth(currentTotals.lucroLiquido, comparisonTotals.lucroLiquido))} vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Margem Líquida</span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {formatPercentage(currentTotals.margemLiquida)}
            </div>
            <div className={`text-sm ${(currentTotals.margemLiquida - comparisonTotals.margemLiquida) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(currentTotals.margemLiquida - comparisonTotals.margemLiquida) >= 0 ? '+' : ''}{formatPercentage(currentTotals.margemLiquida - comparisonTotals.margemLiquida)} vs mês anterior
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Receitas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Consultas</span>
                <span className="font-medium">{formatCurrency(currentData.receitas.consultas)}</span>
              </div>
              <Progress 
                value={(currentData.receitas.consultas / currentTotals.receitaBruta) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Exames</span>
                <span className="font-medium">{formatCurrency(currentData.receitas.exames)}</span>
              </div>
              <Progress 
                value={(currentData.receitas.exames / currentTotals.receitaBruta) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Procedimentos</span>
                <span className="font-medium">{formatCurrency(currentData.receitas.procedimentos)}</span>
              </div>
              <Progress 
                value={(currentData.receitas.procedimentos / currentTotals.receitaBruta) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Outros</span>
                <span className="font-medium">{formatCurrency(currentData.receitas.outros)}</span>
              </div>
              <Progress 
                value={(currentData.receitas.outros / currentTotals.receitaBruta) * 100} 
                className="h-2"
              />
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center font-bold">
                <span>Total Receitas</span>
                <span>{formatCurrency(currentTotals.receitaBruta)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Custos e Despesas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 text-muted-foreground">Custos Variáveis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Materiais Médicos</span>
                  <span>{formatCurrency(currentData.custos.materiaisMedicos)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Laboratório</span>
                  <span>{formatCurrency(currentData.custos.laboratorio)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Equipamentos</span>
                  <span>{formatCurrency(currentData.custos.equipamentos)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <h4 className="font-medium mb-3 text-muted-foreground">Despesas Fixas</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Salários</span>
                  <span>{formatCurrency(currentData.despesas.salarios)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aluguel</span>
                  <span>{formatCurrency(currentData.despesas.aluguel)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Utilities</span>
                  <span>{formatCurrency(currentData.despesas.utilities)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marketing</span>
                  <span>{formatCurrency(currentData.despesas.marketing)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Administrativas</span>
                  <span>{formatCurrency(currentData.despesas.administrativas)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outras</span>
                  <span>{formatCurrency(currentData.despesas.outras)}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between items-center font-bold">
                <span>Total Custos/Despesas</span>
                <span>{formatCurrency(currentTotals.custosVariaveis + currentTotals.despesasFixas)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo DRE - {new Date(selectedPeriod).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="font-medium">Descrição</div>
              <div className="font-medium text-center">Valor</div>
              <div className="font-medium text-center">% da Receita</div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 py-2 border-b">
                <div className="font-medium text-green-600">Receita Bruta</div>
                <div className="text-center">{formatCurrency(currentTotals.receitaBruta)}</div>
                <div className="text-center">100.0%</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-2 border-b">
                <div className="text-red-600">(-) Custos Variáveis</div>
                <div className="text-center">{formatCurrency(currentTotals.custosVariaveis)}</div>
                <div className="text-center">{formatPercentage((currentTotals.custosVariaveis / currentTotals.receitaBruta) * 100)}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-2 border-b">
                <div className="font-medium text-blue-600">Receita Líquida</div>
                <div className="text-center font-medium">{formatCurrency(currentTotals.receitaLiquida)}</div>
                <div className="text-center font-medium">{formatPercentage(currentTotals.margemBruta)}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-2 border-b">
                <div className="text-red-600">(-) Despesas Fixas</div>
                <div className="text-center">{formatCurrency(currentTotals.despesasFixas)}</div>
                <div className="text-center">{formatPercentage((currentTotals.despesasFixas / currentTotals.receitaBruta) * 100)}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-3 border-b-2 border-foreground">
                <div className="font-bold text-lg text-purple-600">Lucro Líquido</div>
                <div className="text-center font-bold text-lg">{formatCurrency(currentTotals.lucroLiquido)}</div>
                <div className="text-center font-bold text-lg">{formatPercentage(currentTotals.margemLiquida)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}