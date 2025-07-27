import React, { useState, useCallback, useEffect } from 'react';
import { AppState, Story, CompletedQuest, UserProfile } from './types';
import { generateTravelGuide } from './services/geminiService';
import QuestView from './components/QuestView';
import LibraryModal from './components/LibraryModal';
import ProfileView from './components/ProfileView';
import QuestAssistant from './components/QuestAssistant';
import Memories from './components/Memories';
import TravelGuide from './components/TravelGuide';
import Adventures from './components/Adventures';
import NewHome from './components/NewHome';
import BottomNavigation from './components/BottomNavigationNew';
import LiveAssistant from './components/LiveAssistant';
import SplashScreen from './components/SplashScreen';
import GlobalLoader from './components/GlobalLoader';
import PWAInstall from './components/PWAInstall';
import LanguageSelector from './components/LanguageSelector';
import { useGeolocation } from './hooks/useGeolocation';
import { useLanguage } from './hooks/useLanguage';
import { useTranslations } from './services/translations';
import PathView from './components/PathView';
import Background from './components/Background';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import ChatInterface from './components/ChatInterface';

const ADVENTURES_STORAGE_KEY = 'echoes_adventures';
const PROFILE_STORAGE_KEY = 'echoes_user_profile';

const createDefaultProfile = (): UserProfile => ({
  name: 'Explorer',
  avatar: '🗺️',
  level: 1,
  totalPoints: 0,
  completedQuests: 0,
  badges: [],
  achievements: [],
  visitedCities: [],
  favoriteLocations: [],
  interests: ['history', 'culture', 'photography'],
  joinDate: new Date()
});

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [adventures, setAdventures] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem(ADVENTURES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load adventures from storage", e);
      return [];
    }
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : createDefaultProfile();
    } catch (e) {
      console.error("Failed to load profile from storage", e);
      return createDefaultProfile();
    }
  });

  const [activeAdventure, setActiveAdventure] = useState<Story | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for enhanced features
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [showPWAInstall, setShowPWAInstall] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const { location: userLocation, error: geoError } = useGeolocation();
  const { selectedLanguage, changeLanguage } = useLanguage();
  const t = useTranslations(selectedLanguage.code);
  
  const { 
    speak: synthSpeak, 
    cancel: synthCancel, 
    isSpeaking
  } = useSpeechSynthesis(selectedLanguage.code);

  const [speakingTextKey, setSpeakingTextKey] = useState<string | null>(null);

  const speak = useCallback((text: string, key: string) => {
    if (isSpeaking && speakingTextKey === key) {
      synthCancel();
      setSpeakingTextKey(null);
      return;
    }
    setSpeakingTextKey(key);
    synthSpeak({
      text,
      onEnd: () => setSpeakingTextKey(null),
    });
  }, [synthSpeak, synthCancel, isSpeaking, speakingTextKey]);

  const cancel = useCallback(() => {
    synthCancel();
    setSpeakingTextKey(null);
  }, [synthCancel]);

  // Save data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ADVENTURES_STORAGE_KEY, JSON.stringify(adventures));
    } catch (e) {
      console.error("Failed to save adventures to storage", e);
    }
  }, [adventures]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
    } catch (e) {
      console.error("Failed to save profile to storage", e);
    }
  }, [userProfile]);

  const updateUserProfile = useCallback((newProfile: UserProfile) => {
    setUserProfile(newProfile);
  }, []);

  const awardPoints = useCallback((points: number, source: string) => {
    setUserProfile(prev => {
      const newTotalPoints = prev.totalPoints + points;
      const newLevel = Math.floor(newTotalPoints / 1000) + 1;
      
      // Check for level up
      if (newLevel > prev.level) {
        console.log(`Level up! Now level ${newLevel}`);
      }

      return {
        ...prev,
        totalPoints: newTotalPoints,
        level: newLevel,
        completedQuests: prev.completedQuests + (source === 'quest' ? 1 : 0)
      };
    });
  }, []);

  const handleStartAdventure = useCallback(async (location: string) => {
    setIsLoading(true);
    setLoadingMessage('Creating your adventure...');
    setAppState(AppState.ADVENTURE_LOADING);
    setError(null);
    try {
      const newStoryData = await generateTravelGuide(location, selectedLanguage.code);
      const newAdventure: Story = {
        ...newStoryData,
        id: Date.now().toString(),
        currentQuestIndex: 0,
        completedQuests: [],
      };
      setAdventures(prev => [newAdventure, ...prev]);
      setActiveAdventure(newAdventure);
      setAppState(AppState.PATH_VIEW);

      // Add city to visited cities
      if (!userProfile.visitedCities.includes(location)) {
        setUserProfile(prev => ({
          ...prev,
          visitedCities: [...prev.visitedCities, location]
        }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to create your adventure. Please try again later.');
      setAppState(AppState.HOME);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [userProfile.visitedCities, selectedLanguage.code]);
  
  const handleSelectAdventure = (adventureId: string) => {
    const adventure = adventures.find(a => a.id === adventureId);
    if (adventure) {
        setActiveAdventure(adventure);
        setAppState(AppState.PATH_VIEW);
    }
  };

  const handleQuestComplete = useCallback((completedQuestData: Omit<CompletedQuest, 'quest' | 'completedDate' | 'location'>) => {
    if (!activeAdventure) return;

    const currentQuest = activeAdventure.quests[activeAdventure.currentQuestIndex];
    
    const completedQuest: CompletedQuest = {
      quest: currentQuest,
      ...completedQuestData,
      completedDate: new Date(),
      location: {
        latitude: currentQuest.latitude,
        longitude: currentQuest.longitude,
        name: currentQuest.targetLocationName,
        country: activeAdventure.destination.name.split(',').pop()?.trim() || 'Unknown'
      }
    };
    
    const updatedAdventure: Story = {
        ...activeAdventure,
        completedQuests: [...activeAdventure.completedQuests, completedQuest],
        currentQuestIndex: activeAdventure.currentQuestIndex + 1,
    };
    
    setActiveAdventure(updatedAdventure);
    setAdventures(prevAdventures => prevAdventures.map(a => a.id === updatedAdventure.id ? updatedAdventure : a));
    
    // Award points for quest completion
    const questPoints = currentQuest.points || 100;
    awardPoints(questPoints, 'quest');
    
    setAppState(AppState.PATH_VIEW);

  }, [activeAdventure, awardPoints]);

  const handleHomeClick = () => {
    setAppState(AppState.HOME);
    setActiveAdventure(null);
    setError(null);
    setIsAssistantOpen(false);
    cancel();
  };

  const handleStateChange = (newState: AppState) => {
    // Handle navigation state changes
    if (newState === AppState.HOME) {
      handleHomeClick();
    } else if (newState === AppState.PROFILE) {
      setAppState(AppState.PROFILE);
    } else if (newState === AppState.ADVENTURES) {
      setAppState(AppState.ADVENTURES);
    } else if (newState === AppState.TRAVEL_GUIDE) {
      setAppState(AppState.TRAVEL_GUIDE);
    } else if (newState === AppState.MEMORIES) {
      setAppState(AppState.MEMORIES);
    }
    setIsAssistantOpen(false);
  };

  const allCompletedQuests = adventures.flatMap(a => a.completedQuests);

  const getQuestProgress = () => {
    if (!activeAdventure) return undefined;
    return {
      current: activeAdventure.currentQuestIndex,
      total: activeAdventure.quests.length
    };
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.ADVENTURE_LOADING:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 border-4 border-dashed animate-spin border-amber-400"></div>
            <p className="mt-4 text-xl font-bold text-amber-300">Creating Your Adventure...</p>
            <p className="text-white/60">Please wait while we craft your unique journey.</p>
          </div>
        );
      case AppState.PATH_VIEW:
        if (activeAdventure) {
            return (
                <PathView 
                    adventure={activeAdventure} 
                    userLocation={userLocation}
                    onStartQuest={() => setAppState(AppState.QUEST_VIEW)}
                    speak={speak}
                    cancel={cancel}
                    isSpeaking={isSpeaking}
                    speakingTextKey={speakingTextKey}
                    onBack={handleHomeClick}
                />
            );
        }
        return null;
      case AppState.QUEST_VIEW:
        if (activeAdventure) {
          return (
            <QuestView
              story={activeAdventure}
              onQuestComplete={handleQuestComplete}
              userLocation={userLocation}
              geoError={geoError}
              onBackToPath={() => setAppState(AppState.PATH_VIEW)}
              speak={speak}
              cancel={cancel}
            />
          );
        }
        return null;
      case AppState.ADVENTURES:
        return (
          <Adventures 
            onStart={handleStartAdventure} 
            error={error} 
            adventures={adventures}
            onSelectAdventure={handleSelectAdventure}
            userProfile={userProfile}
          />
        );
      case AppState.TRAVEL_GUIDE:
        return (
          <TravelGuide
            userProfile={userProfile}
            userLocation={userLocation}
            activeAdventure={activeAdventure}
            onCreateAdventure={handleStartAdventure}
          />
        );
      case AppState.MEMORIES:
        return (
          <Memories
            adventures={adventures}
            userProfile={userProfile}
          />
        );
      case AppState.PROFILE:
        // Profile is now rendered as a drawer in the main component
        return null;
      case AppState.HOME:
      default:
        return (
          <NewHome 
            userProfile={userProfile}
            adventures={adventures}
            onNavigate={(page: string) => {
              switch (page) {
                case 'adventures':
                  setAppState(AppState.ADVENTURES);
                  break;
                case 'travel_guide':
                  setAppState(AppState.TRAVEL_GUIDE);
                  break;
                case 'memories':
                  setAppState(AppState.MEMORIES);
                  break;
                default:
                  break;
              }
            }}
          />
        );
    }
  };

  // PWA Install Trigger Effect
  useEffect(() => {
    // Only clear for debugging in development
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('pwa-install-dismissed');
    }
    
    // Check if app is already installed (standalone mode)
    const isStandalone = () => {
      return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
             (window.navigator as any).standalone ||
             document.referrer.includes('android-app://');
    };

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (!localStorage.getItem('pwa-install-dismissed') && !isStandalone()) {
        setShowPWAInstall(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For development/testing only - show manual install option after delay
    const debugTimer = setTimeout(() => {
      if (process.env.NODE_ENV === 'development' && 
          !isStandalone() && 
          !localStorage.getItem('pwa-install-dismissed')) {
        setShowPWAInstall(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(debugTimer);
    };
  }, []);

  const handlePWAInstallClose = () => {
    setShowPWAInstall(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <>
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Global Loader */}
      <GlobalLoader isVisible={isLoading} message={loadingMessage} />

      {/* PWA Install Prompt */}
      {showPWAInstall && (
        <PWAInstall onClose={handlePWAInstallClose} />
      )}

      <div className="relative min-h-screen text-gray-800 flex flex-col overflow-hidden">
        <Background />
        <div className="relative z-10 flex flex-col h-screen bg-white/90 backdrop-blur-sm">
        
        {/* Language Selector - Top Right */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageSelector size="sm" position="bottom-left" />
        </div>
        
        {/* Main Content */}
        <main className={`flex-1 ${appState === AppState.PROFILE ? 'overflow-y-auto' : 'overflow-y-auto'} p-4 pb-20`}>
          {renderContent()}
        </main>
        
        {/* Bottom Navigation with Profile Integration */}
        <BottomNavigation
          currentState={appState}
          onStateChange={handleStateChange}
          questProgress={getQuestProgress()}
          onChatClick={() => setIsChatOpen(true)}
          hasActiveAdventure={!!activeAdventure}
        />
        
        {/* Profile View */}
        {appState === AppState.PROFILE && (
          <div className="absolute inset-0 z-30 bg-white overflow-y-auto">
            <ProfileView
              profile={userProfile}
              onUpdateProfile={updateUserProfile}
              onClose={() => setAppState(AppState.HOME)}
            />
          </div>
        )}
        
        {/* Chat Interface */}
        {isChatOpen && (
          <ChatInterface
            userProfile={userProfile}
            currentLocation={userLocation || undefined}
            currentCity={activeAdventure?.destination.name}
            questContext={activeAdventure?.quests[activeAdventure?.currentQuestIndex]}
            onClose={() => setIsChatOpen(false)}
          />
        )}
        
        {/* Quest Assistant - contextual help (now part of journey) */}
        <QuestAssistant
          userProfile={userProfile}
          currentLocation={userLocation || undefined}
          currentCity={activeAdventure?.destination.name}
          questContext={activeAdventure?.quests[activeAdventure?.currentQuestIndex]}
          isVisible={isAssistantOpen && (appState === AppState.QUEST_VIEW || appState === AppState.PATH_VIEW)}
          onClose={() => setIsAssistantOpen(false)}
        />
        
        {/* Live Voice Assistant - always available during journeys */}
        <LiveAssistant
          userProfile={userProfile}
          currentLocation={userLocation || undefined}
          currentCity={activeAdventure?.destination.name}
          currentQuest={activeAdventure?.quests[activeAdventure?.currentQuestIndex]}
          isVisible={appState === AppState.QUEST_VIEW || appState === AppState.PATH_VIEW}
        />
        
        {/* Modals */}
        {isLibraryOpen && (
          <LibraryModal
            completedQuests={allCompletedQuests}
            onClose={() => setIsLibraryOpen(false)}
          />
        )}
        </div>
      </div>
    </>
  );
};

export default App;
