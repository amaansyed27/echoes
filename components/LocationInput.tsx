import React, { useState, useEffect } from 'react';
import { getNearbyLocations, type LocationSuggestion } from '../services/locationService';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLanguage } from '../hooks/useLanguage';
import { useTranslations } from '../services/translations';

interface LocationInputProps {
  onStart: (location: string) => void;
  error: string | null;
  disabled?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({ onStart, error, disabled = false }) => {
  const [location, setLocation] = useState('');
  const [nearbyLocations, setNearbyLocations] = useState<LocationSuggestion[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10); // Default 10km
  const [showRadiusSelector, setShowRadiusSelector] = useState(false);
  const { location: userLocation } = useGeolocation();
  const { selectedLanguage } = useLanguage();
  const t = useTranslations(selectedLanguage.code);

  const radiusOptions = [
    { value: 5, label: '5km', icon: '🚶', name: t.distance.walking },
    { value: 10, label: '10km', icon: '🚴', name: t.distance.cycling },
    { value: 25, label: '25km', icon: '🚗', name: t.distance.driving },
    { value: 50, label: '50km', icon: '🚄', name: t.distance.train },
    { value: 100, label: '100km', icon: '✈️', name: t.distance.flight }
  ];

  // Load nearby locations when user location or search radius changes
  useEffect(() => {
    if (userLocation && !loadingNearby) {
      setLoadingNearby(true);
      getNearbyLocations(userLocation, searchRadius)
        .then(locations => {
          // Filter to ensure all locations are within selected radius
          const filteredLocations = locations.filter(loc => (loc.distance || 0) <= searchRadius);
          setNearbyLocations(filteredLocations.slice(0, 12)); // Show more results for larger radius
        })
        .catch(error => {
          console.error('Failed to load nearby locations:', error);
        })
        .finally(() => {
          setLoadingNearby(false);
        });
    }
  }, [userLocation, searchRadius]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() && !disabled) {
      onStart(location.trim());
    }
  };

  const handleLocationSelect = (selectedLocation: LocationSuggestion) => {
    setLocation(selectedLocation.name);
    onStart(selectedLocation.name);
  };

  const handleRadiusChange = (radius: number) => {
    setSearchRadius(radius);
    setShowRadiusSelector(false);
    setNearbyLocations([]); // Clear current results
  };

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'monument': return '🏛️';
      case 'city': return '🏙️';
      case 'landmark': return '📍';
      case 'natural': return '🌿';
      default: return '📍';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Adventure Start Card */}
      <div className="bg-white shadow-lg border border-gray-100 overflow-hidden mb-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">{t.adventures.startYourAdventure}</h2>
          <p className="text-blue-100">{t.adventures.whereToExplore}</p>
        </div>

        {/* Input Section */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.adventures.enterLocation}
                disabled={disabled}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={disabled || !location.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-500 text-white font-medium hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {disabled ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"></div>
                ) : (
                  t.common.go
                )}
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
          </form>

          {/* Nearby Locations */}
          {userLocation && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">📍 Nearby Adventures</h3>
                <div className="flex items-center space-x-2">
                  {loadingNearby && (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setShowRadiusSelector(!showRadiusSelector)}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-100 border border-gray-200 hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors"
                      disabled={disabled}
                    >
                      <span>{radiusOptions.find(r => r.value === searchRadius)?.icon}</span>
                      <span>{searchRadius}km</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showRadiusSelector && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-lg z-10 min-w-[120px]">
                        {radiusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleRadiusChange(option.value)}
                            className={`w-full flex items-center space-x-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${
                              searchRadius === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {nearbyLocations.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {nearbyLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleLocationSelect(loc)}
                      disabled={disabled}
                      className="p-3 bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 active:scale-95 transition-all disabled:opacity-50 text-left"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getLocationIcon(loc.type)}</span>
                        <span className="font-medium text-gray-900 text-sm truncate">{loc.name}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {loc.distance ? `${loc.distance.toFixed(1)}km away` : loc.type}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!loadingNearby && nearbyLocations.length === 0 && userLocation && (
                <div className="text-center py-4">
                  <div className="text-gray-400 text-sm">No adventures found within {searchRadius}km</div>
                  <button
                    onClick={() => setShowRadiusSelector(true)}
                    className="text-blue-500 text-xs hover:text-blue-600 mt-1"
                  >
                    Try a larger radius
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationInput;
