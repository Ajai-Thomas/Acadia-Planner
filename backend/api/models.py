from django.db import models
from django.contrib.auth.models import User

class Subject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    difficulty = models.CharField(max_length=50)
    examDate = models.DateField(null=True, blank=True)
    progress = models.IntegerField(default=0)
    color = models.CharField(max_length=50)

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    id = models.CharField(max_length=100, primary_key=True)
    title = models.CharField(max_length=200)
    subjectId = models.CharField(max_length=100)
    deadline = models.DateField(null=True, blank=True)
    duration = models.IntegerField(default=0)
    difficulty = models.CharField(max_length=50, default='Medium')
    status = models.CharField(max_length=50, default='Pending')

class Availability(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    day = models.CharField(max_length=20)
    startTime = models.CharField(max_length=10)
    endTime = models.CharField(max_length=10)

class Material(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='materials')
    file = models.FileField(upload_to='materials/')
    filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
