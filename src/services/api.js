import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.driveast.com/api/v1'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Request Interceptor: Attach Auth Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('driveast_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Extract data envelope and normalize response errors
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.response?.status
    const serverMessage = error.response?.data?.message

    let userFriendlyMessage = serverMessage

    if (!userFriendlyMessage) {
      if (status === 401) {
        userFriendlyMessage = 'Invalid phone number or password. Please verify your credentials.'
      } else if (status === 403) {
        userFriendlyMessage = 'Access denied. You do not have permission for this action.'
      } else if (status === 404) {
        userFriendlyMessage = 'Requested resource or API endpoint not found.'
      } else if (status >= 500) {
        userFriendlyMessage = 'Backend server error. Please try again shortly.'
      } else {
        userFriendlyMessage = error.message || 'An unexpected API error occurred.'
      }
    }

    const customError = {
      message: userFriendlyMessage,
      status: status,
      data: error.response?.data
    }
    
    if (status === 401) {
      localStorage.removeItem('driveast_token')
    }

    return Promise.reject(customError)
  }
)

export default api
