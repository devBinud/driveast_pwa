import React from 'react'
import { Toaster } from 'react-hot-toast'
import { AppRoutes } from './routes/AppRoutes'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { PWAInstallModal } from './components/common/PWAInstallModal/PWAInstallModal'

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App
