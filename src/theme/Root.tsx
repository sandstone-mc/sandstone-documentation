import React from 'react'
import { MonacoRecoveryProvider } from '../components/MonacoRecoveryContext'

// Wrap the entire app with providers
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <MonacoRecoveryProvider>
      {children}
    </MonacoRecoveryProvider>
  )
}
