import React, { useState, useEffect } from 'react';
import { X, Ticket, CreditCard, Download, Calendar, MapPin, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

export default function UserProfileModal({ user, onClose, onViewTicket }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/bookings/my/', { withCredentials: true })
      .then(res => setBookings(res.data.results || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', padding: '32px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'white' }}>{user.username}'s Booking History</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>View past ticket bookings and download e-tickets</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Fetching your bookings...</div>
        ) : bookings.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '550px', overflowY: 'auto' }}>
            {bookings.map(b => {
              const seatsText = b.booked_seats?.map(bs => `${bs.row_name}${bs.seat_number}`).join(', ') || 'Seats';
              const downloadUrl = `/api/bookings/${b.booking_id}/download-ticket/`;

              return (
                <div key={b.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>{b.showtime?.movie_title}</span>
                      <span className={`badge ${b.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`}>{b.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span><MapPin size={14} style={{ verticalAlign: 'middle' }} /> {b.showtime?.theater_name}</span>
                      <span><Calendar size={14} style={{ verticalAlign: 'middle' }} /> {new Date(b.showtime?.start_time).toLocaleDateString()}</span>
                      <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>Seats: {seatsText}</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Booking ID: #{b.booking_id.slice(0, 8)} • Total Paid: ₹{b.total_amount}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a 
                      href={downloadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline" 
                      style={{ padding: '8px 14px', fontSize: '0.8rem', textDecoration: 'none' }}
                    >
                      <Download size={14} /> Ticket PDF
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No ticket bookings found yet. Book your first movie ticket now!
          </div>
        )}

      </div>
    </div>
  );
}
