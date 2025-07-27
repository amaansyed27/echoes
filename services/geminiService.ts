import { GoogleGenAI, Type } from "@google/genai";
import type { Story, Quest, GeoLocation, UserProfile } from '../types';
import { geocodeLocation } from './geocodingService';

// Travel Guide specific types
export interface TripStop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'restaurant' | 'attraction' | 'activity' | 'cultural' | 'historical' | 'shopping' | 'scenic';
  estimatedTime: number; // minutes
  notes?: string;
  visited: boolean;
  adventureId?: string;
  audioGuideUrl?: string;
  historicalInfo?: string;
  cameraFeatures?: string[];
}

export interface TripPlan {
  id: string;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  stops: TripStop[];
  status: 'planning' | 'active' | 'completed';
  preferences: {
    mood: 'relaxed' | 'adventurous' | 'cultural' | 'romantic' | 'family' | 'solo';
    pace: 'slow' | 'moderate' | 'fast';
    interests: string[];
    budget: 'low' | 'medium' | 'high';
  };
}

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Vision analysis function using Gemini's vision capabilities
export const analyzeImageWithGemini = async (imageData: string, location?: GeoLocation): Promise<string> => {
  try {
    const locationContext = location 
      ? `The image was taken at coordinates: ${location.latitude}, ${location.longitude}. ` 
      : '';

    const prompt = `${locationContext}Analyze this image as a travel guide. Describe what you see, identify any landmarks, architectural features, cultural elements, or points of interest. If this appears to be a tourist destination, provide historical context, interesting facts, and travel tips. Focus on elements that would be valuable for a traveler exploring this location.`;

    // Convert base64 image data to the format expected by the API
    const imagePart = {
      inlineData: {
        data: imageData.split(',')[1], // Remove data:image/jpeg;base64, prefix
        mimeType: "image/jpeg"
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            imagePart
          ]
        }
      ]
    });

    return response.text || 'Unable to analyze the image at the moment.';
  } catch (error) {
    console.error('Vision analysis error:', error);
    return 'Unable to analyze the image at the moment. Please try again.';
  }
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A captivating, adventurous title for the story about the location." },
        introNarrative: { type: Type.STRING, description: "A detailed, engaging introductory story about the location, written in a narrative, historical, or exploratory style. This sets the stage for the adventure. Should be at least 150 words." },
        destination: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The full name of the primary location." },
                latitude: { type: Type.NUMBER, description: "The latitude of the primary location." },
                longitude: { type: Type.NUMBER, description: "The longitude of the primary location." }
            },
            required: ["name", "latitude", "longitude"]
        },
        quests: {
            type: Type.ARRAY,
            description: "An array of 2-3 quests for the user to complete.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A short, intriguing title for the quest." },
                    description: { type: Type.STRING, description: "A clear description of the quest objective." },
                    narrative: { type: Type.STRING, description: "A short narrative segment that introduces this specific quest, continuing the main story. This part of the story is revealed when the user starts this quest." },
                    type: { type: Type.STRING, enum: ["puzzle", "photo"], description: "The type of quest." },
                    targetLocationName: { type: Type.STRING, description: "The name of the specific place for this quest." },
                    latitude: { type: Type.NUMBER, description: "The latitude for the quest's location." },
                    longitude: { type: Type.NUMBER, description: "The longitude for the quest's location." },
                    puzzle: {
                        type: Type.OBJECT,
                        description: "Required if type is 'puzzle'.",
                        properties: {
                            prompt: { type: Type.STRING, description: "The riddle or puzzle prompt." },
                            solution: { type: Type.STRING, description: "The answer to the puzzle. Should be a single word or a short phrase." }
                        },
                         required: ["prompt", "solution"]
                    }
                },
                required: ["title", "description", "narrative", "type", "targetLocationName", "latitude", "longitude"]
            }
        }
    },
    required: ["title", "introNarrative", "destination", "quests"]
};


const getLanguageName = (code: string): string => {
    const languageNames: Record<string, string> = {
        'en': 'English',
        'hi': 'Hindi',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'ja': 'Japanese',
        'ko': 'Korean',
        'pt': 'Portuguese',
        'ar': 'Arabic',
        'zh': 'Chinese'
    };
    return languageNames[code] || 'English';
};

