import React, { useState } from 'react';
import { Film, Search, MapPin, User, LogOut, ShieldCheck, Ticket, Menu, X } from 'lucide-react';

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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="glass-panel navbar">
        <div className="navbar-inner">

          {/* Brand Logo */}
          <div
            className="navbar-brand"
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMenuOpen(false); }}
          >
            <div style={{ background: 'var(--primary-red)', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <Film size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                Book<span style={{ color: 'var(--primary-red)' }}>My</span>Show
              </h1>
              <span className="navbar-subtitle" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                CINEMA &amp; EVENTS
              </span>
            </div>
          </div>

          {/* Search Bar (desktop) */}
          <div className="navbar-search">
            <Search size={18} color="var(--text-muted)" className="navbar-search-icon" />
            <input
              type="text"
              placeholder="Search movies, genres, languages..."
              className="input-field navbar-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Desktop Actions */}
          <div className="navbar-actions">
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

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user.is_admin && (
                  <button className="btn btn-outline" onClick={onOpenAdmin} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                    <ShieldCheck size={16} /> Admin
                  </button>
                )}
                <button className="btn btn-secondary" onClick={onOpenProfile} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                  <Ticket size={16} color="var(--accent-green)" /> {user.username}
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

          {/* Hamburger (mobile only) */}
          <button className="navbar-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      <div className={`navbar-mobile-menu${menuOpen ? ' open' : ''}`}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search movies..."
            className="input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px', height: '42px' }}
          />
        </div>

        {/* City */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <MapPin size={16} color="var(--primary-red)" />
          <select
            value={selectedCity}
            onChange={(e) => { setSelectedCity(e.target.value); setMenuOpen(false); }}
            style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.95rem', outline: 'none', cursor: 'pointer', flex: 1 }}
          >
            <option value="" style={{ background: '#1A1D29', color: 'white' }}>All Cities</option>
            {cities.map(c => (
              <option key={c.id} value={c.name} style={{ background: '#1A1D29', color: 'white' }}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Auth actions */}
        {user ? (
          <>
            {user.is_admin && (
              <button className="btn btn-outline" onClick={() => { onOpenAdmin(); setMenuOpen(false); }} style={{ width: '100%' }}>
                <ShieldCheck size={16} /> Admin Dashboard
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => { onOpenProfile(); setMenuOpen(false); }} style={{ width: '100%' }}>
              <Ticket size={16} color="var(--accent-green)" /> My Bookings ({user.username})
            </button>
            <button className="btn btn-secondary" onClick={() => { onLogout(); setMenuOpen(false); }} style={{ width: '100%' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={() => { onOpenAuth(); setMenuOpen(false); }} style={{ width: '100%' }}>
            <User size={18} /> Sign In / Register
          </button>
        )}
      </div>
    </>
  );
}
