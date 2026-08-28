# StudioScout AI — 3-Minute Hackathon Demo Script

This document outlines the step-by-step choreography for a 3-minute video or live judging demonstration of **StudioScout AI**.

---

## Demo Choreography (0:00 – 3:00)

| Timestamp | Phase | Screen Action | Talking Points |
|---|---|---|---|
| **0:00 - 0:25** | **The Filmmaking Problem** | Landing page hero | *"Location scouting and production planning for indie and studio films takes weeks of manual phone calls, disjointed spreadsheets, and fragmented internet searches. What if an autonomous agent could read your screenplay, dispatch real web searches to find filming venues, score them transparently, and build your entire shoot schedule?"* |
| **0:25 - 0:45** | **Create Production & Screenplay Input** | Click **"Try Demo Project"** or **"Start New Production"** & load **"Neon Shadows"** | *"Here we load 'Neon Shadows', a neo-noir thriller set in Mumbai. We provide the screenplay material with 5 distinct scenes: an apartment standoff, underground parking, abandoned warehouse, rooftop chase, and hospital corridor."* |
| **0:45 - 1:15** | **Autonomous Agent Execution & Parallel Search** | Workspace view & **Agent Activity Timeline** | *"With one click on 'Start Autonomous Scout', the orchestrator agent starts. Notice the live timeline: First, Gemini parses the scenes and identifies 18 distinct production requirements. Next, the agent actively calls the Parallel Search API to query real-world venues, night filming permits, and heavy vehicle clearance in Mumbai. No hardcoded or faked data — live web research is occurring at runtime."* |
| **1:15 - 1:50** | **Source-Grounded Location Intelligence** | Center column: **Candidate Cards & Citations** | *"Look at Scene 3 (Abandoned Warehouse). StudioScout found real industrial venues in Mumbai with a 92% match score. Clicking 'Details' reveals our 6-dimension rubric: visual fit, spatial dimensions, accessibility, lighting, practicality, and safety. Every strength and risk is backed by actual Parallel Search excerpts and verifiable URLs."* |
| **1:50 - 2:20** | **Production Plan & Call Sheets** | Tab: **Production Plan** | *"Under the Production Plan tab, Gemini synthesized the scene requirements and location logistics into an actionable, day-by-day shooting schedule with crew call times, complexity ratings, and coordinator checklists."* |
| **2:20 - 2:45** | **Autonomous Re-planning Under Constraint** | Click **"Modify Constraint"** & trigger **"Warehouse unavailable on Saturday"** | *"Filmmaking rarely goes as planned. Let's add a real-world constraint: 'Warehouse is unavailable on Saturday due to maintenance.' Watch the agent re-plan autonomously: it invalidates the affected warehouse candidate, re-queries Parallel Search for alternative venues, re-scores candidates, and shifts the schedule."* |
| **2:45 - 3:00** | **Architecture & Partner Wrap-Up** | Tab: **Parallel Research Citations** & Architecture | *"StudioScout AI: Google Gemini provides the intelligence, Google Cloud provides the agent platform and backend runtime, and Parallel Search provides live web research. Together, they turn raw screenplays into production-ready intelligence."* |
