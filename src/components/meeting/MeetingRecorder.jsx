import { useState, useEffect, useRef } from 'react'
import { 
  MicrophoneIcon, 
  StopIcon, 
  PauseIcon, 
  PlayIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Card from '../ui/Card'
import Button from '../ui/Button'

export default function MeetingRecorder({ onMeetingComplete, onClose }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [title, setTitle] = useState('')
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const intervalRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording, isPaused])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: isVideoEnabled 
      })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        await processRecording(blob)
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      
      // Simulate live transcription
      simulateLiveTranscription()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please allow microphone access to record meetings')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
      }
    }
  }

  const simulateLiveTranscription = () => {
    const sampleTranscripts = [
      "Welcome everyone to today's meeting...",
      "Let's start by reviewing the agenda...",
      "First item on our list is the project timeline...",
      "We need to discuss the budget allocation...",
      "Team updates from the last sprint...",
      "Let's talk about the upcoming deadlines...",
      "Any blockers or concerns we should address?",
      "Great progress on the frontend development...",
      "The testing phase is going well...",
      "Let's summarize the action items..."
    ]
    
    let index = 0
    const transcriptInterval = setInterval(() => {
      if (isRecording && !isPaused && index < sampleTranscripts.length) {
        setTranscript(prev => prev + ' ' + sampleTranscripts[index])
        index++
      } else if (index >= sampleTranscripts.length) {
        clearInterval(transcriptInterval)
      }
    }, 3000)
  }

  const processRecording = async (audioBlob) => {
    setIsProcessing(true)
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const meetingData = {
      id: Date.now().toString(),
      title: title || `Meeting ${new Date().toLocaleString()}`,
      duration: formatDuration(duration),
      date: new Date().toISOString(),
      transcript: transcript || "Meeting transcription in progress...",
      summary: "The team discussed project progress, timeline adjustments, and upcoming deliverables. Key decisions were made regarding resource allocation and next steps.",
      actionItems: [
        "Review project timeline by end of week",
        "Schedule follow-up meeting with stakeholders",
        "Update documentation with recent changes"
      ],
      participants: ["You", "Team Members"]
    }
    
    setIsProcessing(false)
    onMeetingComplete(meetingData)
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
            <h3 className="text-2xl font-bold text-white">Meeting Recorder</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          {/* Meeting Title */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Meeting title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
              disabled={isRecording}
            />
          </div>

          {/* Recording Status */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
              {isRecording && (
                <>
                  <div className="relative">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  </div>
                  <span className="font-bold uppercase tracking-widest text-xs">
                    {isPaused ? 'PAUSED' : 'RECORDING'}
                  </span>
                  <div className="h-4 w-[1px] bg-red-500/30" />
                  <span className="font-mono text-sm">{formatDuration(duration)}</span>
                </>
              )}
              {!isRecording && duration > 0 && (
                <span className="font-mono text-sm">Duration: {formatDuration(duration)}</span>
              )}
              {!isRecording && duration === 0 && (
                <span className="text-gray-400">Ready to record</span>
              )}
            </div>
          </div>

          {/* Live Transcript Preview */}
          {transcript && (
            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-sm font-bold text-gray-400 mb-2">Live Transcript</h4>
              <p className="text-sm text-gray-300 max-h-32 overflow-y-auto">
                {transcript}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                variant="primary"
                className="px-8 py-4 flex items-center gap-2"
              >
                <MicrophoneIcon className="h-5 w-5" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="secondary"
                  className="px-6 py-3"
                >
                  {isPaused ? (
                    <PlayIcon className="h-5 w-5" />
                  ) : (
                    <PauseIcon className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  onClick={stopRecording}
                  variant="danger"
                  className="px-8 py-4 flex items-center gap-2"
                >
                  <StopIcon className="h-5 w-5" />
                  Stop Recording
                </Button>
              </>
            )}
          </div>

          {/* Video Toggle */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              disabled={isRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isVideoEnabled 
                  ? 'bg-brand-purple text-white' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isVideoEnabled ? (
                <VideoCameraIcon className="h-4 w-4" />
              ) : (
                <VideoCameraSlashIcon className="h-4 w-4" />
              )}
              {isVideoEnabled ? 'Video On' : 'Video Off'}
            </button>
          </div>

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-white">Processing meeting with AI...</p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
