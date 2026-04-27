import React, { useState } from 'react'
import { useStore } from '../../store/useStore'
import { Lock, Mail, ShieldCheck, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const loginAdmin = useStore(s => s.loginAdmin)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const success = loginAdmin(email, password)
    if (success) {
      navigate('/admin')
    } else {
      setError('Invalid administrator credentials')
    }
  }

  return (
    <div className="admin-login-overlay">
      <div className="admin-login-card">
        <button onClick={() => navigate('/')} className="back-btn">
          <ArrowLeft size={18} /> Back to App
        </button>

        <div className="admin-login-header">
          <div className="logo-badge">
            <ShieldCheck size={32} color="white" />
          </div>
          <h1>System Admin</h1>
          <p>Please authenticate to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="error-msg">{error}</div>}
          
          <div className="admin-input-group">
            <label>Admin Email</label>
            <div className="admin-input-wrapper">
              <Mail size={18} className="admin-input-icon" />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="theslotiq@gmail.com"
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label>Secure Password</label>
            <div className="admin-input-wrapper">
              <Lock size={18} className="admin-input-icon" />
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="admin-login-btn">
            Unlock Admin Panel
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .admin-login-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .admin-login-card {
          background: #1e293b;
          border: 1px solid #334155;
          padding: 40px;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .back-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: transparent;
          border: none;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .back-btn:hover {
          color: white;
        }

        .admin-login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-badge {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #F5620F, #FF8C42);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .admin-login-header h1 {
          color: white;
          font-size: 22px;
          font-weight: 700;
          margin: 0;
        }

        .admin-login-header p {
          color: #94a3b8;
          font-size: 14px;
          margin-top: 4px;
        }

        .admin-login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .error-msg {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
          text-align: center;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .admin-input-group label {
          display: block;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .admin-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .admin-input-icon {
          position: absolute;
          left: 14px;
          color: #64748b;
        }

        .admin-input-wrapper input {
          width: 100%;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 12px 12px 12px 42px;
          color: white;
          font-size: 15px;
          transition: all 0.2s;
        }

        .admin-input-wrapper input:focus {
          outline: none;
          border-color: #F5620F;
          box-shadow: 0 0 0 4px rgba(245, 98, 15, 0.1);
        }

        .admin-login-btn {
          background: #F5620F;
          color: white;
          border: none;
          border-radius: 12px;
          padding: 14px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          margin-top: 8px;
        }

        .admin-login-btn:hover {
          background: #e55a0d;
          transform: translateY(-1px);
        }

        .admin-login-btn:active {
          transform: translateY(0);
        }
      `}} />
    </div>
  )
}
