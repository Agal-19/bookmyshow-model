from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Min, Q, Count, F
from django.utils import timezone
from datetime import datetime, timedelta
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Genre, Language, City, Theater, Screen, Movie, Showtime, Review
from .serializers import (
    GenreSerializer, LanguageSerializer, CitySerializer, TheaterSerializer, ScreenSerializer,
    MovieListSerializer, MovieDetailSerializer, ShowtimeSerializer, ReviewSerializer
)
from ticket_bookings.models import Booking
from users.models import UserProfile

class FilterOptionsAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        genres = GenreSerializer(Genre.objects.all(), many=True).data
        languages = LanguageSerializer(Language.objects.all(), many=True).data
        cities = CitySerializer(City.objects.all(), many=True).data
        theaters = TheaterSerializer(Theater.objects.all(), many=True).data
        return Response({
            'genres': genres,
            'languages': languages,
            'cities': cities,
            'theaters': theaters,
            'show_timings': [
                {'id': 'morning', 'label': 'Morning (8 AM - 12 PM)'},
                {'id': 'afternoon', 'label': 'Afternoon (12 PM - 4 PM)'},
                {'id': 'evening', 'label': 'Evening (4 PM - 8 PM)'},
                {'id': 'night', 'label': 'Night (8 PM - 12 AM)'},
            ]
        })

class CityListAPIView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = City.objects.all()
    serializer_class = CitySerializer

class CityTheatresAPIView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TheaterSerializer

    def get_queryset(self):
        city_id = self.kwargs.get('city_id')
        if str(city_id).isdigit():
            return Theater.objects.filter(city_id=city_id, active_status=True)
        return Theater.objects.filter(city__name__icontains=city_id, active_status=True)

class TheaterDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Theater.objects.filter(active_status=True)
    serializer_class = TheaterSerializer

class TheaterMoviesAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, theatre_id):
        try:
            theater = Theater.objects.get(id=theatre_id)
        except Theater.DoesNotExist:
            return Response({'error': 'Theater not found'}, status=status.HTTP_404_NOT_FOUND)

        movies = Movie.objects.filter(showtimes__screen__theater=theater).distinct()
        serialized_movies = MovieListSerializer(movies, many=True).data
        return Response(serialized_movies)

class MovieListAPIView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = MovieListSerializer

    def get_queryset(self):
        queryset = Movie.objects.annotate(
            average_rating=Avg('reviews__rating'),
            min_price=Min('showtimes__price_silver')
        ).prefetch_related('genres', 'languages')

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)

        genre = self.request.query_params.get('genre')
        if genre:
            queryset = queryset.filter(genres__id=genre)

        language = self.request.query_params.get('language')
        if language:
            queryset = queryset.filter(languages__id=language)

        city = self.request.query_params.get('city')
        if city:
            if str(city).isdigit():
                queryset = queryset.filter(showtimes__screen__theater__city__id=int(city)).distinct()
            else:
                queryset = queryset.filter(showtimes__screen__theater__city__name__icontains=city).distinct()

        theater = self.request.query_params.get('theater')
        if theater:
            queryset = queryset.filter(showtimes__screen__theater__id=theater).distinct()

        min_rating = self.request.query_params.get('rating')
        if min_rating:
            try:
                queryset = queryset.filter(average_rating__gte=float(min_rating))
            except ValueError:
                pass

        release_date = self.request.query_params.get('release_date')
        if release_date:
            queryset = queryset.filter(release_date=release_date)

        timing = self.request.query_params.get('timing')
        if timing:
            if timing == 'morning':
                queryset = queryset.filter(showtimes__start_time__hour__gte=8, showtimes__start_time__hour__lt=12)
            elif timing == 'afternoon':
                queryset = queryset.filter(showtimes__start_time__hour__gte=12, showtimes__start_time__hour__lt=16)
            elif timing == 'evening':
                queryset = queryset.filter(showtimes__start_time__hour__gte=16, showtimes__start_time__hour__lt=20)
            elif timing == 'night':
                queryset = queryset.filter(showtimes__start_time__hour__gte=20, showtimes__start_time__hour__lte=23)

        sort_by = self.request.query_params.get('sort_by', 'popularity')
        if sort_by == 'popularity':
            queryset = queryset.order_by('-popularity_score')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-release_date')
        elif sort_by == 'rating':
            queryset = queryset.order_by('-average_rating')
        elif sort_by == 'price':
            queryset = queryset.order_by('min_price')

        return queryset.distinct()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        total_count = queryset.count()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['total_matches'] = total_count
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({'results': serializer.data, 'total_matches': total_count})

class MovieDetailAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Movie.objects.annotate(average_rating=Avg('reviews__rating'))
    serializer_class = MovieDetailSerializer

    def get(self, request, *args, **kwargs):
        movie = self.get_object()
        
        if request.user.is_authenticated:
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            profile.recently_viewed.add(movie)

        similar_movies = Movie.objects.filter(
            Q(genres__in=movie.genres.all()) | Q(languages__in=movie.languages.all())
        ).exclude(id=movie.id).annotate(
            average_rating=Avg('reviews__rating'),
            min_price=Min('showtimes__price_silver')
        ).distinct()[:6]

        movie_data = self.get_serializer(movie).data
        movie_data['similar_movies'] = MovieListSerializer(similar_movies, many=True).data

        return Response(movie_data)

class ShowtimeListAPIView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ShowtimeSerializer

    def get_queryset(self):
        queryset = Showtime.objects.select_related('movie', 'screen__theater__city')
        
        movie_id = self.request.query_params.get('movie')
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)

        theatre_id = self.request.query_params.get('theatre') or self.request.query_params.get('theater')
        if theatre_id:
            queryset = queryset.filter(screen__theater_id=theatre_id)

        city = self.request.query_params.get('city')
        if city:
            if str(city).isdigit():
                queryset = queryset.filter(screen__theater__city_id=city)
            else:
                queryset = queryset.filter(screen__theater__city__name__icontains=city)

        date_str = self.request.query_params.get('date')
        if date_str:
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
                queryset = queryset.filter(start_time__date=date_obj)
            except ValueError:
                pass

        return queryset.order_by('start_time')

@method_decorator(csrf_exempt, name='dispatch')
class ReviewCreateView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request, movie_id):
        try:
            movie = Movie.objects.get(id=movie_id)
        except Movie.DoesNotExist:
            return Response({'error': 'Movie not found.'}, status=status.HTTP_404_NOT_FOUND)

        active_user = request.user if request.user.is_authenticated else User.objects.filter(username='john_doe').first()
        is_verified = Booking.objects.filter(
            user=active_user, 
            showtime__movie=movie, 
            status='CONFIRMED'
        ).exists()

        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not rating or int(rating) < 1 or int(rating) > 5:
            return Response({'error': 'Rating must be between 1 and 5.'}, status=status.HTTP_400_BAD_REQUEST)

        review, created = Review.objects.update_or_create(
            movie=movie,
            user=active_user,
            defaults={
                'rating': rating,
                'comment': comment,
                'is_verified_viewer': is_verified
            }
        )

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ReportReviewView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request, review_id):
        try:
            review = Review.objects.get(id=review_id)
            review.reported_count += 1
            if review.reported_count >= 5:
                review.is_flagged = True
            review.save()
            return Response({'message': 'Review reported successfully.', 'reported_count': review.reported_count})
        except Review.DoesNotExist:
            return Response({'error': 'Review not found.'}, status=status.HTTP_404_NOT_FOUND)

class RecommendationsAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            booked_genres = Genre.objects.filter(movies__showtimes__bookings__user=request.user, movies__showtimes__bookings__status='CONFIRMED')
            recently_viewed_genres = Genre.objects.filter(movies__viewed_by_users__user=request.user)

            preferred_genres = (booked_genres | recently_viewed_genres).distinct()

            recommended_movies = Movie.objects.filter(genres__in=preferred_genres).annotate(
                average_rating=Avg('reviews__rating'),
                min_price=Min('showtimes__price_silver')
            ).distinct().order_by('-popularity_score')[:8]
            
            if not recommended_movies.exists():
                recommended_movies = Movie.objects.annotate(
                    average_rating=Avg('reviews__rating'),
                    min_price=Min('showtimes__price_silver')
                ).order_by('-popularity_score')[:8]
        else:
            recommended_movies = Movie.objects.annotate(
                average_rating=Avg('reviews__rating'),
                min_price=Min('showtimes__price_silver')
            ).order_by('-popularity_score')[:8]

        trending = Movie.objects.annotate(
            average_rating=Avg('reviews__rating'),
            min_price=Min('showtimes__price_silver')
        ).order_by('-popularity_score')[:6]

        new_releases = Movie.objects.annotate(
            average_rating=Avg('reviews__rating'),
            min_price=Min('showtimes__price_silver')
        ).order_by('-release_date')[:6]

        return Response({
            'recommended': MovieListSerializer(recommended_movies, many=True).data,
            'trending': MovieListSerializer(trending, many=True).data,
            'new_releases': MovieListSerializer(new_releases, many=True).data,
        })

