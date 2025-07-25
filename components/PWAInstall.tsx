import React, { useState, useEffect } from 'react';

interface PWAInstallProps {
  onClose: () => void;
}

const PWAInstall: React.FC<PWAInstallProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstall(false);
      onClose();
    }
  };

  const handleDismiss = () => {
    setShowInstall(false);
    onClose();
  };

  if (!showInstall || !deferredPrompt) return null;

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
            Install Echoes on your device for quick access to your adventures and quests.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleInstall}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform active:scale-95"
            >
              Install App
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
