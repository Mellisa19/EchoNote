const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { google } = require('googleapis');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const { jsPDF } = require('jspdf');

dotenv.config();

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Dashboard route (must come before static middleware for prefix matching if any)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Landing page route at root
app.get('/', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '-1');
    res.sendFile(path.join(__dirname, 'landing.html'));
});

// Also keep /landing for direct access
app.get('/landing', (req, res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '-1');
    res.sendFile(path.join(__dirname, 'landing.html'));
});

app.use(express.static(__dirname));

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};


// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit for Whisper
});

// Real-time transcription with speaker identification
const transcriptionSessions = new Map();

app.post('/api/transcription/start', (req, res) => {
    const { sessionId, meetingId } = req.body;
    
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }
    
    const transcriptionSession = {
        id: sessionId,
        meetingId: meetingId,
        startTime: new Date(),
        transcript: [],
        speakers: new Map(),
        isRecording: true,
        audioBuffer: []
    };
    
    transcriptionSessions.set(sessionId, transcriptionSession);
    
    res.json({
        success: true,
        sessionId: sessionId,
        message: 'Transcription session started'
    });
});

app.post('/api/transcription/audio', upload.single('audio'), async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = transcriptionSessions.get(sessionId);
        
        if (!session) {
            return res.status(404).json({ error: 'Transcription session not found' });
        }
        
        if (!req.file) {
            return res.status(400).json({ error: 'Audio file required' });
        }
        
        // Process audio for transcription
        const transcriptionResult = await processAudioTranscription(req.file.path, session);
        
        res.json({
            success: true,
            transcription: transcriptionResult
        });
        
    } catch (error) {
        console.error('Audio transcription error:', error);
        res.status(500).json({ error: 'Failed to process audio', details: error.message });
    }
});

app.post('/api/transcription/stop', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = transcriptionSessions.get(sessionId);
        
        if (!session) {
            return res.status(404).json({ error: 'Transcription session not found' });
        }
        
        session.isRecording = false;
        
        // Generate final summary and save to Firebase
        const finalTranscript = await generateFinalTranscript(session);
        
        if (session.meetingId) {
            await admin.database().ref(`meetings/${session.meetingId}/transcript`).set(finalTranscript);
        }
        
        transcriptionSessions.delete(sessionId);
        
        res.json({
            success: true,
            message: 'Transcription session stopped',
            transcriptLength: finalTranscript.length
        });
        
    } catch (error) {
        console.error('Stop transcription error:', error);
        res.status(500).json({ error: 'Failed to stop transcription', details: error.message });
    }
});

app.get('/api/transcription/status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = transcriptionSessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: 'Transcription session not found' });
    }
    
    res.json({
        sessionId: session.id,
        isRecording: session.isRecording,
        transcriptLength: session.transcript.length,
        speakersCount: session.speakers.size,
        startTime: session.startTime
    });
});

// Data Store setup
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Data Store (User-specific JSON files)
function getMeetings(userId) {
    const filePath = path.join(dataDir, `meetings_${userId}.json`);
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        return [];
    } catch (error) {
        console.error('Error reading meetings:', error);
        return [];
    }
}

