// src/components/common/AnimatedSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  fadeInUp, 
  fadeIn, 
  expandHeight,
  staggerContainer
} from '../../utils/animationVariants';

/**
 * AnimatedSection Component
 * Wrapper component untuk memberikan animasi konsisten pada sections
 */

// ========== FADE IN SECTION ==========
export const FadeInSection = ({ children, delay = 0, duration = 0.4, className = '' }) => (
  <motion.div
    variants={fadeIn(duration, delay)}
    initial="hidden"
    animate="visible"
    exit="hidden"
    className={className}
  >
    {children}
  </motion.div>
);

// ========== FADE IN UP SECTION ==========
export const FadeInUpSection = ({ children, delay = 0, duration = 0.4, className = '' }) => (
  <motion.div
    variants={fadeInUp(duration, delay)}
    initial="hidden"
    animate="visible"
    exit="hidden"
    className={className}
  >
    {children}
  </motion.div>
);

// ========== EXPAND HEIGHT SECTION ==========
export const ExpandHeightSection = ({ 
  children, 
  delay = 0, 
  duration = 0.6, 
  className = '' 
}) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={expandHeight(duration, delay)}
    className={className}
  >
    {children}
  </motion.div>
);

// ========== STAGGER CONTAINER ==========
export const StaggerContainer = ({ 
  children, 
  staggerDelay = 0.1, 
  delayChildren = 0.1,
  className = '' 
}) => (
  <motion.div
    variants={staggerContainer(staggerDelay, delayChildren)}
    initial="hidden"
    animate="visible"
    exit="hidden"
    className={className}
  >
    {children}
  </motion.div>
);

// ========== PAGE TRANSITION WRAPPER ==========
export const PageTransition = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {children}
  </motion.div>
);

// ========== CARD WITH ANIMATION ==========
export const AnimatedCard = ({ 
  children, 
  delay = 0,
  className = '',
  onClick,
  whileHover = { scale: 1.02 },
  whileTap = { scale: 0.98 }
}) => (
  <motion.div
    variants={fadeInUp(0.4, delay)}
    initial="hidden"
    animate="visible"
    whileHover={whileHover}
    whileTap={whileTap}
    onClick={onClick}
    className={className}
  >
    {children}
  </motion.div>
);

// ========== GRID WITH STAGGER ==========
export const StaggerGrid = ({ 
  children, 
  staggerDelay = 0.1,
  delayChildren = 0.2,
  className = '' 
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delayChildren
        }
      }
    }}
    initial="hidden"
    animate="visible"
    className={className}
  >
    {children}
  </motion.div>
);

// ========== LIST ITEM ==========
export const AnimatedListItem = ({ 
  children, 
  className = '',
  delay = 0 
}) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, x: -20 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.3,
          delay: delay,
          ease: [0.4, 0, 0.2, 1]
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// ========== TABLE ROW ==========
export const AnimatedTableRow = ({ 
  children, 
  className = '',
  enableHover = false 
}) => (
  <motion.tr
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }
      }
    }}
    whileHover={enableHover ? { scale: 1.005 } : undefined}
    className={className}
  >
    {children}
  </motion.tr>
);

// ========== DEFAULT EXPORT ==========
const AnimatedSection = {
  FadeIn: FadeInSection,
  FadeInUp: FadeInUpSection,
  ExpandHeight: ExpandHeightSection,
  Stagger: StaggerContainer,
  Page: PageTransition,
  Card: AnimatedCard,
  Grid: StaggerGrid,
  ListItem: AnimatedListItem,
  TableRow: AnimatedTableRow
};

export default AnimatedSection;