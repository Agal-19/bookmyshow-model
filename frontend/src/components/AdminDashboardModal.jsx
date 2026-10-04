import React, { useState, useEffect } from 'react';
import { X, TrendingUp, DollarSign, Film, Building2, Clock, Download, Calendar, Plus, CheckCircle, Ticket, Trash2, Edit2, Search } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboardModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('DASHBOARD'); // DASHBOARD | BOOKINGS | MOVIES | THEATRES | SHOWS
  
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' });

  // Add Forms state
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showAddTheatre, setShowAddTheatre] = useState(false);
  const [showAddShow, setShowAddShow] = useState(false);
  
  // Movie Form
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mRelease, setMRelease] = useState('');
  // Theatre Form
  const [tName, setTName] = useState('');
  const [tCity, setTCity] = useState('');
  const [tAddress, setTAddress] = useState('');
  // Show Form
  const [sMovie, setSMovie] = useState('');
  const [sTheatre, setSTheatre] = useState('');
  const [sScreen, setSScreen] = useState('');
  const [sTime, setSTime] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setActionMsg({ text: '', type: '' });
    try {
      if (activeTab === 'DASHBOARD') {
        const res = await axios.get('/api/admin/analytics/dashboard/', { withCredentials: true });
        setStats(res.data);
      } else if (activeTab === 'BOOKINGS') {
        const res = await axios.get('/api/admin/bookings/', { withCredentials: true });
        setBookings(res.data.results || res.data);
      } else if (activeTab === 'MOVIES') {
        const res = await axios.get('/api/admin/movies/', { withCredentials: true });
        setMovies(res.data.results || res.data);
      } else if (activeTab === 'THEATRES') {
        const res = await axios.get('/api/admin/theatres/', { withCredentials: true });
        setTheatres(res.data.results || res.data);
      } else if (activeTab === 'SHOWS') {
        const res = await axios.get('/api/shows/', { withCredentials: true });
        setShows(res.data.results || res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg({ text: '', type: '' }), 4000);
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/movies/', { title: mTitle, description: mDesc, release_date: mRelease }, { withCredentials: true });
      showMessage('Movie created successfully');
      setShowAddMovie(false);
      fetchData();
    } catch (err) { showMessage('Failed to create movie', 'error'); }
  };

  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      // Hardcoded city_id=7 for Madurai in demo for simplicity
      await axios.post('/api/admin/theatres/', { name: tName, city_id: 7, address: tAddress }, { withCredentials: true });
      showMessage('Theatre created successfully');
      setShowAddTheatre(false);
      fetchData();
    } catch (err) { showMessage('Failed to create theatre', 'error'); }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/shows/', { movie_id: sMovie, screen_id: sScreen, start_time: sTime }, { withCredentials: true });
      showMessage('Show scheduled successfully');
      setShowAddShow(false);
      fetchData();
    } catch (err) { showMessage('Failed to create show', 'error'); }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await axios.delete(`/api/admin/movies/${id}/`, { withCredentials: true });
      showMessage('Movie deleted successfully');
      fetchData();
    } catch (err) { showMessage('Failed to delete movie', 'error'); }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Are you sure you want to delete this theatre?')) return;
    try {
      await axios.delete(`/api/admin/theatres/${id}/`, { withCredentials: true });
      showMessage('Theatre deleted successfully');
      fetchData();
    } catch (err) { showMessage('Failed to delete theatre', 'error'); }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;
    try {
      await axios.delete(`/api/admin/shows/${id}/`, { withCredentials: true });
      showMessage('Show deleted successfully');
      fetchData();
    } catch (err) { showMessage('Failed to delete show', 'error'); }
  };

  const renderDashboard = () => {
    if (!stats) return <div style={{ color: 'white' }}>Loading...</div>;
    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Revenue</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>₹{stats.revenue_summary.total_revenue}</div>
          </div>
          <div style={{ background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Bookings (All Time)</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '4px' }}>{stats.cancellation_stats?.total_bookings || 0}</div>
          </div>
          <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Movies</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFD700', marginTop: '4px' }}>{stats.top_movies?.length || 0} (Active)</div>
          </div>
          <div style={{ background: 'rgba(229, 9, 20, 0.1)', border: '1px solid rgba(229, 9, 20, 0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Theatres</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-red)', marginTop: '4px' }}>{stats.top_theaters?.length || 0} (Active)</div>
          </div>
        </div>
      </div>
    );
  };

  const renderBookings = () => (
    <div>
      <h3 style={{ color: 'white', marginBottom: '16px' }}>Booking History</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Customer</th>
              <th style={{ padding: '12px' }}>Movie & Theatre</th>
              <th style={{ padding: '12px' }}>Showtime</th>
              <th style={{ padding: '12px' }}>Seats</th>
              <th style={{ padding: '12px' }}>Amount</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No bookings found</td></tr> : null}
            {bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px' }}>#{b.booking_id.slice(0, 8)}</td>
                <td style={{ padding: '12px' }}>
                  <div>{b.customer_name || 'Guest'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customer_email || 'No Email'}</div>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 600 }}>{b.showtime?.movie_title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.showtime?.theater_name}</div>
                </td>
                <td style={{ padding: '12px' }}>{new Date(b.showtime?.start_time).toLocaleString()}</td>
                <td style={{ padding: '12px' }}>
                  <div>{b.booked_seats?.length} Seats</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.booked_seats?.map(s => `${s.row_name}${s.seat_number}`).join(', ')}</div>
                </td>
                <td style={{ padding: '12px', fontWeight: 600 }}>₹{b.total_amount}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ color: b.status === 'CONFIRMED' ? 'var(--accent-green)' : '#FF4D4D', fontWeight: 600 }}>{b.status}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Payment Received</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMovies = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: 'white' }}>Manage Movies</h3>
        <button className="btn btn-primary" onClick={() => setShowAddMovie(!showAddMovie)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{showAddMovie ? 'Cancel' : '+ Add Movie'}</button>
      </div>
      
      {showAddMovie && (
        <form onSubmit={handleCreateMovie} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input type="text" placeholder="Movie Title" className="input-field" value={mTitle} onChange={e => setMTitle(e.target.value)} required />
          <input type="date" className="input-field" value={mRelease} onChange={e => setMRelease(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>Save</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {movies.map(m => (
          <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '8px' }}>{m.title}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{m.release_date} • {m.duration_minutes}m</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', flex: 1 }} onClick={() => handleDeleteMovie(m.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTheatres = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: 'white' }}>Manage Theatres</h3>
        <button className="btn btn-primary" onClick={() => setShowAddTheatre(!showAddTheatre)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{showAddTheatre ? 'Cancel' : '+ Add Theatre'}</button>
      </div>

      {showAddTheatre && (
        <form onSubmit={handleCreateTheatre} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input type="text" placeholder="Theatre Name" className="input-field" value={tName} onChange={e => setTName(e.target.value)} required />
          <input type="text" placeholder="Address" className="input-field" value={tAddress} onChange={e => setTAddress(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>Save</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
        {theatres.map(t => (
          <div key={t.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ color: 'white', fontWeight: 600, marginBottom: '4px' }}>{t.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{t.city_name}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', flex: 1 }} onClick={() => handleDeleteTheatre(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderShows = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: 'white' }}>Manage Shows</h3>
        <button className="btn btn-primary" onClick={() => setShowAddShow(!showAddShow)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{showAddShow ? 'Cancel' : '+ Schedule Show'}</button>
      </div>

      {showAddShow && (
        <form onSubmit={handleCreateShow} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <input type="text" placeholder="Movie ID" className="input-field" style={{ width: '120px' }} value={sMovie} onChange={e => setSMovie(e.target.value)} required />
          <input type="text" placeholder="Screen ID" className="input-field" style={{ width: '120px' }} value={sScreen} onChange={e => setSScreen(e.target.value)} required />
          <input type="datetime-local" className="input-field" style={{ width: '200px' }} value={sTime} onChange={e => setSTime(e.target.value)} required />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px' }}>Save</button>
        </form>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Movie</th>
              <th style={{ padding: '12px' }}>Theatre</th>
              <th style={{ padding: '12px' }}>Time</th>
              <th style={{ padding: '12px' }}>Format</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shows.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '12px', fontWeight: 600 }}>{s.movie_title}</td>
                <td style={{ padding: '12px' }}>{s.theater_name} ({s.screen_name})</td>
                <td style={{ padding: '12px' }}>{new Date(s.start_time).toLocaleString()}</td>
                <td style={{ padding: '12px' }}>{s.format} - {s.language}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => handleDeleteShow(s.id)} style={{ background: 'none', border: 'none', color: '#FF4D4D', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const tabs = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: TrendingUp },
    { id: 'BOOKINGS', label: 'Booking History', icon: Ticket },
    { id: 'MOVIES', label: 'Movies', icon: Film },
    { id: 'THEATRES', label: 'Theatres', icon: Building2 },
    { id: 'SHOWS', label: 'Shows', icon: Clock }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1200px', width: '95%', height: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
          <h2 style={{ fontSize: '1.6rem', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Admin Control Center
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {actionMsg.text && (
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: actionMsg.type === 'error' ? '#FF4D4D' : 'var(--accent-green)' }}>
                {actionMsg.text}
              </span>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar Tabs */}
          <div style={{ width: '240px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid var(--border-color)', padding: '20px 0' }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 24px',
                    background: isActive ? 'linear-gradient(90deg, rgba(229, 9, 20, 0.15) 0%, transparent 100%)' : 'transparent',
                    border: 'none', borderLeft: isActive ? '3px solid var(--primary-red)' : '3px solid transparent',
                    color: isActive ? 'white' : 'var(--text-secondary)', fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)'
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--primary-red)' : 'var(--text-muted)'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Loading data...
              </div>
            ) : (
              <>
                {activeTab === 'DASHBOARD' && renderDashboard()}
                {activeTab === 'BOOKINGS' && renderBookings()}
                {activeTab === 'MOVIES' && renderMovies()}
                {activeTab === 'THEATRES' && renderTheatres()}
                {activeTab === 'SHOWS' && renderShows()}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
