import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slide' | 'scale' | 'none';
  duration?: number;
  delay?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fade',
  duration = 0.3,
  delay = 0,
}) => {
  // Define animation variants
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    none: {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    },
  };

  // Error handling for invalid variant
  if (!variants[variant]) {
    console.warn(`Invalid variant "${variant}" provided to PageTransition. Falling back to "fade".`);
    variant = 'fade';
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[variant]}
      transition={{ 
        duration, 
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        willChange: 'transform, opacity',
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition; 