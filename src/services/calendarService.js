// Google Calendar API Service
class CalendarService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    this.scopes = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events';
    this.discoveryDocs = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
    this.isInitialized = false;
    this.isSignedIn = false;
  }

  // Initialize Google Calendar API
  async initializeCalendar() {
    if (this.isInitialized) return true;

    try {
      // Load Google API script
      await this.loadGapiScript();
      
      // Initialize gapi
      await new Promise((resolve) => {
        window.gapi.load('client:auth2', resolve);
      });

      // Initialize gapi client
      await window.gapi.client.init({
        apiKey: this.apiKey,
        clientId: this.clientId,
        discoveryDocs: this.discoveryDocs,
        scope: this.scopes
      });

      // Listen for sign-in changes
      window.gapi.auth2.getAuthInstance().isSignedIn.listen((isSignedIn) => {
        this.isSignedIn = isSignedIn;
      });

      this.isInitialized = true;
      this.isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error);
      return false;
    }
  }

  // Load Google API script
  loadGapiScript() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Sign in to Google Calendar
  async signIn() {
    if (!this.isInitialized) {
      await this.initializeCalendar();
    }

    try {
      const GoogleAuth = window.gapi.auth2.getAuthInstance();
      await GoogleAuth.signIn();
      this.isSignedIn = true;
      return true;
    } catch (error) {
      console.error('Google Calendar sign-in failed:', error);
      return false;
    }
  }

  // Sign out from Google Calendar
  async signOut() {
    if (!this.isInitialized) return;

    try {
      const GoogleAuth = window.gapi.auth2.getAuthInstance();
      await GoogleAuth.signOut();
      this.isSignedIn = false;
    } catch (error) {
      console.error('Google Calendar sign-out failed:', error);
    }
  }

  // Get today's meetings
  async getTodayMeetings() {
    if (!this.isSignedIn) return [];

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await window.gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': today.toISOString(),
        'timeMax': tomorrow.toISOString(),
        'singleEvents': true,
        'orderBy': 'startTime',
        'q': 'meet,meeting,call,conference' // Filter for meeting-related events
      });

      return response.result.items.map(event => ({
        id: event.id,
        title: event.summary || 'Untitled Meeting',
        startTime: new Date(event.start.dateTime || event.start.date),
        endTime: new Date(event.end.dateTime || event.end.date),
        location: event.location,
        description: event.description,
        meetLink: this.extractMeetLink(event),
        attendees: event.attendees || []
      }));
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }

  // Extract Google Meet link from event
  extractMeetLink(event) {
    const text = `${event.summary || ''} ${event.description || ''} ${event.location || ''}`;
    
    // Google Meet link patterns
    const meetPatterns = [
      /https:\/\/meet\.google\.com\/[a-z0-9-]+/gi,
      /https:\/\/hangouts\.google\.com\/[a-z0-9-]+/gi
    ];

    for (const pattern of meetPatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }

    return null;
  }

  // Get upcoming meetings (next 7 days)
  async getUpcomingMeetings() {
    if (!this.isSignedIn) return [];

    try {
      const now = new Date();
      const weekFromNow = new Date(now);
      weekFromNow.setDate(weekFromNow.getDate() + 7);

      const response = await window.gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': now.toISOString(),
        'timeMax': weekFromNow.toISOString(),
        'singleEvents': true,
        'orderBy': 'startTime',
        'q': 'meet,meeting,call,conference'
      });

      return response.result.items.map(event => ({
        id: event.id,
        title: event.summary || 'Untitled Meeting',
        startTime: new Date(event.start.dateTime || event.start.date),
        endTime: new Date(event.end.dateTime || event.end.date),
        location: event.location,
        description: event.description,
        meetLink: this.extractMeetLink(event),
        attendees: event.attendees || []
      }));
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      return [];
    }
  }

  // Check if user is signed in
  isUserSignedIn() {
    return this.isSignedIn;
  }
}

export default new CalendarService();
