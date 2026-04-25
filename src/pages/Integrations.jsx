import { useState } from 'react'
import { 
  CalendarIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ProtectedRoute from '../components/auth/ProtectedRoute'

const integrations = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Automatically sync your meetings and join calls when they start',
    icon: CalendarIcon,
    category: 'Calendar',
    status: 'available',
    features: [
      'Automatic meeting detection',
      'Smart scheduling',
      'Meeting reminders',
      'Calendar sync'
    ],
    pricing: 'Free',
    color: 'blue'
  },
  {
    id: 'outlook-calendar',
    name: 'Outlook Calendar',
    description: 'Connect your Microsoft Outlook calendar for seamless meeting management',
    icon: CalendarIcon,
    category: 'Calendar',
    status: 'available',
    features: [
      'Outlook calendar sync',
      'Teams integration',
      'Meeting detection',
      'Office 365 integration'
    ],
    pricing: 'Free',
    color: 'blue'
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Join Zoom meetings automatically and record sessions for transcription',
    icon: VideoCameraIcon,
    category: 'Video',
    status: 'available',
    features: [
      'Auto-join Zoom meetings',
      'Recording integration',
      'Meeting analytics',
      'Participant tracking'
    ],
    pricing: 'Free',
    color: 'green'
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Integrate with Teams for automatic meeting recording and transcription',
    icon: VideoCameraIcon,
    category: 'Video',
    status: 'available',
    features: [
      'Teams meeting detection',
      'Recording automation',
      'Chat integration',
      'File sharing'
    ],
    pricing: 'Free',
    color: 'purple'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Share meeting summaries and action items directly to Slack channels',
    icon: ChatBubbleLeftRightIcon,
    category: 'Communication',
    status: 'available',
    features: [
      'Meeting summaries to Slack',
      'Action item notifications',
      'Channel integration',
      'Message formatting'
    ],
    pricing: 'Free',
    color: 'purple'
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Post meeting notes and AI summaries to your Discord servers',
    icon: ChatBubbleLeftRightIcon,
    category: 'Communication',
    status: 'coming-soon',
    features: [
      'Server integration',
      'Channel posting',
      'Rich embeds',
      'Role-based access'
    ],
    pricing: 'Coming Soon',
    color: 'purple'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Automatically create meeting notes and action items in Notion databases',
    icon: DocumentTextIcon,
    category: 'Productivity',
    status: 'available',
    features: [
      'Database integration',
      'Template creation',
      'Page generation',
      'Block formatting'
    ],
    pricing: 'Free',
    color: 'gray'
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Store meeting recordings and transcripts in your Dropbox folders',
    icon: FolderIcon,
    category: 'Storage',
    status: 'available',
    features: [
      'Automatic file sync',
      'Folder organization',
      'File naming',
      'Version control'
    ],
    pricing: 'Free',
    color: 'blue'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Save meeting files and summaries to your Google Drive',
    icon: FolderIcon,
    category: 'Storage',
    status: 'available',
    features: [
      'Drive integration',
      'Folder structure',
      'File sharing',
      'Collaboration'
    ],
    pricing: 'Free',
    color: 'blue'
  }
]

const categories = [
  { id: 'all', name: 'All Integrations', icon: Cog6ToothIcon },
  { id: 'calendar', name: 'Calendar', icon: CalendarIcon },
  { id: 'video', name: 'Video', icon: VideoCameraIcon },
  { id: 'communication', name: 'Communication', icon: ChatBubbleLeftRightIcon },
  { id: 'productivity', name: 'Productivity', icon: DocumentTextIcon },
  { id: 'storage', name: 'Storage', icon: FolderIcon }
]

import DashboardLayout from '../components/layout/DashboardLayout'

export default function Integrations() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [connectedIntegrations, setConnectedIntegrations] = useState(['google-calendar'])
  const [loading, setLoading] = useState('')

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.category.toLowerCase() === selectedCategory)

  const handleConnect = async (integrationId) => {
    setLoading(integrationId)
    setTimeout(() => {
      if (connectedIntegrations.includes(integrationId)) {
        setConnectedIntegrations(prev => prev.filter(id => id !== integrationId))
      } else {
        setConnectedIntegrations(prev => [...prev, integrationId])
      }
      setLoading('')
    }, 2000)
  }

  const isConnected = (integrationId) => connectedIntegrations.includes(integrationId)

  const getBrandGradient = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      case 'green': return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'purple': return 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple';
      default: return 'bg-white/5 border-white/10 text-gray-400';
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Integrations</h1>
            <p className="text-gray-400 text-lg">Connect your favorite tools to supercharge your meeting productivity</p>
          </div>

          {/* Category Filter */}
          <div className="mb-10 overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-max">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold transition-all border ${
                    selectedCategory === category.id
                      ? 'bg-brand-purple border-brand-purple text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <category.icon className="h-5 w-5" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Integration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="glass" className="p-8 h-full border-white/5 flex flex-col group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-110 ${getBrandGradient(integration.color)}`}>
                        <integration.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-purple transition-colors">{integration.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          integration.status === 'available' 
                            ? 'bg-green-500/10 text-green-500 border border-green-500/10'
                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10'
                        }`}>
                          {integration.status === 'available' ? 'Ready' : 'Soon'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                    {integration.description}
                  </p>

                  <div className="mb-8">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Key Features</h4>
                    <ul className="space-y-3">
                      {integration.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2.5 text-sm font-medium text-gray-300">
                          <CheckCircleIcon className="h-4 w-4 text-brand-purple" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-sm font-bold text-white">{integration.pricing}</span>
                    <button
                      onClick={() => handleConnect(integration.id)}
                      disabled={loading === integration.id || integration.status === 'coming-soon'}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center min-w-[120px] ${
                        isConnected(integration.id)
                          ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                          : integration.status === 'coming-soon'
                          ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
                          : 'btn-brand-purple shadow-lg shadow-purple-500/10'
                      }`}
                    >
                      {loading === integration.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      ) : isConnected(integration.id) ? (
                        'Disconnect'
                      ) : integration.status === 'coming-soon' ? (
                        'Locked'
                      ) : (
                        'Connect'
                      )}
                    </button>
                  </div>

                  {isConnected(integration.id) && (
                    <div className="mt-4 flex items-center gap-2 text-green-500 font-bold text-xs uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Live Connection
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