// Save user-specific meetings
function saveMeetings(userId, meetings) {
    const filePath = path.join(dataDir, `meetings_${userId}.json`);
    try {
        fs.writeFileSync(filePath, JSON.stringify(meetings, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving meetings:', error);
        return false;
    }
}

// Save a single meeting
function saveMeeting(userId, meeting) {
    const meetings = getMeetings(userId);
    const index = meetings.findIndex(m => m.id === meeting.id);
    if (index >= 0) {
        meetings[index] = meeting;
    } else {
        meetings.push(meeting);
    }
    return saveMeetings(userId, meetings);
}

// Get user profile data
function getUserProfile(userId) {
    const filePath = path.join(dataDir, `user_${userId}.json`);
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        return null;
    } catch (error) {
        console.error('Error reading user profile:', error);
        return null;
    }
}

// Save user profile data
function saveUserProfile(userId, profile) {
    const filePath = path.join(dataDir, `user_${userId}.json`);
    try {
        fs.writeFileSync(filePath, JSON.stringify(profile, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving user profile:', error);
        return false;
    }
}

// API Endpoints
// User profile endpoints
app.get('/api/user/profile', authenticateToken, (req, res) => {
    const profile = getUserProfile(req.user.uid);
    res.json(profile || { error: 'Profile not found' });
});

app.post('/api/user/profile', authenticateToken, (req, res) => {
    const profileData = req.body;
    const success = saveUserProfile(req.user.uid, profileData);
    if (success) {
        res.json({ success: true, message: 'Profile saved successfully' });
    } else {
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

app.get('/api/meetings', authenticateToken, (req, res) => {
    res.json(getMeetings(req.user.uid));
});

app.post('/api/upload', authenticateToken, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        console.log('File uploaded:', req.file.path);

        // 1. Transcription (Whisper)
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(req.file.path),
            model: "whisper-1",
        });

        const transcript = transcription.text;
        console.log('Transcription complete');

        // 2. AI Processing (GPT-4o-mini)
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an AI meeting assistant. Analyze the transcript and provide a JSON response with:\n- 'title': Generate a short, natural, human-readable title based on the context (must be under 6 words). DO NOT use generic titles like 'Meeting Summary'.\n- 'summary': Short brief.\n- 'decisions': Array of strings.\n- 'actionItems': Array of objects with 'task', 'assignee', and 'deadline'.\n- 'keyTopics': Array of 3-6 major topic strings.\n- 'importantMoments': Array of strings.\n- 'toneSummary': One line describing the meeting tone."
                },
                {
                    role: "user",
                    content: `Transcript: ${transcript}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const aiData = JSON.parse(response.choices[0].message.content);
        console.log('AI Analysis complete');

        const meeting = {
            id: Date.now(),
            title: aiData.title || 'New Meeting',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            preview: aiData.summary.substring(0, 100) + '...',
            transcript,
            summary: aiData.summary,
            decisions: aiData.decisions || [],
            actionItems: aiData.actionItems || [],
            keyTopics: aiData.keyTopics || [],
            importantMoments: aiData.importantMoments || [],
            toneSummary: aiData.toneSummary || 'Neutral',
            audioUrl: `/uploads/${req.file.filename}`
        };

        saveMeeting(req.user.uid, meeting);
        res.json({ meetingId: meeting.id, status: 'completed' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// Start transcription process (async)
app.post('/api/transcribe', authenticateToken, async (req, res) => {
    try {
        const { meetingId } = req.body;
        
        if (!meetingId) {
            return res.status(400).json({ error: 'Meeting ID required' });
        }

        // Get meeting record
        const meetings = getMeetings(req.user.uid);
        const meeting = meetings.find(m => m.id === meetingId);
        
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        // Update status to processing
        meeting.status = 'processing';
        saveMeeting(req.user.uid, meeting);

        // Start transcription in background
        processTranscription(req.user.uid, meetingId);
        
        res.json({ meetingId, status: 'transcription_started' });
        
    } catch (error) {
        console.error('Transcription start error:', error);
        res.status(500).json({ error: 'Failed to start transcription' });
    }
});

// Check transcription status
app.get('/api/transcribe/:meetingId/status', authenticateToken, (req, res) => {
    try {
        const { meetingId } = req.params;
        
        // Get meeting record
        const meetings = getMeetings(req.user.uid);
        const meeting = meetings.find(m => m.id === meetingId);
        
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        // Return current status
        res.json({
            meetingId,
            status: meeting.status || 'completed',
            transcript: meeting.transcript,
            summary: meeting.summary,
            keyPoints: meeting.keyTopics || [],
            actionItems: meeting.actionItems || [],
            quotes: meeting.importantMoments || [],
            completedAt: meeting.completedAt
        });
        
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Failed to check status' });
    }
});

// Background transcription processing function
async function processTranscription(userId, meetingId) {
    try {
        console.log(`Processing transcription for meeting ${meetingId}`);
        
        // Get meetings and update status
        const meetings = getMeetings(userId);
        const meeting = meetings.find(m => m.id === meetingId);
        
        if (!meeting) {
            console.error(`Meeting ${meetingId} not found`);
            return;
        }

        // Update status to processing
        meeting.status = 'processing';
        meeting.progress = 50;
        saveMeeting(userId, meeting);
        
        // Simulate processing time (in production, this would be real AI processing)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Mark as completed
        meeting.status = 'completed';
        meeting.progress = 100;
        meeting.completedAt = new Date().toISOString();
        saveMeeting(userId, meeting);
        
        console.log(`Transcription completed for meeting ${meetingId}`);
        
    } catch (error) {
        console.error(`Transcription failed for meeting ${meetingId}:`, error);
        
        // Update status to failed
        const meetings = getMeetings(userId);
        const meeting = meetings.find(m => m.id === meetingId);
        if (meeting) {
            meeting.status = 'failed';
            meeting.error = error.message;
            meeting.failedAt = new Date().toISOString();
            saveMeeting(userId, meeting);
        }
    }
}

app.post('/api/chat', authenticateToken, async (req, res) => {
    try {
        const { question, transcript } = req.body;

        if (!question || !transcript) {
            return res.status(400).json({ error: 'Question and transcript are required' });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are an AI meeting assistant. Answer the user's question based ONLY on the provided transcript. If the answer is not in the transcript, respond: 'That wasn't mentioned in this meeting.' Be clear, direct, and avoid hallucinations. Prioritize accuracy over creativity."
                },
                {
                    role: "user",
                    content: `Transcript: ${transcript}\n\nQuestion: ${question}`
                }
            ]
        });

        const answer = response.choices[0].message.content;
        res.json({ answer });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Chat processing failed', details: error.message });
    }
});

app.post('/api/meetings/:id/share', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Get the meeting
        const meetings = getMeetings(req.user.uid);
        const meeting = meetings.find(m => m.id === parseInt(id));
        
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        // In a real implementation, you would:
        // 1. Store the sharing in a database
        // 2. Send an email notification
        // 3. Create a share token
        
        // For now, we'll just simulate sharing
        console.log(`Meeting ${id} shared with ${email} by user ${req.user.uid}`);
        
        res.json({ 
            success: true, 
            message: 'Meeting shared successfully',
            shareLink: `${req.protocol}://${req.get('host')}/shared/${id}`
        });
        
    } catch (error) {
        console.error('Share error:', error);
        res.status(500).json({ error: 'Failed to share meeting', details: error.message });
    }
});

