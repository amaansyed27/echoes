import React from 'react';
import { AppState } from '../types';

interface BottomNavigationProps {
  currentState: AppState;
  onStateChange: (state: AppState) => void;
  questProgress?: { current: number; total: number };
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentState, onStateChange, questProgress }) => {
  const navItems = [
    {
      state: AppState.HOME,
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-200 ${active ? 'text-amber-400 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Home'
    },
    {
      state: AppState.EXPLORE,
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-200 ${active ? 'text-amber-400 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 0L9 21M3 12a9 9 0 019-9m-9 9l6.5-3.5M21 12l-6.5-3.5M3 12l6.5 3.5M21 12l-6.5 3.5" />
        </svg>
      ),
      label: 'Explore'
    },
    {
      state: AppState.PROFILE,
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-200 ${active ? 'text-amber-400 scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Gradient Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent"></div>
      
      {/* Main Navigation */}
      <div className="relative bg-gray-900/90 backdrop-blur-xl border-t border-gray-800/50 shadow-2xl">
        <div className="flex items-center justify-around py-3 px-4 safe-area-pb">
          {navItems.map((item, index) => {
            const isActive = currentState === item.state || 
              (item.state === AppState.HOME && (currentState === AppState.PATH_VIEW || currentState === AppState.QUEST_VIEW));
            
            return (
              <button
                key={item.state}
                onClick={() => onStateChange(item.state)}
                className={`relative flex flex-col items-center space-y-1 py-3 px-4 rounded-2xl transition-all duration-300 active:scale-95 group ${
                  isActive 
                    ? 'bg-amber-500/10 border border-amber-500/20' 
                    : 'hover:bg-gray-800/50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Active Background Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-orange-500/5 rounded-2xl animate-pulse"></div>
                )}
                
                {/* Icon Container */}
                <div className={`relative transition-all duration-300 ${isActive ? 'transform -translate-y-0.5' : ''}`}>
                  {item.icon(isActive)}
                  
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50"></div>
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-amber-400 font-semibold' 
                    : 'text-gray-400 group-hover:text-gray-300'
                }`}>
                  {item.label}
                </span>
                
                {/* Progress indicator for quest mode */}
                {item.state === AppState.HOME && questProgress && questProgress.current > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-400 to-orange-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-bounce border-2 border-gray-900">
                    {questProgress.current}
                  </div>
                )}
                
                {/* Ripple Effect */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  isActive ? 'ring-2 ring-amber-400/20 ring-offset-2 ring-offset-gray-900' : ''
                }`}></div>
              </button>
            );
          })}
        </div>
        
        {/* Home Indicator */}
        <div className="flex justify-center pb-2">
          <div className="w-32 h-1 bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
