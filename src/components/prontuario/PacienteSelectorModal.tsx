
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PacienteSelector } from "@/components/shared/PacienteSelector";
import { Paciente } from "@/hooks/usePacientes";
import { Plus } from "lucide-react";

interface PacienteSelectorModalProps {
  trigger?: React.ReactNode;
  className?: string;
}

export const PacienteSelectorModal = ({ trigger, className }: PacienteSelectorModalProps) => {
  const [open, setOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<string>("");
  const navigate = useNavigate();

  const handlePacienteSelect = (paciente: Paciente) => {
    setSelectedPaciente(paciente.id);
  };

  const handleContinue = () => {
    if (selectedPaciente) {
      navigate(`/prontuario/paciente/${selectedPaciente}/nova`);
      setOpen(false);
    }
  };

  const defaultTrigger = (
    <Button className={className}>
      <Plus className="h-4 w-4 mr-2" />
      Novo Prontuário
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione o paciente para criar uma nova evolução médica
          </p>
          <PacienteSelector
            value={selectedPaciente}
            onSelect={handlePacienteSelect}
            placeholder="Buscar paciente..."
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleContinue}
              disabled={!selectedPaciente}
            >
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
