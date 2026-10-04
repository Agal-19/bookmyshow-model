from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(source='booking.booking_id', read_only=True)
    movie_title = serializers.CharField(source='booking.showtime.movie.title', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'booking_id', 'movie_title', 'transaction_id', 
            'payment_gateway', 'amount', 'currency', 'status', 
            'created_at'
        ]
