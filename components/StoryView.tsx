
import React from 'react';
import type { Story, GeoLocation, CompletedQuest } from '../types';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { PlayIcon, PauseIcon, StopIcon } from './icons';
import QuestCard from './QuestCard';

interface StoryViewProps {
  story: Story;
  onQuestComplete: (completedQuestData: Omit<CompletedQuest, 'quest'>) => void;
  userLocation: GeoLocation | null;
  geoError: string | null;
}

const StoryView: React.FC<StoryViewProps> = ({
  story,
  onQuestComplete,
  userLocation,
  geoError,
}) => {
  const { speak, pause, resume, cancel, isSpeaking, isPaused } = useSpeechSynthesis();
  const currentQuest = story.quests[story.currentQuestIndex];
  const isAdventureComplete = story.currentQuestIndex >= story.quests.length;

  const handlePlayPause = () => {
    if (!currentQuest) return;
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak({ text: currentQuest.narrative, onEnd: () => {} });
    }
  };

  if (isAdventureComplete) {
    return (
       <div className="text-center p-8 bg-amber-900/20 border-2 border-dashed border-amber-400 rounded-xl">
         <h2 className="text-3xl font-bold font-cinzel text-amber-300">Adventure Complete!</h2>
         <p className="mt-2 text-gray-300">You have uncovered the echoes of {story.destination.name}. Check your Library to revisit your journey.</p>
       </div>
    );
  }

  if (!currentQuest) {
    // This case should ideally not be reached if isAdventureComplete is handled, but it's a good safeguard.
    return (
        <div className="text-center">
            <p>Quest not found.</p>
        </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl backdrop-blur-lg border border-gray-700 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-amber-300 font-cinzel mb-4">{currentQuest.title}</h1>
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handlePlayPause}
            className="p-3 bg-amber-500 text-gray-900 rounded-full hover:bg-amber-400 transition-colors"
            aria-label={isSpeaking && !isPaused ? "Pause narration" : "Play narration"}
          >
            {isSpeaking && !isPaused ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
          </button>
          <button
            onClick={cancel}
            className="p-3 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
            aria-label="Stop narration"
          >
            <StopIcon className="w-6 h-6" />
          </button>
        </div>
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

export default StoryView;
