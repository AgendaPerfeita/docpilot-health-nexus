import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Brain, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const HeroHeader = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-2xl border-b border-white/10"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo futurista */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                SmartDoc
              </span>
              <div className="text-xs text-gray-400 -mt-1 font-light">Health Nexus</div>
            </div>
          </motion.div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <motion.a 
              href="#features" 
              className="text-gray-300 hover:text-white font-medium transition-all duration-300 relative group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Recursos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
            </motion.a>
            <motion.a 
              href="#pricing" 
              className="text-gray-300 hover:text-white font-medium transition-all duration-300 relative group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Planos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
            </motion.a>
            <motion.a 
              href="#testimonials" 
              className="text-gray-300 hover:text-white font-medium transition-all duration-300 relative group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Depoimentos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
            </motion.a>
            <motion.a 
              href="#contact" 
              className="text-gray-300 hover:text-white font-medium transition-all duration-300 relative group"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Contato
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-300 group-hover:w-full"></span>
            </motion.a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                className="text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                onClick={() => navigate('/login')}
              >
                Entrar
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-0"
                onClick={() => navigate('/register')}
              >
                Começar Agora
              </Button>
            </motion.div>

            {/* Menu Mobile */}
            <motion.button
              className="md:hidden p-2 text-gray-300 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Menu Mobile */}
        <motion.div
          className="md:hidden"
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMenuOpen ? 1 : 0, 
            height: isMenuOpen ? "auto" : 0 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="py-4 space-y-4 border-t border-white/10 mt-4">
            <a href="#features" className="block text-gray-300 hover:text-white transition-colors">Recursos</a>
            <a href="#pricing" className="block text-gray-300 hover:text-white transition-colors">Planos</a>
            <a href="#testimonials" className="block text-gray-300 hover:text-white transition-colors">Depoimentos</a>
            <a href="#contact" className="block text-gray-300 hover:text-white transition-colors">Contato</a>
          </div>
        </motion.div>
      </div>

      {/* Efeitos de fundo sutil */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-24 h-24 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"
          animate={{
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
    </motion.header>
  );
};

export default HeroHeader; 