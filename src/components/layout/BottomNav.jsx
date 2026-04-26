import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../../store/useStore'

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)
const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const CUSTOMER_NAV = [
  { path: '/',         icon: HomeIcon,  label: 'Home' },
  { path: '/bookings', icon: BookIcon,  label: 'Bookings' },
  { path: '/profile',  icon: UserIcon,  label: 'Profile' },
]

const HOST_NAV = [
  { path: '/host/dashboard', icon: ChartIcon,  label: 'Dashboard' },
  { path: '/bookings',       icon: BookIcon,   label: 'Bookings' },
  { path: '/host/listings',  icon: GridIcon,   label: 'Listings' },
  { path: '/profile',        icon: UserIcon,   label: 'Profile' },
]

export default function BottomNav() {
  const navigate   = useNavigate()
  const { pathname } = useLocation()
  const currentMode = useStore(s => s.currentMode)

  const tabs = currentMode === 'host' ? HOST_NAV : CUSTOMER_NAV

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => {
        const active = pathname === tab.path
        return (
          <button
            key={tab.path}
            className={`nav-btn${active ? ' active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
