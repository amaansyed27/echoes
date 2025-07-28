import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { getUserProfile, createUserProfile } from './databaseService'
import type { UserProfile } from '../types'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  profile: UserProfile | null
}

class AuthService {
  private listeners: ((authState: AuthState) => void)[] = []
  private currentState: AuthState = {
    user: null,
    session: null,
    loading: true,
    profile: null
  }

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      await this.updateAuthState(session)

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        await this.updateAuthState(session)
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      this.updateAuthState(null)
    }
  }

  private async updateAuthState(session: Session | null) {
    let profile: UserProfile | null = null

    if (session?.user) {
      try {
        // Try to get existing profile
        profile = await getUserProfile(session.user.id)
        
        // Create profile if it doesn't exist
        if (!profile) {
          const defaultProfile = {
            name: session.user.user_metadata?.full_name || 
                  session.user.email?.split('@')[0] || 
                  'Explorer',
            avatar: session.user.user_metadata?.avatar_url || '🗺️',
            interests: ['history', 'culture', 'photography']
          }
          profile = await createUserProfile(session.user.id, defaultProfile)
        }
      } catch (error) {
        console.error('Error handling user profile:', error)
      }
    }

    this.currentState = {
      user: session?.user || null,
      session,
      loading: false,
      profile
    }

    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentState))
  }

  // Public methods
  getCurrentState(): AuthState {
    return this.currentState
  }

  subscribe(listener: (authState: AuthState) => void): () => void {
    this.listeners.push(listener)
    // Call immediately with current state
    listener(this.currentState)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  async signInWithGoogle(): Promise<void> {
    try {
      // Determine the correct redirect URL based on environment
      const redirectTo = window.location.origin === 'http://localhost:5173' || 
                        window.location.origin === 'http://localhost:5174' || 
                        window.location.origin === 'http://localhost:3000'
        ? 'http://localhost:5173'
        : 'https://gems-echoes.vercel.app'

      console.log('Redirecting to:', redirectTo)
      console.log('Current origin:', window.location.origin)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentState.user) {
      throw new Error('No authenticated user')
    }

    try {
      const updatedProfile = { ...this.currentState.profile, ...updates } as UserProfile
      await this.updateUserProfile(this.currentState.user.id, updatedProfile)
      
      this.currentState.profile = updatedProfile
      this.notifyListeners()
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  private async updateUserProfile(userId: string, profile: UserProfile) {
    const { updateUserProfile } = await import('./databaseService')
    return updateUserProfile(userId, profile)
  }

  isAuthenticated(): boolean {
    return !!this.currentState.user
  }

  getUser(): User | null {
    return this.currentState.user
  }

  getProfile(): UserProfile | null {
    return this.currentState.profile
  }

  isLoading(): boolean {
    return this.currentState.loading
  }
}

// Create and export singleton instance
export const authService = new AuthService()

// React hook for using auth in components
export function useAuth() {
  const [authState, setAuthState] = React.useState<AuthState>(authService.getCurrentState())

  React.useEffect(() => {
    const unsubscribe = authService.subscribe(setAuthState)
    return unsubscribe
  }, [])

  return {
    ...authState,
    signInWithGoogle: () => authService.signInWithGoogle(),
    signOut: () => authService.signOut(),
    updateProfile: (updates: Partial<UserProfile>) => authService.updateProfile(updates),
    isAuthenticated: authService.isAuthenticated(),
  }
}

// Import React for the hook
import React from 'react'
