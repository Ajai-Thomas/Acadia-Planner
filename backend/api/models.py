from django.db import models

class Subject(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    name = models.CharField(max_length=200)
    difficulty = models.CharField(max_length=50)
    examDate = models.DateField(null=True, blank=True)
    progress = models.IntegerField(default=0)
    color = models.CharField(max_length=50)

class Task(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    title = models.CharField(max_length=200)
    subjectId = models.CharField(max_length=100)
    deadline = models.DateField(null=True, blank=True)
    duration = models.IntegerField(default=0)
    priority = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default='Pending')

class Availability(models.Model):
    day = models.CharField(max_length=20, primary_key=True)
    startTime = models.CharField(max_length=10)
    endTime = models.CharField(max_length=10)
