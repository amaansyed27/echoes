import React, { useState, useEffect } from 'react';
import type { UserProfile, GeoLocation } from '../types';

interface TravelGuideProps {
  userProfile: UserProfile;
  userLocation: GeoLocation | null;
}

interface TripStop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'restaurant' | 'attraction' | 'hotel' | 'activity' | 'transport';
  estimatedTime: number; // minutes
  notes?: string;
  visited: boolean;
}

interface TripPlan {
  id: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  stops: TripStop[];
  status: 'planning' | 'active' | 'completed';
}

const TravelGuide: React.FC<TravelGuideProps> = ({ userLocation }) => {
  const [activeMode, setActiveMode] = useState<'plan' | 'guide'>('plan');
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [activePlan, setActivePlan] = useState<TripPlan | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [newDestination, setNewDestination] = useState('');

  // Live Guide Mode
  const [currentStop, setCurrentStop] = useState<TripStop | null>(null);

  useEffect(() => {
    // Load saved trip plans from localStorage
    const savedPlans = localStorage.getItem('tripPlans');
    if (savedPlans) {
      setTripPlans(JSON.parse(savedPlans));
    }
  }, []);

  const createNewTrip = () => {
    if (!newDestination.trim()) return;

    const newTrip: TripPlan = {
      id: Date.now().toString(),
      name: `Trip to ${newDestination}`,
      destination: newDestination,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      stops: [],
      status: 'planning'
    };

    const updatedPlans = [...tripPlans, newTrip];
    setTripPlans(updatedPlans);
    localStorage.setItem('tripPlans', JSON.stringify(updatedPlans));
    setNewDestination('');
  };

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

  const startVoiceAssistant = () => {
    setIsListening(true);
    setCurrentInstruction('Listening for your travel question...');
    
    // Simulate voice interaction (would integrate with actual speech recognition)
    setTimeout(() => {
      setIsListening(false);
      setCurrentInstruction('Based on your location, I recommend visiting the nearby café first, then the museum.');
    }, 3000);
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

  if (activeMode === 'guide' && activePlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-6 pb-24">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setActiveMode('plan')}
              className="flex items-center space-x-2 text-blue-600 font-medium"
            >
              <span>←</span>
              <span>Back to Planning</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">{activePlan.name}</h1>
            <div className="w-20"></div>
          </div>

          {/* Current Location & Status */}
          <div className="bg-white border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Live Guide Mode</h2>
              <span className="bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                Active
              </span>
            </div>
            
            {currentStop ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 flex items-center justify-center text-xl">
                    {getStopIcon(currentStop.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{currentStop.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{currentStop.address}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => getDirectionsToStop(currentStop)}
                        className="bg-blue-500 text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        Get Directions
                      </button>
                      <button
                        onClick={() => markStopVisited(currentStop.id)}
                        className="bg-green-500 text-white px-4 py-2 text-sm font-medium hover:bg-green-600 transition-colors"
                      >
                        Mark Visited
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Trip Completed!</h3>
                <p className="text-gray-600">You've visited all planned stops.</p>
              </div>
            )}
          </div>

          {/* Voice Assistant */}
          <div className="bg-white border border-gray-200 p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Voice Assistant</h3>
            <div className="space-y-4">
              <button
                onClick={startVoiceAssistant}
                className={`w-full py-3 px-4 font-medium transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                disabled={isListening}
              >
                {isListening ? '🎤 Listening...' : '🎤 Ask Your Guide'}
              </button>
              {currentInstruction && (
                <div className="bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-800">{currentInstruction}</p>
                </div>
              )}
            </div>
          </div>

          {/* Trip Progress */}
          <div className="bg-white border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Trip Progress</h3>
            <div className="space-y-3">
              {activePlan.stops.map((stop) => (
                <div
                  key={stop.id}
                  className={`flex items-center space-x-4 p-3 border ${
                    stop.visited 
                      ? 'bg-green-50 border-green-200' 
                      : currentStop?.id === stop.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getStopIcon(stop.type)}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{stop.name}</h4>
                      <p className="text-sm text-gray-600">{stop.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {stop.visited && <span className="text-green-500">✓</span>}
                    {currentStop?.id === stop.id && !stop.visited && (
                      <span className="bg-blue-500 text-white px-2 py-1 text-xs">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Travel Guide</h1>
          <p className="text-gray-600">Plan your trips and get live guidance</p>
        </div>

        {/* Create New Trip */}
        <div className="bg-white border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan New Trip</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              value={newDestination}
              onChange={(e) => setNewDestination(e.target.value)}
              placeholder="Enter destination (e.g., Paris, Tokyo, New York)"
              className="flex-1 px-4 py-3 border border-gray-300 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={createNewTrip}
              className="bg-blue-500 text-white px-6 py-3 font-medium hover:bg-blue-600 transition-colors"
              disabled={!newDestination.trim()}
            >
              Create Trip
            </button>
          </div>
        </div>

        {/* Trip Plans */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Trip Plans</h2>
          
          {tripPlans.length > 0 ? (
            <div className="space-y-4">
              {tripPlans.map(plan => (
                <div key={plan.id} className="bg-white border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.destination}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm font-medium ${
                        plan.status === 'planning' ? 'bg-yellow-100 text-yellow-700' :
                        plan.status === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {plan.status}
                      </span>
                      {plan.status === 'planning' && (
                        <button
                          onClick={() => startGuideMode(plan)}
                          className="bg-blue-500 text-white px-4 py-2 text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          Start Guide
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Stops: {plan.stops.length}</span>
                      <span className="text-gray-600">
                        Visited: {plan.stops.filter(s => s.visited).length}
                      </span>
                    </div>
                    
                    {plan.stops.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                        {plan.stops.slice(0, 4).map(stop => (
                          <div key={stop.id} className="flex items-center space-x-2 p-2 bg-gray-50 border border-gray-200">
                            <span>{getStopIcon(stop.type)}</span>
                            <span className="text-sm text-gray-700 truncate">{stop.name}</span>
                            {stop.visited && <span className="text-green-500 text-sm">✓</span>}
                          </div>
                        ))}
                        {plan.stops.length > 4 && (
                          <div className="flex items-center justify-center p-2 bg-gray-50 border border-gray-200 text-sm text-gray-600">
                            +{plan.stops.length - 4} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white border border-gray-200">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Trip Plans Yet</h3>
              <p className="text-gray-600">Create your first trip plan to get started!</p>
            </div>
          )}
        </div>

        {/* Features Info */}
        <div className="bg-blue-50 border border-blue-200 p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-3">Travel Guide Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">🎯</span>
              <span className="text-blue-800">Real-time location guidance</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">🗣️</span>
              <span className="text-blue-800">Voice assistant for directions</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">📍</span>
              <span className="text-blue-800">Google Maps integration</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">📱</span>
              <span className="text-blue-800">Live trip progress tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelGuide;