app.get('/shared/:id', (req, res) => {
    // This would be a public view for shared meetings
    // In a real implementation, you'd verify the share token
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Shared Meeting - EchoNote</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <h1>Shared Meeting View</h1>
            <p>Meeting ID: ${req.params.id}</p>
            <p>This is a placeholder for the shared meeting view.</p>
        </body>
        </html>
    `);
});

app.post('/api/calendar/events', authenticateToken, async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) {
            return res.status(400).json({ error: 'OAuth access token required' });
        }

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: accessToken });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: nextWeek.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];
        
        // Filter events that have conferencing data (Meet, Zoom, Teams)
        const meetingEvents = events.map(event => {
            let platform = null;
            let meetingUrl = null;

            // Check Google Meet
            if (event.conferenceData && event.conferenceData.entryPoints) {
                const videoPoint = event.conferenceData.entryPoints.find(ep => ep.entryPointType === 'video');
                if (videoPoint) {
                    platform = 'google_meet';
                    meetingUrl = videoPoint.uri;
                }
            }
            
            // Check descriptions or locations for Zoom/Teams links if no built-in conference data
            if (!platform) {
                const content = (event.description || '') + ' ' + (event.location || '');
                if (content.includes('zoom.us/j/')) {
                    platform = 'zoom';
                    const match = content.match(/https:\/\/[^\s]*zoom\.us\/j\/[^\s]*/);
                    if (match) meetingUrl = match[0];
                } else if (content.includes('teams.microsoft.com/l/meetup-join/')) {
                    platform = 'teams';
                    const match = content.match(/https:\/\/[^\s]*teams\.microsoft\.com\/l\/meetup-join\/[^\s]*/);
                    if (match) meetingUrl = match[0];
                }
            }

            return {
                id: event.id,
                title: event.summary || 'Untitled Meeting',
                startTime: event.start.dateTime || event.start.date,
                endTime: event.end.dateTime || event.end.date,
                platform,
                meetingUrl,
                organizer: event.organizer ? event.organizer.email : null
            };
        });

        res.json({ events: meetingEvents });
    } catch (error) {
        console.error('Calendar Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events', details: error.message });
    }
});

// Export Meeting as Word Document
app.post('/api/export/word', async (req, res) => {
    try {
        const { meetingId } = req.body;
        
        // Get meeting data from Firebase
        const meetingSnapshot = await admin.database().ref(`meetings/${meetingId}`).once('value');
        const meeting = meetingSnapshot.val();
        
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        // Create Word document
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        text: meeting.title || 'Untitled Meeting',
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    new Paragraph({
                        text: `Date: ${meeting.date || 'N/A'}`,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: `Duration: ${meeting.duration || 'N/A'}`,
                        spacing: { after: 200 }
                    }),
                    new Paragraph({
                        text: "Summary",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 }
                    }),
                    new Paragraph({
                        text: meeting.summary || 'No summary available',
                        spacing: { after: 400 }
                    }),
                    ...((meeting.keyTopics || []).map(topic => 
                        new Paragraph({
                            text: `Key Topic: ${topic}`,
                            spacing: { after: 100 }
                        })
                    )),
                    new Paragraph({
                        text: "Action Items",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 200 }
                    }),
                    ...((meeting.actionItems || []).map(item => {
                        const itemText = typeof item === 'string' ? item : 
                            `${item.task}${item.assignee ? ` (Assigned to: ${item.assignee})` : ''}${item.deadline ? ` (Due: ${item.deadline})` : ''}`;
                        return new Paragraph({
                            text: `· ${itemText}`,
                            spacing: { after: 100 }
                        });
                    }))
                ]
            }]
        });

        // Generate buffer
        const buffer = await Packer.toBuffer(doc);
        
        // Set headers and send file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${meeting.title || 'meeting'}-${Date.now()}.docx"`);
        res.send(buffer);
        
    } catch (error) {
        console.error('Word Export Error:', error);
        res.status(500).json({ error: 'Failed to export Word document', details: error.message });
    }
});

// Export Meeting as PDF
app.post('/api/export/pdf', async (req, res) => {
    try {
        const { meetingId } = req.body;
        
        // Get meeting data from Firebase
        const meetingSnapshot = await admin.database().ref(`meetings/${meetingId}`).once('value');
        const meeting = meetingSnapshot.val();
        
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }

        // Create PDF document
        const pdf = new jsPDF();
        
        // Add title
        pdf.setFontSize(20);
        pdf.text(meeting.title || 'Untitled Meeting', 105, 20, { align: 'center' });
        
        // Add metadata
        pdf.setFontSize(12);
        pdf.text(`Date: ${meeting.date || 'N/A'}`, 20, 40);
        pdf.text(`Duration: ${meeting.duration || 'N/A'}`, 20, 50);
        
        // Add summary
        pdf.setFontSize(16);
        pdf.text('Summary', 20, 70);
        pdf.setFontSize(12);
        
        // Handle long text by splitting into lines
        const summaryLines = pdf.splitTextToSize(meeting.summary || 'No summary available', 170);
        pdf.text(summaryLines, 20, 80);
        
        let yPosition = 80 + (summaryLines.length * 5) + 20;
        
        // Add key topics
        if (meeting.keyTopics && meeting.keyTopics.length > 0) {
            pdf.setFontSize(16);
            pdf.text('Key Topics', 20, yPosition);
            pdf.setFontSize(12);
            yPosition += 10;
            
            meeting.keyTopics.forEach(topic => {
                const topicLines = pdf.splitTextToSize(`· ${topic}`, 170);
                pdf.text(topicLines, 20, yPosition);
                yPosition += topicLines.length * 5 + 5;
            });
        }
        
        // Add action items
        if (meeting.actionItems && meeting.actionItems.length > 0) {
            pdf.setFontSize(16);
            pdf.text('Action Items', 20, yPosition);
            pdf.setFontSize(12);
            yPosition += 10;
            
            meeting.actionItems.forEach(item => {
                const itemText = typeof item === 'string' ? item : 
                    `${item.task}${item.assignee ? ` (Assigned to: ${item.assignee})` : ''}${item.deadline ? ` (Due: ${item.deadline})` : ''}`;
                const itemLines = pdf.splitTextToSize(`· ${itemText}`, 170);
                pdf.text(itemLines, 20, yPosition);
                yPosition += itemLines.length * 5 + 5;
            });
        }
        
        // Set headers and send file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${meeting.title || 'meeting'}-${Date.now()}.pdf"`);
        res.send(Buffer.from(pdf.output('arraybuffer')));
        
    } catch (error) {
        console.error('PDF Export Error:', error);
        res.status(500).json({ error: 'Failed to export PDF', details: error.message });
    }
});

// Enhanced WebRTC Bot Integration
const botSessions = new Map(); // Store active bot sessions

app.post('/api/bot/invite', async (req, res) => {
    const { url, platform, meetingId } = req.body;
    if (!url) return res.status(400).json({ error: 'Meeting URL required' });

    try {
        // Detect platform if not provided
        const detectedPlatform = platform || detectMeetingPlatform(url);
        
        // Create bot session
        const sessionId = generateSessionId();
        const botSession = {
            id: sessionId,
            url: url,
            platform: detectedPlatform,
            meetingId: meetingId,
            status: 'initializing',
            startTime: new Date(),
            transcript: [],
            participants: [],
            recordingState: 'idle'
        };

        botSessions.set(sessionId, botSession);

        // Initialize bot based on platform
        const botResult = await initializeBotSession(botSession);
        
        if (botResult.success) {
            botSession.status = 'connected';
            botSession.botInstance = botResult.botInstance;
            
            // Start recording and transcription
            startMeetingRecording(botSession);
            
            res.json({ 
                success: true, 
                sessionId: sessionId,
                message: `Bot successfully joined ${detectedPlatform} meeting`,
                platform: detectedPlatform,
                status: 'recording'
            });
        } else {
            botSessions.delete(sessionId);
            res.status(500).json({ 
                error: 'Failed to join meeting', 
                details: botResult.error 
            });
        }
    } catch (error) {
        console.error('Bot Invite Error:', error);
        res.status(500).json({ 
            error: 'Failed to initialize bot session', 
            details: error.message 
        });
    }
});

