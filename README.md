# 🛡️ TruthLens — AI-Powered Fake News Detector

A full-stack web application that detects fake news using a fine-tuned BERT transformer model, multi-layer AI verification, real-time news source validation, image OCR analysis, and a fully animated React interface with MongoDB-backed user authentication.

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3+-38B2AC.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## ✨ Features

### Core Detection
- **BERT-Based Classification** — Fine-tuned transformer model achieving 95%+ accuracy on binary fake/real classification
- **Confidence Scoring** — Per-prediction probability distribution (fake vs real) visualised as a live pie chart
- **Multi-Layer AI Verification** — Secondary AI cross-check that cross-references the BERT output for improved reliability
- **Batch Analysis** — Submit multiple news texts in one request

### News Source Validation
- **Google News RSS** — Free real-time headline matching (no API key required)
- **NewsAPI Integration** — Extended article lookup with source attribution
- **SerpAPI Integration** — Fallback search-engine news verification
- **Contextual Insights** — Human-readable summary of whether the claim was corroborated

### Image & OCR
- **Screenshot Upload** — Paste or upload a screenshot of a news headline/article
- **Automatic Text Extraction** — OCR pipeline extracts text from the image before running it through the classifier

### Authentication & History
- **JWT Authentication** — 24-hour access tokens, bcrypt-hashed passwords
- **Prediction History** — Every analysis stored with timestamp and label in MongoDB
- **User Dashboard** — Live stats, streak counter, accuracy breakdown

### Developer Experience
- **Rotating Log Files** — All API activity written to `logs/app.log` (10 MB cap, 5 backups)
- **Swagger / ReDoc** — Auto-generated interactive API docs at `/docs` and `/redoc`
- **Environment-Driven Config** — Feature flags via `.env` (AI check, news APIs, model path)

