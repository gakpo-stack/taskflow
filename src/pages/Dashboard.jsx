import { useState } from 'react'
import TaskForm from '../components/Tasks/TaskForm'
import TaskList from '../components/Tasks/TaskList'
import Navbar from '../components/UI/Navbar'

export default function Dashboard({ user }) {
  const [refresh, setRefresh] = useState(0)

  function handleTaskAdded() {
    setRefresh(r => r + 1)
  }

  return (
    <div className="dashboard">
      <Navbar email={user.email} />
      <div className="dashboard-content">
        <h2>My Tasks</h2>
        <TaskForm userId={user.id} onTaskAdded={handleTaskAdded} />
        <TaskList userId={user.id} refresh={refresh} />
      </div>
    </div>
  )
}
