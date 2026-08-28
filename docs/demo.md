# StudioScout AI — 3-Minute Hackathon Demo Script

This document outlines the step-by-step choreography for a 3-minute video or live judging demonstration of **StudioScout AI**. For the complete word-for-word voiceover script, see **[docs/DEMO_SCRIPT.md](./DEMO_SCRIPT.md)**.

---

## Demo Choreography (0:00 – 3:00)

| Timestamp | Phase | Screen Action | Talking Points |
|---|---|---|---|
| **0:00 - 0:25** | **The Filmmaking Problem** | Landing page hero | *"Location scouting and production planning for indie and studio films takes weeks of manual phone calls, disjointed spreadsheets, and fragmented internet searches. What if an autonomous agent could read your screenplay, dispatch real web searches to find filming venues, score them transparently, and build your entire shoot schedule?"* |
| **0:25 - 0:45** | **Create Production & Screenplay Input** | Click **"Explore Demo"** or load **"Cipher Zero"** | *"Here we load 'Cipher Zero', a sci-fi cyber thriller set in Mumbai. We provide the screenplay material with 4 distinct scenes: a quantum server vault, container freight terminal, decommissioned turbine hall, and skyscraper helipad."* |
| **0:45 - 1:15** | **Autonomous Agent Execution & Parallel Search** | Workspace view & **Agent Activity Timeline** | *"With one click on 'Start Autonomous Scout', the orchestrator agent starts. Notice the live timeline: First, Gemini parses the scenes and identifies distinct production requirements. Next, the agent actively calls the Parallel Search API to query real-world venues, night filming permits, and heavy vehicle clearance in Mumbai. No hardcoded or faked data — live web research occurs at runtime."* |
| **1:15 - 1:45** | **Source-Grounded Location Intelligence & 3D Map** | Center column: **Candidate Cards & Citations** | *"Look at Scene 3 (Turbine Hall). StudioScout found real industrial venues in Mumbai with a 94.5 match score. Clicking 'Details' reveals our 6-dimension rubric: visual fit, spatial dimensions, accessibility, lighting, practicality, and safety. Every strength and risk is backed by actual Parallel Search excerpts and verifiable URLs."* |
| **1:45 - 2:15** | **Autonomous Re-planning Under Constraint** | Click **"Modify Constraint"** & trigger **"Mukesh Mills unavailable on Saturday"** | *"Filmmaking rarely goes as planned. Let's add a real-world constraint: 'Mukesh Mills is unavailable on Saturday due to maintenance.' Watch the agent re-plan autonomously: it invalidates the affected candidate, re-queries Parallel Search for alternative venues, re-scores candidates, and shifts the schedule."* |
| **2:15 - 2:40** | **Production Bible, Call Sheets & Export Hub** | Click **"Export Hub"** & download deliverables | *"StudioScout doesn't stop at screen text. With one click in the Export Hub, producers can download a Hollywood-grade Production Bible PDF, Daily Call Sheets with call times and safety notices, RFC 5545 shooting calendars, and CSV schedules for Google Sheets."* |
| **2:40 - 3:00** | **Architecture & Partner Wrap-Up** | Architecture slide & Cloud Run Live Badge | *"StudioScout AI: Google Gemini provides the reasoning, Google Cloud Run provides the zero-key container platform, and Parallel Search provides live web research. Together, they turn raw screenplays into production-ready action."* |
