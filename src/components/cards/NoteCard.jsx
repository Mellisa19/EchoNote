import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  DocumentTextIcon,
  TagIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Card from '../ui/Card'

export default function NoteCard({ 
  note, 
  variant = 'default',
  className = '',
  onClick 
}) {
  const {
    id,
    title,
    preview,
    tags = [],
    timestamp,
    aiSummary,
    wordCount
  } = note

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card variant={variant} className="h-full group">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">{formatDate(timestamp)}</span>
              {wordCount && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">{wordCount} words</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-50 text-accent-600">
            <DocumentTextIcon className="h-4 w-4" />
          </div>
        </div>

        {/* Preview */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {preview}
        </p>

        {/* AI Summary Indicator */}
        {aiSummary && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-primary-50 rounded-lg">
            <SparklesIcon className="h-4 w-4 text-primary-600" />
            <span className="text-xs text-primary-700 font-medium">AI Summary Available</span>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <TagIcon className="h-4 w-4 text-gray-400" />
            <div className="flex gap-1 flex-wrap">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
