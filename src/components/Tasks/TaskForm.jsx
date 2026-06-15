import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TaskForm({ userId, onTaskAdded }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')

  async function handleAdd() {
    if (!title.trim()) return
    await supabase.from('tasks').insert({
      user_id: userId,
      title,
      description,
      priority
    })
    setTitle('')
    setDescription('')
    setPriority('medium')
    onTaskAdded()
  }

  return (
    <div className="task-form">
      <input type="text" placeholder="Task title" value={title}
        onChange={e => setTitle(e.target.value)} />
      <input type="text" placeholder="Description (optional)" value={description}
        onChange={e => setDescription(e.target.value)} />
      <select value={priority} onChange={e => setPriority(e.target.value)}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button onClick={handleAdd}>Add Task</button>
    </div>
  )
}
