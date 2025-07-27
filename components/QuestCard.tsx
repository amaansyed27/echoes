
import React, { useState } from 'react';
import type { Quest, GeoLocation, CompletedQuest } from '../types';
import { QuestType } from '../types';

interface QuestCardProps {
  quest: Quest;
  questNumber: number;
  totalQuests: number;
  onComplete: (completedQuestData: Omit<CompletedQuest, 'quest'>) => void;
  userLocation: GeoLocation | null;
  geoError: string | null;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, questNumber, totalQuests, onComplete, userLocation, geoError }) => {
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (quest.type === QuestType.PUZZLE) {
      if (puzzleAnswer.trim().toLowerCase() === quest.puzzle?.solution.toLowerCase()) {
        onComplete({ 
          userAnswer: puzzleAnswer,
          completedDate: new Date(),
          location: {
            latitude: quest.latitude,
            longitude: quest.longitude,
            name: quest.targetLocationName,
            country: 'Unknown'
          }
        });
      } else {
        setFeedback("That's not quite right. Try again!");
      }
    } else if (quest.type === QuestType.PHOTO) {
      if (photo) {
        onComplete({ 
          userPhoto: photo,
          completedDate: new Date(),
          location: {
            latitude: quest.latitude,
            longitude: quest.longitude,
            name: quest.targetLocationName,
            country: 'Unknown'
          }
        });
      } else {
        setFeedback("Please take a photo to complete this quest.");
      }
    }
  };
  
  const getDirectionsUrl = () => {
    if (userLocation) {
        return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${quest.latitude},${quest.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${quest.latitude},${quest.longitude}`;
  };

  const getQuestIcon = () => {
    switch(quest.type) {
      case QuestType.PUZZLE: return '🧩';
      case QuestType.PHOTO: return '📸';
      case QuestType.NAVIGATION: return '🧭';
      case QuestType.AUDIO_STORY: return '🎧';
      case QuestType.EXPLORATION: return '🔍';
      default: return '📍';
    }
  };

  return (
    <div className="bg-white p-6 space-y-6 border border-gray-200 shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{quest.title}</h2>
          <p className="text-sm text-gray-500">Quest {questNumber} of {totalQuests}</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 border border-blue-100">
          <span className="text-lg">{getQuestIcon()}</span>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">{quest.type}</span>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-gray-600 leading-relaxed">{quest.description}</p>
      
      {/* Location */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Location</p>
            <p className="text-gray-700 font-medium">{quest.targetLocationName}</p>
          </div>
          <a 
            href={getDirectionsUrl()} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm active:scale-95 transition-transform flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Navigate</span>
          </a>
        </div>
        {geoError && <p className="text-xs text-red-600 mt-2">{geoError}</p>}
      </div>

      {/* Quest Interaction */}
      {quest.type === QuestType.PUZZLE && quest.puzzle && (
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-gray-700 italic leading-relaxed">"{quest.puzzle.prompt}"</p>
          </div>
          <input
            type="text"
            value={puzzleAnswer}
            onChange={(e) => setPuzzleAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
        </div>
      )}

      {quest.type === QuestType.PHOTO && (
        <div className="space-y-4">
          {photo ? (
            <div className="relative">
              <img src={photo} alt="Quest photo" className="w-full h-48 object-cover rounded-lg" />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full active:scale-95 transition-transform"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Take a photo to complete this quest</p>
            </div>
          )}
          
          <label className="block">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center cursor-pointer active:scale-95 transition-transform">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-blue-700 font-medium">{photo ? 'Change Photo' : 'Take Photo'}</span>
              </div>
            </div>
          </label>
        </div>
      )}
      
      {/* Feedback */}
      {feedback && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{feedback}</p>
        </div>
      )}

      {/* Complete Button */}
      <button
        onClick={handleSubmit}
        disabled={quest.type === QuestType.PHOTO && !photo}
        className="w-full bg-blue-500 text-white py-4 font-bold text-lg active:scale-95 transition-transform disabled:bg-gray-200 disabled:text-gray-400 disabled:scale-100"
      >
        Complete Quest
      </button>
    </div>
  );
};

export default QuestCard;
