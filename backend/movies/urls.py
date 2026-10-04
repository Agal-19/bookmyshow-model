from django.urls import path
from .views import (
    FilterOptionsAPIView, CityListAPIView, CityTheatresAPIView, TheaterDetailAPIView,
    TheaterMoviesAPIView, MovieListAPIView, MovieDetailAPIView, ShowtimeListAPIView,
    ReviewCreateView, ReportReviewView, RecommendationsAPIView, AdminShowManageAPIView,
    AdminMovieManageAPIView, AdminTheaterManageAPIView
)

urlpatterns = [
    path('cities/', CityListAPIView.as_view(), name='city-list'),
    path('cities/<str:city_id>/theatres/', CityTheatresAPIView.as_view(), name='city-theatres'),
    path('theatres/<int:pk>/', TheaterDetailAPIView.as_view(), name='theatre-detail'),
    path('theatres/<int:theatre_id>/movies/', TheaterMoviesAPIView.as_view(), name='theatre-movies'),
    path('filters/', FilterOptionsAPIView.as_view(), name='movie-filters'),
    path('movies/', MovieListAPIView.as_view(), name='movie-list'),
    path('movies/<int:pk>/', MovieDetailAPIView.as_view(), name='movie-detail'),
    path('movies/<int:movie_id>/review/', ReviewCreateView.as_view(), name='movie-review-create'),
    path('reviews/<int:review_id>/report/', ReportReviewView.as_view(), name='review-report'),
    path('showtimes/', ShowtimeListAPIView.as_view(), name='showtime-list'),
    path('shows/', ShowtimeListAPIView.as_view(), name='shows-list'),
    path('recommendations/', RecommendationsAPIView.as_view(), name='movie-recommendations'),
    path('admin/shows/', AdminShowManageAPIView.as_view(), name='admin-shows-create'),
    path('admin/shows/<int:show_id>/', AdminShowManageAPIView.as_view(), name='admin-shows-delete'),
    path('admin/movies/', AdminMovieManageAPIView.as_view(), name='admin-movies-manage'),
    path('admin/movies/<int:movie_id>/', AdminMovieManageAPIView.as_view(), name='admin-movies-delete'),
    path('admin/theatres/', AdminTheaterManageAPIView.as_view(), name='admin-theatres-manage'),
    path('admin/theatres/<int:theater_id>/', AdminTheaterManageAPIView.as_view(), name='admin-theatres-delete'),
]