// Multi-user Workspaces and Team Collaboration
app.post('/api/workspaces', async (req, res) => {
    try {
        const { name, description, ownerId } = req.body;
        
        if (!name || !ownerId) {
            return res.status(400).json({ error: 'Workspace name and owner ID required' });
        }
        
        const workspaceId = generateWorkspaceId();
        const workspace = {
            id: workspaceId,
            name: name,
            description: description || '',
            ownerId: ownerId,
            members: [{
                uid: ownerId,
                email: req.user.email,
                role: 'owner',
                joinedAt: new Date().toISOString()
            }],
            settings: {
                allowInvites: true,
                requireApproval: false,
                defaultMeetingPrivacy: 'workspace'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await admin.database().ref(`workspaces/${workspaceId}`).set(workspace);
        
        res.json({
            success: true,
            workspace: workspace
        });
        
    } catch (error) {
        console.error('Create workspace error:', error);
        res.status(500).json({ error: 'Failed to create workspace', details: error.message });
    }
});

app.get('/api/workspaces', async (req, res) => {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }
        
        const workspacesSnapshot = await admin.database()
            .ref('workspaces')
            .orderByChild('members/uid')
            .equalTo(userId)
            .once('value');
        
        const workspaces = [];
        workspacesSnapshot.forEach(child => {
            const workspace = child.val();
            if (workspace.members.some(member => member.uid === userId)) {
                workspaces.push(workspace);
            }
        });
        
        res.json({
            success: true,
            workspaces: workspaces
        });
        
    } catch (error) {
        console.error('Get workspaces error:', error);
        res.status(500).json({ error: 'Failed to fetch workspaces', details: error.message });
    }
});

app.post('/api/workspaces/:workspaceId/invite', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { email, role = 'member' } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }
        
        const workspaceSnapshot = await admin.database()
            .ref(`workspaces/${workspaceId}`)
            .once('value');
        
        const workspace = workspaceSnapshot.val();
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }
        
        // Check if user is owner or admin
        const userMember = workspace.members.find(m => m.uid === req.user.uid);
        if (!userMember || (userMember.role !== 'owner' && userMember.role !== 'admin')) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        // Generate invite token
        const inviteId = generateInviteId();
        const invite = {
            id: inviteId,
            workspaceId: workspaceId,
            email: email,
            role: role,
            invitedBy: req.user.uid,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        
        await admin.database().ref(`invites/${inviteId}`).set(invite);
        
        res.json({
            success: true,
            invite: invite,
            inviteLink: `${req.protocol}://${req.get('host')}/invite/${inviteId}`
        });
        
    } catch (error) {
        console.error('Invite user error:', error);
        res.status(500).json({ error: 'Failed to create invite', details: error.message });
    }
});

app.post('/api/workspaces/:workspaceId/join', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { inviteId } = req.body;
        
        if (!inviteId) {
            return res.status(400).json({ error: 'Invite ID required' });
        }
        
        // Verify invite
        const inviteSnapshot = await admin.database()
            .ref(`invites/${inviteId}`)
            .once('value');
        
        const invite = inviteSnapshot.val();
        if (!invite || invite.workspaceId !== workspaceId) {
            return res.status(404).json({ error: 'Invalid invite' });
        }
        
        if (new Date(invite.expiresAt) < new Date()) {
            return res.status(400).json({ error: 'Invite expired' });
        }
        
        // Add user to workspace
        const workspaceSnapshot = await admin.database()
            .ref(`workspaces/${workspaceId}`)
            .once('value');
        
        const workspace = workspaceSnapshot.val();
        
        // Check if user is already a member
        if (workspace.members.some(m => m.uid === req.user.uid)) {
            return res.status(400).json({ error: 'Already a member of this workspace' });
        }
        
        const newMember = {
            uid: req.user.uid,
            email: req.user.email,
            role: invite.role,
            joinedAt: new Date().toISOString()
        };
        
        workspace.members.push(newMember);
        workspace.updatedAt = new Date().toISOString();
        
        await admin.database().ref(`workspaces/${workspaceId}`).set(workspace);
        
        // Delete invite
        await admin.database().ref(`invites/${inviteId}`).remove();
        
        res.json({
            success: true,
            workspace: workspace
        });
        
    } catch (error) {
        console.error('Join workspace error:', error);
        res.status(500).json({ error: 'Failed to join workspace', details: error.message });
    }
});

app.get('/api/workspaces/:workspaceId/meetings', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        
        // Verify user is member of workspace
        const workspaceSnapshot = await admin.database()
            .ref(`workspaces/${workspaceId}`)
            .once('value');
        
        const workspace = workspaceSnapshot.val();
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }
        
        const isMember = workspace.members.some(m => m.uid === req.user.uid);
        if (!isMember) {
            return res.status(403).json({ error: 'Not a member of this workspace' });
        }
        
        // Get workspace meetings
        const meetingsSnapshot = await admin.database()
            .ref('meetings')
            .orderByChild('workspaceId')
            .equalTo(workspaceId)
            .once('value');
        
        const meetings = [];
        meetingsSnapshot.forEach(child => {
            meetings.push({
                id: child.key,
                ...child.val()
            });
        });
        
        res.json({
            success: true,
            meetings: meetings
        });
        
    } catch (error) {
        console.error('Get workspace meetings error:', error);
        res.status(500).json({ error: 'Failed to fetch meetings', details: error.message });
    }
});

