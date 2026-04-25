import { 
  MicrophoneIcon, 
  DocumentArrowUpIcon, 
  CalendarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const quickActions = [
  {
    id: 'record',
    title: 'Start Recording',
    description: 'Record a new meeting',
    icon: MicrophoneIcon,
    color: 'red',
    href: '/record'
  },
  {
    id: 'upload',
    title: 'Upload Audio',
    description: 'Transcribe existing audio',
    icon: DocumentArrowUpIcon,
    color: 'blue',
    href: '/upload'
  },
  {
    id: 'schedule',
    title: 'Schedule Meeting',
    description: 'Set up future recording',
    icon: CalendarIcon,
    color: 'green',
    href: '/schedule'
  },
  {
    id: 'ai-summary',
    title: 'AI Summary',
    description: 'Generate insights',
    icon: SparklesIcon,
    color: 'purple',
    href: '/ai-summary'
  }
]

export default function QuickActions() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-4 hover:shadow-md transition-all duration-200 text-left group"
          >
            <div className={`w-12 h-12 rounded-lg bg-${action.color}-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
              <action.icon className={`h-6 w-6 text-${action.color}-600`} />
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-1">
              {action.title}
            </h3>
            
            <p className="text-sm text-gray-600">
              {action.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
