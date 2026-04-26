import { useState, useEffect } from 'react'
import { 
  VideoCameraIcon, 
  LinkIcon, 
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import Button from '../ui/Button'
import calendarService from '../../services/calendarService'
import autoJoinService from '../../services/autoJoinService'

export default function MeetingAutoJoin({ onJoinMeeting, onClose }) {
  const [meetingLink, setMeetingLink] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [todayMeetings, setTodayMeetings] = useState([])
  const [upcomingMeetings, setUpcomingMeetings] = useState([])
  const [autoJoinEnabled, setAutoJoinEnabled] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const [autoJoinServiceStatus, setAutoJoinServiceStatus] = useState(null)

  useEffect(() => {
    checkCalendarConnection()
    loadMeetings()
    updateAutoJoinStatus()
    
    // Request notification permission
    autoJoinService.requestNotificationPermission()
    
    return () => {
      // Cleanup auto-join service when component unmounts
      if (autoJoinService.isRunning) {
        autoJoinService.stopAutoJoin()
      }
    }
  }, [])

  const updateAutoJoinStatus = () => {
    setAutoJoinServiceStatus(autoJoinService.getStatus())
  }

  useEffect(() => {
    checkCalendarConnection()
    loadMeetings()
  }, [])

  const checkCalendarConnection = async () => {
    const isConnected = calendarService.isUserSignedIn()
    setCalendarConnected(isConnected)
    
    if (isConnected) {
      await loadMeetings()
    }
  }

  const loadMeetings = async () => {
    try {
      const today = await calendarService.getTodayMeetings()
      const upcoming = await calendarService.getUpcomingMeetings()
      setTodayMeetings(today)
      setUpcomingMeetings(upcoming)
    } catch (error) {
      console.error('Failed to load meetings:', error)
    }
  }

  const connectCalendar = async () => {
    try {
      const success = await calendarService.signIn()
      if (success) {
        setCalendarConnected(true)
        await loadMeetings()
      }
    } catch (error) {
      console.error('Failed to connect calendar:', error)
    }
  }

  const disconnectCalendar = async () => {
    try {
      await calendarService.signOut()
      setCalendarConnected(false)
      setTodayMeetings([])
      setUpcomingMeetings([])
    } catch (error) {
      console.error('Failed to disconnect calendar:', error)
    }
  }

  const validateMeetingLink = (link) => {
    const meetingPatterns = [
      /https:\/\/meet\.google\.com\/[a-z0-9-]+/gi,
      /https:\/\/zoom\.us\/j\/[0-9]+/gi,
      /https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[a-z0-9-]+/gi,
      /https:\/\/[a-z0-9-]+\.webex\.com\/[a-z0-9-]+/gi
    ]

    return meetingPatterns.some(pattern => pattern.test(link))
  }

  const handleJoinMeeting = async (link = null) => {
    const meetingUrl = link || meetingLink
    
    if (!validateMeetingLink(meetingUrl)) {
      alert('Please enter a valid meeting link (Google Meet, Zoom, Teams, or Webex)')
      return
    }

    setIsJoining(true)
    
    try {
      // Actually open the meeting link in a new tab
      window.open(meetingUrl, '_blank')
      
      // Start recording automatically
      setIsRecording(true)
      
      const meetingData = {
        id: Date.now().toString(),
        title: selectedMeeting?.title || 'Joined Meeting',
        link: meetingUrl,
        startTime: new Date().toISOString(),
        type: 'auto-joined',
        source: selectedMeeting ? 'calendar' : 'manual'
      }
      
      // Notify user that meeting has been joined
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('EchoNote - Meeting Joined', {
          body: `Joined "${meetingData.title}" and started recording`,
          icon: '/favicon.ico'
        })
      }
      
      onJoinMeeting(meetingData)
    } catch (error) {
      console.error('Failed to join meeting:', error)
      alert('Failed to join meeting. Please check the link and try again.')
    } finally {
      setIsJoining(false)
    }
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    onClose()
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const isMeetingStartingSoon = (startTime) => {
    const now = new Date()
    const meetingTime = new Date(startTime)
    const diffMinutes = (meetingTime - now) / (1000 * 60)
    return diffMinutes > 0 && diffMinutes <= 15
  }

  const handleAutoJoinToggle = (enabled) => {
    setAutoJoinEnabled(enabled)
    
    if (enabled && calendarConnected) {
      autoJoinService.startAutoJoin()
    } else {
      autoJoinService.stopAutoJoin()
    }
    
    updateAutoJoinStatus()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <Card variant="glass" className="p-6 border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Meeting Auto-Join</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  </div>
                  <span className="text-red-400 font-bold">Recording Meeting</span>
                </div>
                <Button
                  onClick={handleStopRecording}
                  variant="danger"
                  size="sm"
                >
                  <StopIcon className="h-4 w-4" />
                  Stop
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Calendar Connection & Manual Join */}
            <div className="space-y-6">
              {/* Calendar Connection */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-brand-purple" />
                    Google Calendar
                  </h4>
                  {calendarConnected ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircleIcon className="h-4 w-4" />
                      Connected
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-400 text-sm">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      Not Connected
                    </div>
                  )}
                </div>

                {!calendarConnected ? (
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm">
                      Connect your Google Calendar to automatically detect and join meetings.
                    </p>
                    <Button
                      onClick={connectCalendar}
                      variant="primary"
                      className="w-full"
                      disabled={isJoining}
                    >
                      Connect Calendar
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-400 text-sm">
                      Connected with your account email. EchoNote will automatically detect meetings.
                    </p>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoJoinEnabled}
                          onChange={(e) => handleAutoJoinToggle(e.target.checked)}
                          className="w-4 h-4 rounded text-brand-purple focus:ring-brand-purple"
                        />
                        <span className="text-white text-sm">Auto-join meetings</span>
                      </label>
                    </div>
                    <Button
                      onClick={disconnectCalendar}
                      variant="secondary"
                      size="sm"
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </div>

              {/* Manual Meeting Join */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <LinkIcon className="h-5 w-5 text-brand-purple" />
                  Join Meeting by Link
                </h4>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Paste meeting link (Google Meet, Zoom, Teams, Webex)"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                    disabled={isJoining || isRecording}
                  />
                  
                  <Button
                    onClick={() => handleJoinMeeting()}
                    variant="primary"
                    className="w-full"
                    disabled={!meetingLink || isJoining || isRecording}
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Joining...
                      </>
                    ) : (
                      <>
                        <VideoCameraIcon className="h-4 w-4 mr-2" />
                        Join & Record
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Today's Meetings */}
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <ClockIcon className="h-5 w-5 text-brand-purple" />
                  Today's Meetings
                </h4>

                {!calendarConnected ? (
                  <p className="text-gray-400 text-center py-8">
                    Connect your calendar to see today's meetings
                  </p>
                ) : todayMeetings.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No meetings scheduled for today
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {todayMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        className={`p-3 rounded-lg border ${
                          isMeetingStartingSoon(meeting.startTime)
                            ? 'bg-brand-purple/10 border-brand-purple/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="text-white font-medium text-sm">{meeting.title}</h5>
                            <p className="text-gray-400 text-xs">
                              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                            </p>
                          </div>
                          {isMeetingStartingSoon(meeting.startTime) && (
                            <div className="px-2 py-1 bg-brand-purple text-white text-xs rounded-full">
                              Starting Soon
                            </div>
                          )}
                        </div>

                        {meeting.meetLink ? (
                          <Button
                            onClick={() => {
                              setSelectedMeeting(meeting)
                              setMeetingLink(meeting.meetLink)
                              handleJoinMeeting(meeting.meetLink)
                            }}
                            variant="primary"
                            size="sm"
                            className="w-full"
                            disabled={isJoining || isRecording}
                          >
                            <VideoCameraIcon className="h-3 w-3 mr-1" />
                            Auto-Join
                          </Button>
                        ) : (
                          <div className="text-gray-500 text-xs text-center py-2">
                            No meeting link available
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Meetings Preview */}
              {calendarConnected && upcomingMeetings.length > 0 && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-sm font-bold text-white mb-3">Upcoming (7 days)</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {upcomingMeetings.slice(0, 3).map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 truncate flex-1">
                          {meeting.title}
                        </span>
                        <span className="text-gray-500 text-xs ml-2">
                          {meeting.startTime.toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    {upcomingMeetings.length > 3 && (
                      <p className="text-gray-500 text-xs text-center">
                        +{upcomingMeetings.length - 3} more meetings
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auto-Join Settings */}
          {calendarConnected && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-white font-medium">Smart Auto-Join</h5>
                  <p className="text-gray-400 text-sm">
                    Automatically join and record meetings from your calendar
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoJoinEnabled}
                    onChange={(e) => setAutoJoinEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-purple"></div>
                </label>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
