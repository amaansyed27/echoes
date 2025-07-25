import React, { useState } from 'react';
import type { Story, UserProfile } from '../types';
import LocationInput from './LocationInput';
import { CheckCircleIcon } from './icons';

interface HomeProps {
  onStart: (location: string) => void;
  error: string | null;
  adventures: Story[];
  onSelectAdventure: (adventureId: string) => void;
  userProfile?: UserProfile;
}

const CircularProgress: React.FC<{value: number, max: number, label: string, icon: string}> = ({ value, max, label, icon }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center p-4 bg-gray-800/50 rounded-xl border border-gray-600">
      <div className="relative w-20 h-20 mb-3">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#fbbf24"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{label}</div>
      </div>
    </div>
  );
};

const AdventureCard: React.FC<{adventure: Story, onSelect: () => void}> = ({ adventure, onSelect }) => {
  const completed = adventure.currentQuestIndex >= adventure.quests.length;
  const progress = completed ? 100 : Math.round((adventure.currentQuestIndex / adventure.quests.length) * 100);

  return (
    <div 
      onClick={onSelect}
      className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-600 active:scale-95 transition-all duration-200 cursor-pointer hover:border-amber-400"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{adventure.title}</h3>
          <p className="text-sm text-gray-300">{adventure.destination.name}</p>
        </div>
        {completed && (
          <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0 ml-2"/>
        )}
      </div>
      
      {!completed && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
            <span>Progress</span>
            <span>{adventure.currentQuestIndex}/{adventure.quests.length}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-amber-400 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

const Home: React.FC<HomeProps> = ({
  onStart,
  error,
  adventures,
  onSelectAdventure,
  userProfile
}) => {
  const [activeSection, setActiveSection] = useState<'journeys' | 'memories'>('journeys');
  const [activeJourneyTab, setActiveJourneyTab] = useState<'current' | 'incomplete' | 'completed'>('current');
  const [activeMemoryTab, setActiveMemoryTab] = useState<'journeys' | 'map'>('journeys');

  // Categorize adventures
  const currentJourney = adventures.find(a => a.currentQuestIndex > 0 && a.currentQuestIndex < a.quests.length);
  const incompleteJourneys = adventures.filter(a => a.currentQuestIndex === 0);
  const completedJourneys = adventures.filter(a => a.currentQuestIndex >= a.quests.length);

  // Mock memory data - in real app, this would come from user profile
  const memoryData = {
    countries: userProfile?.visitedCities?.length || 0,
    cities: 12,
    monuments: 8,
    totalMemories: completedJourneys.length * 5 + 12
  };

  const renderJourneyContent = () => {
    switch (activeJourneyTab) {
      case 'current':
        return currentJourney ? (
          <div className="space-y-4">
            <AdventureCard 
              adventure={currentJourney} 
              onSelect={() => onSelectAdventure(currentJourney.id)} 
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Active Journey</h3>
            <p className="text-gray-400 mb-6">Start a new adventure to begin exploring!</p>
            <LocationInput onStart={onStart} error={error} />
          </div>
        );
      
      case 'incomplete':
        return incompleteJourneys.length > 0 ? (
          <div className="space-y-4">
            {incompleteJourneys.map(adventure => (
              <AdventureCard 
                key={adventure.id}
                adventure={adventure} 
                onSelect={() => onSelectAdventure(adventure.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
            <p className="text-gray-400">No incomplete journeys. Great work, explorer!</p>
          </div>
        );
      
      case 'completed':
        return completedJourneys.length > 0 ? (
          <div className="space-y-4">
            {completedJourneys.map(adventure => (
              <AdventureCard 
                key={adventure.id}
                adventure={adventure} 
                onSelect={() => onSelectAdventure(adventure.id)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Completed Journeys Yet</h3>
            <p className="text-gray-400">Complete your first adventure to see it here!</p>
          </div>
        );
    }
  };

  const renderMemoryContent = () => {
    switch (activeMemoryTab) {
      case 'journeys':
        return completedJourneys.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-300 mb-4">📚 Journey Memories</h3>
            {completedJourneys.map(adventure => (
              <div key={adventure.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{adventure.title}</h4>
                  <span className="text-sm text-amber-400">{Math.floor(Math.random() * 10) + 3} memories</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{adventure.destination.name}</p>
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-lg">
                      📸
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Memories Yet</h3>
            <p className="text-gray-400">Complete journeys to create lasting memories!</p>
          </div>
        );
      
      case 'map':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-amber-300 mb-4">🗺️ Exploration Progress</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <CircularProgress 
                value={memoryData.countries} 
                max={50} 
                label="Countries" 
                icon="🌍" 
              />
              <CircularProgress 
                value={memoryData.cities} 
                max={100} 
                label="Cities" 
                icon="🏙️" 
              />
              <CircularProgress 
                value={memoryData.monuments} 
                max={25} 
                label="Monuments" 
                icon="🏛️" 
              />
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-600">
              <h4 className="font-semibold text-white mb-3">Explorer Level 1</h4>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-1000" 
                  style={{ width: '35%' }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">350/1000 XP to next level</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, Explorer!</h1>
          <p className="text-gray-300">Your adventure dashboard awaits</p>
        </div>

        {/* Main Sections Toggle */}
        <div className="flex bg-gray-800/50 p-1 rounded-xl mb-6 border border-gray-600">
          <button
            onClick={() => setActiveSection('journeys')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeSection === 'journeys'
                ? 'bg-amber-500 text-black'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            🧭 Journeys
          </button>
          <button
            onClick={() => setActiveSection('memories')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeSection === 'memories'
                ? 'bg-amber-500 text-black'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            📚 Memories
          </button>
        </div>

        {/* Section Content */}
        {activeSection === 'journeys' && (
          <div>
            {/* Journey Tabs */}
            <div className="flex bg-gray-800/50 p-1 rounded-xl mb-6 border border-gray-600">
              <button
                onClick={() => setActiveJourneyTab('current')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeJourneyTab === 'current'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Current Journey
              </button>
              <button
                onClick={() => setActiveJourneyTab('incomplete')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeJourneyTab === 'incomplete'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Incomplete ({incompleteJourneys.length})
              </button>
              <button
                onClick={() => setActiveJourneyTab('completed')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeJourneyTab === 'completed'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Completed ({completedJourneys.length})
              </button>
            </div>

            {renderJourneyContent()}
          </div>
        )}

        {activeSection === 'memories' && (
          <div>
            {/* Memory Tabs */}
            <div className="flex bg-gray-800/50 p-1 rounded-xl mb-6 border border-gray-600">
              <button
                onClick={() => setActiveMemoryTab('journeys')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeMemoryTab === 'journeys'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Journey Memories
              </button>
              <button
                onClick={() => setActiveMemoryTab('map')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeMemoryTab === 'map'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Travel Map
              </button>
            </div>

            {renderMemoryContent()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
