import React from 'react'
import { 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Smartphone, 
  Save
} from 'lucide-react'
import { useStore } from '../../store/useStore'
import { LOCATIONS } from '../../lib/mockData'

export default function AdminGlobalSettings() {
  const { sections, toggleSection, activeLocations, toggleCity, toggleArea, ads, updateAd, systemConfig, updateSystemConfig } = useStore()
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert("All Global Settings have been saved successfully.")
    }, 600)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading" style={{ fontSize: '28px', fontWeight: '800' }}>Platform Settings</h1>
        <p className="text-muted">Configure global platform behavior and visibility</p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {/* Module Visibility */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone size={24} className="text-primary" />
            <h3 className="font-heading" style={{ fontWeight: '700' }}>Module Visibility</h3>
          </div>
          
          <div className="space-y-6">
            <ToggleRow 
              title="Parking Module" 
              description="Enable/Disable the entire parking discovery and booking system" 
              active={sections.parking}
              onToggle={() => toggleSection('parking')}
            />
            <ToggleRow 
              title="Sports Module" 
              description="Enable/Disable sports venue listings and slots" 
              active={sections.sports}
              onToggle={() => toggleSection('sports')}
            />
            <ToggleRow 
              title="Discovery Section" 
              description="Toggle visibility of the 'Discover More' exploration section" 
              active={sections.discovery}
              onToggle={() => toggleSection('discovery')}
            />
          </div>
        </div>

        {/* Location Management */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-primary text-2xl">🗺️</span>
            <h3 className="font-heading" style={{ fontWeight: '700' }}>Active Locations</h3>
          </div>
          <p className="text-sm text-muted mb-6">Turn cities and areas on/off. Disabled locations won't appear in the app.</p>
          
          <div className="space-y-6">
            {LOCATIONS.cities.map(city => {
              const isActiveCity = activeLocations?.cities?.[city]
              return (
                <div key={city} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-gray-50/50 dark:bg-[#0A0A0A]">
                  <ToggleRow 
                    title={`${city} (City)`}
                    description={`Status: ${isActiveCity ? 'Active' : 'Disabled'}`}
                    active={isActiveCity}
                    onToggle={() => toggleCity(city)}
                  />
                  
                  {isActiveCity && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <p className="text-xs font-bold text-muted uppercase mb-3">Service Areas</p>
                      <div className="grid grid-cols-2 gap-3">
                        {(LOCATIONS.areas[city] || []).map(area => {
                          const isActiveArea = activeLocations?.areas?.[city]?.[area]
                          return (
                            <button
                              key={area}
                              onClick={() => toggleArea(city, area)}
                              className={`text-left px-4 py-2 rounded-lg border-2 text-sm font-bold transition-all ${
                                isActiveArea
                                  ? 'border-primary bg-orange-50 dark:bg-orange-900/20 text-primary'
                                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{area}</span>
                                <span className="text-[10px] uppercase tracking-wider">
                                  {isActiveArea ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Advertisement Banners */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-primary text-2xl">📢</span>
            <h3 className="font-heading" style={{ fontWeight: '700' }}>Advertisement Banners</h3>
          </div>
          <p className="text-sm text-muted mb-6">Manage ad placements on the Home Page and Listing Detail Page.</p>
          
          <div className="space-y-6">
            {/* Home Page Ad */}
            <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-gray-50/50 dark:bg-[#0A0A0A]">
              <ToggleRow 
                title="Home Page Ad Banner"
                description="Shows a banner under the search bar on the Home tab"
                active={ads.home.active}
                onToggle={() => updateAd('home', { active: !ads.home.active })}
              />
              {ads.home.active && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 grid gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Media URL (Image/Video)</p>
                    <input 
                      type="text" 
                      value={ads.home.url} 
                      onChange={(e) => updateAd('home', { url: e.target.value })}
                      className="w-full text-sm border-2 border-gray-200 dark:border-gray-800 dark:bg-[#111111] dark:text-white rounded-lg p-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Click Link Destination</p>
                    <input 
                      type="text" 
                      value={ads.home.link} 
                      onChange={(e) => updateAd('home', { link: e.target.value })}
                      className="w-full text-sm border-2 border-gray-200 dark:border-gray-800 dark:bg-[#111111] dark:text-white rounded-lg p-2 outline-none focus:border-primary"
                    />
                  </div>
                  {/* Preview */}
                  <div className="mt-2 h-20 rounded-lg bg-gray-200 dark:bg-[#111111] overflow-hidden border border-gray-300 dark:border-gray-800">
                    {ads.home.url && <img src={ads.home.url} alt="Home Ad Preview" className="w-full h-full object-cover" />}
                  </div>
                </div>
              )}
            </div>

            {/* Listing Page Ad */}
            <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-gray-50/50 dark:bg-[#0A0A0A]">
              <ToggleRow 
                title="Listing Details Ad Banner"
                description="Shows a banner below the pricing section on a parking spot page"
                active={ads.listing.active}
                onToggle={() => updateAd('listing', { active: !ads.listing.active })}
              />
              {ads.listing.active && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 grid gap-3">
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Media URL (Image/Video)</p>
                    <input 
                      type="text" 
                      value={ads.listing.url} 
                      onChange={(e) => updateAd('listing', { url: e.target.value })}
                      className="w-full text-sm border-2 border-gray-200 dark:border-gray-800 dark:bg-[#111111] dark:text-white rounded-lg p-2 outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Click Link Destination</p>
                    <input 
                      type="text" 
                      value={ads.listing.link} 
                      onChange={(e) => updateAd('listing', { link: e.target.value })}
                      className="w-full text-sm border-2 border-gray-200 dark:border-gray-800 dark:bg-[#111111] dark:text-white rounded-lg p-2 outline-none focus:border-primary"
                    />
                  </div>
                  {/* Preview */}
                  <div className="mt-2 h-20 rounded-lg bg-gray-200 dark:bg-[#111111] overflow-hidden border border-gray-300 dark:border-gray-800">
                    {ads.listing.url && <img src={ads.listing.url} alt="Listing Ad Preview" className="w-full h-full object-cover" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck size={24} className="text-primary" />
            <h3 className="font-heading" style={{ fontWeight: '700' }}>System Configuration</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p className="text-xs font-bold text-muted uppercase mb-2">Platform Fee (₹)</p>
              <input 
                type="number" 
                value={systemConfig.platformFee} 
                onChange={(e) => updateSystemConfig('platformFee', Number(e.target.value))}
                className="admin-btn admin-btn-outline" 
                style={{ width: '100%', textAlign: 'left', background: 'var(--bg-gray-50)' }} 
              />
            </div>
            <div>
              <p className="text-xs font-bold text-muted uppercase mb-2">GST Rate (%)</p>
              <input 
                type="number" 
                value={systemConfig.gstRate} 
                onChange={(e) => updateSystemConfig('gstRate', Number(e.target.value))}
                className="admin-btn admin-btn-outline" 
                style={{ width: '100%', textAlign: 'left', background: 'var(--bg-gray-50)' }} 
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <p className="text-xs font-bold text-muted uppercase mb-2">Maintenance Message</p>
              <textarea 
                value={systemConfig.maintenanceMsg}
                onChange={(e) => updateSystemConfig('maintenanceMsg', e.target.value)}
                className="admin-btn admin-btn-outline" 
                style={{ width: '100%', textAlign: 'left', background: 'var(--bg-gray-50)', minHeight: '80px', paddingTop: '12px' }}
                placeholder="Message shown during downtime..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="admin-btn admin-btn-outline" onClick={() => window.location.reload()}>Discard Changes</button>
          <button className="admin-btn admin-btn-primary" style={{ padding: '12px 32px' }} onClick={handleSave} disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ title, description, active, onToggle }) {
  return (
    <div className="flex justify-between items-center py-2">
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{title}</h4>
        <p className="text-muted" style={{ fontSize: '13px' }}>{description}</p>
      </div>
      <button onClick={onToggle} style={{ color: active ? 'var(--success, #10b981)' : 'var(--text-muted, #CBD5E1)', border: 'none', background: 'none' }}>
        {active ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
      </button>
    </div>
  )
}
