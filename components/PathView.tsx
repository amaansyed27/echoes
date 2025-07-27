
import React from 'react';
import type { Story, GeoLocation } from '../types';

interface PathViewProps {
  adventure: Story;
  userLocation: GeoLocation | null;
  onStartQuest: () => void;
  speak: (text: string, key: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  speakingTextKey: string | null;
  onBack: () => void;
}

const PathNode: React.FC<{ 
  quest: any; 
  index: number; 
  isCompleted: boolean; 
  isCurrent: boolean; 
  onSpeak: () => void; 
  isSpeaking: boolean; 
}> = ({ quest, index, isCompleted, isCurrent, onSpeak, isSpeaking }) => {
  const getNodeStyle = () => {
    if (isCurrent) return 'bg-blue-500 border-blue-400 text-white';
    if (isCompleted) return 'bg-green-500 border-green-400 text-white';
    return 'bg-white border-gray-300 text-gray-400';
  };

  const getCardStyle = () => {
    if (isCurrent) return 'bg-blue-50 border-blue-200';
    if (isCompleted) return 'bg-green-50 border-green-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="flex items-start space-x-4 mb-6">
      {/* Node */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${getNodeStyle()}`}>
        {isCompleted ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span>{index + 1}</span>
        )}
      </div>
      
      {/* Quest Card */}
      <div className={`flex-1 border rounded-lg p-4 transition-all shadow-sm ${getCardStyle()}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-1">{quest.title}</h3>
            <p className="text-sm text-gray-500">{quest.targetLocationName}</p>
          </div>
          <button 
            onClick={onSpeak} 
            className="p-2 rounded-full bg-gray-100 active:scale-95 transition-transform"
          >
            <svg 
              className={`w-5 h-5 ${isSpeaking ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.767L4.476 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.476l3.907-3.767a1 1 0 011.617.767z" clipRule="evenodd" />
              <path d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 11-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const PathView: React.FC<PathViewProps> = ({ 
  adventure, 
  onStartQuest, 
  speak, 
  isSpeaking, 
  speakingTextKey, 
  onBack 
}) => {
  const isAdventureComplete = adventure.currentQuestIndex >= adventure.quests.length;
  const progressPercentage = (adventure.currentQuestIndex / adventure.quests.length) * 100;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 active:scale-95 transition-transform"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back to Adventures</span>
      </button>

      {/* Adventure Header */}
      <div className="bg-white rounded-xl p-6 shadow-card border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{adventure.title}</h1>
        <p className="text-gray-500 mb-4">Journey through {adventure.destination.name}</p>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Progress</span>
            <span>{adventure.currentQuestIndex} / {adventure.quests.length} quests</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <p className="text-gray-700 text-sm leading-relaxed flex-1">{adventure.introNarrative}</p>
            <button 
              onClick={() => speak(adventure.introNarrative, adventure.id)} 
              className="ml-3 p-2 rounded-full bg-gray-100 active:scale-95 transition-transform flex-shrink-0"
            >
              <svg 
                className={`w-5 h-5 ${isSpeaking && speakingTextKey === adventure.id ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.767L4.476 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.476l3.907-3.767a1 1 0 011.617.767z" clipRule="evenodd" />
                <path d="M14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 11-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Quest Path */}
      <div className="bg-white rounded-xl p-6 shadow-card border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quest Path</h2>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-5 top-5 bottom-0 w-0.5 bg-gray-200" 
               style={{ height: `${(adventure.quests.length - 1) * 88}px` }} />
          
          {adventure.quests.map((quest, index) => (
            <PathNode
              key={quest.title}
              quest={quest}
              index={index}
              isCompleted={index < adventure.currentQuestIndex}
              isCurrent={index === adventure.currentQuestIndex}
              onSpeak={() => speak(quest.narrative, quest.title)}
              isSpeaking={isSpeaking && speakingTextKey === quest.title}
            />
          ))}
        </div>
      </div>
      
      {/* Action Button */}
      <button
        onClick={onStartQuest}
        disabled={isAdventureComplete}
        className="w-full bg-blue-500 text-white py-4 rounded-lg font-bold text-lg active:scale-95 transition-transform disabled:bg-gray-200 disabled:text-gray-400 disabled:scale-100"
      >
        {isAdventureComplete 
          ? '🎉 Adventure Complete!' 
          : adventure.currentQuestIndex > 0 
            ? 'Continue Journey' 
            : 'Begin Adventure'
        }
      </button>
    </div>
  );
};

export default PathView;
