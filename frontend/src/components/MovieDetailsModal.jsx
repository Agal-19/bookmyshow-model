import React, { useState, useEffect } from 'react';
import { X, Play, Star, Clock, Ticket, Flag, Edit, ShieldCheck, ThumbsUp, Film } from 'lucide-react';
import axios from 'axios';

export default function MovieDetailsModal({ movie, onClose, onProceedToBook, user }) {
  const [movieDetails, setMovieDetails] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    if (movie) {
      axios.get(`/api/movies/${movie.id}/`)
        .then(res => setMovieDetails(res.data))
        .catch(err => console.error(err));
    }
  }, [movie]);

  if (!movie) return null;

  const activeMovie = movieDetails || movie;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to submit a review.");
      return;
    }
    setSubmittingReview(true);
    try {
      await axios.post(`/api/movies/${activeMovie.id}/review/`, {
        rating: userRating,
        comment: userComment
      }, { withCredentials: true });

      setReviewMessage("Review submitted successfully!");
      // Refresh details
      const res = await axios.get(`/api/movies/${activeMovie.id}/`);
      setMovieDetails(res.data);
      setUserComment('');
    } catch (err) {
      setReviewMessage(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReportReview = async (reviewId) => {
    try {
      const res = await axios.post(`/api/reviews/${reviewId}/report/`, {}, { withCredentials: true });
      alert(res.data.message || "Review reported.");
    } catch (err) {
      alert("Failed to report review.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '950px', padding: 0 }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 50, background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-color)', borderRadius: '50%', padding: '8px', color: 'white', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* Hero Section / Trailer */}
        {showTrailer && activeMovie.youtube_trailer_id ? (
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
            <iframe 
              src={`https://www.youtube-nocookie.com/embed/${activeMovie.youtube_trailer_id}?autoplay=1&rel=0&modestbranding=1`}
              title="Movie Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        ) : (
          <div style={{ position: 'relative', height: '320px', width: '100%', overflow: 'hidden' }}>
            <img src={activeMovie.backdrop_url || activeMovie.poster_url} alt={activeMovie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-card) 10%, transparent 80%)' }} />
            
            <div style={{ position: 'absolute', bottom: '24px', left: '32px', right: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <span className="badge badge-gold"><Star size={12} fill="#FFD700" /> {activeMovie.average_rating ? activeMovie.average_rating.toFixed(1) : '4.8'}</span>
                  <span className="badge badge-red">{activeMovie.age_rating}</span>
                  <span className="badge badge-cyan"><Clock size={12} /> {activeMovie.duration_minutes} Mins</span>
                </div>
                <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white' }}>{activeMovie.title}</h2>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {activeMovie.youtube_trailer_id && (
                  <button className="btn btn-secondary" onClick={() => setShowTrailer(true)}>
                    <Play size={16} fill="white" /> Trailer
                  </button>
                )}
                <button className="btn btn-primary" onClick={() => onProceedToBook(activeMovie)}>
                  <Ticket size={18} /> Book Tickets
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '32px' }}>
          
          {/* Synopsis */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>About the Movie</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{activeMovie.description}</p>
          </div>

          {/* Cast Members */}
          {activeMovie.cast_members && activeMovie.cast_members.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'var(--text-main)' }}>Starring Cast</h3>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {activeMovie.cast_members.map((c, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>as {c.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Review Submission */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'white' }}>Ratings & User Reviews</h3>
            
            {user ? (
              <form onSubmit={handleSubmitReview}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Your Rating:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={20} 
                      onClick={() => setUserRating(star)}
                      fill={star <= userRating ? "#FFD700" : "none"} 
                      color={star <= userRating ? "#FFD700" : "var(--text-muted)"} 
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </div>

                <textarea 
                  className="input-field"
                  placeholder="Share your thoughts about the movie..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  rows={3}
                  style={{ marginBottom: '12px' }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                  {reviewMessage && <span style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>{reviewMessage}</span>}
                </div>
              </form>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to submit your rating and review.</p>
            )}

            {/* Existing Reviews List */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeMovie.reviews && activeMovie.reviews.length > 0 ? (
                activeMovie.reviews.map(rev => (
                  <div key={rev.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'white' }}>{rev.username}</span>
                        {rev.is_verified_viewer && (
                          <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                            <ShieldCheck size={10} style={{ marginRight: '2px' }} /> Verified Viewer
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: '#FFD700', fontWeight: 700 }}>⭐ {rev.rating}/5</span>
                        <button onClick={() => handleReportReview(rev.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Report review">
                          <Flag size={14} />
                        </button>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reviews yet. Be the first to review!</p>
              )}
            </div>

          </div>

          {/* Similar Movies */}
          {activeMovie.similar_movies && activeMovie.similar_movies.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'white' }}>Similar Movies You Might Like</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                {activeMovie.similar_movies.map(sm => (
                  <div 
                    key={sm.id} 
                    onClick={() => { setMovieDetails(null); onProceedToBook(sm); }}
                    style={{ background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)', padding: '10px', cursor: 'pointer' }}
                  >
                    <img src={sm.poster_url} alt={sm.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sm.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
