from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import SubjectViewSet, TaskViewSet, MaterialViewSet, AvailabilityView, AIPlanView, AIQuizView, RegisterView, CurrentUserView

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'materials', MaterialViewSet, basename='material')

urlpatterns = [
    path('login/', obtain_auth_token, name='api_token_auth'),
    path('register/', RegisterView.as_view(), name='register'),
    path('user/', CurrentUserView.as_view(), name='current_user'),
    path('availability/', AvailabilityView.as_view(), name='availability'),
    path('ai/plan/', AIPlanView.as_view(), name='ai-plan'),
    path('ai/quiz/', AIQuizView.as_view(), name='ai-quiz'),
    path('', include(router.urls)),
]
