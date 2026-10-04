import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Info } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

export default function PaymentModal({ bookingDetails, onClose, onBookingSuccess }) {
  const [gateway, setGateway] = useState('STRIPE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!bookingDetails) return null;

  const handlePayNow = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const response = await axios.post('/api/bookings/checkout/', {
        showtime_id: bookingDetails.showtime.id,
        seat_ids: bookingDetails.seats.map(s => s.id),
        payment_gateway: gateway,
        simulate_failure: false // Hardcoded to false for demo success
      }, { withCredentials: true });

      // Trigger Confetti Celebration animation!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      onBookingSuccess(response.data.booking);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Payment transaction failed. Please retry.");
    } finally {
      setIsProcessing(false);
    }
  };

  const seatsText = bookingDetails.seats.map(s => `${s.row_name}${s.seat_number}`).join(', ');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px', padding: '32px' }}>
        
        {/* Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.4rem', color: 'white' }}>Complete Payment</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Demo Label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
          <Info size={16} color="var(--accent-cyan)" />
          <strong>Demo Mode – No Real Payment.</strong> All transactions will succeed automatically.
        </div>

        {/* Order Summary Box */}
        <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'white', marginBottom: '4px' }}>{bookingDetails.showtime.movie_title}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            {bookingDetails.showtime.theater_name} • {bookingDetails.showtime.screen_name}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', paddingTop: '8px', borderTop: '1px dashed var(--border-color)' }}>
            <span>Booked Seats ({bookingDetails.seats.length}): <strong style={{ color: 'var(--accent-green)' }}>{seatsText}</strong></span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>₹{bookingDetails.totalAmount}</span>
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(229, 9, 20, 0.2)', border: '1px solid var(--primary-red)', padding: '12px', borderRadius: 'var(--radius-md)', color: '#FF4D4D', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        {/* Select Payment Gateway */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>Select Demo Payment Method:</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: gateway === 'STRIPE' ? 'rgba(229, 9, 20, 0.15)' : 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: gateway === 'STRIPE' ? '1px solid var(--primary-red)' : '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input type="radio" name="gateway" value="STRIPE" checked={gateway === 'STRIPE'} onChange={() => setGateway('STRIPE')} />
              <CreditCard size={20} color="var(--accent-cyan)" />
              <div>
                <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Demo Credit/Debit Card</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated seamless checkout</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', background: gateway === 'RAZORPAY' ? 'rgba(229, 9, 20, 0.15)' : 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: gateway === 'RAZORPAY' ? '1px solid var(--primary-red)' : '1px solid var(--border-color)', cursor: 'pointer' }}>
              <input type="radio" name="gateway" value="RAZORPAY" checked={gateway === 'RAZORPAY'} onChange={() => setGateway('RAZORPAY')} />
              <ShieldCheck size={20} color="var(--accent-green)" />
              <div>
                <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>Demo UPI / NetBanking</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Simulated fast payment</div>
              </div>
            </label>

          </div>
        </div>

        {/* Action Button */}
        <button 
          className="btn btn-primary" 
          onClick={handlePayNow} 
          disabled={isProcessing}
          style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
        >
          {isProcessing ? (
            <>
              <RefreshCw size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} /> Processing Payment...
            </>
          ) : (
            `Proceed to Payment → Pay Now`
          )}
        </button>

      </div>
    </div>
  );
}

