import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  Stethoscope, 
  Users, 
  Activity, 
  FileText, 
  BarChart3, 
  Clock, 
  Shield, 
  Zap, 
  Globe,
  Phone,
  MessageSquare,
  Bot,
  Smartphone,
  Mail,
  Calendar,
  Building2,
  Heart,
  Star,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Dr. Carlos Silva",
      specialty: "Cardiologista",
      content: "O SmartDoc revolucionou minha prática médica. A IA me ajuda com diagnósticos mais precisos e economizo 2 horas por dia na documentação.",
      rating: 5
    },
    {
      name: "Dr. Ana Santos",
      specialty: "Clínica Geral",
      content: "Fantástico! Meus pacientes adoram o acompanhamento via WhatsApp e os relatórios automáticos me dão insights valiosos sobre minha prática.",
      rating: 5
    },
    {
      name: "Clínica São José",
      specialty: "Clínica Médica",
      content: "Gerenciar 5 médicos ficou muito mais fácil. O sistema de permissões é perfeito e os relatórios financeiros são incríveis.",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "IA Médica Avançada",
      description: "Diagnósticos assistidos por inteligência artificial e sugestões de tratamento personalizadas"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Prontuário Eletrônico",
      description: "Documentação inteligente com preenchimento automático e histórico completo do paciente"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Agenda Inteligente",
      description: "Agendamento otimizado com lembretes automáticos e gestão de horários"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "WhatsApp Integrado",
      description: "Comunicação direta com pacientes via WhatsApp API oficial"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Relatórios Avançados",
      description: "Analytics detalhados sobre sua prática médica e performance financeira"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Segurança Total",
      description: "Conformidade com LGPD e criptografia de ponta a ponta"
    }
  ];

  const plans = [
    {
      name: "Doctor",
      price: "R$ 79",
      period: "/mês",
      description: "Para médicos autônomos",
      features: [
        "Prontuário eletrônico completo",
        "IA médica integrada",
        "Agenda inteligente",
        "Até 500 pacientes",
        "Relatórios básicos",
        "Suporte por email"
      ],
      popular: false
    },
    {
      name: "Clinic",
      price: "R$ 199",
      period: "/mês",
      description: "Para clínicas (até 5 médicos)",
      features: [
        "Tudo do plano Doctor",
        "Gestão de múltiplos médicos",
        "WhatsApp API integrado",
        "Pacientes ilimitados",
        "Relatórios avançados",
        "Dashboard financeiro",
        "Suporte prioritário"
      ],
      popular: true
    },
    {
      name: "Hospital",
      price: "R$ 499",
      period: "/mês",
      description: "Para hospitais e grandes clínicas",
      features: [
        "Tudo do plano Clinic",
        "Médicos ilimitados",
        "Gestão hospitalar completa",
        "BI avançado",
        "API personalizada",
        "Suporte 24/7",
        "Treinamento incluído"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">SmartDoc</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Recursos
            </a>
            <a href="#plans" className="text-sm font-medium hover:text-primary transition-colors">
              Planos
            </a>
            <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
              Depoimentos
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">
                Começar Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-12 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            🚀 Revolucione sua prática médica
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            O futuro da medicina é 
            <span className="text-primary block">inteligente</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma completa com IA médica avançada, prontuário eletrônico, 
            WhatsApp integrado e relatórios inteligentes para médicos e clínicas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Começar Teste Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              <Phone className="mr-2 h-5 w-5" />
              Agendar Demo
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">5000+</div>
              <div className="text-sm text-muted-foreground">Médicos Ativos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfação</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50M+</div>
              <div className="text-sm text-muted-foreground">Consultas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Suporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Recursos Revolucionários
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para transformar sua prática médica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Planos para cada necessidade
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Escolha o plano ideal para você ou sua clínica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative h-full ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="block">
                    <Button className="w-full mt-6" variant={plan.popular ? "default" : "outline"}>
                      Começar Agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Histórias reais de transformação na medicina
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <CardContent className="text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl text-muted-foreground mb-6 italic">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonials[currentTestimonial].name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonials[currentTestimonial].specialty}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-primary' : 'bg-muted'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Pronto para revolucionar sua prática médica?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a milhares de médicos que já transformaram seus consultórios com o SmartDoc
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8 py-3">
                  Começar Teste Grátis de 30 Dias
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                <Phone className="mr-2 h-5 w-5" />
                Falar com Especialista
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Stethoscope className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">SmartDoc</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Revolucionando a medicina com inteligência artificial e tecnologia de ponta.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#plans" className="hover:text-primary transition-colors">Planos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SmartDoc. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;