'use client'

import { useState } from 'react'
import styles from './TransferScreen.module.css'

interface TransferScreenProps {
  onBack: () => void
  onReview: () => void
}

export default function TransferScreen({ onBack, onReview }: TransferScreenProps) {
  const [beneficiary, setBeneficiary] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  const recentRecipients = [
    { name: 'Priya S.', initials: 'PS', color: '#8B5CF6' },
    { name: 'Rahul M.', initials: 'RM', color: '#3B82F6' },
    { name: 'Anjali K.', initials: 'AK', color: '#EC4899' },
    { name: 'Vikram T.', initials: 'VT', color: '#10B981' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onReview()
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className={styles.title}>Send Money</h1>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>To</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter name or UPI ID"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Amount</label>
          <div className={styles.amountInputWrapper}>
            <span className={styles.currencyPrefix}>₹</span>
            <input
              type="number"
              className={styles.amountInput}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Add Note (Optional)</label>
          <textarea
            className={styles.noteInput}
            placeholder="What&apos;s this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button type="submit" className={styles.submitButton}>
          Review Transfer
        </button>
      </form>

      <div className={styles.recentSection}>
        <p className={styles.sectionLabel}>Recent Recipients</p>
        <div className={styles.recentRecipients}>
          {recentRecipients.map((recipient, index) => (
            <button 
              key={index} 
              className={styles.recipient}
              onClick={() => setBeneficiary(recipient.name)}
            >
              <div 
                className={styles.recipientAvatar}
                style={{ backgroundColor: recipient.color }}
              >
                {recipient.initials}
              </div>
              <span className={styles.recipientName}>{recipient.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
