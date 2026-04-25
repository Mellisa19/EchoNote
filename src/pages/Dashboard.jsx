import { useState } from 'react'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  SparklesIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  CalendarIcon,
  VideoCameraIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import AIPanel from '../components/layout/AIPanel'
import Card from '../components/ui/Card'
import DashboardLayout from '../components/layout/DashboardLayout'

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiPanelOpen, setAiPanelOpen] = useState(true)
  const [selectedNote, setSelectedNote] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const { user } = useAuth()

  const handleNoteSelect = (note) => {
    setSelectedNote(note)
    if (!aiPanelOpen) {
      setAiPanelOpen(true)
    }
  }

  const handleRecording = () => {
    setIsRecording(!isRecording)
  }

  const stats = [
    { label: 'Meetings Today', value: '3', icon: CalendarIcon, color: 'indigo' },
    { label: 'Total Recordings', value: '47', icon: VideoCameraIcon, color: 'blue' },
    { label: 'AI Summaries', value: '142', icon: SparklesIcon, color: 'purple' },
    { label: 'Action Items', value: '23', icon: ChartBarIcon, color: 'green' }
  ]

  const recentMeetings = [
    {
      id: '1',
      title: 'Product Planning Session',
      time: '10:00 AM',
      duration: '45 min',
      participants: ['John D.', 'Sarah M.', 'Mike R.'],
      status: 'completed',
      summary: 'Discussed Q3 roadmap and feature prioritization for mobile app.',
      recording: true,
      aiProcessed: true
    },
    {
      id: '2',
      title: 'Client Review Call',
      time: '2:30 PM',
      duration: '30 min',
      participants: ['Client Team', 'Sarah M.'],
      status: 'in-progress',
      summary: 'Reviewing project deliverables and timeline adjustments.',
      recording: false,
      aiProcessed: false
    },
    {
      id: '3',
      title: 'Team Standup',
      time: '4:00 PM',
      duration: '15 min',
      participants: ['Dev Team'],
      status: 'upcoming',
      summary: 'Daily sync and blocker discussion.',
      recording: false,
      aiProcessed: false
    }
  ]

  const upcomingMeetings = [
    {
      id: '4',
      title: 'Design Review',
      time: 'Tomorrow, 11:00 AM',
      duration: '1 hour',
      platform: 'Zoom',
      link: 'https://zoom.us/j/123456789'
    },
    {
      id: '5',
      title: 'Sprint Planning',
      time: 'Friday, 2:00 PM',
      duration: '2 hours',
      platform: 'Teams',
      link: 'https://teams.microsoft.com/l/meetup-join/xyz'
    }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-8">
        {/* Welcome Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
              Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-gray-400 text-lg">What would you like to do today?</p>
          </div>

          {isRecording && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 shadow-lg shadow-red-500/10"
            >
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping" />
              </div>
              <span className="font-bold uppercase tracking-widest text-xs">Recording Meeting...</span>
              <div className="h-4 w-[1px] bg-red-500/30 mx-1" />
              <button 
                onClick={handleRecording}
                className="text-xs font-black hover:underline transition-all"
              >
                STOP
              </button>
            </motion.div>
          )}
        </div>

        {/* Action Cards (The Figma Three) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card 
            variant="purple" 
            className="p-8 cursor-pointer group relative overflow-hidden"
            onClick={handleRecording}
          >
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MicrophoneIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Start a Meeting</h3>
              <p className="text-white/80">Record and transcribe in real-time</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <SparklesIcon className="h-24 w-24" />
            </div>
          </Card>

          <Card 
            variant="blue" 
            className="p-8 cursor-pointer group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Upload Audio</h3>
              <p className="text-white/80">Process your existing recordings</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <PlusIcon className="h-24 w-24" />
            </div>
          </Card>

          <Card 
            variant="orange" 
            className="p-8 cursor-pointer group relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CalendarIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Connect Calendar</h3>
              <p className="text-white/80">Auto-join your scheduled calls</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <CalendarIcon className="h-24 w-24" />
            </div>
          </Card>
        </div>

        {/* Meetings Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white">Recent Meetings</h3>
            <button className="text-brand-purple font-semibold hover:text-brand-pink transition-colors">
              View all
            </button>
          </div>
          
          <div className="space-y-4">
            {recentMeetings.map((meeting) => (
              <Card 
                key={meeting.id} 
                variant="glass" 
                className="p-5 group flex flex-col md:flex-row md:items-center justify-between gap-6"
                onClick={() => handleNoteSelect(meeting)}
              >
                <div className="flex items-center gap-5 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    meeting.status === 'completed' ? 'bg-green-500/10' : 'bg-brand-purple/10'
                  }`}>
                    <VideoCameraIcon className={`h-7 w-7 ${
                      meeting.status === 'completed' ? 'text-green-500' : 'text-brand-purple'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-brand-purple transition-colors">
                      {meeting.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4" />
                        {meeting.time}
                      </span>
                      <span>•</span>
                      <span>{meeting.duration}</span>
                      <span>•</span>
                      <div className="flex -space-x-2">
                        {meeting.participants.slice(0, 3).map((p, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-brand-surface border border-brand-dark flex items-center justify-center text-[10px] font-bold text-white">
                            {p[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {meeting.aiProcessed && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 uppercase tracking-wider">
                      <SparklesIcon className="h-3 w-3" />
                      Transcribed
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                      <PlayIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                      <DocumentTextIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* AI Panel */}
      <AIPanel 
        open={aiPanelOpen} 
        onToggle={() => setAiPanelOpen(!aiPanelOpen)}
        note={selectedNote}
      />
    </DashboardLayout>
  )
}
