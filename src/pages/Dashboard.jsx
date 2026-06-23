import { useState } from 'react'
import { useTasks } from '../context/TaskContext'
import StatCard from '../components/StatCard'
import TaskCard from '../components/TaskCard'
import Modal from '../components/Modal'
import TaskForm from '../components/TaskForm'
import styles from './Dashboard.module.css'

const CATEGORY_COLORS = {
  Design: '#8b5cf6',
  Engineering: '#2563eb',
  Analytics: '#0891b2',
  DevOps: '#d97706',
  People: '#16a34a',
  Legal: '#dc2626',
  Marketing: '#ec4899',
  Other: '#6b7280',
}

export default function Dashboard({ onNavigate }) {
  const { tasks, stats, filteredTasks, setFilter } = useTasks()
  const [editTask, setEditTask] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const recentTasks = tasks.slice(0, 5)

  const categoryMap = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1
    return acc
  }, {})

  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])

  const completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0

  const handleStatClick = (filterVal) => {
    setFilter(filterVal)
    onNavigate('tasks')
  }

  const handleEdit = (task) => {
    setEditTask(task)
    setModalOpen(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.heroRow}>
        <div>
          <h1 className={styles.heading}>Dashboard</h1>
          <p className={styles.sub}>Here&rsquo;s what&rsquo;s happening with your projects today.</p>
        </div>
        <button className={styles.addBtn} onClick={() => onNavigate('add')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Task
        </button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          label="Total Tasks"
          value={stats.total}
          icon="📋"
          color="#2563eb"
          subtitle="All active projects"
          onClick={() => handleStatClick('all')}
        />
        <StatCard
          label="To Do"
          value={stats.todo}
          icon="⏳"
          color="#64748b"
          subtitle="Pending work"
          onClick={() => handleStatClick('todo')}
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon="🔄"
          color="#d97706"
          subtitle="Currently active"
          onClick={() => handleStatClick('in-progress')}
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon="✅"
          color="#16a34a"
          subtitle={`${completionRate}% completion rate`}
          onClick={() => handleStatClick('completed')}
        />
        <StatCard
          label="High Priority"
          value={stats.highPriority}
          icon="🔴"
          color="#dc2626"
          subtitle="Needs attention"
        />
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Tasks</h2>
            <button className={styles.viewAll} onClick={() => onNavigate('tasks')}>View all →</button>
          </div>
          <div className={styles.taskList}>
            {recentTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEdit} />
            ))}
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Progress Overview</h2>
            <div className={styles.progressCard}>
              <div className={styles.progressCircleWrap}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--gray-100)" strokeWidth="12" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="var(--primary-500)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - completionRate / 100)}`}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                  <text x="60" y="56" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--gray-900)">{completionRate}%</text>
                  <text x="60" y="73" textAnchor="middle" fontSize="10" fill="var(--gray-400)">Complete</text>
                </svg>
              </div>
              <div className={styles.progressLegend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#64748b' }} />
                  <span>To Do</span>
                  <strong>{stats.todo}</strong>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#d97706' }} />
                  <span>In Progress</span>
                  <strong>{stats.inProgress}</strong>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#16a34a' }} />
                  <span>Completed</span>
                  <strong>{stats.completed}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.section} ${styles.sectionMt}`}>
            <h2 className={styles.sectionTitle}>By Category</h2>
            <div className={styles.categoryList}>
              {categories.map(([cat, count]) => (
                <div key={cat} className={styles.categoryItem}>
                  <div className={styles.catLeft}>
                    <span className={styles.catDot} style={{ background: CATEGORY_COLORS[cat] || '#6b7280' }} />
                    <span className={styles.catName}>{cat}</span>
                  </div>
                  <div className={styles.catRight}>
                    <div className={styles.catBar}>
                      <div
                        className={styles.catBarFill}
                        style={{
                          width: `${(count / stats.total) * 100}%`,
                          background: CATEGORY_COLORS[cat] || '#6b7280',
                        }}
                      />
                    </div>
                    <span className={styles.catCount}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditTask(null) }}>
        <TaskForm
          editTask={editTask}
          onClose={() => { setModalOpen(false); setEditTask(null) }}
        />
      </Modal>
    </div>
  )
}
