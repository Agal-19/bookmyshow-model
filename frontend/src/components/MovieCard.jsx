import React from 'react';
import { Star, Clock, Ticket } from 'lucide-react';

export default function MovieCard({ movie, onSelectMovie }) {
  return (
    <div 
      className="glass-panel" 
      onClick={() => onSelectMovie(movie)}
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        willChange: 'transform'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-main)';
      }}
    >
      
      {/* Poster Image Container */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '140%', overflow: 'hidden' }}>
        <img 
          src={movie.poster_url} 
          alt={movie.title}
          loading="lazy"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
        />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <span className="badge badge-gold" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
            <Star size={12} fill="#FFD700" style={{ marginRight: '4px' }} />
            {movie.average_rating ? movie.average_rating.toFixed(1) : '4.8'}
          </span>
          <span className="badge badge-red">{movie.age_rating}</span>
        </div>

        {/* Gradient Bottom Tint */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-card) 5%, transparent 60%)' }} />
      </div>

      {/* Card Info */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {movie.title}
          </h4>

          {/* Genres */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {movie.genres?.map(g => (
              <span key={g.id} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                {g.name}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Starts at</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-green)' }}>₹{movie.min_price || 180}</span>
          </div>

          <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Ticket size={14} /> Book
          </button>
        </div>

      </div>

    </div>
  );
}
