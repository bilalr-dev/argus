# Argus 

> AI code review, right on your laptop

[![Version](https://img.shields.io/badge/version-0.1.0--beta-yellow.svg)](https://github.com/bilalr-dev/argus)
[![Status](https://img.shields.io/badge/status-beta-orange.svg)](https://github.com/bilalr-dev/argus)
[![Python](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/downloads/release/python-3120/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Cost](https://img.shields.io/badge/cost-free-brightgreen.svg)](https://aistudio.google.com/)

Argus is a local-first AI code review agent that deeply analyzes your branch changes natively alongside your development workflow without relying on external cloud GitHub actions or CI cycles. 

## What is Argus
- **Local-first AI code review agent** that analyzes offline and seamlessly fits on your developer machine.
- Diffs your current branch against a base ref (default: `main`).
- Sends the raw diff to **Gemini 2.5 Flash** for SonarQube-style analysis.
- Displays results via a clean 3-column UI split into file list, code diff viewer, and structured feedback pane.
- Stores historical reviews entirely locally using an embedded SQLite database.
- Zero extra costs and zero cloud infrastructural setups whatsoever.

## Features
- **In-depth static checks**: Comprehensive static code analysis to detect security vulnerabilities, bugs, code smells, anti-patterns, performance bottlenecks, and maintainability issues.
- **Side-by-side Navigation**: High density file list with pinpoint issue counts natively tied directly per file.
- **Auto-Scroll Targeting**: Click an issue in the panel → auto-jumps the diff viewer to the exact file and specific code line.
- **History Retention**: Explore your review history dynamically paired with search algorithms and status filters.
- **Human-in-the-Loop Feedback**: A fast workflow natively integrated to Approve / Edit / Ignore reviewing outputs directly.
- **Recent Tracking**: Check out recent reviews securely mapped onto the application sidebar.

## Prerequisites
- **Python** 3.12+
- **Node.js** 18+
- **Git**
- **Google Gemini API Key**: Free tier keys accessible directly from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Project structure

```text
argus/
├── backend/
│   ├── api/          # FastAPI routes, models, schemas
│   ├── core/         # git_utils.py, agent.py
│   ├── .env          # env declaring GOOGLE_API_KEY (not in git)
│   ├── .env.example  # Template 
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/ 
│   │   ├── views/
│   │   ├── api/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Setup

#### 1. Clone
```bash
git clone https://github.com/bilalr-dev/argus.git
cd argus
```

#### 2. Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and securely add your GOOGLE_API_KEY
```

#### 3. Frontend
```bash
cd ../frontend
npm install
```

## Running

#### Terminal 1 — Backend
```bash
cd argus/backend
uvicorn backend.api.main:app --reload --port 8000
```

#### Terminal 2 — Frontend
```bash
cd argus/frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## How to use
1. Make changes on a feature branch
2. Open Argus at `http://localhost:5173`
3. Enter your repo path (e.g. `/Users/you/code/my-project`)
4. Set base ref (default: `main`)
5. Click **"Run review"**
6. Gemini analyzes the diff and returns structured feedback
7. Click any issue to jump to the exact line in the diff
8. Approve / Edit / Ignore the review


## Tech stack table
| Layer | Technology |
|-------|-----------|
| LLM | Gemini 2.5 Flash (free tier) |
| Backend | FastAPI + SQLAlchemy + SQLite |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Font | Manrope |
| Icons | Tabler Icons |
| Git ops | subprocess (local only) |

## Beta notice
> **Beta Software**: Argus is in beta and designed for local use only. It is a single-user system without authentication, and the repository path input is not sandboxed. It is not yet intended for production environments or team deployments.

## License
MIT
