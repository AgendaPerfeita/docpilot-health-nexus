import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePacientes, Paciente } from "@/hooks/usePacientes";
import { useToast } from "@/hooks/use-toast";
import { buscarCEP, formatarCEP } from "@/lib/viacep";
import { formatarCPF, formatarTelefone } from "@/lib/formatters";
import { Loader2 } from "lucide-react";

interface PacienteFormProps {
  paciente?: Paciente;
  onCancel?: () => void;
  onSuccess?: (paciente: Paciente) => void;
}

export const PacienteForm = ({ paciente, onCancel, onSuccess }: PacienteFormProps) => {
  const { criarPaciente, atualizarPaciente } = usePacientes();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);

  const [formData, setFormData] = useState({
    nome: paciente?.nome || '',
    email: paciente?.email || '',
    telefone: paciente?.telefone || '',
    cpf: paciente?.cpf || '',
    data_nascimento: paciente?.data_nascimento || '',
    endereco: paciente?.endereco || '',
    bairro: paciente?.bairro || '',
    cidade: paciente?.cidade || '',
    estado: paciente?.estado || '',
    cep: paciente?.cep || '',
    tipo_convenio: paciente?.convenio ? 'convenio' : 'particular',
    convenio: paciente?.convenio || '',
    numero_convenio: paciente?.numero_convenio || '',
    origem: paciente?.origem || ''
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
      // Preparar dados para envio (remover tipo_convenio e ajustar convenio)
      const dadosParaEnvio = {
        ...formData,
        convenio: formData.tipo_convenio === 'particular' ? '' : formData.convenio,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove formatação do CPF
        telefone: formData.telefone.replace(/\D/g, '') // Remove formatação do telefone
      };
      delete dadosParaEnvio.tipo_convenio;

      let result;
      if (paciente?.id) {
        result = await atualizarPaciente(paciente.id, dadosParaEnvio);
      } else {
        result = await criarPaciente(dadosParaEnvio);
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

  const handleCPFChange = (cpf: string) => {
    const cpfFormatado = formatarCPF(cpf);
    setFormData(prev => ({ ...prev, cpf: cpfFormatado }));
  };

  const handleTelefoneChange = (telefone: string) => {
    const telefoneFormatado = formatarTelefone(telefone);
    setFormData(prev => ({ ...prev, telefone: telefoneFormatado }));
  };

  const handleCEPChange = (cep: string) => {
    // Formata o CEP enquanto digita
    const cepFormatado = formatarCEP(cep);
    setFormData(prev => ({ ...prev, cep: cepFormatado }));
  };

  const buscarEnderecoPorCEP = async (cep: string) => {
    setBuscandoCEP(true);
    try {
      const endereco = await buscarCEP(cep);
              if (endereco) {
          setFormData(prev => ({
            ...prev,
            endereco: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.localidade,
            estado: endereco.uf
          }));
        toast({
          title: "Endereço encontrado",
          description: "Endereço preenchido automaticamente pelo CEP."
        });
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Verifique se o CEP está correto.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível buscar o endereço. Preencha manualmente.",
        variant: "destructive"
      });
    } finally {
      setBuscandoCEP(false);
    }
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
            onChange={(e) => handleTelefoneChange(e.target.value)}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={formData.cpf}
            onChange={(e) => handleCPFChange(e.target.value)}
            placeholder="000.000.000-00"
            maxLength={14}
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
          <Label htmlFor="tipo_convenio">Tipo de Atendimento</Label>
          <Select
            value={formData.tipo_convenio}
            onValueChange={(value) => {
              setFormData(prev => ({ 
                ...prev, 
                tipo_convenio: value,
                convenio: value === 'particular' ? '' : prev.convenio
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="particular">Particular</SelectItem>
              <SelectItem value="convenio">Convênio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.tipo_convenio === 'convenio' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="convenio">Nome do Convênio</Label>
              <Input
                id="convenio"
                value={formData.convenio}
                onChange={(e) => handleChange('convenio', e.target.value)}
                placeholder="Nome do convênio"
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
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="origem">Origem</Label>
          <Select
            value={formData.origem}
            onValueChange={(value) => handleChange('origem', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a origem (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Encaminhamento Médico">Encaminhamento Médico</SelectItem>
              <SelectItem value="Facebook">Facebook</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Indicação">Indicação</SelectItem>
              <SelectItem value="Instagram">Instagram</SelectItem>
              <SelectItem value="Marketplace">Marketplace</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            value={formData.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
            placeholder="Rua, número, complemento"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bairro">Bairro</Label>
          <Input
            id="bairro"
            value={formData.bairro}
            onChange={(e) => handleChange('bairro', e.target.value)}
            placeholder="Bairro"
          />
        </div>
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
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleCEPChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
              />
              {buscandoCEP && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const cepLimpo = formData.cep.replace(/\D/g, '');
                if (cepLimpo.length === 8) {
                  buscarEnderecoPorCEP(cepLimpo);
                } else {
                  toast({
                    title: "CEP incompleto",
                    description: "Digite um CEP válido com 8 dígitos.",
                    variant: "destructive"
                  });
                }
              }}
              disabled={buscandoCEP || formData.cep.replace(/\D/g, '').length !== 8}
            >
              Buscar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Digite o CEP e clique em "Buscar" para preencher automaticamente o endereço, bairro, cidade e estado
          </p>
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
