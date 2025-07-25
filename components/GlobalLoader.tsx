import React from 'react';

interface GlobalLoaderProps {
  isVisible: boolean;
  message?: string;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-2xl p-8 mx-4 max-w-sm w-full">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-orange-600 animate-spin-slow opacity-30"></div>
            <svg className="w-8 h-8 text-black relative z-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>

          {/* Loading Spinner */}
          <div className="relative w-12 h-12 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-amber-500 rounded-full animate-spin"></div>
          </div>

          {/* Message */}
          <p className="text-white font-medium mb-2">{message}</p>
          <p className="text-gray-400 text-sm">Please wait...</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
