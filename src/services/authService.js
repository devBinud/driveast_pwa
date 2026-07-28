import api from './api'

export const authService = {
  /**
   * Driver Authentication
   * POST /api/v1/driver/auth/login
   * @param {string} phone 
   * @param {string} password 
   */
  async login(phone, password) {
    try {
      const response = await api.post('/driver/auth/login', { phone, password })
      if (response?.data?.access_token) {
        localStorage.setItem('driveast_token', response.data.access_token)
      }
      return response
    } catch (error) {
      console.warn('Backend login endpoint unreachable/failed, falling back to client mode if needed', error)
      throw error
    }
  },

  /**
   * Driver Logout
   * POST /api/v1/driver/auth/logout
   */
  async logout() {
    try {
      const response = await api.post('/driver/auth/logout')
      localStorage.removeItem('driveast_token')
      return response
    } catch (error) {
      localStorage.removeItem('driveast_token')
      return { success: true, message: 'Logged out locally' }
    }
  },

  /**
   * Fetch Driver Profile & Current Duty Status
   * GET /api/v1/driver/me
   */
  async getProfile() {
    return await api.get('/driver/me')
  }
}

export default authService
