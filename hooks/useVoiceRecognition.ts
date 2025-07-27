import { useState, useCallback, useRef, useEffect } from 'react';
import type { VoiceInteraction } from '../types';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface UseVoiceRecognitionProps {
  onTranscript: (transcript: string) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

export const useVoiceRecognition = ({ 
  onTranscript, 
  onError,
  language = 'en-US', 
  continuous = false 
}: UseVoiceRecognitionProps) => {
  const [voiceState, setVoiceState] = useState<VoiceInteraction>({
    isListening: false,
    isProcessing: false,
    transcript: '',
    confidence: 0
  });

  const recognitionRef = useRef<any>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setVoiceState((prev: VoiceInteraction) => ({ ...prev, isListening: true, isProcessing: false }));
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setVoiceState((prev: VoiceInteraction) => ({
              ...prev,
              transcript: finalTranscript,
              confidence: confidence || 0.9,
              isProcessing: true
            }));
            onTranscript(finalTranscript.trim());
          } else {
            interimTranscript += transcript;
            setVoiceState((prev: VoiceInteraction) => ({
              ...prev,
              transcript: interimTranscript,
              confidence: confidence || 0.5
            }));
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Speech recognition error occurred.';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permission.';
            break;
          case 'network':
            errorMessage = 'Network error occurred. Check your connection.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was aborted.';
            break;
          default:
            errorMessage = `Speech error: ${event.error}`;
        }
        
        if (onError) {
          onError(errorMessage);
        }
        
        setVoiceState((prev: VoiceInteraction) => ({
          ...prev,
          isListening: false,
          isProcessing: false
        }));
      };

      recognition.onend = () => {
        setVoiceState((prev: VoiceInteraction) => ({
          ...prev,
          isListening: false,
          isProcessing: false
        }));
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, continuous, onTranscript, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !voiceState.isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
      }
    }
  }, [voiceState.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
    }
  }, [voiceState.isListening]);

  const toggleListening = useCallback(() => {
    if (voiceState.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [voiceState.isListening, startListening, stopListening]);

  return {
    voiceState,
    startListening,
    stopListening,
    toggleListening,
    isSupported
  };
};
