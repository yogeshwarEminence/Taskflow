import TaskForm from '../components/TaskForm'
import styles from './AddTask.module.css'

export default function AddTask({ onNavigate }) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => onNavigate('tasks')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Tasks
        </button>
        <h1 className={styles.heading}>Add New Task</h1>
        <p className={styles.sub}>Fill in the details below to create a new task.</p>
      </div>
      <TaskForm onSuccess={() => onNavigate('tasks')} />
    </div>
  )
}
