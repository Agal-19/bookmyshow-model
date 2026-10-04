from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Transaction
from .serializers import TransactionSerializer
from ticket_bookings.models import Booking, SeatReservation

class UserPaymentHistoryAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(booking__user=self.request.user).order_by('-created_at')

class WebhookVerificationAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.data
        event_type = payload.get('type', 'payment_intent.succeeded')
        data_object = payload.get('data', {}).get('object', {})
        
        transaction_id = data_object.get('id') or payload.get('transaction_id')

        if not transaction_id:
            return Response({'error': 'transaction_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                txn = Transaction.objects.select_for_update().get(transaction_id=transaction_id)
                booking = txn.booking

                # Idempotency check: duplicate webhook call protection
                if txn.status == 'SUCCESS' and booking.status == 'CONFIRMED':
                    return Response({'message': 'Payment already processed and booking confirmed.'}, status=status.HTTP_200_OK)

                if event_type in ['payment_intent.succeeded', 'checkout.session.completed', 'payment.success']:
                    txn.status = 'SUCCESS'
                    booking.status = 'CONFIRMED'
                    booking.save()

                    # Confirm seat reservations
                    SeatReservation.objects.filter(
                        showtime=booking.showtime,
                        seat_id__in=booking.booked_seats.values_list('seat_id', flat=True)
                    ).update(status='BOOKED')

                elif event_type in ['payment_intent.payment_failed', 'payment.failed']:
                    txn.status = 'FAILED'
                    booking.status = 'FAILED'
                    booking.save()

                    # Auto-release reserved seats
                    SeatReservation.objects.filter(
                        showtime=booking.showtime,
                        seat_id__in=booking.booked_seats.values_list('seat_id', flat=True),
                        status='HELD'
                    ).delete()

                txn.raw_response = payload
                txn.save()

            return Response({'message': f'Webhook processed successfully. Status: {txn.status}'})
        except Transaction.DoesNotExist:
            return Response({'error': 'Transaction not found.'}, status=status.HTTP_404_NOT_FOUND)
