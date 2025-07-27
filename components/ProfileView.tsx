import React, { useState } from 'react';
import type { UserProfile, Badge, Achievement } from '../types';

interface UserProfileComponentProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

const UserProfileComponent: React.FC<UserProfileComponentProps> = ({
  profile,
  onUpdateProfile,
  onClose
}) => {
  const [editedProfile, setEditedProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);

  const avatarOptions = ['🧙‍♀️', '🧙‍♂️', '🗺️', '🎒', '📍', '🌟', '🏛️', '🌸', '🦋', '🌍', '⭐', '🎯'];
  
  const handleSave = () => {
    onUpdateProfile(editedProfile);
    setIsEditing(false);
  };

  const getLevel = (points: number) => {
    return Math.floor(points / 1000) + 1;
  };

  const getPointsToNextLevel = (points: number) => {
    const currentLevel = getLevel(points);
    const pointsForNextLevel = currentLevel * 1000;
    return pointsForNextLevel - points;
  };

  const progressToNextLevel = (points: number) => {
    const currentLevelStart = (getLevel(points) - 1) * 1000;
    const nextLevelStart = getLevel(points) * 1000;
    return ((points - currentLevelStart) / (nextLevelStart - currentLevelStart)) * 100;
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl pb-24">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Profile Avatar and Info */}
          <div className="mb-6">
            {isEditing ? (
              <div className="mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                  {editedProfile.avatar}
                </div>
                <div className="grid grid-cols-6 gap-2 max-w-sm mx-auto">
                  {avatarOptions.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => setEditedProfile({...editedProfile, avatar: emoji})}
                      className={`h-10 text-lg rounded-lg border-2 transition-all active:scale-95 ${
                        editedProfile.avatar === emoji 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
                {profile.avatar}
              </div>
            )}
            
            {isEditing ? (
              <input
                type="text"
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h1>
            )}
            
            <p className="text-gray-600 text-lg">Level {profile.level} Explorer</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">{profile.completedQuests}</div>
            <div className="text-sm text-gray-500">Quests Done</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-purple-600">{profile.visitedCities.length}</div>
            <div className="text-sm text-gray-500">Cities Visited</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress to Level {profile.level + 1}</span>
            <span>{getPointsToNextLevel(profile.totalPoints).toLocaleString()} XP to go</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressToNextLevel(profile.totalPoints)}%` }}
            />
          </div>
          
          {/* Edit Profile Button */}
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditedProfile(profile);
                  setIsEditing(false);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold border border-gray-200 active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold active:scale-95 transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Badges Collection */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            🏆 Badges Collection
            <span className="ml-2 text-sm font-normal text-gray-500">({profile.badges.length}/12)</span>
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {profile.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-200 p-4 rounded-xl text-center active:scale-95 transition-all"
              >
                <div className="text-2xl mb-2">{badge.icon}</div>
                <p className="text-xs text-gray-700 font-medium">{badge.name}</p>
                {badge.rarity && (
                  <div className={`text-xs mt-1 font-semibold ${
                    badge.rarity === 'legendary' ? 'text-purple-600' :
                    badge.rarity === 'epic' ? 'text-blue-600' :
                    badge.rarity === 'rare' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {badge.rarity}
                  </div>
                )}
              </div>
            ))}
            
            {/* Empty badge slots */}
            {Array.from({ length: Math.max(0, 12 - profile.badges.length) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded-xl text-center"
              >
                <div className="text-2xl mb-2 opacity-30">🏆</div>
                <p className="text-xs text-gray-400">Locked</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Achievements</h3>
          {profile.achievements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Achievements Yet</h4>
              <p className="text-gray-500">Complete your first quest to earn achievements!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {profile.achievements.slice(0, 5).map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-blue-600 font-bold">+{achievement.points}</div>
                      <div className="text-xs text-gray-500">XP</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 min-w-0">
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                </div>
              ))}
              {profile.achievements.length > 5 && (
                <div className="text-center py-2">
                  <span className="text-gray-500 text-sm">+{profile.achievements.length - 5} more achievements</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Statistics</h3>
          
          {/* Detailed Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white text-center">
              <div className="text-2xl font-bold">{profile.totalPoints.toLocaleString()}</div>
              <div className="text-blue-100 text-sm">Total Experience</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white text-center">
              <div className="text-2xl font-bold">{profile.completedQuests}</div>
              <div className="text-green-100 text-sm">Quests Completed</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white text-center">
              <div className="text-2xl font-bold">{profile.visitedCities.length}</div>
              <div className="text-purple-100 text-sm">Cities Explored</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white text-center">
              <div className="text-2xl font-bold">{profile.badges.length}</div>
              <div className="text-orange-100 text-sm">Badges Earned</div>
            </div>
          </div>

          {/* Progress Breakdown */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Badge Collection Progress</span>
                <span>{Math.round((profile.badges.length / 12) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(profile.badges.length / 12) * 100}%` }} 
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Level Progress</span>
                <span>{Math.round(progressToNextLevel(profile.totalPoints))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progressToNextLevel(profile.totalPoints)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visited Cities */}
        {profile.visitedCities.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🌍 Cities Explored</h3>
            <div className="flex flex-wrap gap-2">
              {profile.visitedCities.map((city, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileComponent;
