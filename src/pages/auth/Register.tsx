import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EspecialidadeCombobox } from "@/components/ui/especialidade-combobox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    documento: "",
    tipo: "" as "plantonista" | "medico" | "paciente" | "clinica" | "",
    especialidade: "",
    crm: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast({
        title: "Termos de uso",
        description: "Você deve aceitar os termos de uso para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas digitadas não são iguais.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve ter no mínimo 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    // Validate password strength
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);
    const hasNonalphas = /\W/.test(formData.password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas)) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve conter ao menos: 1 maiúscula, 1 minúscula, 1 número e 1 símbolo.",
        variant: "destructive",
      });
      return;
    }

    // Validate CPF/CNPJ format and restrict privileged roles
    if (!formData.documento.trim()) {
      const docType = (formData.tipo === "medico" || formData.tipo === "paciente" || formData.tipo === "plantonista") ? "CPF" : "CNPJ";
      toast({
        title: `${docType} obrigatório`,
        description: `O ${docType} é obrigatório para este tipo de usuário`,
        variant: "destructive",
      });
      return;
    }

    // Restrict self-registration for certain roles
    if (formData.tipo === "clinica" && !formData.documento.match(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)) {
      toast({
        title: "CNPJ inválido",
        description: "Por favor, digite um CNPJ válido no formato 00.000.000/0000-00",
        variant: "destructive",
      });
      return;
    }

    if ((formData.tipo === "medico" || formData.tipo === "plantonista") && !formData.crm.trim()) {
      toast({
        title: "CRM obrigatório",
        description: "O CRM é obrigatório para médicos e plantonistas",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        nome: formData.nome,
        tipo: formData.tipo,
        documento: formData.documento,
        telefone: formData.telefone,
        especialidade: formData.especialidade,
        crm: formData.crm
      };

      const { error } = await signUp(formData.email, formData.password, userData);
      
      if (error) {
        toast({
          title: "Erro ao criar conta",
          description: error.message === "User already registered" 
            ? "Este email já está cadastrado" 
            : error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao SmartDoc. Você pode começar a usar a plataforma agora.",
        });
        
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isMedico = formData.tipo === "medico" || formData.tipo === "plantonista";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Stethoscope className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">SmartDoc</span>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Criar conta</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para começar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo</Label>
                  <Input
                    id="nome"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de conta</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => handleInputChange("tipo", value)}
                    required
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinica">🏥 Clínica</SelectItem>
                      <SelectItem value="medico">👨‍⚕️ Médico</SelectItem>
                      <SelectItem value="paciente">👤 Paciente</SelectItem>
                      <SelectItem value="plantonista">🩺 Plantonista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange("telefone", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="documento">
                  {formData.tipo === "medico" || formData.tipo === "paciente" || formData.tipo === "plantonista" ? "CPF" : formData.tipo === "clinica" ? "CNPJ" : "CPF/CNPJ"}
                </Label>
                <Input
                  id="documento"
                  placeholder={formData.tipo === "medico" || formData.tipo === "paciente" || formData.tipo === "plantonista" ? "000.000.000-00" : formData.tipo === "clinica" ? "00.000.000/0000-00" : "Documento"}
                  value={formData.documento}
                  onChange={(e) => handleInputChange("documento", e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {isMedico && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="crm">CRM</Label>
                    <Input
                      id="crm"
                      placeholder="CRM 12345"
                      value={formData.crm}
                      onChange={(e) => handleInputChange("crm", e.target.value)}
                      required={isMedico}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="especialidade">Especialidade</Label>
                    <EspecialidadeCombobox
                      value={formData.especialidade}
                      onValueChange={(value) => handleInputChange("especialidade", value)}
                      placeholder="Selecione uma especialidade..."
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm">
                  Aceito os{" "}
                  <a href="#" className="text-primary hover:underline">
                    termos de uso
                  </a>{" "}
                  e a{" "}
                  <a href="#" className="text-primary hover:underline">
                    política de privacidade
                  </a>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !acceptTerms}
              >
                {isLoading ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/login" 
                className="text-sm text-primary hover:underline"
              >
                Já tem uma conta? Faça login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
