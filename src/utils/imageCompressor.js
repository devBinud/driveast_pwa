/**
 * Compresses and downscales an image File/Blob on the client before uploading.
 * Prevents memory limit crashes on mobile PWAs when handling high-res camera photos (10-20MB).
 *
 * @param {File} file - Original file from input
 * @param {Object} options
 * @param {number} options.maxWidth - Max dimension width (default 1280px)
 * @param {number} options.maxHeight - Max dimension height (default 1280px)
 * @param {number} options.quality - JPEG output quality (0.1 to 1.0, default 0.8)
 * @returns {Promise<File>} Compressed File object
 */
export async function compressImage(file, options = {}) {
  const { maxWidth = 1280, maxHeight = 1280, quality = 0.8 } = options

  // Skip non-image files or small files (< 200 KB)
  if (!file || !file.type || !file.type.startsWith('image/') || file.size < 200 * 1024) {
    return file
  }

  return new Promise((resolve) => {
    let objectUrl = null
    let resolved = false

    const safeResolve = (val) => {
      if (resolved) return
      resolved = true
      if (timeoutId) clearTimeout(timeoutId)
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }
      resolve(val)
    }

    // Safeguard: If img.onload never fires (e.g. corrupted camera stream/unsupported decode), don't hang forever
    const timeoutId = setTimeout(() => {
      console.warn('Image compression timed out; proceeding with original file')
      safeResolve(file)
    }, 8000)

    try {
      objectUrl = URL.createObjectURL(file)
    } catch (e) {
      safeResolve(file)
      return
    }

    const img = new Image()
    img.src = objectUrl

    img.onload = () => {
      let { width, height } = img

      // Calculate aspect ratio downscaling if larger than max dimensions
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        safeResolve(file)
        return
      }

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            safeResolve(file)
            return
          }

          const compressedFileName = file.name ? file.name.replace(/\.[^/.]+$/, '.jpg') : 'odometer.jpg'
          const compressedFile = new File([blob], compressedFileName, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })

          // Explicitly clear canvas context and image references to free RAM immediately
          canvas.width = 0
          canvas.height = 0
          img.onload = null
          img.src = ''

          safeResolve(compressedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      safeResolve(file)
    }
  })
}

export default compressImage
