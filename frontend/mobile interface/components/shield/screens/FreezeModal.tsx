'use client'

import styles from './FreezeModal.module.css'

export default function FreezeModal() {
  return (
    <div className={styles.overlay}>
      <div className={styles.warningBadge}>
        <div className={styles.warningDot} />
        <span className={styles.warningText}>FROZEN</span>
      </div>

      <div className={styles.iconContainer}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>

      <h1 className={styles.title}>Transaction Frozen</h1>
      
      <p className={styles.description}>
        Suspicious activity detected on your account.
      </p>
      
      <p className={styles.alertInfo}>
        {"We've sent an alert to your registered number."}
      </p>

      <div className={styles.phoneNumber}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
        </svg>
        Call 1800-SHIELD
      </div>
    </div>
  )
}
