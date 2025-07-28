# 🔧 Fix Supabase OAuth Redirect Issue

## Problem
OAuth sign-in redirects to `localhost:3000` instead of your production domain `https://gems-echoes.vercel.app`.

## Solution
You need to update your Supabase Auth configuration to include the correct redirect URLs.

## Steps to Fix

### 1. Go to Supabase Dashboard
1. Open [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navigate to your project: `wihjagbtjuzcreprywpm`
3. Go to **Authentication** → **URL Configuration**

### 2. Update Site URL
In the **URL Configuration** section:
- **Site URL**: Change from `http://localhost:3000` to `https://gems-echoes.vercel.app`

### 3. Update Redirect URLs
In the **Redirect URLs** section, add these URLs:
```
https://gems-echoes.vercel.app
https://gems-echoes.vercel.app/
http://localhost:5173
http://localhost:5174
http://localhost:3000
```

### 4. Google OAuth Configuration
Go to **Authentication** → **Providers** → **Google**:
1. Make sure Google OAuth is enabled
2. Verify your Google Client ID and Secret are configured
3. In your **Google Cloud Console** (console.cloud.google.com):
   - Go to APIs & Services → Credentials
   - Edit your OAuth 2.0 Client
   - Add these to **Authorized redirect URIs**:
     ```
     https://wihjagbtjuzcreprywpm.supabase.co/auth/v1/callback
     ```

### 5. Additional Settings
In **Authentication** → **Settings**:
- **Enable email confirmations**: Can be disabled for testing
- **Enable phone confirmations**: Can be disabled for testing
- **Secure email change**: Can be disabled for testing

## Expected Result
After these changes:
- Signing in from `https://gems-echoes.vercel.app` should redirect back to `https://gems-echoes.vercel.app`
- Local development will continue to work
- OAuth flow will complete successfully

## Test the Fix
1. Clear your browser cache/cookies for the domain
2. Go to `https://gems-echoes.vercel.app`
3. Try signing in with Google
4. Should redirect back to your app instead of localhost

## Important Notes
- Changes in Supabase Auth settings take effect immediately
- You may need to wait 1-2 minutes for changes to propagate
- Clear browser cache if you still see the old behavior

---

**After making these changes, your OAuth flow should work correctly!**
