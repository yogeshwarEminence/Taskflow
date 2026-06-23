import { createContext, useContext, useReducer, useCallback } from 'react'

const TaskContext = createContext(null)

const initialTasks = [
  {
    id: 1,
    title: 'Design new landing page mockups',
    description: 'Create high-fidelity wireframes for the updated marketing site homepage.',
    status: 'in-progress',
    priority: 'high',
    category: 'Design',
    dueDate: '2026-07-05',
    createdAt: '2026-06-10',
  },
  {
    id: 2,
    title: 'Review Q2 analytics report',
    description: 'Analyze user engagement metrics and prepare a summary for the team.',
    status: 'completed',
    priority: 'medium',
    category: 'Analytics',
    dueDate: '2026-06-20',
    createdAt: '2026-06-08',
  },
  {
    id: 3,
    title: 'Set up CI/CD pipeline for staging',
    description: 'Configure GitHub Actions to auto-deploy to the staging environment on each PR merge.',
    status: 'todo',
    priority: 'high',
    category: 'DevOps',
    dueDate: '2026-07-10',
    createdAt: '2026-06-12',
  },
  {
    id: 4,
    title: 'Write unit tests for auth module',
    description: 'Achieve 90% test coverage on the authentication service.',
    status: 'todo',
    priority: 'medium',
    category: 'Engineering',
    dueDate: '2026-07-15',
    createdAt: '2026-06-13',
  },
  {
    id: 5,
    title: 'Onboard two new engineers',
    description: 'Prepare onboarding docs, set up access, and schedule intro sessions.',
    status: 'in-progress',
    priority: 'high',
    category: 'People',
    dueDate: '2026-06-28',
    createdAt: '2026-06-15',
  },
  {
    id: 6,
    title: 'Migrate database to PostgreSQL 16',
    description: 'Plan and execute the migration with zero-downtime deployment strategy.',
    status: 'todo',
    priority: 'low',
    category: 'Engineering',
    dueDate: '2026-08-01',
    createdAt: '2026-06-16',
  },
  {
    id: 7,
    title: 'Update privacy policy for GDPR compliance',
    description: 'Review and update the privacy policy to reflect new data handling practices.',
    status: 'completed',
    priority: 'high',
    category: 'Legal',
    dueDate: '2026-06-18',
    createdAt: '2026-06-05',
  },
  {
    id: 8,
    title: 'Redesign email notification templates',
    description: 'Modernize the transactional email templates to match the new brand guidelines.',
    status: 'in-progress',
    priority: 'low',
    category: 'Design',
    dueDate: '2026-07-20',
    createdAt: '2026-06-17',
  },
]

function tasksReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [
          { ...action.payload, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] },
          ...state.tasks,
        ],
      }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? { ...t, ...action.payload } : t)),
      }
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'SET_SEARCH':
      return { ...state, search: action.payload }
    default:
      return state
  }
}

const initialState = {
  tasks: initialTasks,
  filter: 'all',
  search: '',
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(tasksReducer, initialState)

  const addTask = useCallback((task) => dispatch({ type: 'ADD_TASK', payload: task }), [])
  const updateTask = useCallback((task) => dispatch({ type: 'UPDATE_TASK', payload: task }), [])
  const deleteTask = useCallback((id) => dispatch({ type: 'DELETE_TASK', payload: id }), [])
  const setFilter = useCallback((filter) => dispatch({ type: 'SET_FILTER', payload: filter }), [])
  const setSearch = useCallback((search) => dispatch({ type: 'SET_SEARCH', payload: search }), [])

  const filteredTasks = state.tasks.filter((task) => {
    const matchesFilter = state.filter === 'all' || task.status === state.filter
    const query = state.search.toLowerCase()
    const matchesSearch =
      !query ||
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.category.toLowerCase().includes(query)
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: state.tasks.length,
    todo: state.tasks.filter((t) => t.status === 'todo').length,
    inProgress: state.tasks.filter((t) => t.status === 'in-progress').length,
    completed: state.tasks.filter((t) => t.status === 'completed').length,
    highPriority: state.tasks.filter((t) => t.priority === 'high').length,
  }

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        filteredTasks,
        filter: state.filter,
        search: state.search,
        stats,
        addTask,
        updateTask,
        deleteTask,
        setFilter,
        setSearch,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used within TaskProvider')
  return ctx
}
