import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "acadia_project.settings")
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth.models import User

user = User.objects.first()
if user:
    client = APIClient()
    client.force_authenticate(user=user)
    print("Testing /api/ai/plan/ for user:", user.username)
    response = client.post('/api/ai/plan/')
    print("Status:", response.status_code)
    print("Data:", response.data)
else:
    print("No user found in the database.")
