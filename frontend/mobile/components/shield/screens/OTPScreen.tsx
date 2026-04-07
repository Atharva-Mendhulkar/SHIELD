'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './OTPScreen.module.css'

interface OTPScreenProps {
  onBack: () => void
  onConfirm: () => void
}

export default function OTPScreen({ onBack, onConfirm }: OTPScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(28)
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    // Simulate API call to /session/feature
    try {
      const response = await fetch('http://localhost:8000/session/feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otp.join('') }),
      }).catch(() => null)

      if (response) {
        const data = await response.json()
        if (data.action === 'BLOCK_AND_FREEZE') {
          onConfirm() // This will trigger the freeze modal
          return
        }
      }
    } catch {
      // Continue with demo flow
    }

    setTimeout(() => {
      setIsLoading(false)
      onConfirm()
    }, 1500)
  }

  const handleResend = () => {
    setTimeLeft(28)
    setOtp(['', '', '', '', '', ''])
  }

  const circumference = 2 * Math.PI * 36
  const strokeDashoffset = circumference * (1 - timeLeft / 28)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={styles.title}>Verify Transaction</h1>
      </div>

      <p className={styles.instruction}>
        Enter the 6-digit OTP sent to<br />
        +91 ****6789
      </p>

      <div className={styles.otpContainer}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            className={styles.otpInput}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
          />
        ))}
      </div>

      <div className={styles.timerContainer}>
        <div className={styles.timerRing}>
          <svg width="80" height="80">
            <circle className={styles.timerBg} cx="40" cy="40" r="36" />
            <circle 
              className={styles.timerProgress} 
              cx="40" 
              cy="40" 
              r="36"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <span className={styles.timerText}>0:{timeLeft.toString().padStart(2, '0')}</span>
        </div>
        <span className={styles.timerLabel}>Expires in</span>
      </div>

      <button 
        className={styles.resendButton}
        onClick={handleResend}
        disabled={timeLeft > 0}
      >
        Resend OTP
      </button>

      <button 
        className={styles.submitButton}
        onClick={handleSubmit}
        disabled={otp.some(d => !d) || isLoading}
      >
        {isLoading ? 'Verifying...' : 'Confirm Payment'}
      </button>
    </div>
  )
}
