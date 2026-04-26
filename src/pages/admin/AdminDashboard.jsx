import React from 'react'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  MapPin,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { useStore } from '../../store/useStore'

const REVENUE_DATA = [
  { name: 'Mon', value: 0 },
  { name: 'Tue', value: 0 },
  { name: 'Wed', value: 0 },
  { name: 'Thu', value: 0 },
  { name: 'Fri', value: 0 },
  { name: 'Sat', value: 0 },
  { name: 'Sun', value: 0 },
]

const DEMAND_DATA = []

export default function AdminDashboard() {
  const { listings, bookings, getAdminStats } = useStore()
  const stats = getAdminStats()

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading" style={{ fontSize: '28px', fontWeight: '800' }}>Dashboard Overview</h1>
        <p className="text-muted">Real-time performance metrics for SlotIQ Platform</p>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={<DollarSign size={24} color="var(--success)" />} 
          trend="0%" 
          up={true} 
        />
        <StatCard 
          title="Total Bookings" 
          value={stats.totalBookings.toString()} 
          icon={<Users size={24} color="#3B82F6" />} 
          trend="0%" 
          up={true} 
        />
        <StatCard 
          title="Active Places" 
          value={stats.activePlaces.toString()} 
          icon={<MapPin size={24} color="var(--accent)" />} 
          trend="0" 
          up={true} 
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toString()} 
          icon={<Users size={24} color="#8B5CF6" />} 
          trend="0%" 
          up={true} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Revenue Chart */}
        <div className="admin-card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-heading" style={{ fontWeight: '700' }}>Revenue Trends</h3>
          </div>
          <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {stats.totalRevenue > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={REVENUE_DATA}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-sm">No revenue data available yet</p>
            )}
          </div>
        </div>

        {/* Demand by Area */}
        <div className="admin-card">
          <h3 className="font-heading mb-6" style={{ fontWeight: '700' }}>Demand by Area</h3>
          <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {DEMAND_DATA.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={DEMAND_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748B'}} width={100} />
                  <Tooltip 
                     cursor={{fill: 'transparent'}}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-sm text-center px-6">No area demand data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="admin-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading" style={{ fontWeight: '700' }}>Recent Bookings</h3>
        </div>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Place</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No bookings recorded yet.
                  </td>
                </tr>
              ) : (
                bookings.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>#{b.id.toUpperCase()}</td>
                    <td>{b.user_id || b.user || 'Guest'}</td>
                    <td>{b.listing_name || b.place}</td>
                    <td className="text-muted">{b.booking_date || b.date}</td>
                    <td style={{ fontWeight: '700' }}>₹{(b.total_cost || b.amount).toLocaleString()}</td>
                    <td>
                      <span className={`admin-badge ${b.status === 'completed' || b.status === 'done' ? 'admin-badge-success' : 'admin-badge-warning'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend, up }) {
  return (
    <div className="admin-card" style={{ marginBottom: 0 }}>
      <div className="flex justify-between items-start mb-4">
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#F8FAFC', 
          borderRadius: '12px' 
        }}>
          {icon}
        </div>
        <div className="flex items-center" style={{ 
          fontSize: '12px', 
          fontWeight: '700', 
          color: up ? 'var(--success)' : 'var(--danger)' 
        }}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-muted" style={{ fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>{title}</p>
        <h2 className="font-heading" style={{ fontSize: '24px', fontWeight: '800' }}>{value}</h2>
      </div>
    </div>
  )
}
