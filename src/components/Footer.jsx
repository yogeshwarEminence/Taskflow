import config from '../config'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--primary-600)" />
            <path d="M8 11h16M8 16h10M8 21h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="21" r="4" fill="#c4b5fd" />
            <path d="M22.5 21l1 1 2-2" stroke="#5b21b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>TaskFlow</span>
        </div>
        <p className={styles.copy}>{config.footerText}</p>
        {config.isDev && (
          <span className={styles.envTag}>⚠ Development Build</span>
        )}
      </div>
    </footer>
  )
}
