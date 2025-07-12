import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const planos = [
  {
    name: '🩺 Plantonista',
    color: 'from-blue-400 to-blue-600',
    price: 'R$ 69',
    period: '/mês',
    description: 'Para médicos de plantão que precisam de agilidade e apoio clínico com IA',
    features: [
      'Modo rápido de atendimento (sem cadastro completo de paciente)',
      'Anamnese inteligente com IA (histórico, sintomas, sinais vitais)',
      'Geração automática de diagnósticos, CID e conduta',
      'Sugestões de exames e medicamentos baseadas no caso',
      'Acesso rápido aos últimos atendimentos realizados',
      'Sem limite de requisições mensais',
      'Acesso direto via web',
      'Suporte por e-mail',
    ],
    popular: false,
    ideal: 'Ideal para plantões em UPA, pronto-socorro, emergência ou triagens rápidas.'
  },
  {
    name: '👨‍⚕️ Médico',
    color: 'from-indigo-400 to-indigo-600',
    price: 'R$ 99',
    period: '/mês',
    description: 'Para médicos autônomos, de consultório ou multi-clínicas que querem mais produtividade e inteligência clínica',
    features: [
      'Prontuário eletrônico completo com IA integrada',
      'IA clínica (anamnese, CID, conduta, exames e medicações)',
      'Agenda inteligente e unificada por clínica/local de atendimento',
      'Histórico completo de todos os atendimentos do paciente',
      'Chat com pacientes com push notification (sem WhatsApp)',
      'Prescrição digital estruturada',
      'Relatórios clínicos e produtividade individual',
      'Acesso a todos os locais de trabalho vinculados',
      'Integração com fluxo de atendimento da clínica (sem duplicidade)',
      'Suporte por e-mail',
    ],
    popular: true,
    ideal: 'Ideal para médicos que querem centralizar tudo em um único sistema, com ganho de tempo e segurança.'
  },
  {
    name: '🏥 Clínica',
    color: 'from-cyan-400 to-cyan-600',
    price: 'R$ 179',
    period: '/mês',
    description: 'Para clínicas que buscam gestão eficiente, controle financeiro e inteligência estratégica',
    features: [
      'Tudo do plano Médico',
      'Cadastro de até 5 médicos (free, sem IA ou relatórios)',
      'Gestão de agenda por médico e por local de trabalho',
      'Chat com pacientes e entre médicos da equipe',
      'Dashboard financeiro com controle de fluxo de caixa',
      'Controle de comissões por médico e período',
      'BI clínico e financeiro completo com relatórios avançados',
      'Exportação e geração automática de relatórios (PDF)',
      'Suporte prioritário',
    ],
    popular: false,
    ideal: 'Ideal para clínicas que querem escalar com controle total e decisões baseadas em dados reais.'
  },
];

// Responsivo: desktop, tablet, mobile
const getCardWidth = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 640) return window.innerWidth * 0.92; // mobile
    if (window.innerWidth < 1024) return 340; // tablet
  }
  return 540; // desktop (aumentado)
};

const CARD_GAP = 32;

