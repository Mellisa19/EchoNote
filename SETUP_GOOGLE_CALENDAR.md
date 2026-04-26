# Google Calendar API Setup Guide

This guide will help you set up Google Calendar API integration for EchoNote's automatic meeting join feature.

## 🔧 What You'll Get

✅ **Auto-join meetings** from your Google Calendar  
✅ **Manual meeting join** via meeting links  
✅ **Meeting detection** 15 minutes before start  
✅ **Support for Google Meet, Zoom, Teams, Webex**  
✅ **Browser notifications** when joining meetings  

## 📋 Prerequisites

1. Google Cloud Console account
2. Your EchoNote project deployed domain
3. Admin access to Google Workspace (optional but recommended)

## 🚀 Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Google Calendar API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Add these **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-domain.com
   ```
5. Add these **Authorized redirect URIs**:
   ```
   http://localhost:3000
   https://your-domain.com
   ```
6. Click "Create"
7. **Copy the Client ID** - you'll need this for `.env`

### 3. Get API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Restrict the API key (recommended):
   - Select "HTTP referrers"
   - Add your domains: `*.your-domain.com`, `localhost:3000`
4. **Copy the API Key** - you'll need this for `.env`

### 4. Configure EchoNote

Add these environment variables to your `.env` file:

```env
# Google Calendar API (Required for auto-join)
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id
REACT_APP_GOOGLE_API_KEY=your_google_api_key
```

**Replace with your actual credentials from steps 2 & 3.**

### 5. Test the Integration

1. Start your EchoNote application
2. Go to Dashboard → "Connect Calendar"
3. Click "Connect Calendar" and sign in with Google
4. Grant calendar permissions
5. Verify you see today's meetings
6. Test auto-join with a meeting link

## 🔒 Security & Permissions

The app requests these Google Calendar permissions:

- **View your calendars** - To read meeting schedules
- **View calendar events** - To extract meeting details and links
- **No write permissions** - EchoNote cannot modify your calendar

## 📱 How It Works

### Auto-Join Process:
1. **Calendar Connection**: Connect your Google account
2. **Meeting Detection**: Scans calendar every 30 seconds
3. **Smart Timing**: Joins meetings 2 minutes before start
4. **Link Extraction**: Detects Google Meet, Zoom, Teams, Webex links
5. **Auto-Recording**: Starts recording when meeting is joined

### Manual Join:
1. Paste any meeting link (Google Meet, Zoom, Teams, Webex)
2. Click "Join & Record"
3. EchoNote opens the meeting and starts recording

## 🛠️ Troubleshooting

### "Invalid Origin" Error
- Add your domain to Google Cloud Console authorized origins
- Wait 5-10 minutes for changes to propagate

### "API Key Not Authorized" Error
- Check API key restrictions in Google Cloud Console
- Ensure Calendar API is enabled

### No Meetings Showing
- Verify calendar permissions were granted
- Check if meetings have "meet", "meeting", "call", or "conference" in title/description
- Ensure meetings have valid meeting links

### Auto-Join Not Working
- Enable "Auto-join meetings" toggle
- Check browser notification permissions
- Verify meeting links are detected correctly

## 🌐 Deployment Notes

For production deployment:

1. **Add your production domain** to Google Cloud Console
2. **Update environment variables** on your hosting platform
3. **Test the flow** in production environment
4. **Monitor API usage** to avoid quotas

## 📊 API Quotas & Limits

- **Free tier**: 50,000 requests per day
- **Each meeting check**: ~2-3 API calls
- **With 30-second intervals**: ~2,880 calls per day
- **Recommended**: Well within free tier limits

## 🎯 Best Practices

1. **Use the same email** for EchoNote account and Google Calendar
2. **Enable browser notifications** for meeting alerts
3. **Test with a real meeting** before relying on auto-join
4. **Keep meeting titles descriptive** for better detection
5. **Monitor API usage** if you have many users

## 🆘 Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Google Calendar API is enabled in your project
4. Test with a different Google account if needed

---

**Ready to start auto-joining meetings?** 🚀

Once set up, EchoNote will automatically detect and join your meetings, making sure you never miss recording important discussions!
