import React, { useState } from 'react';
import { useLanguage, type Language } from '../hooks/useLanguage';

interface LanguageSelectorProps {
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'bottom-left' | 'center';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  showLabel = true, 
  size = 'md',
  position = 'bottom-left'
}) => {
  const { selectedLanguage, changeLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const positionClasses = {
    'top-right': 'right-0 bottom-full mb-1',
    'bottom-left': 'left-0 top-full mt-1',
    'center': 'left-1/2 -translate-x-1/2 top-full mt-1'
  };

  const handleLanguageSelect = (language: Language) => {
    changeLanguage(language.code);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 transition-colors ${sizeClasses[size]}`}
        title={`Current language: ${selectedLanguage.nativeName}`}
      >
        <span className="text-lg">{selectedLanguage.flag}</span>
        {showLabel && (
          <span className="font-medium text-gray-700">{selectedLanguage.nativeName}</span>
        )}
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className={`absolute z-20 bg-white border border-gray-200 shadow-lg max-h-64 overflow-y-auto min-w-[200px] ${positionClasses[position]}`}>
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedLanguage.code === language.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-gray-500">{language.name}</div>
                </div>
                {selectedLanguage.code === language.code && (
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;