app.post('/api/workspaces/:workspaceId/meetings', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const meetingData = req.body;
        
        // Verify user is member of workspace
        const workspaceSnapshot = await admin.database()
            .ref(`workspaces/${workspaceId}`)
            .once('value');
        
        const workspace = workspaceSnapshot.val();
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }
        
        const isMember = workspace.members.some(m => m.uid === req.user.uid);
        if (!isMember) {
            return res.status(403).json({ error: 'Not a member of this workspace' });
        }
        
        // Create meeting with workspace association
        const meetingId = generateSessionId();
        const meeting = {
            ...meetingData,
            id: meetingId,
            workspaceId: workspaceId,
            createdBy: req.user.uid,
            createdAt: new Date().toISOString(),
            sharedWith: workspace.members.map(m => m.uid)
        };
        
        await admin.database().ref(`meetings/${meetingId}`).set(meeting);
        
        res.json({
            success: true,
            meeting: meeting
        });
        
    } catch (error) {
        console.error('Create workspace meeting error:', error);
        res.status(500).json({ error: 'Failed to create meeting', details: error.message });
    }
});

// Helper functions for workspace management
function generateWorkspaceId() {
    return 'ws_' + Math.random().toString(36).substr(2, 9);
}

function generateInviteId() {
    return 'inv_' + Math.random().toString(36).substr(2, 12);
}

// Analytics Dashboard and Meeting Insights
app.get('/api/analytics/overview/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get all user meetings
        const meetingsSnapshot = await admin.database()
            .ref('meetings')
            .orderByChild('createdBy')
            .equalTo(userId)
            .once('value');
        
        const meetings = [];
        meetingsSnapshot.forEach(child => {
            meetings.push({
                id: child.key,
                ...child.val()
            });
        });
        
        // Calculate analytics
        const analytics = {
            totalMeetings: meetings.length,
            totalDuration: meetings.reduce((sum, m) => sum + (m.duration || 0), 0),
            averageDuration: meetings.length > 0 ? Math.round(meetings.reduce((sum, m) => sum + (m.duration || 0), 0) / meetings.length) : 0,
            totalTranscriptions: meetings.filter(m => m.transcript).length,
            totalActionItems: meetings.reduce((sum, m) => sum + (m.actionItems ? m.actionItems.length : 0), 0),
            meetingsThisMonth: meetings.filter(m => {
                const meetingDate = new Date(m.date || m.createdAt);
                const now = new Date();
                return meetingDate.getMonth() === now.getMonth() && meetingDate.getFullYear() === now.getFullYear();
            }).length,
            platformUsage: {},
            monthlyTrends: generateMonthlyTrends(meetings),
            topTopics: extractTopTopics(meetings),
            speakerStats: generateSpeakerStats(meetings)
        };
        
        // Calculate platform usage
        meetings.forEach(meeting => {
            const platform = meeting.platform || 'unknown';
            analytics.platformUsage[platform] = (analytics.platformUsage[platform] || 0) + 1;
        });
        
        res.json({
            success: true,
            analytics: analytics
        });
        
    } catch (error) {
        console.error('Analytics overview error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
    }
});

app.get('/api/analytics/workspace/:workspaceId', async (req, res) => {
    try {
        const { workspaceId } = req.params;
        
        // Verify user is member of workspace
        const workspaceSnapshot = await admin.database()
            .ref(`workspaces/${workspaceId}`)
            .once('value');
        
        const workspace = workspaceSnapshot.val();
        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }
        
        const isMember = workspace.members.some(m => m.uid === req.user.uid);
        if (!isMember) {
            return res.status(403).json({ error: 'Not a member of this workspace' });
        }
        
        // Get workspace meetings
        const meetingsSnapshot = await admin.database()
            .ref('meetings')
            .orderByChild('workspaceId')
            .equalTo(workspaceId)
            .once('value');
        
        const meetings = [];
        meetingsSnapshot.forEach(child => {
            meetings.push({
                id: child.key,
                ...child.val()
            });
        });
        
        // Generate workspace analytics
        const analytics = {
            workspaceId: workspaceId,
            workspaceName: workspace.name,
            totalMeetings: meetings.length,
            totalMembers: workspace.members.length,
            totalDuration: meetings.reduce((sum, m) => sum + (m.duration || 0), 0),
            averageDuration: meetings.length > 0 ? Math.round(meetings.reduce((sum, m) => sum + (m.duration || 0), 0) / meetings.length) : 0,
            memberContributions: generateMemberContributions(meetings, workspace.members),
            meetingFrequency: generateMeetingFrequency(meetings),
            collaborationScore: calculateCollaborationScore(meetings, workspace.members),
            insights: generateWorkspaceInsights(meetings, workspace)
        };
        
        res.json({
            success: true,
            analytics: analytics
        });
        
    } catch (error) {
        console.error('Workspace analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch workspace analytics', details: error.message });
    }
});

app.get('/api/analytics/meeting/:meetingId', async (req, res) => {
    try {
        const { meetingId } = req.params;
        
        // Get meeting data
        const meetingSnapshot = await admin.database()
            .ref(`meetings/${meetingId}`)
            .once('value');
        
        const meeting = meetingSnapshot.val();
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        
        // Generate detailed meeting analytics
        const analytics = {
            meetingId: meetingId,
            title: meeting.title,
            duration: meeting.duration || 0,
            participantCount: meeting.participants ? meeting.participants.length : 0,
            speakerAnalysis: meeting.transcript ? analyzeSpeakerParticipation(meeting.transcript) : null,
            topicAnalysis: meeting.keyTopics || [],
            sentimentAnalysis: await analyzeSentiment(meeting.transcript),
            actionItemAnalysis: analyzeActionItems(meeting.actionItems || []),
            engagementMetrics: calculateEngagementMetrics(meeting),
            keyMoments: extractKeyMoments(meeting.transcript),
            productivityScore: calculateProductivityScore(meeting)
        };
        
        res.json({
            success: true,
            analytics: analytics
        });
        
    } catch (error) {
        console.error('Meeting analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch meeting analytics', details: error.message });
    }
});

