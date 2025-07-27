import React from 'react';
import type { UserProfile, Story } from '../types';

interface NewHomeProps {
  userProfile: UserProfile;
  adventures: Story[];
  onNavigate: (page: string) => void;
}

const NewHome: React.FC<NewHomeProps> = ({ userProfile, adventures, onNavigate }) => {
  const completedAdventures = adventures.filter(a => a.currentQuestIndex >= a.quests.length);
  const activeAdventures = adventures.filter(a => a.currentQuestIndex < a.quests.length && a.currentQuestIndex > 0);
  const totalQuests = adventures.reduce((sum, a) => sum + a.completedQuests.length, 0);

  // Load trip plans from localStorage
  const getTripPlans = () => {
    try {
      const savedPlans = localStorage.getItem('tripPlans');
      return savedPlans ? JSON.parse(savedPlans) : [];
    } catch {
      return [];
    }
  };

  const tripPlans = getTripPlans();
  const activeTripPlans = tripPlans.filter((plan: any) => plan.status === 'active');

  const quickStats = [
    { label: 'Adventures Completed', value: completedAdventures.length, icon: '🎯', color: 'text-green-600' },
    { label: 'Active Adventures', value: activeAdventures.length, icon: '🗺️', color: 'text-blue-600' },
    { label: 'Quests Completed', value: totalQuests, icon: '✅', color: 'text-purple-600' },
    { label: 'Trip Plans', value: tripPlans.length, icon: '🧭', color: 'text-orange-600' }
  ];

  const recentActivities = [
    ...activeTripPlans.slice(0, 2).map((plan: any) => ({
      type: 'trip',
      title: `Active Trip: ${plan.name}`,
      description: `${plan.preferences.mood} journey to ${plan.destination}`,
      time: 'In progress',
      icon: '🧭'
    })),
    ...adventures.slice(-2).map(adventure => ({
      type: 'adventure',
      title: `Started: ${adventure.title}`,
      description: adventure.introNarrative.slice(0, 60) + '...',
      time: '2 hours ago',
      icon: '🗺️'
    })),
    {
      type: 'quest',
      title: 'Completed Photo Challenge',
      description: 'Captured memories at Central Park',
      time: '5 hours ago',
      icon: '📸'
    }
  ].slice(0, 4); // Limit to 4 items

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl text-white">👋</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userProfile.name}!</h1>
          <p className="text-gray-600">Ready for your next adventure?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 p-6 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => onNavigate('adventures')}
            className="bg-white border border-gray-200 p-6 text-left hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 flex items-center justify-center text-2xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
                🗺️
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Start Adventure</h3>
                <p className="text-sm text-gray-600">Discover new places and stories</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('travel_guide')}
            className="bg-white border border-gray-200 p-6 text-left hover:border-green-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 flex items-center justify-center text-2xl group-hover:bg-green-500 group-hover:text-white transition-colors">
                🧭
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Travel Guide</h3>
                <p className="text-sm text-gray-600">Get live guidance for your trips</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('memories')}
            className="bg-white border border-gray-200 p-6 text-left hover:border-purple-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-100 flex items-center justify-center text-2xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
                📚
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">My Memories</h3>
                <p className="text-sm text-gray-600">Relive your adventures</p>
              </div>
            </div>
          </button>
        </div>

        {/* Active Adventures */}
        {activeAdventures.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Continue Your Journey</h2>
            <div className="space-y-4">
              {activeAdventures.slice(0, 2).map((adventure) => (
                <div key={adventure.id} className="bg-white border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{adventure.title}</h3>
                      <p className="text-sm text-gray-600">{adventure.destination.name}</p>
                    </div>
                    <button
                      onClick={() => onNavigate('adventures')}
                      className="bg-blue-500 text-white px-4 py-2 font-medium hover:bg-blue-600 transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Quest {adventure.currentQuestIndex} of {adventure.quests.length}
                      </span>
                      <span className="text-gray-600">
                        {Math.round((adventure.currentQuestIndex / adventure.quests.length) * 100)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2">
                      <div 
                        className="bg-blue-500 h-2 transition-all"
                        style={{ width: `${(adventure.currentQuestIndex / adventure.quests.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white border border-gray-200">
            <div className="divide-y divide-gray-200">
              {recentActivities.slice(0, 4).map((activity, index) => (
                <div key={index} className="p-4 flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-lg">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievement Highlights */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <div className="text-2xl font-bold text-amber-600">{userProfile.level}</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-amber-600">{userProfile.totalPoints}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎖️</div>
              <div className="text-2xl font-bold text-amber-600">{userProfile.badges.length}</div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="text-center mt-8 bg-blue-50 border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready for Adventure?</h3>
          <p className="text-blue-700 mb-4">
            The world is full of stories waiting to be discovered. Start your next adventure today!
          </p>
          <button
            onClick={() => onNavigate('adventures')}
            className="bg-blue-500 text-white px-6 py-3 font-medium hover:bg-blue-600 transition-colors"
          >
            Explore Adventures
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewHome;
