import styles from './StatCard.module.css'

export default function StatCard({ label, value, icon, color, subtitle, onClick }) {
  return (
    <button
      className={`${styles.card} ${onClick ? styles.clickable : ''}`}
      style={{ '--card-color': color }}
      onClick={onClick}
      type="button"
    >
      <div className={styles.top}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.value}>{value}</span>
      </div>
      <p className={styles.label}>{label}</p>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <div className={styles.accent} />
    </button>
  )
}
