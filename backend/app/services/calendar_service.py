"""
StudioScout AI — Shooting Calendar (.ICS) Service

Generates standards-compliant RFC 5545 iCalendar (.ics) files from canonical
ProductionPlan and Scene data. Compatible with Google Calendar, Apple Calendar,
Microsoft Outlook, and mobile calendar apps.
"""
from datetime import datetime, date, time, timedelta, timezone
from typing import List, Optional
import re
import hashlib

from app.models.project import Project
from app.models.plan import ProductionPlan, ShootingDay, ShootingBlock
from app.models.scene import Scene


def _escape_ics_text(text: str) -> str:
    """Escape text for iCalendar format according to RFC 5545."""
    if not text:
        return ""
    # Replace backslashes, semicolons, commas, and newlines
    text = text.replace("\\", "\\\\")
    text = text.replace(";", "\\;")
    text = text.replace(",", "\\,")
    text = text.replace("\r\n", "\\n").replace("\n", "\\n").replace("\r", "\\n")
    return text


def _parse_time_to_minutes(time_str: str) -> int:
    """Parse 'HH:MM' into minutes from midnight."""
    match = re.search(r"(\d{1,2}):(\d{2})", time_str)
    if match:
        hours = int(match.group(1))
        minutes = int(match.group(2))
        return hours * 60 + minutes
    return 8 * 60  # Default 08:00 AM


def generate_ics_calendar(project: Project, plan: ProductionPlan, scenes: List[Scene]) -> str:
    """
    Generate RFC 5545 compliant iCalendar (.ics) content from a production plan.
    """
    now_utc = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    
    # Base date: use project created_at or today + 7 days for schedule planning
    base_date = project.created_at.date() if project.created_at else date.today()
    if base_date < date.today():
        base_date = date.today() + timedelta(days=7)

    scene_map = {s.scene_number: s for s in scenes}

    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//StudioScout AI//Film Production Assistant//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{_escape_ics_text(project.name)} - Shooting Schedule",
        f"X-WR-CALDESC:Autonomous production shooting schedule for {project.name} ({project.production_city})",
    ]

    for day in plan.shooting_days:
        day_offset = day.day_number - 1
        shoot_date = base_date + timedelta(days=day_offset)
        shoot_date_str = shoot_date.strftime("%Y%m%d")

        # 1. Main Full-Day Production Call Event
        call_mins = _parse_time_to_minutes(day.call_time)
        wrap_mins = _parse_time_to_minutes(day.wrap_time)
        
        call_time_obj = time(hour=call_mins // 60, minute=call_mins % 60)
        wrap_time_obj = time(hour=wrap_mins // 60, minute=wrap_mins % 60)
        
        start_dt_str = f"{shoot_date_str}T{call_time_obj.strftime('%H%M%S')}"
        end_dt_str = f"{shoot_date_str}T{wrap_time_obj.strftime('%H%M%S')}"

        day_uid = f"studioscout-{project.id}-day{day.day_number}-main"
        
        day_desc_lines = [
            f"Production: {project.name} ({project.genre.value.title()})",
            f"Location: {day.location}",
            f"Crew Call: {day.call_time} | Est. Wrap: {day.wrap_time}",
            f"Est. Crew Size: {day.crew_size or 'Not specified'}",
            f"Complexity Tier: {day.complexity.upper()}",
        ]
        if day.notes:
            day_desc_lines.append(f"Production Notes: {'; '.join(day.notes)}")
            
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{day_uid}@studioscout.ai",
            f"DTSTAMP:{now_utc}",
            f"DTSTART:{start_dt_str}",
            f"DTEND:{end_dt_str}",
            f"SUMMARY:🎬 DAY {day.day_number}: Crew Call - {project.name}",
            f"LOCATION:{_escape_ics_text(day.location or project.production_city)}",
            f"DESCRIPTION:{_escape_ics_text(chr(10).join(day_desc_lines))}",
            "STATUS:CONFIRMED",
            "CATEGORIES:FILM PRODUCTION,SHOOTING SCHEDULE",
            "END:VEVENT"
        ])

        # 2. Individual Scene/Activity Blocks
        for idx, block in enumerate(day.blocks, start=1):
            block_start_mins = _parse_time_to_minutes(block.start_time)
            block_end_mins = _parse_time_to_minutes(block.end_time)
            
            b_start_time = time(hour=block_start_mins // 60, minute=block_start_mins % 60)
            b_end_time = time(hour=block_end_mins // 60, minute=block_end_mins % 60)
            
            b_start_str = f"{shoot_date_str}T{b_start_time.strftime('%H%M%S')}"
            b_end_str = f"{shoot_date_str}T{b_end_time.strftime('%H%M%S')}"

            block_uid = f"studioscout-{project.id}-day{day.day_number}-block{idx}"
            
            scene_info = scene_map.get(block.scene_number) if block.scene_number else None
            
            block_desc_lines = [
                f"Activity: {block.activity}",
                f"Location: {block.location or day.location}",
            ]
            if scene_info:
                block_desc_lines.append(f"Heading: {scene_info.heading}")
                block_desc_lines.append(f"Time/Setting: {scene_info.time_of_day.upper()} / {scene_info.setting.upper()}")
                if scene_info.characters:
                    block_desc_lines.append(f"Cast On Set: {scene_info.characters} characters")
            if block.notes:
                block_desc_lines.append(f"Block Notes: {block.notes}")

            block_summary = f"🎥 Scene {block.scene_number}: {block.activity}" if block.scene_number else f"⏱️ {block.activity}"

            lines.extend([
                "BEGIN:VEVENT",
                f"UID:{block_uid}@studioscout.ai",
                f"DTSTAMP:{now_utc}",
                f"DTSTART:{b_start_str}",
                f"DTEND:{b_end_str}",
                f"SUMMARY:{_escape_ics_text(block_summary)}",
                f"LOCATION:{_escape_ics_text(block.location or day.location or project.production_city)}",
                f"DESCRIPTION:{_escape_ics_text(chr(10).join(block_desc_lines))}",
                "STATUS:CONFIRMED",
                "CATEGORIES:FILM PRODUCTION,SCENE BLOCK",
                "END:VEVENT"
            ])

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines) + "\r\n"
