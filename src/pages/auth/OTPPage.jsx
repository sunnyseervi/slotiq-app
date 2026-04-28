import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabase'

export default function OTPPage() {
  const [otp,     setOtp]     = useState(['','','','','',''])
  const [err,     setErr]     = useState('')
  const [loading, setLoading] = useState(false)
  const [timer,   setTimer]   = useState(30)
  const navigate  = useNavigate()
  const location  = useLocation()
  const login     = useStore(s => s.login)
  const refs      = Array.from({ length: 6 }, () => useRef(null))

  const phone = location.state?.phone || '9999999999'

  useEffect(() => {
    refs[0].current?.focus()
    const id = setInterval(() => setTimer(t => t > 0 ? t - 1 : 0), 1000)
    return () => clearInterval(id)
  }, [])

  function handleKey(i, e) {
    const v = e.target.value.replace(/\D/,'')
    if (!v && e.nativeEvent.inputType === 'deleteContentBackward') {
      const next = [...otp]; next[i] = ''; setOtp(next)
      if (i > 0) refs[i-1].current?.focus()
      return
    }
    if (!v) return
    const next = [...otp]; next[i] = v; setOtp(next)
    if (i < 5) refs[i+1].current?.focus()
    else verify([...next].join(''))
  }

  async function verify(code) {
    const val = code || otp.join('')
    if (val.length < 6) { setErr('Enter all 6 digits'); return }
    setLoading(true)
    setErr('')
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: val,
      type: 'sms' // Supabase uses 'sms' type even for WhatsApp channel verification
    })

    if (error) {
      setErr(error.message)
      setLoading(false)
    } else {
      const userProfile = await useStore.getState().checkAuth()
      
      if (userProfile?.role === 'host') {
        navigate('/host/dashboard', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }

  return (
    <div className="app-shell">
      <div className="screen-content flex flex-col items-center justify-center px-6 bg-white dark:bg-gray-900">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="self-start mb-6 text-gray-500 flex items-center gap-1 text-sm font-semibold">
          ← Back
        </button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📱</div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Enter OTP</h1>
          <p className="text-sm text-muted">
            Sent via SMS to <span className="font-bold text-gray-700 dark:text-gray-200">+91 {phone}</span>
          </p>
        </div>

        {/* OTP boxes */}
        <div className="flex gap-3 mb-6">
          {otp.map((v, i) => (
            <input
              key={i}
              ref={refs[i]}
              className="otp-input dark:bg-gray-800 dark:text-white dark:border-gray-600"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={v}
              onChange={e => handleKey(i, e)}
            />
          ))}
        </div>

        {err && <p className="text-danger text-sm font-semibold mb-4">⚠️ {err}</p>}

        <button
          onClick={() => verify()}
          disabled={loading || otp.join('').length < 6}
          className="btn-primary mb-4 w-full max-w-xs"
        >
          {loading ? <span className="animate-spin inline-block">⏳</span> : 'Verify & Continue →'}
        </button>

        <button
          disabled={timer > 0}
          onClick={() => setTimer(30)}
          className={`text-sm font-bold ${timer > 0 ? 'text-gray-400' : 'text-primary'}`}
        >
          {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
        </button>

        <div className="mt-6 p-3 bg-orange-50 dark:bg-orange-950 rounded-xl text-xs text-orange-700 dark:text-orange-300 font-semibold text-center">
          🔑 Dev: OTP is always <strong>123456</strong>
        </div>
      </div>
    </div>
  )
}
