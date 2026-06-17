import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const COLUMNS = [
  { id: 'todo', label: '📋 To Do' },
  { id: 'inprogress', label: '⚡ In Progress' },
  { id: 'done', label: '✅ Done' }
]

export default function KanbanBoard({ userId, refresh, onUpdate }) {
  const [tasks, setTasks] = useState([])
  const [dragging, setDragging] = useState(null)

  useEffect(() => { fetchTasks() }, [refresh])

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setTasks(data || [])
  }

  async function moveTask(taskId, newStatus) {
  await supabase.from('tasks')
    .update({ 
      status: newStatus,
      completed: newStatus === 'done'
    })
    .eq('id', taskId)
  await fetchTasks()
  onUpdate()
}

  async function deleteTask(id) {
    await supabase.from('tasks').delete().eq('id', id)
    fetchTasks()
    onUpdate()
  }

  function onDragStart(task) { setDragging(task) }
  function onDragOver(e) { e.preventDefault() }
  function onDrop(columnId) {
    if (dragging) { moveTask(dragging.id, columnId); setDragging(null) }
  }

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => (
        <div key={col.id} className="kanban-column"
          onDragOver={onDragOver}
          onDrop={() => onDrop(col.id)}>
          <div className="kanban-column-header">
            <span>{col.label}</span>
            <span className="kanban-count">
              {tasks.filter(t => (t.status || 'todo') === col.id).length}
            </span>
          </div>
          <div className="kanban-cards">
            {tasks
              .filter(t => (t.status || 'todo') === col.id)
              .map(task => (
                <div key={task.id} className={`kanban-card priority-${task.priority}`}
                  draggable
                  onDragStart={() => onDragStart(task)}>
                  <div className="kanban-card-top">
                    <span className={`badge ${task.priority}`}>{task.priority}</span>
                    <button className="delete-btn" onClick={() => deleteTask(task.id)}>✕</button>
                  </div>
                  <p className="kanban-title">{task.title}</p>
                  {task.description && <p className="kanban-desc">{task.description}</p>}
                  {task.due_date && (
                    <p className="task-due">📅 {new Date(task.due_date).toLocaleDateString()}</p>
                  )}
                  <div className="kanban-actions">
                    {COLUMNS.filter(c => c.id !== col.id).map(c => (
                      <button key={c.id} className="move-btn"
                        onClick={() => moveTask(task.id, c.id)}>
                        → {c.label.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
