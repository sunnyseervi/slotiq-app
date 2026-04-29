import React, { useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'

// Main
import HomePage          from './pages/home/HomePage'
import ListingDetailPage from './pages/ListingDetailPage'
import BookingFlowPage   from './pages/BookingFlowPage'
import BookingsPage      from './pages/BookingsPage'
import ProfilePage       from './pages/ProfilePage'
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
  const { isLoggedIn, isLoading } = useStore()
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-navy text-white">Loading...</div>
  if (!isLoggedIn) return <Navigate to="/profile" replace />
  return children
}

function RequireAdmin({ children }) {
  const { isAdmin, isLoggedIn, isLoading } = useStore()
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-navy text-white">Loading...</div>
  if (!isLoggedIn || !isAdmin) return <AdminLoginPage />
  return children
}

export default function App() {
  const { initAuth, fetchListings } = useStore()

  useEffect(() => {
    initAuth()
    fetchListings()
  }, [initAuth, fetchListings])

  return (
    <HashRouter>
      <Routes>
        {/* Public/Customer Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/listing/:id"  element={<ListingDetailPage />} />
        <Route path="/discover/:category" element={<DiscoverCategoryPage />} />
        
        {/* Protected Customer Routes */}
        <Route path="/book/:id"     element={<RequireAuth><BookingFlowPage /></RequireAuth>} />
        <Route path="/bookings"     element={<RequireAuth><BookingsPage /></RequireAuth>} />
        <Route path="/profile"      element={<ProfilePage />} />
        <Route path="/helpdesk"     element={<HelpDeskPage />} />
        <Route path="/saved"        element={<RequireAuth><SavedSpotsPage /></RequireAuth>} />

        {/* Host Routes (Simplified for MVP, usually role based) */}
        <Route path="/host/dashboard" element={<RequireAuth><HostDashboardPage /></RequireAuth>} />
        <Route path="/host/listings"  element={<RequireAuth><MyListingsPage /></RequireAuth>} />
        <Route path="/host/listing/new" element={<RequireAuth><AddListingPage /></RequireAuth>} />
        <Route path="/host/listing/edit/:id" element={<RequireAuth><EditListingPage /></RequireAuth>} />
        <Route path="/host/scan"      element={<RequireAuth><HostScanPage /></RequireAuth>} />

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
    </HashRouter>
  )
}
