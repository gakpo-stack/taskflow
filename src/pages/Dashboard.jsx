import { useState, useEffect } from 'react'
import TaskForm from '../components/Tasks/TaskForm'
import TaskList from '../components/Tasks/TaskList'
import KanbanBoard from '../components/Tasks/KanbanBoard'
import Navbar from '../components/UI/Navbar'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard({ user }) {
  const [refresh, setRefresh] = useState(0)
  const [stats, setStats] = useState({ total: 0, completed: 0 })
  const [view, setView] = useState('list')

  useEffect(() => { fetchStats() }, [refresh])

  async function fetchStats() {
    const { data } = await supabase
      .from('tasks').select('completed').eq('user_id', user.id)
    if (data) {
      setStats({
        total: data.length,
        completed: data.filter(t => t.completed).length
      })
    }
  }

  function handleTaskAdded() { setRefresh(r => r + 1) }

  const percent = stats.total === 0 ? 0
    : Math.round((stats.completed / stats.total) * 100)

  return (
    <div className="dashboard">
      <Navbar email={user.email} />
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>My Tasks</h2>
          <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            {stats.completed}/{stats.total} completed
          </span>
        </div>

        <div className="progress-container">
          <div className="progress-label">
            <span>Overall Progress</span>
            <span>{percent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <TaskForm userId={user.id} onTaskAdded={handleTaskAdded} />

        <div className="view-toggle">
          <button className={view === 'list' ? 'active-filter' : ''}
            onClick={() => setView('list')}>📋 List</button>
          <button className={view === 'kanban' ? 'active-filter' : ''}
            onClick={() => setView('kanban')}>🗂️ Kanban</button>
        </div>

        {view === 'list'
          ? <TaskList userId={user.id} refresh={refresh} onUpdate={handleTaskAdded} />
          : <KanbanBoard userId={user.id} refresh={refresh} onUpdate={handleTaskAdded} />
        }
      </div>
    </div>
  )
}
