import React from 'react';
import { AppState } from '../types';

interface BottomNavigationProps {
  currentState: AppState;
  onStateChange: (state: AppState) => void;
  questProgress?: { current: number; total: number };
  onChatClick?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentState, onStateChange, questProgress, onChatClick }) => {
  const navItems = [
    {
      state: AppState.HOME,
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-200 ${active ? 'scale-110 text-blue-600' : 'text-gray-500'}`} 
             fill="none" 
             stroke="currentColor" 
             viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Home'
    },
    {
      state: AppState.ADVENTURES,
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-200 ${active ? 'scale-110 text-indigo-600' : 'text-gray-500'}`}
             fill="none" 
             stroke="currentColor" 
             viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m-6 3l6-3" />
        </svg>
      ),
      label: 'Adventures'
    },
    {
      state: AppState.TRAVEL_GUIDE,
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-200 ${active ? 'scale-110 text-green-600' : 'text-gray-500'}`}
             fill="none" 
             stroke="currentColor" 
             viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Guide'
    },
    {
      state: AppState.MEMORIES,
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-200 ${active ? 'scale-110 text-purple-600' : 'text-gray-500'}`}
             fill="none" 
             stroke="currentColor" 
             viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Memories'
    },
    {
      state: AppState.PROFILE,
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all duration-200 ${active ? 'scale-110 text-amber-600' : 'text-gray-500'}`}
             fill="none" 
             stroke="currentColor" 
             viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      {/* Floating Chat Button */}
      {onChatClick && (
        <div className="absolute bottom-20 right-4">
          <button 
            onClick={onChatClick}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <div className="bg-white shadow-lg border-t border-gray-100">
        <div className="flex items-center justify-around py-3 px-4 safe-area-pb">
          {navItems.map((item, index) => {
            const isActive = currentState === item.state || 
              (item.state === AppState.ADVENTURES && (currentState === AppState.PATH_VIEW || currentState === AppState.QUEST_VIEW));
            
            return (
              <button
                key={item.state}
                onClick={() => onStateChange(item.state)}
                className={`relative flex flex-col items-center space-y-1 py-2 px-3 transition-all duration-300 active:scale-95 ${
                  isActive 
                    ? 'bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon Container */}
                <div className={`relative transition-all duration-300 ${isActive ? 'transform -translate-y-0.5' : ''}`}>
                  {item.icon(isActive)}
                  
                  {/* Active Indicator Dot */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600"></div>
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-xs font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                
                {/* Progress indicator for quest mode */}
                {item.state === AppState.ADVENTURES && questProgress && questProgress.current > 0 && (
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                    {questProgress.current}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
