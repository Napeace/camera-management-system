// src/utils/animationVariants.js
/**
 * Reusable Framer Motion Animation Variants
 * Centralized animation definitions untuk konsistensi across aplikasi
 */

// ========== PAGE TRANSITIONS ==========
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      duration: 0.1,
      ease: 'easeInOut'
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.1,
      ease: 'easeInOut'
    }
  }
};

// ========== CONTAINER ANIMATIONS ==========
export const staggerContainer = (staggerDelay = 0.1, delayChildren = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren
    }
  }
});

// ========== ITEM ANIMATIONS ==========
export const fadeInUp = (duration = 0.1, delay = 0) => ({
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration,
      delay: delay,
      ease: [0.4, 0, 0.2, 1]
    }
  }
});

export const fadeIn = (duration = 0.1, delay = 0) => ({
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: {
      duration: duration,
      delay: delay,
      ease: [0.4, 0, 0.2, 1]
    }
  }
});

export const slideFromLeft = (duration = 0.1, delay = 0) => ({
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: duration,
      delay: delay,
      ease: [0.4, 0, 0.2, 1]
    }
  }
});

// ========== HEIGHT ANIMATIONS ==========
export const expandHeight = (duration = 0.1, delay = 0) => ({
  initial: { 
    opacity: 0, 
    height: 0 
  },
  animate: { 
    opacity: 1, 
    height: "auto",
    transition: {
      opacity: { duration: duration * 0.8, delay: delay },
      height: { duration: duration, delay: delay },
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    height: 0,
    transition: {
      duration: duration * 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  }
});

// ========== TABLE ANIMATIONS ==========
export const tableContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const tableRow = (enableHover = false) => ({
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  ...(enableHover && {
    hover: {
      scale: 1.005,
      transition: { duration: 0.1 }
    }
  })
});

// ========== CARD ANIMATIONS ==========
export const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// ========== MODAL ANIMATIONS ==========
export const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const modalContent = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20,
    transition: { duration: 0.1 }
  }
};

// ========== STAT CARD ANIMATIONS ==========
export const statCardGrid = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const statCard = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// ========== LIST ANIMATIONS ==========
export const listContainer = (staggerDelay = 0.1) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1
    }
  }
});

export const listItem = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// ========== LOADING ANIMATIONS ==========
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 0.1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 0.1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// ========== COMBINED PRESETS ==========
export const animationPresets = {
  page: pageTransition,
  fadeInUp: fadeInUp(),
  fadeIn: fadeIn(),
  slideFromLeft: slideFromLeft(),
  expandHeight: expandHeight(),
  card: cardVariants,
  modal: {
    backdrop: modalBackdrop,
    content: modalContent
  },
  table: {
    container: tableContainer,
    row: tableRow()
  },
  statCard: {
    grid: statCardGrid,
    card: statCard
  }
};

// ========== CUSTOM VARIANTS BUILDERS ==========
export const createStaggerContainer = (options = {}) => {
  const {
    staggerDelay = 0.1,
    delayChildren = 0.1,
    duration = 0.1
  } = options;

  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
        duration: duration
      }
    }
  };
};

export const createItemVariant = (options = {}) => {
  const {
    duration = 0.1,
    delay = 0,
    yOffset = 20,
    xOffset = 0,
    ease = [0.4, 0, 0.2, 1]
  } = options;

  return {
    hidden: { 
      opacity: 0, 
      y: yOffset,
      x: xOffset
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: duration,
        delay: delay,
        ease: ease
      }
    }
  };
};