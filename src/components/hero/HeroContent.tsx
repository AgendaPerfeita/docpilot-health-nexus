import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, ArrowRight, Play, Brain, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

// Registrar plugin do GSAP
gsap.registerPlugin(TextPlugin);

const HeroContent = () => {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Timeline principal
    const tl = gsap.timeline();

    // Animação do título com efeito de digitação
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1,
        ease: "power3.out"
      }
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8,
        ease: "power2.out"
      },
      "-=0.5"
    )
    .fromTo(ctaRef.current,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6,
        ease: "power2.out"
      },
      "-=0.3"
    );

    // Efeito de hover nos botões
    const buttons = document.querySelectorAll('.hero-cta-button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', () => {});
        button.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  return (
    <div className="relative z-10 container mx-auto px-4 py-20">
      <div className="text-center max-w-6xl mx-auto">
        {/* Badge futurista */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Badge 
            variant="secondary" 
            className="mb-8 px-6 py-3 text-sm font-medium bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="inline-block mr-2"
            >
              <Brain className="h-4 w-4" />
            </motion.div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Inteligência Artificial Avançada
            </span>
          </Badge>
        </motion.div>

        {/* Título principal com efeito futurista */}
        <motion.h1 
          ref={titleRef}
          className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight"
          initial={{ opacity: 0 }}
        >
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            O FUTURO DA
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            MEDICINA É
          </span>
          <br />
          <motion.span 
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundSize: "200% 200%",
            }}
          >
            INTELIGENTE
          </motion.span>
        </motion.h1>

        {/* Subtítulo com animação */}
        <motion.p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
          initial={{ opacity: 0 }}
        >
          Plataforma revolucionária que combina 
          <span className="font-semibold text-white"> inteligência artificial avançada</span>, 
          <span className="font-semibold text-white"> prontuário eletrônico de última geração</span> e 
          <span className="font-semibold text-white"> analytics preditivos</span> para transformar a prática médica.
        </motion.p>

        {/* CTA Buttons com efeitos */}
        <motion.div 
          ref={ctaRef}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          initial={{ opacity: 0 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hero-cta-button"
          >
            <Button 
              size="lg" 
              className="px-10 py-6 text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-0"
              onClick={() => navigate('/register')}
            >
              <Zap className="mr-3 h-5 w-5" />
              Iniciar Revolução
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hero-cta-button"
          >
            <Button 
              size="lg" 
              variant="outline"
              className="px-10 py-6 text-lg font-bold border-2 border-white/20 hover:border-white/40 bg-white/5 backdrop-blur-xl shadow-2xl hover:shadow-white/10 transition-all duration-300"
            >
              <Play className="mr-3 h-5 w-5" />
              Ver Demonstração
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats com animação */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-white">4.9/5 (500+ avaliações)</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Users className="h-4 w-4 text-blue-400" />
            <span className="font-medium text-white">10.000+ profissionais ativos</span>
          </motion.div>
        </motion.div>

        {/* Elementos flutuantes decorativos */}
        <motion.div
          className="absolute top-20 right-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>
    </div>
  );
};

export default HeroContent; 