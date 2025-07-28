-- ============================================================================
-- COMPLETE DATABASE RESET AND SETUP FOR ECHOES
-- ============================================================================
-- Run this entire script in Supabase Dashboard → SQL Editor → New Query
-- This will completely reset and recreate your database with proper setup

-- ============================================================================
-- STEP 1: CLEAN SLATE - Drop Everything
-- ============================================================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can only see their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can only see their own adventures" ON adventures;
DROP POLICY IF EXISTS "Users can only see their own memories" ON memories;
DROP POLICY IF EXISTS "Users can only see their own badges" ON badges;
DROP POLICY IF EXISTS "Users can only see their own achievements" ON achievements;

DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view own adventures" ON adventures;
DROP POLICY IF EXISTS "Users can insert own adventures" ON adventures;
DROP POLICY IF EXISTS "Users can update own adventures" ON adventures;
DROP POLICY IF EXISTS "Users can delete own adventures" ON adventures;

DROP POLICY IF EXISTS "Users can view own memories" ON memories;
DROP POLICY IF EXISTS "Users can insert own memories" ON memories;
DROP POLICY IF EXISTS "Users can update own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON memories;

DROP POLICY IF EXISTS "Users can view own badges" ON badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON badges;

DROP POLICY IF EXISTS "Users can view own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON achievements;
DROP POLICY IF EXISTS "Users can update own achievements" ON achievements;

-- Drop all tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS memories CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS adventures CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- ============================================================================
-- STEP 2: ENABLE EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 3: CREATE FRESH TABLES
-- ============================================================================

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT 'Explorer',
    avatar TEXT DEFAULT '🗺️',
    level INTEGER DEFAULT 1,
    total_points INTEGER DEFAULT 0,
    completed_quests INTEGER DEFAULT 0,
    visited_cities TEXT[] DEFAULT '{}',
    favorite_locations TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{"history", "culture", "photography"}',
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create adventures table
CREATE TABLE adventures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    city TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    difficulty TEXT DEFAULT 'easy',
    estimated_time TEXT DEFAULT '1 hour',
    tags TEXT[] DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memories table
CREATE TABLE memories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    location TEXT,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    category TEXT DEFAULT 'exploration',
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    target INTEGER DEFAULT 1,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: CREATE COMPREHENSIVE RLS POLICIES
-- ============================================================================

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Adventures Policies
CREATE POLICY "Users can view own adventures" ON adventures
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own adventures" ON adventures
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own adventures" ON adventures
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own adventures" ON adventures
    FOR DELETE USING (auth.uid() = user_id);

-- Memories Policies
CREATE POLICY "Users can view own memories" ON memories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON memories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON memories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON memories
    FOR DELETE USING (auth.uid() = user_id);

-- Badges Policies
CREATE POLICY "Users can view own badges" ON badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges" ON badges
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own badges" ON badges
    FOR DELETE USING (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Users can view own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON achievements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievements" ON achievements
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: CREATE HELPFUL FUNCTIONS (OPTIONAL)
-- ============================================================================

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, name, avatar)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Explorer'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '🗺️')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- STEP 7: VERIFY SETUP
-- ============================================================================

-- Check if all tables were created successfully
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check if RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

-- If you see this comment, the script completed successfully!
-- Your database is now completely reset and ready to use.
-- 
-- Next steps:
-- 1. Test authentication in your app
-- 2. Try creating an adventure
-- 3. Check if data persists after refresh
-- 
-- All data will now be properly saved and secured with RLS policies!
