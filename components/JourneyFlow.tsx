import React from 'react';
import type { Story } from '../types';

interface JourneyFlowProps {
  journey: Story;
  onQuestSelect?: (questIndex: number) => void;
}

const JourneyFlow: React.FC<JourneyFlowProps> = ({ journey, onQuestSelect }) => {
  const { quests, currentQuestIndex } = journey;
  
  // Calculate the total width based on number of quests
  const totalWidth = Math.max(quests.length * 80, 300); // minimum width of 300px
  
  return (
    <div className="atlas-card p-4 mb-5 overflow-hidden">
      <h3 className="text-base font-semibold mb-4 atlas-text-primary">Your Journey Flow</h3>
      
      <div className="relative" style={{ height: '130px' }}>
        <div className="absolute inset-0 overflow-x-auto touch-scroll" style={{ paddingBottom: '20px' }}>
          <div style={{ width: `${totalWidth}px`, height: '100px' }}>
            {/* Journey Path SVG */}
            <svg width="100%" height="100%" viewBox={`0 0 ${totalWidth} 100`} xmlns="http://www.w3.org/2000/svg">
              {/* Main journey path line */}
              <path 
                d={`M40 50 ${quests.map((_, i) => `L${40 + i * 80} 50`).join(' ')}`}
                className="atlas-journey-path"
                strokeDasharray="4 2"
              />
              
              {/* Generate path points for each quest */}
              {quests.map((quest, index) => {
                let pointStatus = 'upcoming';
                if (index < currentQuestIndex) pointStatus = 'completed';
                if (index === currentQuestIndex) pointStatus = 'current';
                
                return (
                  <g key={index} onClick={() => onQuestSelect && onQuestSelect(index)}>
                    <circle 
                      cx={40 + index * 80} 
                      cy={50} 
                      r={index === currentQuestIndex ? 12 : 8}
                      className={`atlas-journey-point ${pointStatus}`}
                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    />
                    {/* Quest number */}
                    <text 
                      x={40 + index * 80} 
                      y={50} 
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      fill="white" 
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {index + 1}
                    </text>
                    
                    {/* Quest title */}
                    <text 
                      x={40 + index * 80} 
                      y={75} 
                      textAnchor="middle"
                      fill={index === currentQuestIndex ? 'var(--atlas-amber-dark)' : 'var(--atlas-gray-600)'}
                      fontSize="11"
                      fontWeight={index === currentQuestIndex ? 'bold' : 'normal'}
                    >
                      {quest.title.length > 15 ? `${quest.title.substring(0, 13)}...` : quest.title}
                    </text>
                  </g>
                );
              })}
              
              {/* Starting point */}
              <circle cx={20} cy={50} r={6} fill="var(--atlas-success)" />
              <text x={20} y={75} textAnchor="middle" fill="var(--atlas-success)" fontSize="11">Start</text>
              
              {/* Destination point */}
              <circle cx={40 + quests.length * 80 - 20} cy={50} r={6} fill="var(--atlas-journey-end)" />
              <text 
                x={40 + quests.length * 80 - 20} 
                y={75} 
                textAnchor="middle" 
                fill="var(--atlas-journey-end)" 
                fontSize="11"
              >
                End
              </text>
              
              {/* Current position indicator */}
              {currentQuestIndex < quests.length && (
                <circle 
                  cx={40 + currentQuestIndex * 80} 
                  cy={50} 
                  r={16} 
                  fill="none" 
                  stroke="var(--atlas-amber-light)" 
                  strokeWidth="2"
                  strokeDasharray="3 2"
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-sm mt-2">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-success mr-2"></span>
          <span className="text-xs text-gray-600">Completed</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
          <span className="text-xs text-gray-600">Current</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
          <span className="text-xs text-gray-600">Upcoming</span>
        </div>
      </div>
    </div>
  );
};

export default JourneyFlow;
