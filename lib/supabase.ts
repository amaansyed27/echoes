import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for type safety
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          avatar: string
          level: number
          total_points: number
          completed_quests: number
          visited_cities: string[]
          favorite_locations: string[]
          interests: string[]
          join_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          avatar?: string
          level?: number
          total_points?: number
          completed_quests?: number
          visited_cities?: string[]
          favorite_locations?: string[]
          interests?: string[]
          join_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          avatar?: string
          level?: number
          total_points?: number
          completed_quests?: number
          visited_cities?: string[]
          favorite_locations?: string[]
          interests?: string[]
          join_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      adventures: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          destination_name: string
          destination_country: string
          destination_latitude: number
          destination_longitude: number
          current_quest_index: number
          quests: any[]
          completed_quests: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          destination_name: string
          destination_country: string
          destination_latitude: number
          destination_longitude: number
          current_quest_index?: number
          quests: any[]
          completed_quests?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          destination_name?: string
          destination_country?: string
          destination_latitude?: number
          destination_longitude?: number
          current_quest_index?: number
          quests?: any[]
          completed_quests?: any[]
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          name: string
          description: string
          icon: string
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          earned_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          name: string
          description: string
          icon: string
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          earned_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          name?: string
          description?: string
          icon?: string
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
          earned_date?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          name: string
          description: string
          points: number
          progress: number
          max_progress: number
          unlocked_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          name: string
          description: string
          points: number
          progress?: number
          max_progress: number
          unlocked_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          name?: string
          description?: string
          points?: number
          progress?: number
          max_progress?: number
          unlocked_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          adventure_id: string
          quest_id: string
          title: string
          description: string
          location_name: string
          latitude: number
          longitude: number
          photo_url: string | null
          audio_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          adventure_id: string
          quest_id: string
          title: string
          description: string
          location_name: string
          latitude: number
          longitude: number
          photo_url?: string | null
          audio_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          adventure_id?: string
          quest_id?: string
          title?: string
          description?: string
          location_name?: string
          latitude?: number
          longitude?: number
          photo_url?: string | null
          audio_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
