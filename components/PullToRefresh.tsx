import React, { useState, useEffect, useRef } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ 
  onRefresh, 
  children, 
  threshold = 80 
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);
      
      if (distance > 10) {
        setIsPulling(true);
        setPullDistance(Math.min(distance, threshold * 1.5));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
  };

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, pullDistance, isRefreshing, threshold]);

  const progress = Math.min(pullDistance / threshold, 1);
  const shouldShowRefresh = isPulling || isRefreshing;

  return (
    <div className="relative">
      {/* Pull to Refresh Indicator */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800/50 transition-all duration-300 ${
          shouldShowRefresh ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          transform: `translateY(${isPulling ? Math.min(pullDistance - threshold, 0) : isRefreshing ? 0 : -100}px)`
        }}
      >
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full border-2 border-amber-400 transition-all duration-300 ${
              isRefreshing ? 'animate-spin border-t-transparent' : ''
            }`} style={{
              transform: `rotate(${progress * 360}deg)`
            }}>
              {!isRefreshing && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                </div>
              )}
            </div>
            <span className="text-white font-medium">
              {isRefreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        transform: `translateY(${isPulling ? Math.min(pullDistance * 0.5, threshold * 0.5) : 0}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease-out'
      }}>
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
