# Supabase Database Setup Instructions

## 1. Run the SQL Setup Script

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query and paste the contents of `database/setup.sql`
4. Run the script to create all tables, indexes, RLS policies, and triggers

## 2. Enable Google OAuth

1. In your Supabase project dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID: Get from Google Cloud Console
   - Client Secret: Get from Google Cloud Console
   - Redirect URLs: Add your domain (e.g., `https://yourdomain.com/**`)

## 3. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure OAuth consent screen
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `https://[your-supabase-project-ref].supabase.co/auth/v1/callback`

## 4. Vercel Environment Variables

Add these environment variables to your Vercel project:

```
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=https://wihjagbtjuzcreprywpm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaGphZ2J0anV6Y3JlcHJ5d3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzYzMzcsImV4cCI6MjA2OTIxMjMzN30.P2gZ5BcPROqFQXO6pOH4ekveB7o84Bwp6dx5xuvIxnI
```

## 5. Test the Setup

1. Deploy to Vercel
2. Test user registration/login
3. Verify data persistence
4. Test all app features

## Database Schema Overview

### Tables Created:
- `user_profiles`: User profile information
- `adventures`: User's travel adventures/stories
- `badges`: User-earned badges
- `achievements`: User achievements and progress
- `memories`: Photos and memories from quests

### Security:
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic profile creation on user signup
- Secure policies for all operations

## Migration Notes

The app will automatically migrate from localStorage to Supabase when users first log in. Existing data will be preserved in localStorage as a backup.
