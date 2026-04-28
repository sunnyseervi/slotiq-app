import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { supabase } from '../../lib/supabase'

export default function OnboardingPage() {
  const { currentUser, setMode } = useStore()
  
  const [step, setStep] = useState(0) // 0: CTA, 1: Form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState(currentUser?.phone?.replace('+91', '') || '')
  const [role, setRole] = useState('')
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleComplete() {
    if (!name || !role || !phone) return
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      alert("Enter a valid 10-digit number. Only numbers allowed.")
      return
    }

    setLoading(true)
    
    // Save to Supabase
    const { error } = await supabase
      .from('users')
      .update({
        full_name: name,
        phone: `+91${cleanPhone}`,
        role: role,
        avatar_url: avatar,
        profile_completed: true
      })
      .eq('id', currentUser.id)

    setLoading(false)
    if (error) {
      if (error.code === '23505') alert("This phone number is already registered to another user.")
      else alert("Error saving profile: " + error.message)
      return
    }

    // Refresh auth state in store
    const updatedUser = await useStore.getState().checkAuth()
    
    if (updatedUser?.role === 'host') {
      window.location.href = '/host/dashboard'
    } else {
      window.location.href = '/'
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAvatar(reader.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="app-shell">
      <div className="screen-content bg-white dark:bg-gray-900 px-6 py-8 flex flex-col items-center justify-center min-h-screen">
        
        {step === 0 && (
          <div className="animate-fadeIn text-center max-w-sm w-full">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✨
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome to SlotIQ!</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Let's get your profile set up so you can start parking or hosting right away.
            </p>
            <button 
              onClick={() => setStep(1)} 
              className="btn-primary w-full shadow-xl shadow-primary/20"
            >
              Setup Profile
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fadeIn w-full max-w-sm flex flex-col h-full justify-center">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 text-center">Complete Profile</h1>
            <p className="text-sm text-muted mb-8 text-center">We need a few details to identify you</p>
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  id="avatarUpload" 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
                <label 
                  htmlFor="avatarUpload" 
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform"
                >
                  📷
                </label>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5 flex-1">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111111] dark:text-white rounded-xl px-4 py-3 font-semibold outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Mobile Number *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full pl-14 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111111] dark:text-white rounded-xl font-semibold outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">I want to...</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setRole('customer')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'customer' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111111]'}`}
                  >
                    <div className="text-2xl mb-1">🚗</div>
                    <div className={`font-bold text-sm ${role === 'customer' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>Find Parking</div>
                  </button>
                  <button 
                    onClick={() => setRole('host')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${role === 'host' ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111111]'}`}
                  >
                    <div className="text-2xl mb-1">🏠</div>
                    <div className={`font-bold text-sm ${role === 'host' ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>Host a Space</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={handleComplete} 
                disabled={!name.trim() || !role || phone.length < 10 || loading} 
                className="btn-primary w-full"
              >
                {loading ? 'Saving...' : 'Finish Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
