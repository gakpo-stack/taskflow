import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import TaskList from '../components/Tasks/TaskList'
import KanbanBoard from '../components/Tasks/KanbanBoard'
import Analytics from './Analytics'

const TASK_LIMIT_FREE = 20

export default function Dashboard({ user }) {
  const [view, setView] = useState('list')
  const [refresh, setRefresh] = useState(0)
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0, overdue: 0 })
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [adding, setAdding] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (!mobile) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => { fetchStats() }, [refresh])

  async function fetchStats() {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id)
    if (data) {
      const now = new Date()
      setStats({
        total: data.length,
        completed: data.filter(t => t.completed).length,
        active: data.filter(t => !t.completed).length,
        overdue: data.filter(t => !t.completed && t.due_date && new Date(t.due_date) < now).length
      })
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleAdd() {
    if (!title.trim()) return
    if (stats.total >= TASK_LIMIT_FREE) {
      showToast(`Free plan limit: ${TASK_LIMIT_FREE} tasks. Upgrade to Pro.`, 'error')
      return
    }
    setAdding(true)
    const { error } = await supabase.from('tasks').insert({
      user_id: user.id, title, description,
      priority, due_date: dueDate || null, status: 'todo'
    })
    setAdding(false)
    if (error) { showToast('Failed to add task', 'error'); return }
    setTitle(''); setDescription(''); setPriority('medium'); setDueDate('')
    setShowForm(false)
    setRefresh(r => r + 1)
    showToast('Task added')
  }

  const percent = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)
  const isAtLimit = stats.total >= TASK_LIMIT_FREE

  const statCards = [
    { label: 'Total', value: stats.total, color: '#6366f1', bg: 'rgba(99,102,241,0.1)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
    { label: 'Active', value: stats.active, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: 'Done', value: stats.completed, color: '#10b981', bg: 'rgba(16,185,129,0.1)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> },
    { label: 'Overdue', value: stats.overdue, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  ]

  return (
    <div className={`app-layout ${sidebarOpen && !isMobile ? '' : isMobile ? 'mobile-layout' : 'sidebar-collapsed'}`}>

      {/* MOBILE OVERLAY */}
      {isMobile && sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${isMobile && sidebarOpen ? 'sidebar-mobile-open' : ''} ${isMobile && !sidebarOpen ? 'sidebar-mobile-hidden' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon" />
            <span>TaskFlow</span>
          </div>
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>

        <button className="sidebar-new-task" onClick={() => { setShowForm(true); if(isMobile) setSidebarOpen(false) }} aria-label="New task">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>New Task</span>
        </button>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Views</div>
          {[
            { id: 'list', label: 'List', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="18" r="1" fill="currentColor"/></svg> },
            { id: 'kanban', label: 'Kanban', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/></svg> },
            { id: 'analytics', label: 'Analytics', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
            { id: 'team', label: 'Team', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          ].map(item => (
            <button key={item.id}
              className={`sidebar-item ${view === item.id ? 'active' : ''}`}
              onClick={() => { setView(item.id); if(isMobile) setSidebarOpen(false) }}
              aria-label={item.label}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user.email[0].toUpperCase()}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-email">{user.email}</span>
              <span className="sidebar-plan">
                {isAtLimit ? '⚠️ Limit reached' : `Free · ${stats.total}/${TASK_LIMIT_FREE} tasks`}
              </span>
            </div>
          </div>
          <button className="sidebar-signout" onClick={() => supabase.auth.signOut()} aria-label="Sign out">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      <main className="main-content">
        {/* MOBILE HEADER */}
        {isMobile && (
          <div className="mobile-header">
            <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="nav-logo">
              <div className="sidebar-logo-icon" style={{width:20,height:20}} />
              <span>TaskFlow</span>
            </div>
            <button className="btn-new-task" style={{padding:'0.4rem 0.75rem', fontSize:'0.75rem'}} onClick={() => setShowForm(true)}>
              + New
            </button>
          </div>
        )}

        {view === 'analytics' ? (
          <Analytics userId={user.id} />
        ) : view === 'team' ? (
          <TeamView userId={user.id} userEmail={user.email} showToast={showToast} />
        ) : (
          <>
            <div className="content-header">
              <div>
                <h1 className="content-title">{view === 'list' ? 'My Tasks' : 'Kanban Board'}</h1>
                <p className="content-subtitle">
                  {stats.active} active · {stats.completed} completed
                  {stats.overdue > 0 && <span className="overdue-pill">{stats.overdue} overdue</span>}
                  {isAtLimit && <span className="overdue-pill">Task limit reached</span>}
                </p>
              </div>
              {!isMobile && (
                <button className="btn-new-task" onClick={() => setShowForm(true)} disabled={isAtLimit}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  New Task
                </button>
              )}
            </div>

            <div className="stats-grid">
              {statCards.map((s, i) => (
                <div key={i} className="stat-card" style={{'--stat-color': s.color, '--stat-bg': s.bg}}>
                  <div className="stat-icon-wrap" style={{background: s.bg, color: s.color}}>{s.icon}</div>
                  <div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                  <div className="stat-glow" style={{background: s.color}} />
                </div>
              ))}
            </div>

            <div className="progress-container">
              <div className="progress-label">
                <span>Overall Progress</span>
                <span style={{color:'var(--primary)', fontWeight:700}}>{percent}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width:`${percent}%`}} />
              </div>
              <div className="progress-meta">{stats.completed} of {stats.total} tasks complete</div>
            </div>

            {view === 'list'
              ? <TaskList userId={user.id} refresh={refresh} onUpdate={() => setRefresh(r => r + 1)} showToast={showToast} />
              : <KanbanBoard userId={user.id} refresh={refresh} onUpdate={() => setRefresh(r => r + 1)} showToast={showToast} />
            }
          </>
        )}
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)} role="dialog" aria-modal="true">
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Task</h3>
              <button className="modal-close" onClick={() => setShowForm(false)} aria-label="Close">✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <label>Title *</label>
                <input className="modal-input" type="text" placeholder="What needs to be done?"
                  value={title} onChange={e => setTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdd()} autoFocus />
              </div>
              <div className="modal-field">
                <label>Description</label>
                <textarea className="modal-textarea" placeholder="Add more details..." rows={3}
                  value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Priority</label>
                  <select className="modal-select" value={priority} onChange={e => setPriority(e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="modal-field">
                  <label>Due Date</label>
                  <input className="modal-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
              {isAtLimit && (
                <div className="modal-limit-warning">
                  You've reached the 20 task limit on the Free plan. Delete a task or upgrade to Pro.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAdd} disabled={adding || !title.trim() || isAtLimit}>
                {adding ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.message}
        </div>
      )}
    </div>
  )
}

function TeamView({ userId, userEmail, showToast }) {
  const [members, setMembers] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [teamId, setTeamId] = useState(null)

  useEffect(() => { initTeam() }, [])

  async function initTeam() {
    let { data: existing } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      setTeamId(existing.team_id)
      fetchMembers(existing.team_id)
    } else {
      const { data: team } = await supabase
        .from('teams')
        .insert({ owner_id: userId, name: `${userEmail.split('@')[0]}'s Team` })
        .select().single()
      if (team) {
        await supabase.from('team_members').insert({ team_id: team.id, user_id: userId, email: userEmail, role: 'owner' })
        setTeamId(team.id)
        fetchMembers(team.id)
      }
    }
    setLoading(false)
  }

  async function fetchMembers(tid) {
    const { data } = await supabase.from('team_members').select('*').eq('team_id', tid)
    setMembers(data || [])
  }

  async function inviteMember() {
    if (!inviteEmail.trim() || !teamId) return
    const { error } = await supabase.from('team_members').insert({
      team_id: teamId, email: inviteEmail, role: 'member', user_id: null
    })
    if (error) { showToast('Failed to invite member', 'error'); return }
    showToast(`Invite sent to ${inviteEmail}`)
    setInviteEmail('')
    fetchMembers(teamId)
  }

  async function removeMember(id) {
    await supabase.from('team_members').delete().eq('id', id)
    fetchMembers(teamId)
    showToast('Member removed')
  }

  if (loading) return <div className="team-loading"><div className="skeleton-block" style={{height:'200px'}} /></div>

  return (
    <div className="team-page">
      <div className="analytics-header">
        <h2>Team</h2>
        <p>Manage your team members and collaborators</p>
      </div>

      <div className="team-invite-card">
        <h3>Invite a member</h3>
        <div className="team-invite-row">
          <input className="modal-input" type="email" placeholder="colleague@email.com"
            value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && inviteMember()} />
          <button className="btn-primary" onClick={inviteMember}>Send Invite</button>
        </div>
      </div>

      <div className="team-members-card">
        <h3>Members ({members.length})</h3>
        <div className="team-members-list">
          {members.map((m, i) => (
            <div key={i} className="team-member-row">
              <div className="team-member-avatar">{m.email[0].toUpperCase()}</div>
              <div className="team-member-info">
                <span className="team-member-email">{m.email}</span>
                <span className="team-member-role">{m.role}</span>
              </div>
              {m.role !== 'owner' && (
                <button className="delete-btn" onClick={() => removeMember(m.id)}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
