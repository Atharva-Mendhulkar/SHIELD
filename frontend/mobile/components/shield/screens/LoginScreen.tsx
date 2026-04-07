'use client'

import { useState } from 'react'
import styles from './LoginScreen.module.css'

interface LoginScreenProps {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call to /session/start
    try {
      await fetch('http://localhost:8000/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      }).catch(() => {
        // API might not be available, continue anyway for demo
      })
    } catch {
      // Continue with demo flow
    }
    
    setTimeout(() => {
      setIsLoading(false)
      onLogin()
    }, 800)
  }

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <div className={styles.shieldIcon}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.67-3.13 8.96-7 10.08-3.87-1.12-7-5.41-7-10.08V6.3l7-3.12zm0 3.82l-4 1.78v3.44c0 2.79 1.64 5.36 4 6.32 2.36-.96 4-3.53 4-6.32V8.78l-4-1.78z"/>
          </svg>
        </div>
        <span className={styles.brandName}>S.H.I.E.L.D</span>
        <span className={styles.subtitle}>
          Session-based Heuristic Intelligence for Event Level Defense
        </span>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Username</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Password</label>
          <input
            type="password"
            className={styles.input}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          className={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? 'Authenticating...' : 'Login Securely'}
        </button>
      </form>

      <div className={styles.footer}>
        <div className={styles.footerDot} />
        <span className={styles.footerText}>Protected by SHIELD Behavioral Biometrics</span>
      </div>
    </div>
  )
}
