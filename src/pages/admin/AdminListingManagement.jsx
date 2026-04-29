import React, { useState } from 'react'
import { 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Edit, 
  Search,
  Download,
  Filter,
  Eye,
  EyeOff,
  X,
  Plus,
  MapPin,
  CheckCircle2,
  Clock,
  Car,
  Truck,
  Bus,
  Bike
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { LOCATIONS } from '../../lib/constants'

const AMENITY_LIST = ['CCTV 24/7','EV Charging','Wheelchair Access','Security Guard','Covered Parking','Valet Available','Washrooms','WiFi','Floodlights','Changing Rooms','Parking']
const PARKING_SUBTYPES = ['Basement','Open','Covered','Mall']
const SPORTS_SUBTYPES  = ['Football','Badminton','Cricket','Basketball','Tennis']

export default function AdminListingManagement() {
  const { listings, removeListing, reorderListing, updateListing, addListing } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [modalStep, setModalStep] = useState(1)

  // Form State
  const initialForm = {
    name: '',
    type: 'parking',
    sub_type: '',
    area: 'Koramangala',
    address: '',
    google_maps_link: '',
    exact_coordinates: '',
    contact: '',
    status: 'active',
    amenities: [],
    vSettings: {
      bike:  { enabled: false, slots: '', prices: { hour: { active: true, val: '' }, day: { active: true, val: '' }, week: { active: true, val: '' }, month: { active: true, val: '' } } },
      car:   { enabled: false, slots: '', prices: { hour: { active: true, val: '' }, day: { active: true, val: '' }, week: { active: true, val: '' }, month: { active: true, val: '' } } },
      truck: { enabled: false, slots: '', prices: { hour: { active: true, val: '' }, day: { active: true, val: '' }, week: { active: true, val: '' }, month: { active: true, val: '' } } },
      bus:   { enabled: false, slots: '', prices: { hour: { active: true, val: '' }, day: { active: true, val: '' }, week: { active: true, val: '' }, month: { active: true, val: '' } } },
    }
  }

  const [formData, setFormData] = useState(initialForm)

  const filteredListings = listings.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (l.area && l.area.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === 'all' || l.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData(initialForm)
    setModalStep(1)
    setShowModal(true)
  }

  const handleOpenEdit = (listing) => {
    setEditingId(listing.id)
    // Deep merge with initialForm to ensure all structure exists
    setFormData({ ...initialForm, ...listing })
    setModalStep(1)
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateListing(editingId, formData)
    } else {
      addListing({ ...formData, id: `l-${Date.now()}` })
    }
    setShowModal(false)
  }

  const toggleAmenity = (a) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(a) 
        ? prev.amenities.filter(x => x !== a) 
        : [...prev.amenities, a]
    }))
  }

  const updateVSetting = (v, field, val) => {
    setFormData(prev => ({
      ...prev,
      vSettings: {
        ...prev.vSettings,
        [v]: { ...prev.vSettings[v], [field]: val }
      }
    }))
  }

  const updateVPrice = (v, tier, field, val) => {
    setFormData(prev => ({
      ...prev,
      vSettings: {
        ...prev.vSettings,
        [v]: { 
          ...prev.vSettings[v],
          prices: {
            ...prev.vSettings[v].prices,
            [tier]: { ...prev.vSettings[v].prices[tier], [field]: val }
          }
        }
      }
    }))
  }

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Type,Area,Status,Revenue,Bookings,Contact\n" + 
      listings.map(l => `${l.id},${l.name},${l.type},${l.area},${l.status},${l.revenue},${l.bookings},${l.contact}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "slotiq_inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const toggleStatus = (id, currentStatus) => {
    updateListing(id, { status: currentStatus === 'active' ? 'inactive' : 'active' })
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-heading" style={{ fontSize: '28px', fontWeight: '800' }}>Inventory Management</h1>
          <p className="text-muted">Manage parking spots, sports venues, and discovery locations</p>
        </div>
        <div className="flex gap-3">
          <button className="admin-btn admin-btn-outline" onClick={exportData}>
            <Download size={18} /> Export CSV
          </button>
          <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} /> Add New Place
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="admin-card" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items-center" style={{ flex: 1 }}>
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search by name or area..." 
                className="admin-btn admin-btn-outline" 
                style={{ width: '100%', paddingLeft: '40px', textAlign: 'left', background: '#F8FAFC' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'parking', 'sports'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`admin-btn ${typeFilter === t ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                  style={{ textTransform: 'capitalize', fontSize: '13px' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Listing Details</th>
                <th>Type</th>
                <th>Area</th>
                <th>Revenue</th>
                <th>Bookings</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No places found matching your search.
                  </td>
                </tr>
              ) : (
                filteredListings.map((l, index) => (
                  <tr key={l.id}>
                    <td>
                      <div className="flex flex-col gap-1 items-center">
                        <button 
                          onClick={() => reorderListing(l.id, 'up')}
                          disabled={index === 0}
                          style={{ opacity: index === 0 ? 0.3 : 1 }}
                        >
                          <ArrowUp size={16} />
                        </button>
                        <span style={{ fontWeight: '800', fontSize: '14px' }}>{index + 1}</span>
                        <button 
                          onClick={() => reorderListing(l.id, 'down')}
                          disabled={index === filteredListings.length - 1}
                          style={{ opacity: index === filteredListings.length - 1 ? 0.3 : 1 }}
                        >
                          <ArrowDown size={16} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '700', fontSize: '15px' }}>{l.name}</span>
                        <span className="text-muted" style={{ fontSize: '12px' }}>{l.contact || l.phone_number || 'No contact'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge" style={{ backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}>
                        {l.type}
                      </span>
                    </td>
                    <td>{l.area}</td>
                    <td style={{ fontWeight: '700' }}>₹{(l.revenue || 0).toLocaleString()}</td>
                    <td>{l.bookings || 0}</td>
                    <td>
                      <span className={`admin-badge ${l.status === 'active' || !l.status ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                        {l.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button className="admin-btn admin-btn-outline" style={{ padding: '8px' }} onClick={() => handleOpenEdit(l)}>
                          <Edit size={16} />
                        </button>
                        <button 
                          className="admin-btn admin-btn-outline" 
                          style={{ padding: '8px' }} 
                          onClick={() => toggleStatus(l.id, l.status || 'active')}
                        >
                          {(l.status === 'active' || !l.status) ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          className="admin-btn admin-btn-outline" 
                          style={{ padding: '8px', color: 'var(--danger)', borderColor: '#FEE2E2' }}
                          onClick={() => { if(window.confirm("Delete this listing?")) removeListing(l.id) }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal Overlay */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.6)', 
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="admin-card animate-fade-in" style={{ width: '100%', maxWidth: '700px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-gray-800 z-10 py-2 border-b border-gray-100">
              <div>
                <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: '800' }}>
                  {editingId ? 'Edit Property Details' : 'Add New Property (Company Entry)'}
                </h2>
                <div className="flex gap-1 mt-1">
                  {[1,2,3].map(s => <div key={s} style={{ height:'4px', flex:1, backgroundColor: s <= modalStep ? 'var(--accent)' : '#eee', borderRadius:2, minWidth:'40px' }} />)}
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-primary">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: Basic & Location */}
              {modalStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p className="text-xs font-bold text-muted uppercase mb-1.5">Property Name</p>
                      <input required className="admin-btn admin-btn-outline w-full text-left" placeholder="e.g. Prestige Tech Park Basement"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted uppercase mb-1.5">Type</p>
                      <select className="admin-btn admin-btn-outline w-full text-left" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option value="parking">Parking Space</option>
                        <option value="sports">Sports Venue</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p className="text-xs font-bold text-muted uppercase mb-1.5">Area</p>
                      <select className="admin-btn admin-btn-outline w-full text-left" value={formData.area} onChange={e => setFormData({...formData, area: e.target.value})}>
                        {(LOCATIONS.areas['Bengaluru']||[]).map(a => <option key={a}>{a}</option>)}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted uppercase mb-1.5">Category</p>
                      <select className="admin-btn admin-btn-outline w-full text-left" value={formData.sub_type} onChange={e => setFormData({...formData, sub_type: e.target.value})}>
                        <option value="">Select Category</option>
                        {(formData.type === 'parking' ? PARKING_SUBTYPES : SPORTS_SUBTYPES).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-muted uppercase mb-1.5">Exact Address</p>
                    <input required className="admin-btn admin-btn-outline w-full text-left" placeholder="Full street address..."
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p className="text-xs font-bold text-muted uppercase mb-1.5">Google Maps Link</p>
                      <input className="admin-btn admin-btn-outline w-full text-left" placeholder="https://maps.app.goo.gl/..."
                        value={formData.google_maps_link} onChange={e => setFormData({...formData, google_maps_link: e.target.value})} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted uppercase mb-1.5">Exact Coordinates (Lat, Lng)</p>
                      <input className="admin-btn admin-btn-outline w-full text-left" placeholder="e.g. 12.93, 77.62"
                        value={formData.exact_coordinates} onChange={e => setFormData({...formData, exact_coordinates: e.target.value})} />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button type="button" className="admin-btn admin-btn-primary w-full" onClick={() => setModalStep(2)}>Continue to Spaces &amp; Pricing →</button>
                  </div>
                </div>
              )}

              {/* STEP 2: Vehicle Slots & Multi-tier Pricing */}
              {modalStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <p className="text-sm text-muted mb-4">Set slot counts and toggle pricing tiers for each vehicle type.</p>
                  
                  {['bike', 'car', 'truck', 'bus'].map(v => (
                    <div key={v} className="p-4 border border-gray-100 rounded-2xl mb-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {v==='bike'?<Bike size={20}/>:v==='car'?<Car size={20}/>:v==='truck'?<Truck size={20}/>:<Bus size={20}/>}
                          <span className="font-bold capitalize">{v === 'bike' ? '2 Wheeler' : v === 'car' ? '4 Wheeler' : v}</span>
                        </div>
                        <input type="checkbox" checked={formData.vSettings[v].enabled} onChange={e => updateVSetting(v, 'enabled', e.target.checked)} />
                      </div>

                      {formData.vSettings[v].enabled && (
                        <div className="grid grid-cols-1 gap-4 animate-fadeIn">
                          <div className="flex items-center gap-4">
                            <p className="text-[11px] font-black text-muted uppercase w-24">Total Slots:</p>
                            <input type="number" className="admin-btn admin-btn-outline text-left py-2" style={{ width:'120px' }} placeholder="0"
                              value={formData.vSettings[v].slots} onChange={e => updateVSetting(v, 'slots', e.target.value)} />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {['hour', 'day', 'week', 'month'].map(tier => (
                              <div key={tier} className="flex flex-col gap-1.5 p-3 bg-white rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-black uppercase text-muted">{tier}ly Price</span>
                                  <input type="checkbox" checked={formData.vSettings[v].prices[tier].active} 
                                    onChange={e => updateVPrice(v, tier, 'active', e.target.checked)} />
                                </div>
                                {formData.vSettings[v].prices[tier].active ? (
                                  <input type="number" className="text-sm font-bold w-full border-none p-0 outline-none" placeholder={`₹ ${tier}`}
                                    value={formData.vSettings[v].prices[tier].val} onChange={e => updateVPrice(v, tier, 'val', e.target.value)} />
                                ) : (
                                  <span className="text-[10px] text-gray-300 italic">Tier Disabled</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-4 flex gap-3">
                    <button type="button" className="admin-btn admin-btn-outline flex-1" onClick={() => setModalStep(1)}>Back</button>
                    <button type="button" className="admin-btn admin-btn-primary flex-2" onClick={() => setModalStep(3)}>Continue to Amenities →</button>
                  </div>
                </div>
              )}

              {/* STEP 3: Amenities & Finalize */}
              {modalStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <p className="text-xs font-bold text-muted uppercase mb-3">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {AMENITY_LIST.map(a => (
                        <button key={a} type="button" onClick={() => toggleAmenity(a)}
                          className={`px-3 py-1.5 rounded-pill border text-xs font-bold transition-all ${formData.amenities.includes(a) ? 'bg-primary text-white border-primary' : 'bg-white text-gray-500 border-gray-200'}`}>
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 flex gap-3">
                    <button type="button" className="admin-btn admin-btn-outline flex-1" onClick={() => setModalStep(2)}>Back</button>
                    <button type="submit" className="admin-btn admin-btn-primary flex-2">
                      {editingId ? 'Save Changes' : 'Publish Listing'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
