import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import ParticleSystem from './ParticleSystem';
import SmoothScrollIndicator from './SmoothScrollIndicator';
import MagneticButton from './MagneticButton';
import GlitchText from './GlitchText';
import HeroNavbar from './HeroNavbar';
import './hero-effects.css';

// Registrar ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const navigate = useNavigate();

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 1000], [0, -300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 0.8]);

  // Smooth spring animations
  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });
  const springOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  useEffect(() => {
    // Mouse tracking for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // GSAP animations for text reveal
    if (textRef.current) {
      const tl = gsap.timeline({ delay: 0.5 });
      
      tl.fromTo('.hero-title', 
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" }
      )
      .fromTo('.hero-subtitle',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
        '-=0.8'
      )
      .fromTo('.hero-description',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        '-=0.6'
      )
      .fromTo('.hero-cta',
        { y: 20, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
        '-=0.4'
      );

      // Floating animation for background elements
      gsap.to('.floating-element', {
        y: -20,
        duration: 3,
        ease: "power2.inOut",
        yoyo: true,
        repeat: -1
      });
    }
  }, []);

  return (
    <>
      <HeroNavbar />
      <div 
        ref={containerRef}
        className="relative min-h-screen overflow-hidden animated-gradient"
        style={{
          background: `
            radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
              rgba(59, 130, 246, 0.15) 0%, 
              transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%),
            linear-gradient(45deg, #0f172a 0%, #1e40af 25%, #3b82f6 50%, #1e40af 75%, #0f172a 100%)
          `
        }}
      >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0"
        style={{ y: springY1 }}
      >
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl floating-element" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl floating-element" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl floating-element" style={{ animationDelay: '2s' }} />
      </motion.div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0 grid-pattern"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`
          }}
        />
      </div>

      {/* Interactive Particle System */}
      <ParticleSystem />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full floating-particle sparkle" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-indigo-400/80 rounded-full floating-particle sparkle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-purple-400/70 rounded-full floating-particle sparkle" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-blue-300/90 rounded-full floating-particle sparkle" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-indigo-300/50 rounded-full floating-particle sparkle" style={{ animationDelay: '4s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div 
          ref={textRef}
          className="text-center max-w-4xl mx-auto"
          style={{ opacity: springOpacity, scale: springScale }}
        >
          {/* Main Title */}
          <motion.h1 
            className="hero-title text-6xl md:text-8xl font-bold mb-6 leading-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 50%, #ffffff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(96, 165, 250, 0.3))'
            }}
          >
            DocPilot
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="hero-subtitle text-2xl md:text-3xl text-blue-200 mb-8 font-light"
            style={{ textShadow: '0 0 20px rgba(96, 165, 250, 0.5)' }}
          >
            O futuro da medicina é inteligente
          </motion.p>

          {/* Description */}
          <motion.p 
            className="hero-description text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Transforme sua clínica com inteligência artificial, automação inteligente e 
            uma experiência que redefine o padrão da saúde digital.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <MagneticButton 
              variant="primary"
              onClick={() => navigate('/register')}
            >
              Começar Agora
            </MagneticButton>
            
            <MagneticButton 
              variant="secondary"
              onClick={() => navigate('/login')}
            >
              Ver Demonstração
            </MagneticButton>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <motion.div 
              className="space-y-2 stat-card"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-blue-400 text-shadow-dynamic">500+</div>
              <div className="text-gray-400">Clínicas Atendidas</div>
            </motion.div>
            <motion.div 
              className="space-y-2 stat-card"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-blue-400 text-shadow-dynamic">50k+</div>
              <div className="text-gray-400">Pacientes Cadastrados</div>
            </motion.div>
            <motion.div 
              className="space-y-2 stat-card"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl font-bold text-blue-400 text-shadow-dynamic">99.9%</div>
              <div className="text-gray-400">Uptime Garantido</div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Smooth Scroll Indicator */}
      <SmoothScrollIndicator />
      </div>
    </>
  );
};

export default HeroSection; 