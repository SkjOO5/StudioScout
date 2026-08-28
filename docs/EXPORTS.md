# StudioScout AI — Production Exports & Document Engine 📑

StudioScout AI provides Hollywood-grade, standards-compliant export formats designed for film directors, line producers, 1st Assistant Directors (1st ADs), and studio executives.

---

## 📦 Overview of Available Formats

| Export Deliverable | Format | Standard / Engine | Primary Consumer |
|---|---|---|---|
| **Production Bible** | `.pdf` | ReportLab Platypus Flowables | Studio Execs, Producers, HODs |
| **Daily Call Sheet** | `.pdf` | ReportLab Custom Grid | 1st AD, Cast & Crew On-Set |
| **Shooting Calendar** | `.ics` | RFC 5545 iCalendar | Google Calendar, Apple Calendar, Outlook |
| **Production Schedule** | `.csv` | RFC 4180 with UTF-8 BOM | Google Sheets, Microsoft Excel |

---

## 1. Master Production Bible (`.pdf`)

The **Production Bible** is an end-to-end editorial dossier generated dynamically from canonical project data in SQLite storage.

### Key Sections:
1. **Title & Dossier Cover Page**:
   - Project name, genre, target production city, budget scale tier.
   - Version indicator, generation timestamp, and confidentiality notices.
2. **Executive Production Summary**:
   - Scene count, total shooting days, location count, overall complexity rating.
   - Primary risks and recommended immediate actions for the line producer.
3. **Scene Breakdown Matrix**:
   - Scene number, heading, interior/exterior setting, time of day.
   - Cast count on set, vehicle stunts, and physical requirements.
4. **Source-Grounded Location Dossier**:
   - Location name, address, match score / 100 with color-coded badges.
   - 6-dimension rubric breakdown: Visual match (25), Requirements (20), Accessibility (15), Time/Lighting (15), Practicality (15), Risk score (10).
   - Real Parallel Search citations, verbatim excerpts, source titles, and live URLs.
   - Verified risks and mitigation strategies.
5. **Master Shooting Schedule**:
   - Complete day-by-day sequence with call times, estimated wrap, and scene activities.

---

## 2. Daily Call Sheet (`.pdf`)

The **Daily Call Sheet** is a single-day focused operational document for on-set cast and crew.

### Key Features:
- **Header Banner**: Project title, shooting day number, date, and status.
- **Key Call Times**: Crew call time, estimated wrap, primary location, crew size estimate.
- **Scene Schedule Timeline**: Hour-by-hour blocks with scene numbers, activities, cast involved, and special notes.
- **Safety, Logistics & Parking**: Loading dock instructions, safety warnings, and emergency contact placeholders.

---

## 3. Shooting Calendar (`.ics`)

The **Shooting Calendar** export adheres to the **RFC 5545** iCalendar specification.

### Compatibility:
- **Google Calendar**: Import via `Settings > Import & Export > Select file from computer`.
- **Apple Calendar**: Double-click `.ics` to add to macOS or iOS Calendar.
- **Microsoft Outlook**: Open or drag file into Outlook Calendar view.

### Event Structure:
- `VEVENT` 1: Full-day Production Call event (from call time to wrap time).
- `VEVENT` 2..N: Granular scene shooting blocks with scene headings, character counts, and location details in the event description.

---

## 4. Shooting Schedule (`.csv`)

The **Shooting Schedule CSV** follows **RFC 4180** standards and includes a **UTF-8 Byte Order Mark (BOM)** (`\ufeff`) to ensure seamless special character display in Microsoft Excel and Google Sheets.

### Column Schema:
1. `Day #`
2. `Date`
3. `Call Time`
4. `Wrap Time`
5. `Start Time`
6. `End Time`
7. `Scene #`
8. `Scene Heading`
9. `Location / Venue`
10. `Setting`
11. `Time of Day`
12. `Activity Description`
13. `Cast Count`
14. `Vehicles`
15. `Est. Crew`
16. `Complexity`
17. `Production Notes`
18. `Verified Risks`

---

## 🔌 API Endpoints Reference

```http
# Download Master Production Bible PDF
GET /api/projects/{project_id}/export/production-bible

# Download Daily Call Sheet PDF for specific day
GET /api/projects/{project_id}/export/call-sheet?day=1

# Download RFC 5545 iCalendar
GET /api/projects/{project_id}/export/calendar

# Download RFC 4180 CSV Schedule
GET /api/projects/{project_id}/export/schedule
```
