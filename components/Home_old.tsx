import React from 'react';
import type { Story, UserProfile } from '../types';
import LocationInput from './LocationInput';
import AdventureCard from './AdventureCard';

interface HomeProps {
  onStart: (location: string) => void;
  error: string | null;
  adventures: Story[];
  onSelectAdventure: (adventureId: string) => void;
  userProfile?: UserProfile;
}

const CircularProgress: React.FC<{value: number, max: number, label: string, icon: string}> = ({ value, max, label, icon }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 32;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="relative w-16 h-16 mb-2">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r="32"
            stroke="#E5E7EB"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="36"
            cy="36"
            r="32"
            stroke="#059669"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg">
          {icon}
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-gray-900">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
};

// Using our enhanced AdventureCard instead

const Home: React.FC<HomeProps> = ({
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

  // Calculate real memory data based on actual user progress
  const memoryData = {
    countries: new Set(userProfile?.visitedCities?.map(city => {
      // Extract country from city name (simplified logic)
      return city.split(',').pop()?.trim() || city;
    })).size || 0,
    cities: userProfile?.visitedCities?.length || 0,
    monuments: completedJourneys.reduce((total, journey) => total + journey.quests.length, 0),
    totalMemories: completedJourneys.reduce((total, journey) => total + journey.quests.length * 2, 0), // 2 memories per quest
    totalPhotos: completedJourneys.reduce((total, journey) => 
      total + journey.quests.filter(quest => quest.type === 'photo').length, 0
    ),
    completedQuests: userProfile?.completedQuests || 0
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Welcome Header - Simplified */}
        <div className="text-center mb-6">
          <p className="text-gray-600 text-lg">Ready for your next adventure?</p>
        </div>

        {/* Adventure Creator - New Design */}
        <div className="mb-8">
          <LocationInput onStart={onStart} error={error} disabled={false} />
        </div>

        {/* Quick Stats - Simplified */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{completedJourneys.length}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-amber-600">{incompleteJourneys.length}</div>
            <div className="text-xs text-gray-500 mt-1">Planned</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">{userProfile?.level || 1}</div>
            <div className="text-xs text-gray-500 mt-1">Level</div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex p-2">
            <button
              onClick={() => setActiveSection('journeys')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-sm ${
                activeSection === 'journeys'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              🧭 My Journeys
            </button>
            <button
              onClick={() => setActiveSection('memories')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 text-sm ${
                activeSection === 'memories'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-500 hover:bg-purple-50'
              }`}
            >
              📚 Memories
            </button>
          </div>
        </div>

        {/* Section Content */}
        {activeSection === 'journeys' && (
          <div>
            {/* Current Journey Highlight */}
            {currentJourney ? (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Continue Your Journey
                </h2>
                {/* Display the journey flow visualization for current journey */}
                <JourneyFlow 
                  journey={currentJourney} 
                  onQuestSelect={(_) => onSelectAdventure(currentJourney.id)}
                />
                <AdventureCard 
                  adventure={currentJourney} 
                  onSelect={() => onSelectAdventure(currentJourney.id)}
                  style="featured"
                />
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">🗺️</div>
                  <h3 className="text-xl font-bold mb-2">Start Your Adventure</h3>
                  <p className="text-blue-100 mb-6 text-sm">Where would you like to explore today?</p>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <LocationInput onStart={onStart} error={error} />
                  </div>
                </div>
              </div>
            )}

            {/* Journey Categories */}
            <div className="space-y-4">
              {/* Incomplete Journeys */}
              {incompleteJourneys.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
                    Planned Adventures ({incompleteJourneys.length})
                  </h3>
                  <div className="space-y-3">
                    {incompleteJourneys.slice(0, 3).map((adventure) => (
                      <AdventureCard 
                        key={adventure.id}
                        adventure={adventure} 
                        onSelect={() => onSelectAdventure(adventure.id)}
                        style="compact"
                      />
                    ))}
                    {incompleteJourneys.length > 3 && (
                      <div className="text-center py-2">
                        <button className="text-blue-500 text-sm font-medium">
                          View {incompleteJourneys.length - 3} more planned adventures
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Completed Journeys */}
              {completedJourneys.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                    Completed Adventures ({completedJourneys.length})
                  </h3>
                  <div className="space-y-3">
                    {completedJourneys.slice(0, 2).map((adventure) => (
                      <AdventureCard 
                        key={adventure.id}
                        adventure={adventure} 
                        onSelect={() => onSelectAdventure(adventure.id)}
                        style="compact"
                      />
                    ))}
                    {completedJourneys.length > 2 && (
                      <div className="text-center py-2">
                        <button className="text-green-500 text-sm font-medium">
                          View {completedJourneys.length - 2} more completed adventures
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {incompleteJourneys.length === 0 && completedJourneys.length === 0 && !currentJourney && (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✨</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Explore?</h3>
                  <p className="text-gray-600 text-sm mb-6">Your journey begins with a single step.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'memories' && (
          <div className="space-y-6">
            {/* Real Stats from User Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 text-white">
                <div className="text-2xl font-bold">{memoryData.totalMemories}</div>
                <div className="text-purple-100 text-sm">Total Memories</div>
                <div className="text-xs text-purple-200 mt-1">From {completedJourneys.length} journeys</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-4 text-white">
                <div className="text-2xl font-bold">{memoryData.countries}</div>
                <div className="text-green-100 text-sm">Countries Visited</div>
                <div className="text-xs text-green-200 mt-1">{memoryData.cities} cities explored</div>
              </div>
            </div>

            {/* Journey Memories with Real Data */}
            {completedJourneys.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  📸 Journey Memories
                  <span className="ml-2 text-sm font-normal text-gray-500">({completedJourneys.length} completed)</span>
                </h3>
                <div className="space-y-4">
                  {completedJourneys.map(adventure => {
                    const questMemories = adventure.completedQuests || [];
                    const photoQuests = adventure.quests.filter(quest => quest.type === 'photo');
                    const totalQuestMemories = adventure.quests.length * 2; // 2 memories per quest (arrival + completion)
                    
                    return (
                      <div key={adventure.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">{adventure.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                              {photoQuests.length} photos
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              {totalQuestMemories} memories
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{adventure.destination.name}</p>
                        
                        {/* Photo Gallery - Show real quest photos if available, otherwise placeholder */}
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                          {questMemories.slice(0, 5).map((completedQuest, i) => (
                            <div key={i} className="flex-shrink-0">
                              {completedQuest.userPhoto ? (
                                <img 
                                  src={completedQuest.userPhoto}
                                  alt={`Memory from ${completedQuest.quest.title}`}
                                  className="w-16 h-16 object-cover rounded-xl border border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                  <span className="text-lg">
                                    {completedQuest.quest.type === 'photo' ? '📸' : '🎯'}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Add placeholder images if we have fewer than 5 memories */}
                          {Array.from({ length: Math.max(0, 5 - questMemories.length) }).map((_, i) => (
                            <div 
                              key={`placeholder-${i}`} 
                              className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center"
                            >
                              <span className="text-xl opacity-50">🏛️</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Quest Details */}
                        <div className="mt-3 text-xs text-gray-500">
                          <span>{adventure.quests.length} quests completed</span>
                          {photoQuests.length > 0 && (
                            <span className="ml-2">• {photoQuests.length} photo locations</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Memories Yet</h3>
                <p className="text-gray-600 text-sm">Complete your first journey to start collecting memories!</p>
              </div>
            )}

            {/* Explorer Progress with Real Data */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Explorer Progress</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
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
                  max={50} 
                  label="Landmarks" 
                  icon="🏛️" 
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">Explorer Level {userProfile?.level || 1}</h4>
                  <span className="text-sm text-blue-600 font-medium">
                    {userProfile?.totalPoints || 0}/{((userProfile?.level || 1) * 1000)} XP
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000" 
                    style={{ 
                      width: `${userProfile?.totalPoints ? 
                        Math.min(((userProfile.totalPoints % 1000) / 1000) * 100, 100) : 0}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {memoryData.completedQuests} quests completed • {memoryData.totalPhotos} photos taken
                </p>
              </div>
            </div>

            {/* Achievement Summary */}
            {userProfile && userProfile.achievements.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Recent Achievements</h3>
                <div className="space-y-3">
                  {userProfile.achievements.slice(-3).reverse().map((achievement) => (
                    <div key={achievement.id} className="flex items-center p-3 bg-yellow-50 rounded-xl">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm">🏆</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{achievement.name}</p>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      <div className="text-yellow-600 font-bold text-sm">+{achievement.points}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
