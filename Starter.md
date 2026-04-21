# How to run

### Backend
cd /home/sayan/Desktop/ALL/PROJECTS/MediGrid/backend
npm run dev

### AI service
cd /home/sayan/Desktop/ALL/PROJECTS/MediGrid/ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

### Frontend
cd /home/sayan/Desktop/ALL/PROJECTS/MediGrid/frontend
npm run dev

Open in browser
http://localhost:5173/login