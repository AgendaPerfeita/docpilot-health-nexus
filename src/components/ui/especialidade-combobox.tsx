import { useState, useRef, useEffect } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const especialidades = [
  "Acupunturista",
  "Alergista",
  "Alergista Pediátrico",
  "Anestesiologista",
  "Angiologista",
  "Cardiologista",
  "Cardiologista Pediátrico",
  "Cirurgião Bariátrico",
  "Cirurgião Bucomaxilofacial",
  "Cirurgião Cardiovascular",
  "Cirurgião da Mão",
  "Cirurgião de Cabeça e Pescoço",
  "Cirurgião do Aparelho Digestivo",
  "Cirurgião Geral",
  "Cirurgião Oncológico",
  "Cirurgião Pediátrico",
  "Cirurgião Plástico",
  "Cirurgião Torácico",
  "Cirurgião Vascular",
  "Cirurgião Videolaparoscópico",
  "Clínico Geral",
  "Coloproctologista",
  "Dermatologista",
  "Dermatologista Pediátrico",
  "Endocrinologista",
  "Endocrinologista Pediátrico",
  "Fisiatra",
  "Gastroenterologista",
  "Gastroenterologista Pediátrico",
  "Geneticista",
  "Geriatra",
  "Ginecologista",
  "Hematologista",
  "Hepatologista",
  "Homeopata",
  "Infectologista",
  "Infectologista Pediátrico",
  "Mastologista",
  "Médico de Emergência",
  "Médico de Família",
  "Médico do Sono",
  "Médico do Trabalho",
  "Médico Esportivo",
  "Médico Intensivista",
  "Médico Legista",
  "Médico Nuclear",
  "Médico Paliativista",
  "Medicina de Tráfego",
  "Medicina Estética",
  "Medicina Fetal",
  "Medicina Hiperbárica",
  "Medicina Integrativa",
  "Medicina Ocupacional",
  "Medicina Pericial",
  "Medicina Preventiva",
  "Medicina Reprodutiva",
  "Nefrologista",
  "Nefrologista Pediátrico",
  "Neurocirurgião",
  "Neurologista",
  "Neurologista Pediátrico",
  "Nutrólogo",
  "Obstetra",
  "Oftalmologista",
  "Oftalmologista Pediátrico",
  "Oncologista",
  "Oncologista Pediátrico",
  "Ortopedista",
  "Otorrinolaringologista",
  "Patologista",
  "Patologista Clínico",
  "Pediatra",
  "Pneumologista",
  "Pneumologista Pediátrico",
  "Proctologista",
  "Psiquiatra",
  "Psiquiatra Infantil",
  "Radiologista",
  "Radioterapeuta",
  "Reumatologista",
  "Reumatologista Pediátrico",
  "Urologista",
  "Urologista Pediátrico"
]

interface EspecialidadeComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function EspecialidadeCombobox({
  value,
  onValueChange,
  placeholder = "Selecione uma especialidade...",
  disabled = false,
  className
}: EspecialidadeComboboxProps) {
  const [inputValue, setInputValue] = useState(value || "")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(value || "")
  }, [value])

  // Filtrar especialidades baseado na busca
  const filtered = especialidades.filter(especialidade =>
    especialidade.toLowerCase().includes(inputValue.toLowerCase())
  )

  // Se o valor não está na lista, adicionar como opção customizada
  const options = inputValue && !especialidades.includes(inputValue)
    ? [inputValue, ...filtered]
    : filtered

  return (
    <div className={cn("relative w-full", className)}>
      <div
        className={cn(
          "flex items-center border rounded-md px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-primary transition-all",
          disabled && "opacity-50 pointer-events-none"
        )}
        tabIndex={-1}
        onClick={() => {
          if (!disabled) setOpen(true)
          inputRef.current?.focus()
        }}
        style={{ cursor: "text" }}
      >
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent outline-none border-0 p-0 m-0 text-sm placeholder:text-muted-foreground"
          placeholder={placeholder}
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value)
            setOpen(true)
            onValueChange("")
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          className="ml-1 p-0 h-6 w-6"
          onClick={e => {
            e.stopPropagation()
            setOpen(o => !o)
            inputRef.current?.focus()
          }}
        >
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
      {open && (
        <div className="absolute z-50 left-0 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-56 overflow-auto animate-in fade-in-0 slide-in-from-top-1">
          {options.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">Nenhuma especialidade encontrada.</div>
          ) : (
            options.map((especialidade) => (
              <div
                key={especialidade}
                className={cn(
                  "px-3 py-2 cursor-pointer hover:bg-primary/10 flex items-center gap-2 transition-colors",
                  value === especialidade && "bg-primary/10 font-semibold",
                  "max-w-full"
                )}
                style={{ cursor: "pointer" }}
                onMouseDown={e => {
                  e.preventDefault()
                  setInputValue(especialidade)
                  setOpen(false)
                  onValueChange(especialidade)
                }}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    value === especialidade ? "opacity-100 text-primary" : "opacity-0"
                  )}
                />
                <span className="truncate block max-w-[220px] overflow-hidden whitespace-nowrap text-sm">{especialidade}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
} 