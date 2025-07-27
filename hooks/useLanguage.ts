import { useState, useEffect, useCallback } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string; // For speech recognition/synthesis
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', speechCode: 'en-US' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', speechCode: 'ko-KR' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', speechCode: 'pt-BR' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', speechCode: 'zh-CN' }
];

const LANGUAGE_STORAGE_KEY = 'echoes_selected_language';

export const useLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved) {
      const savedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === saved);
      if (savedLang) return savedLang;
    }
    
    // Auto-detect from browser language
    const browserLang = navigator.language.split('-')[0];
    const detectedLang = SUPPORTED_LANGUAGES.find(lang => lang.code === browserLang);
    return detectedLang || SUPPORTED_LANGUAGES[0]; // Default to English
  });

  const changeLanguage = useCallback((languageCode: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
    if (language) {
      setSelectedLanguage(language);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever language changes
    localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguage.code);
  }, [selectedLanguage]);

  return {
    selectedLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isRTL: selectedLanguage.code === 'ar' // Right-to-left for Arabic
  };
};
