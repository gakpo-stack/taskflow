import { supabase } from '../../lib/supabaseClient'

export default function Navbar({ email }) {
  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  return (
    <nav className="navbar">
      <h1 className="logo">TaskFlow</h1>
      <div className="nav-right">
        <span className="nav-email">{email}</span>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </nav>
  )
}
