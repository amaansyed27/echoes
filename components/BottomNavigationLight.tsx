import React, { useState } from 'react';
import { AppState } from '../types';

interface BottomNavigationProps {
  currentState: AppState;
  onStateChange: (state: AppState) => void;
  questProgress?: { current: number; total: number };
  onChatClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentState, 
  onStateChange, 
  questProgress, 
  onChatClick 
}) => {
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

  const navItems = [
    {
      state: AppState.HOME,
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 transition-all duration-200 ${active ? 'text-blue-600 scale-110' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Home'
    },
    {
      state: AppState.EXPLORE,
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 transition-all duration-200 ${active ? 'text-blue-600 scale-110' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 0L9 21M3 12a9 9 0 919-9m-9 9l6.5-3.5M21 12l-6.5-3.5M3 12l6.5 3.5M21 12l-6.5 3.5" />
        </svg>
      ),
      label: 'Explore'
    },
    {
      specialButton: true,
      icon: () => (
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center -mt-6 shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
      ),
      onClick: () => onChatClick()
    },
    {
      state: AppState.PROFILE,
      icon: (active: boolean) => (
        <svg className={`w-5 h-5 transition-all duration-200 ${active ? 'text-blue-600 scale-110' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      label: 'Profile',
      onClick: () => setProfileDrawerOpen(true)
    }
  ];

  return (
    <>
      {/* Profile Drawer */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          profileDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setProfileDrawerOpen(false)}
      />
      
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl z-40 transition-transform duration-300 ease-out ${
          profileDrawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{height: '85vh'}}
      >
        {/* Handle for drawer */}
        <div className="w-full flex justify-center pt-2 pb-4" onClick={() => setProfileDrawerOpen(false)}>
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* Profile Content */}
        <div className="overflow-hidden h-[calc(100%-40px)]">
          {profileDrawerOpen && currentState === AppState.PROFILE && (
            <div className="h-full" onClick={(e) => e.stopPropagation()}>
              {/* We'll keep the existing ProfileView component but render it inside this drawer */}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="bg-white shadow-lg border-t border-gray-100">
          <div className="flex items-center justify-around py-2 px-4 safe-area-pb">
            {navItems.map((item, index) => {
              if (item.specialButton) {
                return (
                  <button
                    key={`special-${index}`}
                    onClick={item.onClick}
                    className="active:scale-95 transition-transform"
                  >
                    {(item as any).icon()}
                  </button>
                );
              }
              
              const isActive = currentState === item.state || 
                (item.state === AppState.HOME && (currentState === AppState.PATH_VIEW || currentState === AppState.QUEST_VIEW));
              
              return (
                <button
                  key={item.state}
                  onClick={() => item.onClick ? item.onClick() : onStateChange(item.state!)}
                  className={`relative flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-300 active:scale-95 ${
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
                      <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
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
                  {item.state === AppState.HOME && questProgress && questProgress.current > 0 && (
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm">
                      {questProgress.current}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNavigation;
