# AI Interview Simulator 🎯

An AI-powered full-stack web application that simulates real job interviews. Practice with intelligent questions, get instant feedback, and track your progress.

## Features

- **AI-Powered Questions** — Generated via OpenAI API or curated question bank (HR, Technical, Behavioral)
- **Voice & Text Input** — Answer via typing or browser speech recognition
- **Instant Scoring** — Relevance, clarity, technical accuracy, communication (0-10)
- **Speech Analysis** — Pace, filler words, confidence level insights
- **Performance Dashboard** — Score trends, interview history, progress charts, difficulty breakdown
- **JWT Authentication** — Secure signup/login with encrypted passwords
- **Profile Management** — Edit name, change password, view account stats
- **Interview Management** — Delete interviews, filter history, skip questions
- **Export Reports** — Download interview feedback as text files
- **Responsive Design** — Mobile-friendly with hamburger navigation
- **Practice Streak** — Track consecutive days of practice

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 + TailwindCSS v4 |
| Backend | Python FastAPI |
| Database | MongoDB (Motor async driver) |
| AI Engine | OpenAI API (GPT-3.5) + fallback question bank |
| Charts | Recharts (Radar, Bar, Area, Pie) |
| Auth | JWT (python-jose + bcrypt) |
| Speech | Web Speech API (browser) + SpeechRecognition (Python) |

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB running locally (or Atlas connection string)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Copy .env.example to .env and set your values
cp .env.example .env
# Start the API server
uvicorn app:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables
Create `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=ai_interview_simulator
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key  # Optional: works without it using fallback questions
```

## Project Structure
```
ai-interview-simulator/
├── backend/
│   ├── app.py                        # FastAPI entry point
│   ├── config.py                     # Environment config
│   ├── database.py                   # MongoDB connection
│   ├── auth/jwt_handler.py           # JWT utilities
│   ├── models/
│   │   ├── user.py                   # User schemas
│   │   └── interview.py              # Interview schemas
│   ├── routes/
│   │   ├── auth.py                   # Auth endpoints (register, login, profile, password)
│   │   └── interview.py              # Interview endpoints (CRUD, stats)
│   ├── ai_engine/
│   │   ├── question_generator.py     # AI question generation
│   │   ├── answer_analyzer.py        # Answer evaluation
│   │   └── speech_analyzer.py        # Speech pattern analysis
│   └── speech_processing/
│       └── transcriber.py            # Audio transcription
├── frontend/
│   ├── src/
│   │   ├── pages/                    # 8 page components
│   │   ├── components/               # Shared components
│   │   ├── context/AuthContext.jsx    # Auth state management
│   │   ├── services/api.js           # Axios API service
│   │   └── index.css                 # Design system
│   └── vite.config.js
└── README.md
```

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero + features + CTA |
| Login | `/login` | Sign in form |
| Register | `/register` | Create account |
| Interview Setup | `/interview/setup` | Select type, role, difficulty |
| Interview Session | `/interview/session/:id` | Live Q&A with voice/text, skip, timers |
| Feedback Report | `/interview/feedback/:id` | Scores, charts, speech analysis, export |
| Dashboard | `/dashboard` | History, trends, stats, filtering, deletion |
| Profile | `/profile` | Edit name, change password, account stats |

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `GET /api/auth/profile` — Get profile
- `PUT /api/auth/profile` — Update profile
- `POST /api/auth/change-password` — Change password

### Interview
- `POST /api/interview/start` — Start new interview
- `POST /api/interview/answer` — Submit answer
- `POST /api/interview/complete/:id` — Complete interview
- `GET /api/interview/session/:id` — Get session details
- `GET /api/interview/history` — Get interview history
- `DELETE /api/interview/delete/:id` — Delete interview
- `GET /api/interview/stats` — Get analytics stats