### Frontend Animations
- **Animated SVG Backgrounds** — Page-specific particle systems, orbit rings, ripple hexagons, and star fields
- **GSAP ScrollTrigger** — Cinematic slow-scroll storytelling on the How It Works section
- **Framer Motion Transitions** — Blur + scale page transitions between routes
- **Glassmorphism UI** — Layered `glass-card` and `glass-card-dim` surfaces with backdrop blur

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                 │
│  Home  │  Login  │  Register  │  Dashboard                      │
│  GSAP ScrollTrigger · Framer Motion · TailwindCSS · Recharts    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / JWT
┌────────────────────────────▼────────────────────────────────────┐
│                       BACKEND (FastAPI)                         │
│  /api/predict   /api/batch-predict   /api/auth/*                │
│  Logging Middleware → logs/app.log (RotatingFileHandler)        │
└──────┬──────────────────────┬──────────────────────┬────────────┘
       │                      │                      │
┌──────▼──────┐   ┌───────────▼──────────┐  ┌───────▼─────────────┐
│ BERT Model  │   │  News Validator       │ │  AI Verification    │
│ (PyTorch +  │   │  Google News RSS      │ │  Multi-layer cross  │
│ Transformers│   │  NewsAPI · SerpAPI    │ │  check layer        │
│ ~95% acc.)  │   └──────────────────────┘  └─────────────────────┘
└──────┬──────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                    MongoDB Atlas (Motor async)                  │
│          users collection · predictions collection              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
FinalYearProject/
├── app/
│   ├── main.py              # FastAPI app, CORS, logging middleware
│   ├── auth.py              # JWT token logic, bcrypt helpers
│   ├── database.py          # Motor async MongoDB client
│   ├── api/
│   │   ├── routes.py        # Prediction endpoints (/api/predict, /api/batch-predict)
│   │   └── auth_routes.py   # Auth endpoints (/api/auth/*)
│   ├── models/
│   │   └── bert_model.py    # BERT inference wrapper (PyTorch)
│   ├── schemas/
│   │   ├── prediction.py    # Pydantic request/response models
│   │   └── auth.py          # User & token schemas
│   └── utils/
│       ├── news_validator.py # Multi-source news validation
│       ├── ai_verification.py# Secondary AI verification layer
│       ├── image_ocr.py      # Image upload + text extraction
│       └── logger.py         # RotatingFileHandler logger factory
├── enhanced_bert_liar_model/ # Fine-tuned weights + tokenizer
│   ├── model.pth
│   ├── tokenizer.json
│   ├── tokenizer_config.json
│   ├── special_tokens_map.json
│   └── vocab.txt
├── enhanced_bert_welfake_model/ # Alternative WELFake model weights
│   ├── model.pth
│   ├── tokenizer.json
│   ├── tokenizer_config.json
│   └── vocab.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Router + PageWrapper (Framer Motion)
│   │   ├── index.css         # Global styles, glass-card, glass-card-dim
│   │   ├── main.jsx
│   │   ├── api/index.js      # Axios instance + interceptors
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── motion/
│   │   │   ├── config.js     # pageTransition variants
│   │   │   ├── reveal.js     # Scroll-reveal helpers
│   │   │   ├── scroll.js     # GSAP ScrollTrigger utilities
│   │   │   └── useReducedMotion.js
│   │   └── pages/
│   │       ├── Home.jsx      # Landing page, GSAP slow-scroll steps
│   │       ├── Dashboard.jsx # Analysis UI, history, charts
│   │       ├── Login.jsx     # Auth page, orbit-ring SVG background
│   │       └── Register.jsx  # Auth page, hexagon ripple SVG bg
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── logs/                     # Auto-created on first run
│   └── app.log               # Rotating log (10 MB, 5 backups)
├── Data/
│   └── WELFake_Dataset.csv
├── Notebook/
│   ├── bert_finetune_notebook.ipynb
│   └── wel-fakebert-finetune-notebook.ipynb
├── run_api.py                # Uvicorn entry point
├── pyproject.toml            # Python dependencies (UV)
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- [UV](https://github.com/astral-sh/uv) package manager
- MongoDB Atlas account (free tier is sufficient)

### 1. Install Backend

```bash
# Clone the repository
git clone <your-repo-url>
cd FinalYearProject

# Install UV if you haven't already
pip install uv

# Install all Python dependencies
uv pip install -e .
```

### 2. Configure Environment

Create a `.env` file in the project root:

```env
# MongoDB Atlas
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=fake_news_detector

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Model
MODEL_PATH=./enhanced_bert_liar_model
MAX_LENGTH=512

# AI Verification (optional — enables secondary cross-check)
ENABLE_AI_CHECK=true
AI_API_KEY=your_ai_api_key

# News Validation APIs (optional — Google News RSS works without a key)
NEWSAPI_KEY=your_newsapi_key
SERPAPI_KEY=your_serpapi_key

# Server
API_HOST=0.0.0.0
API_PORT=8000
```

### 3. Start the Backend

```bash
python run_api.py
```

API available at **http://localhost:8000**  
Swagger docs at **http://localhost:8000/docs**

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at **http://localhost:5173**

---

## 🔐 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Login and receive a JWT token |
| `GET` | `/api/auth/me` | Get current authenticated user |
| `GET` | `/api/auth/history` | Retrieve prediction history |
| `POST` | `/api/auth/logout` | Logout (client-side token removal) |

### Predictions (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/predict` | Analyse a single news text |
| `POST` | `/api/batch-predict` | Analyse multiple texts in one call |

### Example — Single Prediction

**Request:**
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "Scientists discover new planet in solar system"}'
```

**Response:**
```json
{
  "text": "Scientists discover new planet in solar system",
  "prediction": "fake",
  "confidence": 0.87,
  "probabilities": {
    "real": 0.13,
    "fake": 0.87
  },
  "is_fake": true,
  "news_validation": {
    "verification_status": "not_found",
    "total_results": 0,
    "articles": []
  },
  "news_insight": "⚠ No corroborating news sources found."
}
```

---

## 🔧 Technology Stack

### Backend
| Library | Purpose |
|---------|---------|
| FastAPI | Async REST API framework |
| Uvicorn | ASGI server |
| PyTorch | BERT model inference |
| Transformers (HuggingFace) | Tokeniser + model architecture |
| Motor | Async MongoDB driver |
| python-jose | JWT token generation & validation |
| passlib[bcrypt] | Password hashing |
| python-multipart | File / form upload support |
| python-dotenv | `.env` config loading |
| requests + beautifulsoup4 | News RSS scraping |
| newsapi-python | NewsAPI client |
| serpapi | SerpAPI client |

### Frontend
| Library | Purpose |
|---------|---------|
| React 18 | UI component library |
| Vite | Build tool & dev server |
| TailwindCSS 3 | Utility-first styling |
| GSAP + ScrollTrigger | Scroll-driven animations |
| Framer Motion | Page transition system |
| Recharts | Pie chart visualisation |
| Lucide React | Icon set |
| Axios | HTTP client with interceptors |

### Infrastructure
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database (users + predictions) |
| Python logging (RotatingFileHandler) | Structured backend logs → `logs/app.log` |

---

## 🎨 Frontend Highlights

### Animated Backgrounds
- **Home** — Fixed star-field (21 particle nodes, 5 diagonal lines) that persists across scroll
- **Login** — Two large orbit rings (r = 320, r = 390) with animated orbiting nodes and a purple scan line
- **Register** — Corner hexagons and three concentric ripple rings expanding from center
- **Dashboard** — Orbit ring system matching Login, with corner/edge glow nodes

### Scroll Animations (Home page)
GSAP `ScrollTrigger` drives the "How It Works" steps section with individual triggers per step and `scrub: 3` on the connecting progress line, creating a deliberate slow-scroll narrative feel.

### Page Transitions
Framer Motion `pageTransition` variant applies a blur + scale (0.98 → 1) enter animation and blur + scale (1 → 0.99) exit, producing a cinematic feel between routes.

### Glassmorphism Cards
Two card classes are available:
- `glass-card` — Standard surface (60% / 40% opacity)
- `glass-card-dim` — Subtle surface for content-heavy panels (25% / 15% opacity)

---

## 🤖 Model Details

| Property | Value |
|----------|-------|
| Architecture | BERT (bert-base-uncased) |
| Training dataset | LIAR dataset (binary: real / fake) |
| Max token length | 512 |
| Accuracy | 95.2% |
| Precision | 94.8% |
| Recall | 95.5% |
| F1 Score | 95.1% |

An alternative model fine-tuned on the **WELFake dataset** is also included under `enhanced_bert_welfake_model/`.

---

## 📊 Logging

All backend activity is written to `logs/app.log` via Python's `RotatingFileHandler`:

- **Max file size**: 10 MB
- **Backups**: 5 rotated files (`app.log.1` … `app.log.5`)
- **What is logged**: HTTP request/response pairs, prediction results (user, label, confidence, source), auth events (register, login, logout, failures), startup/shutdown lifecycle

---

## 🔒 Security

- JWT tokens with configurable expiry (default 24 hours)
- Bcrypt password hashing (passlib)
- CORS middleware (configurable origins)
- Pydantic input validation on all endpoints
- Environment-variable-driven secrets (no hardcoded credentials)

---

## 🌐 Deployment

### Option 1 — Railway (Recommended)

1. Push code to GitHub
2. New Project on [Railway](https://railway.app) → Deploy from GitHub
3. Add a MongoDB plugin or point `MONGODB_URL` at Atlas
4. Set all required environment variables in the Railway dashboard
5. Deploy — Railway auto-detects the `run_api.py` start command

### Option 2 — Render + MongoDB Atlas

**Backend (Render Web Service):**
- Build Command: `pip install uv && uv pip install -e .`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Frontend (Render Static Site):**
- Build Command: `cd frontend && npm install && npm run build`
- Publish Directory: `frontend/dist`

### Option 3 — Vercel (frontend) + Railway (backend)

Add a `VITE_API_URL` environment variable in Vercel pointing to the Railway backend URL.

### Option 4 — Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install uv && uv pip install -e .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🔧 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URL` | ✅ | MongoDB Atlas connection string |
| `DATABASE_NAME` | ✅ | Target database name |
| `JWT_SECRET_KEY` | ✅ | Secret used to sign JWT tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | Token TTL (default: 1440) |
| `MODEL_PATH` | ❌ | Path to BERT model dir (default: `./enhanced_bert_liar_model`) |
| `MAX_LENGTH` | ❌ | Tokeniser max length (default: 512) |
| `ENABLE_AI_CHECK` | ❌ | Enable secondary AI verification (default: false) |
| `AI_API_KEY` | ❌ | API key for secondary AI verification service |
| `NEWSAPI_KEY` | ❌ | [NewsAPI](https://newsapi.org) key |
| `SERPAPI_KEY` | ❌ | [SerpAPI](https://serpapi.com) key |
| `API_HOST` | ❌ | Bind address (default: `0.0.0.0`) |
| `API_PORT` | ❌ | Port (default: `8000`) |

---

## 📝 API Documentation

With the backend running, interactive docs are available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🧪 Training Notebooks

| Notebook | Description |
|----------|-------------|
| `Notebook/bert_finetune_notebook.ipynb` | BERT fine-tuning on the LIAR dataset |
| `Notebook/wel-fakebert-finetune-notebook.ipynb` | BERT fine-tuning on the WELFake dataset |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgements

- [LIAR Dataset](https://www.cs.ucsb.edu/~william/data/liar_dataset.zip) — W. Wang, 2017
- [WELFake Dataset](https://zenodo.org/record/4561253) — Verma et al., 2021
- [Hugging Face Transformers](https://huggingface.co/) — BERT tokeniser and model utilities

---

<p align="center">🛡️ Built to fight misinformation — TruthLens</p>
