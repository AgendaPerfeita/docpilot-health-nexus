import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useActiveClinica } from "@/hooks/useActiveClinica";
import { useState } from "react";

export function ClinicaSelector() {
  const { activeClinica, setActiveClinica, availableClinicas } = useActiveClinica();
  const [open, setOpen] = useState(false);

  if (availableClinicas.length <= 1) {
    return null; // Não mostrar seletor se há apenas uma clínica
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">
              {activeClinica?.nome || "Selecionar clínica"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Buscar clínica..." />
          <CommandList>
            <CommandEmpty>Nenhuma clínica encontrada.</CommandEmpty>
            <CommandGroup>
              {availableClinicas.map((clinica) => (
                <CommandItem
                  key={clinica.id}
                  value={clinica.nome}
                  onSelect={() => {
                    setActiveClinica(clinica);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      activeClinica?.id === clinica.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{clinica.nome}</span>
                    <span className="text-xs text-muted-foreground">
                      {clinica.email}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}