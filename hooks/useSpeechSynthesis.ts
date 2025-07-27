
import { useState, useEffect, useCallback } from 'react';

interface SpeakParams {
  text: string;
  onEnd: () => void;
  language?: string;
}

export const useSpeechSynthesis = (language: string = 'en') => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);


  // Helper to pick language-specific realistic voices
  const pickRealisticVoice = (voiceList: SpeechSynthesisVoice[], targetLanguage: string = 'en') => {
    // Language code to language mapping
    const langMap: Record<string, string[]> = {
      'en': ['en-GB', 'en-AU', 'en'],
      'hi': ['hi-IN', 'hi'],
      'es': ['es-ES', 'es-MX', 'es-US', 'es'],
      'fr': ['fr-FR', 'fr-CA', 'fr'],
      'de': ['de-DE', 'de-AT', 'de'],
      'ja': ['ja-JP', 'ja'],
      'ko': ['ko-KR', 'ko'],
      'pt': ['pt-BR', 'pt-PT', 'pt'],
      'ar': ['ar-SA', 'ar-EG', 'ar'],
      'zh': ['zh-CN', 'zh-TW', 'zh-HK', 'zh']
    };

    const supportedLangs = langMap[targetLanguage] || langMap['en'];
    
    // Priority voice selection for each language
    const voicePriorities: Record<string, string[]> = {
      'en': [
        'Microsoft Sonia Online (Natural)',
        'Google UK English',
        'Microsoft Zira',
        'Samantha',
        'Alex'
      ],
      'hi': [
        'Microsoft Hemant',
        'Microsoft Kalpana',
        'Google हिन्दी',
        'Hindi India'
      ],
      'es': [
        'Microsoft Helena',
        'Microsoft Sabina',
        'Google español',
        'Spanish Spain',
        'Spanish Mexico'
      ],
      'fr': [
        'Microsoft Hortense',
        'Microsoft Julie',
        'Google français',
        'French France',
        'French Canadian'
      ],
      'de': [
        'Microsoft Hedda',
        'Microsoft Stefan',
        'Google Deutsch',
        'German Germany'
      ],
      'ja': [
        'Microsoft Haruka',
        'Microsoft Ichiro',
        'Google 日本語',
        'Japanese Japan'
      ],
      'ko': [
        'Microsoft Heami',
        'Google 한국의',
        'Korean Korea'
      ],
      'pt': [
        'Microsoft Heloisa',
        'Microsoft Daniel',
        'Google português do Brasil',
        'Portuguese Brazil'
      ],
      'ar': [
        'Microsoft Naayf',
        'Google العربية',
        'Arabic Saudi Arabia'
      ],
      'zh': [
        'Microsoft Huihui',
        'Microsoft Kangkang',
        'Google 普通话（中国大陆）',
        'Chinese China'
      ]
    };

    const priorities = voicePriorities[targetLanguage] || voicePriorities['en'];
    
    // First, try to find voices by priority for the target language
    for (const priority of priorities) {
      const voice = voiceList.find(v => 
        v.name.includes(priority) && 
        supportedLangs.some(lang => v.lang.startsWith(lang))
      );
      if (voice) return voice;
    }
    
    // Fallback: find any voice for the target language
    for (const lang of supportedLangs) {
      const voice = voiceList.find(v => v.lang.startsWith(lang) && !/eSpeak/i.test(v.name));
      if (voice) return voice;
    }
    
    // Final fallback: English voice
    const englishVoice = voiceList.find(v => v.lang.startsWith('en-') && !/eSpeak/i.test(v.name));
    return englishVoice || voiceList[0] || null;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);
      const populateVoices = () => {
        const voiceList = window.speechSynthesis.getVoices();
        if (voiceList.length > 0) {
            const filteredVoices = voiceList.filter(v => !/eSpeak/i.test(v.name));
            setVoices(filteredVoices);
            setSelectedVoice(current => current || pickRealisticVoice(filteredVoices, language));
        }
      };
      populateVoices();
      // onvoiceschanged is not reliable on all browsers. A timeout helps.
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = populateVoices;
      }
      setTimeout(populateVoices, 200);
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  // Update voice when language changes
  useEffect(() => {
    if (voices.length > 0) {
      const newVoice = pickRealisticVoice(voices, language);
      setSelectedVoice(newVoice);
    }
  }, [language, voices]);

  const speak = useCallback(({ text, onEnd }: SpeakParams) => {
    console.log('useSpeechSynthesis.speak called with:', {
      text: text.substring(0, 50) + '...',
      isSupported,
      selectedVoice: selectedVoice?.name,
      speechSynthesis: !!window.speechSynthesis
    });
    
    if (!isSupported || !text) {
      if (text) console.warn("Speech synthesis not supported. Skipping audio.");
      onEnd();
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Using voice:', selectedVoice.name, selectedVoice.lang);
    } else {
      console.log('No voice selected, using default');
    }
    
    utterance.onstart = () => {
      console.log('Speech started');
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      console.log('Speech ended');
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd();
    };
    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd();
    };
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    
    console.log('Calling speechSynthesis.speak()');
    window.speechSynthesis.speak(utterance);
    
  }, [isSupported, selectedVoice]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.speaking) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported || !window.speechSynthesis.paused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  return { speak, cancel, pause, resume, isSpeaking, isPaused, isSupported, voices, selectedVoice, setSelectedVoice };
};
