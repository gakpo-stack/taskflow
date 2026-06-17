import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Analytics({ userId }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('tasks').select('*').eq('user_id', userId)
      setTasks(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  if (loading) return (
    <div className="analytics-loading">
      <div className="skeleton-block" style={{width:'60%', height:'2rem', marginBottom:'1rem'}} />
      <div className="skeleton-block" style={{width:'100%', height:'120px'}} />
    </div>
  )

  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const active = tasks.filter(t => !t.completed).length
  const overdue = tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100)

  const byPriority = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  }

  const byStatus = {
    todo: tasks.filter(t => (t.status || 'todo') === 'todo').length,
    inprogress: tasks.filter(t => t.status === 'inprogress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  const maxPriority = Math.max(...Object.values(byPriority), 1)
  const maxStatus = Math.max(...Object.values(byStatus), 1)

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2>Analytics</h2>
        <p>Real-time insights from your task data</p>
      </div>

      <div className="analytics-grid">
        {[
          { label: 'Total Tasks', value: total, color: 'var(--primary)' },
          { label: 'Completed', value: completed, color: 'var(--success)' },
          { label: 'Active', value: active, color: 'var(--info)' },
          { label: 'Overdue', value: overdue, color: 'var(--danger)' },
        ].map((s, i) => (
          <div key={i} className="analytics-stat" style={{'--accent': s.color}}>
            <div className="analytics-stat-value" style={{color: s.color}}>{s.value}</div>
            <div className="analytics-stat-label">{s.label}</div>
            <div className="analytics-stat-bar">
              <div className="analytics-stat-fill" style={{width: `${total === 0 ? 0 : (s.value/total)*100}%`, background: s.color}} />
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-charts">
        <div className="analytics-chart-card">
          <h3>Completion Rate</h3>
          <div className="donut-wrap">
            <svg viewBox="0 0 120 120" className="donut-svg">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="12"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#grad)" strokeWidth="12"
                strokeDasharray={`${rate * 3.14} 314`}
                strokeDashoffset="78.5"
                strokeLinecap="round"
                style={{transition: 'stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)'}}
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="donut-label">
              <span className="donut-value">{rate}%</span>
              <span className="donut-sub">Complete</span>
            </div>
          </div>
          <div className="donut-legend">
            <span><i style={{background:'var(--primary)'}}/>Completed ({completed})</span>
            <span><i style={{background:'rgba(255,255,255,0.06)'}}/>Remaining ({active})</span>
          </div>
        </div>

        <div className="analytics-chart-card">
          <h3>By Priority</h3>
          <div className="bar-chart">
            {[
              { label: 'High', value: byPriority.high, color: 'var(--danger)' },
              { label: 'Medium', value: byPriority.medium, color: 'var(--warning)' },
              { label: 'Low', value: byPriority.low, color: 'var(--success)' },
            ].map((b, i) => (
              <div key={i} className="bar-row">
                <span className="bar-label">{b.label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{width: `${(b.value/maxPriority)*100}%`, background: b.color}} />
                </div>
                <span className="bar-value">{b.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-chart-card">
          <h3>By Status</h3>
          <div className="bar-chart">
            {[
              { label: 'To Do', value: byStatus.todo, color: 'var(--info)' },
              { label: 'In Progress', value: byStatus.inprogress, color: 'var(--warning)' },
              { label: 'Done', value: byStatus.done, color: 'var(--success)' },
            ].map((b, i) => (
              <div key={i} className="bar-row">
                <span className="bar-label">{b.label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{width: `${(b.value/maxStatus)*100}%`, background: b.color}} />
                </div>
                <span className="bar-value">{b.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-chart-card analytics-tip">
          <h3>Productivity Score</h3>
          <div className="score-wrap">
            <div className="score-ring" style={{'--pct': rate}}>
              <span>{rate >= 80 ? '🔥' : rate >= 50 ? '⚡' : '🌱'}</span>
            </div>
            <div className="score-text">
              <strong>{rate >= 80 ? 'Excellent' : rate >= 50 ? 'On Track' : 'Getting Started'}</strong>
              <p>{rate >= 80 ? 'You\'re crushing it. Keep the momentum.' : rate >= 50 ? 'Good progress. Push for 80%+.' : 'Add more tasks and start completing them.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
