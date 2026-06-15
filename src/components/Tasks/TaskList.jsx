import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TaskList({ userId, refresh, onUpdate }) {
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
    onUpdate()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
    onUpdate()
  }

  const filtered = filter === 'all' ? tasks
    : filter === 'active' ? tasks.filter(t => !t.completed)
    : tasks.filter(t => t.completed)

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="task-list">
      <div className="filters">
        {['all', 'active', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={filter === f ? 'active-filter' : ''}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ marginLeft: '0.3rem', opacity: 0.7 }}>
              ({f === 'all' ? tasks.length
                : f === 'active' ? tasks.filter(t => !t.completed).length
                : tasks.filter(t => t.completed).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">✅</div>
          <p>No tasks here</p>
          <span>Add a task above to get started</span>
        </div>
      ) : (
        filtered.map(task => (
          <div key={task.id} className={`task-card priority-${task.priority}`}>
            <input type="checkbox" checked={task.completed}
              onChange={() => toggleComplete(task.id, task.completed)} />
            <div className="task-info">
              <span className={`task-title ${task.completed ? 'strikethrough' : ''}`}>
                {task.title}
              </span>
              {task.description && (
                <span className="task-desc">{task.description}</span>
              )}
              {task.due_date && (
                <span className={`task-due ${isOverdue(task.due_date) && !task.completed ? 'overdue' : ''}`}>
                  📅 {new Date(task.due_date).toLocaleDateString()}
                  {isOverdue(task.due_date) && !task.completed ? ' — Overdue' : ''}
                </span>
              )}
            </div>
            <div className="task-meta">
              <span className={`badge ${task.priority}`}>{task.priority}</span>
              <button className="delete-btn" onClick={() => deleteTask(task.id)}>✕</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
