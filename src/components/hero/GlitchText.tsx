import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  children: string;
  className?: string;
  glitchIntensity?: number;
  style?: React.CSSProperties;
}

const GlitchText: React.FC<GlitchTextProps> = ({ 
  children, 
  className = '', 
  glitchIntensity = 0.1,
  style
}) => {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < glitchIntensity) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [glitchIntensity]);

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Main text */}
      <motion.span
        className="relative z-10"
        style={style}
        animate={glitchActive ? {
          x: [0, -2, 2, 0],
          y: [0, 1, -1, 0],
        } : {}}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.span>

      {/* Glitch layers */}
      {glitchActive && (
        <>
          <motion.span
            className="absolute inset-0 text-red-400 opacity-80"
            animate={{
              x: [0, -1, 1, 0],
              y: [0, -1, 1, 0],
            }}
            transition={{ duration: 0.15 }}
            style={{ filter: 'blur(0.5px)' }}
          >
            {children}
          </motion.span>
          <motion.span
            className="absolute inset-0 text-blue-400 opacity-60"
            animate={{
              x: [0, 1, -1, 0],
              y: [0, 1, -1, 0],
            }}
            transition={{ duration: 0.15 }}
            style={{ filter: 'blur(0.3px)' }}
          >
            {children}
          </motion.span>
        </>
      )}
    </div>
  );
};

export default GlitchText; 