# Admin CRUD endpoints
@method_decorator(csrf_exempt, name='dispatch')
class AdminShowManageAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        movie_id = request.data.get('movie_id')
        screen_id = request.data.get('screen_id')
        start_time_str = request.data.get('start_time')
        ticket_price = request.data.get('ticket_price', 150.00)
        fmt = request.data.get('format', '2D')
        lang = request.data.get('language', 'Tamil')

        try:
            movie = Movie.objects.get(id=movie_id)
            screen = Screen.objects.get(id=screen_id)
            start_time = datetime.fromisoformat(start_time_str)
            show = Showtime.objects.create(
                movie=movie,
                screen=screen,
                start_time=start_time,
                format=fmt,
                language=lang,
                price_silver=ticket_price,
                price_gold=float(ticket_price) + 50,
                price_vip=float(ticket_price) + 100
            )
            return Response(ShowtimeSerializer(show).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, show_id):
        try:
            show = Showtime.objects.get(id=show_id)
            show.delete()
            return Response({'message': 'Show deleted successfully.'})
        except Showtime.DoesNotExist:
            return Response({'error': 'Show not found'}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class AdminMovieManageAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        movies = Movie.objects.all().order_by('-release_date')
        return Response(MovieListSerializer(movies, many=True).data)

    def post(self, request):
        title = request.data.get('title')
        description = request.data.get('description', '')
        poster_url = request.data.get('poster_url', '')
        duration_minutes = request.data.get('duration_minutes', 120)
        release_date_str = request.data.get('release_date')
        genre_id = request.data.get('genre_id')
        language_id = request.data.get('language_id')

        try:
            movie = Movie.objects.create(
                title=title,
                description=description,
                poster_url=poster_url,
                duration_minutes=duration_minutes,
                release_date=datetime.fromisoformat(release_date_str).date() if release_date_str else timezone.now().date(),
                slug=title.lower().replace(' ', '-')
            )
            if genre_id:
                try:
                    genre = Genre.objects.get(id=genre_id)
                    movie.genres.add(genre)
                except Genre.DoesNotExist:
                    pass
            if language_id:
                try:
                    lang = Language.objects.get(id=language_id)
                    movie.languages.add(lang)
                except Language.DoesNotExist:
                    pass
            return Response(MovieListSerializer(movie).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, movie_id):
        try:
            movie = Movie.objects.get(id=movie_id)
            movie.delete()
            return Response({'message': 'Movie deleted successfully.'})
        except Movie.DoesNotExist:
            return Response({'error': 'Movie not found'}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class AdminTheaterManageAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        theaters = Theater.objects.all()
        return Response(TheaterSerializer(theaters, many=True).data)

    def post(self, request):
        name = request.data.get('name')
        city_id = request.data.get('city_id')
        address = request.data.get('address', '')
        screens = request.data.get('screens', 1)

        try:
            city = City.objects.get(id=city_id)
            theater = Theater.objects.create(
                name=name,
                city=city,
                address=address,
                total_screens=screens
            )
            # Create default screen
            Screen.objects.create(
                theater=theater,
                name="Screen 1",
                total_seats=100
            )
            return Response(TheaterSerializer(theater).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, theater_id):
        try:
            theater = Theater.objects.get(id=theater_id)
            theater.delete()
            return Response({'message': 'Theater deleted successfully.'})
        except Theater.DoesNotExist:
            return Response({'error': 'Theater not found'}, status=status.HTTP_404_NOT_FOUND)
