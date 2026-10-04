"""
WSGI config for bookmyshow_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

"""
WSGI config for bookmyshow_backend project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
import sys

# Add the backend directory to Python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookmyshow_backend.settings')

application = get_wsgi_application()

app = application
