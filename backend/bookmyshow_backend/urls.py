import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve

frontend_dist = settings.BASE_DIR.parent / 'frontend' / 'dist'
frontend_assets = frontend_dist / 'assets'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('movies.urls')),
    path('api/', include('ticket_bookings.urls')),
    path('api/', include('ticket_payments.urls')),
    path('api/admin/', include('bms_analytics.urls')),

    # Serve Vite bundled assets correctly
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': frontend_assets}),
    re_path(r'^(?P<path>.*\.(js|css|png|jpg|jpeg|svg|ico|json|woff2?))$', serve, {'document_root': frontend_dist}),
    
    # Catch-all route to serve single-page React app (index.html) from Django
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
