'use client'

import styles from './ShieldBadge.module.css'

export type ShieldStatus = 'protected' | 'checking' | 'frozen'

interface ShieldBadgeProps {
  status: ShieldStatus
}

export default function ShieldBadge({ status }: ShieldBadgeProps) {
  const dotClass = {
    protected: styles.dotProtected,
    checking: styles.dotChecking,
    frozen: styles.dotFrozen,
  }[status]

  const label = {
    protected: 'Protected',
    checking: 'Checking...',
    frozen: 'FROZEN',
  }[status]

  return (
    <div className={styles.badge}>
      <div className={`${styles.dot} ${dotClass}`} />
      <span className={styles.text}>{label}</span>
    </div>
  )
}
