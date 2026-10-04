import logging
from celery import shared_task
from django.core.mail import EmailMessage
from django.conf import settings
from .models import Booking

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def send_ticket_email_task(self, booking_id):
    """
    Celery async task for sending ticket confirmation email with PDF attachment.
    Retries up to 3 times automatically on failure.
    """
    try:
        booking = Booking.objects.get(booking_id=booking_id)
        if not booking.user.email:
            logger.info(f"User {booking.user.username} has no email address. Skipping email dispatch.")
            return False

        subject = f"Your BookMyShow E-Ticket: {booking.showtime.movie.title}"
        body = (
            f"Hi {booking.user.username},\n\n"
            f"Thank you for booking with BookMyShow!\n\n"
            f"Movie: {booking.showtime.movie.title}\n"
            f"Theater: {booking.showtime.screen.theater.name}\n"
            f"Show Time: {booking.showtime.start_time.strftime('%Y-%m-%d %H:%M')}\n"
            f"Seats: {', '.join([f'{bs.seat.row_name}{bs.seat.seat_number}' for bs in booking.booked_seats.all()])}\n"
            f"Booking ID: {booking.booking_id}\n\n"
            f"Enjoy your movie!"
        )

        email = EmailMessage(
            subject=subject,
            body=body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@bookmyshow.com'),
            to=[booking.user.email]
        )

        if booking.pdf_ticket_file:
            email.attach(
                filename=f"Ticket_{booking.booking_id}.pdf",
                content=booking.pdf_ticket_file.read(),
                mimetype="application/pdf"
            )

        email.send(fail_silently=False)
        booking.email_sent = True
        booking.save(update_fields=['email_sent'])
        logger.info(f"Successfully sent ticket email for booking {booking_id}")
        return True

    except Exception as exc:
        logger.error(f"Failed to send email for booking {booking_id}: {exc}")
        try:
            raise self.retry(exc=exc)
        except Exception:
            # Fallback if retry limit reached
            return False
