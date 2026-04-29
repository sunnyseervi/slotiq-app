import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, PhoneCall } from 'lucide-react'
import TopBar from '../components/layout/TopBar'
import LocationModal from '../components/modals/LocationModal'
import { useStore } from '../store/useStore'
import { AMENITY_ICONS } from '../lib/constants'
import { formatInr } from '../lib/utils'

export default function ListingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { listings: storeListings, currentUser, toggleSavedPlace, ads } = useStore()
  const [showLoc, setShowLoc] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [myReview, setMyReview] = useState('')

  const listing = storeListings.find(l => l.id === id)
  const savedPlaces = currentUser?.saved_places || []
  const isSaved = savedPlaces.includes(id)

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
  // Real pricing and reviews should come from Supabase in a production app
  // For now we'll assume they are part of the listing object or fetched separately
  const reviews = listing.reviews || []
  const displayReviews = reviews

  const photoBg = isParking
    ? 'linear-gradient(160deg,#2c3e50,#3498db)'
    : 'linear-gradient(160deg,#1a3c34,#2d7a3a)'

  // Dynamic pricing based on listing object
  const bikePr  = listing.pricing?.bike
  const carPr   = listing.pricing?.car
  const suvPr   = listing.pricing?.suv
  const truckPr = listing.pricing?.truck
  const busPr   = listing.pricing?.bus

  return (
    <div className="app-shell">
      <div className="screen-content">
        <TopBar onLocationClick={() => setShowLoc(true)} />

        {/* Hero Photo */}
        <div className="relative h-72 flex flex-col items-center justify-center" style={{ background: photoBg }}>
          <div className="absolute inset-0 bg-black/20" />
          <span className="text-[120px] drop-shadow-2xl relative z-10 transform hover:scale-110 transition-transform duration-500">{listing.thumbnail_emoji}</span>

          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 w-10 h-10 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white text-xl font-bold transition-all z-20"
          >
            ←
          </button>

          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <div className="bg-black/40 backdrop-blur-sm text-white/90 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-white/10">
              {listing.sub_type || 'Premium'}
            </div>
            <button
              onClick={() => toggleSavedPlace(id)}
              className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
            >
              <span className={`text-xl leading-none ${isSaved ? 'text-danger' : 'text-gray-300'}`}>
                {isSaved ? '❤️' : '🤍'}
              </span>
            </button>
          </div>

          <div className="absolute bottom-4 right-4 bg-hgreen text-white text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/10 uppercase tracking-widest">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {listing.available_slots || 8} Slots Left
          </div>
        </div>

        {/* Body */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-t-[40px] -mt-10 relative z-10 min-h-screen pb-40">
          <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
          
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{listing.name}</h1>
          <p className="text-xs text-muted font-bold mb-4 flex items-center gap-1.5">
            <MapPin size={14} className="text-primary" />
            {listing.address} · {listing.area}
          </p>

          <div className="flex items-center gap-3 flex-wrap mb-6">
            <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 px-3 py-1.5 rounded-xl text-xs font-black">
              ⭐ {listing.rating || '4.8'}
              <span className="text-[10px] opacity-60 ml-0.5">({listing.review_count || '24'})</span>
            </div>
            <div className="bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-xl text-xs font-black">
              📍 {listing.distance_km || '1.2'} KM
            </div>
            <div className="bg-green-500/10 text-hgreen px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
              🕐 {listing.open_hours || '24/7'} Open
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {isParking ? (
              <>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Bike Rate</div>
                  <div className="text-base font-black text-danger">
                    ₹{bikePr ? `${bikePr.hourly_min}` : '20'}/hr
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Car Rate</div>
                  <div className="text-base font-black text-danger">
                    ₹{carPr ? `${carPr.hourly_min}` : '50'}/hr
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Standard</div>
                  <div className="text-base font-black text-danger">
                    ₹{sportsPricing ? sportsPricing.base_price_per_hour : '500'}/hr
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="text-[10px] text-muted font-black uppercase tracking-widest mb-1">Peak Rate</div>
                  <div className="text-base font-black text-danger">
                    ₹{sportsPricing ? sportsPricing.peak_price_per_hour : '800'}/hr
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex bg-gray-50 dark:bg-gray-700/30 rounded-3xl mb-8 p-1.5 border border-gray-100 dark:border-gray-700">
            <div className="flex-1 py-4 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <div className="text-xl font-black text-gray-900 dark:text-white">{listing.total_slots || 20}</div>
              <div className="text-[9px] text-muted font-black uppercase tracking-widest mt-1">Total Capacity</div>
            </div>
            <div className="flex-1 py-4 text-center">
              <div className="text-xl font-black text-hgreen">{listing.available_slots || 12}</div>
              <div className="text-[9px] text-muted font-black uppercase tracking-widest mt-1">Available Now</div>
            </div>
            <div className="flex-1 py-4 text-center">
              <div className="text-xl font-black text-gray-900 dark:text-white">{listing.distance_km || '1.2'}</div>
              <div className="text-[9px] text-muted font-black uppercase tracking-widest mt-1">KM Distance</div>
            </div>
          </div>

          {/* Call Owner Button */}
          <a 
            href={`tel:${listing.phone_number || '+918044441234'}`} 
            className="flex items-center justify-center gap-3 w-full py-4 bg-hgreen/5 hover:bg-hgreen/10 text-hgreen text-xs font-black uppercase tracking-widest rounded-2xl border-2 border-hgreen/10 mb-8 transition-all"
          >
            <PhoneCall size={18} strokeWidth={3} />
            Contact Host Directly
          </a>

          {/* Amenities */}
          <div className="mb-8">
            <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4">🏠 Amenities & Features</h3>
            <div className="flex flex-wrap gap-2">
              {(listing.amenities || ['CCTV', 'Security', 'Covered']).map(a => (
                <div key={a} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-xl text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider border border-gray-100 dark:border-gray-600">
                  <span>{AMENITY_ICONS[a] || '✨'}</span> {a}
                </div>
              ))}
            </div>
          </div>

          {/* Advertisement Banner (Listing) */}
          {ads?.listing?.active && ads.listing.url && (
            <div className="mb-8">
              <a 
                href={ads.listing.link} 
                target="_blank" 
                rel="noreferrer"
                className="block w-full h-32 rounded-3xl overflow-hidden shadow-lg transition-all active:scale-95 relative border border-gray-100 dark:border-gray-800 bg-gray-100"
              >
                <div className="absolute top-3 right-3 bg-black/60 text-[8px] text-white/90 px-2 py-1 rounded-full uppercase tracking-widest z-10 backdrop-blur-sm font-black">AD</div>
                {ads.listing.url.match(/\.(mp4|webm|mov)$/i) ? (
                  <video src={ads.listing.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <img src={ads.listing.url} alt="Advertisement" className="w-full h-full object-cover" />
                )}
              </a>
            </div>
          )}

          {/* Reviews */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-widest">⭐ Community Feedback</h3>
              <button onClick={() => setShowReviewForm(true)} className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1.5 rounded-full">Add Review</button>
            </div>
            <div className="flex flex-col gap-4">
              {displayReviews.map(r => (
                <div key={r.id} className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0 shadow-sm"
                      style={{ background: r.user_avatar_color }}>
                      {r.user_initial}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight">{r.user_name}</div>
                      <div className="text-[9px] text-muted font-bold">{r.created_at}</div>
                    </div>
                    <div className="text-warning text-xs tracking-tight">{'★'.repeat(r.rating)}</div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{r.review_text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar for CTAs */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 border-t border-gray-100 dark:border-gray-800 flex gap-4 z-50 pb-safe shadow-[0_-20px_40px_rgba(0,0,0,0.05)] md:max-w-md md:mx-auto rounded-t-[30px]">
          <button 
            onClick={() => navigate(`/book/${listing.id}`)} 
            className="btn-primary flex-1 text-base font-black py-4 uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all rounded-2xl"
          >
            Confirm Booking
          </button>
          <button
            onClick={() => window.open(`https://maps.google.com/?q=${listing.lat},${listing.lng}`, '_blank')}
            className="w-16 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl flex items-center justify-center transition-all active:scale-95 border-2 border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <MapPin size={26} strokeWidth={2.5} />
          </button>
        </div>

        {/* Spacer for bottom sticky nav */}
        <div className="h-32" />
      </div>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="modal-overlay" onClick={() => setShowReviewForm(false)}>
          <div className="modal-sheet p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Share Experience</h3>
            <div className="flex gap-3 mb-6 justify-center">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setMyRating(s)} className={`text-4xl transition-all ${s <= myRating ? 'text-warning scale-110' : 'text-gray-100 dark:text-gray-700'}`}>★</button>
              ))}
            </div>
            <textarea
              value={myReview} onChange={e => setMyReview(e.target.value)}
              placeholder="How was the parking/sport venue?"
              rows={4}
              className="w-full border-2 border-transparent bg-gray-50 dark:bg-gray-800 rounded-3xl p-5 text-sm font-bold outline-none focus:border-primary mb-6 dark:text-white resize-none shadow-inner"
            />
            <button
              onClick={() => setShowReviewForm(false)}
              disabled={!myRating || !myReview.trim()}
              className="btn-primary py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              Post Review
            </button>
          </div>
        </div>
      )}

      {showLoc && <LocationModal onClose={() => setShowLoc(false)} />}
    </div>
  )
}
