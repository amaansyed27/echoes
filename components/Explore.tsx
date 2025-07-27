import React, { useState, useEffect } from 'react';
import { UserProfile, GeoLocation, Story } from '../types';
import { generateTravelGuide } from '../services/geminiService';
import { getNearbyLocations, getLocationName, getWorldMonuments, getWorldCities, LocationSuggestion } from '../services/locationService';

interface ExploreProps {
  userProfile: UserProfile;
  userLocation?: GeoLocation;
  onCreateAdventure: (adventure: Story) => void;
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
  const [locationName, setLocationName] = useState<string>('Current Location');
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // Fetch location-based suggestions
  useEffect(() => {
    const fetchLocationData = async () => {
      if (!userLocation) {
        setIsLoadingLocations(false);
        return;
      }

      setIsLoadingLocations(true);
      try {
        // Get current location name
        const currentLocationName = await getLocationName(userLocation);
        setLocationName(currentLocationName);

        // Fetch nearby locations, monuments, and cities in parallel
        const [nearby, monuments, worldCities] = await Promise.all([
          getNearbyLocations(userLocation, 200),
          getWorldMonuments(),
          getWorldCities()
        ]);

        setNearbyLocations(nearby);
        setMonumentsAndLandmarks(monuments);
        setCities(worldCities);
      } catch (error) {
        console.error('Failed to fetch location data:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocationData();
  }, [userLocation]);

  const handleStartJourney = async (location: LocationSuggestion) => {
    setIsLoading(true);
    try {
      const storyData = await generateTravelGuide(location.name);
      const newAdventure: Story = {
        id: `adventure-${Date.now()}`,
        title: storyData.title,
        introNarrative: storyData.introNarrative,
        destination: storyData.destination,
        quests: storyData.quests,
        currentQuestIndex: 0,
        completedQuests: []
      };
      onCreateAdventure(newAdventure);
    } catch (error) {
      console.error('Failed to create adventure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderLocationCard = (location: LocationSuggestion) => (
    <div
      key={location.id}
      onClick={() => handleStartJourney(location)}
      className="bg-white rounded-xl p-4 shadow-card border border-gray-200 active:scale-95 transition-all duration-200 cursor-pointer hover:shadow-card-hover hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl">{location.image || '📍'}</span>
            <h3 className="text-lg font-semibold text-gray-800">{location.name}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-2">{location.description}</p>
          {location.distance && (
            <p className="text-xs text-blue-600">{location.distance.toFixed(1)} km away</p>
          )}
          {location.country && (
            <p className="text-xs text-gray-500">{location.country}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">🧭</span>
            <h1 className="text-3xl font-bold text-gray-800">Explore</h1>
          </div>
          <p className="text-gray-600">Discover amazing places and create new adventures</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white p-1 rounded-xl mb-6 border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'current'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            📍 Current Location
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'points'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            🏛️ Monuments
          </button>
          <button
            onClick={() => setActiveTab('cities')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'cities'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            🏙️ Cities
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'current' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📍 Near {locationName}
              </h2>
              {userLocation ? (
                isLoadingLocations ? (
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
                    <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Discovering nearby adventures...</p>
                  </div>
                ) : nearbyLocations.length > 0 ? (
                  <div className="grid gap-4">
                    {nearbyLocations.map(renderLocationCard)}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
                    <p className="text-gray-700 mb-2">🌟 No nearby adventures found within 200km</p>
                    <p className="text-sm text-gray-500">Try exploring monuments or cities from other tabs!</p>
                  </div>
                )
              ) : (
                <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
                  <p className="text-gray-700 mb-4">📍 Enable location access to discover nearby adventures</p>
                  <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium">
                    Enable Location
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'points' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🏛️ Monuments & Landmarks</h2>
              {isLoadingLocations ? (
                <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading world monuments...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {monumentsAndLandmarks.map(renderLocationCard)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cities' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🏙️ World Cities</h2>
              {isLoadingLocations ? (
                <div className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading world cities...</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {cities.map(renderLocationCard)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg text-center">
              <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-800 font-medium">Creating your adventure...</p>
              <p className="text-gray-500 text-sm">This may take a moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