const PlanosCarousel: React.FC = () => {
  const [active, setActive] = useState(1); // Começa com o plano do meio
  const [cardWidth, setCardWidth] = useState(getCardWidth());
  const [leftValue, setLeftValue] = useState('50%');
  const containerRef = useRef<HTMLDivElement>(null);

  // Função para centralizar o card ativo
  const updateLeft = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      let cardW = cardWidth;
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        cardW = window.innerWidth * 0.92;
      }
      const left = (containerWidth - cardW) / 2;
      setLeftValue(`${left}px`);
    }
  };

  useEffect(() => {
    updateLeft();
    window.addEventListener('resize', updateLeft);
    return () => window.removeEventListener('resize', updateLeft);
    // eslint-disable-next-line
  }, [cardWidth]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + planos.length) % planos.length);
  };
  const handleNext = () => {
    setActive((prev) => (prev + 1) % planos.length);
  };

  // Calcula os índices dos cards visíveis
  const leftIdx = (active - 1 + planos.length) % planos.length;
  const rightIdx = (active + 1) % planos.length;

  return (
    <div className="relative flex flex-col items-center py-12">
      <div className="flex items-center justify-center w-full" style={{ minHeight: 400 }}>
        {/* Left arrow */}
        <button
          className="z-10 p-2 rounded-full bg-white/70 hover:bg-white shadow-md absolute left-0 top-1/2 -translate-y-1/2"
          onClick={handlePrev}
          aria-label="Anterior"
        >
          <ArrowLeft className="w-6 h-6 text-blue-600" />
        </button>

        {/* Cards */}
        <div ref={containerRef} className="relative w-screen flex justify-start pl-2 sm:pl-8 md:pl-14 planos-carousel-container" style={{ minHeight: 700 }}>
          {[leftIdx, active, rightIdx].map((idx, pos) => {
            const plano = planos[idx];
            const isActive = idx === active;
            const isLeft = idx === leftIdx;
            const isRight = idx === rightIdx;
            let offset = 0;
            if (isLeft) offset = -1;
            if (isRight) offset = 1;

            return (
              <motion.div
                key={plano.name}
                className={`absolute top-0 planos-carousel-card rounded-2xl shadow-2xl bg-gradient-to-br from-blue-800/90 to-blue-600/80 flex flex-col items-center justify-center px-4 sm:px-8 md:px-10 py-8 md:py-14 select-none cursor-pointer`}
                style={{
                  left: leftValue,
                  width: typeof window !== 'undefined' && window.innerWidth < 640 ? '92vw' : cardWidth,
                  maxWidth: typeof window !== 'undefined' && window.innerWidth < 640 ? cardWidth : '100%',
                  zIndex: isActive ? 2 : 1,
                  transform: 'translateX(0)',
                  boxShadow: isActive
                    ? '0 8px 32px 0 rgba(59,130,246,0.25)'
                    : '0 2px 8px 0 rgba(59,130,246,0.10)',
                }}
                animate={{
                  scale: isActive ? 1 : 0.8,
                  x: typeof window !== 'undefined' && window.innerWidth < 640
                    ? (isActive ? 0 : 9999) // só mostra o ativo no mobile
                    : offset * (cardWidth + CARD_GAP),
                  rotateY: isActive ? 0 : (isLeft ? 20 : -20),
                  filter: isActive ? 'blur(0px)' : 'blur(1.5px)',
                  opacity: 1,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                onClick={() => setActive(idx)}
              >
                {/* Header */}
                <div className="mb-4 text-center">
                  <div className="text-3xl md:text-4xl font-extrabold mb-2 text-white drop-shadow-lg leading-tight">{plano.name}</div>
                  <div className="text-xl md:text-2xl font-bold mb-1 text-blue-100 drop-shadow">{plano.price} <span className="text-base font-normal text-blue-200">{plano.period}</span></div>
                  <div className="mb-2 text-blue-100/90 text-sm md:text-base leading-relaxed drop-shadow">{plano.description}</div>
                </div>
                {/* Separador visual */}
                <div className="w-full h-px bg-gradient-to-r from-blue-400/30 via-white/10 to-blue-400/30 mb-4" />
                {/* Funcionalidades */}
                <ul className="mb-2 text-sm md:text-base text-white/90 text-left space-y-2 pl-5 leading-relaxed">
                  {plano.features.map((feature, i) => (
                    <li key={i} className="list-disc drop-shadow-sm">{feature}</li>
                  ))}
                </ul>
                <div className="text-xs text-blue-100/80 italic text-center mt-2 drop-shadow">{plano.ideal}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          className="z-10 p-2 rounded-full bg-white/70 hover:bg-white shadow-md absolute right-0 top-1/2 -translate-y-1/2"
          onClick={handleNext}
          aria-label="Próximo"
        >
          <ArrowRight className="w-6 h-6 text-blue-600" />
        </button>
      </div>
    </div>
  );
};

export default PlanosCarousel;  