import React, { useRef, useState, useEffect } from 'react'
import { FiCamera, FiCheckCircle, FiRefreshCw } from 'react-icons/fi'
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
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    return () => {
      // Revoke Object URL on component unmount to prevent browser memory leak
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
      }
    }
  }, [])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Revoke previous blob URL if any to free memory immediately
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }

    setUploading(true)
    onUploaded(null)

    try {
      // 1. Compress image FIRST before previewing/uploading (downscales 20MB camera photo to ~150KB)
      const compressedFile = await compressImage(file)

      // 2. Create lightweight preview object URL from compressed file (prevents WebKit memory crash)
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
      // Reset input value so selecting the same file again triggers onChange
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div className="odometer-photo-capture">
      <label className="odometer-photo-label">
        {label}<span className="odometer-photo-req">*</span>
      </label>
      <div
        className={`odometer-photo-box ${uploading ? 'is-uploading' : ''}`}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Odometer reading" className="odometer-photo-preview" />
        ) : (
          <div className="odometer-photo-placeholder">
            <FiCamera />
            <span>Tap to take/upload odometer photo</span>
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
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="odometer-photo-input-hidden"
      />
    </div>
  )
}

export default OdometerPhotoCapture
