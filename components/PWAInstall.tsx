import React, { useState, useEffect } from 'react';

interface PWAInstallProps {
  onClose: () => void;
}

const PWAInstall: React.FC<PWAInstallProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isInStandaloneMode = () => {
      return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
             (window.navigator as any).standalone ||
             document.referrer.includes('android-app://');
    };

    setIsStandalone(isInStandaloneMode());

    const handler = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For debugging: also show install prompt after 5 seconds if not standalone
    const debugTimer = setTimeout(() => {
      if (!isInStandaloneMode() && !localStorage.getItem('pwa-install-dismissed')) {
        console.log('Showing manual install prompt');
        setShowInstall(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(debugTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstall(false);
        onClose();
      }
    } else {
      // Manual install instructions
      const userAgent = navigator.userAgent.toLowerCase();
      let instructions = '';
      
      if (userAgent.includes('chrome') || userAgent.includes('edge')) {
        instructions = 'Click the install icon (⬇️) in the address bar or use browser menu > Install Echoes';
      } else if (userAgent.includes('safari')) {
        instructions = 'Tap the Share button and then "Add to Home Screen"';
      } else if (userAgent.includes('firefox')) {
        instructions = 'Use browser menu > Install';
      } else {
        instructions = 'Look for "Install" or "Add to Home Screen" option in your browser menu';
      }
      
      alert('To install this app:\n\n' + instructions);
      onClose();
    }
  };

  const handleDismiss = () => {
    setShowInstall(false);
    onClose();
  };

  // Don't show if already standalone or user dismissed
  if (isStandalone || !showInstall) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-gray-900 border-t border-gray-700 md:border md:rounded-2xl w-full md:max-w-md mx-4 mb-0 md:mb-4 p-6 animate-slide-up md:animate-scale-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Install Echoes</h3>
          <p className="text-gray-300 mb-6">
            {deferredPrompt 
              ? "Install Echoes on your device for quick access to your adventures and quests."
              : "Add Echoes to your home screen for the best experience!"
            }
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleInstall}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform active:scale-95"
            >
              {deferredPrompt ? 'Install App' : 'Show Instructions'}
            </button>
            
            <button
              onClick={handleDismiss}
              className="w-full text-gray-400 hover:text-white py-3 transition-colors duration-200"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstall;
