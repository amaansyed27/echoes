import React from 'react';

interface FloatingAssistantProps {
  onClick: () => void;
  isActive: boolean;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg active:scale-95 transition-all duration-200 ${
        isActive 
          ? 'bg-amber-400 text-gray-900' 
          : 'bg-white/10 backdrop-blur-md border border-white/20 text-white'
      }`}
      aria-label="Chat with AI"
    >
      <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.847-.461l-3.153.967.967-3.153A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
      </svg>
      
      {/* Online indicator */}
      {!isActive && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
      )}
    </button>
  );
};

export default FloatingAssistant;
