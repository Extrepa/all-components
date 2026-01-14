import { useEffect, useRef, useState } from 'react';

interface UseSubcategoryScrollReturn {
  scrollRef: React.RefObject<HTMLDivElement>;
  showArrows: { left: boolean; right: boolean };
}

export const useSubcategoryScroll = (dependencies: any[]): UseSubcategoryScrollReturn => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState({ left: false, right: false });
  
  // Helper function to update arrows based on scroll position
  const updateArrows = (container: HTMLDivElement) => {
    const hasOverflow = container.scrollWidth > container.clientWidth;
    const canScrollLeft = container.scrollLeft > 0;
    const canScrollRight = container.scrollLeft < container.scrollWidth - container.clientWidth;
    
    if (!hasOverflow) {
      setShowArrows({ left: false, right: false });
    } else {
      setShowArrows({ left: canScrollLeft, right: canScrollRight });
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollDirection: 'left' | 'right' | null = null;
    let animationFrameId: number | null = null;

    const scroll = () => {
      if (!container || !scrollDirection) {
        animationFrameId = null;
        return;
      }
      
      const scrollSpeed = 2;
      const maxScroll = container.scrollWidth;
      
      if (scrollDirection === 'left') {
        container.scrollLeft = Math.max(0, container.scrollLeft - scrollSpeed);
        if (container.scrollLeft <= 0) {
          scrollDirection = null;
          animationFrameId = null;
          setShowArrows({ left: false, right: false });
        }
      } else if (scrollDirection === 'right') {
        container.scrollLeft = Math.min(maxScroll, container.scrollLeft + scrollSpeed);
        if (container.scrollLeft >= maxScroll - container.clientWidth) {
          scrollDirection = null;
          animationFrameId = null;
          setShowArrows({ left: false, right: false });
        }
      }
      
      if (scrollDirection) {
        animationFrameId = requestAnimationFrame(scroll);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const containerWidth = rect.width;
      const scrollZoneWidth = 40;

      updateArrows(container);
      
      const hasOverflow = container.scrollWidth > container.clientWidth;
      if (!hasOverflow) {
        scrollDirection = null;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        return;
      }

      const canScrollLeft = container.scrollLeft > 0;
      const canScrollRight = container.scrollLeft < container.scrollWidth - containerWidth;

      if (mouseX < scrollZoneWidth && canScrollLeft) {
        setShowArrows({ left: true, right: false });
        if (scrollDirection !== 'left') {
          scrollDirection = 'left';
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(scroll);
          }
        }
      } else if (mouseX > containerWidth - scrollZoneWidth && canScrollRight) {
        setShowArrows({ left: false, right: true });
        if (scrollDirection !== 'right') {
          scrollDirection = 'right';
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(scroll);
          }
        }
      } else {
        setShowArrows({ left: false, right: false });
        scrollDirection = null;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    };

    const handleMouseLeave = () => {
      setShowArrows({ left: false, right: false });
      scrollDirection = null;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('scroll', () => updateArrows(container));
    
    // Initial arrow state
    updateArrows(container);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('scroll', () => updateArrows(container));
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, dependencies);

  return { scrollRef, showArrows };
};

