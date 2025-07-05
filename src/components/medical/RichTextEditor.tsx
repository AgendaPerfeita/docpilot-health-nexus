
import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, FileText, History, Lightbulb, Volume2, VolumeX } from 'lucide-react'
import { callGeminiAPI } from "@/lib/gemini"

interface RichTextEditorProps {
  title: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  showAIFeatures?: boolean
  patientData?: any
}

export function RichTextEditor({ 
  title, 
  value, 
  onChange, 
  placeholder, 
  rows = 4, 
  showAIFeatures = false,
  patientData 
}: RichTextEditorProps) {
  const [isListening, setIsListening] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const templates = [
    {
      name: "Dor Abdominal",
      content: "Paciente refere dor abdominal localizada em [região], de caráter [tipo da dor], com início há [tempo], irradiação para [local], fatores de melhora/piora: [fatores]. Sintomas associados: [sintomas]."
    },
    {
      name: "Cefaleia",
      content: "Cefaleia de localização [local], intensidade [0-10], caráter [pulsátil/em peso/latejante], com início há [tempo]. Fatores desencadeantes: [fatores]. Sintomas neurológicos associados: [sintomas]."
    },
    {
      name: "Tosse",
      content: "Tosse [seca/produtiva] há [tempo], com expectoração [características se produtiva]. Fatores de melhora/piora: [fatores]. Sintomas respiratórios associados: [dispneia/sibilos/dor torácica]."
    }
  ]

  const generateAISuggestions = async () => {
    if (!value.trim() || !showAIFeatures) return
    
    setIsLoadingSuggestions(true)
    try {
      const prompt = `
        Como assistente médico, analise o texto a seguir e forneça 3 sugestões de melhoria ou complemento para torná-lo mais completo e profissional:

        Texto atual: "${value}"
        
        Contexto do paciente: ${patientData ? JSON.stringify(patientData) : 'Não disponível'}

        Forneça apenas as sugestões numeradas, de forma direta e concisa:
      `
      
      const response = await callGeminiAPI(prompt)
      const suggestions = response.split('\n').filter(line => line.trim() && /^\d+/.test(line.trim()))
      setAiSuggestions(suggestions.slice(0, 3))
    } catch (error) {
      console.error('Erro ao gerar sugestões:', error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const applySuggestion = (suggestion: string) => {
    const cleanSuggestion = suggestion.replace(/^\d+\.\s*/, '').trim()
    onChange(value + '\n\n' + cleanSuggestion)
    setAiSuggestions([])
  }

  const insertTemplate = (template: typeof templates[0]) => {
    const cursorPosition = textareaRef.current?.selectionStart || value.length
    const newValue = value.slice(0, cursorPosition) + template.content + value.slice(cursorPosition)
    onChange(newValue)
  }

  const startDictation = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'pt-BR'
      
      recognition.onstart = () => {
        setIsListening(true)
      }
      
      recognition.onresult = (event: any) => {
        let transcript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript
          }
        }
        if (transcript) {
          onChange(value + ' ' + transcript)
        }
      }
      
      recognition.onerror = () => {
        setIsListening(false)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognition.start()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex gap-2">
            {showAIFeatures && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAISuggestions}
                  disabled={isLoadingSuggestions}
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  {isLoadingSuggestions ? 'Gerando...' : 'Sugestões IA'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startDictation}
                  disabled={isListening}
                >
                  {isListening ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {isListening ? 'Ouvindo...' : 'Ditado'}
                </Button>
              </>
            )}
            <Button variant="outline" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Salvar Modelo
            </Button>
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-1" />
              Histórico
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Templates */}
        <div className="flex flex-wrap gap-2">
          {templates.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => insertTemplate(template)}
            >
              {template.name}
            </Button>
          ))}
        </div>

        {/* Editor */}
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="min-h-[120px] resize-y"
        />

        {/* Sugestões da IA */}
        {aiSuggestions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Sugestões da IA:</div>
            {aiSuggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex-1 text-sm text-gray-700">{suggestion}</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => applySuggestion(suggestion)}
                >
                  Aplicar
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Estatísticas */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{value.length} caracteres</span>
          <span>{value.split(/\s+/).filter(w => w.length > 0).length} palavras</span>
          {isListening && (
            <Badge variant="secondary" className="animate-pulse">
              🎤 Gravando...
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
