import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, Shield, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestão Completa de Pacientes",
      description: "Controle total sobre prontuários, histórico médico e acompanhamento personalizado."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Segurança e Compliance",
      description: "LGPD compliant, criptografia end-to-end e backup automático dos dados."
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Agenda Inteligente",
      description: "Agendamento automatizado, lembretes por WhatsApp e otimização de horários."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "BI e Relatórios Avançados",
      description: "Dashboards inteligentes, métricas em tempo real e insights de negócio."
    }
  ];

  const plans = [
    {
      name: "MÉDICO",
      price: "R$ 97",
      period: "/mês",
      description: "Perfeito para médicos independentes",
      features: [
        "Prontuário eletrônico completo",
        "Agenda personalizada",
        "Prescrição digital",
        "Área do paciente",
        "Relatórios básicos"
      ],
      popular: false
    },
    {
      name: "CLÍNICA",
      price: "R$ 197",
      period: "/mês",
      description: "Ideal para clínicas e consultórios",
      features: [
        "Tudo do plano Médico",
        "Gestão de múltiplos médicos",
        "CRM clínico avançado",
        "WhatsApp API integrado",
        "BI e relatórios avançados",
        "Gestão financeira completa"
      ],
      popular: true
    },
    {
      name: "CLÍNICA PRO",
      price: "R$ 397",
      period: "/mês",
      description: "Para clínicas em crescimento",
      features: [
        "Tudo do plano Clínica",
        "Gestão de comissões",
        "DRE automatizado",
        "Relatórios executivos",
        "Suporte prioritário",
        "Treinamento personalizado"
      ],
      popular: false
    },
    {
      name: "HOSPITAL",
      price: "R$ 797",
      period: "/mês",
      description: "Solução completa hospitalar",
      features: [
        "Gestão hospitalar completa",
        "Controle de leitos",
        "Gestão de internações",
        "Integração com equipamentos",
        "Relatórios regulatórios",
        "Suporte 24/7"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold">SmartDoc</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Entrar
            </Button>
            <Button onClick={() => navigate('/register')}>
              Começar Agora
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            ✨ A evolução da gestão médica chegou
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            O futuro da gestão médica está aqui
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Plataforma completa que revoluciona a gestão de consultórios, clínicas e hospitais. 
            Prontuário eletrônico, agenda inteligente, BI avançado e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => navigate('/register')}>
              Começar Gratuitamente
            </Button>
            <Button size="lg" variant="outline">
              Ver Demonstração
            </Button>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 (500+ avaliações)</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>10.000+ profissionais ativos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa em uma plataforma
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Desenvolvido especificamente para o mercado brasileiro, com todas as funcionalidades 
              que profissionais da saúde realmente precisam.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos para cada necessidade
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Desde médicos independentes até grandes hospitais. Escolha o plano ideal para você.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative ${plan.popular ? 'border-primary shadow-xl scale-105' : 'border-border'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-center">
                    <div className="text-sm font-medium text-muted-foreground mb-2">{plan.name}</div>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-center">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate('/register')}
                  >
                    Começar Agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar sua gestão médica?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já revolucionaram sua prática médica com o SmartDoc.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/register')}
          >
            Começar Gratuitamente
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">S</span>
            </div>
            <span className="font-semibold">SmartDoc</span>
          </div>
          <p className="text-sm">
            © 2024 SmartDoc. Todos os direitos reservados. Feito com ❤️ para profissionais da saúde.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;