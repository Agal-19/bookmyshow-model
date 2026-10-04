import React from 'react';
import { Filter, RotateCcw, ArrowUpDown, Star, Clock, Globe, Clapperboard, Building2 } from 'lucide-react';

export default function FilterSidebar({ filters, setFilters, filterOptions, totalMatches, onReset }) {
  const setFilter = (key, val) => setFilters(prev => ({ ...prev, [key]: val }));

  const activeCount = Object.entries(filters).filter(
    ([k, v]) => v && k !== 'sort_by'
  ).length;

  return (
    <aside
      className="glass-panel"
      style={{ width: '270px', minWidth: '230px', padding: '20px', borderRadius: 'var(--radius-lg)', height: 'fit-content', position: 'sticky', top: '80px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--primary-red)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Filters</h3>
          {activeCount > 0 && (
            <span style={{ background: 'var(--primary-red)', color: 'white', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px' }}>
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={onReset}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Match Counter */}
      <div style={{ background: 'rgba(229, 9, 20, 0.08)', border: '1px solid rgba(229, 9, 20, 0.25)', padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Matches:</span>
        <span className="badge badge-red" style={{ fontSize: '0.85rem' }}>{totalMatches} Movies</span>
      </div>

      {/* Sort */}
      <FilterBlock label="Sort By" icon={<ArrowUpDown size={13} />}>
        <select className="input-field select-field" value={filters.sort_by} onChange={e => setFilter('sort_by', e.target.value)} style={{ color: 'white' }}>
          <option value="popularity" style={{ background: '#1A1D29', color: 'white' }}>🔥 Popularity</option>
          <option value="newest" style={{ background: '#1A1D29', color: 'white' }}>✨ Newest Releases</option>
          <option value="rating" style={{ background: '#1A1D29', color: 'white' }}>⭐ Highest Rated</option>
          <option value="price" style={{ background: '#1A1D29', color: 'white' }}>🏷️ Lowest Price</option>
        </select>
      </FilterBlock>

      {/* Genre */}
      <FilterBlock label="Genre" icon={<Clapperboard size={13} />}>
        <select className="input-field select-field" value={filters.genre} onChange={e => setFilter('genre', e.target.value)} style={{ color: 'white' }}>
          <option value="" style={{ background: '#1A1D29', color: 'white' }}>All Genres</option>
          {filterOptions.genres?.map(g => <option key={g.id} value={g.id} style={{ background: '#1A1D29', color: 'white' }}>{g.name}</option>)}
        </select>
      </FilterBlock>

      {/* Language */}
      <FilterBlock label="Language" icon={<Globe size={13} />}>
        <select className="input-field select-field" value={filters.language} onChange={e => setFilter('language', e.target.value)} style={{ color: 'white' }}>
          <option value="" style={{ background: '#1A1D29', color: 'white' }}>All Languages</option>
          {filterOptions.languages?.map(l => <option key={l.id} value={l.id} style={{ background: '#1A1D29', color: 'white' }}>{l.name}</option>)}
        </select>
      </FilterBlock>

      {/* Format */}
      <FilterBlock label="Format" icon={<Clapperboard size={13} />}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['', '2D', '3D', 'IMAX', 'Dolby Atmos', '4DX'].map(fmt => (
            <button
              key={fmt || 'all'}
              onClick={() => setFilter('format', fmt)}
              style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                background: filters.format === fmt ? 'var(--primary-red)' : 'rgba(255,255,255,0.07)',
                color: filters.format === fmt ? 'white' : 'var(--text-secondary)',
                transition: 'var(--transition)'
              }}
            >
              {fmt || 'All'}
            </button>
          ))}
        </div>
      </FilterBlock>

      {/* Theatre */}
      <FilterBlock label="Theatre" icon={<Building2 size={13} />}>
        <select className="input-field select-field" value={filters.theater} onChange={e => setFilter('theater', e.target.value)} style={{ color: 'white' }}>
          <option value="" style={{ background: '#1A1D29', color: 'white' }}>All Theatres</option>
          {filterOptions.theaters?.map(t => <option key={t.id} value={t.id} style={{ background: '#1A1D29', color: 'white' }}>{t.name}</option>)}
        </select>
      </FilterBlock>

      {/* Rating */}
      <FilterBlock label="Min. Rating" icon={<Star size={13} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[{ val: '', label: 'Any Rating' }, { val: '4.5', label: '⭐ 4.5+' }, { val: '4.0', label: '⭐ 4.0+' }, { val: '3.5', label: '⭐ 3.5+' }].map(opt => (
            <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="rating"
                value={opt.val}
                checked={filters.rating === opt.val}
                onChange={() => setFilter('rating', opt.val)}
                style={{ accentColor: 'var(--primary-red)' }}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterBlock>

      {/* Show Timing */}
      <FilterBlock label="Show Timing" icon={<Clock size={13} />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { val: '', label: 'All Times' },
            { val: 'morning', label: '☀️ Morning (8AM–12PM)' },
            { val: 'afternoon', label: '🌤️ Afternoon (12–4PM)' },
            { val: 'evening', label: '🌆 Evening (4–8PM)' },
            { val: 'night', label: '🌙 Night (8PM–12AM)' },
          ].map(opt => (
            <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="timing"
                value={opt.val}
                checked={filters.timing === opt.val}
                onChange={() => setFilter('timing', opt.val)}
                style={{ accentColor: 'var(--primary-red)' }}
              />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterBlock>

    </aside>
  );
}

function FilterBlock({ label, icon, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon} {label}
      </label>
      {children}
    </div>
  );
}
