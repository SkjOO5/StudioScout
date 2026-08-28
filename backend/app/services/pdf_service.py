"""
StudioScout AI — Production Bible & Daily Call Sheet PDF Generator

Uses ReportLab Platypus to generate Hollywood-grade, print-friendly,
publication-ready production documents from canonical project data.
"""
import io
import re
from datetime import datetime, date, timedelta
from typing import List, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

from app.models.project import Project
from app.models.plan import ProductionPlan, ShootingDay
from app.models.scene import Scene
from app.models.candidate import LocationCandidate


# ─── Brand Colors ────────────────────────────────────────────────────────────
PRIMARY = colors.HexColor("#7C3AED")      # Studio Purple
PRIMARY_DARK = colors.HexColor("#5B21B6") # Deep Purple
PRIMARY_LIGHT = colors.HexColor("#EDE9FE")# Soft Purple
TEXT_MAIN = colors.HexColor("#0F172A")    # Slate 900
TEXT_MUTED = colors.HexColor("#475569")   # Slate 600
SURFACE_BG = colors.HexColor("#F8FAFC")   # Slate 50
BORDER_COLOR = colors.HexColor("#CBD5E1") # Slate 300
ACCENT_AMBER = colors.HexColor("#D97706") # Amber 600
ACCENT_GREEN = colors.HexColor("#059669") # Emerald 600


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas for dynamic 'Page X of Y' pagination and running headers/footers."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(TEXT_MUTED)

        # Skip headers/footers on cover page
        if self._pageNumber > 1:
            # Header
            self.drawString(54, 750, "STUDIOSCOUT AI  •  OFFICIAL PRODUCTION ARTIFACT")
            self.setStrokeColor(BORDER_COLOR)
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

            # Footer
            self.line(54, 45, 558, 45)
            gen_str = f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}"
            self.drawString(54, 32, f"CONFIDENTIAL  •  {gen_str}")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 32, page_text)

        self.restoreState()


def _sanitize_text(text: Optional[str]) -> str:
    """Escapes XML entities for ReportLab Paragraphs."""
    if not text:
        return "Not provided"
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def _get_styles():
    """Build brand typography styles."""
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        textColor=PRIMARY_DARK,
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=PRIMARY,
        spaceAfter=15,
    )
    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=PRIMARY_DARK,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True,
    )
    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=TEXT_MAIN,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )
    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=TEXT_MAIN,
        spaceAfter=4,
    )
    body_bold = ParagraphStyle(
        "BodyBoldCustom",
        parent=body_style,
        fontName="Helvetica-Bold",
    )
    table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=TEXT_MAIN,
    )
    table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
    )
    callout_style = ParagraphStyle(
        "CalloutText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=13,
        textColor=TEXT_MAIN,
    )
    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "h1": h1_style,
        "h2": h2_style,
        "body": body_style,
        "bold": body_bold,
        "cell": table_cell,
        "th": table_header,
        "callout": callout_style,
    }


