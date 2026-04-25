import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import NoteCard from '../cards/NoteCard'
import InputToolbar from '../ui/InputToolbar'
import CalendarIntegration from '../ui/CalendarIntegration'
import AudioRecorder from '../ui/AudioRecorder'
import Button from '../ui/Button'
import { Input } from '../ui/Input'

export default function MainContent({ aiPanelOpen, selectedNote, onNoteSelect }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Product Planning Session',
      preview: 'Discussed Q1 product roadmap and feature priorities. Key decisions made about resource allocation and timeline...',
      tags: ['planning', 'product', 'Q1'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      aiSummary: 'This meeting focused on Q1 product planning with emphasis on feature prioritization and resource allocation.',
      wordCount: 1250,
      keyPoints: [
        'Product roadmap prioritized for Q3 launch',
        'Budget increased by 15% for development team',
        'New hiring plan approved for 3 positions'
      ],
      actionItems: [
        { task: 'Finalize Q3 budget proposal', assignee: 'Sarah Chen' },
        { task: 'Review and approve job descriptions', assignee: 'Mike Johnson' }
      ]
    },
    {
      id: '2',
      title: 'Client Review Call',
      preview: 'Review of deliverables and feedback collection. Client expressed satisfaction with current progress...',
      tags: ['client', 'review', 'feedback'],
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      aiSummary: 'Client review meeting covering deliverables and gathering feedback for next phase.',
      wordCount: 890,
      keyPoints: [
        'Client satisfied with deliverables',
        'New requirements identified for phase 2',
        'Timeline extension requested'
      ],
      actionItems: [
        { task: 'Create revised timeline proposal', assignee: 'Emily Watson' },
        { task: 'Document new requirements', assignee: 'Tom Davis' }
      ]
    },
    {
      id: '3',
      title: 'Team Standup',
      preview: 'Daily sync and blocker discussion. Team members reported progress on current sprint items...',
      tags: ['standup', 'daily', 'sprint'],
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
      aiSummary: 'Daily team standup covering sprint progress and identifying blockers.',
      wordCount: 450,
      keyPoints: [
        'Sprint on track for completion',
        'Two blockers identified and resolved',
        'New feature development started'
      ],
      actionItems: [
        { task: 'Update sprint board', assignee: 'Alex Kim' },
        { task: 'Prepare demo for next week', assignee: 'Jordan Lee' }
      ]
    }
  ])

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleRecord = () => {
    console.log('Recording started')
  }

  const handleUpload = (files) => {
    console.log('Files uploaded:', files)
  }

  const handlePaste = () => {
    console.log('Paste text triggered')
  }

  return (
    <main className={`flex-1 overflow-hidden transition-all duration-300 ${aiPanelOpen ? 'mr-80' : ''}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 lg:px-8 py-4 space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-lg">
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
              />
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="primary">
                New Note
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Empty State or Notes Grid */}
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start by recording or uploading
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Create your first note to get started with EchoNote AI
                  </p>
                  <InputToolbar
                    onRecord={handleRecord}
                    onUpload={handleUpload}
                    onPaste={handlePaste}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Calendar Integration */}
                <CalendarIntegration
                  onMeetingLinkAdd={(meeting) => {
                    console.log('Meeting added:', meeting)
                  }}
                  onCalendarConnect={() => {
                    console.log('Calendar connected')
                  }}
                />

                {/* Audio Recorder */}
                <AudioRecorder
                  onRecordingComplete={(blob) => {
                    console.log('Recording completed:', blob)
                  }}
                  onTranscriptionComplete={(transcription) => {
                    console.log('Transcription completed:', transcription)
                    // Create a new note from the transcription
                    const newNote = {
                      id: Date.now().toString(),
                      title: 'New Recording',
                      preview: transcription.substring(0, 150) + '...',
                      tags: ['recording', 'audio'],
                      timestamp: new Date(),
                      aiSummary: 'AI-generated summary of the recording...',
                      wordCount: transcription.split(' ').length,
                      keyPoints: [
                        'Key point from recording 1',
                        'Key point from recording 2',
                        'Key point from recording 3'
                      ],
                      actionItems: [
                        { task: 'Action item from recording', assignee: 'Team Member' }
                      ]
                    }
                    setNotes(prev => [newNote, ...prev])
                  }}
                />

                {/* Input Toolbar */}
                <InputToolbar
                  onRecord={handleRecord}
                  onUpload={handleUpload}
                  onPaste={handlePaste}
                />

                {/* Notes Grid */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Your Notes</h2>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                      </span>
                      <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option>Sort by date</option>
                        <option>Sort by title</option>
                        <option>Sort by tags</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onClick={() => onNoteSelect?.(note)}
                        className={selectedNote?.id === note.id ? 'ring-2 ring-primary-500' : ''}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
