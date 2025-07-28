# 🚀 Quick Database Setup for Echoes

## URGENT: Fix Data Persistence Issue

The app is not saving data because the database tables don't exist yet. Follow these steps:

### Step 1: Execute Database Schema (REQUIRED)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `wihjagbtjuzcreprywpm`
3. Go to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Copy and paste this SQL script:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
CREATE TABLE IF NOT EXISTS memories (
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
CREATE TABLE IF NOT EXISTS badges (
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
CREATE TABLE IF NOT EXISTS achievements (
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

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only see their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own adventures" ON adventures
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own memories" ON memories
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own badges" ON badges
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own achievements" ON achievements
    FOR ALL USING (auth.uid() = user_id);
```

6. Click **"Run"** to execute the script

### Step 2: Fix OAuth Redirect (REQUIRED)

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://gems-echoes.vercel.app`
3. Add **Redirect URLs**:
   ```
   https://gems-echoes.vercel.app
   https://gems-echoes.vercel.app/
   http://localhost:5173
   http://localhost:5174
   ```

### Step 3: Test the Fix

1. Go to `https://gems-echoes.vercel.app`
2. Sign in with Google (should now redirect correctly)
3. Create an adventure or memory
4. Refresh the page - data should persist

## Expected Result

- ✅ OAuth redirects correctly to your app
- ✅ Adventures and memories persist after refresh
- ✅ User profile is saved and loaded from database
- ✅ All data is secured with Row Level Security

## If Still Not Working

Check browser console for errors:
1. Press F12 in browser
2. Go to Console tab
3. Look for database-related errors
4. Share any error messages

---

**This will fix the data persistence issue immediately!**
