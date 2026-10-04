from django.db import models

class Transaction(models.Model):
    GATEWAY_CHOICES = [
        ('STRIPE', 'Stripe Payments'),
        ('RAZORPAY', 'Razorpay'),
        ('MOCK', 'Mock Gateway'),
    ]

    STATUS_CHOICES = [
        ('INITIATED', 'Initiated'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
    ]

    booking = models.ForeignKey('ticket_bookings.Booking', on_delete=models.CASCADE, related_name='transactions')
    transaction_id = models.CharField(max_length=100, unique=True, db_index=True)
    payment_gateway = models.CharField(max_length=20, choices=GATEWAY_CHOICES, default='MOCK')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='INR')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='INITIATED', db_index=True)
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Txn {self.transaction_id} - {self.status} ({self.amount} {self.currency})"
