import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { supabase } from './lib/supabase'

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

function RequireHost({ children }) {
  const { currentMode } = useStore(s => ({ currentMode: s.currentMode }))
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
    useStore.getState().checkAuth()
  }, [])

  return (
    <BrowserRouter basename="/slotiq-app">
      <Routes>
        {/* Protected Customer Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id"  element={<ListingDetailPage />} />
        <Route path="/book/:id"     element={<BookingFlowPage />} />
        <Route path="/bookings"     element={<BookingsPage />} />
        <Route path="/profile"      element={<ProfilePage />} />
        <Route path="/scan"         element={<ScanParkPage />} />
        <Route path="/helpdesk"     element={<HelpDeskPage />} />
        <Route path="/discover/:category" element={<DiscoverCategoryPage />} />
        <Route path="/saved"        element={<SavedSpotsPage />} />

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
