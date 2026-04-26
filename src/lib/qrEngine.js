// ============================================================
//  SlotIQ QR Engine
//  Two QR types only:
//    TYPE A — LOCATION (static, placed at parking spot/gate)
//    TYPE B — BOOKING  (dynamic, shown in customer app)
// ============================================================

// ── Generate QR payloads ──────────────────────────────────────

export function makeLocationQR({ location_id, spot_id = null }) {
  return JSON.stringify({ type: 'LOCATION', location_id, spot_id })
}

export function makeBookingQR({ booking_id, user_id, expiry_time }) {
  return JSON.stringify({ type: 'BOOKING', booking_id, user_id, expiry_time })
}

// ── Parse & validate scanned QR string ───────────────────────

export function parseQR(raw) {
  try {
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!data?.type) return { valid: false, error: 'Missing QR type' }
    if (data.type === 'LOCATION') {
      if (!data.location_id) return { valid: false, error: 'Missing location_id' }
      return { valid: true, type: 'LOCATION', data }
    }
    if (data.type === 'BOOKING') {
      if (!data.booking_id || !data.user_id) return { valid: false, error: 'Missing booking fields' }
      // Check expiry
      if (data.expiry_time && new Date(data.expiry_time) < new Date()) {
        return { valid: false, error: 'Booking QR has expired' }
      }
      return { valid: true, type: 'BOOKING', data }
    }
    return { valid: false, error: 'Unknown QR type' }
  } catch {
    return { valid: false, error: 'Invalid QR format' }
  }
}

// ── Core scan handler logic (pure function, no side effects) ──
// Returns an action descriptor that the UI layer executes.
//
// Returns one of:
//   { action: 'START_WALKIN',  locationId, spotId }
//   { action: 'ACTIVATE_PREBOOK', locationId, spotId, bookingId }
//   { action: 'END_SESSION',   locationId }
//   { action: 'HOST_START',    bookingId, userId }
//   { action: 'ERROR',         message }

export function handleLocationScan({ qr, hasActiveSession, upcomingBookings = [] }) {
  const result = parseQR(qr)
  if (!result.valid) return { action: 'ERROR', message: result.error }
  if (result.type !== 'LOCATION') return { action: 'ERROR', message: 'Please scan a Parking Location QR' }

  const { location_id, spot_id } = result.data
  if (hasActiveSession) {
    return { action: 'END_SESSION', locationId: location_id, spotId: spot_id }
  }

  // Pre-Book Self Serve Flow
  const prebook = upcomingBookings.find(b => b.location_id === location_id || !b.location_id)
  if (prebook) {
    return { action: 'ACTIVATE_PREBOOK', locationId: location_id, spotId: spot_id, bookingId: prebook.id }
  }

  return { action: 'START_WALKIN', locationId: location_id, spotId: spot_id }
}

export function handleBookingQRScan({ qr, bookings }) {
  const result = parseQR(qr)
  if (!result.valid) return { action: 'ERROR', message: result.error }
  if (result.type !== 'BOOKING') return { action: 'ERROR', message: 'Host must scan a Customer Booking QR' }

  const { booking_id, user_id } = result.data
  const booking = bookings.find(b => b.id === booking_id)
  if (!booking) return { action: 'ERROR', message: 'Booking not found in system' }
  if (booking.status === 'active') return { action: 'ERROR', message: 'Session already active' }
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return { action: 'ERROR', message: `Booking is already ${booking.status}` }
  }
  return { action: 'HOST_START', bookingId: booking_id, userId: user_id, booking }
}