export const generateTravelGuide = async (location: string, language: string = 'en'): Promise<Omit<Story, 'id' | 'currentQuestIndex' | 'completedQuests'>> => {
    const languageInstruction = language === 'en' 
        ? '' 
        : `Generate all content in ${getLanguageName(language)} language. Use native language for all names, descriptions, narratives, and quest content.`;
    
    const prompt = `You are 'Echoes', a mystical AI travel guide. Create an adventurous and historical story for the given location: "${location}". ${languageInstruction}
    
1. Generate a main 'introNarrative' to set the stage for the entire journey.
2. Generate a series of 2-3 interactive 'quests'.
3. For EACH quest, provide a unique 'narrative' segment that continues the story and is revealed only when the user starts that specific quest.
The entire response must be a single, valid JSON object that conforms to the provided schema. Do not include any text outside of the JSON object. Ensure puzzle solutions are concise.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    try {
        const jsonText = response.text?.trim();
        if (!jsonText) {
            throw new Error("Gemini response was empty or undefined.");
        }
        const storyData = JSON.parse(jsonText);
        // The service returns the core data, the App component adds the stateful parts (id, progress)
        return storyData as Omit<Story, 'id' | 'currentQuestIndex' | 'completedQuests'>;
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text);
        throw new Error("The ancient scrolls are unreadable. Failed to generate a valid story guide.");
    }
};

export const generateChatResponse = async (
    userMessage: string,
    context?: string,
    language: string = 'en'
): Promise<string> => {
    try {
        const languageInstruction = language === 'en' 
            ? '' 
            : `Respond in ${getLanguageName(language)} language. Use natural, conversational ${getLanguageName(language)}.`;
        
        const contextualPrompt = context 
            ? `Context: ${context}\n\nUser: ${userMessage}\n\n${languageInstruction} Provide a helpful, encouraging response as a travel guide assistant. Keep responses under 50 words and be supportive.`
            : `User: ${userMessage}\n\n${languageInstruction} Provide a helpful, encouraging response as a travel guide assistant. Keep responses under 50 words and be supportive.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contextualPrompt,
        });

        return response.text?.trim() || "I'm here to help! What would you like to know?";
    } catch (error) {
        console.error("Chat response error:", error);
        return "I'm having trouble right now, but I'm here to help you on your journey!";
    }
};

