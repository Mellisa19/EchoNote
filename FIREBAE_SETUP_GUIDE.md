# Firebase Google OAuth Setup Guide

## 🚨 Google OAuth Not Working? Follow These Steps:

### 1. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `echonote-bd009`
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** and enable it
5. Make sure you have a **Web Client ID** configured

### 2. Authorized Domains

In the Firebase Authentication settings, make sure these domains are added:
- `localhost:3000` (for development)
- `echonote-bd009.firebaseapp.com` (for production)
- Your actual domain when deployed

### 3. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID for Web Application
5. Make sure the authorized JavaScript origins include:
   - `http://localhost:3000`
   - `https://localhost:3000`

### 4. Browser Settings

Make sure popups are allowed for `localhost:3000`:
- Chrome: Click the lock icon in address bar → Site settings → Popups → Allow
- Firefox: Click the lock icon → Permissions → Block pop-ups → Allow

### 5. Test the Fix

After configuring Firebase:
1. Restart your development server
2. Try signing in with Google again
3. Check the browser console for specific error messages

## 🔧 Debugging Steps

If it still doesn't work, check the browser console (F12) for these specific errors:

- `auth/unauthorized-domain` → Add domain to Firebase authorized domains
- `auth/popup-blocked` → Allow popups in browser settings
- `auth/api-key-not-allowed` → Check API key restrictions
- Network errors → Check internet connection and firewall

## 📱 Alternative Method

If popup method doesn't work, the app will automatically try the redirect method.

## 🆘 Still Having Issues?

1. Clear browser cache and cookies
2. Try incognito/private mode
3. Check if any browser extensions are blocking the popup
4. Ensure you're using `http://localhost:3000` (not https) for development
