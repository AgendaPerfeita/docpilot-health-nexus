
import React, { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { FileText, Volume2, VolumeX, FileText as FileTextIcon } from 'lucide-react'

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
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

  const insertTemplates = () => {
    const selectedContent = selectedTemplates
      .map(name => templates.find(t => t.name === name)?.content)
      .filter(Boolean)
      .join('\n\n')
    
    if (selectedContent) {
      const cursorPosition = textareaRef.current?.selectionStart || value.length
      const newValue = value.slice(0, cursorPosition) + selectedContent + value.slice(cursorPosition)
      onChange(newValue)
    }
    
    setSelectedTemplates([])
    setIsModalOpen(false)
  }

  const handleTemplateToggle = (templateName: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateName) 
        ? prev.filter(name => name !== templateName)
        : [...prev, templateName]
    )
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            {title}
          </CardTitle>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {showAIFeatures && (
              <Button
                variant="outline"
                size="sm"
                onClick={startDictation}
                disabled={isListening}
                className="text-xs sm:text-sm"
              >
                {isListening ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{isListening ? 'Ouvindo...' : 'Ditado'}</span>
                <span className="sm:hidden">{isListening ? 'Ouvindo...' : 'Ditado'}</span>
              </Button>
            )}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <FileTextIcon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Usar modelo</span>
                  <span className="sm:hidden">Modelo</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Selecionar modelos</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {templates.map((template, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`template-${index}`}
                        checked={selectedTemplates.includes(template.name)}
                        onCheckedChange={() => handleTemplateToggle(template.name)}
                      />
                      <label
                        htmlFor={`template-${index}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {template.name}
                      </label>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={insertTemplates} disabled={selectedTemplates.length === 0}>
                    Inserir ({selectedTemplates.length})
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Editor */}
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="min-h-[120px] resize-y"
        />

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
