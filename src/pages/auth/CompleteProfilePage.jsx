import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore'

const PHONE_RE = /^\d{10}$/

export default function CompleteProfilePage() {
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const updateUserField = useStore(s => s.updateUserField)
  const returnTo = location.state?.returnTo || '/'

  // In real implementation, the user is already authenticated via Supabase OAuth
  // here, and we just need to update their profile row with the phone number.

  function handleComplete() {
    const clean = phone.replace(/\s/g, '')
    if (!PHONE_RE.test(clean)) { 
      setErr('Enter a valid 10-digit number')
      return 
    }
    setErr('')
    
    // Simulate updating Supabase profile
    updateUserField('phone', clean)
    
    // Redirect to wherever they came from
    navigate(returnTo)
  }

  return (
    <div className="app-shell flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
      <div className="w-full max-w-sm">
        <div className="card p-6 dark:bg-gray-800 shadow-card">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
            Almost there!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Please provide your mobile number to complete your registration. This is required for booking spots.
          </p>

          <div className="flex items-center gap-2 border-2 border-gray-200 dark:border-gray-600 rounded-card px-3 py-3 mb-3 focus-within:border-primary bg-white dark:bg-gray-700 transition-colors">
            <div className="flex items-center gap-1 pr-2 border-r border-gray-200 dark:border-gray-600">
              <span>🇮🇳</span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300">+91</span>
            </div>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleComplete()}
              placeholder="10-digit number"
              className="flex-1 outline-none text-sm font-semibold text-gray-800 dark:text-white bg-transparent placeholder-gray-400"
            />
          </div>

          {err && <p className="text-danger text-xs font-semibold mb-4">⚠️ {err}</p>}

          <button onClick={handleComplete} className="btn-primary w-full shadow-sm">
            Complete Registration
          </button>
        </div>
      </div>
    </div>
  )
}
