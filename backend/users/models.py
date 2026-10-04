from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True, null=True)
    preferred_city = models.CharField(max_length=100, default='Mumbai')
    avatar_url = models.URLField(max_length=500, blank=True, null=True)
    recently_viewed = models.ManyToManyField('movies.Movie', blank=True, related_name='viewed_by_users')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