// Helper functions for analytics
function generateMonthlyTrends(meetings) {
    const trends = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        const monthMeetings = meetings.filter(m => {
            const meetingDate = new Date(m.date || m.createdAt);
            return meetingDate.getMonth() === monthDate.getMonth() && 
                   meetingDate.getFullYear() === monthDate.getFullYear();
        });
        
        trends.push({
            month: monthName,
            meetings: monthMeetings.length,
            duration: monthMeetings.reduce((sum, m) => sum + (m.duration || 0), 0),
            actionItems: monthMeetings.reduce((sum, m) => sum + (m.actionItems ? m.actionItems.length : 0), 0)
        });
    }
    
    return trends;
}

function extractTopTopics(meetings) {
    const topicCount = {};
    
    meetings.forEach(meeting => {
        if (meeting.keyTopics) {
            meeting.keyTopics.forEach(topic => {
                topicCount[topic] = (topicCount[topic] || 0) + 1;
            });
        }
    });
    
    return Object.entries(topicCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic, count]) => ({ topic, count }));
}

function generateSpeakerStats(meetings) {
    const speakerStats = {};
    
    meetings.forEach(meeting => {
        if (meeting.transcript && meeting.transcript.speakers) {
            meeting.transcript.speakers.forEach(speaker => {
                if (!speakerStats[speaker.name]) {
                    speakerStats[speaker.name] = {
                        totalDuration: 0,
                        meetingsCount: 0,
                        segmentsCount: 0
                    };
                }
                
                speakerStats[speaker.name].totalDuration += speaker.totalDuration || 0;
                speakerStats[speaker.name].meetingsCount += 1;
                speakerStats[speaker.name].segmentsCount += speaker.segmentsCount || 0;
            });
        }
    });
    
    return Object.entries(speakerStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.totalDuration - a.totalDuration);
}

function generateMemberContributions(meetings, members) {
    const contributions = {};
    
    members.forEach(member => {
        contributions[member.uid] = {
            name: member.email,
            meetingsCreated: 0,
            totalParticipation: 0
        };
    });
    
    meetings.forEach(meeting => {
        if (contributions[meeting.createdBy]) {
            contributions[meeting.createdBy].meetingsCreated += 1;
        }
        
        if (meeting.transcript && meeting.transcript.speakers) {
            meeting.transcript.speakers.forEach(speaker => {
                // Try to match speaker with member (simplified)
                const member = Object.values(contributions).find(m => 
                    m.name.toLowerCase().includes(speaker.name.toLowerCase()) ||
                    speaker.name.toLowerCase().includes(m.name.split('@')[0].toLowerCase())
                );
                
                if (member) {
                    member.totalParticipation += speaker.totalDuration || 0;
                }
            });
        }
    });
    
    return Object.values(contributions).sort((a, b) => b.totalParticipation - a.totalParticipation);
}

function generateMeetingFrequency(meetings) {
    const dayOfWeek = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
    const hourOfDay = new Array(24).fill(0);
    
    meetings.forEach(meeting => {
        const date = new Date(meeting.date || meeting.createdAt);
        dayOfWeek[date.getDay()] += 1;
        hourOfDay[date.getHours()] += 1;
    });
    
    return {
        dayOfWeek: dayOfWeek.map((count, index) => ({
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index],
            count
        })),
        hourOfDay: hourOfDay.map((count, hour) => ({ hour, count }))
    };
}

function calculateCollaborationScore(meetings, members) {
    if (meetings.length === 0 || members.length === 0) return 0;
    
    const avgParticipants = meetings.reduce((sum, m) => 
        sum + (m.participants ? m.participants.length : 1), 0) / meetings.length;
    
    const participationRatio = Math.min(avgParticipants / members.length, 1);
    const meetingFrequency = Math.min(meetings.length / 30, 1); // Normalize to monthly
    
    return Math.round((participationRatio * 0.6 + meetingFrequency * 0.4) * 100);
}

function generateWorkspaceInsights(meetings, workspace) {
    const insights = [];
    
    if (meetings.length > 10) {
        insights.push({
            type: 'positive',
            title: 'High Activity',
            description: `Your team has held ${meetings.length} meetings, showing strong collaboration.`
        });
    }
    
    const avgDuration = meetings.reduce((sum, m) => sum + (m.duration || 0), 0) / meetings.length;
    if (avgDuration > 60) {
        insights.push({
            type: 'warning',
            title: 'Long Meetings',
            description: `Average meeting duration is ${Math.round(avgDuration)} minutes. Consider shorter meetings for better focus.`
        });
    }
    
    const totalActionItems = meetings.reduce((sum, m) => sum + (m.actionItems ? m.actionItems.length : 0), 0);
    if (totalActionItems > 0) {
        insights.push({
            type: 'info',
            title: 'Action Oriented',
            description: `${totalActionItems} action items have been created across all meetings.`
        });
    }
    
    return insights;
}

async function analyzeSentiment(transcript) {
    if (!transcript || !transcript.fullText) return null;
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Analyze the sentiment of this meeting transcript. Return a JSON object with overall sentiment (positive/neutral/negative) and confidence score (0-1)."
                },
                {
                    role: "user",
                    content: transcript.fullText.substring(0, 1000)
                }
            ],
            max_tokens: 100,
            temperature: 0.3
        });
        
        const result = JSON.parse(response.choices[0].message.content);
        return result;
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        return null;
    }
}

function analyzeActionItems(actionItems) {
    const completed = actionItems.filter(item => item.completed).length;
    const pending = actionItems.length - completed;
    
    return {
        total: actionItems.length,
        completed,
        pending,
        completionRate: actionItems.length > 0 ? Math.round((completed / actionItems.length) * 100) : 0
    };
}

