import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TaskForm({ userId, onTaskAdded }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')

  async function handleAdd() {
    if (!title.trim()) return
    await supabase.from('tasks').insert({
      user_id: userId,
      title,
      description,
      priority,
      due_date: dueDate || null
    })
    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    onTaskAdded()
  }

  return (
    <div className="task-form">
      <input type="text" placeholder="Task title" value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()} />
      <input type="text" placeholder="Description (optional)" value={description}
        onChange={e => setDescription(e.target.value)} />
      <div className="task-form-row">
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">🟢 Low Priority</option>
          <option value="medium">🟡 Medium Priority</option>
          <option value="high">🔴 High Priority</option>
        </select>
        <input type="date" value={dueDate}
          onChange={e => setDueDate(e.target.value)} />
      </div>
      <button onClick={handleAdd}>+ Add Task</button>
    </div>
  )
}
