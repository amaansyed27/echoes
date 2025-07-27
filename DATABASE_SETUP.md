# Database Setup Instructions for Echoes App

## Prerequisites
- Supabase project created
- Environment variables configured in .env file

## Step 1: Configure Google OAuth in Supabase

1. Go to your Supabase dashboard
2. Navigate to Authentication → Settings → Auth
3. Scroll down to "Site URL" and set it to your production URL (e.g., `https://your-app.vercel.app`)
4. Scroll down to "Auth Providers" and enable Google
5. Add your Google OAuth credentials:
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Create OAuth 2.0 Client ID if you don't have one
   - Add your Supabase callback URL: `https://[your-project-ref].supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

## Step 2: Run Database Setup SQL

Go to Supabase Dashboard → SQL Editor → New Query and run this script:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
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
CREATE TABLE IF NOT EXISTS adventures (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    destination_name TEXT NOT NULL,
    destination_country TEXT NOT NULL,
    destination_latitude REAL NOT NULL,
    destination_longitude REAL NOT NULL,
    current_quest_index INTEGER DEFAULT 0,
    quests JSONB NOT NULL DEFAULT '[]',
    completed_quests JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
    earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0,
    max_progress INTEGER NOT NULL,
    unlocked_date TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    adventure_id UUID REFERENCES adventures(id) ON DELETE CASCADE,
    quest_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    photo_url TEXT NULL,
    audio_url TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_adventures_user_id ON adventures(user_id);
CREATE INDEX IF NOT EXISTS idx_adventures_created_at ON adventures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_adventure_id ON memories(adventure_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);

-- Enable Row Level Security policies

-- User profiles: Users can only access their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Adventures: Users can only access their own adventures
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own adventures" ON adventures
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own adventures" ON adventures
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own adventures" ON adventures
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own adventures" ON adventures
    FOR DELETE USING (auth.uid() = user_id);

-- Badges: Users can only access their own badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own badges" ON badges
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements: Users can only access their own achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON achievements
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON achievements
    FOR UPDATE USING (auth.uid() = user_id);

-- Memories: Users can only access their own memories
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memories" ON memories
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON memories
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON memories
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON memories
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, name, avatar)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '🗺️')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_adventures_updated_at
    BEFORE UPDATE ON adventures
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at
    BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
```

## Step 3: Test the Setup

1. Deploy your app to Vercel
2. Try signing in with Google
3. Check the `user_profiles` table in Supabase to see if a profile was created

## Step 4: Configure Storage (Optional)

If you want to store user photos and audio files:

1. Go to Storage in Supabase dashboard
2. Create a new bucket called "user-content"
3. Set it to public or create appropriate policies
4. Update the app to upload files to this bucket

## What's Been Implemented

✅ **Authentication System**
- Google OAuth integration
- User session management
- Automatic profile creation

✅ **Database Schema**
- User profiles with levels, points, badges
- Adventures with quests and progress tracking
- Memories with location and media support
- Row Level Security for data protection

✅ **Data Persistence**
- All user data stored in Supabase
- Real-time sync across devices
- Offline-first with sync when online

✅ **Security**
- Row Level Security policies
- User can only access their own data
- Secure API key management

## Environment Variables Required

Make sure your `.env` file contains:
```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=https://wihjagbtjuzcreprywpm.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Next Steps

1. Run the SQL setup script in Supabase
2. Configure Google OAuth
3. Deploy to Vercel
4. Test authentication flow
5. Create your first adventure!