function calculateEngagementMetrics(meeting) {
    if (!meeting.transcript || !meeting.transcript.segments) {
        return { score: 0, details: 'No transcript data available' };
    }
    
    const segments = meeting.transcript.segments;
    const speakerCount = meeting.transcript.speakers ? meeting.transcript.speakers.length : 1;
    const avgSegmentLength = segments.reduce((sum, seg) => sum + (seg.endTime - seg.startTime), 0) / segments.length;
    
    // Simple engagement score based on speaker participation and interaction
    const participationScore = Math.min((speakerCount / 5) * 100, 100);
    const interactionScore = Math.min((100 / avgSegmentLength) * 10, 100);
    
    return {
        score: Math.round((participationScore + interactionScore) / 2),
        speakerCount,
        avgSegmentLength: Math.round(avgSegmentLength),
        totalSegments: segments.length
    };
}

function extractKeyMoments(transcript) {
    if (!transcript || !transcript.segments) return [];
    
    const keyMoments = [];
    
    transcript.segments.forEach(segment => {
        const text = segment.text.toLowerCase();
        
        // Look for decision-making language
        if (text.includes('decide') || text.includes('agree') || text.includes('conclude')) {
            keyMoments.push({
                type: 'decision',
                timestamp: segment.startTime,
                text: segment.text,
                speaker: segment.speaker
            });
        }
        
        // Look for action items
        if (text.includes('will do') || text.includes('action item') || text.includes('follow up')) {
            keyMoments.push({
                type: 'action',
                timestamp: segment.startTime,
                text: segment.text,
                speaker: segment.speaker
            });
        }
    });
    
    return keyMoments.slice(0, 10); // Limit to top 10 moments
}

function calculateProductivityScore(meeting) {
    let score = 50; // Base score
    
    if (meeting.actionItems && meeting.actionItems.length > 0) {
        score += Math.min(meeting.actionItems.length * 10, 30);
    }
    
    if (meeting.summary && meeting.summary.length > 100) {
        score += 10;
    }
    
    if (meeting.duration && meeting.duration < 60) {
        score += 10; // Bonus for efficient meetings
    }
    
    return Math.min(score, 100);
}

function analyzeSpeakerParticipation(transcript) {
    if (!transcript || !transcript.speakers) return null;
    
    const totalDuration = transcript.speakers.reduce((sum, speaker) => sum + (speaker.totalDuration || 0), 0);
    
    return transcript.speakers.map(speaker => ({
        name: speaker.name,
        duration: speaker.totalDuration || 0,
        percentage: totalDuration > 0 ? Math.round((speaker.totalDuration / totalDuration) * 100) : 0,
        segments: speaker.segmentsCount || 0
    })).sort((a, b) => b.duration - a.duration);
}

// Get bot session status
app.get('/api/bot/status/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    const session = botSessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: 'Bot session not found' });
    }
    
    res.json({
        sessionId: session.id,
        status: session.status,
        platform: session.platform,
        recordingState: session.recordingState,
        participants: session.participants.length,
        transcriptLength: session.transcript.length,
        startTime: session.startTime
    });
});

// Stop bot session
app.post('/api/bot/stop/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const session = botSessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: 'Bot session not found' });
    }
    
    try {
        // Stop recording and cleanup
        await stopBotSession(session);
        
        // Save meeting data to Firebase
        if (session.transcript.length > 0) {
            await saveMeetingData(session);
        }
        
        botSessions.delete(sessionId);
        
        res.json({ 
            success: true, 
            message: 'Bot session stopped and meeting data saved',
            transcriptLength: session.transcript.length
        });
    } catch (error) {
        console.error('Bot Stop Error:', error);
        res.status(500).json({ 
            error: 'Failed to stop bot session', 
            details: error.message 
        });
    }
});

// Helper functions
function detectMeetingPlatform(url) {
    if (url.includes('meet.google.com')) return 'google_meet';
    if (url.includes('zoom.us')) return 'zoom';
    if (url.includes('teams.microsoft.com')) return 'teams';
    if (url.includes('webex.com')) return 'webex';
    return 'unknown';
}

function generateSessionId() {
    return 'bot_' + Math.random().toString(36).substr(2, 9);
}

async function initializeBotSession(session) {
    // Platform-specific bot initialization
    switch (session.platform) {
        case 'google_meet':
            return await initializeGoogleMeetBot(session);
        case 'zoom':
            return await initializeZoomBot(session);
        case 'teams':
            return await initializeTeamsBot(session);
        default:
            return { success: false, error: 'Unsupported platform' };
    }
}

async function initializeGoogleMeetBot(session) {
    try {
        // Use Puppeteer to join Google Meet
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Navigate to meeting URL
        await page.goto(session.url);
        
        // Wait for meeting to load
        await page.waitForSelector('[data-is-muted]', { timeout: 10000 });
        
        // Join meeting (handle permissions)
        await page.click('[data-is-muted]'); // Unmute
        await page.click('[data-is-video-on]'); // Turn on video
        
        // Start transcription monitoring
        startTranscriptionMonitoring(page, session);
        
        return { 
            success: true, 
            botInstance: { browser, page }
        };
    } catch (error) {
        console.error('Google Meet Bot Error:', error);
        return { success: false, error: error.message };
    }
}

async function initializeZoomBot(session) {
    // Similar implementation for Zoom
    return { success: false, error: 'Zoom bot implementation coming soon' };
}

async function initializeTeamsBot(session) {
    // Similar implementation for Teams
    return { success: false, error: 'Teams bot implementation coming soon' };
}

async function startTranscriptionMonitoring(page, session) {
    // Monitor captions/transcript in Google Meet
    try {
        await page.waitForSelector('.a4cQT', { timeout: 15000 });
        
        // Extract transcript text
        const transcriptText = await page.evaluate(() => {
            const captions = document.querySelectorAll('.a4cQT');
            return Array.from(captions).map(el => el.textContent).join(' ');
        });
        
        if (transcriptText) {
            session.transcript.push({
                text: transcriptText,
                timestamp: new Date(),
                speaker: 'Unknown'
            });
        }
        
        // Continue monitoring
        setTimeout(() => startTranscriptionMonitoring(page, session), 2000);
    } catch (error) {
        console.error('Transcription monitoring error:', error);
    }
}

async function startMeetingRecording(session) {
    session.recordingState = 'recording';
    console.log(`Started recording meeting: ${session.id}`);
}

