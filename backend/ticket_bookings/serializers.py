from rest_framework import serializers
from .models import Seat, SeatReservation, Booking, BookingSeat
from movies.serializers import ShowtimeSerializer

class SeatSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True, default='AVAILABLE')
    expires_in_seconds = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Seat
        fields = ['id', 'row_name', 'seat_number', 'seat_type', 'status', 'expires_in_seconds']

class BookingSeatSerializer(serializers.ModelSerializer):
    row_name = serializers.CharField(source='seat.row_name', read_only=True)
    seat_number = serializers.IntegerField(source='seat.seat_number', read_only=True)

    class Meta:
        model = BookingSeat
        fields = ['id', 'seat', 'row_name', 'seat_number', 'seat_type', 'price']

class BookingSerializer(serializers.ModelSerializer):
    showtime = ShowtimeSerializer(read_only=True)
    booked_seats = BookingSeatSerializer(many=True, read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'showtime', 'total_amount', 
            'status', 'payment_reference', 'qr_code_file', 
            'pdf_ticket_file', 'email_sent', 'created_at', 'booked_seats'
        ]

class AdminBookingSerializer(serializers.ModelSerializer):
    showtime = ShowtimeSerializer(read_only=True)
    booked_seats = BookingSeatSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='user.username', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'booking_id', 'customer_name', 'customer_email', 'showtime', 'total_amount', 
            'status', 'payment_reference', 'qr_code_file', 
            'pdf_ticket_file', 'email_sent', 'created_at', 'booked_seats'
        ]
