import { useState, useRef, useEffect } from 'react'
import { 
  MicrophoneIcon, 
  StopIcon, 
  PlayIcon, 
  PauseIcon,
  SpeakerWaveIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import Button from './Button'
import Card from './Card'

export default function AudioRecorder({ onRecordingComplete, onTranscriptionComplete }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [audioURL, setAudioURL] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [transcription, setTranscription] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const audioRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
    }
  }, [audioURL])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime)

    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)

    return () => {
      audio.removeEventListener('loadeddata', setAudioData)
      audio.removeEventListener('timeupdate', setAudioTime)
    }
  }, [audioURL])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
        setIsRecording(false)
        setRecordingTime(0)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        
        // Simulate transcription
        setIsTranscribing(true)
        setTimeout(() => {
          const mockTranscription = `Welcome to EchoNote AI. This is a sample transcription of your meeting recording. The AI has automatically converted your speech into text, making it easy to search and reference later. You can ask questions about this content, generate summaries, and extract key action items.`
          setTranscription(mockTranscription)
          setIsTranscribing(false)
          onTranscriptionComplete?.(mockTranscription)
        }, 3000)
        
        onRecordingComplete?.(blob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      
      // Start recording timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Please allow microphone access to record audio.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioURL('')
    setTranscription('')
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio) return
    
    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  return (
    <Card variant="default" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
          <MicrophoneIcon className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Audio Recording</h3>
          <p className="text-sm text-gray-600">Record meetings for AI transcription and analysis</p>
        </div>
      </div>

      {/* Recording Interface */}
      {!audioURL ? (
        <div className="text-center py-8">
          {isRecording ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="space-y-6"
            >
              {/* Recording Indicator */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-400 rounded-full animate-ping"></div>
                  <div className="relative w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <MicrophoneIcon className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Recording Time */}
              <div className="text-2xl font-mono text-gray-900">
                {formatTime(recordingTime)}
              </div>
              
              {/* Recording Controls */}
              <div className="flex justify-center gap-4">
                {isPaused ? (
                  <Button
                    variant="primary"
                    onClick={resumeRecording}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={pauseRecording}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={stopRecording}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <StopIcon className="h-4 w-4 mr-2" />
                  Stop Recording
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                Recording in progress... Speak clearly for best transcription quality
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <MicrophoneIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-6">
                  Click the button below to start recording your meeting
                </p>
              </div>
              
              <Button
                variant="primary"
                onClick={startRecording}
                className="w-full max-w-xs mx-auto"
              >
                <MicrophoneIcon className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Playback Interface */
        <div className="space-y-6">
          {/* Audio Player */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlayback}
              >
                {isPlaying ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
              </Button>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                  />
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={deleteRecording}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <audio ref={audioRef} src={audioURL} />
          </div>

          {/* Transcription */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <SpeakerWaveIcon className="h-5 w-5 text-primary-600" />
              <h4 className="text-md font-semibold text-gray-900">Transcription</h4>
            </div>
            
            <AnimatePresence>
              {isTranscribing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-sm">Transcribing audio...</span>
                  </div>
                </motion.div>
              ) : transcription ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {transcription}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      )}
    </Card>
  )
}
