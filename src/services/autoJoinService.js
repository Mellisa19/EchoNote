import calendarService from './calendarService'

class AutoJoinService {
  constructor() {
    this.isRunning = false
    this.checkInterval = null
    this.autoJoinEnabled = false
    this.joinedMeetings = new Set()
  }

  // Start auto-join monitoring
  startAutoJoin() {
    if (this.isRunning) return
    
    this.autoJoinEnabled = true
    this.isRunning = true
    
    // Check for meetings every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkAndJoinMeetings()
    }, 30000)
    
    console.log('Auto-join service started')
  }

  // Stop auto-join monitoring
  stopAutoJoin() {
    this.autoJoinEnabled = false
    this.isRunning = false
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    
    console.log('Auto-join service stopped')
  }

  // Check for meetings that need to be joined
  async checkAndJoinMeetings() {
    if (!this.autoJoinEnabled || !calendarService.isUserSignedIn()) {
      return
    }

    try {
      const todayMeetings = await calendarService.getTodayMeetings()
      const now = new Date()
      
      for (const meeting of todayMeetings) {
        if (this.shouldJoinMeeting(meeting, now)) {
          await this.joinMeeting(meeting)
        }
      }
    } catch (error) {
      console.error('Error checking meetings:', error)
    }
  }

  // Determine if a meeting should be joined
  shouldJoinMeeting(meeting, now) {
    // Skip if already joined
    if (this.joinedMeetings.has(meeting.id)) {
      return false
    }

    // Skip if no meeting link
    if (!meeting.meetLink) {
      return false
    }

    const meetingTime = new Date(meeting.startTime)
    const diffMinutes = (meetingTime - now) / (1000 * 60)

    // Join if meeting starts within 2 minutes or has started within the last 5 minutes
    return (diffMinutes > 0 && diffMinutes <= 2) || (diffMinutes < 0 && diffMinutes >= -5)
  }

  // Join a meeting
  async joinMeeting(meeting) {
    try {
      console.log(`Auto-joining meeting: ${meeting.title}`)
      
      // Mark as joined to prevent duplicate joins
      this.joinedMeetings.add(meeting.id)
      
      // Open meeting link in new tab
      window.open(meeting.meetLink, '_blank')
      
      // Trigger meeting join event
      this.onMeetingJoined(meeting)
      
      // Send notification (if supported)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('EchoNote - Auto-Joining Meeting', {
          body: `Joining "${meeting.title}" automatically`,
          icon: '/favicon.ico'
        })
      }
      
    } catch (error) {
      console.error('Failed to auto-join meeting:', error)
    }
  }

  // Handle meeting joined event
  onMeetingJoined(meeting) {
    // This can be extended to trigger recording, notifications, etc.
    window.dispatchEvent(new CustomEvent('meetingAutoJoined', {
      detail: meeting
    }))
  }

  // Request notification permissions
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Get status
  getStatus() {
    return {
      isRunning: this.isRunning,
      autoJoinEnabled: this.autoJoinEnabled,
      connectedToCalendar: calendarService.isUserSignedIn(),
      joinedMeetingsCount: this.joinedMeetings.size
    }
  }
}

export default new AutoJoinService()
