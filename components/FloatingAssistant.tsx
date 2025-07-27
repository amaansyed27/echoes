import React from 'react';

interface FloatingAssistantProps {
  onClick: () => void;
  isActive: boolean;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ onClick, isActive }) => {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full shadow-lg active:scale-95 transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600 text-white' 
          : 'bg-white border border-gray-200 text-gray-700 hover:shadow-xl'
      }`}
      aria-label="Chat with AI"
    >
      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.847-.461l-3.153.967.967-3.153A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
      </svg>
      
      {/* Online indicator */}
      {!isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
      )}
    </button>
  );
};

export default FloatingAssistant;
