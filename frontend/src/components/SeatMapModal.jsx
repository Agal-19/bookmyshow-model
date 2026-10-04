import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, ShieldCheck, Ticket } from 'lucide-react';
import axios from 'axios';

export default function SeatMapModal({ movie, onClose, onProceedToPayment, user }) {
  const [showtimes, setShowtimes] = useState([]);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [seatLayout, setSeatLayout] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [holdTimerSeconds, setHoldTimerSeconds] = useState(0);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch showtimes for movie
  useEffect(() => {
    if (movie) {
      axios.get(`/api/showtimes/?movie=${movie.id}`)
        .then(res => {
          setShowtimes(res.data.results || res.data);
          if (res.data.length > 0) {
            setSelectedShowtime(res.data[0]);
          } else if (res.data.results && res.data.results.length > 0) {
            setSelectedShowtime(res.data.results[0]);
          }
        })
        .catch(err => console.error(err));
    }
  }, [movie]);

  // Fetch seats whenever showtime changes
  useEffect(() => {
    if (selectedShowtime) {
      fetchSeatLayout();
    }
  }, [selectedShowtime]);

  // 2-minute countdown timer effect
  useEffect(() => {
    let interval = null;
    if (holdTimerSeconds > 0) {
      interval = setInterval(() => {
        setHoldTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            alert("⏰ Your 2-minute seat reservation has expired! Please re-select your seats.");
            setSelectedSeats([]);
            fetchSeatLayout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [holdTimerSeconds]);

  const fetchSeatLayout = () => {
    if (!selectedShowtime) return;
    setLoadingSeats(true);
    axios.get(`/api/showtimes/${selectedShowtime.id}/seats/`, { withCredentials: true })
      .then(res => setSeatLayout(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingSeats(false));
  };

  const handleSeatClick = async (seat) => {
    if (seat.status === 'BOOKED' || seat.status === 'RESERVED_BY_OTHER') return;

    if (!user) {
      alert("Please sign in to select and reserve seats.");
      return;
    }

    const isAlreadySelected = selectedSeats.some(s => s.id === seat.id);
    let newSelected = [];
    if (isAlreadySelected) {
      newSelected = selectedSeats.filter(s => s.id !== seat.id);
    } else {
      newSelected = [...selectedSeats, seat];
    }

    setSelectedSeats(newSelected);

    if (newSelected.length > 0) {
      // Call backend to lock seats atomically for 2 minutes
      try {
        const res = await axios.post('/api/seats/reserve/', {
          showtime_id: selectedShowtime.id,
          seat_ids: newSelected.map(s => s.id)
        }, { withCredentials: true });

        setHoldTimerSeconds(res.data.expires_in_seconds || 120);
        setErrorMessage('');
      } catch (err) {
        setErrorMessage(err.response?.data?.error || "Seats unavailable or already held by another user.");
        setSelectedSeats(selectedSeats); // revert
      }
    } else {
      setHoldTimerSeconds(0);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateTotal = () => {
    if (!seatLayout || !selectedSeats.length) return 0;
    return selectedSeats.reduce((acc, seat) => {
      const price = seatLayout.prices[seat.seat_type] || 200;
      return acc + price;
    }, 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', color: 'white' }}>{movie.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {selectedShowtime ? `${selectedShowtime.theater_name} (${selectedShowtime.screen_name} - ${selectedShowtime.screen_type})` : 'Select Showtime'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {/* Showtimes Selector */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select Show Timing:</label>
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
            {showtimes.map(st => (
              <button 
                key={st.id}
                onClick={() => { setSelectedShowtime(st); setSelectedSeats([]); setHoldTimerSeconds(0); }}
                style={{
                  background: selectedShowtime?.id === st.id ? 'var(--primary-red)' : 'rgba(255,255,255,0.06)',
                  color: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {new Date(st.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </button>
            ))}
          </div>
        </div>

        {/* Live Reservation Hold Timer Alert */}
        {holdTimerSeconds > 0 && (
          <div style={{ background: 'rgba(255, 215, 0, 0.15)', border: '1px solid rgba(255, 215, 0, 0.4)', borderRadius: 'var(--radius-md)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FFD700' }}>
              <Clock size={20} />
              <span style={{ fontWeight: 600 }}>Seats Held Temporarily for Payment:</span>
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFD700', fontFamily: 'monospace' }}>
              {formatTimer(holdTimerSeconds)}
            </span>
          </div>
        )}

        {errorMessage && (
          <div style={{ background: 'rgba(229, 9, 20, 0.2)', border: '1px solid var(--primary-red)', padding: '10px 14px', borderRadius: 'var(--radius-md)', color: '#FF4D4D', marginBottom: '16px', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> {errorMessage}
          </div>
        )}

        {/* Seat Layout Screen Screen Visualizer */}
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          
          {/* Cinema Screen Curved Indicator */}
          <div style={{ height: '8px', background: 'linear-gradient(to right, transparent, var(--primary-red), transparent)', borderRadius: '50%', width: '80%', margin: '0 auto 8px auto', boxShadow: '0 0 15px var(--primary-red)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '3px', textTransform: 'uppercase' }}>ALL EYES THIS WAY (SCREEN)</span>

          {/* Seat Status Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '20px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'rgba(255,255,255,0.15)', border: '1px solid var(--border-color)' }} /> Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--primary-red)' }} /> Selected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#FF9800' }} /> Reserved (Hold)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#333' }} /> Booked
            </div>
          </div>

          {/* Seat Grid Layout */}
          {loadingSeats ? (
            <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Loading live seat map...</div>
          ) : seatLayout && seatLayout.seats ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
              {['A', 'B', 'C', 'D', 'E'].map(row => {
                const rowSeats = seatLayout.seats.filter(s => s.row_name === row);
                return (
                  <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '20px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{row}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {rowSeats.map(seat => {
                        const isSelected = selectedSeats.some(s => s.id === seat.id);
                        let bg = 'rgba(255,255,255,0.12)';
                        let cursor = 'pointer';

                        if (seat.status === 'BOOKED') {
                          bg = '#22232A';
                          cursor = 'not-allowed';
                        } else if (seat.status === 'RESERVED_BY_OTHER') {
                          bg = '#FF9800';
                          cursor = 'not-allowed';
                        } else if (isSelected || seat.status === 'SELECTED_BY_YOU') {
                          bg = 'var(--primary-red)';
                        }

                        return (
                          <button
                            key={seat.id}
                            disabled={seat.status === 'BOOKED' || seat.status === 'RESERVED_BY_OTHER'}
                            onClick={() => handleSeatClick(seat)}
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '6px',
                              background: bg,
                              color: 'white',
                              border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: cursor,
                              transition: 'var(--transition)'
                            }}
                            title={`${seat.row_name}${seat.seat_number} - ${seat.seat_type} Tier (₹${seatLayout.prices[seat.seat_type]})`}
                          >
                            {seat.seat_number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

        </div>

        {/* Footer Summary & Proceed */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Selected Seats: {selectedSeats.map(s => `${s.row_name}${s.seat_number}`).join(', ') || 'None'}</span>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)' }}>Total: ₹{calculateTotal()}</span>
          </div>

          <button 
            className="btn btn-primary" 
            disabled={selectedSeats.length === 0}
            onClick={() => onProceedToPayment({ showtime: selectedShowtime, seats: selectedSeats, totalAmount: calculateTotal() })}
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            <Ticket size={20} /> Proceed to Pay
          </button>
        </div>

      </div>
    </div>
  );
}
