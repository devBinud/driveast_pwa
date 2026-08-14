import React, { useRef, useState } from 'react'
import { FiCamera, FiCheckCircle, FiRefreshCw } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { fileService } from '../../../services/fileService'
import './OdometerPhotoCapture.css'

// Backend requires start_odometer_image_url / end_odometer_image_url on verify-otp
// and end-trip -- without capturing and uploading a photo here first, those calls
// 422 every time since the field has no default.
export const OdometerPhotoCapture = ({ label, imageUrl, onUploaded }) => {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)
    onUploaded(null)
    try {
      const url = await fileService.uploadImage(file)
      onUploaded(url)
    } catch (err) {
      toast.error('Failed to upload odometer photo. Please try again.')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
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