// Generate AI-powered trip plan with stops
export const generateTripPlan = async (
    destination: string,
    preferences: {
        mood: 'relaxed' | 'adventurous' | 'cultural' | 'romantic' | 'family' | 'solo';
        pace: 'slow' | 'moderate' | 'fast';
        interests: string[];
        budget: 'low' | 'medium' | 'high';
        duration: number; // days
    },
    userLocation?: { latitude: number; longitude: number },
    language: string = 'en'
): Promise<Omit<TripPlan, 'id' | 'startDate' | 'endDate' | 'status'>> => {
    const languageInstruction = language === 'en' 
        ? '' 
        : `Respond in ${getLanguageName(language)} language. Provide names and descriptions in ${getLanguageName(language)}.`;

    const prompt = `Generate a detailed trip plan for ${destination} with the following preferences:
- Travel mood: ${preferences.mood}
- Pace: ${preferences.pace}
- Interests: ${preferences.interests.join(', ')}
- Budget: ${preferences.budget}
- Duration: ${preferences.duration} days
${userLocation ? `- Starting from: ${userLocation.latitude}, ${userLocation.longitude}` : ''}

${languageInstruction}

IMPORTANT: Focus ONLY on locations/attractions worth visiting. Include:
- Tourist attractions and landmarks
- Museums and cultural sites
- Parks and natural locations
- Restaurants and local food experiences
- Shopping areas and markets
- Scenic viewpoints and photo spots

DO NOT include hotels, transportation, or accommodation. Only suggest places to visit and experience.

Each location should have:
- Real, accurate coordinates for the specific location
- Estimated time needed to visit/experience
- Historical/cultural information where relevant
- Audio guide content suggestions
- Camera-recognizable features

Respond with JSON containing:
- name: trip name
- destination: destination city/region  
- stops: array of detailed locations/attractions with all required fields

Example location structure:
{
  "name": "Eiffel Tower",
  "address": "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
  "latitude": 48.8584,
  "longitude": 2.2945,
  "type": "attraction",
  "estimatedTime": 120,
  "notes": "Iconic iron lattice tower, best visited during sunset",
  "historicalInfo": "Built for 1889 World's Fair, designed by Gustave Eiffel",
  "cameraFeatures": ["Iron lattice structure", "Tower silhouette", "City views"],
  "audioGuideUrl": ""
}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const responseText = response.text?.trim();
        if (!responseText) {
            throw new Error('No response text received');
        }

        const tripData = JSON.parse(responseText);
        
        // Add IDs and ensure proper structure, with geocoding fallback
        const processedStops: TripStop[] = await Promise.all(
            tripData.stops.map(async (stop: any, index: number) => {
                let lat = stop.latitude || 0;
                let lng = stop.longitude || 0;
                let formattedAddress = stop.address || '';

                // If coordinates are missing or invalid, try geocoding
                if (!lat || !lng || (lat === 0 && lng === 0)) {
                    try {
                        const geocoded = await geocodeLocation(stop.name, destination);
                        if (geocoded) {
                            lat = geocoded.latitude;
                            lng = geocoded.longitude;
                            formattedAddress = geocoded.formattedAddress;
                        }
                    } catch (error) {
                        console.warn(`Failed to geocode ${stop.name}:`, error);
                    }
                }

                return {
                    id: `stop_${Date.now()}_${index}`,
                    name: stop.name || `Stop ${index + 1}`,
                    address: formattedAddress,
                    latitude: lat,
                    longitude: lng,
                    type: stop.type || 'attraction',
                    estimatedTime: stop.estimatedTime || 60,
                    notes: stop.notes || '',
                    visited: false,
                    historicalInfo: stop.historicalInfo || '',
                    cameraFeatures: stop.cameraFeatures || [],
                    audioGuideUrl: stop.audioGuideUrl || ''
                };
            })
        );

        return {
            name: tripData.name || `Trip to ${destination}`,
            destination,
            stops: processedStops,
            preferences
        };
    } catch (error) {
        console.error('Trip plan generation error:', error);
        throw new Error('Failed to generate trip plan. Please try again.');
    }
};

// Generate location-based travel recommendations
export const getLocationRecommendations = async (
    location: { latitude: number; longitude: number },
    userPreferences?: {
        interests?: string[];
        mood?: string;
        budget?: string;
    },
    language: string = 'en'
): Promise<{
    recommendations: Array<{
        name: string;
        description: string;
        distance: string;
        type: 'restaurant' | 'attraction' | 'historical' | 'cultural' | 'hidden_gem';
        coordinates: { latitude: number; longitude: number };
        historicalInfo?: string;
    }>;
    funFacts: string[];
}> => {
    const languageInstruction = language === 'en' 
        ? '' 
        : `Respond in ${getLanguageName(language)} language. Provide all content in ${getLanguageName(language)}.`;

    const prompt = `Based on location ${location.latitude}, ${location.longitude}${
        userPreferences?.interests ? ` and interests in ${userPreferences.interests.join(', ')}` : ''
    }${userPreferences?.mood ? ` with ${userPreferences.mood} mood` : ''}, suggest 5-7 nearby interesting places to visit.

${languageInstruction}

Include a mix of restaurants, attractions, historical sites, and hidden gems. Also provide 3-4 fun facts about this area.

Respond with JSON containing:
- recommendations: array of places with name, description, distance estimate, type, coordinates, and historical info
- funFacts: array of interesting facts about the area`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const responseText = response.text?.trim();
        if (!responseText) {
            throw new Error('No response text received');
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error('Location recommendations error:', error);
        return {
            recommendations: [],
            funFacts: ["Every location has its own unique story waiting to be discovered!"]
        };
    }
};

// Generate historical context for camera recognition
export const getCameraRecognitionContext = async (
    location: { latitude: number; longitude: number },
    recognizedObjects: string[],
    language: string = 'en'
): Promise<string> => {
    const languageInstruction = language === 'en' 
        ? '' 
        : `Respond in ${getLanguageName(language)} language.`;

    const prompt = `At location ${location.latitude}, ${location.longitude}, the camera has recognized: ${recognizedObjects.join(', ')}.

${languageInstruction}

Provide fascinating historical, architectural, or cultural context about these features. Include:
- Historical period and significance
- Architectural style and elements
- Cultural importance
- Interesting stories or legends

Keep response engaging and informative (100-150 words).`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text?.trim() || "These architectural features tell the story of this location's rich history and cultural heritage.";
    } catch (error) {
        console.error('Camera recognition context error:', error);
        return "These features reveal the fascinating story of this place's heritage.";
    }
};

// Generate audio guide content
export const generateAudioGuideContent = async (
    locationName: string,
    coordinates: { latitude: number; longitude: number },
    language: string = 'en'
): Promise<{
    title: string;
    content: string;
    duration: number; // estimated minutes
    highlights: string[];
}> => {
    const languageInstruction = language === 'en' 
        ? '' 
        : `Respond in ${getLanguageName(language)} language. Create museum-quality narration in ${getLanguageName(language)}.`;

    const prompt = `Create museum-quality audio guide content for ${locationName} at coordinates ${coordinates.latitude}, ${coordinates.longitude}.

${languageInstruction}

Include:
- Engaging historical narrative
- Cultural significance
- Architectural details
- Local legends or stories
- Visitor experience tips

Respond with JSON containing:
- title: engaging title for the audio guide
- content: narration script (museum-quality, 200-300 words)
- duration: estimated listening time in minutes
- highlights: array of key points to emphasize`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });

        const responseText = response.text?.trim();
        if (!responseText) {
            throw new Error('No response text received');
        }

        return JSON.parse(responseText);
    } catch (error) {
        console.error('Audio guide generation error:', error);
        return {
            title: `Discover ${locationName}`,
            content: `Welcome to ${locationName}. This remarkable location has witnessed centuries of history and continues to captivate visitors with its unique character and cultural significance.`,
            duration: 2,
            highlights: ['Historical significance', 'Cultural heritage', 'Architectural features']
        };
    }
};
