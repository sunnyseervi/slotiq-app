import React, { useState } from 'react'
import { 
  Trash2, 
  Edit, 
  Search,
  Download,
  UserPlus,
  Shield,
  User,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useStore } from '../../store/useStore'

export default function AdminUserManagement() {
  const { users, removeUser, updateUser, addUser } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'customer',
    status: 'active',
    phone: ''
  })

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (u.phone && u.phone.includes(searchTerm))
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({ name: '', email: '', role: 'customer', status: 'active', phone: '' })
    setShowModal(true)
  }

  const handleOpenEdit = (user) => {
    setEditingId(user.id)
    setFormData({ ...user })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      updateUser(editingId, formData)
    } else {
      addUser(formData)
    }
    setShowModal(false)
  }

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Name,Email,Role,Status,Phone\n" + 
      users.map(u => `${u.id},${u.name},${u.email},${u.role},${u.status},${u.phone}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "slotiq_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const toggleStatus = (id, currentStatus) => {
    updateUser(id, { status: currentStatus === 'active' ? 'inactive' : 'active' })
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="font-heading" style={{ fontSize: '28px', fontWeight: '800' }}>User Management</h1>
          <p className="text-muted">Manage customers, hosts, and administrative access</p>
        </div>
        <div className="flex gap-3">
          <button className="admin-btn admin-btn-outline" onClick={exportData}>
            <Download size={18} /> Export CSV
          </button>
          <button className="admin-btn admin-btn-primary" onClick={handleOpenAdd}>
            <UserPlus size={18} /> Add New User
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
                placeholder="Search by name, email, or phone..." 
                className="admin-btn admin-btn-outline" 
                style={{ width: '100%', paddingLeft: '40px', textAlign: 'left', background: '#F8FAFC' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'customer', 'host', 'admin'].map(r => (
                <button 
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`admin-btn ${roleFilter === r ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                  style={{ textTransform: 'capitalize', fontSize: '13px' }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black ${u.role === 'admin' ? 'bg-indigo-600' : u.role === 'host' ? 'bg-orange-500' : 'bg-primary'}`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '700', fontSize: '15px' }}>{u.name}</span>
                          <span className="text-muted" style={{ fontSize: '12px' }}>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {u.role === 'admin' ? <Shield size={14} className="text-indigo-600" /> : <User size={14} className="text-muted" />}
                        <span className="admin-badge" style={{ backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0', textTransform: 'capitalize' }}>
                          {u.role}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-semibold">{u.phone || 'No phone'}</div>
                    </td>
                    <td>
                      <span className={`admin-badge ${u.status === 'active' ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button className="admin-btn admin-btn-outline" style={{ padding: '8px' }} onClick={() => handleOpenEdit(u)}>
                          <Edit size={16} />
                        </button>
                        <button 
                          className="admin-btn admin-btn-outline" 
                          style={{ padding: '8px' }} 
                          onClick={() => toggleStatus(u.id, u.status)}
                        >
                          {u.status === 'active' ? <AlertCircle size={16} className="text-warning" /> : <CheckCircle size={16} className="text-success" />}
                        </button>
                        <button 
                          className="admin-btn admin-btn-outline" 
                          style={{ padding: '8px', color: 'var(--danger)', borderColor: '#FEE2E2' }}
                          onClick={() => { if(window.confirm("Delete this user?")) removeUser(u.id) }}
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

      {/* Modal Overlay */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(10, 25, 47, 0.6)', 
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div className="admin-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: '800' }}>
                {editingId ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-primary">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-xs font-bold text-muted uppercase mb-1.5">Full Name</p>
                <input 
                  required
                  type="text" 
                  className="admin-btn admin-btn-outline" 
                  style={{ width: '100%', textAlign: 'left', background: '#F8FAFC' }}
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <p className="text-xs font-bold text-muted uppercase mb-1.5">Email Address</p>
                <input 
                  required
                  type="email" 
                  className="admin-btn admin-btn-outline" 
                  style={{ width: '100%', textAlign: 'left', background: '#F8FAFC' }}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p className="text-xs font-bold text-muted uppercase mb-1.5">Role</p>
                  <select 
                    className="admin-btn admin-btn-outline" 
                    style={{ width: '100%', textAlign: 'left', background: '#F8FAFC' }}
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="customer">Customer</option>
                    <option value="host">Host</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted uppercase mb-1.5">Status</p>
                  <select 
                    className="admin-btn admin-btn-outline" 
                    style={{ width: '100%', textAlign: 'left', background: '#F8FAFC' }}
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted uppercase mb-1.5">Phone Number</p>
                <input 
                  type="text" 
                  className="admin-btn admin-btn-outline" 
                  style={{ width: '100%', textAlign: 'left', background: '#F8FAFC' }}
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" className="admin-btn admin-btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary" style={{ flex: 2 }}>
                  {editingId ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
