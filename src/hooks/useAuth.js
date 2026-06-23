import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { isAuthenticated, user, login, logout, updateProfile } = useAuthStore()
  
  return {
    isAuthenticated,
    user,
    login,
    logout,
    updateProfile
  }
}
