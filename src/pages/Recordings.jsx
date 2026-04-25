import { useState } from 'react'
import { 
  VideoCameraIcon, 
  SparklesIcon, 
  ClockIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  PlayIcon,
  DocumentTextIcon,
  TrashIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/ui/Card'
import AIPanel from '../components/layout/AIPanel'

const recordings = [
  {
    id: '1',
    title: 'Product Strategy Review',
    date: 'Oct 24, 2023',
    duration: '45:20',
    participants: ['Alice Johnson', 'Bob Smith', 'Charlie Davis'],
    status: 'transcribed',
    preview: 'Discussion on the Q4 roadmap and focus on mobile-first features...',
    size: '12.4 MB'
  },
  {
    id: '2',
    title: 'Client Onboarding - Acme Corp',
    date: 'Oct 23, 2023',
    duration: '32:15',
    participants: ['Sarah Wilson', 'David Miller'],
    status: 'transcribed',
    preview: 'Initial walkthrough of the platform and setup requirements...',
    size: '8.7 MB'
  },
  {
    id: '3',
    title: 'Internal Sync: Engineering',
    date: 'Oct 22, 2023',
    duration: '15:10',
    participants: ['Tech Team'],
    status: 'processing',
    preview: 'Daily standup and technical blocker discussion...',
    size: '4.2 MB'
  },
  {
    id: '4',
    title: 'Design Critique: New Dashboard',
    date: 'Oct 21, 2023',
    duration: '58:45',
    participants: ['Design Team', 'Product'],
    status: 'transcribed',
    preview: 'Reviewing the glassmorphism implementation and color contrast...',
    size: '15.9 MB'
  }
]

export default function Recordings() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)
  const [aiPanelOpen, setAiPanelOpen] = useState(false)

  const handleNoteSelect = (recording) => {
    // Transform recording to note format for AI Panel
    setSelectedNote({
      ...recording,
      time: recording.date,
      summary: recording.preview,
      aiProcessed: recording.status === 'transcribed'
    })
    setAiPanelOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Meeting Recordings</h2>
            <p className="text-gray-400">Manage and review your AI-transcribed meetings</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-brand-purple transition-colors" />
              <input 
                type="text" 
                placeholder="Search recordings..."
                className="bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple/50 w-full md:w-80 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <FunnelIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Recordings Table-like List */}
        <div className="space-y-4">
          {recordings.map((recording) => (
            <Card 
              key={recording.id}
              variant="glass" 
              className="p-5 group hover:border-brand-purple/30 transition-all cursor-pointer"
              onClick={() => handleNoteSelect(recording)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Icon & Title */}
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    recording.status === 'transcribed' ? 'bg-green-500/10' : 'bg-brand-purple/10'
                  }`}>
                    <VideoCameraIcon className={`h-7 w-7 ${
                      recording.status === 'transcribed' ? 'text-green-500' : 'text-brand-purple animate-pulse'
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xl font-bold text-white mb-1 truncate group-hover:text-brand-purple transition-colors">
                      {recording.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <ClockIcon className="h-4 w-4" />
                        {recording.duration}
                      </span>
                      <span>•</span>
                      <span>{recording.date}</span>
                      <span>•</span>
                      <span>{recording.size}</span>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="hidden xl:flex items-center -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-brand-surface border-2 border-brand-dark flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                      {recording.participants[0]?.[0] || 'U'}
                    </div>
                  ))}
                  {recording.participants.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-brand-dark flex items-center justify-center text-[10px] font-bold text-gray-400">
                      +{recording.participants.length - 3}
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-6">
                  {recording.status === 'transcribed' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20 uppercase tracking-wider">
                      <SparklesIcon className="h-3 w-3" />
                      AI Ready
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold border border-brand-purple/20 uppercase tracking-wider">
                      Processing...
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                      <PlayIcon className="h-5 w-5" />
                    </button>
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                      <DocumentTextIcon className="h-5 w-5" />
                    </button>
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {recordings.length === 0 && (
          <div className="text-center py-20">
            <VideoCameraIcon className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No recordings yet</h3>
            <p className="text-gray-500">Your meeting recordings and transcripts will appear here.</p>
          </div>
        )}
      </div>

      {/* AI Panel Integration */}
      <AIPanel 
        open={aiPanelOpen} 
        onToggle={() => setAiPanelOpen(!aiPanelOpen)}
        note={selectedNote}
      />
    </DashboardLayout>
  )
}
