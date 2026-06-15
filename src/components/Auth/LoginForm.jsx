import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit() {
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      error ? setMessage(error.message) : setMessage('Check your email to confirm!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    }
  }

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)} />
      <button onClick={handleSubmit}>{isSignUp ? 'Sign Up' : 'Sign In'}</button>
      <p onClick={() => setIsSignUp(!isSignUp)} className="toggle">
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </p>
      {message && <p className="message">{message}</p>}
    </div>
  )
}
