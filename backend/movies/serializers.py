from rest_framework import serializers
from .models import Genre, Language, City, Theater, Screen, Movie, Showtime, Review
from django.db.models import Avg

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id', 'name', 'slug']

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'name', 'code']

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name', 'state']

class TheaterSerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source='city.name', read_only=True)
    class Meta:
        model = Theater
        fields = [
            'id', 'name', 'city', 'city_name', 'address', 
            'total_screens', 'latitude', 'longitude', 
            'contact_number', 'facilities', 'active_status'
        ]

class ScreenSerializer(serializers.ModelSerializer):
    theater_name = serializers.CharField(source='theater.name', read_only=True)
    class Meta:
        model = Screen
        fields = ['id', 'name', 'theater', 'theater_name', 'screen_type', 'total_seats']

class MovieListSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True, default=0.0)
    min_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True, default=150.00)

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'slug', 'poster_url', 'backdrop_url', 
            'duration_minutes', 'age_rating', 'release_date', 
            'popularity_score', 'genres', 'languages', 'director', 'status',
            'average_rating', 'min_price'
        ]

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'movie', 'user', 'username', 'rating', 
            'comment', 'is_verified_viewer', 'reported_count', 
            'is_flagged', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'is_verified_viewer', 'reported_count', 'is_flagged']

class MovieDetailSerializer(serializers.ModelSerializer):
    genres = GenreSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True, default=0.0)

    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'slug', 'description', 'director', 'status', 
            'poster_url', 'backdrop_url', 'youtube_trailer_url', 'youtube_trailer_id', 
            'duration_minutes', 'age_rating', 'release_date', 'popularity_score', 
            'genres', 'languages', 'cast_members', 'average_rating', 'reviews'
        ]

class ShowtimeSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='movie.title', read_only=True)
    theater_name = serializers.CharField(source='screen.theater.name', read_only=True)
    theater_id = serializers.IntegerField(source='screen.theater.id', read_only=True)
    city_name = serializers.CharField(source='screen.theater.city.name', read_only=True)
    screen_name = serializers.CharField(source='screen.name', read_only=True)
    screen_type = serializers.CharField(source='screen.screen_type', read_only=True)

    class Meta:
        model = Showtime
        fields = [
            'id', 'movie', 'movie_title', 'screen', 'screen_name', 'screen_type',
            'theater_id', 'theater_name', 'city_name', 'start_time', 'format', 'language',
            'price_silver', 'price_gold', 'price_vip'
        ]
