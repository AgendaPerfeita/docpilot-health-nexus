import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ 
  children, 
  className = '', 
  onClick,
  variant = 'primary'
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    x.set(distanceX * 0.3);
    y.set(distanceY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const baseClasses = "px-8 py-4 font-semibold rounded-xl transition-all duration-300 relative overflow-hidden";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-blue-500/25 border border-blue-400/20 backdrop-blur-sm shimmer-effect button-3d glow-border",
    secondary: "bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 button-3d"
  };

  return (
    <motion.button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        x: springX,
        y: springY,
        scale: isHovered ? 1.05 : 1,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      {/* Shimmer effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        style={{
          x: useMotionValue(-100),
        }}
        animate={{
          x: isHovered ? 100 : -100,
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
        }}
      />
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default MagneticButton; 