import os
import qrcode
from io import BytesIO
from django.core.files.base import ContentFile
from django.conf import settings
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def generate_qr_code(booking_id):
    """
    Generates a QR Code image for ticket verification.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=8,
        border=2,
    )
    qr.add_data(f"BMS-VERIFY:{booking_id}")
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return ContentFile(buffer.getvalue(), name=f"qr_{booking_id}.png")

def generate_pdf_ticket(booking):
    """
    Generates a professional PDF ticket using ReportLab.
    """
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Title & Header
    p.setFillColor(colors.HexColor("#E50914")) # BookMyShow Red
    p.rect(0, height - 80, width, 80, fill=True, stroke=False)

    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 24)
    p.drawString(40, height - 50, "BookMyShow - Official E-Ticket")
    
    p.setFont("Helvetica", 12)
    p.drawString(width - 200, height - 50, f"Booking ID: #{booking.booking_id[:8]}")

    # Ticket Content Box
    p.setFillColor(colors.HexColor("#1A1A2E"))
    p.rect(30, height - 380, width - 60, 280, fill=True, stroke=False)

    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 18)
    p.drawString(50, height - 120, booking.showtime.movie.title)

    p.setFont("Helvetica", 12)
    p.drawString(50, height - 145, f"Format: {booking.showtime.screen.screen_type} | Duration: {booking.showtime.movie.duration_minutes} mins | Age: {booking.showtime.movie.age_rating}")
    
    p.setStrokeColor(colors.HexColor("#333355"))
    p.line(50, height - 160, width - 50, height - 160)

    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, height - 185, "Theater & Screen:")
    p.setFont("Helvetica", 12)
    p.drawString(180, height - 185, f"{booking.showtime.screen.theater.name}, {booking.showtime.screen.name}")

    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, height - 210, "Show Timing:")
    p.setFont("Helvetica", 12)
    p.drawString(180, height - 210, booking.showtime.start_time.strftime("%A, %b %d, %Y at %I:%M %p"))

    # Seats
    seats_list = ", ".join([f"{bs.seat.row_name}{bs.seat.seat_number}" for bs in booking.booked_seats.all()])
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, height - 235, "Booked Seats:")
    p.setFillColor(colors.HexColor("#00E676")) # Neon Green
    p.setFont("Helvetica-Bold", 14)
    p.drawString(180, height - 235, seats_list)

    p.setFillColor(colors.white)
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, height - 260, "Payment Reference:")
    p.setFont("Helvetica", 12)
    p.drawString(180, height - 260, str(booking.payment_reference or "N/A"))

    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, height - 285, "Total Amount Paid:")
    p.setFont("Helvetica-Bold", 14)
    p.drawString(180, height - 285, f"INR {booking.total_amount}")

    # Instructions & Verification
    p.setFillColor(colors.HexColor("#666688"))
    p.setFont("Helvetica-Oblique", 10)
    p.drawString(50, height - 340, "Please present this e-ticket or show the QR Code at the cinema entrance.")
    p.drawString(50, height - 355, "Tickets once booked cannot be exchanged or refunded.")

    # QR Code placeholder / info
    p.setFillColor(colors.HexColor("#E50914"))
    p.rect(width - 150, height - 340, 100, 100, fill=False, stroke=True)
    p.setFont("Helvetica-Bold", 10)
    p.drawString(width - 140, height - 295, "SCAN QR CODE")

    p.showPage()
    p.save()

    return ContentFile(buffer.getvalue(), name=f"ticket_{booking.booking_id}.pdf")
