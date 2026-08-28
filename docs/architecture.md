# StudioScout AI — System Architecture

StudioScout AI is an autonomous, multi-step film production-planning assistant designed for the **Google Cloud Agentic Cinema Hackathon 2026 (Parallel Track)**.

---

## 1. High-Level Production Architecture

```mermaid
flowchart TD
    subgraph Client ["Client Tier (Browser)"]
        User["Filmmaker / Location Scout / Judge"]
        Frontend["Frontend SPA (React 19 + Three.js + Dark/Light Theme)"]
    end

    subgraph CloudRun ["Google Cloud Run (Unified Full-Stack Service: studioscout-ai)"]
        FastAPI["FastAPI App (Non-root appuser, Port 8080)"]
        RateLimiter["In-Memory Rate Limiter (Per-Instance Protection)"]
        
        subgraph AgenticCore ["StudioScout Orchestrator Agent (Python Engine)"]
            Orchestrator["StudioScoutAgent (root_agent.py)"]
            ScriptParser["Screenplay Parser"]
            ReqExtractor["Requirement Extractor"]
            SearchService["Parallel Search Tool (parallel-web SDK)"]
            CandidateEvaluator["Candidate Evaluator"]
            StoryboardGen["DP Moodboard Engine"]
            AudioGen["Soundtrack & Foley Engine"]
            VoiceDirector["Voice Director & TTS"]
            Planner["Production Planner & Call Sheets"]
            ReplanEngine["Autonomous Re-planning Engine"]
        end
        
        SQLiteStore[("Container-Local SQLite (Demo Pre-seed & State)")]
    end

    subgraph GCP_Security ["Google Cloud Security & Identity"]
        ServiceAccount["Dedicated Service Account (studioscout-sa)"]
        ADC["Application Default Credentials (ADC)"]
        SecretManager["Secret Manager (parallel-api-key)"]
    end

    subgraph External_APIs ["Cloud AI & Web Search"]
        VertexAI["Google Vertex AI (gemini-3.1-flash / gemini-2.5-flash)"]
        ParallelAPI["Parallel Search API (Runtime Web Discovery)"]
    end

    User -->|HTTPS / Port 443| Frontend
    Frontend -->|Same-Origin /api/*| FastAPI
    FastAPI --> RateLimiter
    RateLimiter --> Orchestrator
    
    Orchestrator --> ScriptParser & ReqExtractor & SearchService & CandidateEvaluator & StoryboardGen & AudioGen & VoiceDirector & Planner & ReplanEngine
    
    ServiceAccount -->|Zero-Key ADC| VertexAI
    ScriptParser & CandidateEvaluator & StoryboardGen & AudioGen & VoiceDirector & Planner -->|AI Reasoning| VertexAI
    SearchService -->|Live Web Citations| ParallelAPI
    SecretManager -.->|Injected Key| SearchService
    
    Orchestrator --> SQLiteStore
    SQLiteStore --> FastAPI
```

---

## 2. Component Breakdown

### A. Frontend Layer (React 19 + TypeScript + Vite + Tailwind CSS + Three.js)
- **Cinematic & Dark/Light Theme System:** Industrial-grade dark theme (`#0B0F17` canvas, `#131B2B` surfaces) and warm editorial light theme (`#FFFDF5` canvas) with zero color clashes and smooth transitions.
- **Scene Breakdown & Requirements:** Displays extracted scene headings, lighting, characters, vehicles, and prioritized production constraints.
- **Candidate Evaluation Cards:** Shows match score, 6-dimension metric breakdown, strengths, verified risks, and live Parallel Search citations.
- **Interactive 3D Production Map:** Three.js coordinate plane with spatial scene nodes, holographic pins, and DP camera paths.
- **VFX Storyboard, Audio & Table-Read Decks:** DP moodboard concepts, acoustic soundtrack cues, and multi-speaker script rehearsal tools.
- **Studio Crew Auth Switcher:** 1-click role switcher (Director, Location Scout, Line Producer, Hackathon Judge).

### B. Backend API Layer (FastAPI + Python 3.11+)
- **`app/main.py`:** Application entry point, CORS middleware, lifespan manager, health and status endpoints, static SPA mounting.
- **`app/rate_limiter.py`:** In-memory sliding-window rate limiter providing per-instance protection for expensive endpoints.
- **`app/api/projects.py`:** Project creation with PDF parsing (`pdfplumber`) or text inputs, CRUD operations, and source listing.
- **`app/api/runs.py`:** Autonomous scouting execution with timeout guards, status polling, and replanning trigger endpoints.
- **`app/api/storyboards.py`, `app/api/audio.py`, `app/api/tableread.py`:** VFX, acoustic score, and script table-read endpoints.
- **`app/store.py`:** Thread-safe SQLite store with WAL mode for all entities.

### C. Agent Orchestration Layer
- **`app/agent/root_agent.py`:** Deterministic multi-step orchestrator managing state transitions (`analyzing` → `researching` → `evaluating` → `planning` → `replanning` → `completed`) with safety step limits.
- **`app/tools/screenplay_parser.py`:** Extracts structured JSON scene schemas using Gemini 3.1 Flash.
- **`app/tools/candidate_evaluator.py`:** Evaluates Parallel Search web snippets against the 6-dimension rubric.
- **`app/tools/storyboard_generator.py`:** Generates cinematography lens, lighting, and visual concept blueprints.
- **`app/tools/audio_generator.py`:** Composes musical atmosphere blueprints and foley cues.
- **`app/tools/dialogue_director.py`:** Directs multi-voice table-reads and analyzes subtext sentiment.
- **`app/tools/planner.py`:** Generates day-by-day shooting schedules, crew call times, and contingency re-plans.

### D. Partner Integration Layer — Parallel Search Tool
- **`app/tools/parallel_search.py`:** Official integration using the `parallel-web` Python SDK.
- **Multi-Query Strategy:** Generates 3–5 focused search queries per scene (e.g. venue rental, night access, heavy vehicle clearance).
- **Result Normalization:** Cleans excerpts, extracts domains, records interaction IDs, and deduplicates URLs.

---

## 3. Explainable 6-Dimension Scoring Model

| Dimension | Weight | Description |
|-----------|--------|-------------|
| **Visual Aesthetic Match** | 25 pts | Architectural and atmospheric alignment with scene descriptions |
| **Location Requirements Met** | 20 pts | Ceiling height, interior square footage, and structural needs |
| **Accessibility & Logistics** | 15 pts | Heavy vehicle access, loading docks, crew transit |
| **Time/Lighting Suitability** | 15 pts | Controlled ambient lighting, night-shooting feasibility |
| **Production Practicality** | 15 pts | Staging areas, green rooms, power grid, noise isolation |
| **Safety & Risk Clearance** | 10 pts | Filming permits, public restrictions, hazard mitigation |
| **Total Score** | **100 pts** | Transparent composite score with source citation links |
