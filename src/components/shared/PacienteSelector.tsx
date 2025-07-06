
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePacientes, Paciente } from "@/hooks/usePacientes";
import { PacienteForm } from "@/components/modules/pacientes/PacienteForm";
import { Search, Plus, Check, ChevronsUpDown } from "lucide-react";
import { formatarCPF, formatarTelefone } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface PacienteSelectorProps {
  value?: string;
  onSelect: (paciente: Paciente) => void;
  placeholder?: string;
  className?: string;
}

export const PacienteSelector = ({ 
  value, 
  onSelect, 
  placeholder = "Selecionar paciente...",
  className 
}: PacienteSelectorProps) => {
  const { pacientes, loading } = usePacientes();
  const [open, setOpen] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.cpf?.includes(searchTerm) ||
    paciente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPaciente = pacientes.find(p => p.id === value);

  const handleSelect = (paciente: Paciente) => {
    onSelect(paciente);
    setOpen(false);
  };

  const handleNewPaciente = (paciente: Paciente) => {
    onSelect(paciente);
    setShowNewForm(false);
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedPaciente ? selectedPaciente.nome : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Buscar paciente..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Nenhum paciente encontrado</p>
                  <Button 
                    size="sm" 
                    onClick={() => setShowNewForm(true)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Novo Paciente
                  </Button>
                </div>
              </CommandEmpty>
              <CommandGroup>
                {filteredPacientes.map((paciente) => (
                  <CommandItem
                    key={paciente.id}
                    value={paciente.id}
                    onSelect={() => handleSelect(paciente)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === paciente.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{paciente.nome}</div>
                                              <div className="text-sm text-muted-foreground">
                          {paciente.cpf && `CPF: ${formatarCPF(paciente.cpf)}`}
                          {paciente.telefone && ` • ${formatarTelefone(paciente.telefone)}`}
                        </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              <div className="border-t p-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowNewForm(true)}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Novo Paciente
                </Button>
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
          </DialogHeader>
          <PacienteForm 
            onCancel={() => setShowNewForm(false)}
            onSuccess={handleNewPaciente}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
