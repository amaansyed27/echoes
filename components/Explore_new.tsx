import React, { useState, useEffect } from 'react';
import { UserProfile, GeoLocation, Story } from '../types';
import { generateTravelGuide } from '../services/geminiService';

interface ExploreProps {
  userProfile: UserProfile;
  userLocation?: GeoLocation;
  onCreateAdventure: (adventure: Story) => void;
}

interface LocationSuggestion {
  id: string;
  name: string;
  type: 'monument' | 'city' | 'landmark';
  description: string;
  distance?: number;
  latitude: number;
  longitude: number;
  image?: string;
  completed?: boolean;
  memoryCount?: number;
}

const Explore: React.FC<ExploreProps> = ({
  userProfile,
  userLocation,
  onCreateAdventure
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'points' | 'cities'>('current');
  const [nearbyLocations, setNearbyLocations] = useState<LocationSuggestion[]>([]);
  const [monumentsAndLandmarks, setMonumentsAndLandmarks] = useState<LocationSuggestion[]>([]);
  const [cities, setCities] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Mock data for demonstration - in real app, this would come from API
  useEffect(() => {
    // Simulate fetching nearby locations based on user location
    const mockNearbyLocations: LocationSuggestion[] = [
      {
        id: '1',
        name: 'Historic Downtown',
        type: 'landmark',
        description: 'Explore the historic heart of your city',
        distance: 0.5,
        latitude: userLocation?.latitude || 40.7128,
        longitude: userLocation?.longitude || -74.0060,
        completed: false
      },
      {
        id: '2',
        name: 'Central Park',
        type: 'landmark',
        description: 'Urban oasis with hidden stories',
        distance: 1.2,
        latitude: 40.7829,
        longitude: -73.9654,
        completed: false
      },
      {
        id: '3',
        name: 'Local Museum',
        type: 'monument',
        description: 'Discover local history and culture',
        distance: 2.1,
        latitude: 40.7794,
        longitude: -73.9632,
        completed: true,
        memoryCount: 5
      }
    ];

    const mockMonuments: LocationSuggestion[] = [
      {
        id: 'm1',
        name: 'Statue of Liberty',
        type: 'monument',
        description: 'Symbol of freedom and democracy',
        latitude: 40.6892,
        longitude: -74.0445,
        completed: userProfile.visitedCities.includes('Statue of Liberty'),
        memoryCount: userProfile.visitedCities.includes('Statue of Liberty') ? 8 : 0
      },
      {
        id: 'm2',
        name: 'Golden Gate Bridge',
        type: 'monument',
        description: 'Iconic suspension bridge',
        latitude: 37.8199,
        longitude: -122.4783,
        completed: false
      },
      {
        id: 'm3',
        name: 'Mount Rushmore',
        type: 'monument',
        description: 'Presidential mountain sculpture',
        latitude: 43.8791,
        longitude: -103.4591,
        completed: false
      }
    ];

    const mockCities: LocationSuggestion[] = [
      {
        id: 'c1',
        name: 'Paris, France',
        type: 'city',
        description: 'City of Light and Romance',
        latitude: 48.8566,
        longitude: 2.3522,
        completed: userProfile.visitedCities.includes('Paris'),
        memoryCount: userProfile.visitedCities.includes('Paris') ? 12 : 0
      },
      {
        id: 'c2',
        name: 'Tokyo, Japan',
        type: 'city',
        description: 'Where tradition meets innovation',
        latitude: 35.6762,
        longitude: 139.6503,
        completed: userProfile.visitedCities.includes('Tokyo'),
        memoryCount: userProfile.visitedCities.includes('Tokyo') ? 15 : 0
      },
      {
        id: 'c3',
        name: 'Rome, Italy',
        type: 'city',
        description: 'Eternal City of ancient wonders',
        latitude: 41.9028,
        longitude: 12.4964,
        completed: userProfile.visitedCities.includes('Rome'),
        memoryCount: userProfile.visitedCities.includes('Rome') ? 10 : 0
      }
    ];

    setNearbyLocations(mockNearbyLocations);
    setMonumentsAndLandmarks(mockMonuments);
    setCities(mockCities);
  }, [userLocation, userProfile.visitedCities]);

  const handleStartJourney = async (location: LocationSuggestion) => {
    setIsLoading(true);
    try {
      const storyData = await generateTravelGuide(location.name);
      const newAdventure: Story = {
        ...storyData,
        id: Date.now().toString(),
        currentQuestIndex: 0,
        completedQuests: [],
      };
      onCreateAdventure(newAdventure);
    } catch (error) {
      console.error('Failed to create adventure:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'monument':
        return '🏛️';
      case 'city':
        return '🏙️';
      case 'landmark':
        return '📍';
      default:
        return '🗺️';
    }
  };

  const renderLocationCard = (location: LocationSuggestion) => (
    <div
      key={location.id}
      className={`relative bg-gray-800/90 rounded-xl p-4 border ${
        location.completed ? 'border-green-400/30' : 'border-gray-600'
      } transition-all duration-300 hover:border-amber-400/50 hover:shadow-lg`}
    >
      {location.completed && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          ✓ Completed
        </div>
      )}
      
      <div className="flex items-start space-x-3">
        <div className="text-3xl">{getLocationIcon(location.type)}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-300">{location.name}</h3>
          <p className="text-gray-300 text-sm mb-2">{location.description}</p>
          
          {location.distance && (
            <p className="text-amber-400 text-xs mb-2">📍 {location.distance} km away</p>
          )}
          
          {location.completed && location.memoryCount && (
            <div className="flex items-center space-x-4 mb-2">
              <span className="text-green-400 text-xs">🎯 Adventure Complete</span>
              <span className="text-blue-400 text-xs">📸 {location.memoryCount} memories</span>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleStartJourney(location)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                location.completed
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-black'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? '🔄' : location.completed ? 'Revisit' : 'Start Journey'}
            </button>
            
            {location.completed && (
              <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-all">
                📱 Memories
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMapView = () => (
    <div className="bg-gray-800/90 rounded-xl p-6 border border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-amber-300">📍 Interactive Map</h3>
        <button
          onClick={() => setShowMap(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      {/* Simplified map representation */}
      <div className="bg-gray-900 rounded-lg h-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-green-900/20"></div>
        
        {/* User location */}
        {userLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-blue-500 w-4 h-4 rounded-full animate-pulse shadow-lg"></div>
            <span className="absolute top-5 left-1/2 transform -translate-x-1/2 text-xs text-blue-300">You</span>
          </div>
        )}
        
        {/* Nearby locations */}
        {nearbyLocations.slice(0, 3).map((location, index) => (
          <div
            key={location.id}
            className={`absolute w-3 h-3 rounded-full ${
              location.completed ? 'bg-green-400' : 'bg-amber-400'
            } cursor-pointer hover:scale-150 transition-transform`}
            style={{
              top: `${30 + index * 20}%`,
              left: `${40 + index * 15}%`
            }}
            onClick={() => handleStartJourney(location)}
          >
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap">
              {location.name}
            </div>
          </div>
        ))}
        
        <div className="absolute bottom-4 left-4 text-xs text-gray-400">
          🟦 You  🟡 Available  🟢 Completed
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-amber-300 mb-2">🧭 Explore</h1>
        <p className="text-gray-300">Discover amazing places and create new adventures</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'current'
              ? 'bg-amber-500 text-black'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          📍 Current Location
        </button>
        <button
          onClick={() => setActiveTab('points')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'points'
              ? 'bg-amber-500 text-black'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          🏛️ Points & Monuments
        </button>
        <button
          onClick={() => setActiveTab('cities')}
          className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'cities'
              ? 'bg-amber-500 text-black'
              : 'text-gray-300 hover:text-white hover:bg-gray-700'
          }`}
        >
          🏙️ Cities
        </button>
      </div>

      {/* Map Toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowMap(!showMap)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center space-x-2"
        >
          <span>{showMap ? '📱' : '🗺️'}</span>
          <span>{showMap ? 'List View' : 'Map View'}</span>
        </button>
      </div>

      {/* Content */}
      {showMap ? (
        renderMapView()
      ) : (
        <div className="space-y-4">
          {activeTab === 'current' && (
            <div>
              <h2 className="text-xl font-semibold text-amber-300 mb-4">📍 Nearby Adventures</h2>
              {userLocation ? (
                <div className="grid gap-4">
                  {nearbyLocations.map(renderLocationCard)}
                </div>
              ) : (
                <div className="bg-gray-800/90 rounded-xl p-6 text-center border border-gray-600">
                  <p className="text-gray-300 mb-4">📍 Enable location access to discover nearby adventures</p>
                  <button className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-medium">
                    Enable Location
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div>
              <h2 className="text-xl font-semibold text-amber-300 mb-4">🏛️ Monuments & Landmarks</h2>
              <div className="grid gap-4">
                {monumentsAndLandmarks.map(renderLocationCard)}
              </div>
            </div>
          )}

          {activeTab === 'cities' && (
            <div>
              <h2 className="text-xl font-semibold text-amber-300 mb-4">🏙️ World Cities</h2>
              <div className="grid gap-4">
                {cities.map(renderLocationCard)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="bg-gray-800/90 rounded-xl p-6 border border-gray-600">
        <h3 className="text-lg font-semibold text-amber-300 mb-4">📊 Your Exploration Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{userProfile.visitedCities.length}</div>
            <div className="text-sm text-gray-300">Cities Visited</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{userProfile.completedQuests}</div>
            <div className="text-sm text-gray-300">Quests Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{userProfile.totalPoints}</div>
            <div className="text-sm text-gray-300">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">Level {userProfile.level}</div>
            <div className="text-sm text-gray-300">Explorer Level</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Explore;
