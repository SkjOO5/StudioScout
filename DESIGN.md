# StudioScout AI — Design System & Visual Architecture (`DESIGN.md`)

> **Source of Truth** for UI/UX patterns, design tokens, color harmonies, micro-interactions, and visual guidelines across StudioScout AI.

---

## 1. 🎯 Brand Identity & Aesthetic Direction

StudioScout AI combines **High-Tension Cinematic Cyberpunk & Sci-Fi Realism** with a **Playful, Punchy "Neo-Pop / Cyber-Candy" Design Language**.

### Aesthetic Tenets:
1. **Cinematic Immersion with Pop Contrast**: Deep, rich dark surfaces (`#0B0F17`, `#111827`) paired with vibrant neo-candy accents (Cyber Purple `#8B5CF6`, Neon Amber `#FBBF24`, Laser Pink `#EC4899`, Emerald `#34D399`).
2. **Tactile Neo-Pop Elevation**: Hard contrast borders (`border-2 border-studio-border`) with offset drop shadows (`shadow-pop`, `shadow-pop-xs`) for interactive buttons and floating cards.
3. **Auditory & Multimodal Feedback**: Real-time synthesized ambient soundscapes, live interactive waveforms, multi-speaker voice synthesis, and 8K widescreen storyboards.
4. **Zero Boring Defaults**: Rich typography with Google Fonts (*Plus Jakarta Sans* / *Outfit* / *JetBrains Mono*), smooth spring-loaded transitions, and glassmorphic telemetry banners.

---

## 2. 🎨 Color Palette & Design Tokens

### Core Neutral Surfaces
| Token | Hex (Dark) | Hex (Light) | Usage |
|---|---|---|---|
| `studio-bg` | `#0B0F17` | `#F8FAFC` | Main application background |
| `studio-surface` | `#111827` | `#FFFFFF` | Primary card, modal, and panel background |
| `studio-hover` | `#1F2937` | `#F1F5F9` | Hover state for interactive rows and cards |
| `studio-border` | `#374151` | `#E2E8F0` | Structural card borders and dividing lines |
| `studio-text` | `#F9FAFB` | `#0F172A` | Primary high-contrast typography |
| `studio-muted` | `#94A3B8` | `#64748B` | Secondary captions, metadata, and labels |

### Neon Accent Palette
| Accent | Hex | Highlight Role |
|---|---|---|
| **Cyber Purple** | `#8B5CF6` | Primary action buttons, active tabs, location radar badges |
| **Solar Amber** | `#FBBF24` | Lyria 3 Audio Synthesizer, warnings, medium-risk tags, replanning |
| **Laser Pink** | `#EC4899` | VFX & Storyboards (Imagen 3), Gemini TTS Voice Table-Read |
| **Emerald Lime** | `#34D399` | Production Plan, confirmed locations, high-match score badges (90%+) |
| **Cyan Sky** | `#38BDF8` | Research citations, external Parallel Search URLs, technical specs |
| **Crimson Coral** | `#EF4444` | High-risk alerts, stop buttons, delete actions, required permits |

---

## 3. 🔤 Typography & Hierarchy

### Font Families:
- **Headings & Display:** `Plus Jakarta Sans`, `Outfit`, `sans-serif` (Weights: `700`, `800`, `900`)
- **Body & Controls:** `Inter`, `system-ui`, `sans-serif` (Weights: `400`, `500`, `600`)
- **Telemetry & Prompts:** `JetBrains Mono`, `Fira Code`, `monospace` (Weights: `400`, `700`)

### Scale:
- `text-3xl` / `font-black`: Page Hero Titles (*Cipher Zero — Master Production Plan*)
- `text-xl` / `font-extrabold`: Section Headers, Scene Headings (*INT. QUANTUM LAB - NIGHT*)
- `text-sm` / `font-bold`: Card Titles, Table Headers, Metric Callouts
- `text-xs` / `font-mono`: Prompts, BPM/Key Badges, Call Times (`07:00 - 20:00`)
- `text-[10px]` / `font-black` / `uppercase`: Category pills, priority tags, status indicators

---

## 4. 🧩 Core Component Specifications

### A. Candy Buttons (`btn-candy-*`)
- **Border:** `2px solid #374151`
- **Shadow:** `3px 3px 0px rgba(0, 0, 0, 0.4)` (`shadow-pop-xs`)
- **Hover:** `-translate-x-0.5 -translate-y-0.5 shadow-pop`
- **Active:** `translate-x-0.5 translate-y-0.5 shadow-none`

### B. Multimodal Workspace Tabs
1. **Location Radar**: 3D interactive location map, extracted scene deck, and 6-dimension candidate cards.
2. **VFX & Storyboards (Imagen 3)**: 16:9 widescreen 8K concept stills, color palette swatches, anamorphic lens specs, and DP notes.
3. **Audio & Score Cues (Lyria 3)**: Live Web Audio synthesizer, real-time waveform visualizer, BPM tempo pulse, and `.wav` export.
4. **Table-Read & Dialogue (TTS)**: Multi-speaker voice synthesis, line-by-line speech tracking, and character subtext breakdown.
5. **Production Plan**: Day-by-day shooting schedules, call times, crew sizing, and company move logistics.
6. **Research Citations**: Real-time Parallel Search evidence cards with domain badges and direct URLs.

### C. Export Hub Modal
- **Production Bible (PDF)**: 2-column ReportLab layout, Cover Page, Executive Summary, 6D Radar Breakdown.
- **Daily Call Sheet (PDF)**: Cast call times, weather/sunset, emergency contacts, scene breakdown.
- **Shooting Calendar (.ics)**: RFC 5545 Apple/Google Calendar sync.
- **Shooting Schedule (CSV)**: UTF-8 BOM Google Sheets / Excel format.

---

## 5. ⚡ Micro-Interactions & Animation Guidelines

- **Duration Tokens:**
  - Micro (hover, focus): `150ms ease-out`
  - Medium (tab switches, modals): `250ms cubic-bezier(0.16, 1, 0.3, 1)`
  - Macro (page transitions, agent timeline steps): `400ms ease-in-out`
- **Sound & Haptics:** Auditory Web Audio synthesizer feedback when previewing scene cues.
- **Active States:** Subtle bounce and scale (`scale-[1.01]`) on the active speaking dialogue line.

---

## 6. 📱 Responsiveness & Adaptability

- **Mobile (<640px):** Single-column stacked layouts, collapsed 3D map drawer, full-width modal sheets.
- **Tablet (640px - 1024px):** 2-column grid for candidate cards and storyboard moodboards.
- **Desktop (>=1024px):** 12-column workspace layout (4-col scene timeline + 8-col intelligence slate).
