import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'

// Auth
import LoginPage           from './pages/auth/LoginPage'
import OTPPage             from './pages/auth/OTPPage'
import OnboardingPage      from './pages/auth/OnboardingPage'
import CompleteProfilePage from './pages/auth/CompleteProfilePage'

// Main
import HomePage          from './pages/home/HomePage'
import ListingDetailPage from './pages/ListingDetailPage'
import BookingFlowPage   from './pages/BookingFlowPage'
import BookingsPage      from './pages/BookingsPage'
import ProfilePage       from './pages/ProfilePage'
import ScanParkPage      from './pages/ScanParkPage'
import HelpDeskPage      from './pages/HelpDeskPage'
import DiscoverCategoryPage from './pages/DiscoverCategoryPage'
import SavedSpotsPage    from './pages/SavedSpotsPage'

// Host
import HostDashboardPage from './pages/host/DashboardPage'
import MyListingsPage    from './pages/host/MyListingsPage'
import AddListingPage    from './pages/host/AddListingPage'
import EditListingPage   from './pages/host/EditListingPage'
import HostScanPage      from './pages/host/HostScanPage'

// Admin
import AdminLayout            from './pages/admin/AdminLayout'
import AdminDashboard         from './pages/admin/AdminDashboard'
import AdminListingManagement from './pages/admin/AdminListingManagement'
import AdminBookingList       from './pages/admin/AdminBookingList'
import AdminGlobalSettings    from './pages/admin/AdminGlobalSettings'
import AdminUserManagement      from './pages/admin/AdminUserManagement'

import AdminLoginPage from './pages/admin/AdminLoginPage'

function RequireAuth({ children }) {
  const isLoggedIn = useStore(s => s.isLoggedIn)
  if (!isLoggedIn) return <Navigate to="/auth/login" replace />
  return children
}

function RequireHost({ children }) {
  const { isLoggedIn, currentMode } = useStore(s => ({ isLoggedIn: s.isLoggedIn, currentMode: s.currentMode }))
  if (!isLoggedIn) return <Navigate to="/auth/login" replace />
  if (currentMode !== 'host') return <Navigate to="/" replace />
  return children
}

function RequireAdmin({ children }) {
  const isAdminAuthenticated = useStore(s => s.isAdminAuthenticated)
  if (!isAdminAuthenticated) return <AdminLoginPage />
  return children
}

export default function App() {
  const login = useStore(s => s.login)

  React.useEffect(() => {
    useStore.getState().initStore()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/auth/login"            element={<LoginPage />} />
        <Route path="/auth/onboarding"       element={<OnboardingPage />} />
        <Route path="/auth/complete-profile" element={<CompleteProfilePage />} />

        {/* Protected Customer Routes */}
        <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/listing/:id"  element={<RequireAuth><ListingDetailPage /></RequireAuth>} />
        <Route path="/book/:id"     element={<RequireAuth><BookingFlowPage /></RequireAuth>} />
        <Route path="/bookings"     element={<RequireAuth><BookingsPage /></RequireAuth>} />
        <Route path="/profile"      element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/scan"         element={<RequireAuth><ScanParkPage /></RequireAuth>} />
        <Route path="/helpdesk"     element={<RequireAuth><HelpDeskPage /></RequireAuth>} />
        <Route path="/discover/:category" element={<RequireAuth><DiscoverCategoryPage /></RequireAuth>} />
        <Route path="/saved"        element={<RequireAuth><SavedSpotsPage /></RequireAuth>} />

        {/* Protected Host Routes */}
        <Route path="/host/dashboard" element={<RequireHost><HostDashboardPage /></RequireHost>} />
        <Route path="/host/listings"  element={<RequireHost><MyListingsPage /></RequireHost>} />
        <Route path="/host/listing/new" element={<RequireHost><AddListingPage /></RequireHost>} />
        <Route path="/host/listing/edit/:id" element={<RequireHost><EditListingPage /></RequireHost>} />
        <Route path="/host/scan"      element={<RequireHost><HostScanPage /></RequireHost>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="listings" element={<AdminListingManagement />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="bookings" element={<AdminBookingList />} />
          <Route path="settings" element={<AdminGlobalSettings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
