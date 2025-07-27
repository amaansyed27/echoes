import React from 'react';
import type { Story } from '../types';
import { CheckCircleIcon } from './icons';

interface AdventureCardProps {
  adventure: Story;
  onSelect: () => void;
  style?: 'default' | 'compact' | 'featured';
}

const AdventureCard: React.FC<AdventureCardProps> = ({ 
  adventure, 
  onSelect, 
  style = 'default'
}) => {
  const { title, destination, quests, currentQuestIndex, imageUrl } = adventure;
  const completed = currentQuestIndex >= quests.length;
  const progress = completed ? 100 : Math.round((currentQuestIndex / quests.length) * 100);
  
  // Default image if none provided - use a more reliable placeholder
  const bgImage = imageUrl || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&crop=entropy&auto=format&q=80`;
  
  if (style === 'featured') {
    return (
      <div 
        onClick={onSelect}
        className="atlas-card mb-6 overflow-hidden cursor-pointer active:scale-98 transition-all duration-200"
        style={{ height: '220px' }}
      >
        <div 
          className="relative w-full h-full bg-cover bg-center flex flex-col justify-end"
          style={{ 
            backgroundImage: `url(${bgImage})`,
            borderRadius: '0.75rem',
          }}
        >
          {/* Dark overlay gradient */}
          <div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 100%)',
              borderRadius: '0.75rem',
            }}
          />
          
          <div className="relative z-10 p-4 text-white">
            {completed && (
              <div className="absolute top-4 right-4">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
            )}
            
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-sm text-gray-200 mb-2">{destination.name}</p>
            
            {!completed && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                  <span>Journey Progress</span>
                  <span>{currentQuestIndex}/{quests.length}</span>
                </div>
                <div className="w-full bg-gray-600 bg-opacity-60 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${progress}%`,
                      background: 'var(--atlas-gradient-sunset)'
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center mt-2">
              <div className="flex -space-x-2">
                {[...Array(Math.min(3, quests.length))].map((_, i) => (
                  <div 
                    key={i}
                    className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs font-medium border border-white"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
              {quests.length > 3 && (
                <span className="text-xs ml-2 text-gray-300">+{quests.length - 3} more</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (style === 'compact') {
    return (
      <div 
        onClick={onSelect}
        className="atlas-card flex items-center p-3 active:scale-98 transition-all duration-200 cursor-pointer"
      >
        <div 
          className="w-12 h-12 rounded-lg bg-cover bg-center mr-3 flex-shrink-0"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="flex-1">
          <h3 className="text-sm font-medium atlas-text-primary line-clamp-1">{title}</h3>
          <p className="text-xs text-gray-600">{destination.name}</p>
        </div>
        {completed ? (
          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 ml-2"/>
        ) : (
          <div className="text-xs font-medium flex-shrink-0 ml-2 text-amber-600">
            {currentQuestIndex}/{quests.length}
          </div>
        )}
      </div>
    );
  }
  
  // Default style
  return (
    <div 
      onClick={onSelect}
      className="atlas-card p-4 active:scale-98 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold atlas-text-primary mb-1 line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-600">{destination.name}</p>
        </div>
        {completed && (
          <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 ml-2"/>
        )}
      </div>
      
      {!completed && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{currentQuestIndex}/{quests.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500" 
              style={{ 
                width: `${progress}%`,
                background: 'var(--atlas-gradient-blue)'
              }}
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center mt-3">
        <div 
          className="w-10 h-10 rounded-lg bg-cover bg-center mr-3"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="text-xs text-gray-500">
          {completed ? 'Journey completed' : `${quests.length - currentQuestIndex} quests remaining`}
        </div>
      </div>
    </div>
  );
};

export default AdventureCard;
