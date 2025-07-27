import React from 'react';

interface GlobalLoaderProps {
  isVisible: boolean;
  message?: string;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
      <div className="bg-white shadow-2xl rounded-2xl p-8 mx-4 max-w-sm w-full">
        <div className="text-center">
          {/* Animated Logo */}
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
          </div>

          {/* Message */}
          <p className="text-gray-800 font-medium mb-2">{message}</p>
          <p className="text-gray-500 text-sm">Please wait a moment...</p>
        </div>
      </div>
    </div>
  );
};

export default GlobalLoader;
