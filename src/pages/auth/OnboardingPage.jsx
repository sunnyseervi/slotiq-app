import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { LOCATIONS, VEHICLE_TYPES } from '../../lib/mockData'

export default function OnboardingPage() {
  const [step,    setStep]    = useState(1)
  const [name,    setName]    = useState('')
  const [plate,   setPlate]   = useState('')
  const [vType,   setVType]   = useState('car')
  const [nick,    setNick]    = useState('')
  const [city,    setCity]    = useState('Bengaluru')
  const [area,    setArea]    = useState('Koramangala')
  const { updateUserField, setLocation, currentUser } = useStore()
  const navigate = useNavigate()

  async function finish() {
    if (!currentUser?.id) return

    const profileData = {
      id: currentUser.id,
      full_name: name,
      city: city,
      area: area,
      email: currentUser.email,
      role: 'customer'
    }

    // Save to Supabase
    const { error } = await supabase.from('users').upsert([profileData])
    
    if (error) {
      console.error('Error saving profile:', error.message)
    }

    if (name) updateUserField('name', name)
    setLocation(city, area)
    
    // Add vehicle if plate is provided
    if (plate) {
      await supabase.from('vehicles').insert([{
        user_id: currentUser.id,
        type: vType,
        plate_number: plate,
        nickname: nick || name + "'s Vehicle"
      }])
    }

    navigate('/', { replace: true })
  }

  return (
    <div className="app-shell">
      <div className="screen-content bg-white dark:bg-gray-900 px-6 py-8">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className={`step-dot${step === s ? ' active' : step > s ? ' done' : ''}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fadeIn">
            <div className="text-4xl mb-4">👤</div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">What's your name?</h1>
            <p className="text-sm text-muted mb-6">We'll personalize your experience</p>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-4 py-3 text-sm font-semibold outline-none focus:border-primary transition-colors mb-6 dark:bg-gray-800 dark:text-white"
            />
            <button onClick={() => setStep(2)} disabled={!name.trim()} className="btn-primary">Continue →</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeIn">
            <div className="text-4xl mb-4">🚗</div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Add your vehicle</h1>
            <p className="text-sm text-muted mb-6">For faster booking and Scan & Park</p>

            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
              {VEHICLE_TYPES.slice(0,3).map(vt => (
                <button key={vt.value} onClick={() => setVType(vt.value)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 border-2 rounded-card text-xs font-bold transition-all min-w-[64px] ${vType === vt.value ? 'border-primary bg-orange-50 dark:bg-orange-950 text-primary' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}>
                  <span className="text-2xl">{vt.emoji}</span>{vt.label.split(' ')[0]}
                </button>
              ))}
            </div>

            <input value={plate} onChange={e => setPlate(e.target.value.toUpperCase())}
              placeholder="KA 05 MN 7890"
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-4 py-3 text-sm font-bold uppercase tracking-widest outline-none focus:border-primary mb-3 dark:bg-gray-800 dark:text-white transition-colors"
            />
            <input value={nick} onChange={e => setNick(e.target.value)}
              placeholder="Nickname (e.g. My Swift)"
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-card px-4 py-3 text-sm font-semibold outline-none focus:border-primary mb-6 dark:bg-gray-800 dark:text-white transition-colors"
            />
            <button onClick={() => setStep(3)} className="btn-primary mb-3">Continue →</button>
            <button onClick={() => setStep(3)} className="text-sm text-muted text-center w-full">Skip for now</button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeIn">
            <div className="text-4xl mb-4">📍</div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Choose your area</h1>
            <p className="text-sm text-muted mb-4">We'll show listings near you</p>

            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
              {LOCATIONS.cities.map(c => (
                <button key={c} onClick={() => setCity(c)}
                  className={`flex-shrink-0 px-4 py-2 rounded-pill text-sm font-bold border-2 transition-all ${city === c ? 'bg-primary border-primary text-white' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {(LOCATIONS.areas[city]||[]).map(a => (
                <button key={a} onClick={() => setArea(a)}
                  className={`flex items-center gap-1 p-3 border-2 rounded-card text-sm font-bold text-left transition-all ${area === a ? 'border-primary bg-orange-50 dark:bg-orange-950 text-primary' : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200'}`}>
                  <span className="text-primary text-xs">📍</span>{a}
                </button>
              ))}
            </div>

            <button onClick={finish} className="btn-primary mb-3">Get Started! 🎉</button>
            <button onClick={finish} className="text-sm text-muted text-center w-full">Skip for now</button>
          </div>
        )}
      </div>
    </div>
  )
}
