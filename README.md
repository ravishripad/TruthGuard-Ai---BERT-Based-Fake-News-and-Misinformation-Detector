# ??? thruthGuard AI — BERT-Based Fake News Detector



![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3+-38B2AC.svg)
![HuggingFace](https://img.shields.io/badge/HuggingFace-Spaces-FFD21E.svg)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

A full-stack web application that detects fake news using a **large language model (LLM)** as the primary classifier, backed by a fine-tuned BERT transformer model, real-time Google News RSS validation, image OCR analysis, API rate limiting, and a fully animated React interface with MongoDB-backed user authentication.


## ?? Live Demo

| | Link |
|---|---|
| **??? Frontend (React App)** | **[https://truth-lens-bert-based-fake-news-and.vercel.app](https://truth-lens-bert-based-fake-news-and.vercel.app)** |
| **?? Backend API** | [https://suryakf-truthlens-backend.hf.space](https://suryakf-truthlens-backend.hf.space) |
| **?? Swagger / API Docs** | [https://suryakf-truthlens-backend.hf.space/docs](https://suryakf-truthlens-backend.hf.space/docs) |

> The backend runs on **Hugging Face Spaces** (CPU Basic — 2 vCPU, 16 GB RAM).
> The frontend is deployed on **Vercel** with global CDN.
> The database is **MongoDB Atlas** (M0 free cluster).



## ? Features

### Core Detection Pipeline
- **Fine-tuned BERT (Primary)** — PyTorch BERT model (~95% accuracy) 
- **Three-label output** — `REAL` / `FAKE` / `UNVERIFIED`. The LLM outputs UNVERIFIED when evidence is inconclusive, avoiding over-flagging real recent news as fake.
- **Confidence Scoring** — Per-prediction probability distribution visualised as a live pie chart.
- **Batch Analysis** — Submit up to 10 news texts in one request.

### News Source Validation
- **Google News RSS** — Free real-time headline search (no API key required). Retrieves title, source, publish date, and article description.
- **NewsAPI Integration** — Extended article lookup with source attribution.
- **SerpAPI Integration** — Fallback search-engine news verification.
- **Live context injection** — All retrieved articles (headline + summary + URL + publish date) are passed directly into the LLM's prompt so it cross-references the claim against real-world evidence.

### Image & OCR
- **Screenshot Upload** — Paste or upload a screenshot of a news headline/article.
- **Mistral OCR** — Extracts title, body text, source, and date from the image.
- **Same pipeline as text** — After OCR, the extracted headline goes through the same LLM-primary flow (news search ? LLM with context ? BERT fallback).

### Rate Limiting
API rate limits enforced via **slowapi** (per client IP):

| Endpoint | Limit |
|---|---|
| `POST /api/predict` | 30 / minute |
| `POST /api/batch-predict` | 5 / minute |
| `POST /api/image-predict` | 10 / minute |
| `POST /api/extract-image-text` | 10 / minute |
| `POST /api/auth/login` | 5 / minute |
| `POST /api/auth/register` | 3 / minute |

### Authentication & History
- **JWT Authentication** — 24-hour access tokens, bcrypt-hashed passwords.
- **Prediction History** — Every analysis stored with timestamp and label in MongoDB.
- **User Dashboard** — Live stats, streak counter, accuracy breakdown.

### Developer Experience
- **Rotating Log Files** — All API activity written to `logs/app.log` (10 MB cap, 5 backups).
- **Swagger / ReDoc** — Auto-generated interactive API docs at `/docs` and `/redoc`.
- **Environment-Driven Config** — All secrets via `.env`.

---

## ??? Architecture

```
+-----------------------------------------------------------------+
¦                    FRONTEND (React + Vite)                      ¦
¦   Home  ¦  Login  ¦  Register  ¦  Dashboard                     ¦
¦   GSAP ScrollTrigger · Framer Motion · TailwindCSS · Recharts   ¦
+-----------------------------------------------------------------+
                             ¦ HTTPS / JWT
+----------------------------?------------------------------------+
¦                      BACKEND (FastAPI)                          ¦
¦  Rate Limiting (slowapi) ? Logging Middleware ? logs/app.log    ¦
¦  /api/predict   /api/batch-predict   /api/image-predict         ¦
+-----------------------------------------------------------------+
       ¦                                      ¦
       ?  STEP 1                              ?  STEP 1 (image)
+-----------------+                  +---------------------+
¦ News Validator  ¦                  ¦   Mistral OCR       ¦
¦ Google News RSS ¦                  ¦ Extracts title +    ¦
¦ NewsAPI         ¦                  ¦ text from image     ¦
¦ SerpAPI         ¦                  +---------------------+
+-----------------+                             ¦
         ¦ articles (title+desc+date+url)       ¦ extracted headline
         ?  STEP 2 (PRIMARY)                    ?  STEP 2 (PRIMARY)
+-----------------------------------------------------------------+
¦                    LLM Fact-Checker                             ¦
¦        Primary model ? Fallback 1 ? Fallback 2                  ¦
¦  Output: REAL / FAKE / UNVERIFIED + confidence + reasoning      ¦
+-----------------------------------------------------------------+
                                ¦ (only if ALL Gemini models fail)
                                ?  STEP 3 (FALLBACK)
                   +------------------------+
                   ¦  Fine-tuned BERT       ¦
                   ¦  PyTorch + HF ~95% acc ¦
                   +------------------------+
                                ¦
+-------------------------------?---------------------------------+
¦                  MongoDB Atlas (Motor async)                    ¦
¦          users collection · predictions collection              ¦
+-----------------------------------------------------------------+
```

### Hybrid Model Architecture (Mermaid)

```mermaid
flowchart TD
  A[Input Text] --> B[Tokenizer<br/>bert-base-uncased]
    B --> C[input_ids, attention_mask]

  C --> D[BERT Encoder<br/>Hidden Size: 768]
    D --> E[Dropout]
  E --> F[BiLSTM<br/>2 layers, hidden=256, bidirectional]
  F --> G[LayerNorm<br/>Output dim: 512]
  G --> H[Multi-Head Self-Attention<br/>8 heads]

  H --> I[Global Max Pooling<br/>across sequence]
    I --> J[MLP Classifier]

    J --> J1[Linear 512->256 + ReLU + Dropout]
    J1 --> J2[Linear 256->128 + ReLU + Dropout]
    J2 --> J3[Linear 128->2]

    J3 --> K[Logits: Real vs Fake]
    K --> L[Softmax / Argmax Prediction]

    subgraph Training
      M[CrossEntropyLoss<br/>class weights + label smoothing]
      N[AdamW + LR Scheduler<br/>Warmup + Weight Decay]
      O[Early Stopping<br/>monitor val F1]
    end

    J3 --> M
    M --> N
    N --> O
```

---

## ?? Project Structure

```
FinalYearProject/
+-- app/
¦   +-- main.py              # FastAPI app, CORS, rate limiter, logging middleware
¦   +-- auth.py              # JWT token logic, bcrypt helpers
¦   +-- database.py          # Motor async MongoDB client
¦   +-- limiter.py           # Shared slowapi Limiter instance
¦   +-- api/
¦   ¦   +-- routes.py        # Prediction endpoints (/api/predict, /api/batch-predict, /api/image-predict)
¦   ¦   +-- auth_routes.py   # Auth endpoints (/api/auth/*)
¦   +-- models/
¦   ¦   +-- bert_model.py    # BERT inference wrapper (fallback only)
¦   +-- schemas/
¦   ¦   +-- prediction.py    # Pydantic request/response models
¦   ¦   +-- auth.py          # User & token schemas
¦   +-- utils/
¦       +-- ai_verification.py # LLM fact-checker (primary classifier)
¦       +-- news_validator.py  # Multi-source news validation + RSS parser
¦       +-- image_ocr.py       # Mistral OCR — image upload + text extraction
¦       +-- logger.py          # RotatingFileHandler logger factory
+-- enhanced_bert_liar_model/   # BERT fine-tuned on LIAR dataset (fallback)
+-- enhanced_bert_welfake_model/ # BERT fine-tuned on WELFake dataset (fallback)
+-- frontend/
¦   +-- src/
¦       +-- App.jsx
¦       +-- api/index.js
¦       +-- context/AuthContext.jsx
¦       +-- motion/           # GSAP + Framer Motion helpers
¦       +-- pages/            # Home, Dashboard, Login, Register
+-- logs/                     # Auto-created — rotating app.log
+-- Data/WELFake_Dataset.csv
+-- Notebook/
¦   +-- bert_finetune_notebook.ipynb
¦   +-- wel-fakebert-finetune-notebook.ipynb
+-- run_api.py
+-- pyproject.toml
+-- README.md
```

---

## ?? Production Deployment

```
Browser
  +--?  Vercel (React/Vite frontend)
              +-- VITE_API_URL --?  Hugging Face Spaces (FastAPI + BERT + LLM)
                                          +-- MONGODB_URL --?  MongoDB Atlas
```

| Layer | Platform | Plan |
|-------|----------|------|
| Frontend | [Vercel](https://vercel.com) | Free |
| Backend | [Hugging Face Spaces](https://huggingface.co/spaces) | CPU Basic (Free) |
| Database | [MongoDB Atlas](https://cloud.mongodb.com) | M0 Free |

### Deploy your own copy

**Backend (HF Spaces)**
1. Fork this repo and create a new Space (SDK: **Docker**)
2. Copy `app/`, `enhanced_bert_*/`, `run_api.py`, `Dockerfile.huggingface` (rename to `Dockerfile`)
3. Add secrets in Space Settings:

| Secret | Description |
|--------|-------------|
| `MONGODB_URL` | MongoDB Atlas connection string |
| `SECRET_KEY` | JWT signing secret |
| `AI_API_KEY` | LLM API key for the primary fact-checker |
| `MISTRAL_API_KEY` | Mistral API key (for image OCR) |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs |

**Frontend (Vercel)**
1. Import your GitHub repo ? set **Root Directory** to `frontend`
2. Add env var: `VITE_API_URL=https://YOUR_HF_USER-your-space.hf.space/api`

---

## ?? Local Development

### Prerequisites
- Python 3.11+, Node.js 18+
- [UV](https://github.com/astral-sh/uv) package manager
- MongoDB Atlas account
- LLM API key (for the primary fact-checker)
- Mistral API key (free at [mistral.ai](https://mistral.ai)) — for image OCR

### 1. Install Backend

```bash
git clone <your-repo-url>
cd FinalYearProject
pip install uv
uv sync
```

### 2. Configure Environment

Create `.env` in the project root:

```env
# MongoDB Atlas
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=fake_news_detector

# JWT
SECRET_KEY=your-super-secret-jwt-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# LLM API key (primary fact-checker)
AI_API_KEY=your_api_key_here

# Mistral AI (image OCR)
MISTRAL_API_KEY=your_mistral_api_key_here

# News Validation (optional — Google News RSS is free)
NEWSAPI_KEY=your_newsapi_key
SERPAPI_KEY=your_serpapi_key

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Start the Backend

```bash
python run_api.py
```

- API: **http://localhost:8000**
- Swagger: **http://localhost:8000/docs**

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: **http://localhost:5173**

---

## ?? API Reference

### Authentication

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `POST` | `/api/auth/register` | 3/min | Create a new user account |
| `POST` | `/api/auth/login` | 5/min | Login and receive a JWT token |
| `GET` | `/api/auth/me` | — | Get current authenticated user |
| `GET` | `/api/auth/history` | — | Retrieve prediction history |
| `GET` | `/api/auth/stats` | — | Get total/real/fake counts |
| `POST` | `/api/auth/logout` | — | Logout |

### Predictions (JWT required)

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| `POST` | `/api/predict` | 30/min | Analyse a single news headline |
| `POST` | `/api/batch-predict` | 5/min | Analyse up to 10 texts in one call |
| `POST` | `/api/image-predict` | 10/min | OCR + analyse a news screenshot |
| `POST` | `/api/extract-image-text` | 10/min | OCR only (no prediction) |

### Example — Single Prediction

**Request:**
```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Scientists discover new planet in solar system"}'
```

**Response:**
```json
{
  "text": "Scientists discover new planet in solar system",
  "prediction": "unverified",
  "confidence": 0.62,
  "probabilities": { "real": 0.62, "fake": 0.38 },
  "is_fake": false,
  "prediction_source": "llm_primary",
  "context_articles_used": 2,
  "news_insight": "?? Limited related news coverage found."
}
```

---

## ?? Technology Stack

### Backend
| Library | Purpose |
|---------|---------|
| FastAPI | Async REST API framework |
| Uvicorn | ASGI server |
| **google-genai** | **LLM SDK — primary fact-checker** |
| **mistralai** | **Mistral OCR — image text extraction** |
| **slowapi** | **Per-IP API rate limiting** |
| PyTorch | BERT model inference (fallback) |
| Transformers (HuggingFace) | Tokeniser + BERT model architecture |
| Motor | Async MongoDB driver |
| python-jose | JWT token generation & validation |
| passlib[bcrypt] | Password hashing |
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
| Axios | HTTP client with interceptors |

---

## ?? Classification Details

### LLM Fact-Checker (Primary)
| Property | Value |
|----------|-------|
| Input | User claim + live news articles (headline, summary, date, URL) |
| Output labels | `REAL` / `FAKE` / `UNVERIFIED` |
| Fallback chain | Multiple model tiers tried automatically on quota errors |
| Context | Receives live Google News articles before deciding |

**UNVERIFIED** is returned when the LLM cannot confirm or deny the claim from available evidence (e.g. very recent events not yet widely reported). It maps to `is_fake: false` with capped confidence (= 68%).

**FAKE** is only returned when retrieved articles **directly contradict** the specific factual assertion — not merely because the claim is surprising or uses dramatic language.

### BERT (Fallback)
| Property | Value |
|----------|-------|
| Architecture | BERT (bert-base-uncased) |
| Training | LIAR dataset (binarised) |
| Max token length | 512 |
| Accuracy | ~95% |
| When used | Only when all Gemini models fail |

---

## ?? Security

- JWT tokens with configurable expiry (default 24 hours)
- Bcrypt password hashing
- Per-IP rate limiting on all public endpoints
- CORS middleware (configurable via `ALLOWED_ORIGINS`)
- Pydantic input validation on all endpoints
- Environment-variable-driven secrets

---

## ?? Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URL` | ? | MongoDB Atlas connection string |
| `DATABASE_NAME` | ? | Target database name |
| `SECRET_KEY` | ? | Secret used to sign JWT tokens |
| `AI_API_KEY` | ? | LLM API key (primary fact-checker) |
| `MISTRAL_API_KEY` | ? | Mistral API key (image OCR) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ? | Token TTL (default: 1440) |
| `NEWSAPI_KEY` | ? | NewsAPI key |
| `SERPAPI_KEY` | ? | SerpAPI key |
| `ALLOWED_ORIGINS` | ? | Comma-separated CORS origins |
| `ENABLE_AI_CHECK` | ? | Set `false` to force BERT-only mode |

---

## ?? Datasets

### LIAR Dataset
| Property | Detail |
|----------|--------|
| **Source** | [W. Wang, 2017](https://aclanthology.org/P17-2067/) — UCSB |
| **Size** | ~12,800 labelled statements |
| **Labels** | 6-class ? binarised to fake / real |
| **Domain** | Political statements (PolitiFact) |
| **License** | Public domain |

### WELFake Dataset
| Property | Detail |
|----------|--------|
| **Source** | [Verma et al., 2021](https://doi.org/10.1109/TVCG.2021.3071339) |
| **Size** | 72,134 articles (35,028 fake · 37,106 real) |
| **Domain** | Mixed: Kaggle, Reuters, BuzzFeed |
| **License** | CC BY 4.0 |

---

## ?? Training Notebooks

| Notebook | Description |
|----------|-------------|
| `Notebook/bert_finetune_notebook.ipynb` | BERT fine-tuning on LIAR dataset |
| `Notebook/wel-fakebert-finetune-notebook.ipynb` | BERT fine-tuning on WELFake dataset |

---

## ?? Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## ?? License

MIT License

---

## ?? Acknowledgements

- [LIAR Dataset](https://www.cs.ucsb.edu/~william/data/liar_dataset.zip) — W. Wang, 2017
- [WELFake Dataset](https://zenodo.org/record/4561253) — Verma et al., 2021
- [Hugging Face Transformers](https://huggingface.co/) — BERT tokeniser and model utilities
- Primary LLM fact-checker — contextual claim verification against live news
- [Mistral AI](https://mistral.ai/) — Image OCR

---

<p align="center">??? Built to fight misinformation — thruthGuard AI</p>

