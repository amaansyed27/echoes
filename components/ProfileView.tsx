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

  const avatarOptions = ['🧙‍♀️', '🧙‍♂️', '🗺️', '🎒', '📍', '🌟', '🏛️', '🌸'];
  
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full h-[85vh] bg-white/10 backdrop-blur-md border-t border-white/20 rounded-t-3xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Profile Info */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              {isEditing ? (
                <div className="grid grid-cols-4 gap-2 w-full">
                  {avatarOptions.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => setEditedProfile({...editedProfile, avatar: emoji})}
                      className={`h-12 text-2xl rounded-2xl border-2 transition-all active:scale-95 ${
                        editedProfile.avatar === emoji ? 'border-amber-400 bg-amber-400/20' : 'border-white/20 bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-2xl">
                    {profile.avatar}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{profile.name}</h3>
                    <p className="text-white/60 text-sm">Level {profile.level} Explorer</p>
                  </div>
                </>
              )}
            </div>

            {isEditing && (
              <div className="mb-6">
                <input
                  type="text"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Your name"
                />
              </div>
            )}

            {/* Level Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/60 mb-2">
                <span>Progress to Level {profile.level + 1}</span>
                <span>{getPointsToNextLevel(profile.totalPoints)} points to go</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNextLevel(profile.totalPoints)}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div>
                <div className="text-2xl font-bold text-amber-400">{profile.totalPoints}</div>
                <div className="text-xs text-white/60">Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{profile.completedQuests}</div>
                <div className="text-xs text-white/60">Quests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">{profile.visitedCities.length}</div>
                <div className="text-xs text-white/60">Cities</div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-amber-400 text-gray-900 py-3 rounded-2xl font-semibold active:scale-95 transition-transform"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditedProfile(profile);
                      setIsEditing(false);
                    }}
                    className="flex-1 bg-white/10 text-white py-3 rounded-2xl font-semibold border border-white/20 active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-white/10 text-white py-3 rounded-2xl font-semibold border border-white/20 active:scale-95 transition-transform"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Badges</h3>
            <div className="grid grid-cols-3 gap-3">
              {profile.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white/10 border border-white/20 p-4 rounded-2xl text-center active:scale-95 transition-transform"
                >
                  <div className="text-2xl mb-2">{badge.icon}</div>
                  <p className="text-xs text-white font-medium">{badge.name}</p>
                </div>
              ))}
              
              {/* Empty badge slots */}
              {Array.from({ length: Math.max(0, 6 - profile.badges.length) }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="bg-white/5 border-2 border-dashed border-white/20 p-4 rounded-2xl text-center"
                >
                  <div className="text-2xl mb-2 opacity-30">🏆</div>
                  <p className="text-xs text-white/40">Locked</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Achievements</h3>
            {profile.achievements.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/60 text-sm">Complete your first quest to earn achievements!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.achievements.slice(0, 4).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-white/10 border border-white/20 p-4 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm">{achievement.name}</h4>
                      <p className="text-xs text-white/60 mt-1">{achievement.description}</p>
                      <div className="flex items-center mt-2">
                        <div className="bg-white/10 rounded-full h-1 flex-1 mr-2">
                          <div 
                            className="bg-amber-400 h-1 rounded-full transition-all"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60">{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                    </div>
                    <div className="text-amber-400 font-bold text-sm ml-4">+{achievement.points}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileComponent;
