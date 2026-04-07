'use client'

import styles from './DashboardScreen.module.css'

interface DashboardScreenProps {
  onTransfer: () => void
}

export default function DashboardScreen({ onTransfer }: DashboardScreenProps) {
  const shortcuts = [
    { icon: '📱', label: 'Top up\nphone', bg: '#E8F4FD' },
    { icon: '🏦', label: 'Beyond\nBanking', bg: '#FEF3E2' },
    { icon: '💰', label: 'New\nsaving', bg: '#E6FAF5' },
    { icon: '📊', label: 'Financial\nCoach', bg: '#F3E8FF' },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.greeting}>
          <span className={styles.greetingLabel}>Good morning</span>
          <span className={styles.greetingName}>John Kumar 👋</span>
        </div>
        <div className={styles.avatar}>JK</div>
      </div>

      <div className={styles.balanceCard}>
        <div className={styles.accountSelector}>
          Main Account
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        <div className={styles.balance}>INR3,42,580.00</div>
        <div className={styles.accountNumber}>49 **** **** **** 4521</div>

        <div className={styles.actionButtons}>
          <button className={styles.actionButton} onClick={onTransfer}>
            <div className={`${styles.actionIcon} ${styles.actionIconPrimary}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7-7 7 7" />
              </svg>
            </div>
            <span className={styles.actionLabel}>Transfer</span>
          </button>
          <button className={styles.actionButton}>
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <span className={styles.actionLabel}>Details</span>
          </button>
          <button className={styles.actionButton}>
            <div className={styles.actionIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="2" />
                <circle cx="6" cy="12" r="2" />
                <circle cx="18" cy="12" r="2" />
              </svg>
            </div>
            <span className={styles.actionLabel}>More</span>
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </span>
          <button className={styles.editButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
        <div className={styles.shortcuts}>
          {shortcuts.map((shortcut, index) => (
            <button key={index} className={styles.shortcut}>
              <div 
                className={styles.shortcutIcon} 
                style={{ backgroundColor: shortcut.bg }}
              >
                {shortcut.icon}
              </div>
              <span className={styles.shortcutLabel}>
                {shortcut.label.split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>

      <BottomNav activeTab="home" />
    </div>
  )
}

function BottomNav({ activeTab }: { activeTab: string }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    )},
    { id: 'cards', label: 'Cards', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    )},
    { id: 'history', label: 'History', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    )},
    { id: 'invest', label: 'Invest', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18"/>
        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
      </svg>
    )},
    { id: 'profile', label: 'Profile', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )},
  ]

  return (
    <nav className={styles.bottomNav}>
      {tabs.map((tab) => (
        <button 
          key={tab.id} 
          className={`${styles.navItem} ${activeTab === tab.id ? styles.navItemActive : ''}`}
        >
          {tab.icon}
          <span className={styles.navLabel}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
