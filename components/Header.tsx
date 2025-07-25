
import React, { useState } from 'react';

interface HeaderProps {
  onHomeClick: () => void;
  onChatClick: () => void;
  onProfileClick: () => void;
  onInstallClick?: () => void;
  userProfile?: {
    name: string;
    avatar: string;
    level: number;
  };
}

const Header: React.FC<HeaderProps> = ({ 
  onHomeClick, 
  onChatClick, 
  onProfileClick,
  onInstallClick,
  userProfile 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <header className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-30 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo with Animation */}
            <button 
              onClick={onHomeClick}
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center relative overflow-hidden group-active:scale-95 transition-all duration-200">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-orange-600 opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                <svg className="w-5 h-5 text-black relative z-10 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white tracking-wider">ECHOES</h1>
                <p className="text-xs text-amber-400 -mt-1">Adventure Awaits</p>
              </div>
            </button>
            
            {/* Center Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700/50">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-300 font-medium">Ready for Adventure</span>
            </div>
            
            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Install Button (visible when PWA installable) */}
              {onInstallClick && (
                <button
                  onClick={onInstallClick}
                  className="p-3 bg-amber-500/20 backdrop-blur-sm rounded-xl border border-amber-400/30 hover:bg-amber-500/30 active:scale-95 transition-all duration-200 group"
                  aria-label="Install App"
                >
                  <svg className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              )}

              {/* AI Chat Button */}
              <button
                onClick={onChatClick}
                className="relative p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:bg-gray-700/50 active:scale-95 transition-all duration-200 group"
                aria-label="Chat with AI"
              >
                <svg className="w-5 h-5 text-white group-hover:text-amber-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.847-.461l-3.153.967.967-3.153A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-gray-900"></div>
              </button>

              {/* Profile Button */}
              <button
                onClick={onProfileClick}
                className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-700/50 hover:bg-gray-700/50 active:scale-95 transition-all duration-200 group"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-sm font-bold text-black group-hover:scale-110 transition-transform duration-200">
                  {userProfile?.avatar || '👤'}
                </div>
                {userProfile && (
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white leading-none group-hover:text-amber-400 transition-colors duration-200">{userProfile.name}</p>
                    <p className="text-xs text-gray-400">Level {userProfile.level}</p>
                  </div>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:bg-gray-700/50 active:scale-95 transition-all duration-200"
              >
                <svg className={`w-5 h-5 text-white transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Notification Banner */}
        <div className="md:hidden px-4 pb-2">
          <div className="flex items-center justify-center space-x-2 bg-gray-800/30 backdrop-blur-sm px-3 py-1 rounded-lg border border-gray-700/30">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-300">Ready for Adventure</span>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="absolute top-20 right-4 left-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 animate-slide-down">
            <div className="space-y-4">
              <button
                onClick={() => {
                  onChatClick();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.847-.461l-3.153.967.967-3.153A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
                <span className="text-white font-medium">AI Assistant</span>
              </button>
              
              <button
                onClick={() => {
                  onProfileClick();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded flex items-center justify-center text-xs font-bold text-black">
                  👤
                </div>
                <span className="text-white font-medium">Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
