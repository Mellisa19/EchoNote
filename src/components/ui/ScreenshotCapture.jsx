import { useState, useRef } from 'react'
import { 
  CameraIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import Button from './Button'
import Card from './Card'

export default function ScreenshotCapture({ targetRef, onCapture, title = 'Screenshot' }) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState('')
  const [error, setError] = useState('')

  const captureScreenshot = async () => {
    if (!targetRef.current) {
      setError('No target element to capture')
      return
    }

    setIsCapturing(true)
    setError('')

    try {
      // Use html2canvas library for screenshot capture
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      const imageData = canvas.toDataURL('image/png')
      setCapturedImage(imageData)
      onCapture?.(imageData)
    } catch (err) {
      console.error('Screenshot capture failed:', err)
      setError('Failed to capture screenshot. Please try again.')
    } finally {
      setIsCapturing(false)
    }
  }

  const downloadScreenshot = () => {
    if (!capturedImage) return

    const link = document.createElement('a')
    link.href = capturedImage
    link.download = `${title.replace(/\s+/g, '_')}_${new Date().getTime()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyToClipboard = async () => {
    if (!capturedImage) return

    try {
      const blob = await (await fetch(capturedImage)).blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      setError('Failed to copy to clipboard')
    }
  }

  return (
    <Card variant="default" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
          <CameraIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Screenshot Capture</h3>
          <p className="text-sm text-gray-600">Capture and share meeting summaries</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {!capturedImage ? (
        <div className="text-center py-8">
          <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">
            Click the button below to capture a screenshot of the current meeting summary
          </p>
          
          <Button
            variant="primary"
            onClick={captureScreenshot}
            disabled={isCapturing}
            className="w-full max-w-xs mx-auto"
          >
            {isCapturing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Capturing...
              </>
            ) : (
              <>
                <CameraIcon className="h-4 w-4 mr-2" />
                Capture Screenshot
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Preview</h4>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <img 
                src={capturedImage} 
                alt="Screenshot preview" 
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={downloadScreenshot}
              className="flex-1"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Download
            </Button>
            
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="flex-1"
            >
              Copy to Clipboard
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setCapturedImage('')}
            >
              Retake
            </Button>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircleIcon className="h-4 w-4" />
              <span className="text-sm">Screenshot captured successfully!</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
