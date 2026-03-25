from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, TaskViewSet, AvailabilityView

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet)
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('availability/', AvailabilityView.as_view(), name='availability'),
]
