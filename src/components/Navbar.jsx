import { useState } from 'react'
import config from '../config'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  { label: 'Dashboard', view: 'dashboard' },
  { label: 'Tasks', view: 'tasks' },
  { label: 'Add Task', view: 'add' },
  { label: 'Test 22', view: 'test22' },
]

export default function Navbar({ currentView, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNav = (view) => {
    onNavigate(view)
    setMenuOpen(false)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        <button className={styles.brand} onClick={() => handleNav('dashboard')}>
          <span className={styles.brandIcon}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="white" fillOpacity="0.2" />
              <path d="M8 11h16M8 16h10M8 21h13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="24" cy="21" r="4" fill="#c4b5fd" />
              <path d="M22.5 21l1 1 2-2" stroke="#5b21b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className={styles.brandName}>{config.appTitle}</span>
          {config.devBadge && (
            <span className={styles.devBadge}>DEV BUILD</span>
          )}
        </button>

        <ul className={styles.navLinks}>
          {NAV_LINKS.map((link) => (
            <li key={link.view}>
              <button
                className={`${styles.navLink} ${currentView === link.view ? styles.active : ''}`}
                onClick={() => handleNav(link.view)}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
        </button>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_LINKS.map((link) => (
            <button
              key={link.view}
              className={`${styles.mobileLink} ${currentView === link.view ? styles.mobileLinkActive : ''}`}
              onClick={() => handleNav(link.view)}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
