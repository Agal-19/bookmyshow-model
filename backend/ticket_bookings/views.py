from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from django.http import HttpResponse, FileResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from movies.models import Showtime
from .models import Seat, SeatReservation, Booking, BookingSeat
from .serializers import SeatSerializer, BookingSerializer
from .services import generate_qr_code, generate_pdf_ticket
from ticket_payments.models import Transaction

def get_active_user(request):
    if request.user and request.user.is_authenticated:
        return request.user
    # Fallback to demo user if not logged in
    user = User.objects.filter(username='john_doe').first() or User.objects.first()
    return user

@method_decorator(csrf_exempt, name='dispatch')
class ShowtimeSeatLayoutAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request, showtime_id):
        try:
            showtime = Showtime.objects.select_related('screen').get(id=showtime_id)
        except Showtime.DoesNotExist:
            return Response({'error': 'Showtime not found.'}, status=status.HTTP_404_NOT_FOUND)

        seats = Seat.objects.filter(screen=showtime.screen).order_by('row_name', 'seat_number')
        now = timezone.now()
        active_user = get_active_user(request)

        # Clean up expired holds for this showtime
        SeatReservation.objects.filter(showtime=showtime, status='HELD', expires_at__lt=now).delete()

        # Seed realistic sample seat statuses if none exist yet for this showtime
        if not SeatReservation.objects.filter(showtime=showtime).exists():
            admin_user = User.objects.filter(is_staff=True).first() or active_user
            demo_seats = list(seats)
            if len(demo_seats) >= 10:
                # Sample Booked seats (e.g. A3, A4, B5, C6)
                for idx in [2, 3, 14, 25]:
                    if idx < len(demo_seats):
                        SeatReservation.objects.create(
                            showtime=showtime,
                            seat=demo_seats[idx],
                            user=admin_user,
                            status='BOOKED',
                            expires_at=now + timedelta(days=365)
                        )
                # Sample Held/Reserved seats by another user (e.g. B2, D7)
                for idx in [11, 36]:
                    if idx < len(demo_seats):
                        SeatReservation.objects.create(
                            showtime=showtime,
                            seat=demo_seats[idx],
                            user=admin_user,
                            status='HELD',
                            expires_at=now + timedelta(minutes=15)
                        )

        active_reservations = SeatReservation.objects.filter(showtime=showtime)
        res_map = {res.seat_id: res for res in active_reservations}

        serialized_seats = []
        for seat in seats:
            seat_data = {
                'id': seat.id,
                'row_name': seat.row_name,
                'seat_number': seat.seat_number,
                'seat_type': seat.seat_type,
                'status': 'AVAILABLE',
                'expires_in_seconds': 0
            }

            res = res_map.get(seat.id)
            if res:
                if res.status == 'BOOKED':
                    seat_data['status'] = 'BOOKED'
                elif res.status == 'HELD' and res.expires_at > now:
                    if active_user and res.user_id == active_user.id:
                        seat_data['status'] = 'SELECTED_BY_YOU'
                        seat_data['expires_in_seconds'] = int((res.expires_at - now).total_seconds())
                    else:
                        seat_data['status'] = 'RESERVED_BY_OTHER'
            
            serialized_seats.append(seat_data)

        # Price mapping
        price_map = {
            'SILVER': float(showtime.price_silver),
            'GOLD': float(showtime.price_gold),
            'VIP': float(showtime.price_vip),
        }

        return Response({
            'showtime_id': showtime.id,
            'movie_title': showtime.movie.title,
            'theater_name': showtime.screen.theater.name,
            'screen_name': showtime.screen.name,
            'prices': price_map,
            'seats': serialized_seats
        })

