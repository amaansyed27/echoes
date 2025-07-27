import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslations } from '../services/translations';
import {
  generateTripPlan,
  TripPlan,
  TripStop
} from '../services/geminiService';

interface TravelGuideProps {
  userLocation?: { latitude: number; longitude: number } | null;
  userProfile?: any;
  activeAdventure?: any;
  onCreateAdventure?: (destination: string) => void;
}

interface LiveGuideFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  isActive: boolean;
}

const TravelGuide: React.FC<TravelGuideProps> = ({
  userLocation,
  userProfile,
  activeAdventure,
  onCreateAdventure
}) => {
  const { selectedLanguage } = useLanguage();
  const t = useTranslations(selectedLanguage.code);
  
  const [activeMode, setActiveMode] = useState<'plan' | 'guide' | 'edit'>('plan');
  const [tripPlans, setTripPlans] = useState<TripPlan[]>(() => {
    const saved = localStorage.getItem('tripPlans');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePlan, setActivePlan] = useState<TripPlan | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedMood, setSelectedMood] = useState<TripPlan['preferences']['mood']>('adventurous');

  // Enhanced trip editing state
  const [editingPlan, setEditingPlan] = useState<TripPlan | null>(null);
  const [recommendedStops, setRecommendedStops] = useState<TripStop[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [newStopName, setNewStopName] = useState('');
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [tripDuration, setTripDuration] = useState(3);
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium');

  // Live Guide Mode
  const [currentStop, setCurrentStop] = useState<TripStop | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedObjects, setRecognizedObjects] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Enhanced Live Guide Features
  const liveGuideFeatures: LiveGuideFeature[] = [
    {
      id: 'camera-recognition',
      icon: '📷',
      title: 'Camera Recognition',
      description: 'AI identifies landmarks and objects',
      isActive: isRecognizing
    },
    {
      id: 'audio-guide',
      icon: '🎧',
      title: 'Audio Guide',
      description: 'Museum-quality narration',
      isActive: isPlayingAudio
    },
    {
      id: 'voice-assistant',
      icon: '🗣️',
      title: 'Voice Assistant',
      description: 'Ask questions about locations',
      isActive: isListening
    },
    {
      id: 'location-context',
      icon: '📍',
      title: 'Location Context',
      description: 'Real-time historical information',
      isActive: !!userLocation
    },
    {
      id: 'ar-overlay',
      icon: '🥽',
      title: 'AR Overlay',
      description: 'Augmented reality information',
      isActive: false
    },
    {
      id: 'multilingual',
      icon: '🌐',
      title: 'Multilingual',
      description: `Active: ${selectedLanguage.nativeName}`,
      isActive: true
    }
  ];

  const startCameraRecognition = async () => {
    setIsRecognizing(true);
    setCurrentInstruction('📷 Camera recognition started. Point your camera at landmarks, buildings, or objects to get AI-powered information.');
    
    // Simulate camera recognition
    setTimeout(() => {
      setRecognizedObjects(['Historic Building', 'Classical Architecture', 'Cultural Monument']);
      setCurrentInstruction('🏛️ I can see a historic building with classical architecture. This appears to be a cultural monument of significant importance.');
    }, 2000);
  };

  const playAudioGuide = (stop: TripStop) => {
    setIsPlayingAudio(true);
    setCurrentInstruction(`🎧 Playing audio guide for ${stop.name}. ${stop.historicalInfo || 'Enjoy the immersive narration about this amazing location.'}`);
    
    // Simulate audio playback
    setTimeout(() => {
      setIsPlayingAudio(false);
      setCurrentInstruction('🎧 Audio guide completed. Would you like to hear about nearby attractions?');
    }, 5000);
  };

  const startVoiceAssistant = () => {
    setIsListening(true);
    setCurrentInstruction('🗣️ Voice assistant activated. You can ask me questions about history, culture, nearby attractions, or travel tips.');
    
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      setCurrentInstruction('🤖 I heard your question! Based on your location, I can tell you about the rich history of this area and recommend nearby attractions that match your interests.');
    }, 3000);
  };

  const createNewTrip = async () => {
    if (!newDestination.trim()) return;

    setIsGenerating(true);
    setCurrentInstruction(`🤖 ${t.common.loading} Generating your personalized trip plan...`);

    try {
      // Generate AI-powered trip plan
      const aiTripPlan = await generateTripPlan(
        newDestination,
        {
          mood: selectedMood,
          pace: 'moderate',
          interests: userProfile?.interests || [],
          budget: budget,
          duration: tripDuration
        },
        userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : undefined,
        selectedLanguage.code
      );

      const newTrip: TripPlan = {
        id: Date.now().toString(),
        name: aiTripPlan.name,
        destination: newDestination,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        stops: aiTripPlan.stops,
        status: 'planning',
        preferences: aiTripPlan.preferences
      };

      const updatedPlans = [...tripPlans, newTrip];
      setTripPlans(updatedPlans);
      localStorage.setItem('tripPlans', JSON.stringify(updatedPlans));
      setNewDestination('');
      setShowPreferences(false);
      setCurrentInstruction(`✅ Trip plan created! Found ${aiTripPlan.stops.length} amazing stops for your ${selectedMood} adventure.`);
    } catch (error) {
      console.error('Failed to create AI trip plan:', error);
      setCurrentInstruction('❌ Failed to generate trip plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Enhanced trip editing functions
  const startEditingTrip = async (plan: TripPlan) => {
    setEditingPlan(plan);
    setActiveMode('edit');
    await loadRecommendedStops(plan.destination);
  };

  const loadRecommendedStops = async (destination: string) => {
    setIsLoadingRecommendations(true);
    try {
      // Mock recommendations for now
      const mockRecommendations: TripStop[] = [
        {
          id: `mock-${Date.now()}-1`,
          name: `Popular attraction in ${destination}`,
          address: `Main area, ${destination}`,
          latitude: 0,
          longitude: 0,
          type: 'attraction',
          estimatedTime: 120,
          notes: 'AI-recommended must-visit attraction',
          visited: false,
          historicalInfo: 'Rich historical significance and cultural importance'
        },
        {
          id: `mock-${Date.now()}-2`,
          name: `Local restaurant in ${destination}`,
          address: `Food district, ${destination}`,
          latitude: 0,
          longitude: 0,
          type: 'restaurant',
          estimatedTime: 90,
          notes: 'Highly recommended local cuisine',
          visited: false
        },
        {
          id: `mock-${Date.now()}-3`,
          name: `Cultural site in ${destination}`,
          address: `Cultural quarter, ${destination}`,
          latitude: 0,
          longitude: 0,
          type: 'attraction',
          estimatedTime: 150,
          notes: 'Experience local culture and traditions',
          visited: false,
          historicalInfo: 'Important cultural landmark with centuries of history'
        }
      ];
      
      setRecommendedStops(mockRecommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setCurrentInstruction('❌ Failed to load recommendations. Please try again.');
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const addRecommendedStop = (stop: TripStop) => {
    if (!editingPlan) return;

    const updatedPlan = {
      ...editingPlan,
      stops: [...editingPlan.stops, { ...stop, id: Date.now().toString() }]
    };
    
    setEditingPlan(updatedPlan);
    updateTripPlan(updatedPlan);
    setCurrentInstruction(`✅ Added ${stop.name} to your trip!`);
  };

  const addCustomStop = async () => {
    if (!newStopName.trim() || !editingPlan) return;

    setIsAddingStop(true);
    try {
      // Create a custom stop with the user's input
      const customStop: TripStop = {
        id: Date.now().toString(),
        name: newStopName,
        type: 'attraction',
        address: `${newStopName}, ${editingPlan.destination}`,
        latitude: 0,
        longitude: 0,
        estimatedTime: 60,
        notes: `Visit ${newStopName}`,
        visited: false
      };
      
      addRecommendedStop(customStop);
      setCurrentInstruction(`✅ Added ${newStopName} to your trip!`);
      setNewStopName('');
    } catch (error) {
      console.error('Failed to add custom stop:', error);
      setCurrentInstruction('❌ Failed to add stop. Please try again.');
    } finally {
      setIsAddingStop(false);
    }
  };

  const removeStop = (stopId: string) => {
    if (!editingPlan) return;

    const updatedPlan = {
      ...editingPlan,
      stops: editingPlan.stops.filter(stop => stop.id !== stopId)
    };
    
    setEditingPlan(updatedPlan);
    updateTripPlan(updatedPlan);
    setCurrentInstruction('🗑️ Stop removed from your trip.');
  };

  const updateTripPlan = (updatedPlan: TripPlan) => {
    const updatedPlans = tripPlans.map(p => 
      p.id === updatedPlan.id ? updatedPlan : p
    );
    setTripPlans(updatedPlans);
    localStorage.setItem('tripPlans', JSON.stringify(updatedPlans));
  };

  const finishEditing = () => {
    setActiveMode('plan');
    setEditingPlan(null);
    setRecommendedStops([]);
    setNewStopName('');
    setCurrentInstruction('');
  };

  const createAdventureFromTrip = (destination: string) => {
    if (onCreateAdventure) {
      onCreateAdventure(destination);
    }
  };

  const moodOptions = [
    { value: 'relaxed', emoji: '😌', label: 'Relaxed', description: 'Calm, peaceful experiences' },
    { value: 'adventurous', emoji: '🚀', label: 'Adventurous', description: 'Exciting, active exploration' },
    { value: 'cultural', emoji: '🎭', label: 'Cultural', description: 'Museums, history, arts' },
    { value: 'romantic', emoji: '💕', label: 'Romantic', description: 'Intimate, scenic spots' },
    { value: 'family', emoji: '👨‍👩‍👧‍👦', label: 'Family', description: 'Kid-friendly activities' },
    { value: 'solo', emoji: '🧘', label: 'Solo', description: 'Personal discovery journey' }
  ] as const;

  const startGuideMode = (plan: TripPlan) => {
    setActivePlan(plan);
    setActiveMode('guide');
    setCurrentStop(plan.stops[0] || null);
    
    // Update plan status to active
    const updatedPlans = tripPlans.map(p => 
      p.id === plan.id ? { ...p, status: 'active' as const } : p
    );
    setTripPlans(updatedPlans);
    localStorage.setItem('tripPlans', JSON.stringify(updatedPlans));
  };

  const getDirectionsToStop = (stop: TripStop) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${stop.latitude},${stop.longitude}&travelmode=walking`;
      window.open(url, '_blank');
    }
  };

  const markStopVisited = (stopId: string) => {
    if (!activePlan) return;

    const updatedStops = activePlan.stops.map(stop => 
      stop.id === stopId ? { ...stop, visited: true } : stop
    );
    
    const updatedPlan = { ...activePlan, stops: updatedStops };
    setActivePlan(updatedPlan);

    // Move to next unvisited stop
    const nextStop = updatedStops.find(stop => !stop.visited);
    setCurrentStop(nextStop || null);

    // Update in storage
    const updatedPlans = tripPlans.map(p => 
      p.id === activePlan.id ? updatedPlan : p
    );
    setTripPlans(updatedPlans);
    localStorage.setItem('tripPlans', JSON.stringify(updatedPlans));
  };

  const getStopIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'attraction': return '🏛️';
      case 'hotel': return '🏨';
      case 'activity': return '🎯';
      case 'transport': return '🚇';
      default: return '📍';
    }
  };

  // Trip Edit Mode UI
  if (activeMode === 'edit' && editingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <button
              onClick={finishEditing}
              className="flex items-center space-x-2 text-blue-600 font-medium self-start"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 text-center flex-1">
              Edit Trip: {editingPlan.name}
            </h1>
            <button
              onClick={finishEditing}
              className="bg-green-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              ✅ Done Editing
            </button>
          </div>

          {/* Add Custom Stop */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Your Own Stop</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newStopName}
                onChange={(e) => setNewStopName(e.target.value)}
                placeholder="Enter place name (e.g., 'Red Fort', 'Local restaurant', 'Shopping market')"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && addCustomStop()}
              />
              <button
                onClick={addCustomStop}
                disabled={!newStopName.trim() || isAddingStop}
                className="bg-blue-500 text-white px-6 py-3 font-medium hover:bg-blue-600 transition-colors rounded-xl disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isAddingStop ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <span>➕</span>
                    <span>Add Stop</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Stops */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Trip Stops ({editingPlan.stops.length})
            </h2>
            
            {editingPlan.stops.length > 0 ? (
              <div className="space-y-3">
                {editingPlan.stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl">
                    <span className="text-sm font-medium text-gray-500 w-8">#{index + 1}</span>
                    <span className="text-xl">{getStopIcon(stop.type)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{stop.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{stop.address}</p>
                    </div>
                    <button
                      onClick={() => removeStop(stop.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No stops added yet</h3>
                <p className="text-gray-600">Add stops to start planning your trip</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeMode === 'guide' && activePlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
          {/* Guide mode content here */}
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Guide Mode</h1>
            <p>Live guidance for {activePlan.name}</p>
            <button
              onClick={() => setActiveMode('plan')}
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-xl"
            >
              Back to Planning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-50 to-green-100 rounded-3xl transform -rotate-1"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🗺️</span>
                </div>
                <div className="text-left">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Travel Guide
                  </h1>
                  <p className="text-sm text-gray-500 font-medium">AI-Powered Trip Planning</p>
                </div>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed mb-4">
                Plan comprehensive multi-stop trips with AI recommendations and museum-quality live guidance.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                <p className="text-blue-700 text-sm font-medium">
                  💡 Unlike Adventures (single places), Travel Guide plans complete multi-day trips with multiple stops
                </p>
              </div>
              <div className="flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  <span>Live Guidance</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                  <span>10+ Languages</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Trip */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl transform rotate-1 opacity-10"></div>
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Plan New Trip</h2>
                <p className="text-sm text-gray-600">Enter a destination and let AI create your perfect itinerary</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-lg">🌍</span>
                  </div>
                  <input
                    type="text"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="Enter a city or destination (e.g., 'Paris', 'Tokyo', 'New Delhi')"
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-lg placeholder-gray-400 shadow-lg"
                  />
                </div>
                <button
                  onClick={createNewTrip}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 font-bold hover:from-blue-600 hover:to-purple-700 transition-all rounded-2xl disabled:opacity-50 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  disabled={!newDestination.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">✨</span>
                      <span>Create Trip</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Plans */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-lg">📋</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Your Trip Plans</h2>
          </div>
          
          {tripPlans.length > 0 ? (
            <div className="space-y-4">
              {tripPlans.map(plan => (
                <div key={plan.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{plan.destination}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-lg">🎭 {plan.preferences.mood}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded-lg">💰 {plan.preferences.budget}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => startEditingTrip(plan)}
                        className="bg-purple-500 text-white px-4 py-2 text-sm font-medium hover:bg-purple-600 transition-colors rounded-xl"
                      >
                        ✏️ Edit Trip
                      </button>
                      <button
                        onClick={() => startGuideMode(plan)}
                        className="bg-blue-500 text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors rounded-xl"
                      >
                        🚀 Start Guide
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Stops: {plan.stops.length}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No trip plans yet</h3>
              <p className="text-gray-600">Create your first trip above to get started</p>
            </div>
          )}
        </div>

        {/* Enhanced Features */}
        <div className="relative mt-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-3xl transform rotate-1"></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Smart Features
              </h3>
              <p className="text-gray-600">Museum-quality technology for modern travelers</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg mb-4">
                  <span className="text-2xl">📷</span>
                </div>
                <h4 className="font-bold text-blue-900 mb-2">Camera Recognition</h4>
                <p className="text-blue-800 text-sm">AI identifies landmarks in real-time</p>
              </div>
              
              <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg mb-4">
                  <span className="text-2xl">🎧</span>
                </div>
                <h4 className="font-bold text-purple-900 mb-2">Audio Guide</h4>
                <p className="text-purple-800 text-sm">Museum-quality narration</p>
              </div>
              
              <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-xl transition-all transform hover:scale-105">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg mb-4">
                  <span className="text-2xl">🌐</span>
                </div>
                <h4 className="font-bold text-green-900 mb-2">Multilingual</h4>
                <p className="text-green-800 text-sm">10+ languages supported</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelGuide;
