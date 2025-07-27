import React, { useState, useEffect } from 'react';
import type { Memory, Story, UserProfile } from '../types';

interface MemoriesProps {
  adventures: Story[];
  userProfile: UserProfile;
}

interface MapPin {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  memories: Memory[];
}

const WorldMap: React.FC<{ pins: MapPin[], onPinClick: (pin: MapPin) => void }> = ({ pins, onPinClick }) => {
  const getMapPosition = (lat: number, lng: number) => {
    // Convert lat/lng to SVG coordinates (simplified world map projection)
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden border border-gray-200">
      {/* World Map Background (simplified SVG) */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 50" preserveAspectRatio="xMidYMid slice">
        {/* Simplified continent shapes */}
        <path d="M10,20 Q15,15 25,18 Q35,22 30,28 Q20,30 10,25 Z" fill="#059669" opacity="0.3" />
        <path d="M35,15 Q45,12 55,16 Q65,20 60,26 Q50,28 40,24 Z" fill="#059669" opacity="0.3" />
        <path d="M70,18 Q80,15 90,20 Q85,28 75,26 Q70,22 70,18 Z" fill="#059669" opacity="0.3" />
        <path d="M15,35 Q25,32 35,36 Q30,42 20,40 Q15,38 15,35 Z" fill="#059669" opacity="0.3" />
      </svg>
      
      {/* Location Pins */}
      {pins.map((pin, index) => {
        const pos = getMapPosition(pin.latitude, pin.longitude);
        return (
          <button
            key={index}
            onClick={() => onPinClick(pin)}
            className="absolute w-4 h-4 bg-red-500 border-2 border-white shadow-lg hover:scale-125 transition-transform active:scale-95"
            style={{ 
              left: pos.x, 
              top: pos.y,
              transform: 'translate(-50%, -100%)'
            }}
            title={`${pin.name} - ${pin.memories.length} memories`}
          >
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 text-white text-xs flex items-center justify-center">
              {pin.memories.length}
            </div>
          </button>
        );
      })}
      
      {/* Map Legend */}
      <div className="absolute bottom-2 right-2 bg-white/90 p-2 text-xs text-gray-600">
        📍 {pins.length} locations visited
      </div>
    </div>
  );
};

const MemoryCard: React.FC<{ memory: Memory, onClick: () => void }> = ({ memory, onClick }) => {
  const getMemoryIcon = (type: string) => {
    switch (type) {
      case 'quest': return '🎯';
      case 'adventure': return '🗺️';
      case 'photo': return '📸';
      default: return '📝';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 p-4 shadow-sm cursor-pointer hover:border-purple-200 hover:shadow-md transition-all active:scale-95"
    >
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-xl">
          {memory.photo ? (
            <img src={memory.photo} alt={memory.title} className="w-full h-full object-cover" />
          ) : (
            getMemoryIcon(memory.type)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{memory.title}</h4>
          <p className="text-sm text-gray-600 mb-1">{memory.location.name}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{formatDate(memory.date)}</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1">
              {memory.type}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Memories: React.FC<MemoriesProps> = ({ adventures }) => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'photos' | 'quests' | 'adventures'>('all');

  useEffect(() => {
    // Generate memories from completed adventures and quests
    const generatedMemories: Memory[] = [];

    adventures.forEach(adventure => {
      // Add memories for completed quests
      adventure.completedQuests.forEach((completedQuest, index) => {
        const memory: Memory = {
          id: `quest-${adventure.id}-${index}`,
          type: completedQuest.userPhoto ? 'photo' : 'quest',
          title: completedQuest.quest.title,
          description: completedQuest.quest.description,
          location: {
            latitude: completedQuest.quest.latitude,
            longitude: completedQuest.quest.longitude,
            name: completedQuest.quest.targetLocationName,
            country: adventure.destination.name.split(',').pop()?.trim() || 'Unknown'
          },
          date: completedQuest.completedDate || new Date(),
          photo: completedQuest.userPhoto,
          questData: completedQuest,
          adventureId: adventure.id
        };
        generatedMemories.push(memory);
      });

      // Add memory for completed adventure
      if (adventure.currentQuestIndex >= adventure.quests.length && adventure.completedQuests.length > 0) {
        const memory: Memory = {
          id: `adventure-${adventure.id}`,
          type: 'adventure',
          title: `Completed: ${adventure.title}`,
          description: `Finished all ${adventure.quests.length} quests in this adventure`,
          location: {
            latitude: adventure.destination.latitude,
            longitude: adventure.destination.longitude,
            name: adventure.destination.name,
            country: adventure.destination.name.split(',').pop()?.trim() || 'Unknown'
          },
          date: new Date(), // Use most recent quest completion date
          adventureId: adventure.id
        };
        generatedMemories.push(memory);
      }
    });

    // Sort memories by date (newest first)
    generatedMemories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setMemories(generatedMemories);
  }, [adventures]);

  // Group memories by location for map pins
  const mapPins: MapPin[] = React.useMemo(() => {
    const locationMap = new Map<string, MapPin>();
    
    memories.forEach(memory => {
      const key = `${memory.location.latitude},${memory.location.longitude}`;
      if (locationMap.has(key)) {
        locationMap.get(key)!.memories.push(memory);
      } else {
        locationMap.set(key, {
          latitude: memory.location.latitude,
          longitude: memory.location.longitude,
          name: memory.location.name,
          country: memory.location.country,
          memories: [memory]
        });
      }
    });
    
    return Array.from(locationMap.values());
  }, [memories]);

  const filteredMemories = memories.filter(memory => {
    if (viewMode === 'all') return true;
    if (viewMode === 'photos') return memory.type === 'photo';
    if (viewMode === 'quests') return memory.type === 'quest';
    if (viewMode === 'adventures') return memory.type === 'adventure';
    return true;
  });

  const stats = {
    total: memories.length,
    photos: memories.filter(m => m.type === 'photo').length,
    quests: memories.filter(m => m.type === 'quest').length,
    adventures: memories.filter(m => m.type === 'adventure').length,
    locations: mapPins.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Memories</h1>
          <p className="text-gray-600">Relive your adventures and explore where you've been</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Total Memories</div>
          </div>
          <div className="bg-white border border-gray-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.photos}</div>
            <div className="text-xs text-gray-500">Photos</div>
          </div>
          <div className="bg-white border border-gray-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.quests}</div>
            <div className="text-xs text-gray-500">Quests</div>
          </div>
          <div className="bg-white border border-gray-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-amber-600">{stats.locations}</div>
            <div className="text-xs text-gray-500">Locations</div>
          </div>
        </div>

        {/* World Map */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
            Your Journey Map
          </h2>
          <WorldMap pins={mapPins} onPinClick={setSelectedPin} />
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 p-1 inline-flex space-x-1">
            {[
              { key: 'all', label: 'All', icon: '📱', count: stats.total },
              { key: 'photos', label: 'Photos', icon: '📸', count: stats.photos },
              { key: 'quests', label: 'Quest', icon: '🎯', count: stats.quests },
              { key: 'adventures', label: 'Adventures', icon: '🗺️', count: stats.adventures }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as any)}
                className={`relative flex items-center space-x-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-fit ${
                  viewMode === tab.key
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="font-semibold">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 font-medium ${
                    viewMode === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Pin Details */}
        {selectedPin && (
          <div className="mb-6 bg-white border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">{selectedPin.name}</h3>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">{selectedPin.memories.length} memories at this location</p>
            <div className="space-y-2">
              {selectedPin.memories.slice(0, 3).map(memory => (
                <div key={memory.id} className="flex items-center space-x-3 p-2 bg-gray-50">
                  <span className="text-lg">
                    {memory.photo ? '📸' : memory.type === 'quest' ? '🎯' : '🗺️'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{memory.title}</p>
                    <p className="text-xs text-gray-500">{new Date(memory.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {selectedPin.memories.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{selectedPin.memories.length - 3} more memories
                </p>
              )}
            </div>
          </div>
        )}

        {/* Memories List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Recent Memories ({filteredMemories.length})
          </h2>
          
          {filteredMemories.length > 0 ? (
            <div className="space-y-3">
              {filteredMemories.map(memory => (
                <MemoryCard
                  key={memory.id}
                  memory={memory}
                  onClick={() => {
                    // Future: Open detailed memory view
                    console.log('Opening memory:', memory);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Memories Yet</h3>
              <p className="text-gray-600">Start your first adventure to create memories!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Memories;