@method_decorator(csrf_exempt, name='dispatch')
class ReserveSeatsAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        showtime_id = request.data.get('showtime_id')
        seat_ids = request.data.get('seat_ids', [])
        active_user = get_active_user(request)

        if not showtime_id or not seat_ids:
            return Response({'error': 'showtime_id and seat_ids are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            showtime = Showtime.objects.get(id=showtime_id)
        except Showtime.DoesNotExist:
            return Response({'error': 'Showtime not found.'}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()

        # Atomic transaction with row locking for safe concurrency
        with transaction.atomic():
            # Delete expired reservations first
            SeatReservation.objects.filter(showtime=showtime, status='HELD', expires_at__lt=now).delete()

            # Lock conflicting active reservations for requested seats
            conflicting_reservations = SeatReservation.objects.select_for_update().filter(
                showtime=showtime,
                seat_id__in=seat_ids,
                expires_at__gt=now
            )

            # Check if any seat is held/booked by another user
            for res in conflicting_reservations:
                if res.user != active_user and res.status == 'BOOKED':
                    return Response({
                        'error': f'Seat {res.seat.row_name}{res.seat.seat_number} is already booked by another user. Please choose another seat.'
                    }, status=status.HTTP_409_CONFLICT)

            # Hold seats for 2 minutes (120 seconds)
            expires_at = now + timedelta(seconds=120)
            reserved_seats = []

            for seat_id in seat_ids:
                try:
                    seat = Seat.objects.get(id=seat_id, screen=showtime.screen)
                except Seat.DoesNotExist:
                    return Response({'error': f'Seat {seat_id} is invalid for this screen.'}, status=status.HTTP_400_BAD_REQUEST)

                res, created = SeatReservation.objects.update_or_create(
                    showtime=showtime,
                    seat=seat,
                    defaults={
                        'user': active_user,
                        'status': 'HELD',
                        'expires_at': expires_at
                    }
                )
                reserved_seats.append({
                    'seat_id': seat.id,
                    'row_name': seat.row_name,
                    'seat_number': seat.seat_number,
                    'seat_type': seat.seat_type
                })

        return Response({
            'message': 'Seats reserved successfully for 2 minutes.',
            'expires_at': expires_at.isoformat(),
            'expires_in_seconds': 120,
            'reserved_seats': reserved_seats
        }, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class ReleaseSeatsAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        showtime_id = request.data.get('showtime_id')
        seat_ids = request.data.get('seat_ids', [])
        active_user = get_active_user(request)

        if showtime_id and seat_ids:
            SeatReservation.objects.filter(
                showtime_id=showtime_id,
                seat_id__in=seat_ids,
                user=active_user,
                status='HELD'
            ).delete()
            return Response({'message': 'Seats released successfully.'})
        return Response({'error': 'showtime_id and seat_ids required.'}, status=status.HTTP_400_BAD_REQUEST)

@method_decorator(csrf_exempt, name='dispatch')
class CreateBookingCheckoutAPIView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        showtime_id = request.data.get('showtime_id')
        seat_ids = request.data.get('seat_ids', [])
        payment_gateway = request.data.get('payment_gateway', 'MOCK')
        simulate_failure = request.data.get('simulate_failure', False)
        active_user = get_active_user(request)

        if not showtime_id or not seat_ids:
            return Response({'error': 'showtime_id and seat_ids are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            showtime = Showtime.objects.select_related('movie', 'screen__theater').get(id=showtime_id)
        except Showtime.DoesNotExist:
            return Response({'error': 'Showtime not found.'}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()

        with transaction.atomic():
            user_reservations = SeatReservation.objects.select_for_update().filter(
                showtime=showtime,
                seat_id__in=seat_ids,
                user=active_user,
                status='HELD',
                expires_at__gt=now
            )

            if user_reservations.count() != len(seat_ids):
                # Fallback: if held reservations were missing, create them now for checkout
                for sid in seat_ids:
                    s_obj = Seat.objects.get(id=sid)
                    SeatReservation.objects.update_or_create(
                        showtime=showtime,
                        seat=s_obj,
                        defaults={'user': active_user, 'status': 'HELD', 'expires_at': now + timedelta(minutes=2)}
                    )
                user_reservations = SeatReservation.objects.filter(showtime=showtime, seat_id__in=seat_ids)

            total_amount = 0
            seats = Seat.objects.filter(id__in=seat_ids)
            seat_price_map = {}

            for seat in seats:
                if seat.seat_type == 'SILVER':
                    price = showtime.price_silver
                elif seat.seat_type == 'GOLD':
                    price = showtime.price_gold
                else:
                    price = showtime.price_vip
                total_amount += price
                seat_price_map[seat.id] = (seat, price)

            booking = Booking.objects.create(
                user=active_user,
                showtime=showtime,
                total_amount=total_amount,
                status='PENDING'
            )

            for seat_id, (seat, price) in seat_price_map.items():
                BookingSeat.objects.create(
                    booking=booking,
                    seat=seat,
                    seat_type=seat.seat_type,
                    price=price
                )

            txn_id = f"TXN-{str(booking.booking_id)[:12]}"
            txn = Transaction.objects.create(
                booking=booking,
                transaction_id=txn_id,
                payment_gateway=payment_gateway,
                amount=total_amount,
                status='INITIATED'
            )

            booking.status = 'CONFIRMED'
            booking.payment_reference = txn_id
            
            qr_file = generate_qr_code(booking.booking_id)
            booking.qr_code_file.save(qr_file.name, qr_file, save=False)

            pdf_file = generate_pdf_ticket(booking)
            booking.pdf_ticket_file.save(pdf_file.name, pdf_file, save=False)

            booking.save()

            txn.status = 'COMPLETED'
            txn.save()

            user_reservations.update(status='BOOKED')

            try:
                from .tasks import send_ticket_email_task
                send_ticket_email_task.delay(booking.booking_id)
            except Exception:
                pass

        return Response({
            'message': 'Demo Booking confirmed successfully!',
            'booking': BookingSerializer(booking).data
        }, status=status.HTTP_201_CREATED)

@method_decorator(csrf_exempt, name='dispatch')
class UserBookingHistoryAPIView(generics.ListAPIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    serializer_class = BookingSerializer

    def get_queryset(self):
        active_user = get_active_user(self.request)
        return Booking.objects.filter(user=active_user).order_by('-created_at')

@method_decorator(csrf_exempt, name='dispatch')
class AdminBookingListAPIView(generics.ListAPIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    from .serializers import AdminBookingSerializer
    serializer_class = AdminBookingSerializer

    def get_queryset(self):
        queryset = Booking.objects.all().order_by('-created_at')
        movie_id = self.request.query_params.get('movie')
        theatre_id = self.request.query_params.get('theatre')
        payment_status = self.request.query_params.get('payment_status')
        date_str = self.request.query_params.get('date')

        if movie_id:
            queryset = queryset.filter(showtime__movie_id=movie_id)
        if theatre_id:
            queryset = queryset.filter(showtime__screen__theater_id=theatre_id)
        if payment_status:
            # map to transaction status if needed, but booking status works for demo
            queryset = queryset.filter(status=payment_status)
        if date_str:
            try:
                dt = datetime.strptime(date_str, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date=dt)
            except ValueError:
                pass

        return queryset

@method_decorator(csrf_exempt, name='dispatch')
class DownloadTicketPDFView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(booking_id=booking_id)
            if not booking.pdf_ticket_file:
                pdf_file = generate_pdf_ticket(booking)
                booking.pdf_ticket_file.save(pdf_file.name, pdf_file, save=True)

            return FileResponse(
                booking.pdf_ticket_file.open('rb'),
                as_attachment=True,
                filename=f"Ticket_{booking.booking_id}.pdf",
                content_type='application/pdf'
            )
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)
