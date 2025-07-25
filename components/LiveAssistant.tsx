import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { generateChatResponse } from '../services/geminiService';
import { UserProfile, Quest, GeoLocation } from '../types';

interface LiveAssistantProps {
  userProfile: UserProfile;
  currentLocation?: GeoLocation;
  currentCity?: string;
  currentQuest?: Quest;
  isVisible?: boolean;
  onMinimize?: () => void;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({
  currentCity,
  currentQuest,
  isVisible = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<Array<{text: string, isUser: boolean, timestamp: Date}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoTalkEnabled, setAutoTalkEnabled] = useState(true);
  
  const lastAutoMessageRef = useRef<Date>(new Date());

  const {
    interimTranscript,
    finalTranscript,
    isListening,
    isSupported: speechRecognitionSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  const {
    speak,
    cancel: cancelSpeech,
    isSpeaking
  } = useSpeechSynthesis();

  // Handle voice input completion
  useEffect(() => {
    if (finalTranscript && finalTranscript.trim()) {
      handleVoiceInput(finalTranscript.trim());
      resetTranscript();
    }
  }, [finalTranscript]);

  // Auto-guidance based on quest progress
  useEffect(() => {
    if (autoTalkEnabled && currentQuest && !isProcessing) {
      const now = new Date();
      const timeSinceLastMessage = now.getTime() - lastAutoMessageRef.current.getTime();
      
      // Provide guidance every 3 minutes or when quest changes
      if (timeSinceLastMessage > 180000) { // 3 minutes
        provideAutoGuidance();
      }
    }
  }, [currentQuest, autoTalkEnabled]);

  const handleVoiceInput = async (input: string) => {
    if (!input.trim()) return;

    setIsProcessing(true);
    setAssistantMessages(prev => [...prev, { text: input, isUser: true, timestamp: new Date() }]);

    try {
      const context = currentQuest ? `Current quest: ${currentQuest.title}. ${currentQuest.description}` : 
                     currentCity ? `Exploring ${currentCity}` : 'General exploration';

      const response = await generateChatResponse(input, context);

      const assistantMessage = { text: response, isUser: false, timestamp: new Date() };
      setAssistantMessages(prev => [...prev, assistantMessage]);
      
      // Speak the response
      speak({
        text: response,
        onEnd: () => {
          // Restart listening after speaking
          if (isVoiceMode) {
            setTimeout(() => {
              startListening({ continuous: false, interimResults: true });
            }, 500);
          }
        }
      });

    } catch (error) {
      console.error('Assistant error:', error);
      setAssistantMessages(prev => [...prev, { 
        text: "I'm having trouble right now. Please try again.", 
        isUser: false, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const provideAutoGuidance = async () => {
    if (!currentQuest) return;

    setIsProcessing(true);
    lastAutoMessageRef.current = new Date();

    try {
      const guidancePrompt = `Provide a brief, encouraging guidance for the current quest: ${currentQuest.title}. 
                             Keep it under 30 words and motivational.`;

      const response = await generateChatResponse(
        guidancePrompt,
        `Quest: ${currentQuest.title} - ${currentQuest.description}`
      );

      const assistantMessage = { text: response, isUser: false, timestamp: new Date() };
      setAssistantMessages(prev => [...prev, assistantMessage]);
      
      // Auto-speak guidance
      speak({
        text: response,
        onEnd: () => {}
      });

    } catch (error) {
      console.error('Auto guidance error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleVoiceMode = () => {
    if (isVoiceMode) {
      stopListening();
      setIsVoiceMode(false);
    } else {
      if (speechRecognitionSupported) {
        setIsVoiceMode(true);
        startListening({ continuous: false, interimResults: true });
      } else {
        alert('Voice recognition is not supported in your browser');
      }
    }
  };

  const handleTalkToAssistant = () => {
    if (isSpeaking) {
      cancelSpeech();
      return;
    }

    if (!speechRecognitionSupported) {
      alert('Voice recognition is not supported in your browser');
      return;
    }

    setIsExpanded(true);
    setIsVoiceMode(true);
    startListening({ continuous: false, interimResults: true });
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Voice Button */}
      {!isExpanded && (
        <button
          onClick={handleTalkToAssistant}
          className={`fixed bottom-20 right-4 z-50 w-16 h-16 rounded-full shadow-lg transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 animate-pulse' 
              : isSpeaking 
                ? 'bg-green-500 animate-bounce'
                : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          {isListening ? (
            <svg className="w-8 h-8 text-white mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          ) : isSpeaking ? (
            <svg className="w-8 h-8 text-white mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4l-5 5H3z"/>
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 13.5C14.8 13.8 14.4 14 14 14H10V12C10 11.4 9.6 11 9 11S8 11.4 8 12V16C8 16.6 8.4 17 9 17S10 16.6 10 16V15H14L20 8.5V7C20 5.9 19.1 5 18 5S16 5.9 16 7V8.5L17.5 7H18C18.6 7 19 6.6 19 6S18.6 5 18 5H16C14.9 5 14 5.9 14 7V8.5L12.5 10L11 8.5V7C11 5.9 10.1 5 9 5S7 5.9 7 7V9C7 10.1 7.9 11 9 11S11 10.1 11 9V8.5L12.5 10L14 8.5V7C14 6.4 14.4 6 15 6S16 6.4 16 7V8.5L14.5 10L16 11.5V10C16 9.4 16.4 9 17 9S18 9.4 18 9V7C18 5.9 17.1 5 16 5H14C12.9 5 12 5.9 12 7V8.5L10.5 10L9 8.5V7C9 6.4 9.4 6 10 6S11 6.4 11 7V8.5L12.5 10L14 8.5V7C14 5.9 14.9 5 16 5H18C19.1 5 20 5.9 20 7V9C20 10.1 19.1 11 18 11S16 10.1 16 9Z"/>
            </svg>
          )}
        </button>
      )}

      {/* Expanded Assistant Panel */}
      {isExpanded && (
        <div className="fixed inset-x-4 bottom-20 z-50 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-amber-400/20 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
              <h3 className="text-amber-400 font-semibold">Live Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoTalkEnabled(!autoTalkEnabled)}
                className={`px-3 py-1 rounded-full text-xs ${
                  autoTalkEnabled ? 'bg-amber-500 text-black' : 'bg-gray-600 text-gray-300'
                }`}
              >
                Auto-Guide
              </button>
              <button
                onClick={toggleVoiceMode}
                className={`p-2 rounded-full ${
                  isVoiceMode ? 'bg-red-500' : 'bg-amber-500'
                }`}
              >
                {isListening ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h12v12H6z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6.92h-2z"/>
                  </svg>
                )}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-2 rounded-full bg-gray-600 hover:bg-gray-500"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13H5v-2h14v2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-60">
            {assistantMessages.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>🎙️ Press the microphone to talk with your assistant</p>
                <p className="text-sm mt-2">I can help guide you through your current quest!</p>
              </div>
            )}
            
            {assistantMessages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-amber-500 text-black'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Voice Input Indicator */}
          {(isListening || interimTranscript) && (
            <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">
                  {isListening ? 'Listening...' : 'Processing...'}
                </span>
              </div>
              {interimTranscript && (
                <p className="text-sm text-amber-300 mt-1 italic">
                  "{interimTranscript}"
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default LiveAssistant;
