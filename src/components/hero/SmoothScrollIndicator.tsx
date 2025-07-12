import React from 'react';
import { motion } from 'framer-motion';

const SmoothScrollIndicator: React.FC = () => {
  const scrollToNextSection = () => {
    const nextSection = document.querySelector('section:nth-of-type(2)');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
      animate={{ y: [0, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      onClick={scrollToNextSection}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="flex flex-col items-center space-y-2">
        {/* Scroll indicator */}
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center relative overflow-hidden">
          <motion.div 
            className="w-1 h-3 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full mt-2"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        {/* Text */}
        <motion.p 
          className="text-white/60 text-sm font-light tracking-wider"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          SCROLL
        </motion.p>
        
        {/* Arrow */}
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-white/40"
          >
            <path d="M7 13l5 5 5-5" />
            <path d="M7 6l5 5 5-5" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SmoothScrollIndicator; 