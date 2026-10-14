# 🚀 AI Mock Interview Platform ("InterviewAI Prime")

A complete, production-ready, full-stack AI Mock Interview Platform built with HTML5, CSS3, MySQL, and Google Gemini AI.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Google Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-8E75C4?style=for-the-badge&logo=google&logoColor=white)

---

## 🛠️ Core Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure, accessible interview forms, canvas visualizers & media containers |
| **CSS3** | Responsive layouts, glassmorphism design system, dark mode & smooth micro-animations |
| **MySQL** | Relational database schema, candidate profiles, interview logs & analytics persistence |
| **AI Gemini** | Real-time question generation, STAR behavioral scoring & technical code evaluation |

## 🌟 Key Features

1. **🎙️ Voice & Text AI Interviewer Simulator**
   - Live AI Interviewer visual avatar with speaking/listening states.
   - Text-to-Speech (TTS) voice playback of interview questions.
   - Speech-to-Text (STT) candidate voice recording with live audio visualizer waveform.
   - Real-time filler word detection ("um", "uh", "like", "basically").

2. **💻 Technical Coding Sandbox**
   - Code editor supporting multiple programming languages (JavaScript, Java, C++, and more).
   - Test case execution simulation and complexity analysis.

3. **🏢 Company-Specific & Role Customization**
   - Company presets: **Google, Amazon, Meta, Microsoft, Apple, Netflix, TCS, Infosys, Accenture**.
   - Roles: Software Engineer, Frontend, Backend, System Design, Product Manager, HR / Behavioral.

4. **🤖 Intelligent AI Evaluation & STAR Method Scoring**
   - Google Gemini API integration for structured response evaluation.
   - Multi-axis scoring: Technical Depth, STAR Structure, Communication Pace, Tone/Confidence.
   - Model answer generation and follow-up question suggestions.

5. **📄 Resume Analyzer & Targeted Question Generator**
   - Upload or paste candidate resumes.
   - Extract skills, identify gaps, and auto-generate candidate-specific interview sessions.

6. **📊 Post-Interview Scorecard & PDF Export**
   - Detailed spider/radar performance charts.
   - Hiring recommendation ("Strong Hire", "Hire", "Lean Hire", "No Hire").
   - PDF export / print capabilities.

7. **🗄️ MySQL Relational Database**
   - Normalized schema (`users`, `profiles`, `interviews`, `questions`, `answers`, `resumes`, `admin_logs`).
   - Resilient database connection pooling with automatic local fallback.

---

## 🚀 Quick Start (Local Setup)

### Option 1: Docker Setup (Recommended with MySQL)
Run the entire platform + MySQL 8.0 container via Docker Compose:
```bash
docker-compose up --build
```

### Option 2: Run Frontend & Backend Manually

#### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Backend runs at: `http://localhost:8000` (Swagger API Docs at `http://localhost:8000/docs`)

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 🔑 Database Environment Variables

### Backend (`backend/.env` or Docker env)
```env
# MySQL Connection String:
# mysql+pymysql://<user>:<password>@<host>:<port>/<dbname>
DATABASE_URL=mysql+pymysql://root:rootpassword@localhost:3306/ai_mock_interview
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_super_secret_jwt_key
```

---

## 🛠️ GitHub Repository Language Configuration
To highlight the core application technologies (**HTML, CSS, MySQL, and AI Gemini**) on GitHub, frontend build files are configured with `linguist-detectable=false` in `.gitattributes` to hide TypeScript stats from the repository summary.

---

## 📄 License
MIT License. Built for professional portfolio and enterprise interview readiness.
