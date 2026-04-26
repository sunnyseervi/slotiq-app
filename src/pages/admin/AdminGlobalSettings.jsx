import React from 'react'
import { 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Smartphone, 
  Save
} from 'lucide-react'
import { useStore } from '../../store/useStore'

export default function AdminGlobalSettings() {
  const { sections, toggleSection } = useStore()

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

        {/* System Status */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck size={24} className="text-primary" />
            <h3 className="font-heading" style={{ fontWeight: '700' }}>System Configuration</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <p className="text-xs font-bold text-muted uppercase mb-2">Platform Fee (₹)</p>
              <input type="number" defaultValue="10" className="admin-btn admin-btn-outline" style={{ width: '100%', textAlign: 'left', background: '#F8FAFC' }} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted uppercase mb-2">GST Rate (%)</p>
              <input type="number" defaultValue="18" className="admin-btn admin-btn-outline" style={{ width: '100%', textAlign: 'left', background: '#F8FAFC' }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <p className="text-xs font-bold text-muted uppercase mb-2">Maintenance Message</p>
              <textarea 
                className="admin-btn admin-btn-outline" 
                style={{ width: '100%', textAlign: 'left', background: '#F8FAFC', minHeight: '80px', paddingTop: '12px' }}
                placeholder="Message shown during downtime..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="admin-btn admin-btn-outline">Discard Changes</button>
          <button className="admin-btn admin-btn-primary" style={{ padding: '12px 32px' }} onClick={() => window.alert('Settings saved!')}>
            <Save size={18} /> Save All Settings
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
      <button onClick={onToggle} style={{ color: active ? 'var(--success)' : '#CBD5E1', border: 'none', background: 'none' }}>
        {active ? <ToggleRight size={44} /> : <ToggleLeft size={44} />}
      </button>
    </div>
  )
}
