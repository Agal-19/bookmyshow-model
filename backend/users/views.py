from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .serializers import UserSerializer, RegisterSerializer

@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({
                'message': 'Login successful.',
                'user': UserSerializer(user).data
            })
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        logout(request)
        return Response({'message': 'Logged out successfully.'})

@method_decorator(csrf_exempt, name='dispatch')
class UserProfileAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response(UserSerializer(request.user).data)
        demo_user = User.objects.filter(username='john_doe').first() or User.objects.first()
        return Response(UserSerializer(demo_user).data)
