import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, PhoneCall } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import LocationModal from '../components/modals/LocationModal'
import { useStore } from '../store/useStore'
import { MOCK_LISTINGS, MOCK_PARKING_PRICING, MOCK_SPORTS_PRICING, MOCK_REVIEWS, AMENITY_ICONS, formatInr } from '../lib/mockData'

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { listings: storeListings, savedSpots, toggleSavedSpot, ads } = useStore()
  const [showLoc, setShowLoc] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [myReview, setMyReview] = useState('')

  const listing = storeListings.find(l => l.id === id) || MOCK_LISTINGS.find(l => l.id === id)
  const isSaved = savedSpots.includes(id)
  if (!listing) return (
    <div className="app-shell">
      <div className="screen-content flex items-center justify-center">
        <div className="text-center text-gray-400 p-8">
          <div className="text-5xl mb-3">😕</div>
          <div className="font-bold">Listing not found</div>
          <button onClick={() => navigate('/')} className="mt-4 btn-primary max-w-xs">Go Home</button>
        </div>
      </div>
    </div>
  )

  const isParking = listing.type === 'parking'
  const parkingPrices = MOCK_PARKING_PRICING.filter(p => p.listing_id === listing.id)
  const sportsPricing = MOCK_SPORTS_PRICING.find(p => p.listing_id === listing.id)
  const reviews = MOCK_REVIEWS.filter(r => r.listing_id === listing.id)
  const displayReviews = reviews.length > 0 ? reviews : MOCK_REVIEWS

  const photoBg = isParking
    ? 'linear-gradient(160deg,#2c3e50,#3498db)'
    : 'linear-gradient(160deg,#1a3c34,#2d7a3a)'

  const bikePr  = parkingPrices.find(p => p.vehicle_type === 'bike')
  const carPr   = parkingPrices.find(p => p.vehicle_type === 'car')
  const suvPr   = parkingPrices.find(p => p.vehicle_type === 'suv')
  const truckPr = parkingPrices.find(p => p.vehicle_type === 'truck')
  const busPr   = parkingPrices.find(p => p.vehicle_type === 'bus')

  return (
    <div className="app-shell">
      <div className="screen-content">
        <TopBar onLocationClick={() => setShowLoc(true)} />

        {/* Hero Photo */}
        <div className="relative h-64 flex flex-col items-center justify-center" style={{ background: photoBg }}>
          <div className="absolute inset-0 bg-black/20" />
          <span className="text-9xl drop-shadow-2xl relative z-10 transform hover:scale-110 transition-transform duration-500">{listing.thumbnail_emoji}</span>

          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl font-bold transition-all z-20"
          >
            ←
          </button>

          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <div className="bg-black/40 backdrop-blur-sm text-white/90 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
              {listing.sub_type || listing.subType || 'Place'}
            </div>
            <button
              onClick={() => toggleSavedSpot(id)}
              className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            >
              <span className={`text-lg leading-none ${isSaved ? 'text-danger' : 'text-gray-300'}`}>
                {isSaved ? '❤️' : '🤍'}
              </span>
            </button>
          </div>

          <div className="absolute bottom-3 right-3 bg-hgreen text-white text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <div className="w-2 h-2 bg-white/80 rounded-full" />
            {listing.available_slots || listing.total_slots || 0} slots available
          </div>
        </div>

        {/* Body */}
        <div className="bg-white dark:bg-gray-800 p-4">
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">{listing.name}</h1>
          <p className="text-sm text-muted mb-3 flex items-center gap-1">📍 {listing.address}</p>

          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
              ⭐ {listing.rating || '4.8'}
              <span className="text-gray-400 font-semibold ml-1">({listing.review_count || '12'})</span>
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-muted">{listing.distance_km || '0.8'}km away</span>
            <span className="bg-green-100 dark:bg-green-950 text-hgreen text-xs font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              🕐 {listing.open_hours || listing.openHours || '24/7'} Open
            </span>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {isParking ? (
              <>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div className="text-xs text-muted mb-1">Hourly (Bike)</div>
                  <div className="text-sm font-extrabold text-danger">
                    ₹{bikePr ? `${bikePr.hourly_min}–${bikePr.hourly_max}` : '15–20'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div className="text-xs text-muted mb-1">Hourly (Car)</div>
                  <div className="text-sm font-extrabold text-danger">
                    ₹{carPr ? `${carPr.hourly_min}–${carPr.hourly_max}` : '30–60'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div className="text-xs text-muted mb-1">Daily Pass</div>
                  <div className="text-sm font-extrabold text-danger">
                    ₹{carPr ? `${carPr.daily_min}–${carPr.daily_max}` : '65–300'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div className="text-xs text-muted mb-1">Monthly Pass</div>
                  <div className="text-sm font-extrabold text-danger">
                    ₹{carPr ? `${(carPr.monthly_min/1000).toFixed(0)}K–${(carPr.monthly_max/1000).toFixed(0)}K` : '800–5K'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div className="text-xs text-muted mb-1">Base Rate</div>
                  <div className="text-sm font-extrabold text-danger">
                    ₹{sportsPricing ? sportsPricing.base_price_per_hour.toLocaleString('en-IN') : '500'}/hr
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div className="text-xs text-muted mb-1">Peak Rate</div>
                  <div className="text-sm font-extrabold text-danger">
                    ₹{sportsPricing ? sportsPricing.peak_price_per_hour.toLocaleString('en-IN') : '700'}/hr
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div className="text-xs text-muted mb-1">Peak Hours</div>
                  <div className="text-sm font-extrabold text-gray-800 dark:text-white">
                    {sportsPricing ? `${sportsPricing.peak_start_hour}:00–${sportsPricing.peak_end_hour}:00` : '6PM–10PM'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div className="text-xs text-muted mb-1">Weekend Surge</div>
                  <div className="text-sm font-extrabold text-gray-800 dark:text-white">
                    {sportsPricing?.weekend_surge_pct > 0 ? `+${sportsPricing.weekend_surge_pct}%` : 'None'}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex bg-gray-50 dark:bg-gray-700/50 rounded-2xl mb-6 p-1 border border-gray-100 dark:border-gray-700">
            <div className="flex-1 py-4 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="text-xl font-black text-gray-900 dark:text-white">{listing.total_slots || listing.slots || 10}</div>
              <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Total Slots</div>
            </div>
            <div className="flex-1 py-4 text-center">
              <div className="text-xl font-black text-hgreen">{listing.available_slots || listing.total_slots || listing.slots || 10}</div>
              <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Available</div>
            </div>
            <div className="flex-1 py-4 text-center">
              <div className="text-xl font-black text-gray-900 dark:text-white">{listing.distance_km || '0.8'}km</div>
              <div className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Distance</div>
            </div>
          </div>

          {/* Sticky Bottom Bar for CTAs */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:max-w-md md:mx-auto">
            <button 
              onClick={() => navigate(`/book/${listing.id}`)} 
              className="btn-primary flex-1 text-lg py-4 shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-transform"
            >
              Book Now
            </button>
            <button
              onClick={() => window.open(`https://maps.google.com/?q=${listing.lat},${listing.lng}`, '_blank')}
              className="w-16 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center transition-transform active:scale-95 border border-blue-200 dark:border-blue-800"
            >
              <MapPin size={24} strokeWidth={2.5} />
            </button>
          </div>

          {/* Call Owner Button */}
          <a 
            href={`tel:${listing.phone_number || '+918044441234'}`} 
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-hgreen/10 hover:bg-hgreen/20 text-hgreen font-extrabold rounded-xl border border-hgreen/20 mb-6 transition-colors"
          >
            <PhoneCall size={20} />
            Call Host Directly
          </a>

          {/* Amenities */}
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-3">🏠 Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {(listing.amenities || []).map(a => (
                <div key={a} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-200">
                  <span>{AMENITY_ICONS[a] || '✓'}</span> {a}
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Rate Table (parking only) */}
          {isParking && (
            <div className="mb-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white mb-3">🚗 Hourly Rate by Vehicle</h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="text-left text-xs font-extrabold text-muted py-2.5 px-3 rounded-tl-xl">Vehicle</th>
                    <th className="text-right text-xs font-extrabold text-muted py-2.5 px-3 rounded-tr-xl">Rate / hr</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['🛵', 'Bike / Scooter', bikePr],
                    ['🚗', 'Car (Sedan)',    carPr],
                    ['🚙', 'SUV / Large Car',suvPr],
                    ['🚛', 'Truck',          truckPr],
                    ['🚌', 'Bus',            busPr],
                  ].filter(([,,pr]) => pr).map(([emoji, label, pr]) => (
                    <tr key={label} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="text-sm py-2.5 px-3 text-gray-700 dark:text-gray-200">{emoji} {label}</td>
                      <td className="text-sm py-2.5 px-3 font-extrabold text-gray-900 dark:text-white text-right">
                        ₹{pr.hourly_min}–₹{pr.hourly_max}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Advertisement Banner (Listing) */}
          {ads?.listing?.active && ads.listing.url && (
            <div className="mb-6">
              <a 
                href={ads.listing.link} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full h-28 rounded-2xl overflow-hidden shadow-sm transition-transform active:scale-95 relative border border-gray-100 dark:border-gray-800 bg-gray-100"
              >
                <div className="absolute top-2 right-2 bg-black/60 text-[8px] text-white/90 px-1.5 py-0.5 rounded uppercase tracking-widest z-10 backdrop-blur-sm">Ad</div>
                {ads.listing.url.match(/\.(mp4|webm|mov)$/i) ? (
                  <video src={ads.listing.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={ads.listing.url} alt="Advertisement" className="w-full h-full object-cover" />
                )}
              </a>
            </div>
          )}

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">⭐ Reviews ({displayReviews.length})</h3>
              <button onClick={() => setShowReviewForm(true)} className="text-xs font-bold text-primary">Write a Review</button>
            </div>
            <div className="flex flex-col gap-3">
              {displayReviews.map(r => (
                <div key={r.id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                      style={{ background: r.user_avatar_color }}>
                      {r.user_initial}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-extrabold text-gray-900 dark:text-white">{r.user_name}</div>
                      <div className="text-xs text-muted">{r.created_at}</div>
                    </div>
                    <div className="text-warning text-sm tracking-tight">{'★'.repeat(r.rating)}</div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{r.review_text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Spacer for bottom sticky nav */}
        <div className="h-28" />
      </div>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal-sheet p-5" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Write a Review</h3>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setMyRating(s)} className={`text-3xl ${s <= myRating ? 'text-warning' : 'text-gray-200'}`}>★</button>
              ))}
            </div>
            <textarea
              value={myReview} onChange={e => setMyReview(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm font-semibold outline-none focus:border-primary mb-4 dark:bg-gray-700 dark:text-white resize-none"
            />
            <button
              onClick={() => setShowReviewForm(false)}
              disabled={!myRating || !myReview.trim()}
              className="btn-primary"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}

      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
