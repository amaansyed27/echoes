# 🚨 URGENT: Database Fix Required

## Problem
Adventures, memories, and user data are not being saved because:
1. Row Level Security (RLS) is blocking all operations
2. ID format mismatch between app and database
3. Missing database policies

## Immediate Fix - Run This SQL in Supabase

Go to **Supabase Dashboard → SQL Editor → New Query** and run:

```sql
-- Enable RLS and create policies for all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adventures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Adventures Policies
CREATE POLICY "Users can view own adventures" ON public.adventures
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own adventures" ON public.adventures
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own adventures" ON public.adventures
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own adventures" ON public.adventures
    FOR DELETE USING (auth.uid() = user_id);

-- Memories Policies
CREATE POLICY "Users can view own memories" ON public.memories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories" ON public.memories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories" ON public.memories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories" ON public.memories
    FOR DELETE USING (auth.uid() = user_id);

-- Badges Policies
CREATE POLICY "Users can view own badges" ON public.badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges" ON public.badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Users can view own achievements" ON public.achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON public.achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements" ON public.achievements
    FOR UPDATE USING (auth.uid() = user_id);
```

**After running this SQL, your data will save properly!**
