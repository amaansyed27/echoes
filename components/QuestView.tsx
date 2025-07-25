
import React, { useEffect } from 'react';
import type { Story, GeoLocation, CompletedQuest } from '../types';
import { ChevronLeftIcon } from './icons';
import QuestCard from './QuestCard';

interface QuestViewProps {
  story: Story;
  onQuestComplete: (completedQuestData: Omit<CompletedQuest, 'quest'>) => void;
  userLocation: GeoLocation | null;
  geoError: string | null;
  onBackToPath: () => void;
  speak: (text: string, key: string) => void;
  cancel: () => void;
}

const QuestView: React.FC<QuestViewProps> = ({
  story,
  onQuestComplete,
  userLocation,
  geoError,
  onBackToPath,
  speak,
  cancel,
}) => {
  const currentQuest = story.quests[story.currentQuestIndex];
  const isAdventureComplete = story.currentQuestIndex >= story.quests.length;

  useEffect(() => {
    if (currentQuest?.narrative) {
      speak(currentQuest.narrative, `quest-${currentQuest.title}`);
    }
    return () => {
      cancel();
    };
  }, [currentQuest, speak, cancel]);


  if (isAdventureComplete) {
     return (
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center p-8 bg-gray-800/50 rounded-xl shadow-2xl backdrop-blur-lg border border-amber-500 animate-fade-in">
            <h2 className="text-3xl font-bold font-cinzel text-amber-300">Adventure Complete!</h2>
            <p className="mt-2 text-gray-300">You have uncovered the echoes of {story.destination.name}. Check your Library to revisit your journey.</p>
            <button
              onClick={onBackToPath}
              className="mt-6 flex items-center space-x-2 px-6 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-500 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>View Completed Path</span>
            </button>
        </div>
     )
  }
  
  if (!currentQuest) {
    return (
        <div className="text-center">
            <p>Quest not found. Returning to path...</p>
            <button onClick={onBackToPath}>Go Back</button>
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
       <button 
        onClick={onBackToPath}
        className="flex items-center space-x-2 text-amber-300 hover:text-amber-200 transition-colors mb-4 group"
        >
           <ChevronLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
           <span className="font-semibold">Back to Path</span>
       </button>
      
      <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl backdrop-blur-lg border border-gray-700 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-300 font-cinzel mb-4">{currentQuest.title}</h1>
        <div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed whitespace-pre-wrap">
            {currentQuest.narrative}
        </div>
      </div>

      <QuestCard
        key={story.currentQuestIndex}
        quest={currentQuest}
        questNumber={story.currentQuestIndex + 1}
        totalQuests={story.quests.length}
        onComplete={onQuestComplete}
        userLocation={userLocation}
        geoError={geoError}
      />
    </div>
  );
};

export default QuestView;
