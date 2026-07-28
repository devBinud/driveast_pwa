import { useState, useEffect } from 'react'

const SNOOZE_DURATION_MS = 60 * 60 * 1000 // 1 hour in milliseconds

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  const isStandalone = () => {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    )
  }

  const isSnoozed = () => {
    const snoozedUntil = localStorage.getItem('pwa_prompt_snoozed_until')
    if (!snoozedUntil) return false
    return Date.now() < Number(snoozedUntil)
  }

  useEffect(() => {
    // 1. Check if already installed
    if (isStandalone() || localStorage.getItem('pwa_installed') === 'true') {
      setIsInstalled(true)
      setShowPrompt(false)
      return
    }

    // 2. Listen for Chrome / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)

      if (!isStandalone() && !isSnoozed() && localStorage.getItem('pwa_installed') !== 'true') {
        setShowPrompt(true)
      }
    }

    // 3. Listen for appinstalled event
    const handleAppInstalled = () => {
      localStorage.setItem('pwa_installed', 'true')
      localStorage.removeItem('pwa_prompt_snoozed_until')
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Fallback check for mobile Safari/iOS or browsers that don't emit beforeinstallprompt
    if (!isStandalone() && !isSnoozed() && localStorage.getItem('pwa_installed') !== 'true') {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
      if (isIOS) {
        setShowPrompt(true)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) {
      return false
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      localStorage.setItem('pwa_installed', 'true')
      setIsInstalled(true)
      setShowPrompt(false)
    } else {
      // If user cancels native prompt, snooze for 1 hour
      snoozePrompt()
    }
    setDeferredPrompt(null)
  }

  const snoozePrompt = () => {
    const nextShowTime = Date.now() + SNOOZE_DURATION_MS
    localStorage.setItem('pwa_prompt_snoozed_until', String(nextShowTime))
    setShowPrompt(false)
  }

  return {
    isInstalled,
    showPrompt,
    installApp,
    snoozePrompt,
    hasDeferredPrompt: Boolean(deferredPrompt)
  }
}

export default usePWAInstall
