from django.urls import path
from .views import RegisterAPIView, LoginAPIView, LogoutAPIView, UserProfileAPIView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='user-register'),
    path('login/', LoginAPIView.as_view(), name='user-login'),
    path('logout/', LogoutAPIView.as_view(), name='user-logout'),
    path('profile/', UserProfileAPIView.as_view(), name='user-profile'),
]
