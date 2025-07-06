
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePacientes, Paciente } from "@/hooks/usePacientes";
import { useToast } from "@/hooks/use-toast";

interface PacienteFormProps {
  paciente?: Paciente;
  onCancel?: () => void;
  onSuccess?: (paciente: Paciente) => void;
}

export const PacienteForm = ({ paciente, onCancel, onSuccess }: PacienteFormProps) => {
  const { criarPaciente, atualizarPaciente } = usePacientes();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: paciente?.nome || '',
    email: paciente?.email || '',
    telefone: paciente?.telefone || '',
    cpf: paciente?.cpf || '',
    data_nascimento: paciente?.data_nascimento || '',
    endereco: paciente?.endereco || '',
    cidade: paciente?.cidade || '',
    estado: paciente?.estado || '',
    cep: paciente?.cep || '',
    convenio: paciente?.convenio || '',
    numero_convenio: paciente?.numero_convenio || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do paciente.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      let result;
      if (paciente?.id) {
        result = await atualizarPaciente(paciente.id, formData);
      } else {
        result = await criarPaciente(formData);
      }

      toast({
        title: paciente?.id ? "Paciente atualizado" : "Paciente cadastrado",
        description: `${formData.nome} foi ${paciente?.id ? 'atualizado' : 'cadastrado'} com sucesso.`
      });

      if (onSuccess && result) {
        onSuccess(result);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar o paciente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder="Nome completo do paciente"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => handleChange('telefone', e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => handleChange('cpf', e.target.value)}
            placeholder="000.000.000-00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_nascimento">Data de Nascimento</Label>
          <Input
            id="data_nascimento"
            type="date"
            value={formData.data_nascimento}
            onChange={(e) => handleChange('data_nascimento', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="convenio">Convênio</Label>
          <Input
            id="convenio"
            value={formData.convenio}
            onChange={(e) => handleChange('convenio', e.target.value)}
            placeholder="Nome do convênio (ou deixe vazio para particular)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero_convenio">Número do Convênio</Label>
          <Input
            id="numero_convenio"
            value={formData.numero_convenio}
            onChange={(e) => handleChange('numero_convenio', e.target.value)}
            placeholder="Número da carteirinha"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Input
          id="endereco"
          value={formData.endereco}
          onChange={(e) => handleChange('endereco', e.target.value)}
          placeholder="Rua, número, complemento"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cidade">Cidade</Label>
          <Input
            id="cidade"
            value={formData.cidade}
            onChange={(e) => handleChange('cidade', e.target.value)}
            placeholder="Cidade"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Input
            id="estado"
            value={formData.estado}
            onChange={(e) => handleChange('estado', e.target.value)}
            placeholder="Estado"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            value={formData.cep}
            onChange={(e) => handleChange('cep', e.target.value)}
            placeholder="00000-000"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : (paciente?.id ? "Atualizar" : "Cadastrar")}
        </Button>
      </div>
    </form>
  );
};
