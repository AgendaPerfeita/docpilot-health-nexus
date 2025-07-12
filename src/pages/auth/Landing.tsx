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
import HeroSection from "@/components/hero/HeroSection";
import PlanosCarousel from './PlanosCarousel';

const Landing = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

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

  // Mockups de placeholder para cada feature
  const featureMockups = [
    'https://placehold.co/1200x600/3b82f6/ffffff?text=Mockup+1',
    'https://placehold.co/1200x600/6366f1/ffffff?text=Mockup+2',
    'https://placehold.co/1200x600/06b6d4/ffffff?text=Mockup+3',
    // Adicione mais se tiver mais features
  ];

  const plans = [
    {
      name: "🩺 Plantonista",
      price: "R$ 69",
      period: "/mês",
      description: "Para médicos de plantão que precisam de agilidade e apoio clínico com IA",
      features: [
        "Modo rápido de atendimento (sem cadastro completo de paciente)",
        "Anamnese inteligente com IA (histórico, sintomas, sinais vitais)",
        "Geração automática de diagnósticos, CID e conduta",
        "Sugestões de exames e medicamentos baseadas no caso",
        "Acesso rápido aos últimos atendimentos realizados",
        "Sem limite de requisições mensais",
        "Acesso direto via web",
        "Suporte por e-mail"
      ],
      popular: false,
      ideal: "Ideal para plantões em UPA, pronto-socorro, emergência ou triagens rápidas."
    },
    {
      name: "👨‍⚕️ Médico",
      price: "R$ 99",
      period: "/mês",
      description: "Para médicos autônomos, de consultório ou multi-clínicas que querem mais produtividade e inteligência clínica",
      features: [
        "Prontuário eletrônico completo com IA integrada",
        "IA clínica (anamnese, CID, conduta, exames e medicações)",
        "Agenda inteligente e unificada por clínica/local de atendimento",
        "Histórico completo de todos os atendimentos do paciente",
        "Chat com pacientes com push notification (sem WhatsApp)",
        "Prescrição digital estruturada",
        "Relatórios clínicos e produtividade individual",
        "Acesso a todos os locais de trabalho vinculados",
        "Integração com fluxo de atendimento da clínica (sem duplicidade)",
        "Suporte por e-mail"
      ],
      popular: true,
      ideal: "Ideal para médicos que querem centralizar tudo em um único sistema, com ganho de tempo e segurança."
    },
    {
      name: "🏥 Clínica",
      price: "R$ 179",
      period: "/mês",
      description: "Para clínicas que buscam gestão eficiente, controle financeiro e inteligência estratégica",
      features: [
        "Tudo do plano Médico",
        "Cadastro de até 5 médicos (free, sem IA ou relatórios)",
        "Gestão de agenda por médico e por local de trabalho",
        "Chat com pacientes e entre médicos da equipe",
        "Dashboard financeiro com controle de fluxo de caixa",
        "Controle de comissões por médico e período",
        "BI clínico e financeiro completo com relatórios avançados",
        "Exportação e geração automática de relatórios (PDF)",
        "Suporte prioritário"
      ],
      popular: false,
      ideal: "Ideal para clínicas que querem escalar com controle total e decisões baseadas em dados reais."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Novo Hero Section Futurista */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-blue-100 w-screen overflow-x-hidden">
        {/* Background mockup dinâmico */}
        {hoveredFeature !== null && (
          <img
            src={featureMockups[hoveredFeature]}
            alt="mockup"
            className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500 z-0"
            style={{ filter: 'blur(2px)' }}
          />
        )}
        {/* Overlay para garantir contraste */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/80 to-blue-100/80 z-10 pointer-events-none" />
        <div className="relative z-20 max-w-[1600px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-lg">
              Recursos Revolucionários
            </h2>
            <p className="text-xl text-blue-700 max-w-2xl mx-auto">
              Tecnologia de ponta para transformar sua prática médica
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="relative bg-white/90 rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="relative z-20 flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg text-white text-3xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">{feature.title}</h3>
                  <p className="text-blue-700 text-center text-lg transition-opacity duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a8a] mb-4">
              Planos para cada necessidade
            </h2>
            <p className="text-xl text-[#2563eb] max-w-2xl mx-auto">
              Escolha o plano ideal para você ou sua clínica
            </p>
          </div>
        </div>
        {/* Carrossel 3D de planos fora do container */}
        <div className="w-screen overflow-x-hidden">
          <PlanosCarousel />
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
                <li><a href="#" className="hover:text-primary transition-colors">Comunidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 SmartDoc. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;