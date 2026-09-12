---
title: StudioScout AI
emoji: 🎬
colorFrom: yellow
colorTo: indigo
sdk: gradio
sdk_version: 5.20.0
app_file: app.py
pinned: false
---

# StudioScout AI 🎬
### Autonomous Film Pre-Production & Location Intelligence Operating System

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.1_Flash-8E75B2?style=flat&logo=google&logoColor=white)](https://ai.google.dev)
[![Parallel](https://img.shields.io/badge/Parallel_Search-Live_Web-FF6B6B?style=flat)](https://parallel.ai)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**StudioScout AI** is an autonomous AI production assistant that transforms raw screenplays into comprehensive pre-production packages. It coordinates multi-agent language models, live web venue discovery, acoustic scoring agents, generative concept artists, and logistics optimizers to turn days of manual script breakdown into minutes of verified, actionable intelligence.

---

## 🌟 Key Capabilities

- **Automated Screenplay Breakdown**: Ingests PDF scripts or scene text and automatically extracts character lists, vehicles, time-of-day, interior/exterior constraints, props, visual atmosphere, and spatial requirements using **Google Gemini 3.1 Flash**.
- **Real-Time Web Location Scouting**: Dispatches targeted queries via the **Parallel Search Python SDK** (`parallel-web`) to locate authentic venues, verify film permits, examine truck access, and extract cited excerpts with live URLs.
- **Explainable 6-Dimension Evaluation**: Scores candidate locations against a strict 100-point cinema production rubric:
  - 🎨 *Visual & Atmospheric Match* (25 pts)
  - 📐 *Spatial & Physical Architecture* (20 pts)
  - ⚡ *Power, Acoustic & Technical Viability* (15 pts)
  - 🚛 *Crew Logistics & Vehicle Accessibility* (15 pts)
  - 🏛️ *Permitting, Jurisdiction & Cost Feasibility* (15 pts)
  - 🦺 *Safety, Weather & Contingency Risk* (10 pts)
- **Multimodal Visual & Acoustic Previews**: Generates widescreen production moodboards with **Google Imagen 3** and synthesizes scene-specific soundscapes, foley blueprints, and audio cues via **Lyria 3**.
- **Multi-Speaker Table-Read Voiceover**: Automatically casts distinct character voices and generates table-read audio previews using Gemini's native text-to-speech engine.
- **Logistics & Shooting Schedule Engine**: Optimizes multi-day shooting schedules, company moves, turnaround times, and generates production-ready call sheets.
- **Tactile "Director's Notebook" Design**: Custom hand-drawn aesthetic supporting both **Sketchbook (Light Mode)** and **Chalkboard Slate (Dark Mode)** to give filmmakers a tactile, focused workspace.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             STUDIOSCOUT FRONTEND                            │
│           React 19 • TypeScript • Tailwind CSS • Canvas/Three.js            │
│        (Tactile Sketchbook Theme / Chalkboard Slate Dark Experience)        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST API (Async)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                              FASTAPI BACKEND                                │
│        Orchestrator • SQLite (WAL Mode) • Pydantic Schema Validation        │
└───────┬───────────────────────┬─────────────────────────────┬───────────────┘
        │                       │                             │
┌───────▼──────────────┐ ┌──────▼───────────────────┐ ┌───────▼───────────────┐
│     GEMINI 3.1       │ │     PARALLEL SEARCH      │ │  MULTIMODAL SUITE     │
│   • Scene Parsing    │ │   • Real-Time Web Venues │ │   • Imagen 3 (VFX)    │
│   • 6-Metric Scoring │ │   • Film Office Permits  │ │   • Lyria 3 (Acoustic)│
│   • Schedule Planner │ │   • Citation Extraction  │ │   • Gemini TTS (Cast) │
└──────────────────────┘ └──────────────────────────┘ └───────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** & **npm**
- **Google AI Studio API Key** (for Gemini 3.1 Flash & Imagen 3)
- **Parallel Search API Key** (for real-time web location intelligence)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

Edit `backend/.env` with your API credentials:
```env
GOOGLE_API_KEY=your_google_ai_studio_key
PARALLEL_API_KEY=your_parallel_api_key
GEMINI_MODEL=gemini-3.1-flash
PARALLEL_PROCESSOR=base
```

Start the backend API server:
```bash
uvicorn app.main:app --reload --port 8000
```
*The API interactive documentation will be live at `http://localhost:8000/docs`.*

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 📖 Production Workflow

```
1. Script Ingestion ➔ Upload PDF screenplay or paste raw scene script.
2. Scene Breakdown  ➔ Gemini parses INT/EXT, characters, vehicles & constraints.
3. Web Discovery    ➔ Parallel Search investigates venues in target production city.
4. Rubric Scoring   ➔ Candidate venues scored (0-100) with cited evidence & risks.
5. Multimodal Prep  ➔ Visual moodboards, acoustic soundscapes & cast read-throughs.
6. Call Sheet Build ➔ Daily shoot schedule, call times & company move maps ready.
```

---

## 🎨 Design System: The Director's Notebook

Film pre-production has historically lived in physical binders — marked up with highlighters, sticky notes, Polaroid location snapshots, and handwritten margin notes. StudioScout AI preserves this tactile creative feeling through a dedicated design system:

| Mode | Theme Concept | Purpose & Aesthetic |
|---|---|---|
| **Light Mode** | **Sketchbook** | Warm cream background (`#FBF8F1`), organic hand-drawn borders, washi tape headers, and marker accents. |
| **Dark Mode** | **Chalkboard Slate** | Deep graphite board (`#18181B`), chalk-white typography, neon-amber callouts, and cinema slate highlights. |

---

## 🗺️ Roadmap

- [ ] **Automated Shot List & Storyboard Generator**: Break scenes into camera setups (wide, medium, close-up, Dutch angle) with lens and movement suggestions.
- [ ] **Production Budget Estimator Lite**: Automatic estimation of location fees, municipal permits, crew day-rates, and turnaround costs based on city tier.
- [ ] **Exportable Production Binder (PDF/CSV)**: One-click export of industry-standard DGA/IATSE-compliant call sheets, location packets, and actor breakdown sheets.
- [ ] **Collaborative Crew Comments**: Multi-user annotations for Director, Line Producer, and Cinematographer.

---

## 📄 License

StudioScout AI is open-source software licensed under the [MIT License](LICENSE).
