import { GoogleGenAI, Type } from "@google/genai";
import { GeoLocation } from '../types';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface LocationSuggestion {
  id: string;
  name: string;
  type: 'monument' | 'city' | 'landmark' | 'natural';
  description: string;
  distance?: number;
  latitude: number;
  longitude: number;
  image?: string;
  completed?: boolean;
  memoryCount?: number;
  country?: string;
}

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get user's approximate location name using reverse geocoding
export const getLocationName = async (location: GeoLocation): Promise<string> => {
  try {
    // Using a simple approach - in production, you'd use a proper geocoding service
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`
    );
    const data = await response.json();
    return data.city || data.locality || data.principalSubdivision || 'Unknown Location';
  } catch (error) {
    console.error('Failed to get location name:', error);
    return 'Current Location';
  }
};

// Schema for location discovery response
const locationResponseSchema = {
  type: Type.OBJECT,
  properties: {
    locations: {
      type: Type.ARRAY,
      description: "Array of interesting locations near the given coordinates",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Full name of the location" },
          type: { type: Type.STRING, enum: ["monument", "city", "landmark", "natural"], description: "Category of the location" },
          description: { type: Type.STRING, description: "Brief description of what makes this location interesting" },
          latitude: { type: Type.NUMBER, description: "Latitude coordinate" },
          longitude: { type: Type.NUMBER, description: "Longitude coordinate" },
          country: { type: Type.STRING, description: "Country where the location is situated" }
        },
        required: ["name", "type", "description", "latitude", "longitude", "country"]
      }
    }
  },
  required: ["locations"]
};

// Get nearby locations using Gemini AI
export const getNearbyLocations = async (
  userLocation: GeoLocation, 
  radius: number = 200,
  category?: 'monument' | 'city' | 'landmark' | 'natural'
): Promise<LocationSuggestion[]> => {
  try {
    const categoryFilter = category ? ` focusing on ${category}s` : '';
    const prompt = `Find interesting places near coordinates ${userLocation.latitude}, ${userLocation.longitude} within ${radius} kilometers${categoryFilter}. 
    
    Include:
    - Historical monuments and landmarks
    - Famous cities and towns  
    - Natural attractions
    - Cultural sites
    - Tourist destinations
    - Religious and spiritual sites
    
    Provide accurate coordinates and ensure the locations are actually within the specified radius. Include both well-known and lesser-known gems that would make interesting adventure destinations. Be sure to include any major cities, monuments, or landmarks in the region.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: locationResponseSchema,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }
    const data = JSON.parse(response.text);

    return data.locations.map((location: any, index: number) => ({
      id: `location-${index}-${Date.now()}`,
      name: location.name,
      type: location.type,
      description: location.description,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.latitude,
        location.longitude
      ),
      image: getLocationEmoji(location.type),
      completed: false,
      memoryCount: 0
    })).sort((a: LocationSuggestion, b: LocationSuggestion) => (a.distance || 0) - (b.distance || 0));

  } catch (error) {
    console.error('Failed to get nearby locations:', error);
    return [];
  }
};

// Get world monuments using Gemini AI
export const getWorldMonuments = async (): Promise<LocationSuggestion[]> => {
  try {
    const prompt = `List 20 of the world's most famous monuments and landmarks that would make great adventure destinations. Include UNESCO World Heritage sites, iconic buildings, ancient ruins, and famous structures from all continents.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: locationResponseSchema,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }
    const data = JSON.parse(response.text);

    return data.locations.map((location: any, index: number) => ({
      id: `monument-${index}-${Date.now()}`,
      name: location.name,
      type: 'monument' as const,
      description: location.description,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      image: '🏛️',
      completed: false,
      memoryCount: 0
    }));

  } catch (error) {
    console.error('Failed to get world monuments:', error);
    return [];
  }
};

// Get world cities using Gemini AI
export const getWorldCities = async (): Promise<LocationSuggestion[]> => {
  try {
    const prompt = `List 20 of the world's most interesting cities for travelers and adventurers. Include major capitals, cultural centers, historic cities, and unique destinations from all continents that offer rich experiences.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: locationResponseSchema,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }
    const data = JSON.parse(response.text);

    return data.locations.map((location: any, index: number) => ({
      id: `city-${index}-${Date.now()}`,
      name: location.name,
      type: 'city' as const,
      description: location.description,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      image: '🏙️',
      completed: false,
      memoryCount: 0
    }));

  } catch (error) {
    console.error('Failed to get world cities:', error);
    return [];
  }
};

// Helper function to get appropriate emoji for location type
const getLocationEmoji = (type: string): string => {
  switch (type) {
    case 'monument': return '🏛️';
    case 'city': return '🏙️';
    case 'landmark': return '📍';
    case 'natural': return '🌿';
    default: return '📍';
  }
};
