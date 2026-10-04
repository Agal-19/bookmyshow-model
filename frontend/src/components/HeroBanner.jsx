import React, { useState } from 'react';
import { Play, Ticket, Star, Clock } from 'lucide-react';

export default function HeroBanner({ movies, onSelectMovie }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex % movies.length];

  return (
    <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', margin: '20px 0', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-main)' }}>
      
      {/* Backdrop Image */}
      <img 
        src={currentMovie.backdrop_url || currentMovie.poster_url} 
        alt={currentMovie.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)' }}
      />

      {/* Gradient Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0B0C10 30%, transparent 80%)' }} />

      {/* Banner Content */}
      <div style={{ position: 'absolute', inset: 0, padding: '40px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '650px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <span className="badge badge-gold"><Star size={12} fill="#FFD700" /> {currentMovie.average_rating || 4.8} Rating</span>
          <span className="badge badge-red">{currentMovie.age_rating}</span>
          <span className="badge badge-cyan"><Clock size={12} /> {currentMovie.duration_minutes} Mins</span>
        </div>

        <h2 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'white', marginBottom: '12px', lineHeight: 1.1 }}>
          {currentMovie.title}
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          Experience the action, drama, and thrill on IMAX 3D. Book your tickets now for the best seats!
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="btn btn-primary" onClick={() => onSelectMovie(currentMovie)}>
            <Ticket size={18} /> Book Tickets
          </button>
          <button className="btn btn-secondary" onClick={() => onSelectMovie(currentMovie)}>
            <Play size={18} fill="white" /> Watch Trailer
          </button>
        </div>
      </div>

      {/* Carousel Dots */}
      <div style={{ position: 'absolute', bottom: '20px', right: '30px', display: 'flex', gap: '8px' }}>
        {movies.slice(0, 5).map((m, idx) => (
          <div 
            key={m.id}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: idx === (currentIndex % movies.length) ? '28px' : '10px',
              height: '10px',
              borderRadius: '5px',
              background: idx === (currentIndex % movies.length) ? 'var(--primary-red)' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'var(--transition)'
            }}
          />
        ))}
      </div>

    </div>
  );
}
