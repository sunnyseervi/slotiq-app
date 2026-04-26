import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  MapPin, 
  CalendarCheck, 
  Settings, 
  LogOut, 
  Plus,
  Users,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import '../../styles/admin.css'

export default function AdminLayout() {
  const navigate = useNavigate()
  const { darkMode, toggleDarkMode } = useStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className={`admin-body ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="admin-mobile-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', backgroundColor: 'var(--accent)', 
            borderRadius: '10px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontWeight: '900', color: 'var(--primary)' 
          }}>IQ</div>
          <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Slot<span style={{ color: 'var(--accent)' }}>IQ</span> Admin
          </span>
          <button 
            className="admin-mobile-close"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/admin" end onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/listings" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <MapPin size={20} /> Manage Places
          </NavLink>
          <NavLink to="/admin/users" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} /> Users
          </NavLink>
          <NavLink to="/admin/bookings" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <CalendarCheck size={20} /> Bookings
          </NavLink>
          <NavLink to="/admin/settings" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={20} /> Global Settings
          </NavLink>
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button className="admin-nav-item" onClick={() => navigate('/')} style={{ width: '100%', border: 'none', background: 'none' }}>
            <LogOut size={20} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="flex items-center gap-4">
            <button 
              className="admin-mobile-toggle"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="font-heading" style={{ fontSize: '18px', fontWeight: '700' }}>Executive Overview</h2>
              <p className="text-muted" style={{ fontSize: '13px' }}>Welcome back, Administrator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 admin-header-actions">
            <button onClick={toggleDarkMode} className="admin-btn admin-btn-outline" style={{ padding: '8px' }}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="admin-btn admin-btn-outline" onClick={() => window.alert('Exporting data...')}>
              Reports
            </button>
            <button className="admin-btn admin-btn-primary" onClick={() => navigate('/admin/listings')}>
              <Plus size={18} /> <span className="hide-mobile">Inventory</span>
            </button>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
