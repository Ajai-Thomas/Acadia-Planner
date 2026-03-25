from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Subject, Task, Availability
from .serializers import SubjectSerializer, TaskSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

class AvailabilityView(APIView):
    def get(self, request):
        data = {}
        for item in Availability.objects.all():
            data[item.day] = [item.startTime, item.endTime]
        return Response(data)

    def post(self, request):
        Availability.objects.all().delete()
        for day, times in request.data.items():
            if len(times) == 2:
                Availability.objects.create(day=day, startTime=times[0], endTime=times[1])
        return Response({"status": "updated"})
