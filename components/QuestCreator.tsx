import React, { useState } from 'react';
import { QuestType, UserProfile } from '../types';

interface QuestCreatorProps {
  userProfile: UserProfile;
  onCreateQuest: (questData: any) => void;
}

const QuestCreator: React.FC<QuestCreatorProps> = ({ userProfile, onCreateQuest }) => {
  const [questType, setQuestType] = useState<QuestType>(QuestType.PHOTO);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const questTypes = [
    { type: QuestType.PHOTO, icon: '📸', label: 'Photo Quest', description: 'Take photos of landmarks or scenes' },
    { type: QuestType.PUZZLE, icon: '🧩', label: 'Puzzle Quest', description: 'Solve riddles and brain teasers' },
    { type: QuestType.NAVIGATION, icon: '🧭', label: 'Navigation Quest', description: 'Find specific locations using clues' },
    { type: QuestType.EXPLORATION, icon: '🔍', label: 'Exploration Quest', description: 'Discover hidden gems and secrets' },
    { type: QuestType.AUDIO_STORY, icon: '🎧', label: 'Story Quest', description: 'Listen to stories and answer questions' }
  ];

  const handleCreate = () => {
    if (!title.trim() || !description.trim() || !location.trim()) return;

    const questData = {
      title: title.trim(),
      description: description.trim(),
      type: questType,
      targetLocationName: location.trim(),
      difficulty,
      estimatedTime: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 30 : 45,
      points: difficulty === 'easy' ? 75 : difficulty === 'medium' ? 150 : 250,
      createdBy: userProfile.name
    };

    onCreateQuest(questData);
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-20">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Create Quest</h1>
        <p className="text-white/60">Design your own adventure for others to discover</p>
      </div>

      {/* Quest Type Selection */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
        <h3 className="font-semibold text-white mb-3">Quest Type</h3>
        <div className="space-y-3">
          {questTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => setQuestType(type.type)}
              className={`w-full p-4 rounded-xl transition-all active:scale-95 text-left ${
                questType === type.type 
                  ? 'bg-amber-400 text-gray-900' 
                  : 'bg-white/10 text-white border border-white/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{type.icon}</span>
                <div className="flex-1">
                  <div className="font-medium">{type.label}</div>
                  <div className={`text-sm ${questType === type.type ? 'text-gray-700' : 'text-white/60'}`}>
                    {type.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quest Details */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 space-y-4">
        <h3 className="font-semibold text-white">Quest Details</h3>
        
        <div>
          <label className="block text-sm font-medium text-white mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your quest an exciting title..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what adventurers need to do..."
            rows={3}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where should this quest take place?"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Difficulty</label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`p-3 rounded-xl transition-all active:scale-95 ${
                  difficulty === level 
                    ? 'bg-amber-400 text-gray-900' 
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                <div className="text-sm font-medium capitalize">{level}</div>
                <div className={`text-xs ${difficulty === level ? 'text-gray-700' : 'text-white/60'}`}>
                  {level === 'easy' ? '75 pts' : level === 'medium' ? '150 pts' : '250 pts'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview */}
      {title && description && location && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <h3 className="font-semibold text-white mb-3">Preview</h3>
          <div className="bg-white/10 border border-white/20 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-white">{title}</h4>
              <div className="flex items-center space-x-1 bg-white/10 px-2 py-1 rounded-lg">
                <span className="text-sm">{questTypes.find(t => t.type === questType)?.icon}</span>
                <span className="text-xs font-medium text-white uppercase">{questType}</span>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-2">{description}</p>
            <p className="text-xs text-white/60">📍 {location}</p>
            <div className="flex items-center justify-between mt-3 text-xs text-white/60">
              <span>Difficulty: {difficulty}</span>
              <span>Rewards: {difficulty === 'easy' ? '75' : difficulty === 'medium' ? '150' : '250'} points</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Button */}
      <button
        onClick={handleCreate}
        disabled={!title.trim() || !description.trim() || !location.trim()}
        className="w-full bg-amber-400 text-gray-900 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-transform disabled:bg-white/20 disabled:text-white/50 disabled:scale-100"
      >
        Create Quest
      </button>
    </div>
  );
};

export default QuestCreator;
