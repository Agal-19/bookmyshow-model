from django.urls import path
from .views import AdminDashboardAnalyticsAPIView, ExportAnalyticsCSVAPIView

urlpatterns = [
    path('analytics/dashboard/', AdminDashboardAnalyticsAPIView.as_view(), name='admin-dashboard'),
    path('analytics/export-csv/', ExportAnalyticsCSVAPIView.as_view(), name='export-analytics-csv'),
]
