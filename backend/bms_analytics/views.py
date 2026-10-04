import csv
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Sum, Count, Avg, F, Q
from django.db.models.functions import TruncDate, TruncHour, TruncMonth
from django.utils import timezone
from datetime import datetime, timedelta

from ticket_bookings.models import Booking, BookingSeat
from movies.models import Theater, Movie, Showtime, Screen
from ticket_payments.models import Transaction
from django.contrib.auth.models import User

class AdminDashboardAnalyticsAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        
        # Date range filtering
        start_date_param = request.query_params.get('start_date')
        end_date_param = request.query_params.get('end_date')

        if start_date_param:
            try:
                start_date = datetime.strptime(start_date_param, '%Y-%m-%d')
            except ValueError:
                start_date = now - timedelta(days=30)
        else:
            start_date = now - timedelta(days=30)

        if end_date_param:
            try:
                end_date = datetime.strptime(end_date_param, '%Y-%m-%d') + timedelta(days=1)
            except ValueError:
                end_date = now
        else:
            end_date = now

        confirmed_bookings = Booking.objects.filter(
            status='CONFIRMED', 
            created_at__gte=start_date, 
            created_at__lte=end_date
        )

        # 1. Total Revenue Breakdown
        total_revenue = confirmed_bookings.aggregate(val=Sum('total_amount'))['val'] or 0.0

        daily_revenue = Booking.objects.filter(
            status='CONFIRMED', 
            created_at__date=now.date()
        ).aggregate(val=Sum('total_amount'))['val'] or 0.0

        weekly_revenue = Booking.objects.filter(
            status='CONFIRMED', 
            created_at__gte=now - timedelta(days=7)
        ).aggregate(val=Sum('total_amount'))['val'] or 0.0

        monthly_revenue = Booking.objects.filter(
            status='CONFIRMED', 
            created_at__gte=now - timedelta(days=30)
        ).aggregate(val=Sum('total_amount'))['val'] or 0.0

        yearly_revenue = Booking.objects.filter(
            status='CONFIRMED', 
            created_at__gte=now - timedelta(days=365)
        ).aggregate(val=Sum('total_amount'))['val'] or 0.0

        # 2. Booking Trends (Daily)
        booking_trends = confirmed_bookings.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total_bookings=Count('id'),
            revenue=Sum('total_amount')
        ).order_by('date')

        # 3. Most Booked Movies
        top_movies = Movie.objects.filter(
            showtimes__bookings__status='CONFIRMED',
            showtimes__bookings__created_at__gte=start_date,
            showtimes__bookings__created_at__lte=end_date
        ).annotate(
            tickets_sold=Count('showtimes__bookings__booked_seats'),
            revenue=Sum('showtimes__bookings__total_amount')
        ).order_by('-tickets_sold')[:5]

        top_movies_data = [
            {'title': m.title, 'tickets_sold': m.tickets_sold, 'revenue': float(m.revenue or 0)}
            for m in top_movies
        ]

        # 4. Top Performing Theaters & Occupancy Rate
        theaters = Theater.objects.all()
        theater_stats = []

        for theater in theaters:
            total_seats_capacity = Screen.objects.filter(theater=theater).aggregate(tot=Sum('total_seats'))['tot'] or 1
            booked_seats_count = BookingSeat.objects.filter(
                booking__showtime__screen__theater=theater,
                booking__status='CONFIRMED',
                booking__created_at__gte=start_date,
                booking__created_at__lte=end_date
            ).count()

            revenue = Booking.objects.filter(
                showtime__screen__theater=theater,
                status='CONFIRMED',
                created_at__gte=start_date,
                created_at__lte=end_date
            ).aggregate(val=Sum('total_amount'))['val'] or 0.0

            # Calculate occupancy percentage (booked seats vs screen capacity * showtimes)
            showtime_count = Showtime.objects.filter(screen__theater=theater).count() or 1
            max_capacity = total_seats_capacity * showtime_count
            occupancy_pct = round((booked_seats_count / max_capacity) * 100, 2) if max_capacity > 0 else 0

            theater_stats.append({
                'id': theater.id,
                'name': theater.name,
                'city': theater.city.name,
                'revenue': float(revenue),
                'booked_seats': booked_seats_count,
                'occupancy_pct': min(occupancy_pct, 100.0)
            })

        theater_stats = sorted(theater_stats, key=lambda x: x['revenue'], reverse=True)[:5]

        # 5. Peak Booking Hours
        peak_hours = confirmed_bookings.annotate(
            hour=TruncHour('created_at')
        ).values('hour').annotate(
            booking_count=Count('id')
        ).order_by('-booking_count')[:6]

        peak_hours_data = [
            {'hour': ph['hour'].strftime('%H:00') if ph['hour'] else '00:00', 'count': ph['booking_count']}
            for ph in peak_hours
        ]

        # 6. Cancellation & Refund Statistics
        total_bookings_count = Booking.objects.filter(created_at__gte=start_date, created_at__lte=end_date).count() or 1
        cancelled_count = Booking.objects.filter(status='CANCELLED', created_at__gte=start_date, created_at__lte=end_date).count()
        failed_count = Booking.objects.filter(status='FAILED', created_at__gte=start_date, created_at__lte=end_date).count()
        refunded_amount = Transaction.objects.filter(status='REFUNDED', created_at__gte=start_date, created_at__lte=end_date).aggregate(val=Sum('amount'))['val'] or 0.0

        cancellation_rate = round((cancelled_count / total_bookings_count) * 100, 2)

        # 7. User Growth Metrics
        user_growth = User.objects.filter(
            date_joined__gte=start_date,
            date_joined__lte=end_date
        ).annotate(date=TruncDate('date_joined')).values('date').annotate(new_users=Count('id')).order_by('date')

        return Response({
            'revenue_summary': {
                'total_revenue': float(total_revenue),
                'daily_revenue': float(daily_revenue),
                'weekly_revenue': float(weekly_revenue),
                'monthly_revenue': float(monthly_revenue),
                'yearly_revenue': float(yearly_revenue),
            },
            'booking_trends': list(booking_trends),
            'top_movies': top_movies_data,
            'top_theaters': theater_stats,
            'peak_hours': peak_hours_data,
            'cancellation_stats': {
                'total_bookings': total_bookings_count,
                'cancelled_count': cancelled_count,
                'failed_count': failed_count,
                'cancellation_rate_pct': cancellation_rate,
                'refunded_amount': float(refunded_amount),
            },
            'user_growth': list(user_growth),
            'date_range': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d')
            }
        })

class ExportAnalyticsCSVAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="bookmyshow_analytics_report.csv"'

        writer = csv.writer(response)
        writer.writerow(['Booking ID', 'User', 'Movie', 'Theater', 'Show Time', 'Amount', 'Status', 'Booking Date'])

        bookings = Booking.objects.select_related('user', 'showtime__movie', 'showtime__screen__theater').all().order_by('-created_at')
        for b in bookings:
            writer.writerow([
                b.booking_id,
                b.user.username,
                b.showtime.movie.title,
                b.showtime.screen.theater.name,
                b.showtime.start_time.strftime('%Y-%m-%d %H:%M'),
                b.total_amount,
                b.status,
                b.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])

        return response