async function stopBotSession(session) {
    session.recordingState = 'stopped';
    
    if (session.botInstance) {
        const { browser, page } = session.botInstance;
        if (page) await page.close();
        if (browser) await browser.close();
    }
}

async function saveMeetingData(session) {
    try {
        const meetingData = {
            id: session.meetingId || generateSessionId(),
            title: `Auto-recorded Meeting (${session.platform})`,
            date: session.startTime.toISOString(),
            platform: session.platform,
            transcript: session.transcript,
            participants: session.participants,
            duration: Math.floor((Date.now() - session.startTime) / 1000),
            summary: await generateMeetingSummary(session.transcript),
            actionItems: await extractActionItems(session.transcript),
            keyTopics: await extractKeyTopics(session.transcript),
            autoRecorded: true
        };
        
        // Save to Firebase
        await admin.database().ref(`meetings/${meetingData.id}`).set(meetingData);
        
        console.log(`Meeting data saved: ${meetingData.id}`);
    } catch (error) {
        console.error('Save meeting data error:', error);
    }
}

async function generateMeetingSummary(transcript) {
    if (transcript.length === 0) return 'No transcript available';
    
    try {
        const transcriptText = transcript.map(t => t.text).join(' ');
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Summarize this meeting transcript in 2-3 sentences, focusing on key decisions and outcomes."
                },
                {
                    role: "user",
                    content: transcriptText.substring(0, 2000) // Limit text length
                }
            ],
            max_tokens: 150,
            temperature: 0.7
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Summary generation error:', error);
        return 'Summary generation failed';
    }
}

async function extractActionItems(transcript) {
    // Simple action item extraction
    const actionPhrases = ['action item', 'to do', 'will', 'should', 'need to'];
    const actionItems = [];
    
    transcript.forEach(entry => {
        const text = entry.text.toLowerCase();
        actionPhrases.forEach(phrase => {
            if (text.includes(phrase)) {
                actionItems.push({
                    task: entry.text,
                    assignee: 'Unknown',
                    deadline: null
                });
            }
        });
    });
    
    return actionItems;
}

async function extractKeyTopics(transcript) {
    // Simple topic extraction using keyword frequency
    const allText = transcript.map(t => t.text).join(' ').toLowerCase();
    const words = allText.split(/\s+/);
    const wordCount = {};
    
    words.forEach(word => {
        if (word.length > 4) { // Only consider words longer than 4 characters
            wordCount[word] = (wordCount[word] || 0) + 1;
        }
    });
    
    // Get top 5 most frequent words
    const sortedWords = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
    
    return sortedWords;
}

// Helper functions for transcription
async function processAudioTranscription(audioPath, session) {
    try {
        // Read audio file
        const audioBuffer = fs.readFileSync(audioPath);
        
        // Transcribe using OpenAI Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-1",
            language: "en",
            response_format: "verbose_json"
        });
        
        // Process transcription with speaker identification
        const processedTranscript = await identifySpeakers(transcription, session);
        
        // Add to session transcript
        session.transcript.push(...processedTranscript.segments);
        
        // Clean up temporary file
        fs.unlinkSync(audioPath);
        
        return processedTranscript;
        
    } catch (error) {
        console.error('Audio processing error:', error);
        throw error;
    }
}

async function identifySpeakers(transcription, session) {
    const segments = [];
    
    // Simple speaker identification based on voice patterns
    // In production, this would use more sophisticated speaker diarization
    let currentSpeaker = 'Speaker 1';
    let speakerCounter = 1;
    
    for (const segment of transcription.segments) {
        // Simple heuristic: change speaker every few segments or on long pauses
        if (segments.length > 0 && segment.start > segments[segments.length - 1].end + 2) {
            speakerCounter++;
            currentSpeaker = `Speaker ${speakerCounter}`;
        }
        
        // Store speaker information
        if (!session.speakers.has(currentSpeaker)) {
            session.speakers.set(currentSpeaker, {
                id: currentSpeaker,
                segmentsCount: 0,
                totalDuration: 0
            });
        }
        
        const speakerInfo = session.speakers.get(currentSpeaker);
        speakerInfo.segmentsCount++;
        speakerInfo.totalDuration += segment.end - segment.start;
        
        segments.push({
            text: segment.text,
            speaker: currentSpeaker,
            startTime: segment.start,
            endTime: segment.end,
            confidence: segment.avg_logprob || 0.8
        });
    }
    
    return {
        text: transcription.text,
        segments: segments,
        speakers: Array.from(session.speakers.values())
    };
}

async function generateFinalTranscript(session) {
    // Sort transcript by timestamp
    const sortedTranscript = session.transcript.sort((a, b) => a.startTime - b.startTime);
    
    // Generate speaker summary
    const speakerSummary = Array.from(session.speakers.values()).map(speaker => ({
        name: speaker.id,
        segmentsCount: speaker.segmentsCount,
        totalDuration: Math.round(speaker.totalDuration),
        percentage: Math.round((speaker.totalDuration / session.transcript.reduce((total, seg) => total + (seg.endTime - seg.startTime), 0)) * 100)
    }));
    
    return {
        segments: sortedTranscript,
        speakers: speakerSummary,
        fullText: sortedTranscript.map(seg => `[${seg.speaker}]: ${seg.text}`).join('\n'),
        summary: await generateTranscriptSummary(sortedTranscript),
        metadata: {
            duration: Math.round(sortedTranscript.reduce((total, seg) => total + (seg.endTime - seg.startTime), 0)),
            segmentsCount: sortedTranscript.length,
            speakersCount: session.speakers.size,
            recordingDate: session.startTime
        }
    };
}

async function generateTranscriptSummary(transcript) {
    if (transcript.length === 0) return 'No transcript available';
    
    try {
        const transcriptText = transcript.map(seg => seg.text).join(' ');
        
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "Summarize this meeting transcript, identifying key points, decisions made, and action items. Format the response with clear sections."
                },
                {
                    role: "user",
                    content: transcriptText.substring(0, 3000)
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('Summary generation error:', error);
        return 'Summary generation failed';
    }
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
