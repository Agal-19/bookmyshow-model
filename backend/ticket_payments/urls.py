from django.urls import path
from .views import UserPaymentHistoryAPIView, WebhookVerificationAPIView

urlpatterns = [
    path('payments/my/', UserPaymentHistoryAPIView.as_view(), name='user-payments'),
    path('payments/webhook/', WebhookVerificationAPIView.as_view(), name='payments-webhook'),
]
