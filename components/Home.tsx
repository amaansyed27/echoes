import React from 'react';
import type { Story, UserProfile } from '../types';
import LocationInput from './LocationInput';
import AdventureCard from './AdventureCard';
import { useTranslations } from '../services/translations';
import { useLanguage } from '../hooks/useLanguage';

interface HomeProps {
  onStart: (location: string) => void;
  error: string | null;
  adventures: Story[];
  onSelectAdventure: (adventureId: string) => void;
  userProfile?: UserProfile;
}

const Home: React.FC<HomeProps> = ({
  onStart,
  error,
  adventures,
  onSelectAdventure,
  userProfile
}) => {
  const { selectedLanguage } = useLanguage();
  const t = useTranslations(selectedLanguage.code);
  
  // Categorize adventures
  const currentJourney = adventures.find(a => a.currentQuestIndex > 0 && a.currentQuestIndex < a.quests.length);
  const incompleteJourneys = adventures.filter(a => a.currentQuestIndex === 0);
  const completedJourneys = adventures.filter(a => a.currentQuestIndex >= a.quests.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Welcome Header - Simplified */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-lg">{t.home.readyForAdventure}</p>
        </div>

        {/* Adventure Creator - New Design */}
        <div className="mb-8">
          <LocationInput onStart={onStart} error={error} disabled={false} />
        </div>

        {/* Quick Stats - Simplified */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{completedJourneys.length}</div>
            <div className="text-xs text-gray-500 mt-1">{t.common.completed}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-amber-600">{incompleteJourneys.length}</div>
            <div className="text-xs text-gray-500 mt-1">{t.common.planned}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">{userProfile?.level || 1}</div>
            <div className="text-xs text-gray-500 mt-1">{t.common.level}</div>
          </div>
        </div>

        {/* Current Journey or Recent Activity */}
        {currentJourney ? (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              {t.adventures.continueYourJourney}
            </h2>
            <AdventureCard 
              adventure={currentJourney} 
              onSelect={() => onSelectAdventure(currentJourney.id)}
              style="featured"
            />
          </div>
        ) : null}

        {/* Planned Adventures */}
        {incompleteJourneys.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
              {t.adventures.plannedAdventures}
            </h3>
            <div className="space-y-3">
              {incompleteJourneys.slice(0, 2).map((adventure) => (
                <AdventureCard 
                  key={adventure.id}
                  adventure={adventure} 
                  onSelect={() => onSelectAdventure(adventure.id)}
                  style="compact"
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Memories - Simplified */}
        {completedJourneys.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
              {t.adventures.recentMemories}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {completedJourneys.slice(0, 4).map((adventure) => (
                <AdventureCard 
                  key={adventure.id}
                  adventure={adventure} 
                  onSelect={() => onSelectAdventure(adventure.id)}
                  style="grid"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {adventures.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t.adventures.readyToExplore}</h3>
            <p className="text-gray-600">{t.adventures.startFirstAdventure} {t.adventures.discoverAmazingPlaces}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
