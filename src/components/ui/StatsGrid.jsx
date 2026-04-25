import { 
  CheckCircleIcon, 
  ClockIcon, 
  UserGroupIcon, 
  SparklesIcon 
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const stats = [
  {
    id: 'meetings',
    name: 'Total Meetings',
    value: '24',
    change: '+12%',
    changeType: 'increase',
    icon: CheckCircleIcon,
    color: 'green'
  },
  {
    id: 'hours',
    name: 'Hours Recorded',
    value: '18.5',
    change: '+8%',
    changeType: 'increase',
    icon: ClockIcon,
    color: 'blue'
  },
  {
    id: 'participants',
    name: 'Total Participants',
    value: '47',
    change: '+15%',
    changeType: 'increase',
    icon: UserGroupIcon,
    color: 'purple'
  },
  {
    id: 'ai-insights',
    name: 'AI Insights',
    value: '156',
    change: '+24%',
    changeType: 'increase',
    icon: SparklesIcon,
    color: 'yellow'
  }
]

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div className={`flex items-center text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'increase' && (
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {stat.change}
              </div>
            </div>
            
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.name}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
