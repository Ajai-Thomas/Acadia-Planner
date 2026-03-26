import os
import json
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import Subject, Task, Availability, Material
from .serializers import SubjectSerializer, TaskSerializer, MaterialSerializer, UserSerializer
from django.conf import settings

# Langchain imports
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"username": user.username}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

def get_vectorstore():
    persist_directory = os.path.join(settings.BASE_DIR, 'chroma_db')
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vectorstore = Chroma(embedding_function=embeddings, persist_directory=persist_directory)
    return vectorstore

class SubjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = SubjectSerializer
    def get_queryset(self):
        return Subject.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TaskSerializer
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MaterialViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MaterialSerializer
    def get_queryset(self):
        return Material.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        material = serializer.instance
        file_path = material.file.path
        
        try:
            loader = PyPDFLoader(file_path)
            docs = loader.load()
            
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            splits = text_splitter.split_documents(docs)
            
            for split in splits:
                split.metadata["subject_id"] = material.subject.id
                
            vectorstore = get_vectorstore()
            vectorstore.add_documents(documents=splits)
            
        except Exception as e:
            return Response({"message": "File uploaded but AI parsing failed", "error": str(e)}, status=status.HTTP_201_CREATED)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class AvailabilityView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        data = {}
        for item in Availability.objects.filter(user=request.user):
            if item.day not in data:
                data[item.day] = []
            data[item.day].append([item.startTime, item.endTime])
        return Response(data)

    def post(self, request):
        Availability.objects.filter(user=request.user).delete()
        for day, times_wrapper in request.data.items():
            if isinstance(times_wrapper, list):
                if len(times_wrapper) > 0 and isinstance(times_wrapper[0], str):
                    if len(times_wrapper) == 2:
                        Availability.objects.create(user=request.user, day=day, startTime=times_wrapper[0], endTime=times_wrapper[1])
                else:
                    for slot in times_wrapper:
                        if isinstance(slot, list) and len(slot) == 2:
                            Availability.objects.create(user=request.user, day=day, startTime=slot[0], endTime=slot[1])
        return Response({"status": "updated"})

class AIPlanView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            subjects = list(Subject.objects.filter(user=request.user).values('name', 'difficulty', 'examDate'))
            tasks = list(Task.objects.filter(user=request.user, status='Pending').values('title', 'subjectId', 'duration', 'difficulty', 'deadline'))
            availability = {}
            for a in Availability.objects.filter(user=request.user):
                if a.day not in availability:
                    availability[a.day] = []
                availability[a.day].append([a.startTime, a.endTime])

            llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)
            
            prompt = f"""
            You are an expert AI Study Planner. Create a weekly study plan based on the following:
            Subjects: {json.dumps(subjects, default=str)}
            Tasks: {json.dumps(tasks, default=str)}
            Availability: {json.dumps(availability, default=str)}
            
            CRITICAL RULES:
            1. Strictly schedule tasks ONLY during the given Availability windows. Do not schedule study sessions outside these explicit hours.
            2. Factor in the "difficulty" parameter of each subject and task (e.g., prioritize High difficulty items, and allocate longer or more frequent blocks for them).
            
            Return ONLY clean markdown format with a clear day-by-day sequence mapping tasks to the available study hours. No conversational fluff or backticks.
            """
            
            response = llm.invoke([HumanMessage(content=prompt)])
            return Response({"plan": response.content})
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AIQuizView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        subject_id = request.data.get('subject_id')
        if not subject_id:
            return Response({"error": "subject_id required"}, status=400)
            
        try:
            # We must verify subject belongs to user
            if not Subject.objects.filter(id=subject_id, user=request.user).exists():
                return Response({"error": "Subject not found or access denied"}, status=status.HTTP_404_NOT_FOUND)

            vectorstore = get_vectorstore()
            retriever = vectorstore.as_retriever(search_kwargs={'filter': {'subject_id': subject_id}, 'k': 5})
            
            llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)
            
            system_prompt = (
                "You are an expert tutor. Use the retrieved context to generate a 5-question multiple choice quiz. "
                "Format as a JSON array of objects with keys 'question', 'options' (array of strings), and 'answer'. "
                "Return ONLY the raw JSON string without markdown blocks.\n\n"
                f"Context: {{context}}"
            )
            
            docs = retriever.invoke("")
            context_text = "\n\n".join([d.page_content for d in docs])
            
            messages = [
                SystemMessage(content=system_prompt.format(context=context_text)),
                HumanMessage(content="Generate the quiz now.")
            ]
            
            response = llm.invoke(messages)
            quiz_json = json.loads(response.content.strip('` \n').replace('json\n', ''))
            
            return Response({"quiz": quiz_json})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
