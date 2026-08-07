import { useState, useEffect } from 'react'

const SNOOZE_DURATION_MS = 10 * 60 * 1000 // 10 minutes in milliseconds

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

    const snoozedVal = Number(snoozedUntil)
    const now = Date.now()

    // Clear stale >10-minute snooze timestamp from previous 1-hour logic or expired timestamps
    if (snoozedVal > now + SNOOZE_DURATION_MS || now >= snoozedVal) {
      localStorage.removeItem('pwa_prompt_snoozed_until')
      return false
    }

    return true
  }

  useEffect(() => {
    // 1. Check if currently running inside standalone PWA window
    if (isStandalone()) {
      setIsInstalled(true)
      setShowPrompt(false)
      return
    }

    // If visiting in normal browser tab, clear old pwa_installed flag in case user uninstalled the app
    if (localStorage.getItem('pwa_installed') === 'true' && !isStandalone()) {
      localStorage.removeItem('pwa_installed')
      setIsInstalled(false)
    }

    // 2. Listen for Chrome / Android beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)

      if (!isStandalone() && !isSnoozed()) {
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

    // Fallback check for mobile browsers
    if (!isStandalone() && !isSnoozed()) {
      setShowPrompt(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) {
      localStorage.setItem('pwa_installed', 'true')
      setIsInstalled(true)
      setShowPrompt(false)
      return false
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      localStorage.setItem('pwa_installed', 'true')
      setIsInstalled(true)
      setShowPrompt(false)
    } else {
      // If user cancels native prompt, snooze for 10 minutes
      snoozePrompt()
    }
    setDeferredPrompt(null)
  }

  const snoozePrompt = () => {
    const nextShowTime = Date.now() + SNOOZE_DURATION_MS
    localStorage.setItem('pwa_prompt_snoozed_until', String(nextShowTime))
    setShowPrompt(false)
  }

  const resetPWAState = () => {
    localStorage.removeItem('pwa_prompt_snoozed_until')
    localStorage.removeItem('pwa_installed')
    setIsInstalled(false)
    setShowPrompt(true)
  }

  return {
    isInstalled,
    showPrompt,
    installApp,
    snoozePrompt,
    resetPWAState,
    hasDeferredPrompt: Boolean(deferredPrompt)
  }
}

export default usePWAInstall
