'use client'

import { useState, useEffect } from 'react'
import PhoneFrame from './PhoneFrame'
import ShieldBadge, { ShieldStatus } from './ShieldBadge'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import TransferScreen from './screens/TransferScreen'
import OTPScreen from './screens/OTPScreen'
import FreezeModal from './screens/FreezeModal'

type Screen = 'login' | 'dashboard' | 'transfer' | 'otp'

export default function ShieldApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login')
  const [shieldStatus, setShieldStatus] = useState<ShieldStatus>('protected')
  const [isFrozen, setIsFrozen] = useState(false)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))

  // Simulate periodic score checks
  useEffect(() => {
    if (currentScreen === 'login') return

    const checkScore = async () => {
      try {
        const response = await fetch(`http://localhost:8000/score/${sessionId}`).catch(() => null)
        if (response) {
          const data = await response.json()
          if (data.score < 0.3) {
            setShieldStatus('frozen')
            setIsFrozen(true)
          } else if (data.score < 0.7) {
            setShieldStatus('checking')
          } else {
            setShieldStatus('protected')
          }
        }
      } catch {
        // API not available, demo mode
      }
    }

    const interval = setInterval(checkScore, 5000)
    return () => clearInterval(interval)
  }, [currentScreen, sessionId])

  const handleLogin = () => {
    setShieldStatus('checking')
    setTimeout(() => {
      setShieldStatus('protected')
      setCurrentScreen('dashboard')
    }, 500)
  }

  const handleTransfer = () => {
    setCurrentScreen('transfer')
  }

  const handleReviewTransfer = () => {
    setShieldStatus('checking')
    setTimeout(() => {
      setShieldStatus('protected')
      setCurrentScreen('otp')
    }, 300)
  }

  const handleConfirmPayment = () => {
    setShieldStatus('checking')
    
    // Simulate fraud detection - 30% chance of freeze for demo
    setTimeout(() => {
      const shouldFreeze = Math.random() < 0.3
      if (shouldFreeze) {
        setShieldStatus('frozen')
        setIsFrozen(true)
      } else {
        setShieldStatus('protected')
        // Success - go back to dashboard
        setCurrentScreen('dashboard')
      }
    }, 1500)
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />
      case 'dashboard':
        return <DashboardScreen onTransfer={handleTransfer} />
      case 'transfer':
        return (
          <TransferScreen 
            onBack={() => setCurrentScreen('dashboard')} 
            onReview={handleReviewTransfer}
          />
        )
      case 'otp':
        return (
          <OTPScreen 
            onBack={() => setCurrentScreen('transfer')} 
            onConfirm={handleConfirmPayment}
          />
        )
    }
  }

  return (
    <PhoneFrame>
      {currentScreen !== 'login' && <ShieldBadge status={shieldStatus} />}
      {renderScreen()}
      {isFrozen && <FreezeModal />}
    </PhoneFrame>
  )
}
