import { supabase } from '../lib/supabase'
import type { UserProfile, Story, Badge, Achievement, Memory } from '../types'

// User Profile operations
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return null
      }
      throw error
    }

    return {
      name: data.name,
      avatar: data.avatar,
      level: data.level,
      totalPoints: data.total_points,
      completedQuests: data.completed_quests,
      badges: [], // Will be fetched separately
      achievements: [], // Will be fetched separately
      visitedCities: data.visited_cities || [],
      favoriteLocations: data.favorite_locations || [],
      interests: data.interests || [],
      joinDate: new Date(data.join_date)
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

export const createUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        name: profile.name || 'Explorer',
        avatar: profile.avatar || '🗺️',
        level: profile.level || 1,
        total_points: profile.totalPoints || 0,
        completed_quests: profile.completedQuests || 0,
        visited_cities: profile.visitedCities || [],
        favorite_locations: profile.favoriteLocations || [],
        interests: profile.interests || ['history', 'culture', 'photography'],
        join_date: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return {
      name: data.name,
      avatar: data.avatar,
      level: data.level,
      totalPoints: data.total_points,
      completedQuests: data.completed_quests,
      badges: [],
      achievements: [],
      visitedCities: data.visited_cities || [],
      favoriteLocations: data.favorite_locations || [],
      interests: data.interests || [],
      joinDate: new Date(data.join_date)
    }
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        name: profile.name,
        avatar: profile.avatar,
        level: profile.level,
        total_points: profile.totalPoints,
        completed_quests: profile.completedQuests,
        visited_cities: profile.visitedCities,
        favorite_locations: profile.favoriteLocations,
        interests: profile.interests,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Adventure operations
export const getUserAdventures = async (userId: string): Promise<Story[]> => {
  try {
    const { data, error } = await supabase
      .from('adventures')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(adventure => ({
      id: adventure.id,
      title: adventure.title,
      introNarrative: adventure.description,
      destination: {
        name: adventure.destination_name,
        latitude: adventure.destination_latitude,
        longitude: adventure.destination_longitude
      },
      currentQuestIndex: adventure.current_quest_index,
      quests: adventure.quests,
      completedQuests: adventure.completed_quests || []
    }))
  } catch (error) {
    console.error('Error fetching user adventures:', error)
    throw error
  }
}

export const saveAdventure = async (userId: string, adventure: Story): Promise<void> => {
  try {
    const { error } = await supabase
      .from('adventures')
      .upsert({
        id: adventure.id,
        user_id: userId,
        title: adventure.title,
        description: adventure.introNarrative,
        destination_name: adventure.destination.name,
        destination_country: 'Unknown', // We'll need to add this to the Story type or extract from destination name
        destination_latitude: adventure.destination.latitude,
        destination_longitude: adventure.destination.longitude,
        current_quest_index: adventure.currentQuestIndex,
        quests: adventure.quests,
        completed_quests: adventure.completedQuests,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving adventure:', error)
    throw error
  }
}

// Badge operations
export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_date', { ascending: false })

    if (error) throw error

    return data.map(badge => ({
      id: badge.badge_id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      rarity: badge.rarity,
      earnedDate: new Date(badge.earned_date)
    }))
  } catch (error) {
    console.error('Error fetching user badges:', error)
    throw error
  }
}

export const addUserBadge = async (userId: string, badge: Badge): Promise<void> => {
  try {
    const { error } = await supabase
      .from('badges')
      .insert({
        user_id: userId,
        badge_id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        earned_date: (badge.earnedDate || new Date()).toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error adding user badge:', error)
    throw error
  }
}

// Achievement operations
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(achievement => ({
      id: achievement.achievement_id,
      name: achievement.name,
      description: achievement.description,
      points: achievement.points,
      progress: achievement.progress,
      maxProgress: achievement.max_progress,
      unlockedDate: achievement.unlocked_date ? new Date(achievement.unlocked_date) : undefined
    }))
  } catch (error) {
    console.error('Error fetching user achievements:', error)
    throw error
  }
}

export const updateUserAchievement = async (userId: string, achievement: Achievement): Promise<void> => {
  try {
    const { error } = await supabase
      .from('achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        points: achievement.points,
        progress: achievement.progress,
        max_progress: achievement.maxProgress,
        unlocked_date: achievement.unlockedDate?.toISOString() || null,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  } catch (error) {
    console.error('Error updating user achievement:', error)
    throw error
  }
}

// Memory operations
export const getUserMemories = async (userId: string): Promise<Memory[]> => {
  try {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(memory => ({
      id: memory.id,
      type: 'quest' as const,
      title: memory.title,
      description: memory.description,
      location: {
        name: memory.location_name,
        latitude: memory.latitude,
        longitude: memory.longitude,
        country: 'Unknown' // We'll need to store this properly
      },
      date: new Date(memory.created_at),
      photo: memory.photo_url || undefined,
      adventureId: memory.adventure_id
    }))
  } catch (error) {
    console.error('Error fetching user memories:', error)
    throw error
  }
}

export const saveMemory = async (userId: string, memory: Omit<Memory, 'id'>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('memories')
      .insert({
        user_id: userId,
        adventure_id: memory.adventureId || '',
        quest_id: '', // We'll need to add this to Memory type
        title: memory.title,
        description: memory.description,
        location_name: memory.location.name,
        latitude: memory.location.latitude,
        longitude: memory.location.longitude,
        photo_url: memory.photo || null,
        audio_url: null // We'll need to add audio support
      })

    if (error) throw error
  } catch (error) {
    console.error('Error saving memory:', error)
    throw error
  }
}
