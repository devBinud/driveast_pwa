import api from './api'
import { compressImage } from '../utils/imageCompressor'

export const fileService = {
  /**
   * Uploads an image to the backend's Cloudflare R2-backed file store.
   * Compresses large photos on client before sending to save network & memory.
   * POST /api/v1/files/upload (multipart/form-data)
   * @param {File} file
   * @param {string} folder - R2 folder/prefix to store the file under
   * @returns {Promise<string>} the public CDN URL of the uploaded file
   */
  async uploadImage(file, folder = 'trip-odometer') {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post(`/files/upload?folder=${encodeURIComponent(folder)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000 // Extended 60s timeout for rural 3G/4G photo uploads
    })
    return res?.data?.url
  }
}

export default fileService
