import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../store/useStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useStore(s => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  async function handleAuth(e) {
    e.preventDefault()
    setLoading(true)
    
    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'New User'
          }
        }
      })
    } else {
      result = await supabase.auth.signInWithPassword({
        email,
        password
      })
    }

    const { data, error } = result

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    if (isSignUp && !data.session) {
      alert("Verification email sent! Please check your inbox.")
      setLoading(false)
      return
    }

    if (data.user) {
      // Fetch profile data
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      login({
        id: data.user.id,
        name: profile?.full_name || 'User',
        email: data.user.email,
        phone: profile?.phone || '',
        mode: profile?.role || 'customer',
        role: profile?.role || 'customer'
      })

      if (!profile) {
        navigate('/auth/onboarding', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
    setLoading(false)
  }

  return (
    <div className="app-shell flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-6">
      <div className="w-full max-w-sm mb-10">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-200 dark:shadow-none mb-6 mx-auto transform -rotate-6">
            <span className="text-4xl font-black text-white">IQ</span>
          </div>
          <div>
            <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Slot</span>
            <span className="text-4xl font-black text-primary tracking-tight">IQ</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 font-medium">
            Smart City Solutions · Bengaluru
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[32px] border border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {isSignUp ? 'Join SlotIQ today' : 'Login to your account'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Email Address</label>
              <input 
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl outline-none font-bold text-sm focus:border-primary transition-all dark:text-white"
                placeholder="sunny@example.com"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Password</label>
              <input 
                type="password" required minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl outline-none font-bold text-sm focus:border-primary transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-primary text-white rounded-2xl py-4 text-base font-black hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-orange-100 dark:shadow-none disabled:opacity-50 mt-4"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-6 text-sm font-bold text-primary hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-gray-400 bg-white dark:bg-gray-900 px-4">OR</div>
          </div>

          <button 
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({ 
                provider: 'google',
                options: {
                  redirectTo: window.location.origin
                }
              })
              if (error) alert(error.message)
            }}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl py-4 text-sm font-bold text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg shadow-gray-100 dark:shadow-none active:scale-[0.98]"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-10 text-center px-6 leading-relaxed">
          By continuing, you agree to SlotIQ's <br />
          <span className="text-gray-600 dark:text-gray-300 font-bold cursor-pointer hover:underline">Terms of Service</span> &amp; <span className="text-gray-600 dark:text-gray-300 font-bold cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
