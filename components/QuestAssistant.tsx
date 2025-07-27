import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile, GeoLocation } from '../types';
import { chatWithAI } from '../services/chatService';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useLanguage } from '../hooks/useLanguage';

interface QuestAssistantProps {
  userProfile?: UserProfile;
  currentLocation?: GeoLocation;
  currentCity?: string;
  questContext?: any;
  isVisible: boolean;
  onClose: () => void;
}

const QuestAssistant: React.FC<QuestAssistantProps> = ({
  userProfile,
  currentLocation,
  currentCity,
  questContext,
  isVisible,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { selectedLanguage } = useLanguage();
  const { speak } = useSpeechSynthesis(selectedLanguage.code);

  // Initialize with contextual welcome message
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      let welcomeMessage = `Hello ${userProfile?.name || 'Explorer'}! I'm your quest assistant. `;
      
      if (questContext) {
        welcomeMessage += `I see you're working on "${questContext.title}". How can I help you complete this quest?`;
      } else {
        welcomeMessage += `I'm here to help you with your adventures. What would you like to explore today?`;
      }

      setMessages([{
        id: '1',
        type: 'ai',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [isVisible, questContext, userProfile?.name, messages.length]);

  const handleTranscript = async (transcript: string) => {
    if (transcript.trim()) {
      await sendMessage(transcript);
    }
  };

  const { voiceState, toggleListening, isSupported: voiceSupported } = useVoiceRecognition({
    onTranscript: handleTranscript,
    continuous: false
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
      isVoice: voiceState.isListening
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Enhanced context for quest assistance
      const enhancedContext = questContext ? {
        ...questContext,
        questHelp: true,
        assistanceType: 'quest_guidance'
      } : null;

      const response = await chatWithAI(text, {
        location: currentLocation,
        userProfile,
        currentCity,
        previousMessages: messages,
        questContext: enhancedContext
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Auto-speak AI responses for voice interactions
      if (voiceState.isListening || userMessage.isVoice) {
        speak({
          text: response,
          onEnd: () => {}
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I seem to have lost connection. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText.trim());
    }
  };

  const quickActions = questContext 
    ? ["Give me a hint", "Where should I go?", "What am I looking for?", "Tell me about this place"]
    : ["What's nearby?", "Suggest a quest", "Local recommendations", "How do I use this app?"];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-50 mx-4 mb-4">
      <div className="bg-white backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Quest Assistant</h3>
              {questContext && (
                <p className="text-xs text-gray-500">{questContext.title}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-100 active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-48">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}
              >
                <p className="leading-relaxed">{message.content}</p>
                {message.isVoice && (
                  <div className="flex items-center mt-1 text-xs opacity-60">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    Voice
                  </div>
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

        {/* Quick Actions */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => sendMessage(action)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs border border-gray-200 active:scale-95 transition-transform hover:bg-gray-200"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={voiceState.isListening ? "Listening..." : "Ask for help..."}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                disabled={voiceState.isListening || isTyping}
              />
            </div>
            
            {voiceSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-2xl transition-all active:scale-95 ${
                  voiceState.isListening 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-gray-100 border border-gray-300'
                }`}
              >
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2 bg-blue-500 text-white rounded-2xl active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestAssistant;
