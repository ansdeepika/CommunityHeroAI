# Community Hero AI

Community Hero AI is an AI-powered civic issue reporting platform for citizens to file infrastructure complaints using text or images. The system classifies issues, generates formal complaint letters, and includes an admin dashboard for tracking complaint status.

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/ansdeepika/CommunityHeroAI.git
cd CommunityHeroAI
```

### 2. Backend setup
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 3. Configure backend
Create a file named `backend/.env` with:
```bash
GEMINI_API_KEY=your_api_key_here
```
If no Gemini API key is available, the backend will still run and return fallback values for AI analysis.

### 4. Run backend
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 5. Frontend setup
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

### 6. Open the app
- User app: `http://127.0.0.1:3000`
- Admin dashboard: `http://127.0.0.1:3000/admin`
- Backend health: `http://127.0.0.1:8000`

## Project structure
- `backend/`: FastAPI backend and complaint generation logic
- `frontend/`: Next.js frontend application
- `backend/vision_agent.py`: AI issue analysis and complaint generation
- `frontend/src/app/admin/page.js`: Admin dashboard UI

## Notes
- `.venv` is excluded from git, so each user must create it locally.
- `backend/.env` is not included in git.
- The frontend calls backend APIs at `http://localhost:8000`.
- Run backend and frontend in separate terminals.

## Troubleshooting
- If the frontend cannot reach the backend, verify `http://127.0.0.1:8000` is running.
- If Gemini API errors occur, confirm `backend/.env` contains a valid `GEMINI_API_KEY`.
- The backend returns fallback values when a Gemini key is not configured.

## Future scope
- Department analytics
- Email notifications
- Complaint history tracking
- Mobile app support
- Real-time government integration