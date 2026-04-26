import { useState } from 'react'
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
const mockMeetings = [
  {
    id: '1',
    title: 'Product Planning Session',
    time: '2:00 PM - 3:00 PM',
    date: 'Today',
    platform: 'Zoom',
    link: 'https://zoom.us/j/123456789',
    participants: 5,
    autoJoin: true,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Client Review Call',
    time: '4:30 PM - 5:00 PM',
    date: 'Today',
    platform: 'Google Meet',
    link: 'https://meet.google.com/abc-defg-hij',
    participants: 3,
    autoJoin: true,
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Team Standup',
    time: '9:00 AM - 9:30 AM',
    date: 'Tomorrow',
    platform: 'Microsoft Teams',
    link: 'https://teams.microsoft.com/l/meetup-join/xyz',
    participants: 8,
    autoJoin: false,
    status: 'scheduled'
  },
  {
    id: '4',
    title: 'Design Review',
    time: '11:00 AM - 12:00 PM',
    date: 'Tomorrow',
    platform: 'Zoom',
    link: 'https://zoom.us/j/987654321',
    participants: 4,
    autoJoin: true,
    status: 'scheduled'
  }
]

import DashboardLayout from '../components/layout/DashboardLayout'

export default function Calendar() {
  const [meetings, setMeetings] = useState(mockMeetings)
  const [isConnected, setIsConnected] = useState(false)
  const [autoJoinEnabled, setAutoJoinEnabled] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [isConnecting, setIsConnecting] = useState(false)

  const platforms = [
    { id: 'all', name: 'All Platforms', icon: CalendarIcon },
    { id: 'zoom', name: 'Zoom', icon: VideoCameraIcon },
    { id: 'google-meet', name: 'Google Meet', icon: VideoCameraIcon },
    { id: 'teams', name: 'Microsoft Teams', icon: VideoCameraIcon }
  ]

  const filteredMeetings = selectedPlatform === 'all' 
    ? meetings 
    : meetings.filter(meeting => meeting.platform.toLowerCase().includes(selectedPlatform))

  const handleConnectCalendar = async () => {
    setIsConnecting(true)
    setTimeout(() => {
      setIsConnected(true)
      setIsConnecting(false)
    }, 2000)
  }

  const handleJoinMeeting = (meeting) => {
    window.open(meeting.link, '_blank')
  }

  const toggleAutoJoin = (meetingId) => {
    setMeetings(prev => prev.map(meeting => 
      meeting.id === meetingId 
        ? { ...meeting, autoJoin: !meeting.autoJoin }
        : meeting
    ))
  }

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'zoom': return '📹';
      case 'google meet': return '📺';
      case 'microsoft teams': return '💼';
      default: return '📅';
    }
  }

  return (
    <DashboardLayout>
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Calendar Integration</h1>
            <p className="text-gray-400 text-lg">Connect your calendar and automatically join meetings</p>
          </div>

          {/* Calendar Connection */}
          <Card variant="glass" className="p-8 mb-10 border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/20">
                  <CalendarIcon className="h-8 w-8 text-brand-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Google Calendar</h3>
                  <p className="text-gray-400">
                    {isConnected ? 'Connected and syncing meetings' : 'Connect to sync your meetings'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {isConnected && (
                  <div className="flex items-center gap-2 text-green-500 font-bold px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Connected</span>
                  </div>
                )}
                
                <button
                  onClick={handleConnectCalendar}
                  disabled={isConnecting}
                  className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                    isConnected 
                      ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10' 
                      : 'btn-brand-purple shadow-xl shadow-purple-500/20'
                  }`}
                >
                  {isConnecting ? (
                    <>
                      <ArrowPathIcon className="h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : isConnected ? (
                    'Disconnect'
                  ) : (
                    'Connect Calendar'
                  )}
                </button>
              </div>
            </div>
          </Card>

          {/* Platform Filter */}
          <div className="mb-10 overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold transition-all border ${
                    selectedPlatform === platform.id
                      ? 'bg-brand-purple border-brand-purple text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <platform.icon className="h-5 w-5" />
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          {/* Meetings List */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Upcoming Meetings</h2>
              <div className="flex items-center gap-4 text-sm font-bold">
                <span className="text-gray-500 uppercase tracking-widest">{filteredMeetings.length} meetings found</span>
                {autoJoinEnabled && isConnected && (
                  <span className="text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/10">Auto-join active</span>
                )}
              </div>
            </div>

            {filteredMeetings.length === 0 ? (
              <Card variant="glass" className="p-20 text-center border-white/5">
                <CalendarIcon className="h-20 w-20 text-white/5 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">No meetings found</h3>
                <p className="text-gray-400 mb-10 max-w-sm mx-auto">
                  {isConnected 
                    ? 'Your calendar is clear! Enjoy the extra time or schedule something new.'
                    : 'Connect your calendar to see your upcoming meetings and start automating your notes.'
                  }
                </p>
                {!isConnected && (
                  <button onClick={handleConnectCalendar} className="btn-brand-purple px-8 py-4 rounded-2xl font-bold text-lg">
                    Connect Calendar
                  </button>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredMeetings.map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card variant="glass" className="p-6 border-white/5 group">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-5 flex-1">
                          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 group-hover:border-brand-purple/30 transition-colors">
                            <span className="text-3xl">{getPlatformIcon(meeting.platform)}</span>
                          </div>
                          
                          <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white group-hover:text-brand-purple transition-colors">{meeting.title}</h3>
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-gray-400 border border-white/10">
                                {meeting.platform}
                              </span>
                              {meeting.autoJoin && autoJoinEnabled && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-purple/10 text-brand-purple border border-brand-purple/20 uppercase tracking-widest">
                                  Auto-join
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500">
                              <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4" />
                                <span>{meeting.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span>{meeting.date}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <UserGroupIcon className="h-4 w-4" />
                                <span>{meeting.participants} participants</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleAutoJoin(meeting.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                              meeting.autoJoin 
                                ? 'bg-brand-purple/10 border-brand-purple/30 text-brand-purple' 
                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                            }`}
                          >
                            {meeting.autoJoin ? 'Auto-join Enabled' : 'Auto-join Disabled'}
                          </button>
                          
                          <button
                            onClick={() => handleJoinMeeting(meeting)}
                            className="px-6 py-2.5 rounded-xl bg-white text-brand-dark font-bold text-sm hover:bg-gray-200 transition-colors shadow-lg"
                          >
                            Join Meeting
                          </button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
  )
}
