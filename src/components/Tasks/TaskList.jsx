import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TaskList({ userId, refresh, onUpdate, showToast }) {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [editingTask, setEditingTask] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPriority, setEditPriority] = useState('medium')
  const [editDueDate, setEditDueDate] = useState('')

  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTasks() }, [refresh])

  async function fetchTasks() {
    setLoading(true)
    const { data } = await supabase
      .from('tasks').select('*').eq('user_id', userId)
      .order('created_at', { ascending: false })
    setTasks(data || [])
    setLoading(false)
  }

  async function toggleComplete(id, current) {
    await supabase.from('tasks').update({ completed: !current }).eq('id', id)
    fetchTasks(); onUpdate()
  }

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks(); onUpdate()
    showToast('Task deleted')
  }

  function openEdit(task) {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditDesc(task.description || '')
    setEditPriority(task.priority)
    setEditDueDate(task.due_date || '')
  }

  async function saveEdit() {
    if (!editTitle.trim()) return
    await supabase.from('tasks').update({
      title: editTitle,
      description: editDesc,
      priority: editPriority,
      due_date: editDueDate || null
    }).eq('id', editingTask.id)
    setEditingTask(null)
    fetchTasks(); onUpdate()
    showToast('Task updated')
  }

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date()

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
            <span style={{marginLeft:'0.3rem', opacity:0.6}}>
              ({f === 'all' ? tasks.length
                : f === 'active' ? tasks.filter(t => !t.completed).length
                : tasks.filter(t => t.completed).length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton-list">
          {[1,2,3,4].map(i => (
            <div key={i} className="skeleton-task-card">
              <div className="skeleton-block" style={{width:'18px', height:'18px', borderRadius:'4px', flexShrink:0}} />
              <div style={{flex:1, display:'flex', flexDirection:'column', gap:'6px'}}>
                <div className="skeleton-block" style={{height:'14px', width:'70%'}} />
                <div className="skeleton-block" style={{height:'11px', width:'40%'}} />
              </div>
              <div className="skeleton-block" style={{width:'50px', height:'20px', borderRadius:'99px'}} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <p>No tasks here</p>
          <span>Click "+ New Task" to get started</span>
        </div>
      ) : (
        filtered.map(task => (
          <div key={task.id} className={`task-card priority-${task.priority}`}
            onClick={() => openEdit(task)}>
            <input type="checkbox" checked={task.completed}
              onChange={() => toggleComplete(task.id, task.completed)}
              onClick={e => e.stopPropagation()} />
            <div className="task-info">
              <span className={`task-title ${task.completed ? 'strikethrough' : ''}`}>
                {task.title}
              </span>
              {task.description && <span className="task-desc">{task.description}</span>}
              {task.due_date && (
                <span className={`task-due ${isOverdue(task.due_date) && !task.completed ? 'overdue' : ''}`}>
                  Due {new Date(task.due_date).toLocaleDateString()}
                  {isOverdue(task.due_date) && !task.completed ? ' — Overdue' : ''}
                </span>
              )}
            </div>
            <div className="task-meta">
              <span className={`badge ${task.priority}`}>{task.priority}</span>
              <button className="delete-btn" onClick={e => { e.stopPropagation(); deleteTask(task.id) }}>✕</button>
            </div>
          </div>
        ))
      )}

      {/* EDIT MODAL */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)} role="dialog" aria-modal="true">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button className="modal-close" onClick={() => setEditingTask(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label>Title *</label>
                <input className="modal-input" type="text" value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveEdit()} autoFocus />
              </div>
              <div className="modal-field">
                <label>Description</label>
                <textarea className="modal-textarea" rows={3} value={editDesc}
                  onChange={e => setEditDesc(e.target.value)} />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Priority</label>
                  <select className="modal-select" value={editPriority}
                    onChange={e => setEditPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Due Date</label>
                  <input className="modal-input" type="date" value={editDueDate}
                    onChange={e => setEditDueDate(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setEditingTask(null)}>Cancel</button>
              <button className="btn-primary" onClick={saveEdit}
                disabled={!editTitle.trim()}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
