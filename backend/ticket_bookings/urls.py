from django.urls import path
from .views import (
    ShowtimeSeatLayoutAPIView, ReserveSeatsAPIView, ReleaseSeatsAPIView,
    CreateBookingCheckoutAPIView, UserBookingHistoryAPIView, AdminBookingListAPIView, DownloadTicketPDFView
)

urlpatterns = [
    path('showtimes/<int:showtime_id>/seats/', ShowtimeSeatLayoutAPIView.as_view(), name='showtime-seats'),
    path('seats/reserve/', ReserveSeatsAPIView.as_view(), name='seats-reserve'),
    path('seats/release/', ReleaseSeatsAPIView.as_view(), name='seats-release'),
    path('bookings/checkout/', CreateBookingCheckoutAPIView.as_view(), name='booking-checkout'),
    path('bookings/my/', UserBookingHistoryAPIView.as_view(), name='user-bookings'),
    path('admin/bookings/', AdminBookingListAPIView.as_view(), name='admin-bookings'),
    path('bookings/<str:booking_id>/download-ticket/', DownloadTicketPDFView.as_view(), name='download-ticket'),
]