def generate_production_bible_pdf(
    project: Project,
    plan: Optional[ProductionPlan],
    scenes: List[Scene],
    candidates: List[LocationCandidate]
) -> bytes:
    """Generate the full Master Production Bible PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )
    styles = _get_styles()
    story = []

    # ── 1. COVER PAGE ──────────────────────────────────────────────────────────
    story.append(Spacer(1, 40))
    story.append(Paragraph("STUDIOSCOUT AI", styles["subtitle"]))
    story.append(Paragraph(_sanitize_text(project.name).upper(), styles["title"]))
    story.append(Paragraph(f"PRODUCTION BIBLE &amp; LOCATION INTELLIGENCE DOSSIER", styles["subtitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=PRIMARY, spaceAfter=20))

    meta_data = [
        [Paragraph("<b>Genre</b>", styles["cell"]), Paragraph(_sanitize_text(project.genre.value.title()), styles["cell"])],
        [Paragraph("<b>Production City</b>", styles["cell"]), Paragraph(_sanitize_text(project.production_city), styles["cell"])],
        [Paragraph("<b>Budget Tier</b>", styles["cell"]), Paragraph(_sanitize_text(project.budget_tier.value.title()), styles["cell"])],
        [Paragraph("<b>Total Scenes</b>", styles["cell"]), Paragraph(str(len(scenes)), styles["cell"])],
        [Paragraph("<b>Plan Version</b>", styles["cell"]), Paragraph(f"v{plan.version if plan else 1}", styles["cell"])],
        [Paragraph("<b>Document Status</b>", styles["cell"]), Paragraph("Production Ready", styles["cell"])],
        [Paragraph("<b>Generated Timestamp</b>", styles["cell"]), Paragraph(datetime.utcnow().strftime("%B %d, %Y - %H:%M UTC"), styles["cell"])],
    ]
    meta_table = Table(meta_data, colWidths=[150, 350])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), PRIMARY_LIGHT),
        ('BACKGROUND', (1, 0), (1, -1), SURFACE_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)

    if project.scene_description:
        story.append(Spacer(1, 15))
        story.append(Paragraph("<b>LOGLINE / SCENE PREMISE:</b>", styles["h2"]))
        story.append(Paragraph(_sanitize_text(project.scene_description), styles["body"]))

    story.append(PageBreak())

    # ── 2. EXECUTIVE PRODUCTION SUMMARY ───────────────────────────────────────
    story.append(Paragraph("1. Executive Production Summary", styles["h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10))

    total_days = plan.total_days if plan else 0
    cands_count = len(candidates)
    
    summary_text = (
        f"This document represents the official AI-scouted production plan for <b>{_sanitize_text(project.name)}</b>. "
        f"The production spans <b>{len(scenes)} script scenes</b> across <b>{total_days or 'multi'} shooting days</b> in "
        f"<b>{_sanitize_text(project.production_city)}</b>, backed by <b>{cands_count} verified location candidates</b> "
        f"sourced via Parallel Search."
    )
    story.append(Paragraph(summary_text, styles["body"]))
    story.append(Spacer(1, 10))

    if plan and plan.overall_risks:
        story.append(Paragraph("<b>Primary Production Risks &amp; Watch-items:</b>", styles["h2"]))
        for risk in plan.overall_risks:
            story.append(Paragraph(f"• {_sanitize_text(risk)}", styles["body"]))
        story.append(Spacer(1, 10))

    if plan and plan.recommended_actions:
        story.append(Paragraph("<b>Recommended Next Actions for Line Producer:</b>", styles["h2"]))
        for action in plan.recommended_actions:
            story.append(Paragraph(f"• {_sanitize_text(action)}", styles["body"]))
        story.append(Spacer(1, 10))

    # ── 3. SCENE BREAKDOWN ────────────────────────────────────────────────────
    story.append(Spacer(1, 10))
    story.append(Paragraph("2. Script Scene Breakdown", styles["h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10))

    scene_headers = [
        Paragraph("<b>Scn #</b>", styles["th"]),
        Paragraph("<b>Scene Heading</b>", styles["th"]),
        Paragraph("<b>Setting / Time</b>", styles["th"]),
        Paragraph("<b>Cast / Vehicles</b>", styles["th"]),
        Paragraph("<b>Core Requirements</b>", styles["th"]),
    ]
    scene_rows = [scene_headers]
    for s in scenes:
        reqs_str = "; ".join([r.description for r in s.requirements]) if s.requirements else "Standard production setup"
        scene_rows.append([
            Paragraph(str(s.scene_number), styles["cell"]),
            Paragraph(f"<b>{_sanitize_text(s.heading)}</b><br/><font color='#64748B'>{_sanitize_text(s.location)}</font>", styles["cell"]),
            Paragraph(f"{_sanitize_text(s.setting.upper())}<br/>{_sanitize_text(s.time_of_day.upper())}", styles["cell"]),
            Paragraph(f"Cast: {s.characters or 0}<br/>Vehicles: {'Yes' if s.vehicles else 'No'}", styles["cell"]),
            Paragraph(_sanitize_text(reqs_str), styles["cell"]),
        ])

    scene_table = Table(scene_rows, colWidths=[35, 150, 85, 75, 155])
    scene_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SURFACE_BG]),
    ]))
    story.append(scene_table)
    story.append(PageBreak())

    # ── 4. LOCATION CANDIDATE EVALUATION & CITATIONS ─────────────────────────
    story.append(Paragraph("3. Source-Grounded Location Intelligence", styles["h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10))
    story.append(Paragraph(
        "Each location candidate is vetted across our 6-dimension rubric and verified with real web evidence via Parallel Search.",
        styles["body"]
    ))
    story.append(Spacer(1, 10))

    cand_map = {}
    for c in candidates:
        cand_map.setdefault(c.scene_id, []).append(c)

    for s in scenes:
        scene_cands = cand_map.get(s.id, [])
        if not scene_cands:
            continue

        story.append(Paragraph(f"<b>SCENE {s.scene_number}: {_sanitize_text(s.heading)}</b>", styles["h2"]))
        
        for c in scene_cands:
            score_color = "#059669" if c.match_score >= 85 else ("#D97706" if c.match_score >= 70 else "#DC2626")
            cand_box_data = [
                [
                    Paragraph(f"<b>{_sanitize_text(c.name)}</b> ({_sanitize_text(c.city)})", styles["cell"]),
                    Paragraph(f"<font color='{score_color}'><b>MATCH SCORE: {c.match_score:.1f}/100</b></font>", styles["cell"])
                ],
                [
                    Paragraph(f"<b>Why Selected:</b> {_sanitize_text(c.description)}", styles["cell"]),
                    Paragraph(
                        f"<b>Score Breakdown:</b><br/>"
                        f"Visual: {c.score_breakdown.visual_match}/25 | Tech: {c.score_breakdown.location_requirements}/20<br/>"
                        f"Access: {c.score_breakdown.accessibility}/15 | Time: {c.score_breakdown.time_lighting}/15<br/>"
                        f"Feasibility: {c.score_breakdown.production_practicality}/15 | Risk: {c.score_breakdown.risk_score}/10",
                        styles["cell"]
                    )
                ]
            ]
            
            # Evidence quotes
            if c.evidence:
                ev_lines = ["<b>Parallel Search Verified Evidence:</b>"]
                for ev in c.evidence[:2]:
                    ev_lines.append(f"• <i>\"{_sanitize_text(ev.excerpt[:140])}...\"</i><br/>&nbsp;&nbsp;<font color='#6366F1'>Source: {_sanitize_text(ev.source_title)} ({_sanitize_text(ev.source_url[:40])}...)</font>")
                cand_box_data.append([Paragraph("<br/>".join(ev_lines), styles["cell"]), Paragraph(f"<b>Recommended Action:</b><br/>{_sanitize_text(c.recommended_action or 'Permission status requires formal permit confirmation.')}", styles["cell"])])

            cand_table = Table(cand_box_data, colWidths=[280, 220])
            cand_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_LIGHT),
                ('BOX', (0, 0), (-1, -1), 1, PRIMARY),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ]))
            story.append(cand_table)
            story.append(Spacer(1, 8))

    story.append(PageBreak())

    # ── 5. MASTER PRODUCTION SCHEDULE ─────────────────────────────────────────
    story.append(Paragraph("4. Master Shooting Schedule", styles["h1"]))
    story.append(HRFlowable(width="100%", thickness=1, color=PRIMARY, spaceAfter=10))

    if plan and plan.shooting_days:
        for day in plan.shooting_days:
            day_table_data = [
                [
                    Paragraph(f"<b>DAY {day.day_number}: {_sanitize_text(day.date_label)}</b>", styles["th"]),
                    Paragraph(f"<b>Location: {_sanitize_text(day.location)}</b>", styles["th"]),
                    Paragraph(f"<b>Call: {day.call_time} | Wrap: {day.wrap_time}</b>", styles["th"]),
                ]
            ]
            
            block_rows = []
            for b in day.blocks:
                scn_txt = f"Scene {b.scene_number}" if b.scene_number else "-"
                block_rows.append([
                    Paragraph(f"<b>{b.start_time} - {b.end_time}</b>", styles["cell"]),
                    Paragraph(f"<b>{_sanitize_text(b.activity)}</b><br/><font color='#64748B'>{scn_txt} • {_sanitize_text(b.location or day.location)}</font>", styles["cell"]),
                    Paragraph(_sanitize_text(b.notes or "-"), styles["cell"])
                ])
            
            d_table = Table(day_table_data + block_rows, colWidths=[100, 250, 150])
            d_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
                ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SURFACE_BG]),
            ]))
            story.append(d_table)
            story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("Schedule generation pending active agent plan.", styles["body"]))

    doc.build(story, canvasmaker=NumberedCanvas)
    return buffer.getvalue()


def generate_call_sheet_pdf(
    project: Project,
    day: ShootingDay,
    scenes: List[Scene],
    candidates: Optional[List[LocationCandidate]] = None
) -> bytes:
    """Generate a single-day Hollywood-grade Call Sheet PDF."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )
    styles = _get_styles()
    story = []

    # ── HEADER BANNER ──────────────────────────────────────────────────────────
    header_data = [
        [
            Paragraph(f"<font size=16><b>{_sanitize_text(project.name).upper()}</b></font><br/>OFFICIAL DAILY CALL SHEET", styles["cell"]),
            Paragraph(f"<font size=14 color='#5B21B6'><b>DAY {day.day_number} OF {day.date_label}</b></font><br/>Status: CONFIRMED", styles["cell"])
        ]
    ]
    h_table = Table(header_data, colWidths=[300, 240])
    h_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_LIGHT),
        ('BOX', (0, 0), (-1, -1), 1.5, PRIMARY_DARK),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(h_table)
    story.append(Spacer(1, 10))

    # ── KEY CALL TIMES & LOCATION ──────────────────────────────────────────────
    key_times_data = [
        [
            Paragraph("<b>CREW CALL</b>", styles["cell"]),
            Paragraph(f"<font size=12 color='#7C3AED'><b>{day.call_time}</b></font>", styles["cell"]),
            Paragraph("<b>EST. WRAP TIME</b>", styles["cell"]),
            Paragraph(f"<font size=12><b>{day.wrap_time}</b></font>", styles["cell"]),
        ],
        [
            Paragraph("<b>PRIMARY LOCATION</b>", styles["cell"]),
            Paragraph(f"<b>{_sanitize_text(day.location)}</b>", styles["cell"]),
            Paragraph("<b>PRODUCTION CITY</b>", styles["cell"]),
            Paragraph(_sanitize_text(project.production_city), styles["cell"]),
        ],
        [
            Paragraph("<b>EST. CREW SIZE</b>", styles["cell"]),
            Paragraph(f"{day.crew_size or 'Not specified'} members", styles["cell"]),
            Paragraph("<b>COMPLEXITY TIER</b>", styles["cell"]),
            Paragraph(day.complexity.upper(), styles["cell"]),
        ]
    ]
    kt_table = Table(key_times_data, colWidths=[110, 160, 110, 160])
    kt_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), SURFACE_BG),
        ('BACKGROUND', (2, 0), (2, -1), SURFACE_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(kt_table)
    story.append(Spacer(1, 10))

    # ── SCENE SCHEDULE TABLE ──────────────────────────────────────────────────
    story.append(Paragraph("<b>DAY SHOOTING SCHEDULE &amp; TIMELINE</b>", styles["h2"]))
    
    scene_map = {s.scene_number: s for s in scenes}
    sched_headers = [
        Paragraph("<b>Time</b>", styles["th"]),
        Paragraph("<b>Scene #</b>", styles["th"]),
        Paragraph("<b>Scene Heading / Activity</b>", styles["th"]),
        Paragraph("<b>Location / Space</b>", styles["th"]),
        Paragraph("<b>Cast</b>", styles["th"]),
        Paragraph("<b>Notes / Watchouts</b>", styles["th"]),
    ]
    sched_rows = [sched_headers]
    for b in day.blocks:
        s = scene_map.get(b.scene_number) if b.scene_number else None
        scn_str = str(b.scene_number) if b.scene_number else "-"
        cast_str = str(s.characters) if s and s.characters else "-"
        
        sched_rows.append([
            Paragraph(f"<b>{b.start_time} - {b.end_time}</b>", styles["cell"]),
            Paragraph(scn_str, styles["cell"]),
            Paragraph(f"<b>{_sanitize_text(b.activity)}</b><br/><font color='#64748B'>{_sanitize_text(s.heading if s else '')}</font>", styles["cell"]),
            Paragraph(_sanitize_text(b.location or day.location), styles["cell"]),
            Paragraph(cast_str, styles["cell"]),
            Paragraph(_sanitize_text(b.notes or "-"), styles["cell"])
        ])

    sched_table = Table(sched_rows, colWidths=[75, 45, 160, 110, 35, 115])
    sched_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_DARK),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SURFACE_BG]),
    ]))
    story.append(sched_table)
    story.append(Spacer(1, 10))

    # ── LOGISTICS, SAFETY & EMERGENCY CONTACTS ────────────────────────────────
    notes_str = "; ".join(day.notes) if day.notes else "All crew must wear safety badges on set."
    logistics_data = [
        [
            Paragraph("<b>PRODUCTION &amp; SAFETY NOTES</b>", styles["cell"]),
            Paragraph(_sanitize_text(notes_str), styles["cell"]),
        ],
        [
            Paragraph("<b>LOCATION ACCESS &amp; PARKING</b>", styles["cell"]),
            Paragraph(f"Access via main gate at {_sanitize_text(day.location)}. Production trucks staging in loading bay.", styles["cell"]),
        ],
        [
            Paragraph("<b>EMERGENCY CONTACTS</b>", styles["cell"]),
            Paragraph(
                "• <b>Production Manager:</b> Not configured in project profile<br/>"
                "• <b>Location Scout:</b> Not configured in project profile<br/>"
                "• <b>Local Emergency Services:</b> 112 (National Emergency Dispatch)",
                styles["cell"]
            ),
        ]
    ]
    log_table = Table(logistics_data, colWidths=[160, 380])
    log_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), SURFACE_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(log_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    return buffer.getvalue()
