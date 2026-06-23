import { useState } from 'react'
import { TaskProvider } from './context/TaskContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import AddTask from './pages/AddTask'
import styles from './App.module.css'

export default function App() {
  const [view, setView] = useState('dashboard')

  const renderPage = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onNavigate={setView} />
      case 'tasks':
        return <Tasks onNavigate={setView} />
      case 'add':
        return <AddTask onNavigate={setView} />
      default:
        return <Dashboard onNavigate={setView} />
    }
  }

  return (
    <TaskProvider>
      <div className={styles.shell}>
        <Navbar currentView={view} onNavigate={setView} />
        <main className={styles.main}>
          {renderPage()}
        </main>
        <Footer />
      </div>
    </TaskProvider>
  )
}
