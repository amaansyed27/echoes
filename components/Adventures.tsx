import React from 'react';
import type { Story, UserProfile } from '../types';
import LocationInput from './LocationInput';

interface AdventuresProps {
  onStart: (location: string) => void;
  error: string | null;
  adventures: Story[];
  onSelectAdventure: (adventureId: string) => void;
  userProfile?: UserProfile;
}

const AdventureCard: React.FC<{ adventure: Story; onSelect: () => void }> = ({ adventure, onSelect }) => {
  const progress = adventure.currentQuestIndex / adventure.quests.length;
  const isCompleted = adventure.currentQuestIndex >= adventure.quests.length;
  const isStarted = adventure.currentQuestIndex > 0;

  return (
    <div className="bg-white border border-gray-200 p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{adventure.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{adventure.destination.name}</p>
          <p className="text-sm text-gray-700 line-clamp-2">{adventure.introNarrative}</p>
        </div>
        {adventure.imageUrl && (
          <img 
            src={adventure.imageUrl} 
            alt={adventure.title}
            className="w-16 h-16 object-cover border border-gray-200 ml-4"
          />
        )}
      </div>

      {/* Progress */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {isCompleted ? 'Completed' : `Quest ${adventure.currentQuestIndex} of ${adventure.quests.length}`}
          </span>
          <span className="text-gray-600">
            {Math.round(progress * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 h-2">
          <div 
            className={`h-2 transition-all ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${progress * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onSelect}
        className={`w-full py-2 px-4 font-medium transition-colors ${
          isCompleted 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : isStarted
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-500 text-white hover:bg-gray-600'
        }`}
      >
        {isCompleted ? 'View Completed' : isStarted ? 'Continue Adventure' : 'Start Adventure'}
      </button>
    </div>
  );
};

const Adventures: React.FC<AdventuresProps> = ({
  onStart,
  error,
  adventures,
  onSelectAdventure,
  userProfile
}) => {
  // Categorize adventures
  const currentJourney = adventures.find(a => a.currentQuestIndex > 0 && a.currentQuestIndex < a.quests.length);
  const incompleteJourneys = adventures.filter(a => a.currentQuestIndex === 0);
  const completedJourneys = adventures.filter(a => a.currentQuestIndex >= a.quests.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Adventures</h1>
          <p className="text-gray-600">Ready for your next adventure?</p>
        </div>

        {/* Adventure Creator */}
        <div className="mb-8">
          <LocationInput onStart={onStart} error={error} disabled={false} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{completedJourneys.length}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>
          <div className="bg-white border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{incompleteJourneys.length}</div>
            <div className="text-xs text-gray-500 mt-1">Planned</div>
          </div>
          <div className="bg-white border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{userProfile?.level || 1}</div>
            <div className="text-xs text-gray-500 mt-1">Level</div>
          </div>
        </div>

        {/* Current Adventure */}
        {currentJourney && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 mr-3"></span>
              Continue Your Journey
            </h2>
            <AdventureCard
              adventure={currentJourney}
              onSelect={() => onSelectAdventure(currentJourney.id)}
            />
          </div>
        )}

        {/* Available Adventures */}
        {incompleteJourneys.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-amber-500 mr-3"></span>
              Available Adventures
            </h2>
            <div className="space-y-4">
              {incompleteJourneys.map(adventure => (
                <AdventureCard
                  key={adventure.id}
                  adventure={adventure}
                  onSelect={() => onSelectAdventure(adventure.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Adventures */}
        {completedJourneys.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 mr-3"></span>
              Completed Adventures
            </h2>
            <div className="space-y-4">
              {completedJourneys.map(adventure => (
                <AdventureCard
                  key={adventure.id}
                  adventure={adventure}
                  onSelect={() => onSelectAdventure(adventure.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {adventures.length === 0 && (
          <div className="text-center py-12 bg-white border border-gray-200">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Adventures Yet</h3>
            <p className="text-gray-600 mb-6">Create your first adventure to get started!</p>
            <div className="text-sm text-gray-500">
              Enter a location above to begin your journey
            </div>
          </div>
        )}

        {/* Nearby Adventures */}
        <div className="bg-blue-50 border border-blue-200 p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-3">Discover Nearby</h3>
          <p className="text-sm text-blue-800 mb-4">
            Find adventures and points of interest within 10km of your current location.
          </p>
          <div className="text-xs text-blue-700">
            💡 Tip: Enable location services for personalized recommendations
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adventures;
