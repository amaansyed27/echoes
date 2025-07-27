import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../services/chatService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useLanguage } from '../hooks/useLanguage';
import type { ChatMessage, UserProfile, GeoLocation } from '../types';

interface ChatInterfaceProps {
  userProfile?: UserProfile;
  currentLocation?: GeoLocation;
  currentCity?: string;
  questContext?: any;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  userProfile,
  currentLocation,
  currentCity,
  questContext,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello ${userProfile?.name || 'Explorer'}! I'm Echoes, your AI travel companion. How can I help you explore today?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const [transcript, setTranscript] = useState('');
  const [voiceResponseEnabled, setVoiceResponseEnabled] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Language and TTS support
  const { selectedLanguage } = useLanguage();
  const { speak, isSpeaking, isSupported } = useSpeechSynthesis(selectedLanguage.code);

  // Debug speech synthesis functionality
  useEffect(() => {
    console.log('Speech synthesis status:', {
      isSupported,
      speechSynthesis: !!window.speechSynthesis,
      voices: window.speechSynthesis ? window.speechSynthesis.getVoices().length : 0
    });
  }, [isSupported]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage?.speechCode || 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
        setVoiceError('');
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setTranscript(finalTranscript);
            sendMessage(finalTranscript.trim(), true); // Mark as voice input
          } else {
            interimTranscript += transcript;
            setTranscript(interimTranscript);
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
        
        setVoiceError(errorMessage);
        setIsListening(false);
        setTranscript('');
        
        setTimeout(() => setVoiceError(''), 5000);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [selectedLanguage?.speechCode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string, isFromVoice: boolean = false) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
      isVoice: isFromVoice
    };

    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
    setInputText('');
    setTranscript('');
    setIsTyping(true);

    try {
      const response = await chatWithAI(text, {
        location: currentLocation,
        userProfile,
        currentCity,
        previousMessages: messages,
        questContext,
        language: selectedLanguage.code
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages((prev: ChatMessage[]) => [...prev, aiMessage]);
      
      // FIX: This block enables the AI to speak automatically.
      if (voiceResponseEnabled && response && response.trim()) {
        // A short delay ensures the message bubble renders before speech starts.
        setTimeout(() => {
          speak({
            text: response,
            onEnd: () => {
              console.log('Finished speaking AI response');
            }
          });
        }, 200);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = 'I apologize, but I seem to have lost my connection. Please try again.';
      const errorAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages((prev: ChatMessage[]) => [...prev, errorAiMessage]);
      // Also speak the error message
      if (voiceResponseEnabled) {
        setTimeout(() => speak({ text: errorMessage, onEnd: () => {} }), 200);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoiceRecognition = async () => {
    if (!recognitionRef.current) {
      setVoiceError('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      console.log('Stopping voice recognition');
      recognitionRef.current.stop();
    } else {
      if (isSpeaking && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Starting voice recognition');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Microphone permission error:', error);
        setVoiceError('Microphone access denied. Please allow microphone permission and try again.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText.trim(), false);
  };

  const isVoiceSupported = !!recognitionRef.current;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full h-[85vh] bg-white border-t border-gray-200 rounded-t-3xl flex flex-col shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white">
              E
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Echoes AI</h3>
              <p className="text-xs text-gray-500">Your travel companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 active:scale-95 transition-transform hover:bg-gray-200"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.isVoice && (
                  <div className="flex items-center mt-1 text-xs opacity-60">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 0 1 6 0v4a3 3 0 1 1-6 0V4zm4 10.93A7.001 7.001 0 0 0 17 8a1 1 0 1 0-2 0A5 5 0 0 1 5 8a1 1 0 0 0-2 0 7.001 7.001 0 0 0 6 6.93V17H6a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    Voice
                  </div>
                )}
                {message.type === 'ai' && (
                  <button
                    onClick={() => {
                      speak({ text: message.content, onEnd: () => {} });
                    }}
                    className="mt-2 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 transition-colors"
                  >
                    🔊 Speak
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 border border-gray-200 p-3 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          {voiceError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {voiceError}
            </div>
          )}
          
          <div className="mb-2 text-xs text-gray-500 bg-gray-50 p-2 rounded flex items-center justify-between">
            <span>Voice: {isVoiceSupported ? '✅' : '❌'} | Speech: {isSupported ? '✅' : '❌'} | Listening: {isListening ? '🎤' : '⏹️'} | Speaking: {isSpeaking ? '🔊' : '🔇'}</span>
            <div className="flex space-x-1">
              <button 
                type="button"
                onClick={() => setVoiceResponseEnabled(!voiceResponseEnabled)}
                className={`px-2 py-1 rounded text-xs hover:opacity-80 ${
                  voiceResponseEnabled 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                Auto-Speak {voiceResponseEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? "🎤 Listening..." : "Ask me anything..."}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                disabled={isListening || isTyping}
              />
              {transcript && (
                <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                  "{transcript}"
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={toggleVoiceRecognition}
              className={`p-3 rounded-2xl transition-all active:scale-95 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                  : isVoiceSupported
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
              disabled={!isVoiceSupported}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 0 1 6 0v4a3 3 0 1 1-6 0V4zm4 10.93A7.001 7.001 0 0 0 17 8a1 1 0 1 0-2 0A5 5 0 0 1 5 8a1 1 0 0 0-2 0 7.001 7.001 0 0 0 6 6.93V17H6a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3 bg-blue-500 text-white rounded-2xl active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          
          {isSpeaking && (
            <div className="text-xs text-gray-500 mt-2 flex items-center space-x-2">
              <span className="flex items-center space-x-1 text-blue-600">
                <span>🔊</span>
                <span>AI is speaking...</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;