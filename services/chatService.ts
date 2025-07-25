import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, UserProfile, GeoLocation } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Enhanced chat service for interactive AI conversations
export const chatWithAI = async (
  message: string, 
  context?: {
    location?: GeoLocation;
    userProfile?: UserProfile;
    currentCity?: string;
    previousMessages?: ChatMessage[];
    questContext?: any;
  }
): Promise<string> => {
  const systemPrompt = `You are Echoes, a mystical AI travel guide and companion. You're knowledgeable, engaging, and have a slightly mystical personality. You help travelers discover the hidden stories and secrets of places around the world.

Current context:
${context?.currentCity ? `- Current city: ${context.currentCity}` : ''}
${context?.location ? `- User location: ${context.location.latitude}, ${context.location.longitude}` : ''}
${context?.userProfile ? `- User: ${context.userProfile.name} (Level ${context.userProfile.level})` : ''}
${context?.questContext ? `- Quest context: ${JSON.stringify(context.questContext)}` : ''}

Guidelines:
- Respond conversationally and personally
- Share interesting historical facts, local legends, or cultural insights
- Ask engaging follow-up questions
- Suggest nearby points of interest
- Be encouraging about their exploration journey
- Keep responses concise but informative (2-3 sentences max for voice)
- Use a slightly mystical, adventurous tone
- If asked about directions or specific locations, provide helpful guidance`;

  const conversationHistory = context?.previousMessages?.slice(-6).map(msg => 
    `${msg.type === 'user' ? 'User' : 'Echoes'}: ${msg.content}`
  ).join('\n') || '';

  const fullPrompt = `${systemPrompt}

Recent conversation:
${conversationHistory}

User message: ${message}

Respond as Echoes:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return response.text?.trim() || "The mystical connection seems disrupted. Could you try asking again?";
  } catch (error) {
    console.error('Chat AI error:', error);
    return "The mystical connection seems disrupted. Could you try asking again?";
  }
};

// Explore current location for suggestions
export const exploreCurrentLocation = async (
  location: GeoLocation,
  userProfile: UserProfile
): Promise<{
  recommendations: Array<{
    name: string;
    description: string;
    distance: string;
    type: string;
    coordinates: [number, number];
  }>;
  funFacts: string[];
}> => {
  const prompt = `Based on location ${location.latitude}, ${location.longitude}, suggest 5-8 interesting places nearby for exploration.

Consider user interests: ${userProfile.interests.join(', ')}
User level: ${userProfile.level}

Respond with a JSON object containing:
- recommendations: array of places with name, description, distance estimate, type, and coordinates as [lat, lng]
- funFacts: array of interesting facts about the area`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response text received');
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Location suggestions error:', error);
    return {
      recommendations: [],
      funFacts: ["Every location has its own unique story waiting to be discovered!"]
    };
  }
};

// Generate location-based suggestions
export const getLocationSuggestions = async (
  location: GeoLocation,
  interests?: string[]
): Promise<{
  recommendations: Array<{
    name: string;
    description: string;
    distance: string;
    type: 'restaurant' | 'attraction' | 'historical' | 'cultural' | 'hidden_gem';
    coordinates: GeoLocation;
  }>;
  funFacts: string[];
}> => {
  const prompt = `Based on the coordinates ${location.latitude}, ${location.longitude}${interests ? ` and interests in ${interests.join(', ')}` : ''}, suggest 3-5 nearby interesting places to visit. Also provide 2-3 fun facts about this area.

Respond with a JSON object containing:
- recommendations: array of places with name, description, distance estimate, type, and coordinates
- funFacts: array of interesting facts about the area`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response text received');
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Location suggestions error:', error);
    return {
      recommendations: [],
      funFacts: ["Every location has its own unique story waiting to be discovered!"]
    };
  }
};

// Generate dynamic quest based on location and user preferences
export const generateDynamicQuest = async (
  location: GeoLocation,
  userProfile: UserProfile,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<any> => {
  const prompt = `Generate a dynamic quest for location ${location.latitude}, ${location.longitude} suitable for user level ${userProfile.level} with ${difficulty} difficulty.

The quest should be engaging, educational, and encourage real-world exploration. Include historical elements, local culture, or hidden gems.

Return JSON with:
- title: engaging quest title
- description: what the user needs to do
- narrative: story context
- type: puzzle, photo, navigation, audio_story, or exploration
- points: reward points (${difficulty === 'easy' ? '50-100' : difficulty === 'medium' ? '100-200' : '200-400'})
- estimatedTime: time in minutes
- hints: optional array of hints
- targetLocationName: specific place name
- latitude/longitude: quest target coordinates (can be same as input or nearby)`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('No response text received');
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Dynamic quest generation error:', error);
    return null;
  }
};
