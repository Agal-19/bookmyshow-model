import React from 'react';
import { Film, Search, MapPin, User, LogOut, ShieldCheck, Ticket } from 'lucide-react';

export default function Navbar({ 
  selectedCity, 
  setSelectedCity, 
  cities, 
  searchTerm, 
  setSearchTerm, 
  user, 
  onOpenAuth, 
  onLogout, 
  onOpenProfile, 
  onOpenAdmin 
}) {
  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 500, padding: '12px 24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{ background: 'var(--primary-red)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
            <Film size={26} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>Book<span style={{ color: 'var(--primary-red)' }}>My</span>Show</h1>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>CINEMA & EVENTS</span>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ flex: 1, maxWidth: '480px', position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search movies by title, genre, language..." 
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '42px', height: '42px' }}
          />
        </div>

        {/* City Selector & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* City Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <MapPin size={16} color="var(--primary-red)" />
            <select 
              value={selectedCity} 
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}
            >
              <option value="" style={{ background: '#1A1D29', color: 'white' }}>All Cities</option>
              {cities.map(c => (
                <option key={c.id} value={c.name} style={{ background: '#1A1D29', color: 'white' }}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* User Controls */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user.is_admin && (
                <button className="btn btn-outline" onClick={onOpenAdmin} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} /> Admin Dashboard
                </button>
              )}
              <button className="btn btn-secondary" onClick={onOpenProfile} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                <Ticket size={16} color="var(--accent-green)" /> My Bookings ({user.username})
              </button>
              <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '8px 12px' }} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onOpenAuth}>
              <User size={18} /> Sign In
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
