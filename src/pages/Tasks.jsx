import { useState } from 'react'
import { useTasks } from '../context/TaskContext'
import TaskCard from '../components/TaskCard'
import SearchBar from '../components/SearchBar'
import Modal from '../components/Modal'
import TaskForm from '../components/TaskForm'
import styles from './Tasks.module.css'

export default function Tasks({ onNavigate }) {
  const { filteredTasks, search, filter } = useTasks()
  const [editTask, setEditTask] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleEdit = (task) => {
    setEditTask(task)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditTask(null)
  }

  const emptyMessage = () => {
    if (search) return `No tasks match "${search}".`
    if (filter !== 'all') return `No tasks with status "${filter}".`
    return 'No tasks yet. Add one to get started.'
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Task List</h1>
          <p className={styles.sub}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button className={styles.addBtn} onClick={() => onNavigate('add')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Task
        </button>
      </div>

      <div className={styles.controls}>
        <SearchBar />
      </div>

      {filteredTasks.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🗂️</div>
          <p className={styles.emptyText}>{emptyMessage()}</p>
          <button className={styles.emptyAction} onClick={() => onNavigate('add')}>Add a Task</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal}>
        <TaskForm editTask={editTask} onClose={closeModal} />
      </Modal>
    </div>
  )
}
