import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

type MonacoRecoveryContextType = {
  /** Increments when Monaco crashes - components should reset when this changes */
  resetKey: number
  /** Call this to trigger a recovery (unmount all editors, remount visible ones) */
  triggerRecovery: () => void
}

const MonacoRecoveryContext = createContext<MonacoRecoveryContextType>({
  resetKey: 0,
  triggerRecovery: () => {},
})

export const useMonacoRecovery = () => useContext(MonacoRecoveryContext)

// Global reference so the error handler can trigger recovery
let globalTriggerRecovery: (() => void) | null = null
let lastRecoveryTime = 0
let isRecovering = false
const RECOVERY_COOLDOWN_MS = 2000

// Install global Monaco error handler once
let errorHandlerInstalled = false
function installMonacoErrorHandler() {
  if (errorHandlerInstalled || typeof window === 'undefined') return
  errorHandlerInstalled = true

  const isMonacoError = (error: Error | null, message?: string) => {
    const msg = error?.message || message || ''
    const stack = error?.stack || ''

    // Check if error originates from Monaco (CDN path in stack)
    const isFromMonaco = stack.includes('monaco') || stack.includes('editor.api')

    // "Canceled" errors during recovery are expected - just suppress, don't re-trigger
    if (msg === 'Canceled' && isRecovering) {
      return 'suppress-only'
    }

    // Known Monaco errors to suppress and recover from
    const isKnownError = (
      msg.includes('offsetNode') ||
      msg.includes("can't access property") ||
      msg.includes('is null') ||
      msg === 'Canceled' ||
      stack.includes('doHitTest') ||
      stack.includes('HitTest')
    )

    return isKnownError || isFromMonaco
  }

  const handleError = (error: Error | null, message?: string, event?: Event) => {
    const result = isMonacoError(error, message)
    if (!result) return false

    // Always suppress Monaco errors
    event?.preventDefault()
    if (event && 'stopImmediatePropagation' in event) {
      event.stopImmediatePropagation()
    }

    // Only trigger recovery if not just suppressing and not in cooldown
    if (result !== 'suppress-only') {
      const now = Date.now()
      if (now - lastRecoveryTime > RECOVERY_COOLDOWN_MS && !isRecovering) {
        console.warn('[Monaco] Error detected, triggering recovery:', error?.message || message)
        lastRecoveryTime = now
        isRecovering = true
        globalTriggerRecovery?.()
        // Reset recovering flag after a short delay
        setTimeout(() => { isRecovering = false }, 500)
      } else {
        console.warn('[Monaco] Error suppressed (cooldown/recovering):', error?.message || message)
      }
    }

    return true
  }

  // Capture phase to catch before it propagates
  window.addEventListener('error', (event) => {
    if (handleError(event.error, event.message, event)) {
      return false
    }
  }, true)

  // Bubble phase as fallback
  window.addEventListener('error', (event) => {
    if (handleError(event.error, event.message, event)) {
      return false
    }
  })

  // Catch unhandled promise rejections from Monaco
  window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, event.reason?.message, event)
  })
}

// Install error handler immediately on module load (before React mounts)
if (typeof window !== 'undefined') {
  installMonacoErrorHandler()
}

export function MonacoRecoveryProvider({ children }: { children: React.ReactNode }) {
  const [resetKey, setResetKey] = useState(0)

  const triggerRecovery = useCallback(() => {
    console.log('[Monaco] Recovery triggered - resetting all editors')
    setResetKey(k => k + 1)
  }, [])

  // Set up global reference for the error handler to call
  useEffect(() => {
    globalTriggerRecovery = triggerRecovery
    // Ensure handler is installed (may already be from module load)
    installMonacoErrorHandler()
    return () => {
      globalTriggerRecovery = null
    }
  }, [triggerRecovery])

  return (
    <MonacoRecoveryContext.Provider value={{ resetKey, triggerRecovery }}>
      {children}
    </MonacoRecoveryContext.Provider>
  )
}
