import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiCamera, FiCheckCircle, FiRefreshCw, FiImage, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { fileService } from '../../../services/fileService'
import { compressImage } from '../../../utils/imageCompressor'
import './OdometerPhotoCapture.css'

// Backend requires start_odometer_image_url / end_odometer_image_url on verify-otp
// and end-trip -- without capturing and uploading a photo here first, those calls
// 422 every time since the field has no default.
export const OdometerPhotoCapture = ({ label, imageUrl, onUploaded }) => {
  const inputRef = useRef(null)
  const previewRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showChoiceModal, setShowChoiceModal] = useState(false)
  const [showCameraModal, setShowCameraModal] = useState(false)
  const [isCameraStarting, setIsCameraStarting] = useState(false)

  useEffect(() => {
    return () => {
      stopCamera()
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
      }
    }
  }, [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const handleBoxClick = () => {
    if (uploading) return
    setShowChoiceModal(true)
  }

  const startInAppCamera = async () => {
    setShowChoiceModal(false)
    setShowCameraModal(true)
    setIsCameraStarting(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err) {
      console.warn('In-app camera access error:', err)
      toast.error('Could not open live camera directly. Opening file picker instead.')
      setShowCameraModal(false)
      stopCamera()
      if (inputRef.current) inputRef.current.click()
    } finally {
      setIsCameraStarting(false)
    }
  }

  const captureInAppPhoto = async () => {
    if (!videoRef.current) return
    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    stopCamera()
    setShowCameraModal(false)

    canvas.toBlob(async (blob) => {
      if (!blob) return
      const capturedFile = new File([blob], `odometer_${Date.now()}.jpg`, { type: 'image/jpeg' })
      await processAndUploadFile(capturedFile)
    }, 'image/jpeg', 0.85)
  }

  const processAndUploadFile = async (file) => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }

    setUploading(true)
    onUploaded(null)

    try {
      // 1. Compress image FIRST before previewing/uploading (downscales 20MB camera photo to ~150KB)
      const compressedFile = await compressImage(file)

      // 2. Create lightweight preview object URL from compressed file (prevents WebKit/Android memory crash)
      const objectUrl = URL.createObjectURL(compressedFile)
      previewRef.current = objectUrl
      setPreviewUrl(objectUrl)

      // 3. Upload to backend CDN
      const url = await fileService.uploadImage(compressedFile)
      onUploaded(url)
    } catch (err) {
      toast.error('Failed to upload odometer photo. Please try again.')
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
        previewRef.current = null
      }
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setShowChoiceModal(false)
    await processAndUploadFile(file)
  }

  return (
    <div className="odometer-photo-capture">
      <label className="odometer-photo-label">
        {label}<span className="odometer-photo-req">*</span>
      </label>
      <div
        className={`odometer-photo-box ${uploading ? 'is-uploading' : ''}`}
        onClick={handleBoxClick}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Odometer reading" className="odometer-photo-preview" />
        ) : (
          <div className="odometer-photo-placeholder">
            <FiCamera />
            <span>Tap to capture/upload odometer photo</span>
          </div>
        )}
        {uploading && (
          <div className="odometer-photo-overlay">
            <FiRefreshCw className="animate-spin" />
            <span>Uploading...</span>
          </div>
        )}
        {imageUrl && !uploading && (
          <div className="odometer-photo-check">
            <FiCheckCircle />
          </div>
        )}
      </div>

      {/* Hidden file input WITHOUT forced capture="environment" to prevent Android low memory crashes */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="odometer-photo-input-hidden"
      />

      {/* Option Choice Sheet Modal */}
      {showChoiceModal && createPortal(
        <div className="odo-modal-backdrop" onClick={() => setShowChoiceModal(false)}>
          <div className="odo-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="odo-modal-handle"></div>
            <h4 className="odo-modal-title">Select Photo Source</h4>
            <p className="odo-modal-desc">Choose how you want to provide the odometer photo</p>
            <div className="odo-choice-buttons">
              <button
                type="button"
                className="odo-choice-btn primary"
                onClick={startInAppCamera}
              >
                <FiCamera size={20} />
                <span>Take Photo (Fast In-App Camera)</span>
              </button>
              <button
                type="button"
                className="odo-choice-btn secondary"
                onClick={() => {
                  setShowChoiceModal(false)
                  if (inputRef.current) inputRef.current.click()
                }}
              >
                <FiImage size={20} />
                <span>Choose from Gallery / Files</span>
              </button>
            </div>
            <button type="button" className="odo-choice-cancel" onClick={() => setShowChoiceModal(false)}>
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Live In-App Camera Overlay */}
      {showCameraModal && createPortal(
        <div className="odo-camera-overlay">
          <div className="odo-camera-header">
            <span>Odometer Camera</span>
            <button type="button" onClick={() => { stopCamera(); setShowCameraModal(false) }}>
              <FiX size={24} />
            </button>
          </div>
          <div className="odo-camera-viewport">
            <video ref={videoRef} autoPlay playsInline muted className="odo-camera-video" />
            {isCameraStarting && (
              <div className="odo-camera-loading">
                <FiRefreshCw className="animate-spin" size={28} />
                <span>Starting Camera...</span>
              </div>
            )}
            <div className="odo-camera-guide-box">
              <span>Position odometer numbers inside frame</span>
            </div>
          </div>
          <div className="odo-camera-controls">
            <button type="button" className="odo-snap-btn" onClick={captureInAppPhoto}>
              <div className="odo-snap-inner"></div>
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default OdometerPhotoCapture
