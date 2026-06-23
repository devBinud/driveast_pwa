import { create } from 'zustand'

export const useThemeStore = create((set) => {
  // Get initial theme (default to 'light')
  const savedTheme = localStorage.getItem('theme') || 'light'
  
  // Apply initially (safe to run on module load / first hook mount)
  if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('data-theme', savedTheme)
  }

  return {
    theme: savedTheme,
    setTheme: (theme) => {
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
      set({ theme })
    },
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', newTheme)
      document.documentElement.setAttribute('data-theme', newTheme)
      return { theme: newTheme }
    })
  }
})
