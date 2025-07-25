
import { useState, useEffect, useCallback } from 'react';

interface SpeakParams {
  text: string;
  onEnd: () => void;
}

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);


  // Helper to pick a realistic voice: Microsoft Sonia Online (Natural) UK > Google UK English > Google US English > Google > Microsoft > Siri > Natural > first
  const pickRealisticVoice = (voiceList: SpeechSynthesisVoice[]) => {
    const sonia = voiceList.find(v => /Microsoft Sonia Online \(Natural\)/i.test(v.name));
    if (sonia) return sonia;
    const googleUk = voiceList.find(v => /Google UK English/i.test(v.name));
    if (googleUk) return googleUk;
    const googleUs = voiceList.find(v => /Google US English/i.test(v.name));
    if (googleUs) return googleUs;
    const google = voiceList.find(v => /Google/i.test(v.name));
    if (google) return google;
    const microsoft = voiceList.find(v => /Microsoft/i.test(v.name));
    if (microsoft) return microsoft;
    const siri = voiceList.find(v => /Siri/i.test(v.name));
    if (siri) return siri;
    const natural = voiceList.find(v => /Natural/i.test(v.name));
    if (natural) return natural;
    const englishVoices = voiceList.filter(v => v.lang.startsWith('en-'));
    return englishVoices[0] || voiceList[0] || null;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);
      const populateVoices = () => {
        const voiceList = window.speechSynthesis.getVoices();
        if (voiceList.length > 0) {
            const filteredVoices = voiceList.filter(v => v.lang.startsWith('en-') && !/eSpeak/i.test(v.name));
            setVoices(filteredVoices);
            setSelectedVoice(current => current || pickRealisticVoice(filteredVoices));
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
  }, []);

  const speak = useCallback(({ text, onEnd }: SpeakParams) => {
    if (!isSupported || !text) {
      if (text) console.warn("Speech synthesis not supported. Skipping audio.");
      onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
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
