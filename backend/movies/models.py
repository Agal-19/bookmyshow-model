from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Genre(models.Model):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Language(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name

class City(models.Model):
    name = models.CharField(max_length=100, unique=True)
    state = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "Cities"

    def __str__(self):
        return f"{self.name}, {self.state}"

class Theater(models.Model):
    name = models.CharField(max_length=150)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='theaters')
    address = models.TextField()
    total_screens = models.IntegerField(default=1)
    latitude = models.FloatField(blank=True, null=True, default=0.0)
    longitude = models.FloatField(blank=True, null=True, default=0.0)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    facilities = models.JSONField(default=list, blank=True) # e.g. ["Dolby Atmos", "Parking", "Food & Beverages"]
    active_status = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.city.name}"

class Screen(models.Model):
    SCREEN_TYPES = [
        ('2D', 'Standard 2D'),
        ('3D', 'RealD 3D'),
        ('IMAX', 'IMAX 3D'),
        ('4DX', '4DX Motion'),
        ('Dolby Atmos', 'Dolby Atmos'),
    ]
    name = models.CharField(max_length=50) # e.g., Screen 1, Audi 2
    theater = models.ForeignKey(Theater, on_delete=models.CASCADE, related_name='screens')
    screen_type = models.CharField(max_length=20, choices=SCREEN_TYPES, default='2D')
    total_seats = models.IntegerField(default=60)

    def __str__(self):
        return f"{self.theater.name} - {self.name} ({self.screen_type})"

class Movie(models.Model):
    AGE_RATINGS = [
        ('U', 'Universal'),
        ('UA', 'Parental Guidance 12+'),
        ('A', 'Adults Only 18+'),
        ('R', 'Restricted'),
    ]

    title = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    director = models.CharField(max_length=150, blank=True, null=True, default='Unknown Director')
    poster_url = models.URLField(max_length=500)
    backdrop_url = models.URLField(max_length=500, blank=True, null=True)
    youtube_trailer_url = models.URLField(max_length=500, blank=True, null=True)
    youtube_trailer_id = models.CharField(max_length=50, blank=True, null=True) # e.g. "dQw4w9WgXcQ"
    duration_minutes = models.IntegerField()
    age_rating = models.CharField(max_length=5, choices=AGE_RATINGS, default='UA')
    release_date = models.DateField(db_index=True)
    popularity_score = models.FloatField(default=0.0, db_index=True)
    status = models.CharField(max_length=20, default='NOW_SHOWING')
    genres = models.ManyToManyField(Genre, related_name='movies')
    languages = models.ManyToManyField(Language, related_name='movies')
    cast_members = models.JSONField(default=list, blank=True) # e.g. [{"name": "Actor", "role": "Hero"}]
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['title', 'release_date']),
            models.Index(fields=['popularity_score']),
        ]

    def __str__(self):
        return self.title

class Showtime(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='showtimes')
    screen = models.ForeignKey(Screen, on_delete=models.CASCADE, related_name='showtimes')
    start_time = models.DateTimeField(db_index=True)
    format = models.CharField(max_length=20, default='2D') # 2D, 3D, IMAX, 4DX, Dolby Atmos
    language = models.CharField(max_length=50, default='Tamil')
    price_silver = models.DecimalField(max_digits=8, decimal_places=2, default=150.00)
    price_gold = models.DecimalField(max_digits=8, decimal_places=2, default=200.00)
    price_vip = models.DecimalField(max_digits=8, decimal_places=2, default=300.00)

    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['start_time']),
        ]

    def __str__(self):
        return f"{self.movie.title} @ {self.screen.theater.name} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"

class Review(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    is_verified_viewer = models.BooleanField(default=False)
    reported_count = models.IntegerField(default=0)
    is_flagged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('movie', 'user')

    def __str__(self):
        return f"{self.user.username} review for {self.movie.title} ({self.rating}/5)"
