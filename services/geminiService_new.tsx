import { GoogleGenAI, Type } from "@google/genai";
import type { Story, Quest } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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


export const generateTravelGuide = async (location: string): Promise<Omit<Story, 'id' | 'currentQuestIndex' | 'completedQuests'>> => {
    const prompt = `You are 'Echoes', a mystical AI travel guide. Create an adventurous and historical story for the given location: "${location}". The story should unfold in pieces.
1.  Generate a main 'introNarrative' to set the stage for the entire journey.
2.  Generate a series of 2-3 interactive 'quests'.
3.  For EACH quest, provide a unique 'narrative' segment that continues the story and is revealed only when the user starts that specific quest.
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
    context?: string
): Promise<string> => {
    try {
        const contextualPrompt = context 
            ? `Context: ${context}\n\nUser: ${userMessage}\n\nProvide a helpful, encouraging response as a travel guide assistant. Keep responses under 50 words and be supportive.`
            : `User: ${userMessage}\n\nProvide a helpful, encouraging response as a travel guide assistant. Keep responses under 50 words and be supportive.`;

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
