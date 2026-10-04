import React from 'react';
import { X, Download, CheckCircle, Film, Calendar, MapPin, Ticket } from 'lucide-react';

export default function ETicketModal({ booking, onClose }) {
  if (!booking) return null;

  const downloadUrl = `/api/bookings/${booking.booking_id}/download-ticket/`;
  const seatsText = booking.booked_seats?.map(bs => `${bs.row_name}${bs.seat_number}`).join(', ') || 'Seats Booked';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: 0, overflow: 'hidden' }}>
        
        {/* Banner Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--primary-red), #800000)', padding: '24px', color: 'white', textCenter: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle size={24} color="var(--accent-green)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Booking Confirmed!</h3>
          </div>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, textAlign: 'center' }}>Your e-ticket has been generated and sent to your email.</p>
        </div>

        {/* E-Ticket Card Layout */}
        <div style={{ padding: '28px', background: 'var(--bg-card)' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '20px' }}>
            <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'white', marginBottom: '8px' }}>
              {booking.showtime?.movie_title || 'Movie'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="var(--primary-red)" />
                <span>{booking.showtime?.theater_name} ({booking.showtime?.screen_name})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} color="var(--accent-cyan)" />
                <span>{booking.showtime?.start_time ? new Date(booking.showtime.start_time).toLocaleString() : 'Showtime'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={16} color="var(--accent-green)" />
                <span style={{ fontWeight: 700, color: 'var(--accent-green)' }}>Seats: {seatsText} ({booking.booked_seats?.length || 0} Tickets)</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>
                <span style={{ display: 'block', marginBottom: '2px' }}>Payment Status</span>
                <strong style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>Payment Received</strong>
              </div>
              <div>
                <span style={{ display: 'block', marginBottom: '2px' }}>Booking Status</span>
                <strong style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>Confirmed</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Booking ID: #{booking.booking_id.slice(0, 12)}</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>₹{booking.total_amount}</span>
            </div>
          </div>

          {/* Download PDF Ticket Button */}
          <a 
            href={downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Download size={18} /> Download PDF Ticket
          </a>

        </div>

      </div>
    </div>
  );
}
