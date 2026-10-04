import React, { useState } from 'react';
import { X, User, Lock, Mail, Key } from 'lucide-react';
import axios from 'axios';

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isRegister 
      ? '/api/auth/register/'
      : '/api/auth/login/';

    const payload = isRegister 
      ? { username, email, password }
      : { username, password };

    try {
      const res = await axios.post(url, payload, { withCredentials: true });
      if (isRegister) {
        // Auto login after register
        const loginRes = await axios.post('/api/auth/login/', { username, password }, { withCredentials: true });
        onLoginSuccess(loginRes.data.user);
      } else {
        onLoginSuccess(res.data.user);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillAdmin = () => {
    setUsername('admin');
    setPassword('Admin123!');
  };

  const handleQuickFillUser = () => {
    setUsername('john_doe');
    setPassword('User123!');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'white' }}>{isRegister ? 'Create Account' : 'Sign In'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Quick Credentials Buttons */}
        {!isRegister && (
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Quick Fill Demo Accounts:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleQuickFillAdmin} className="btn btn-outline" style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}>
                🔑 Admin Account
              </button>
              <button onClick={handleQuickFillUser} className="btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}>
                👤 User Account
              </button>
            </div>
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(229, 9, 20, 0.2)', border: '1px solid var(--primary-red)', padding: '10px', borderRadius: 'var(--radius-md)', color: '#FF4D4D', marginBottom: '16px', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ paddingLeft: '38px' }} />
            </div>
          </div>

          {isRegister && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ paddingLeft: '38px' }} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingLeft: '38px' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Sign In')}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span onClick={() => setIsRegister(!isRegister)} style={{ color: 'var(--primary-red)', cursor: 'pointer', fontWeight: 600 }}>
            {isRegister ? 'Sign In' : 'Register Now'}
          </span>
        </div>

      </div>
    </div>
  );
}
