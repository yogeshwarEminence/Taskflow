import { useState, useEffect } from 'react'
import { useTasks } from '../context/TaskContext'
import styles from './TaskForm.module.css'

const CATEGORIES = ['Design', 'Engineering', 'Analytics', 'DevOps', 'People', 'Legal', 'Marketing', 'Other']

const empty = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  category: 'Engineering',
  dueDate: '',
}

export default function TaskForm({ editTask, onClose, onSuccess }) {
  const { addTask, updateTask } = useTasks()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (editTask) setForm({ ...empty, ...editTask })
    else setForm(empty)
  }, [editTask])

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Title is required.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (!form.dueDate) errs.dueDate = 'Due date is required.'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    if (editTask) {
      updateTask({ ...form, id: editTask.id })
    } else {
      addTask(form)
    }
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setForm(empty)
      if (onSuccess) onSuccess()
      if (onClose) onClose()
    }, 900)
  }

  return (
    <div className={styles.formWrap}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>{editTask ? 'Edit Task' : 'Add New Task'}</h2>
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {submitted && (
        <div className={styles.success}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Task {editTask ? 'updated' : 'added'} successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="tf-title">Task Title</label>
          <input
            id="tf-title"
            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
            type="text"
            placeholder="e.g. Redesign the onboarding flow"
            value={form.title}
            onChange={set('title')}
          />
          {errors.title && <span className={styles.error}>{errors.title}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="tf-desc">Description</label>
          <textarea
            id="tf-desc"
            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
            placeholder="Briefly describe what needs to be done..."
            rows={3}
            value={form.description}
            onChange={set('description')}
          />
          {errors.description && <span className={styles.error}>{errors.description}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tf-status">Status</label>
            <select id="tf-status" className={styles.select} value={form.status} onChange={set('status')}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="tf-priority">Priority</label>
            <select id="tf-priority" className={styles.select} value={form.priority} onChange={set('priority')}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="tf-category">Category</label>
            <select id="tf-category" className={styles.select} value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="tf-due">Due Date</label>
            <input
              id="tf-due"
              className={`${styles.input} ${errors.dueDate ? styles.inputError : ''}`}
              type="date"
              value={form.dueDate}
              onChange={set('dueDate')}
            />
            {errors.dueDate && <span className={styles.error}>{errors.dueDate}</span>}
          </div>
        </div>

        <div className={styles.formActions}>
          {onClose && (
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          )}
          <button type="submit" className={styles.submitBtn}>
            {editTask ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  )
}
