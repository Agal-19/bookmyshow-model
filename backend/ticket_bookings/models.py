import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

class Seat(models.Model):
    SEAT_TYPES = [
        ('SILVER', 'Silver Tier'),
        ('GOLD', 'Gold Tier'),
        ('VIP', 'VIP Recliner'),
    ]

    screen = models.ForeignKey('movies.Screen', on_delete=models.CASCADE, related_name='seats')
    row_name = models.CharField(max_length=5) # e.g. A, B, C, D, E
    seat_number = models.IntegerField()     # e.g. 1 to 10
    seat_type = models.CharField(max_length=10, choices=SEAT_TYPES, default='GOLD')

    class Meta:
        unique_together = ('screen', 'row_name', 'seat_number')
        ordering = ['row_name', 'seat_number']

    def __str__(self):
        return f"{self.screen} - Seat {self.row_name}{self.seat_number} ({self.seat_type})"

class SeatReservation(models.Model):
    STATUS_CHOICES = [
        ('HELD', 'Temporarily Held'),
        ('BOOKED', 'Confirmed Booked'),
    ]

    showtime = models.ForeignKey('movies.Showtime', on_delete=models.CASCADE, related_name='seat_reservations')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='reservations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='seat_reservations')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='HELD')
    held_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        unique_together = ('showtime', 'seat')
        indexes = [
            models.Index(fields=['expires_at', 'status']),
        ]

    def is_expired(self):
        if self.status == 'BOOKED':
            return False
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.seat.row_name}{self.seat.seat_number} - {self.status} for Showtime {self.showtime.id}"

class Booking(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending Payment'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('FAILED', 'Failed'),
    ]

    booking_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    showtime = models.ForeignKey('movies.Showtime', on_delete=models.CASCADE, related_name='bookings')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    payment_reference = models.CharField(max_length=100, blank=True, null=True)
    qr_code_file = models.FileField(upload_to='qr_codes/', blank=True, null=True)
    pdf_ticket_file = models.FileField(upload_to='tickets/', blank=True, null=True)
    email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Booking #{self.booking_id} ({self.status}) - {self.user.username}"

class BookingSeat(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='booked_seats')
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    seat_type = models.CharField(max_length=10)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.booking.booking_id} - Seat {self.seat.row_name}{self.seat.seat_number}"
