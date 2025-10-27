import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../contexts/NavigationContext';

const useNavigateWithScroll = ({ 
  scrollThreshold = 200 
} = {}) => {
  const navigate = useNavigate();
  const { setNavigating } = useNavigation();
  const isNavigatingRef = useRef(false);

  const smoothScrollToTop = useCallback(() => {
    return new Promise((resolve) => {
      const startPosition = Math.max(
        window.pageYOffset || 0,
        document.documentElement.scrollTop || 0,
        document.body.scrollTop || 0
      );
      
      if (startPosition <= scrollThreshold) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        resolve();
        return;
      }

      const minDuration = 400;
      const maxDuration = 800;
      const scrollDistance = startPosition;
      
      const calculatedDuration = Math.min(
        maxDuration,
        Math.max(minDuration, scrollDistance * 0.5)
      );
      
      const duration = calculatedDuration;
      const startTime = performance.now();

      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

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
          resolve();
        }
      };
      requestAnimationFrame(animateScroll);
    });
  }, [scrollThreshold]);

  const navigateWithScroll = useCallback(async (path, options = {}) => {
    if (isNavigatingRef.current) {
      return;
    }
    
    isNavigatingRef.current = true;
    setNavigating(true);

    setTimeout(async () => {
      try {
        await smoothScrollToTop();
        await new Promise(resolve => setTimeout(resolve, 150));
        
        navigate(path, options);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        isNavigatingRef.current = false;
        setNavigating(false);
      }
    }, 0);

  }, [navigate, smoothScrollToTop, setNavigating]);

  return { navigateWithScroll };
};

export default useNavigateWithScroll;