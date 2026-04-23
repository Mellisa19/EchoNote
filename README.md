# EchoNote - AI Meeting Transcription & Summarization

EchoNote is an intelligent meeting assistant that automatically transcribes, summarizes, and analyzes meetings using AI. It supports real-time transcription, multi-platform bot integration, and comprehensive meeting analytics.

## 🚀 Features

### Core Functionality
- **AI-Powered Transcription**: Real-time audio-to-text conversion using OpenAI Whisper
- **Intelligent Summarization**: Automatic meeting summaries with key decisions and action items
- **Multi-Platform Support**: Join meetings on Google Meet, Zoom, and Microsoft Teams
- **Export Options**: Download transcripts as Word documents or PDFs
- **Search & Analytics**: Advanced search capabilities and meeting insights

### Advanced Features
- **Speaker Identification**: Automatic speaker diarization and participation tracking
- **Action Item Extraction**: AI-powered identification of tasks and assignments
- **Sentiment Analysis**: Meeting tone and engagement metrics
- **Team Collaboration**: Shared workspaces and meeting permissions
- **Calendar Integration**: Sync with Google Calendar for automated meeting detection

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **Firebase Admin SDK** for authentication and database
- **OpenAI API** for transcription and analysis
- **Google APIs** for calendar integration
- **Puppeteer** for web automation

### Frontend
- **Modern HTML5/CSS3** with animated mesh backgrounds
- **Material Icons** for UI components
- **Firebase SDK** for client-side authentication
- **Responsive Design** optimized for all devices

### Storage & Processing
- **Multer** for file upload handling
- **docx** and **jsPDF** for document generation
- **Local filesystem** with Firebase backup

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Firebase project with Admin SDK configured
- Google Cloud credentials (for calendar integration)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EchoNote
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables in `.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_service_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_DATABASE_URL=your_firebase_database_url
   PORT=3000
   ```

4. **Create required directories**
   ```bash
   mkdir uploads data public
   ```

5. **Add logo** (optional)
   ```bash
   # Place your logo.png in the public/ directory
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
# or
npm start
```

The application will be available at:
- **Landing Page**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **API Base**: http://localhost:3000/api

## 📡 API Endpoints

### Authentication
- `GET /api/user/profile` - Get user profile
- `POST /api/user/profile` - Update user profile

### Meetings
- `GET /api/meetings` - List all meetings
- `POST /api/upload` - Upload audio file for transcription
- `POST /api/transcribe` - Start transcription process
- `GET /api/transcribe/:meetingId/status` - Check transcription status

### Real-time Transcription
- `POST /api/transcription/start` - Start live transcription session
- `POST /api/transcription/audio` - Process audio chunk
- `POST /api/transcription/stop` - Stop and finalize transcription
- `GET /api/transcription/status/:sessionId` - Get session status

### Bot Integration
- `POST /api/bot/invite` - Invite bot to meeting
- `GET /api/bot/status/:sessionId` - Get bot status
- `POST /api/bot/stop/:sessionId` - Stop bot session

### Analytics
- `GET /api/analytics/overview/:userId` - User analytics
- `GET /api/analytics/workspace/:workspaceId` - Workspace analytics
- `GET /api/analytics/meeting/:meetingId` - Meeting analytics

### Export
- `POST /api/export/word` - Export as Word document
- `POST /api/export/pdf` - Export as PDF

### Calendar
- `POST /api/calendar/events` - Fetch calendar events

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Set up Firestore Database
4. Generate service account key
5. Configure environment variables

### OpenAI Setup
1. Create OpenAI account
2. Generate API key
3. Add to `.env` file

### Google Calendar Integration
1. Create Google Cloud project
2. Enable Calendar API
3. Create OAuth credentials
4. Add redirect URI to your application

## 📁 Project Structure

```
EchoNote/
├── server.js              # Main application server
├── index.html              # Dashboard UI
├── landing.html            # Landing page
├── style-dashboard.css     # Dashboard styling
├── style-modern.css        # Alternative styles
├── style.css              # Base styles
├── uploads/               # Audio file uploads
├── data/                  # Local data storage
├── public/                # Static assets
├── .env                   # Environment variables
├── package.json           # Dependencies
└── README.md             # This file
```

## 🔐 Security

- Firebase Authentication for user management
- JWT token validation
- CORS configuration
- File upload restrictions (25MB limit)
- Environment variable protection
- Input sanitization

## 🎯 Usage Examples

### Upload Audio for Transcription
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Meeting ID:', data.meetingId));
```

### Start Live Transcription
```javascript
fetch('/api/transcription/start', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    sessionId: 'session_123',
    meetingId: 'meeting_456'
  })
});
```

### Get Meeting Analytics
```javascript
fetch('/api/analytics/meeting/123', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log('Analytics:', data.analytics));
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the package.json file for details.

## 🆘 Troubleshooting

### Common Issues

**Server won't start**
- Check if port 3000 is available
- Verify all environment variables are set
- Ensure Node.js version is 18+

**Authentication fails**
- Verify Firebase configuration
- Check service account key format
- Ensure Firebase project is properly set up

**Transcription errors**
- Verify OpenAI API key is valid
- Check audio file format (supports MP3, M4A, WAV)
- Ensure file size is under 25MB

**File upload issues**
- Check uploads directory permissions
- Verify file format is supported
- Ensure sufficient disk space

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=echonote:*
```

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation

## 🚀 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI features (sentiment analysis, keyword extraction)
- [ ] Integration with more meeting platforms
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Custom branding options

---

**Built with ❤️ using Node.js, Express, Firebase, and OpenAI**
