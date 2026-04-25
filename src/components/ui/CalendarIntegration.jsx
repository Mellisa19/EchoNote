import { useState } from 'react'
import { 
  CalendarIcon, 
  LinkIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'
import Card from './Card'
import { Input } from './Input'

export default function CalendarIntegration({ onMeetingLinkAdd, onCalendarConnect }) {
  const [isConnected, setIsConnected] = useState(false)
  const [showAddMeeting, setShowAddMeeting] = useState(false)
  const [meetingLink, setMeetingLink] = useState('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [upcomingMeetings, setUpcomingMeetings] = useState([
    {
      id: '1',
      title: 'Product Planning Session',
      time: '2:00 PM - 3:00 PM',
      link: 'https://zoom.us/j/123456789',
      participants: 5,
      status: 'upcoming'
    },
    {
      id: '2', 
      title: 'Client Review Call',
      time: '4:30 PM - 5:00 PM',
      link: 'https://meet.google.com/abc-defg-hij',
      participants: 3,
      status: 'upcoming'
    }
  ])

  const handleConnectCalendar = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      // Simulate calendar connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsConnected(true)
      onCalendarConnect?.()
    } catch (err) {
      setError('Failed to connect calendar. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMeetingLink = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!meetingLink || !meetingTitle) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    try {
      const newMeeting = {
        id: Date.now().toString(),
        title: meetingTitle,
        time: meetingTime || 'Not specified',
        link: meetingLink,
        participants: 0,
        status: 'manual'
      }
      
      setUpcomingMeetings(prev => [newMeeting, ...prev])
      onMeetingLinkAdd?.(newMeeting)
      
      // Reset form
      setMeetingLink('')
      setMeetingTitle('')
      setMeetingTime('')
      setShowAddMeeting(false)
    } catch (err) {
      setError('Failed to add meeting link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinMeeting = (meeting) => {
    window.open(meeting.link, '_blank')
  }

  return (
    <Card variant="default" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100">
            <CalendarIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Calendar Integration</h3>
            <p className="text-sm text-gray-600">Connect your calendar for automatic meeting detection</p>
          </div>
        </div>
        
        {isConnected ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnectCalendar}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Calendar'}
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Add Meeting Link Button */}
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => setShowAddMeeting(!showAddMeeting)}
          className="w-full"
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Add Meeting Link Manually
        </Button>
      </div>

      {/* Add Meeting Form */}
      <AnimatePresence>
        {showAddMeeting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card variant="minimal" className="p-4">
              <form onSubmit={handleAddMeetingLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Team Standup"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Link
                  </label>
                  <Input
                    type="url"
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Time (optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., 2:00 PM - 3:00 PM"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? 'Adding...' : 'Add Meeting'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddMeeting(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Meetings */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">Upcoming Meetings</h4>
        <div className="space-y-3">
          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No upcoming meetings found</p>
              <p className="text-xs mt-1">Connect your calendar or add meeting links manually</p>
            </div>
          ) : (
            upcomingMeetings.map((meeting) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white">
                    <ClockIcon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-medium text-gray-900 truncate">
                      {meeting.title}
                    </h5>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{meeting.time}</span>
                      {meeting.participants > 0 && (
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="h-3 w-3" />
                          {meeting.participants}
                        </span>
                      )}
                      {meeting.status === 'manual' && (
                        <span className="text-accent-600">Manual</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJoinMeeting(meeting)}
                  >
                    Join
                  </Button>
                  {meeting.status === 'manual' && (
                    <button
                      onClick={() => setUpcomingMeetings(prev => prev.filter(m => m.id !== meeting.id))}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Auto-Join Settings */}
      {isConnected && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-Join Meetings</h4>
              <p className="text-xs text-gray-600">Automatically join meetings when they start</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      )}
    </Card>
  )
}
