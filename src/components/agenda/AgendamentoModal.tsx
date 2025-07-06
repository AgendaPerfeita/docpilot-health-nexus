import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface AgendamentoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  dataInicial: Date;
  horaInicial: string;
}

export const AgendamentoModal: React.FC<AgendamentoModalProps> = ({ open, onClose, onSave, dataInicial, horaInicial }) => {
  const [tipo, setTipo] = useState("agendar");
  const [procedimento, setProcedimento] = useState("");
  const [paciente, setPaciente] = useState("");
  const [telefoneCelular, setTelefoneCelular] = useState("");
  const [telefoneResidencial, setTelefoneResidencial] = useState("");
  const [email, setEmail] = useState("");
  const [convenio, setConvenio] = useState("");
  const [data, setData] = useState(dataInicial.toISOString().split("T")[0]);
  const [hora, setHora] = useState(horaInicial);
  const [recorrencia, setRecorrencia] = useState("nao");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ tipo, procedimento, paciente, telefoneCelular, telefoneResidencial, email, convenio, data, hora, recorrencia, observacoes });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Label>
              <input type="radio" checked={tipo === "agendar"} onChange={() => setTipo("agendar")}/> Agendar
            </Label>
            <Label>
              <input type="radio" checked={tipo === "bloquear"} onChange={() => setTipo("bloquear")}/> Bloquear horário
            </Label>
          </div>
          <div className="space-y-2">
            <Label>Procedimento</Label>
            <Input value={procedimento} onChange={e => setProcedimento(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Input value={paciente} onChange={e => setPaciente(e.target.value)} placeholder="Digite 3 letras para buscar..." required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Telefone celular</Label>
              <Input value={telefoneCelular} onChange={e => setTelefoneCelular(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Telefone residencial</Label>
              <Input value={telefoneResidencial} onChange={e => setTelefoneResidencial(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>E-mail (opcional)</Label>
            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
          </div>
          <div className="space-y-2">
            <Label>Convênio</Label>
            <Input value={convenio} onChange={e => setConvenio(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={data} onChange={e => setData(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Hora</Label>
              <Input type="time" value={hora} onChange={e => setHora(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Recorrência</Label>
            <Select value={recorrencia} onValueChange={setRecorrencia}>
              <SelectTrigger>
                <SelectValue placeholder="Não se repete" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao">Não se repete</SelectItem>
                <SelectItem value="diario">Diário</SelectItem>
                <SelectItem value="semanal">Semanal</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 