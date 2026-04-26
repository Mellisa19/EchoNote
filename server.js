const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

dotenv.config();

// Ensure uploads directory exists (it's gitignored so won't exist on Render)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const app = express();
const port = process.env.PORT || 3000;

// Modularized Helpers
const ai = require('./src/server/ai');
const analytics = require('./src/server/analytics');
const emailService = require('./src/server/email');

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : [];
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', ...allowedOrigins],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Serve static files from the React app build folder
const buildPath = path.join(__dirname, 'dist');
if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
} else {
    app.use(express.static(__dirname));
}

// Routes to serve index.html for React Router paths
const reactRoutes = ['/', '/dashboard', '/login', '/signup', '/records', '/calendar', '/settings', '/integrations'];
app.get(reactRoutes, (req, res) => {
    const indexPath = fs.existsSync(buildPath) 
        ? path.join(buildPath, 'index.html')
        : path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
});

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

// API Endpoints
app.get('/api/meetings', authenticateToken, async (req, res) => {
    try {
        const snapshot = await admin.database().ref('meetings')
            .orderByChild('createdBy').equalTo(req.user.uid).once('value');
        const meetings = [];
        snapshot.forEach(child => { meetings.push({ id: child.key, ...child.val() }); });
        res.json({ success: true, meetings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/transcribe', authenticateToken, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
        
        // Use modular AI helper for transcription (simplified here for brevity)
        // In real app, you'd call openai.audio.transcriptions.create here
        const transcript = "Mock transcript for testing."; 
        const summary = await ai.generateSummary(transcript);
        const actionItems = await ai.extractActionItems(transcript);
        
        const meetingData = {
            title: req.body.title || 'New Recording',
            date: new Date().toISOString(),
            transcript,
            summary,
            actionItems,
            createdBy: req.user.uid
        };
        
        const ref = await admin.database().ref('meetings').push(meetingData);
        res.json({ success: true, id: ref.key, ...meetingData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/analytics', authenticateToken, async (req, res) => {
    try {
        const snapshot = await admin.database().ref('meetings')
            .orderByChild('createdBy').equalTo(req.user.uid).once('value');
        const meetings = [];
        snapshot.forEach(child => { meetings.push(child.val()); });
        
        const stats = {
            totalMeetings: meetings.length,
            trends: analytics.generateMonthlyTrends(meetings),
            topSpeakers: analytics.generateSpeakerStats(meetings)
        };
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/welcome', async (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email and name required' });
    
    try {
        await emailService.sendWelcomeEmail(email, name);
        res.json({ success: true, message: 'Welcome email sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send welcome email' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
