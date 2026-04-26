import React, { useState } from 'react'
import { 
  Download, 
  Search, 
  Filter, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  MoreVertical
} from 'lucide-react'
import { useStore } from '../../store/useStore'

export default function AdminBookingList() {
  const { bookings, updateBooking } = useStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBookings = bookings.filter(b => 
    (b.user || b.user_id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.place || b.listing_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const togglePaymentStatus = (id, currentStatus) => {
    updateBooking(id, { payment_status: currentStatus === 'paid' ? 'pending' : 'paid' })
  }

  const exportBookings = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,User,Place,Date,Amount,Status,Payment\n" + 
      bookings.map(b => `${b.id},${b.user || b.user_id},${b.place || b.listing_name},${b.date || b.booking_date},${b.amount || b.total_cost},${b.status},${b.payment_status || 'pending'}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "slotiq_bookings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-heading" style={{ fontSize: '28px', fontWeight: '800' }}>Booking Management</h1>
          <p className="text-muted">Monitor and export all transaction data across the platform</p>
        </div>
        <button className="admin-btn admin-btn-outline" onClick={exportBookings}>
          <Download size={18} /> Export Full History
        </button>
      </div>

      <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <MiniStat label="Completed Bookings" value={bookings.filter(b => b.status === 'done' || b.status === 'completed').length} icon={<CheckCircle2 size={18} color="var(--success)" />} />
        <MiniStat label="Upcoming Sessions" value={bookings.filter(b => b.status === 'upcoming').length} icon={<Clock size={18} color="var(--warning)" />} />
        <MiniStat label="Active Sessions" value={bookings.filter(b => b.status === 'active').length} icon={<Calendar size={18} color="#3B82F6" />} />
      </div>

      <div className="admin-card">
        <div className="flex justify-between items-center mb-6">
          <div style={{ position: 'relative', width: '350px' }}>
            <Search size={18} className="text-muted" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search bookings by customer or place..." 
              className="admin-btn admin-btn-outline" 
              style={{ width: '100%', paddingLeft: '40px', textAlign: 'left' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer Name</th>
                <th>Location / Venue</th>
                <th>Booking Date</th>
                <th>Net Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px' }}>
                    #{b.id.toUpperCase()}
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontSize: '11px', fontWeight: '800' 
                      }}>
                        {(b.user || b.user_id || 'G').split(' ').map(n => n[0]).join('')}
                      </div>
                      <span style={{ fontWeight: '600' }}>{b.user || b.user_id || 'Guest'}</span>
                    </div>
                  </td>
                  <td>{b.place || b.listing_name}</td>
                  <td className="text-muted">{b.date || b.booking_date}</td>
                  <td style={{ fontWeight: '800' }}>₹{(b.amount || b.total_cost).toLocaleString()}</td>
                  <td>
                    <span className={`admin-badge ${b.payment_status === 'paid' ? 'admin-badge-success' : 'admin-badge-danger'}`} style={{ fontSize: '10px' }}>
                      {b.payment_status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-badge ${b.status === 'completed' || b.status === 'done' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <button 
                        className={`admin-btn admin-btn-outline ${b.payment_status === 'paid' ? 'opacity-50' : ''}`}
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                        onClick={() => togglePaymentStatus(b.id, b.payment_status)}
                      >
                        {b.payment_status === 'paid' ? 'Revert' : 'Mark Paid'}
                      </button>
                      <button className="admin-btn admin-btn-outline" style={{ padding: '6px' }}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, icon }) {
  return (
    <div className="admin-card" style={{ padding: '20px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '10px' }}>{icon}</div>
      <div>
        <p className="text-muted" style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
        <h4 className="font-heading" style={{ fontSize: '18px', fontWeight: '800' }}>{value}</h4>
      </div>
    </div>
  )
}
