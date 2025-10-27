// src/hooks/useStaggerAnimation.js
import { useMemo } from 'react';

/**
 * Custom hook untuk staggered animation menggunakan Framer Motion
 * 
 * @param {Object} options - Konfigurasi animation
 * @param {number} options.staggerDelay - Delay antar child elements (default: 0.1)
 * @param {number} options.initialDelay - Delay sebelum animation dimulai (default: 0.2)
 * @param {number} options.duration - Durasi animation per element (default: 0.5)
 * @param {number} options.yOffset - Offset vertical untuk animation (default: 20)
 * 
 * @returns {Object} Animation variants untuk container dan items
 */
const useStaggerAnimation = ({
  staggerDelay = 0.1,
  initialDelay = 0.1,
  duration = 0.1,
  yOffset = 20
} = {}) => {
  
  const variants = useMemo(() => ({
    // Container variants - mengatur kapan child elements mulai animasi
    container: {
      hidden: { 
        opacity: 0 
      },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: initialDelay,
          when: "beforeChildren"
        }
      },
      exit: {
        opacity: 0,
        transition: {
          staggerChildren: 0.05,
          staggerDirection: -1,
          when: "afterChildren"
        }
      }
    },
    
    // Item variants - animasi untuk setiap child element
    item: {
      hidden: { 
        opacity: 0, 
        y: yOffset 
      },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration,
          ease: [0.4, 0, 0.2, 1] // Smooth easing curve
        }
      },
      exit: {
        opacity: 0,
        y: -20,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }
      }
    },
    
    // Item with scale - alternatif dengan scale effect
    itemWithScale: {
      hidden: { 
        opacity: 0, 
        y: yOffset,
        scale: 0.95
      },
      visible: { 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: { 
          duration,
          ease: [0.4, 0, 0.2, 1]
        }
      },
      exit: {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }
      }
    },
    
    // Item from left - slide dari kiri
    itemFromLeft: {
      hidden: { 
        opacity: 0, 
        x: -30 
      },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration,
          ease: [0.4, 0, 0.2, 1]
        }
      },
      exit: {
        opacity: 0,
        x: -30,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }
      }
    },
    
    // Item from right - slide dari kanan
    itemFromRight: {
      hidden: { 
        opacity: 0, 
        x: 30 
      },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration,
          ease: [0.4, 0, 0.2, 1]
        }
      },
      exit: {
        opacity: 0,
        x: 30,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }
      }
    }
  }), [staggerDelay, initialDelay, duration, yOffset]);

  return variants;
};

export default useStaggerAnimation;