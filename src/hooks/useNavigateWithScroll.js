import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook untuk navigate dengan smooth scroll to top terlebih dahulu
 * FIXED: Scroll complete → Wait → Navigate → Exit animation
 * 
 * @param {Object} options - Konfigurasi scroll behavior
 * @param {number} options.scrollDuration - Base durasi smooth scroll dalam ms (default: 600)
 * @param {number} options.scrollThreshold - Threshold scroll position untuk skip animation (default: 200)
 * 
 * @returns {Object} { navigateWithScroll, isNavigating, isNavigatingRef }
 */
const useNavigateWithScroll = ({ 
  scrollDuration = 600,
  scrollThreshold = 200
} = {}) => {
  const navigate = useNavigate();
  const isNavigatingRef = useRef(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationQueueRef = useRef(null);

  /**
   * Smooth scroll ke top dengan manual animation control
   */
  const smoothScrollToTop = useCallback((baseDuration) => {
    return new Promise((resolve) => {
      const startPosition = Math.max(
        window.pageYOffset || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0
      );
      
      console.log('📍 Scroll start position:', startPosition);
      
      // Jika sudah di atas threshold, skip animation
      if (startPosition <= scrollThreshold) {
        console.log('✅ Already at top, skipping scroll animation');
        window.scrollTo({ top: 0, behavior: 'instant' });
        resolve();
        return;
      }

      // Dynamic duration berdasarkan distance
      const minDuration = 400;
      const maxDuration = 800;
      const scrollDistance = startPosition;
      
      const calculatedDuration = Math.min(
        maxDuration,
        Math.max(minDuration, scrollDistance * 0.5)
      );
      
      const duration = calculatedDuration;
      console.log(`⏱️ Scroll animation duration: ${duration}ms for ${scrollDistance}px`);

      const startTime = performance.now();

      // Easing function untuk smooth deceleration (ease-out-cubic)
      const easeOutCubic = (t) => {
        return 1 - Math.pow(1 - t, 3);
      };

      const animateScroll = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeOutCubic(progress);
        
        const position = startPosition * (1 - easeProgress);
        window.scrollTo({ top: position, behavior: 'instant' });

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          window.scrollTo({ top: 0, behavior: 'instant' });
          console.log('✅ Scroll animation completed');
          resolve();
        }
      };

      requestAnimationFrame(animateScroll);
    });
  }, [scrollThreshold]);

  /**
   * Navigate dengan smooth scroll to top terlebih dahulu
   * ✅ FIX: Scroll selesai → Delay → Navigate (trigger exit animation)
   */
  const navigateWithScroll = useCallback(async (path, options = {}) => {
    if (isNavigatingRef.current === 'navigating') {
      console.log('⛔ Navigation in progress (hook double-check), BLOCKED!');
      return;
    }

    isNavigatingRef.current = 'navigating';
    navigationQueueRef.current = path;
    
    setIsNavigating(() => {
      console.log('🔴 Setting isNavigating to TRUE (immediate)');
      return true;
    });

    try {
      console.log('🚀 Starting navigation sequence to:', path);
      
      // ✅ Step 1: Scroll to top FIRST (complete scroll animation)
      console.log('📜 Step 1: Scrolling to top...');
      await smoothScrollToTop(scrollDuration);
      console.log('✅ Scroll completed');
      
      // ✅ Step 2: Small delay untuk visual smoothness
      console.log('⏱️ Step 2: Brief delay before navigation...');
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // ✅ Step 3: NOW trigger navigation (AnimatePresence will handle exit animation)
      console.log('🎬 Step 3: Triggering navigation (exit animation will play now)...');
      navigate(path, options);
      
      // ✅ Step 4: Wait for exit animation to complete (AnimatePresence default ~300ms)
      console.log('⏳ Step 4: Waiting for exit animation...');
      await new Promise(resolve => setTimeout(resolve, 400));
      
      console.log('✅ Navigation sequence completed');
      
    } catch (error) {
      console.error('❌ Navigation error:', error);
    } finally {
      // Reset navigation lock
      setTimeout(() => {
        isNavigatingRef.current = false;
        navigationQueueRef.current = null;
        
        setIsNavigating(() => {
          console.log('🔴 Setting isNavigating to FALSE');
          return false;
        });
      }, 100);
    }
  }, [navigate, smoothScrollToTop, scrollDuration]);

  return {
    navigateWithScroll,
    isNavigating,
    isNavigatingRef
  };
};

export default useNavigateWithScroll;