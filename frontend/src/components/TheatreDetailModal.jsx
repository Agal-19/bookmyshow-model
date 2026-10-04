import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Film, Calendar, Clock, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function TheatreDetailModal({ theatre, onClose, onSelectShowtime }) {
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Generate 5 dates starting today
  const datesList = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split('T')[0],
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' })
    };
  });

  useEffect(() => {
    if (theatre) {
      setLoading(true);
      Promise.all([
        axios.get(`/api/theatres/${theatre.id}/movies/`),
        axios.get(`/api/showtimes/?theatre=${theatre.id}&date=${selectedDate}`)
      ]).then(([moviesRes, showsRes]) => {
        setMovies(moviesRes.data);
        setShowtimes(showsRes.data.results || showsRes.data);
      }).catch(err => console.error(err))
      .finally(() => setLoading(false));
    }
  }, [theatre, selectedDate]);

  if (!theatre) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 color="var(--primary-red)" /> {theatre.name}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <MapPin size={16} color="var(--accent-cyan)" /> {theatre.address} ({theatre.city_name})
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {/* Facilities Badges */}
        {theatre.facilities && theatre.facilities.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {theatre.facilities.map((fac, i) => (
              <span key={i} className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                <Sparkles size={10} style={{ marginRight: '4px' }} /> {fac}
              </span>
            ))}
          </div>
        )}

        {/* Date Selector Bar */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 600 }}>
            <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Select Date:
          </label>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
            {datesList.map((d, idx) => (
              <div 
                key={d.iso}
                onClick={() => setSelectedDate(d.iso)}
                style={{
                  background: selectedDate === d.iso ? 'var(--primary-red)' : 'rgba(255,255,255,0.06)',
                  border: selectedDate === d.iso ? '1px solid white' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  minWidth: '85px',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: selectedDate === d.iso ? 'white' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>{idx === 0 ? 'TODAY' : d.day}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>{d.dateNum}</div>
                <div style={{ fontSize: '0.7rem', color: selectedDate === d.iso ? 'white' : 'var(--text-muted)' }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Movies and Clickable Showtimes */}
        <div>
          <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '16px' }}>Currently Showing Movies</h3>
          
          {loading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading showtimes...</div>
          ) : movies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {movies.map(movie => {
                const movieShows = showtimes.filter(s => s.movie === movie.id);
                return (
                  <div key={movie.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <img src={movie.poster_url} alt={movie.title} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '8px' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '6px' }}>{movie.title}</h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        {movie.duration_minutes} Mins • {movie.age_rating} • {movie.genres?.map(g => g.name).join(', ')}
                      </div>

                      {/* Showtimes Buttons */}
                      {movieShows.length > 0 ? (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {movieShows.map(st => (
                            <button
                              key={st.id}
                              onClick={() => onSelectShowtime(movie, st)}
                              className="btn btn-secondary"
                              style={{ padding: '8px 14px', fontSize: '0.85rem', borderColor: 'var(--primary-red)' }}
                            >
                              <Clock size={14} color="var(--primary-red)" />
                              {new Date(st.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({st.format})
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No showtimes available for this date.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>No active movies showing at this theatre right now.</div>
          )}
        </div>

      </div>
    </div>
  );
}
