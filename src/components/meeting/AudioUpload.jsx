import { useState, useRef } from 'react'
import { 
  DocumentTextIcon, 
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function AudioUpload({ onUploadComplete, onClose }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file)
    } else {
      alert('Please select an audio file (MP3, WAV, M4A, etc.)')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const simulateUpload = async () => {
    setIsUploading(true)
    setUploadProgress(0)
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setUploadProgress(i)
    }
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const meetingData = {
      id: Date.now().toString(),
      title: selectedFile.name.replace(/\.[^/.]+$/, ""),
      duration: "Uploaded audio",
      date: new Date().toISOString(),
      transcript: "Audio transcription completed. The meeting covered project updates, timeline discussions, and action items.",
      summary: "This uploaded meeting contains important discussions about project progress and next steps. The AI has identified key decisions and action items.",
      actionItems: [
        "Review uploaded meeting notes",
        "Extract action items from transcript",
        "Share summary with team members"
      ],
      participants: ["You", "Team Members"],
      type: 'uploaded'
    }
    
    setIsUploading(false)
    onUploadComplete(meetingData)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card variant="glass" className="p-6 border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Upload Audio</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging 
                ? 'border-brand-purple bg-brand-purple/10' 
                : 'border-white/20 hover:border-white/30'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />
            
            <CloudArrowUpIcon className="h-12 w-12 text-brand-purple mx-auto mb-4" />
            <p className="text-white font-medium mb-2">
              {selectedFile ? selectedFile.name : 'Drop audio file here or click to browse'}
            </p>
            <p className="text-gray-400 text-sm">
              {selectedFile ? formatFileSize(selectedFile.size) : 'Supports MP3, WAV, M4A, OGG (max 25MB)'}
            </p>
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="h-5 w-5 text-brand-purple" />
                  <div>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Processing audio...</span>
                <span className="text-sm text-brand-purple">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-brand-purple to-brand-pink h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-6">
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={simulateUpload}
              variant="primary"
              className="flex-1"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? 'Processing...' : 'Upload & Process'}
            </Button>
          </div>

          {/* Features */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-white font-medium mb-3">AI will extract:</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-brand-purple rounded-full"></div>
                Full transcription
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-brand-purple rounded-full"></div>
                Meeting summary
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-brand-purple rounded-full"></div>
                Action items
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-brand-purple rounded-full"></div>
                Key insights
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
