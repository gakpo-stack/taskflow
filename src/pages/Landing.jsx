import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      title: 'Kanban Board',
      desc: 'Visualize your workflow with drag-and-drop columns. Move tasks from To Do to Done effortlessly.',
      preview: (
        <div className="feature-preview kanban-preview">
          {['To Do', 'In Progress', 'Done'].map((col, i) => (
            <div key={i} className="preview-column">
              <div className="preview-col-header">{col}</div>
              {[1, 2].map(j => (
                <div key={j} className={`preview-card ${i === 0 ? 'high' : i === 1 ? 'medium' : 'low'}`}>
                  <div className="preview-card-bar" />
                  <div className="preview-card-line" />
                  <div className="preview-card-line short" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Priority Tracking',
      desc: 'Color-coded priority levels keep your most critical tasks front and center at all times.',
      preview: (
        <div className="feature-preview list-preview">
          {[
            { label: 'High', color: '#ef4444', width: '90%' },
            { label: 'Medium', color: '#f59e0b', width: '65%' },
            { label: 'Low', color: '#22c55e', width: '40%' },
          ].map((item, i) => (
            <div key={i} className="preview-list-item">
              <div className="preview-dot" style={{ background: item.color }} />
              <div className="preview-list-content">
                <div className="preview-card-line" style={{ width: item.width }} />
                <div className="preview-progress-bar">
                  <div className="preview-progress-fill" style={{ width: item.width, background: item.color }} />
                </div>
              </div>
              <div className="preview-badge" style={{ background: item.color + '22', color: item.color }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: 'Progress Tracking',
      desc: 'Real-time progress bars and completion stats give you a bird\'s eye view of every project.',
      preview: (
        <div className="feature-preview progress-preview">
          <div className="preview-stat-row">
            {['12', '8', '4'].map((n, i) => (
              <div key={i} className="preview-stat">
                <div className="preview-stat-num">{n}</div>
                <div className="preview-stat-label">{['Total', 'Done', 'Active'][i]}</div>
              </div>
            ))}
          </div>
          <div className="preview-big-progress">
            <div className="preview-big-label">
              <span>Overall Progress</span><span>67%</span>
            </div>
            <div className="preview-big-bar">
              <div className="preview-big-fill" />
            </div>
          </div>
          {['Design', 'Development', 'Testing'].map((label, i) => (
            <div key={i} className="preview-mini-progress">
              <span>{label}</span>
              <div className="preview-mini-bar">
                <div className="preview-mini-fill" style={{ width: `${[80, 55, 30][i]}%` }} />
              </div>
            </div>
          ))}
        </div>
      )
    }
  ]

  return (
    <div className="landing">
      {/* NAV */}
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-logo">
          <div className="nav-logo-icon" />
          <span>TaskFlow</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn-primary" onClick={() => navigate('/login')}>Get Started Free</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob blob-1" />
          <div className="hero-blob blob-2" />
          <div className="hero-blob blob-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">Now with Kanban Board</div>
          <h1>The task manager your<br /><span className="gradient-text">team will actually use</span></h1>
          <p>TaskFlow brings together list view, Kanban board, priority tracking, and real-time sync in one beautiful workspace.</p>
          <div className="hero-actions">
            <button className="btn-primary btn-large" onClick={() => navigate('/login')}>
              Start for free
            </button>
            <button className="btn-ghost btn-large" onClick={() => navigate('/login')}>
              See how it works →
            </button>
          </div>
          <div className="hero-social-proof">
            <div className="avatar-stack">
              {['#4f46e5', '#7c3aed', '#db2777', '#059669', '#d97706'].map((c, i) => (
                <div key={i} className="avatar" style={{ background: c, zIndex: 5 - i }} />
              ))}
            </div>
            <span>Trusted by 2,000+ teams worldwide</span>
          </div>
        </div>
        <div className="hero-mockup">
          <div className="mockup-browser">
            <div className="mockup-bar">
              <span /><span /><span />
              <div className="mockup-url">taskflow.app/dashboard</div>
            </div>
            <div className="mockup-screen">
              <div className="mockup-navbar">
                <div className="mockup-logo" />
                <div className="mockup-nav-right">
                  <div className="mockup-avatar" />
                </div>
              </div>
              <div className="mockup-body">
                <div className="mockup-progress-bar">
                  <div className="mockup-progress-fill" />
                </div>
                <div className="mockup-columns">
                  {['To Do', 'In Progress', 'Done'].map((col, i) => (
                    <div key={i} className="mockup-column">
                      <div className="mockup-col-title">{col}</div>
                      {[1, 2, i < 2 ? 3 : null].filter(Boolean).map(j => (
                        <div key={j} className={`mockup-card mc-${['high', 'medium', 'low'][i]}`}>
                          <div className="mc-line" />
                          <div className="mc-line short" />
                          <div className={`mc-badge ${['high', 'medium', 'low'][i]}`} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <section className="logos-section">
        <p>Trusted by teams at</p>
        <div className="logos-row">
          {['Notion', 'Linear', 'Vercel', 'Stripe', 'Figma'].map((name, i) => (
            <div key={i} className="logo-pill">{name}</div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-label">Features</div>
        <h2>Everything you need to<br />ship projects faster</h2>
        <p className="section-sub">Built for modern teams who want clarity, speed, and zero friction.</p>
        <div className="features-tabs">
          <div className="features-tab-list">
            {features.map((f, i) => (
              <button key={i}
                className={`feature-tab ${activeFeature === i ? 'active' : ''}`}
                onClick={() => setActiveFeature(i)}>
                <div className="feature-tab-title">{f.title}</div>
                <div className="feature-tab-desc">{f.desc}</div>
              </button>
            ))}
          </div>
          <div className="features-tab-preview">
            {features[activeFeature].preview}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div className="section-label">How it works</div>
        <h2>Up and running in minutes</h2>
        <div className="steps">
          {[
            { num: '01', title: 'Create your account', desc: 'Sign up for free in seconds. No credit card required.' },
            { num: '02', title: 'Add your tasks', desc: 'Create tasks with priorities, due dates, and descriptions.' },
            { num: '03', title: 'Switch views', desc: 'Toggle between List and Kanban view based on your preference.' },
            { num: '04', title: 'Track progress', desc: 'Watch your progress bar fill up as you complete tasks.' },
          ].map((step, i) => (
            <div key={i} className="step">
              <div className="step-num">{step.num}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
              {i < 3 && <div className="step-connector" />}
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing-section" id="pricing">
        <div className="section-label">Pricing</div>
        <h2>Simple, transparent pricing</h2>
        <div className="pricing-cards">
          {[
            { name: 'Free', price: '$0', period: 'forever', features: ['Up to 20 tasks', 'List & Kanban view', 'Priority tracking', 'Due dates'], cta: 'Get started', highlight: false },
            { name: 'Pro', price: '$9', period: 'per month', features: ['Unlimited tasks', 'Everything in Free', 'Team collaboration', 'Analytics dashboard', 'Priority support'], cta: 'Start free trial', highlight: true },
          ].map((plan, i) => (
            <div key={i} className={`pricing-card ${plan.highlight ? 'pricing-highlight' : ''}`}>
              {plan.highlight && <div className="pricing-popular">Most Popular</div>}
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">
                {plan.price}<span>/{plan.period}</span>
              </div>
              <ul className="pricing-features">
                {plan.features.map((f, j) => (
                  <li key={j}><span className="check">✓</span>{f}</li>
                ))}
              </ul>
              <button
                className={plan.highlight ? 'btn-primary' : 'btn-outline'}
                onClick={() => navigate('/login')}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="cta-blob" />
        <h2>Start shipping faster today</h2>
        <p>Join thousands of teams who use TaskFlow to stay organized and deliver on time.</p>
        <button className="btn-primary btn-large" onClick={() => navigate('/login')}>
          Get started for free →
        </button>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <div className="nav-logo-icon" />
          <span>TaskFlow</span>
        </div>
        <p>© 2025 TaskFlow. Built with React + Supabase. All rights reserved.</p>
      </footer>
    </div>
  )
}
