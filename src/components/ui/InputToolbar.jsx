import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MicrophoneIcon,
  DocumentArrowUpIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
  StopIcon
} from '@heroicons/react/24/outline'
import Button from './Button'
import Card from './Card'

export default function InputToolbar({ onRecord, onUpload, onPaste, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleRecord = () => {
    if (!isRecording) {
      setIsRecording(true)
      onRecord?.()
    } else {
      setIsRecording(false)
    }
  }

  const handleUpload = () => {
    onUpload?.()
  }

  const handlePaste = () => {
    onPaste?.()
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onUpload?.(files)
    }
  }

  return (
    <div className="w-full">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-4"
          >
            <Card variant="elevated" className="border-red-200 bg-red-50">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping"></div>
                    <div className="relative w-3 h-3 bg-red-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-red-900">Recording in progress...</p>
                    <p className="text-sm text-red-700">Click stop when you're finished</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecord}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <StopIcon className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative transition-all duration-200 ${
          isDragging ? 'scale-[1.02]' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Card 
          variant={isDragging ? 'elevated' : 'default'} 
          className={`p-6 border-2 transition-colors ${
            isDragging 
              ? 'border-primary-400 bg-primary-50' 
              : 'border-dashed border-gray-300 hover:border-gray-400'
          }`}
        >
          <div className="text-center">
            {isDragging ? (
              <div className="py-4">
                <DocumentArrowUpIcon className="h-12 w-12 text-primary-600 mx-auto mb-3" />
                <p className="text-primary-700 font-medium">Drop files here to upload</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Start by recording or uploading
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Transform voice, PDFs, videos, or text into structured notes
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    variant={isRecording ? 'outline' : 'primary'}
                    onClick={handleRecord}
                    disabled={disabled}
                    className={`min-w-[140px] ${
                      isRecording 
                        ? 'border-red-300 text-red-700 hover:bg-red-50' 
                        : ''
                    }`}
                  >
                    <MicrophoneIcon className="h-4 w-4 mr-2" />
                    {isRecording ? 'Recording...' : 'Record Audio'}
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={handleUpload}
                    disabled={disabled}
                    className="min-w-[140px]"
                  >
                    <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handlePaste}
                    disabled={disabled}
                    className="min-w-[140px]"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    Paste Text
                  </Button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Supports: Audio files, PDFs, DOCX, MP4, and text content
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
