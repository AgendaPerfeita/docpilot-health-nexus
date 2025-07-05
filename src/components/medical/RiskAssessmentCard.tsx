
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, CheckCircle } from "lucide-react"

interface RiskScore {
  name: string
  score: number
  risk: 'baixo' | 'moderado' | 'alto'
  recommendation: string
}

interface RiskAssessmentCardProps {
  riskScores: RiskScore[]
  severityCriteria: {
    sepsis: boolean
    hemodynamicInstability: boolean
    acuteDeterioration: boolean
    internationRecommended: boolean
  }
}

export function RiskAssessmentCard({ riskScores, severityCriteria }: RiskAssessmentCardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'baixo': return 'bg-green-100 text-green-800'
      case 'moderado': return 'bg-yellow-100 text-yellow-800'
      case 'alto': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'baixo': return <CheckCircle className="w-4 h-4" />
      case 'moderado': return <Info className="w-4 h-4" />
      case 'alto': return <AlertTriangle className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  const hasCriticalCriteria = severityCriteria.sepsis || severityCriteria.hemodynamicInstability || severityCriteria.acuteDeterioration

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📋 Classificação de Risco Automática
          {hasCriticalCriteria && <AlertTriangle className="w-5 h-5 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Escores de Risco */}
        <div className="space-y-3 mb-6">
          {riskScores.map((score, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getRiskIcon(score.risk)}
                <div>
                  <h4 className="font-semibold">{score.name}</h4>
                  <p className="text-sm text-gray-600">{score.recommendation}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{score.score}</div>
                <Badge className={getRiskColor(score.risk)}>
                  {score.risk.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Critérios de Gravidade */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            ⚠️ Critérios de Gravidade
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-3 rounded-lg border ${severityCriteria.sepsis ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                {severityCriteria.sepsis ? 
                  <AlertTriangle className="w-4 h-4 text-red-500" /> : 
                  <CheckCircle className="w-4 h-4 text-green-500" />
                }
                <span className={severityCriteria.sepsis ? 'text-red-700 font-semibold' : 'text-gray-700'}>
                  Sinais de Sepse
                </span>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg border ${severityCriteria.hemodynamicInstability ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                {severityCriteria.hemodynamicInstability ? 
                  <AlertTriangle className="w-4 h-4 text-red-500" /> : 
                  <CheckCircle className="w-4 h-4 text-green-500" />
                }
                <span className={severityCriteria.hemodynamicInstability ? 'text-red-700 font-semibold' : 'text-gray-700'}>
                  Instabilidade Hemodinâmica
                </span>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg border ${severityCriteria.acuteDeterioration ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                {severityCriteria.acuteDeterioration ? 
                  <AlertTriangle className="w-4 h-4 text-red-500" /> : 
                  <CheckCircle className="w-4 h-4 text-green-500" />
                }
                <span className={severityCriteria.acuteDeterioration ? 'text-red-700 font-semibold' : 'text-gray-700'}>
                  Risco de Deterioração
                </span>
              </div>
            </div>
            
            <div className={`p-3 rounded-lg border ${severityCriteria.internationRecommended ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                {severityCriteria.internationRecommended ? 
                  <Info className="w-4 h-4 text-orange-500" /> : 
                  <CheckCircle className="w-4 h-4 text-green-500" />
                }
                <span className={severityCriteria.internationRecommended ? 'text-orange-700 font-semibold' : 'text-gray-700'}>
                  Recomendação de Internação
                </span>
              </div>
            </div>
          </div>
        </div>

        {hasCriticalCriteria && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
              <AlertTriangle className="w-5 h-5" />
              ATENÇÃO: Critérios de gravidade presentes
            </div>
            <p className="text-red-600 text-sm">
              Considere avaliação imediata, monitorização intensiva e possível internação hospitalar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
