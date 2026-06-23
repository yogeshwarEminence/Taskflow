import { useState } from 'react'
import { useTasks } from '../context/TaskContext'
import styles from './TaskCard.module.css'

const STATUS_CONFIG = {
  todo: { label: 'To Do', color: '#64748b', bg: '#f1f5f9' },
  'in-progress': { label: 'In Progress', color: '#d97706', bg: '#fef9c3' },
  completed: { label: 'Completed', color: '#16a34a', bg: '#dcfce7' },
}

const PRIORITY_CONFIG = {
  high: { label: 'High', color: '#dc2626', dot: '#ef4444' },
  medium: { label: 'Medium', color: '#d97706', dot: '#f59e0b' },
  low: { label: 'Low', color: '#16a34a', dot: '#22c55e' },
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isOverdue(dateStr, status) {
  if (status === 'completed' || !dateStr) return false
  return new Date(dateStr) < new Date(new Date().toDateString())
}

export default function TaskCard({ task, onEdit }) {
  const { updateTask, deleteTask } = useTasks()
  const [showConfirm, setShowConfirm] = useState(false)

  const status = STATUS_CONFIG[task.status]
  const priority = PRIORITY_CONFIG[task.priority]
  const overdue = isOverdue(task.dueDate, task.status)

  const cycleStatus = () => {
    const order = ['todo', 'in-progress', 'completed']
    const next = order[(order.indexOf(task.status) + 1) % order.length]
    updateTask({ ...task, status: next })
  }

  return (
    <div className={`${styles.card} ${task.status === 'completed' ? styles.done : ''}`}>
      <div className={styles.header}>
        <div className={styles.badges}>
          <button
            className={styles.statusBadge}
            style={{ color: status.color, background: status.bg }}
            onClick={cycleStatus}
            title="Click to advance status"
          >
            {status.label}
          </button>
          <span
            className={styles.priorityBadge}
            style={{ color: priority.color }}
          >
            <span className={styles.dot} style={{ background: priority.dot }} />
            {priority.label}
          </span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => onEdit(task)} title="Edit task">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          {!showConfirm ? (
            <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => setShowConfirm(true)} title="Delete task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          ) : (
            <div className={styles.confirmRow}>
              <button className={styles.confirmYes} onClick={() => deleteTask(task.id)}>Delete</button>
              <button className={styles.confirmNo} onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      <h3 className={`${styles.title} ${task.status === 'completed' ? styles.titleDone : ''}`}>
        {task.title}
      </h3>
      <p className={styles.description}>{task.description}</p>

      <div className={styles.footer}>
        <span className={styles.category}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          {task.category}
        </span>
        {task.dueDate && (
          <span className={`${styles.due} ${overdue ? styles.overdue : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {overdue ? 'Overdue · ' : ''}{formatDate(task.dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}
