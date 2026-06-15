import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TaskList({ userId, refresh }) {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchTasks()
  }, [refresh])

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setTasks(data || [])
  }

  async function toggleComplete(id, current) {
    await supabase.from('tasks').update({ completed: !current }).eq('id', id)
    fetchTasks()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
  }

  const filtered = filter === 'all' ? tasks
    : filter === 'active' ? tasks.filter(t => !t.completed)
    : tasks.filter(t => t.completed)

  return (
    <div className="task-list">
      <div className="filters">
        {['all', 'active', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={filter === f ? 'active-filter' : ''}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {filtered.map(task => (
        <div key={task.id} className={`task-card priority-${task.priority}`}>
          <input type="checkbox" checked={task.completed}
            onChange={() => toggleComplete(task.id, task.completed)} />
          <div className="task-info">
            <span className={task.completed ? 'strikethrough' : ''}>{task.title}</span>
            <span className="task-desc">{task.description}</span>
          </div>
          <span className={`badge ${task.priority}`}>{task.priority}</span>
          <button className="delete-btn" onClick={() => deleteTask(task.id)}>✕</button>
        </div>
      ))}
      {filtered.length === 0 && <p className="empty">No tasks here.</p>}
    </div>
  )
}
