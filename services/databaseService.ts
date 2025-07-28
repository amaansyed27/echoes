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
    console.log('Fetching adventures for user:', userId);
    
    const { data, error } = await supabase
      .from('adventures')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching adventures:', error);
      throw error;
    }

    console.log('Raw adventures from database:', data);

    return data.map(adventure => ({
      id: adventure.id,
      title: adventure.title,
      introNarrative: adventure.description || '',
      destination: {
        name: adventure.city,
        latitude: 0, // Default values since not stored in simple schema
        longitude: 0
      },
      currentQuestIndex: 0, // Default values since not stored in simple schema
      quests: [], // Default empty since not stored in simple schema
      completedQuests: [] // Default empty since not stored in simple schema
    }));
  } catch (error) {
    console.error('Error fetching user adventures:', error);
    throw error;
  }
}

export const saveAdventure = async (userId: string, adventure: Story): Promise<void> => {
  try {
    console.log('Saving adventure:', { userId, adventure });
    
    // Check if adventure already exists (match by title and city)
    const { data: existingAdventure } = await supabase
      .from('adventures')
      .select('id')
      .eq('user_id', userId)
      .eq('title', adventure.title)
      .eq('city', adventure.destination.name)
      .single()

    const adventureData = {
      user_id: userId,
      title: adventure.title,
      description: adventure.introNarrative || '',
      city: adventure.destination.name,
      points: 0, // Default points
      difficulty: 'easy', // Default difficulty
      estimated_time: '1 hour', // Default time
      tags: [], // Default empty tags
      updated_at: new Date().toISOString()
    };

    if (existingAdventure) {
      console.log('Updating existing adventure:', existingAdventure.id);
      // Update existing adventure
      const { error } = await supabase
        .from('adventures')
        .update(adventureData)
        .eq('id', existingAdventure.id)

      if (error) {
        console.error('Error updating adventure:', error);
        throw error;
      }
    } else {
      console.log('Creating new adventure');
      // Insert new adventure (let database generate UUID)
      const { data, error } = await supabase
        .from('adventures')
        .insert(adventureData)
        .select()

      if (error) {
        console.error('Error inserting adventure:', error);
        throw error;
      }
      
      console.log('Adventure saved successfully:', data);
    }
  } catch (error) {
    console.error('Error saving adventure:', error);
    throw error;
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
    console.log('Fetching memories for user:', userId);
    
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('captured_at', { ascending: false })

    if (error) {
      console.error('Error fetching memories:', error);
      throw error;
    }

    console.log('Raw memories from database:', data);

    return data.map(memory => ({
      id: memory.id,
      type: 'quest' as const,
      title: memory.title,
      description: memory.description || '',
      location: {
        latitude: 0, // Default since not stored in simple schema
        longitude: 0, // Default since not stored in simple schema
        name: memory.location || 'Unknown',
        country: 'Unknown'
      },
      date: new Date(memory.captured_at),
      photo: memory.image,
      adventureId: memory.adventure_id
    }));
  } catch (error) {
    console.error('Error fetching user memories:', error);
    throw error;
  }
}

export const saveMemory = async (userId: string, memory: Omit<Memory, 'id'>): Promise<void> => {
  try {
    console.log('Saving memory:', { userId, memory });
    
    const { data, error } = await supabase
      .from('memories')
      .insert({
        user_id: userId,
        adventure_id: memory.adventureId || null,
        title: memory.title,
        description: memory.description,
        location: memory.location.name,
        image: memory.photo || null,
        captured_at: new Date(memory.date).toISOString()
      })
      .select()

    if (error) {
      console.error('Error saving memory:', error);
      throw error;
    }
    
    console.log('Memory saved successfully:', data);
  } catch (error) {
    console.error('Error saving memory:', error);
    throw error;
  }
}
