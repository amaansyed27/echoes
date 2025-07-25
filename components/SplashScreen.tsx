import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'complete' | 'fadeout'>('loading');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('complete');
    }, 1500);

    const timer2 = setTimeout(() => {
      setAnimationPhase('fadeout');
    }, 2200);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center transition-all duration-500 ${
      animationPhase === 'fadeout' ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className="text-center">
        {/* Logo Animation */}
        <div className={`relative mb-8 transition-all duration-1000 ${
          animationPhase === 'complete' ? 'scale-110' : 'scale-100'
        }`}>
          <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center relative overflow-hidden transition-all duration-1000 ${
            animationPhase === 'loading' ? 'animate-pulse' : ''
          }`}>
            {/* Animated Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-orange-600 animate-spin-slow opacity-30"></div>
            
            {/* Logo Icon */}
            <svg className="w-12 h-12 text-black relative z-10 transition-transform duration-1000" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            
            {/* Ripple Effect */}
            <div className={`absolute inset-0 rounded-2xl border-2 border-amber-300 transition-all duration-1000 ${
              animationPhase === 'complete' ? 'scale-150 opacity-0' : 'scale-100 opacity-50'
            }`}></div>
          </div>
        </div>

        {/* App Name */}
        <div className={`transition-all duration-1000 delay-300 ${
          animationPhase === 'loading' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">ECHOES</h1>
          <p className="text-amber-400 text-lg font-medium">Where adventures begin</p>
        </div>

        {/* Loading Animation */}
        <div className={`mt-12 transition-all duration-500 ${
          animationPhase === 'complete' ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="flex space-x-2 justify-center">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
