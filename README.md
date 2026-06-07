# Agentic RAG Interactive Demo

An interactive WebApp for demonstrating Agentic RAG concepts with real-time execution visualization.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Demo Types](#demo-types)
- [Configuration](#configuration)
- [Development](#development)

## ✨ Features

- **Three Interactive Demos**:
  - 🤖 **What is Agentic AI?** - Animated explanation of agentic AI components and loops
  - 📊 **RAG Comparison** - Side-by-side comparison of classic RAG vs agentic RAG
  - ⚡ **Agentic RAG Loop** - Real-time interactive demo with user queries

- **Real-time Visualization**:
  - Live flow diagrams with step-by-step highlighting
  - Execution flow with detailed step information
  - Code blocks showing actual code at each step
  - Results and reasoning displayed in real-time

- **Presentation-Ready**:
  - Smooth animations and transitions
  - Clear explanations at each step
  - Interactive controls for exploration
  - Professional UI/UX design

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **React 18** - UI components
- **TypeScript** - Type safety
- **Framer Motion** - Animations
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Excalidraw** - Diagram rendering

### Backend
- **FastAPI** - Python web framework
- **Anthropic Claude API** - LLM integration
- **Weaviate** - Vector database
- **Pydantic** - Data validation
- **Server-Sent Events (SSE)** - Real-time streaming

## 📦 Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.8+ (for backend)
- **Docker** (optional, for Weaviate)
- **Anthropic API Key** (get from https://console.anthropic.com)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd /home/user/AgenticRAG
```

### 2. Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Anthropic API key
# ANTHROPIC_API_KEY=sk-your-key-here
```

### 3. Set Up Weaviate (Docker)

```bash
docker-compose up -d
# or run Weaviate locally on http://localhost:8080
```

### 4. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5. Start Backend Server

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### 6. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 7. Start Frontend Dev Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 8. Open in Browser

Visit `http://localhost:3000` to see the demo!

## 🏗️ Architecture

### Frontend Flow
```
User Browser
    ↓
Next.js Page (React Component)
    ↓
Demo Components (DiagramViewer, ExecutionFlow, etc.)
    ↓
Zustand Store (State Management)
    ↓
SSE EventSource (Real-time Updates)
    ↓
Backend API (HTTP)
```

### Backend Flow
```
FastAPI Route Handler
    ↓
DemoOrchestrator (Routes to specific demo)
    ↓
RAGPipeline / DemoOrchestrator
    ↓
Claude Integration (LLM Calls)
    ↓
Weaviate Vector Store (Document Retrieval)
    ↓
SSE Generator (Stream Results to Frontend)
```

### Data Flow (Agentic RAG Loop)
```
User Query
    ↓
PLAN: Rewrite query for better retrieval
    ↓
RETRIEVE: Search vector database
    ↓
EVALUATE: Assess document relevance (0-1 score)
    ↓
if score < 0.7:
    REFINE: Loop back to PLAN with feedback
else:
    GENERATE: Create answer from context
    ↓
    COMPLETE: Return final answer with citations
```

## 📱 Demo Types

### 1. What is Agentic AI? (`what-is-ai`)
- **Type**: Auto-play animation
- **Duration**: 2-3 minutes
- **Interactive**: No
- **Features**:
  - Animated flow showing PLAN → ACT → OBSERVE → REFLECT loop
  - Explains each component of agentic systems
  - Code pseudocode at each step
  - No LLM calls (purely demonstrative)

### 2. Classic RAG vs Agentic RAG (`rag-comparison`)
- **Type**: Auto-play animation
- **Duration**: 1-2 minutes
- **Interactive**: No
- **Features**:
  - Side-by-side flow comparison
  - Shows why agentic RAG is better
  - Highlights refinement loop advantage
  - Synchronized highlighting between left/right

### 3. Agentic RAG Reasoning Loop (`agentic-loop`)
- **Type**: Interactive demo
- **Duration**: 30-90 seconds per query
- **Interactive**: Yes
- **Features**:
  - User can input custom queries
  - Pre-loaded example queries
  - Real LLM calls (Claude API)
  - Real vector database retrieval (Weaviate)
  - Shows actual evaluation scores
  - Demonstrates looping behavior when score is low

## ⚙️ Configuration

### Backend Configuration (backend/.env)
```
ANTHROPIC_API_KEY=sk-...              # Claude API key
ANTHROPIC_MODEL=claude-3-5-sonnet-... # Model to use
WEAVIATE_URL=http://localhost:8080    # Weaviate URL
WEAVIATE_API_KEY=...                  # (Optional) if using cloud
DEMO_MAX_ITERATIONS=5                 # Max refinement loops
DEMO_EVALUATION_THRESHOLD=0.7         # Confidence threshold
```

### Frontend Configuration (frontend/.env.local)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 📚 Demo Data

The demo comes pre-loaded with 10 sample documents about:
- Prompt Engineering (2 docs)
- Retrieval-Augmented Generation (2 docs)
- Agentic AI Systems (6 docs)

Documents are automatically seeded into Weaviate on first run.

## 🔧 Development

### Running Tests

```bash
# Backend (from backend/)
pytest

# Frontend (from frontend/)
npm run test
```

### Building for Production

```bash
# Backend
cd backend
# Deploy with: gunicorn main:app

# Frontend
cd frontend
npm run build
npm start
# or deploy to Vercel: vercel deploy
```

### Project Structure

```
AgenticRAG/
├── frontend/                # Next.js application
│   ├── app/                # Pages and layouts
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilities and constants
│   ├── public/diagrams/    # Excalidraw diagram files
│   └── styles/             # Global CSS
│
├── backend/                # FastAPI application
│   ├── models/            # Pydantic schemas
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic
│   ├── main.py            # FastAPI app
│   ├── config.py          # Configuration
│   └── requirements.txt    # Python dependencies
│
├── .env.example            # Environment template
├── .gitignore
└── README.md
```

## 🎨 Customization

### Adding Custom Diagrams

1. Create diagrams in Excalidraw
2. Export as JSON
3. Save to `frontend/public/diagrams/`
4. Reference in demo components

### Adding Custom Documents

Edit `backend/models/demo_data.py` and add documents to `DEMO_DOCUMENTS` dict.

### Changing Styling

Edit `frontend/tailwind.config.js` and `frontend/styles/globals.css`

## 📝 License

MIT License - feel free to use this for presentations and learning!

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📞 Support

For issues with:
- **Frontend**: Check Next.js and React documentation
- **Backend**: Check FastAPI and Anthropic SDK documentation
- **Vector DB**: Check Weaviate documentation

---

**Built with ❤️ for understanding Agentic RAG concepts**
