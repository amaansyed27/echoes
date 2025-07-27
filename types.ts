export enum AppState {
  HOME,
  ADVENTURES,
  ADVENTURE_LOADING,
  PATH_VIEW,
  QUEST_VIEW,
  TRAVEL_GUIDE,
  MEMORIES,
  CHAT,
  PROFILE,
  ACHIEVEMENTS,
  LEADERBOARD
}

export enum QuestType {
  PUZZLE = 'puzzle',
  PHOTO = 'photo',
  NAVIGATION = 'navigation',
  AUDIO_STORY = 'audio_story',
  EXPLORATION = 'exploration'
}

export enum ExploreMode {
  CURRENT_LOCATION = 'current_location',
  CITY_GUIDE = 'city_guide',
  CUSTOM_LOCATION = 'custom_location'
}

export interface Puzzle {
  prompt: string;
  solution: string;
}

export interface Quest {
  title: string;
  description: string;
  narrative: string; // Narrative specific to this quest step
  type: QuestType;
  targetLocationName: string;
  latitude: number;
  longitude: number;
  puzzle?: Puzzle;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  hints?: string[];
  rewards?: Reward[];
}

export interface Reward {
  type: 'points' | 'badge' | 'achievement';
  value: string | number;
  name: string;
  description: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  level: number;
  totalPoints: number;
  completedQuests: number;
  badges: Badge[];
  achievements: Achievement[];
  visitedCities: string[];
  favoriteLocations: string[];
  interests: string[];
  joinDate: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlockedDate?: Date;
  progress: number;
  maxProgress: number;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isVoice?: boolean;
  audioUrl?: string;
}

export interface VoiceInteraction {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  confidence: number;
}

export interface Story {
  id: string;
  title: string;
  introNarrative: string; // The main introduction to the adventure
  destination: {
    name: string;
    latitude: number;
    longitude: number;
  };
  quests: Quest[];
  currentQuestIndex: number;
  completedQuests: CompletedQuest[];
  imageUrl?: string; // URL for the adventure image
}

export interface CompletedQuest {
  quest: Quest;
  userPhoto?: string; // base64 data URL for photo quests
  userAnswer?: string; // user's answer for puzzle quests
  completedDate: Date;
  location: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  };
}

export interface Memory {
  id: string;
  type: 'quest' | 'adventure' | 'photo';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  };
  date: Date;
  photo?: string; // base64 data URL
  questData?: CompletedQuest;
  adventureId?: string;
}

export interface GeoLocation {
    latitude: number;
    longitude: number;
}