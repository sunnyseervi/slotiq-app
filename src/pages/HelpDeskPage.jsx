import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/layout/TopBar'
import BottomNav from '../components/layout/BottomNav'
import LocationModal from '../components/modals/LocationModal'
import { useStore } from '../store/useStore'
import { sendToAI } from '../lib/aiClient'

const WELCOME = (name) => `Hi ${name}! 👋 I'm SlotIQ Assistant. I can help you with:
- 🅿️ Finding and booking parking
- 🏟️ Booking sports venues
- 📋 Managing your bookings
- 🏠 Host & listing questions
- 💳 Payments & refunds

What can I help you with today?`

const QUICK_CHIPS = [
  { label: '🅿️ Find Parking',    msg: 'How do I book parking?' },
  { label: '⚽ Book a Sport',     msg: 'What sports venues are available?' },
  { label: '📋 My Bookings',      msg: 'How do I view my bookings?' },
  { label: '🏠 Become a Host',   msg: 'How do I list my parking space?' },
  { label: '💰 Refund Help',     msg: 'What is the refund policy?' },
  { label: '👨‍💼 Talk to Human',   msg: 'I want to talk to a human agent' },
]

function formatMd(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function HelpDeskPage() {
  const navigate = useNavigate()
  const { currentUser } = useStore()
  const [showLoc, setShowLoc] = useState(false)
  const [messages, setMessages] = useState([
    { role:'assistant', content: WELCOME(currentUser?.name?.split(' ')[0] || 'there'), ts: new Date() }
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role:'user', content:msg, ts:new Date() }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)

    // Streaming placeholder
    const botMsg = { role:'assistant', content:'', ts:new Date() }
    setMessages([...history, botMsg])

    await sendToAI(
      history.map(m => ({ role:m.role, content:m.content })),
      (partial) => {
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { ...botMsg, content: partial }
          return next
        })
      }
    )
    setLoading(false)
  }

  function fmt(ts) {
    if (!ts) return ''
    const d = ts instanceof Date ? ts : new Date(ts)
    return d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
  }

  return (
    <div className="app-shell">
      <div className="screen-content flex flex-col">
        {/* Header */}
        <div className="top-bar flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 font-bold">←</button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-extrabold">🤖</div>
            <div>
              <div className="font-extrabold text-gray-900 dark:text-white text-sm">Help &amp; Support</div>
              <div className="text-xs text-hgreen font-bold">AI Powered · Online</div>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-appbg dark:bg-gray-900">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-xs text-white font-extrabold flex-shrink-0 mt-0.5">🤖</div>
              )}
              <div className="max-w-[78%]">
                <div className={m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}
                  dangerouslySetInnerHTML={{ __html: m.content ? formatMd(m.content) : (m.role==='assistant' && loading && i===messages.length-1 ? '<span>…</span>' : '') }}>
                </div>
                <div className={`text-[10px] text-gray-400 mt-1 ${m.role==='user' ? 'text-right' : ''}`}>{fmt(m.ts)}</div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-xs text-white flex-shrink-0 mt-0.5">🤖</div>
              <div className="chat-bubble-bot flex items-center gap-1.5 py-3">
                <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
              </div>
            </div>
          )}

          {/* Quick chips (show at bottom after welcome) */}
          {messages.length <= 2 && !loading && (
            <div className="flex flex-wrap gap-2 pt-2">
              {QUICK_CHIPS.map(c => (
                <button key={c.label} onClick={() => send(c.msg)}
                  className="flex-shrink-0 px-3 py-2 rounded-pill bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm active:scale-95 transition-transform">
                  {c.label}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-3 py-2.5 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-pill px-4 py-2.5">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm font-semibold text-gray-800 dark:text-white placeholder-gray-400"
            />
          </div>
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-lg disabled:opacity-40 transition-opacity"
          >
            ➤
          </button>
        </div>
      </div>

      <BottomNav />
      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
