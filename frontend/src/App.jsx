import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import FilterSidebar from './components/FilterSidebar';
import MovieCard from './components/MovieCard';
import MovieDetailsModal from './components/MovieDetailsModal';
import SeatMapModal from './components/SeatMapModal';
import PaymentModal from './components/PaymentModal';
import ETicketModal from './components/ETicketModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import TheatreDetailModal from './components/TheatreDetailModal';
import { Film, Sparkles, Building2, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const API_BASE = '';

export default function App() {
  const [activeTab, setActiveTab] = useState('MOVIES');
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [filterOptions, setFilterOptions] = useState({});
  const [recommendations, setRecommendations] = useState({});
  const [moviesLoading, setMoviesLoading] = useState(true);

  const [selectedCity, setSelectedCity] = useState('Madurai');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    theater: '',
    rating: '',
    timing: '',
    format: '',
    sort_by: 'popularity'
  });

  const [user, setUser] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [seatMapMovie, setSeatMapMovie] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    axios.get(`${API_BASE}/api/auth/profile/`, { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(() => setUser(null));

    axios.get(`${API_BASE}/api/filters/`)
      .then(res => setFilterOptions(res.data))
      .catch(err => console.error(err));

    axios.get(`${API_BASE}/api/recommendations/`, { withCredentials: true })
      .then(res => setRecommendations(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => { fetchMovies(); }, [selectedCity, debouncedSearch, filters, page]);
  useEffect(() => { fetchTheatres(); }, [selectedCity]);

  const fetchMovies = () => {
    setMoviesLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.append('search', debouncedSearch);
    if (selectedCity) params.append('city', selectedCity);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.language) params.append('language', filters.language);
    if (filters.theater) params.append('theater', filters.theater);
    if (filters.rating) params.append('rating', filters.rating);
    if (filters.timing) params.append('timing', filters.timing);
    if (filters.format) params.append('format', filters.format);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    params.append('page', page);

    axios.get(`${API_BASE}/api/movies/?${params.toString()}`)
      .then(res => {
        setMovies(res.data.results || []);
        setTotalMatches(res.data.total_matches || res.data.count || 0);
      })
      .catch(err => console.error(err))
      .finally(() => setMoviesLoading(false));
  };

  const fetchTheatres = () => {
    const cityQuery = selectedCity || 'Madurai';
    axios.get(`${API_BASE}/api/cities/${cityQuery}/theatres/`)
      .then(res => setTheatres(res.data.results || res.data))
      .catch(err => console.error(err));
  };

  const handleResetFilters = () => {
    setFilters({ genre: '', language: '', theater: '', rating: '', timing: '', format: '', sort_by: 'popularity' });
    setSearchTerm('');
    setPage(1);
  };

  const handleLogout = async () => {
    await axios.post(`${API_BASE}/api/auth/logout/`, {}, { withCredentials: true });
    setUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>

      {/* ── Navbar ── */}
      <Navbar
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        cities={filterOptions.cities || []}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* ── Tab Bar ── */}
      <div className="tab-bar">
        <div className="tab-bar-inner">
          <button
            className={`btn ${activeTab === 'MOVIES' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('MOVIES')}
            style={{ padding: '8px 20px', fontSize: '0.9rem' }}
          >
            <Film size={16} /> Movies in {selectedCity || 'All Cities'}
          </button>
          <button
            className={`btn ${activeTab === 'THEATRES' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('THEATRES')}
            style={{ padding: '8px 20px', fontSize: '0.9rem' }}
          >
            <Building2 size={16} /> Theatres in {selectedCity || 'All Cities'}
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="page-container" style={{ paddingBottom: '60px' }}>

        {/* Hero Banner */}
        <HeroBanner
          movies={recommendations.trending || movies}
          onSelectMovie={(movie) => setSelectedMovie(movie)}
        />

        {/* Recommended Section */}
        {recommendations.recommended && recommendations.recommended.length > 0 && (
          <section style={{ margin: '28px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Sparkles size={22} color="#FFD700" />
              <h2 style={{ color: 'white' }}>Recommended for You</h2>
            </div>
            <div className="recommended-grid movie-grid">
              {recommendations.recommended.slice(0, 6).map(movie => (
                <MovieCard key={movie.id} movie={movie} onSelectMovie={(m) => setSelectedMovie(m)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Movies Tab ── */}
        {activeTab === 'MOVIES' ? (
          <div className="movie-discovery-row" style={{ display: 'flex', gap: '28px', marginTop: '24px' }}>

            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              filterOptions={filterOptions}
              totalMatches={totalMatches}
              onReset={handleResetFilters}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Film size={20} color="var(--primary-red)" /> Now Showing
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{totalMatches} movies found</span>
              </div>

              {moviesLoading ? (
                <div className="movie-grid">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', animation: 'pulse 1.5s infinite' }}>
                      <div style={{ height: '280px', background: 'rgba(255,255,255,0.05)' }} />
                      <div style={{ padding: '14px' }}>
                        <div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '8px', width: '70%' }} />
                        <div style={{ height: '11px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', width: '50%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : movies.length > 0 ? (
                <div className="movie-grid">
                  {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} onSelectMovie={(m) => setSelectedMovie(m)} />
                  ))}
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                  <Film size={44} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No matching movies found</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Try adjusting your filters or selecting another city.</p>
                  <button className="btn btn-outline" onClick={handleResetFilters} style={{ marginTop: '16px' }}>Reset Filters</button>
                </div>
              )}

              {/* Pagination */}
              {totalMatches > 12 && (
                <div className="pagination-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '36px' }}>
                  <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => Math.max(p - 1, 1))}>
                    <ChevronLeft size={18} /> Prev
                  </button>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
                    Page {page} of {Math.ceil(totalMatches / 12)}
                  </span>
                  <button className="btn btn-secondary" disabled={page >= Math.ceil(totalMatches / 12)} onClick={() => setPage(p => p + 1)}>
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

        ) : (
          /* ── Theatres Tab ── */
          <div style={{ marginTop: '24px' }}>
            <h2 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={22} color="var(--accent-cyan)" /> Cinema Theatres in {selectedCity || 'All Cities'}
            </h2>
            {theatres.length > 0 ? (
              <div className="theatre-grid">
                {theatres.map(t => (
                  <div key={t.id} className="glass-panel" onClick={() => setSelectedTheatre(t)}
                    style={{ padding: '20px', borderRadius: 'var(--radius-lg)', cursor: 'pointer', transition: 'var(--transition)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <Building2 size={22} color="var(--primary-red)" />
                      <h3 style={{ fontSize: '1.15rem', color: 'white' }}>{t.name}</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <MapPin size={13} color="var(--accent-cyan)" /> {t.address}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      {t.facilities?.map((f, idx) => (
                        <span key={idx} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>{f}</span>
                      ))}
                    </div>
                    <button className="btn btn-outline" style={{ width: '100%', padding: '8px' }}>View Showtimes</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No theatres found in {selectedCity}.</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ── Modals ── */}
      {selectedMovie && (
        <MovieDetailsModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onProceedToBook={(movie) => { setSelectedMovie(null); setSeatMapMovie(movie); }}
          user={user}
        />
      )}
      {selectedTheatre && (
        <TheatreDetailModal
          theatre={selectedTheatre}
          onClose={() => setSelectedTheatre(null)}
          onSelectShowtime={(movie) => { setSelectedTheatre(null); setSeatMapMovie(movie); }}
        />
      )}
      {seatMapMovie && (
        <SeatMapModal
          movie={seatMapMovie}
          onClose={() => setSeatMapMovie(null)}
          onProceedToPayment={(details) => { setSeatMapMovie(null); setBookingDetails(details); }}
          user={user}
        />
      )}
      {bookingDetails && (
        <PaymentModal
          bookingDetails={bookingDetails}
          onClose={() => setBookingDetails(null)}
          onBookingSuccess={(booking) => { setBookingDetails(null); setConfirmedBooking(booking); }}
        />
      )}
      {confirmedBooking && (
        <ETicketModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
        />
      )}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(userData) => setUser(userData)}
        />
      )}
      {showAdminModal && (
        <AdminDashboardModal
          onClose={() => setShowAdminModal(false)}
        />
      )}
      {showProfileModal && user && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onViewTicket={(b) => setConfirmedBooking(b)}
        />
      )}

    </div>
  );
}
