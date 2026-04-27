import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    if (phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number")
      return
    }
    setLoading(true)
    
    // SUPABASE SMS AUTH
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`
    })

    setLoading(false)
    if (error) {
      alert("Real OTP Error: " + error.message + "\n\nNote: You must configure MSG91 in Supabase -> Auth -> Providers -> Phone to use SMS OTP.")
    } else {
      navigate('/auth/otp', { state: { phone } })
    }
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
            Welcome Back
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Login with your mobile number
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">+91</span>
                <input 
                  type="tel" required maxLength={10}
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,''))}
                  className="w-full pl-14 pr-4 py-4 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl outline-none font-bold text-base focus:border-primary transition-all dark:text-white"
                  placeholder="92575 90511"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading || phone.length < 10}
              className="w-full bg-[#25D366] text-white rounded-2xl py-4 text-base font-black hover:opacity-90 active:scale-[0.98] transition-all shadow-xl shadow-green-100 dark:shadow-none disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
            >
              {loading ? (
                'Connecting...'
              ) : (
                <>
                  <span className="text-xl">📱</span>
                  Get OTP via SMS
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-xs text-gray-400 mt-10 text-center px-6 leading-relaxed">
          By continuing, you agree to SlotIQ's <br />
          <span className="text-gray-600 dark:text-gray-300 font-bold cursor-pointer hover:underline">Terms of Service</span> &amp; <span className="text-gray-600 dark:text-gray-300 font-bold cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}
