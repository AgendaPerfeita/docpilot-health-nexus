import { useState, useRef, useEffect } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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

interface EspecialidadeSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function EspecialidadeSelect({
  value,
  onValueChange,
  placeholder = "Selecione uma especialidade...",
  disabled = false,
  className
}: EspecialidadeSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Filtrar especialidades baseado na busca
  const filteredEspecialidades = especialidades.filter(especialidade =>
    especialidade.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Se o valor não está na lista, adicionar como opção customizada
  const options = value && !especialidades.includes(value) 
    ? [value, ...filteredEspecialidades]
    : filteredEspecialidades

  // Limitar o número de opções para melhor performance
  const limitedOptions = options.slice(0, 50)

  useEffect(() => {
    if (open) {
      // Focar no input de busca quando abrir
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-10",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start" side="bottom">
        <Command className="max-h-[300px]">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              ref={inputRef}
              placeholder="Buscar especialidade..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="border-0 focus:ring-0 h-8"
            />
          </div>
          <CommandList className="max-h-[250px]">
            <CommandEmpty className="py-4">
              {searchValue ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhuma especialidade encontrada para "{searchValue}"
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onValueChange(searchValue)
                      setOpen(false)
                      setSearchValue("")
                    }}
                  >
                    Usar "{searchValue}" como especialidade
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma especialidade encontrada.
                </p>
              )}
            </CommandEmpty>
            <CommandGroup>
              {limitedOptions.map((especialidade) => (
                <CommandItem
                  key={especialidade}
                  value={especialidade}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    setSearchValue("")
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === especialidade ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{especialidade}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 