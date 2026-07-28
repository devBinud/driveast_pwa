import React from 'react'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from './routes/AppRoutes'
import { PWAInstallModal } from './components/common/PWAInstallModal/PWAInstallModal'

function App() {
  return (
    <>
      <AppRoutes />
      
      {/* PWA Install Modal Prompt */}
      <PWAInstallModal />

      {/* Toast notifications renderer */}
      <Toaster 
        position="top-center"
        containerStyle={{
          top: 80
        }}
        toastOptions={{
          className: 'glass-panel',
          duration: 3500,
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--card-border)',
            fontSize: '0.875rem'
          }
        }}
      />
    </>
  )
}

export default App
