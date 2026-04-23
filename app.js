/**
 * EchoNote - Clean & Organized Application
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCyyeUZB7QMkozvyJyf2SvV7KsqcSEHIcI",
    authDomain: "echonote-bd009.firebaseapp.com",
    databaseURL: "https://echonote-bd009-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "echonote-bd009",
    storageBucket: "echonote-bd009.firebasestorage.app",
    messagingSenderId: "172798279810",
    appId: "1:172798279810:web:70a1ead77d4e89ae59b49b",
    measurementId: "G-JFXT9Y8CSE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const App = {
    state: {
        currentView: 'dashboard',
        meetings: [],
        selectedMeeting: null,
        user: null,
        isAuthenticated: false,
        searchQuery: '',
        calendarEvents: [],
        calendarConnected: false,
        integrations: {
            firefly: { connected: true, connectedAt: new Date().toISOString() },
            notion: { connected: false },
            slack: { connected: false },
            teams: { connected: false },
            zoom: { connected: false }
        }
    },

    init() {
        this.initTheme();
        this.cacheElements();
        this.bindEvents();
        this.initAuth();
        this.loadMeetings();
    },

    initTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('echonote_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    },

    cacheElements() {
        this.elements = {
            sidebar: document.querySelector('.sidebar'),
            navItems: document.querySelectorAll('.nav-item'),
            userProfile: document.getElementById('user-profile'),
            userDropdown: document.getElementById('user-dropdown'),
            userName: document.getElementById('user-name'),
            userEmail: document.getElementById('user-email'),
            userAvatar: document.getElementById('user-avatar'),
            logoutBtn: document.getElementById('logout-btn'),
            searchInput: document.querySelector('.global-search'),
            dynamicContent: document.getElementById('dynamic-content')
        };
    },

    bindEvents() {
        // Navigation
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = item.id.replace('nav-', '');
                this.switchView(viewId);
            });
        });

        // User profile dropdown
        this.elements.userProfile.addEventListener('click', () => {
            this.elements.userDropdown.classList.toggle('show');
        });

        // Logout
        this.elements.logoutBtn.addEventListener('click', () => {
            auth.signOut();
        });

        // Search
        this.elements.searchInput.addEventListener('input', (e) => {
            this.state.searchQuery = e.target.value;
            this.render();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.elements.userProfile.contains(e.target)) {
                this.elements.userDropdown.classList.remove('show');
            }
        });
    },

    initAuth() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.state.user = user;
                this.state.isAuthenticated = true;
                this.updateUserProfile(user);
                this.loadMeetings();
            } else {
                this.state.user = null;
                this.state.isAuthenticated = false;
                this.state.calendarConnected = false;
                this.state.calendarEvents = [];
                this.switchView('login');
            }
            this.render();
        });
    },

    updateUserProfile(user) {
        if (this.elements.userName) {
            this.elements.userName.textContent = user.displayName || user.email || 'User';
        }
        if (this.elements.userEmail) {
            this.elements.userEmail.textContent = user.email || 'user@example.com';
        }
        if (this.elements.userAvatar) {
            this.elements.userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=4285f4&color=fff&rounded=true`;
        }
    },

    switchView(view, params = null) {
        this.state.currentView = view;
        if (params && params.meetingId) {
            this.state.selectedMeeting = this.state.meetings.find(m => m.id === parseInt(params.meetingId));
        }
        
        // Update navigation active state
        this.elements.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.id === `nav-${view}`) {
                item.classList.add('active');
            }
        });
        
        this.render();
    },

    loadMeetings() {
        if (!this.state.isAuthenticated) return;
        
        // Load from Firebase
        firebase.database().ref('meetings').on('value', (snapshot) => {
            const meetings = [];
            snapshot.forEach(child => {
                const meeting = child.val();
                meetings.push({
                    id: child.key,
                    ...meeting
                });
            });
            this.state.meetings = meetings.reverse(); // Show newest first
            this.render();
        });
    },

    render() {
        const container = this.elements.dynamicContent;
        
        switch (this.state.currentView) {
            case 'dashboard':
                this.renderCleanDashboard();
                break;
            case 'meetings':
                this.renderMeetings();
                break;
            case 'integrations':
                this.renderIntegrations();
                break;
            case 'settings':
                this.renderSettings();
                break;
            default:
                this.renderCleanDashboard();
        }
    },

    renderCleanDashboard() {
        const container = this.elements.dynamicContent;
        
        // Clean, organized dashboard
        container.innerHTML = `
            <!-- Stats Overview -->
            <div class="stats-grid">
                <div class="firebase-card">
                    <div class="firebase-card-body">
                        <div class="stat-item">
                            <div class="stat-icon" style="background: #eff6ff; color: #4285f4;">
                                <span class="material-icons">video_library</span>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${this.state.meetings.length}</div>
                                <div class="stat-label">Total Meetings</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="firebase-card">
                    <div class="firebase-card-body">
                        <div class="stat-item">
                            <div class="stat-icon" style="background: #d1fae5; color: #065f46;">
                                <span class="material-icons">check_circle</span>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${this.state.meetings.filter(m => m.summary).length}</div>
                                <div class="stat-label">Completed</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="firebase-card">
                    <div class="firebase-card-body">
                        <div class="stat-item">
                            <div class="stat-icon" style="background: #fef3c7; color: #92400e;">
                                <span class="material-icons">assignment</span>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${this.state.meetings.reduce((sum, m) => sum + (m.actionItems ? m.actionItems.length : 0), 0)}</div>
                                <div class="stat-label">Action Items</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="firebase-card">
                    <div class="firebase-card-body">
                        <div class="stat-item">
                            <div class="stat-icon" style="background: #fee2e2; color: #991b1b;">
                                <span class="material-icons">schedule</span>
                            </div>
                            <div class="stat-content">
                                <div class="stat-value">${this.state.calendarEvents.length}</div>
                                <div class="stat-label">Upcoming</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="content-grid">
                <!-- Recent Meetings -->
                <div class="firebase-card">
                    <div class="firebase-card-header">
                        <h3 class="firebase-card-title">Recent Meetings</h3>
                        <button class="btn btn-text" onclick="App.switchView('meetings')">
                            View All
                            <span class="material-icons">arrow_forward</span>
                        </button>
                    </div>
                    <div class="firebase-card-body">
                        <div class="meeting-list">
                            ${this.state.meetings.slice(0, 5).map(meeting => `
                                <div class="meeting-item" onclick="App.viewMeeting('${meeting.id}')">
                                    <div class="meeting-icon">
                                        <span class="material-icons">video_library</span>
                                    </div>
                                    <div class="meeting-details">
                                        <div class="meeting-title">${meeting.title || 'Untitled Meeting'}</div>
                                        <div class="meeting-meta">${meeting.date || 'No date'} • ${meeting.duration ? Math.round(meeting.duration / 60) + ' min' : 'Unknown duration'}</div>
                                    </div>
                                    <div class="meeting-actions">
                                        ${meeting.summary ? '<span class="status-indicator status-active">Processed</span>' : '<span class="status-indicator status-pending">Processing</span>'}
                                    </div>
                                </div>
                            `).join('') || `
                                <div class="empty-state">
                                    <span class="material-icons">video_library</span>
                                    <p>No meetings yet</p>
                                    <button class="btn btn-primary" onclick="App.startNewMeeting()">
                                        <span class="material-icons">add</span>
                                        Start Meeting
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Calendar Integration -->
                <div class="firebase-card">
                    <div class="firebase-card-header">
                        <h3 class="firebase-card-title">Today's Schedule</h3>
                        <div class="status-indicator ${this.state.calendarConnected ? 'status-active' : 'status-pending'}">
                            ${this.state.calendarConnected ? 'Connected' : 'Not Connected'}
                        </div>
                    </div>
                    <div class="firebase-card-body">
                        <div class="calendar-events">
                            ${this.state.calendarEvents.length > 0 ? 
                                this.state.calendarEvents.slice(0, 3).map(event => `
                                    <div class="calendar-event">
                                        <div class="calendar-event-title">${event.summary || 'No title'}</div>
                                        <div class="calendar-event-time">${new Date(event.start.dateTime || event.start.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(event.end.dateTime || event.end.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                    </div>
                                `).join('') : 
                                '<div class="empty-state"><p>No calendar events today</p></div>'
                            }
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="firebase-card">
                <div class="firebase-card-header">
                    <h3 class="firebase-card-title">Quick Actions</h3>
                </div>
                <div class="firebase-card-body">
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" onclick="App.startNewMeeting()">
                            <span class="material-icons">mic</span>
                            <span>Start Recording</span>
                        </button>
                        <button class="quick-action-btn" onclick="App.uploadRecording()">
                            <span class="material-icons">upload_file</span>
                            <span>Upload Audio</span>
                        </button>
                        <button class="quick-action-btn" onclick="App.syncCalendar()">
                            <span class="material-icons">sync</span>
                            <span>Sync Calendar</span>
                        </button>
                        <button class="quick-action-btn" onclick="App.switchView('integrations')">
                            <span class="material-icons">integration_instructions</span>
                            <span>Integrations</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderMeetings() {
        const container = this.elements.dynamicContent;
        
        container.innerHTML = `
            <div class="meetings-container">
                <div class="meetings-header">
                    <h2>My Meetings</h2>
                    <button class="btn btn-primary" onclick="App.startNewMeeting()">
                        <span class="material-icons">add</span>
                        New Meeting
                    </button>
                </div>
                <div class="meetings-grid">
                    ${this.state.meetings.map(meeting => `
                        <div class="meeting-card" onclick="App.viewMeeting('${meeting.id}')">
                            <div class="meeting-card-header">
                                <h3>${meeting.title || 'Untitled Meeting'}</h3>
                                <div class="meeting-meta">
                                    <span>${meeting.date || 'No date'}</span>
                                    <span>${meeting.duration ? Math.round(meeting.duration / 60) + ' min' : 'Unknown'}</span>
                                </div>
                            </div>
                            <div class="meeting-card-body">
                                <p>${meeting.summary ? meeting.summary.substring(0, 150) + '...' : 'No summary available'}</p>
                                ${meeting.actionItems && meeting.actionItems.length > 0 ? `
                                    <div class="action-items">
                                        <strong>Action Items:</strong>
                                        <ul>
                                            ${meeting.actionItems.slice(0, 3).map(item => `<li>${item.task || item}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('') || `
                        <div class="empty-state">
                            <span class="material-icons">video_library</span>
                            <h3>No meetings yet</h3>
                            <p>Start your first meeting to see it here</p>
                            <button class="btn btn-primary" onclick="App.startNewMeeting()">
                                <span class="material-icons">add</span>
                                Start Meeting
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    renderIntegrations() {
        const container = this.elements.dynamicContent;
        
        container.innerHTML = `
            <div class="integrations-container">
                <div class="firebase-card">
                    <div class="firebase-card-header">
                        <h3 class="firebase-card-title">Connected Apps</h3>
                        <p class="firebase-card-subtitle">Integrate EchoNote with your favorite tools</p>
                    </div>
                    <div class="firebase-card-body">
                        <div class="integrations-grid">
                            <!-- Firefly Note Taker -->
                            <div class="integration-card" data-app="firefly">
                                <div class="integration-logo">
                                    <div class="integration-icon" style="background: #ff6b35;">🔥</div>
                                </div>
                                <div class="integration-info">
                                    <h4>Firefly Note Taker</h4>
                                    <p>AI-powered meeting notes and action items</p>
                                    <div class="integration-status">
                                        <span class="status-indicator status-active">Connected</span>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn btn-secondary" onclick="App.configureIntegration('firefly')">
                                        <span class="material-icons">settings</span>
                                        Configure
                                    </button>
                                    <button class="btn btn-text" onclick="App.disconnectIntegration('firefly')">
                                        Disconnect
                                    </button>
                                </div>
                            </div>

                            <!-- Notion -->
                            <div class="integration-card" data-app="notion">
                                <div class="integration-logo">
                                    <div class="integration-icon" style="background: #000000;">📝</div>
                                </div>
                                <div class="integration-info">
                                    <h4>Notion</h4>
                                    <p>Sync meetings to your Notion workspace</p>
                                    <div class="integration-status">
                                        <span class="status-indicator status-pending">Not Connected</span>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn btn-primary" onclick="App.connectIntegration('notion')">
                                        <span class="material-icons">link</span>
                                        Connect
                                    </button>
                                </div>
                            </div>

                            <!-- Slack -->
                            <div class="integration-card" data-app="slack">
                                <div class="integration-logo">
                                    <div class="integration-icon" style="background: #4a154b;">💬</div>
                                </div>
                                <div class="integration-info">
                                    <h4>Slack</h4>
                                    <p>Share meeting summaries in Slack channels</p>
                                    <div class="integration-status">
                                        <span class="status-indicator status-pending">Not Connected</span>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn btn-primary" onclick="App.connectIntegration('slack')">
                                        <span class="material-icons">link</span>
                                        Connect
                                    </button>
                                </div>
                            </div>

                            <!-- Microsoft Teams -->
                            <div class="integration-card" data-app="teams">
                                <div class="integration-logo">
                                    <div class="integration-icon" style="background: #2b2d72;">👥</div>
                                </div>
                                <div class="integration-info">
                                    <h4>Microsoft Teams</h4>
                                    <p>Auto-join Teams meetings</p>
                                    <div class="integration-status">
                                        <span class="status-indicator status-pending">Not Connected</span>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn btn-primary" onclick="App.connectIntegration('teams')">
                                        <span class="material-icons">link</span>
                                        Connect
                                    </button>
                                </div>
                            </div>

                            <!-- Google Calendar -->
                            <div class="integration-card" data-app="google-calendar">
                                <div class="integration-logo">
                                    <div class="integration-icon" style="background: #4285f4;">📅</div>
                                </div>
                                <div class="integration-info">
                                    <h4>Google Calendar</h4>
                                    <p>Sync meetings and auto-join events</p>
                                    <div class="integration-status">
                                        <span class="status-indicator ${this.state.calendarConnected ? 'status-active' : 'status-pending'}">
                                            ${this.state.calendarConnected ? 'Connected' : 'Not Connected'}
                                        </span>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn ${this.state.calendarConnected ? 'btn-secondary' : 'btn-primary'}" onclick="App.${this.state.calendarConnected ? 'disconnectCalendar' : 'connectGoogleCalendar'}()">
                                        <span class="material-icons">${this.state.calendarConnected ? 'link_off' : 'link'}</span>
                                        ${this.state.calendarConnected ? 'Disconnect' : 'Connect'}
                                    </button>
                                </div>
                            </div>

                            <!-- Zoom -->
                            <div class="integration-card" data-app="zoom">
                                <div class="integration-logo">
                                    <div class="integration-icon" style="background: #2d8cff;">📹</div>
                                </div>
                                <div class="integration-info">
                                    <h4>Zoom</h4>
                                    <p>Auto-join Zoom meetings</p>
                                    <div class="integration-status">
                                        <span class="status-indicator status-pending">Not Connected</span>
                                    </div>
                                </div>
                                <div class="integration-actions">
                                    <button class="btn btn-primary" onclick="App.connectIntegration('zoom')">
                                        <span class="material-icons">link</span>
                                        Connect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Integration Benefits -->
                <div class="firebase-card">
                    <div class="firebase-card-header">
                        <h3 class="firebase-card-title">Integration Benefits</h3>
                    </div>
                    <div class="firebase-card-body">
                        <div class="benefits-list">
                            <div class="benefit-item">
                                <span class="benefit-icon">🔄</span>
                                <div class="benefit-content">
                                    <h5>Automatic Sync</h5>
                                    <p>Seamlessly sync meetings and notes across all your tools</p>
                                </div>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">🤖</span>
                                <div class="benefit-content">
                                    <h5>AI Enhancement</h5>
                                    <p>Get AI-powered insights across all connected platforms</p>
                                </div>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">⚡</span>
                                <div class="benefit-content">
                                    <h5>Real-time Updates</h5>
                                    <p>Instant updates when meetings are created or updated</p>
                                </div>
                            </div>
                            <div class="benefit-item">
                                <span class="benefit-icon">🔒</span>
                                <div class="benefit-content">
                                    <h5>Secure Integration</h5>
                                    <p>Enterprise-grade security for all connections</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderSettings() {
        const container = this.elements.dynamicContent;
        
        container.innerHTML = `
            <div class="settings-container">
                <div class="firebase-card">
                    <div class="firebase-card-header">
                        <h3 class="firebase-card-title">Settings</h3>
                    </div>
                    <div class="firebase-card-body">
                        <div class="setting-group">
                            <h4>Appearance</h4>
                            <label class="setting-item">
                                <input type="checkbox" id="dark-mode-toggle" onchange="App.toggleDarkMode()">
                                <span>Dark Mode</span>
                            </label>
                        </div>
                        <div class="setting-group">
                            <h4>Account</h4>
                            <div class="setting-item">
                                <strong>Email:</strong> ${this.state.user?.email || 'Not available'}
                            </div>
                            <div class="setting-item">
                                <strong>Name:</strong> ${this.state.user?.displayName || 'Not available'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    viewMeeting(meetingId) {
        this.state.selectedMeeting = this.state.meetings.find(m => m.id === meetingId);
        if (this.state.selectedMeeting) {
            this.renderMeetingDetail();
        }
    },

    renderMeetingDetail() {
        const meeting = this.state.selectedMeeting;
        const container = this.elements.dynamicContent;
        
        container.innerHTML = `
            <div class="meeting-detail-container">
                <div class="meeting-detail-header">
                    <button class="btn btn-text" onclick="App.switchView('meetings')">
                        <span class="material-icons">arrow_back</span>
                        Back to Meetings
                    </button>
                    <h2>${meeting.title || 'Untitled Meeting'}</h2>
                </div>
                
                <div class="meeting-detail-content">
                    <div class="firebase-card">
                        <div class="firebase-card-header">
                            <h3>Meeting Details</h3>
                        </div>
                        <div class="firebase-card-body">
                            <div class="detail-row">
                                <strong>Date:</strong> ${meeting.date || 'No date'}
                            </div>
                            <div class="detail-row">
                                <strong>Duration:</strong> ${meeting.duration ? Math.round(meeting.duration / 60) + ' minutes' : 'Unknown'}
                            </div>
                            ${meeting.platform ? `
                                <div class="detail-row">
                                    <strong>Platform:</strong> ${meeting.platform}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    ${meeting.summary ? `
                        <div class="firebase-card">
                            <div class="firebase-card-header">
                                <h3>Summary</h3>
                            </div>
                            <div class="firebase-card-body">
                                <p>${meeting.summary}</p>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${meeting.actionItems && meeting.actionItems.length > 0 ? `
                        <div class="firebase-card">
                            <div class="firebase-card-header">
                                <h3>Action Items</h3>
                            </div>
                            <div class="firebase-card-body">
                                <ul class="action-items-list">
                                    ${meeting.actionItems.map(item => `
                                        <li class="action-item">
                                            <input type="checkbox" ${item.completed ? 'checked' : ''}>
                                            <span>${item.task || item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    ` : ''}
                    
                    ${meeting.transcript ? `
                        <div class="firebase-card">
                            <div class="firebase-card-header">
                                <h3>Transcript</h3>
                                <button class="btn btn-secondary" onclick="App.exportMeeting('${meeting.id}', 'markdown')">
                                    <span class="material-icons">download</span>
                                    Export
                                </button>
                            </div>
                            <div class="firebase-card-body">
                                <div class="transcript-content">
                                    ${meeting.transcript.fullText || meeting.transcript}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    startNewMeeting() {
        this.showToast('Starting new meeting...', 'info');
        // Implementation would go here
    },

    uploadRecording() {
        this.showToast('Upload feature coming soon...', 'info');
        // Implementation would go here
    },

    syncCalendar() {
        this.showToast('Calendar sync coming soon...', 'info');
        // Implementation would go here
    },

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('echonote_theme', isDark ? 'dark' : 'light');
    },

    exportMeeting(meetingId, format) {
        this.showToast('Export feature coming soon...', 'info');
        // Implementation would go here
    },

    connectIntegration(app) {
        this.showToast(`Connecting to ${app}...`, 'info');
        // Simulate connection
        setTimeout(() => {
            this.state.integrations = this.state.integrations || {};
            this.state.integrations[app] = {
                connected: true,
                connectedAt: new Date().toISOString()
            };
            this.showToast(`${app} connected successfully!`, 'success');
            this.renderIntegrations();
        }, 2000);
    },

    disconnectIntegration(app) {
        this.showToast(`Disconnecting from ${app}...`, 'info');
        // Simulate disconnection
        setTimeout(() => {
            if (this.state.integrations) {
                this.state.integrations[app] = {
                    connected: false,
                    disconnectedAt: new Date().toISOString()
                };
            }
            this.showToast(`${app} disconnected`, 'info');
            this.renderIntegrations();
        }, 1000);
    },

    configureIntegration(app) {
        this.showToast(`Opening ${app} configuration...`, 'info');
        // Would open configuration modal
    },

    connectGoogleCalendar() {
        this.showToast('Connecting to Google Calendar...', 'info');
        // Simulate connection
        setTimeout(() => {
            this.state.calendarConnected = true;
            this.state.calendarEvents = [
                {
                    summary: 'Team Standup',
                    start: { dateTime: new Date(Date.now() + 3600000).toISOString() },
                    end: { dateTime: new Date(Date.now() + 7200000).toISOString() }
                },
                {
                    summary: 'Project Review',
                    start: { dateTime: new Date(Date.now() + 7200000).toISOString() },
                    end: { dateTime: new Date(Date.now() + 10800000).toISOString() }
                }
            ];
            this.showToast('Google Calendar connected!', 'success');
            this.renderIntegrations();
        }, 2000);
    },

    disconnectCalendar() {
        this.showToast('Disconnecting Google Calendar...', 'info');
        setTimeout(() => {
            this.state.calendarConnected = false;
            this.state.calendarEvents = [];
            this.showToast('Google Calendar disconnected', 'info');
            this.renderIntegrations();
        }, 1000);
    },

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
