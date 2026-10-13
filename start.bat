@echo off
echo =========================================================
echo 🚀 Starting AI Mock Interview Platform ("InterviewAI Prime")
echo =========================================================
echo.

echo Starting Backend Service (FastAPI)...
start "AI Interview Backend" cmd /k "cd backend && (py -m pip install -r requirements.txt || python -m pip install -r requirements.txt) && (py main.py || python main.py)"

echo Starting Frontend Service (Vite UI)...
start "AI Interview Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo =========================================================
echo ✅ Application launched!
echo 🌐 Frontend: http://localhost:5173
echo ⚙️ Backend API: http://localhost:8000
echo 📄 API Documentation: http://localhost:8000/docs
echo =========================================================
pause
