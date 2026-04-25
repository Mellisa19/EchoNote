import { useState } from 'react'
import { 
  ChevronLeftIcon, 
  SparklesIcon, 
  MicrophoneIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../ui/Button'
import Card from '../ui/Card'

export default function AIPanel({ open, onToggle, note = null }) {
  const [activeTab, setActiveTab] = useState('summary')
  const [isRecording, setIsRecording] = useState(false)
  const [question, setQuestion] = useState('')

  const tabs = [
    { id: 'summary', label: 'Summary', icon: DocumentTextIcon },
    { id: 'keypoints', label: 'Key Points', icon: LightBulbIcon },
    { id: 'actions', label: 'Actions', icon: ClipboardDocumentListIcon },
    { id: 'chat', label: 'Ask AI', icon: ChatBubbleLeftRightIcon }
  ]

  return (
    <>
      {/* AI Panel - Desktop */}
      <div className={`hidden lg:block fixed right-0 top-0 h-full w-96 bg-white/90 backdrop-blur-sm border-l border-gray-200 transform transition-transform duration-300 z-40 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                <p className="text-xs text-gray-600">Powered by advanced AI</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-3 py-3 text-xs font-medium transition-all duration-200 flex flex-col items-center gap-1 ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'summary' && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
                    <h4 className="font-medium text-gray-900 mb-3">Meeting Summary</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      The team discussed the Q3 product roadmap with focus on user experience improvements 
                      and performance optimization. Key decisions included prioritizing the mobile app 
                      redesign and allocating additional resources to the AI features development.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Meeting duration: 45 minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Participants: 6 team members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>AI confidence: 94%</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'keypoints' && (
                <motion.div
                  key="keypoints"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h4 className="font-medium text-gray-900 mb-4">Key Points</h4>
                  
                  {[
                    'Mobile app redesign is top priority for Q3',
                    'AI features need additional development resources',
                    'User feedback indicates performance issues need addressing',
                    'Team agreed on new sprint planning methodology',
                    'Budget allocation approved for Q3 initiatives'
                  ].map((point, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <LightBulbIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{point}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'actions' && (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  <h4 className="font-medium text-gray-900 mb-4">Action Items</h4>
                  
                  {[
                    { task: 'Create mobile app wireframes', assignee: 'Sarah Chen', priority: 'High' },
                    { task: 'Review AI performance metrics', assignee: 'Mike Johnson', priority: 'Medium' },
                    { task: 'Schedule user testing sessions', assignee: 'Emily Davis', priority: 'High' },
                    { task: 'Update sprint planning template', assignee: 'Tom Wilson', priority: 'Low' }
                  ].map((action, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">{action.task}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          action.priority === 'High' ? 'bg-red-100 text-red-700' :
                          action.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {action.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Assigned to: {action.assignee}</p>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex-1 space-y-4 mb-4">
                    <div className="p-3 bg-purple-50 rounded-lg max-w-[80%]">
                      <p className="text-sm text-purple-700">
                        Hi! I'm your AI assistant. Ask me anything about this meeting or your notes.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question about this meeting..."
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <Button variant="primary" size="sm" className="px-3">
                      <SparklesIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile AI Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-50"
            onClick={onToggle}
          >
            <motion.div
              initial={{ translateX: '100%' }}
              animate={{ translateX: 0 }}
              exit={{ translateX: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-0 top-0 h-full w-80 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full flex flex-col">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                  </div>
                  <button
                    onClick={onToggle}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                
                {/* Mobile Content */}
                <div className="flex-1 overflow-auto p-4">
                  <div className="text-center py-8">
                    <SparklesIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">AI Assistant</h4>
                    <p className="text-sm text-gray-600">
                      Ask me anything about your meetings and notes
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
