// Audio Service for recording, playback, and transcription
class AudioService {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.audioBlob = null
    this.audioUrl = null
    this.isRecording = false
    this.isPlaying = false
    this.audioElement = null
    this.transcriptionCallback = null
  }

  // Initialize audio service
  async initialize() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      return stream
    } catch (error) {
      console.error('Error accessing microphone:', error)
      throw new Error('Microphone access denied. Please allow microphone permissions.')
    }
  }

  // Start recording audio
  async startRecording() {
    if (this.isRecording) {
      throw new Error('Recording is already in progress')
    }

    try {
      const stream = await this.initialize()
      
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        this.processRecording()
      }

      this.mediaRecorder.start()
      this.isRecording = true
      
      console.log('Recording started')
      return true
    } catch (error) {
      console.error('Error starting recording:', error)
      throw error
    }
  }

  // Stop recording audio
  stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No recording in progress')
    }

    this.mediaRecorder.stop()
    this.isRecording = false
    
    // Stop all tracks in the stream
    if (this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
    
    console.log('Recording stopped')
  }

  // Process recorded audio
  processRecording() {
    this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' })
    this.audioUrl = URL.createObjectURL(this.audioBlob)
    
    console.log('Audio processed:', {
      size: this.audioBlob.size,
      type: this.audioBlob.type,
      url: this.audioUrl
    })

    // Automatically transcribe the audio
    this.transcribeAudio(this.audioBlob)
  }

  // Play recorded audio
  playAudio() {
    if (!this.audioUrl) {
      throw new Error('No audio available to play')
    }

    if (this.isPlaying) {
      this.stopAudio()
      return
    }

    if (!this.audioElement) {
      this.audioElement = new Audio(this.audioUrl)
    }

    this.audioElement.play()
    this.isPlaying = true
    
    this.audioElement.onended = () => {
      this.isPlaying = false
    }

    console.log('Playing audio')
  }

  // Stop audio playback
  stopAudio() {
    if (this.audioElement && this.isPlaying) {
      this.audioElement.pause()
      this.audioElement.currentTime = 0
      this.isPlaying = false
      console.log('Audio stopped')
    }
  }

  // Get audio duration
  async getAudioDuration() {
    if (!this.audioElement && this.audioUrl) {
      this.audioElement = new Audio(this.audioUrl)
    }

    if (this.audioElement) {
      return new Promise((resolve) => {
        this.audioElement.addEventListener('loadedmetadata', () => {
          resolve(this.audioElement.duration)
        })
      })
    }

    return 0
  }

  // Simulate audio transcription (in real app, this would call a speech-to-text API)
  async transcribeAudio(audioBlob) {
    try {
      console.log('Transcribing audio...')
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate transcription result
      const transcription = this.generateMockTranscription(audioBlob.size)
      
      console.log('Transcription complete:', transcription)
      
      // Call callback if set
      if (this.transcriptionCallback) {
        this.transcriptionCallback(transcription)
      }
      
      return transcription
    } catch (error) {
      console.error('Error transcribing audio:', error)
      throw error
    }
  }

  // Generate mock transcription based on audio size
  generateMockTranscription(audioSize) {
    const baseTranscriptions = [
      "Welcome everyone to today's meeting. I'd like to start by discussing the project timeline and our upcoming deadlines.",
      "Thank you for joining this call. Let's review the agenda items and make sure we're all aligned on the objectives.",
      "Good morning team. Today we'll be covering the quarterly results and planning for the next phase of development.",
      "Hi everyone, thanks for being here. I wanted to touch base on the client feedback we received yesterday.",
      "Welcome to our standup meeting. Let's quickly go over what we accomplished yesterday and what's on deck for today."
    ]

    const additionalPhrases = [
      "The key takeaway from this discussion is that we need to prioritize user experience improvements.",
      "Based on our analysis, we should focus on the mobile app performance optimizations.",
      "The team agreed that we need to schedule a follow-up meeting to discuss the technical requirements.",
      "Action items include reviewing the documentation and preparing a presentation for stakeholders.",
      "We'll need to coordinate with the design team to ensure consistency across all platforms."
    ]

    // Select base transcription based on audio size
    const baseIndex = Math.floor(audioSize / 10000) % baseTranscriptions.length
    let transcription = baseTranscriptions[baseIndex]

    // Add additional phrases for longer recordings
    if (audioSize > 50000) {
      const additionalIndex = Math.floor(audioSize / 20000) % additionalPhrases.length
      transcription += " " + additionalPhrases[additionalIndex]
    }

    return transcription
  }

  // Set transcription callback
  setTranscriptionCallback(callback) {
    this.transcriptionCallback = callback
  }

  // Process uploaded audio file
  async processUploadedFile(file) {
    try {
      console.log('Processing uploaded file:', file.name)
      
      this.audioBlob = file
      this.audioUrl = URL.createObjectURL(file)
      
      // Get audio duration
      const duration = await this.getAudioDuration()
      
      // Transcribe the uploaded audio
      const transcription = await this.transcribeAudio(file)
      
      return {
        file: file,
        url: this.audioUrl,
        duration: duration,
        transcription: transcription,
        size: file.size,
        name: file.name
      }
    } catch (error) {
      console.error('Error processing uploaded file:', error)
      throw error
    }
  }

  // Clean up resources
  cleanup() {
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl)
      this.audioUrl = null
    }
    
    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement = null
    }
    
    if (this.mediaRecorder && this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop())
    }
    
    this.audioChunks = []
    this.audioBlob = null
    this.isRecording = false
    this.isPlaying = false
  }

  // Get recording status
  getStatus() {
    return {
      isRecording: this.isRecording,
      isPlaying: this.isPlaying,
      hasAudio: !!this.audioUrl,
      audioSize: this.audioBlob?.size || 0,
      audioUrl: this.audioUrl
    }
  }
}

export default new AudioService()
