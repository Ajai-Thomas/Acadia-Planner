# Acadia Planner

An AI-assisted study planner for students. Add your subjects, tasks and weekly free time, upload your course notes, and Acadia builds a study schedule around your availability and generates practice quizzes from your own material.

## Features

- **Subjects and tasks:** track subjects (difficulty, exam date, progress) and tasks (deadline, duration, status).
- **Weekly availability:** set the time slots you can study each day.
- **AI study plan:** Gemini 2.5 Flash builds a day-by-day plan that schedules tasks only inside your available hours and gives harder items more time.
- **Study material upload:** upload PDFs per subject. They are split into chunks and indexed in a vector store (Chroma) for retrieval.
- **AI quizzes:** generates a 5-question multiple-choice quiz for a subject from its uploaded material.
- **Accounts:** register and sign in; every subject, task and file is private to its owner.

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, React Router, Framer Motion |
| Backend | Django, Django REST Framework (token and session auth), django-cors-headers |
| AI | Google Gemini (gemini-2.5-flash, embedding-001) through LangChain, Chroma vector store, PyPDF |
| Database | PostgreSQL |

## Project structure

```
src/                  # React app (pages: Landing, Login, Dashboard, Subjects, Tasks,
                      #   Availability, Study Plan, Profile)
backend/
├── acadia_project/   # Django settings and URLs
└── api/              # Models, serializers, views and routes for the REST API
```

## Getting started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL with a database named `acadia_planner`
- A Google AI Studio API key for Gemini

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install django djangorestframework django-cors-headers python-dotenv psycopg2-binary \
            langchain-community langchain-google-genai langchain-text-splitters chromadb pypdf
```

Copy `backend/.env.example` to `backend/.env` and fill in your values (never commit `.env`):

```env
DJANGO_SECRET_KEY=generate-a-long-random-string
GOOGLE_API_KEY=your_gemini_api_key
DB_NAME=acadia_planner
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

Then run:

```bash
python manage.py migrate
python manage.py runserver
```

## Status

Personal project under active development.
