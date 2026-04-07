'use client'

import { ReactNode } from 'react'
import styles from './PhoneFrame.module.css'

interface PhoneFrameProps {
  children: ReactNode
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className={styles.container}>
      <div className={styles.phoneFrame}>
        <div className={styles.phoneScreen}>
          <div className={styles.notch}>
            <div className={styles.notchCamera} />
            <div className={styles.notchSpeaker} />
          </div>
          <div className={styles.screenContent}>
            {children}
          </div>
          <div className={styles.homeIndicator} />
        </div>
      </div>
    </div>
  )
}
