// src/hooks/useTableAnimation.js
import { useMemo } from 'react';

/**
 * Custom hook untuk table row stagger animation
 * Lebih cepat dari page stagger karena table butuh response time cepat
 * 
 * @param {Object} options - Konfigurasi animation
 * @param {number} options.staggerDelay - Delay antar row (default: 0.05)
 * @param {number} options.initialDelay - Delay sebelum animation dimulai (default: 0.1)
 * @param {number} options.duration - Durasi animation per row (default: 0.3)
 * @param {boolean} options.enableHover - Enable hover animation (default: true)
 * 
 * @returns {Object} Animation variants untuk tbody dan tr
 */
const useTableAnimation = ({
  staggerDelay = 0.05,
  initialDelay = 0.1,
  duration = 0.3,
  enableHover = true
} = {}) => {
  
  const variants = useMemo(() => {
    const tableVariants = {
      // Container variants untuk tbody
      tbody: {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: initialDelay,
            when: "beforeChildren"
          }
        }
      },
      
      // Row variants - smooth fade in dengan slight scale
      row: {
        hidden: { 
          opacity: 0, 
          y: 10,
          scale: 0.98
        },
        visible: { 
          opacity: 1, 
          y: 0,
          scale: 1,
          transition: { 
            duration,
            ease: [0.4, 0, 0.2, 1]
          }
        }
      },
      
      // Row dengan slide dari kiri
      rowFromLeft: {
        hidden: { 
          opacity: 0, 
          x: -20,
          scale: 0.98
        },
        visible: { 
          opacity: 1, 
          x: 0,
          scale: 1,
          transition: { 
            duration,
            ease: [0.4, 0, 0.2, 1]
          }
        }
      },
      
      // Row dengan slide dari kanan
      rowFromRight: {
        hidden: { 
          opacity: 0, 
          x: 20,
          scale: 0.98
        },
        visible: { 
          opacity: 1, 
          x: 0,
          scale: 1,
          transition: { 
            duration,
            ease: [0.4, 0, 0.2, 1]
          }
        }
      },
      
      // Row dengan fade only (no movement)
      rowFadeOnly: {
        hidden: { 
          opacity: 0
        },
        visible: { 
          opacity: 1,
          transition: { 
            duration,
            ease: [0.4, 0, 0.2, 1]
          }
        }
      }
    };

    // Hover animation (opsional)
    const hoverAnimation = enableHover ? {
      scale: 1.01,
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      transition: { 
        duration: 0.2,
        ease: 'easeInOut'
      }
    } : {};

    return {
      ...tableVariants,
      hoverAnimation
    };
  }, [staggerDelay, initialDelay, duration, enableHover]);

  return variants;
};

export default useTableAnimation;