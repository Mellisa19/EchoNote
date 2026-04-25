import { useState } from 'react'
import { 
  ClockIcon, 
  UserGroupIcon, 
  PlayIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

const statusConfig = {
  completed: {
    color: 'green',
    icon: CheckCircleIcon,
    text: 'Completed'
  },
  processing: {
    color: 'yellow',
    icon: ClockIcon,
    text: 'Processing'
  },
  recording: {
    color: 'red',
    icon: PlayIcon,
    text: 'Recording'
  },
  scheduled: {
    color: 'blue',
    icon: ClockIcon,
    text: 'Scheduled'
  }
}

export default function MeetingCard({ 
  id, 
  title, 
  date, 
  duration, 
  participants, 
  status = 'completed',
  summary,
  transcript,
  actionItems = []
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const statusInfo = statusConfig[status] || statusConfig.completed

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
              {title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {date}
              </div>
              <div className="flex items-center gap-1">
                <UserGroupIcon className="h-4 w-4" />
                {participants} participants
              </div>
              <span>{duration}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
              <statusInfo.icon className="h-3 w-3" />
              {statusInfo.text}
            </div>
            <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <EllipsisHorizontalIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm line-clamp-2">
              {summary}
            </p>
          </div>
        )}

        {/* Action Items */}
        {actionItems.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <DocumentTextIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {actionItems.length} Action Items
              </span>
            </div>
            <div className="space-y-1">
              {actionItems.slice(0, isExpanded ? actionItems.length : 2).map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1 h-1 bg-gray-300 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>
            {actionItems.length > 2 && !isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
              >
                View all {actionItems.length} items →
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <button className="btn btn-ghost text-sm">
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            View Transcript
          </button>
          <button className="btn btn-ghost text-sm">
            <PlayIcon className="h-4 w-4 mr-2" />
            Play Recording
          </button>
          <button className="btn btn-primary text-sm">
            AI Summary
          </button>
        </div>
      </div>
    </motion.div>
  )
}
