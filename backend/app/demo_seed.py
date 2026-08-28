"""
StudioScout AI — Demo Data Seeder

Seeds a complete, production-grade 'Neon Shadows' neo-noir thriller project.
Allows instant evaluation during hackathon judging and live demonstrations.
"""
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any

from app.models.project import Project, Genre, BudgetTier, ProjectStatus
from app.models.scene import Scene, SceneRequirement
from app.models.candidate import LocationCandidate, ScoreBreakdown, Evidence, Risk
from app.models.plan import ProductionPlan, ShootingDay, ShootingBlock, PlanConstraint
from app.models.agent_run import AgentRun, AgentStep, RunState, StepStatus
from app.models.search import SearchResponse, SearchResult
from app.store import store

DEMO_PROJECT_ID = "demo-neon-shadows"

DEMO_SCREENPLAY = """TITLE: NEON SHADOWS
GENRE: Neo-Noir Thriller
WRITTEN BY: Alex Thorne

SCENE 1
INT. KAVITA'S APARTMENT - NIGHT
Rain hammers the single high-rise window overlooking the neon haze of the city below. 
KAVITA (32, investigative journalist, bruised knuckles) frantically packs hard drives into a waterproof duffel. 
ARJUN (35, ex-intelligence, soaked jacket) stands guard by the cracked door, holding a silenced sidearm.
Shadows stretch across the cramped, dimly lit room. 

SCENE 2
INT. UNDERGROUND PARKING GARAGE - NIGHT
Echoes of dripping pipes. Steam rises from sewer grates in the subterranean darkness.
Two black SUVs idle at opposite ends of the concrete ramp.
Arjun guides Kavita behind massive load-bearing pillars. The concrete floor is damp with oil slicks.

SCENE 3
INT. ABANDONED INDUSTRIAL WAREHOUSE - NIGHT
A cavernous, decommissioned textile mill with rusted corrugated iron roof and exposed steel trusses.
High ceiling clerestory windows let in fractured moonlight and sodium streetlamp glow.
Debris, old machinery, and wooden pallets are scattered across 8,000 sq ft of open industrial floor.

SCENE 4
EXT. ROOFTOP CHASE - NIGHT (DUSK / NIGHT)
Wind whips across the gravel-topped commercial rooftop. 
Rain slicked HVAC units, water towers, and cellular antennas create an obstacle course.
Arjun sprints across the roof ledge, vaulting over ventilation ducts.

SCENE 5
INT. CITY GENERAL HOSPITAL - DAY (DAWN)
Bleached fluorescent lighting, polished linoleum floors, sterile corridors.
Nurses and security staff move briskly between patient triage bays.
Kavita, disguise cap pulled low, slips into the records archive corridor.
"""


def seed_demo_project() -> Project:
    """Seed the complete Neon Shadows project into persistent storage."""
    
    # 1. Project
    project = Project(
        id=DEMO_PROJECT_ID,
        name="Neon Shadows",
        genre=Genre.THRILLER,
        production_city="Mumbai",
        budget_tier=BudgetTier.MID,
        status=ProjectStatus.COMPLETED,
        scene_description="A gritty neo-noir investigative thriller shot across industrial and high-rise Mumbai locations.",
        screenplay_filename="neon_shadows_screenplay.pdf",
        screenplay_text=DEMO_SCREENPLAY,
        created_at=datetime.utcnow() - timedelta(minutes=15),
        updated_at=datetime.utcnow(),
        scene_count=4,
        has_recommendations=True,
        has_plan=True,
    )
    store.save_project(project)

    # 2. Scenes
    s2_id = f"{DEMO_PROJECT_ID}-scene-1"
    s3_id = f"{DEMO_PROJECT_ID}-scene-2"
    s4_id = f"{DEMO_PROJECT_ID}-scene-3"
    s5_id = f"{DEMO_PROJECT_ID}-scene-4"

    scenes = [
        Scene(
            id=s2_id,
            project_id=DEMO_PROJECT_ID,
            scene_number=1,
            heading="INT. UNDERGROUND PARKING GARAGE - NIGHT",
            location="Subterranean Parking Structure",
            location_type="commercial",
            time_of_day="night",
            setting="interior",
            description="Multi-level concrete garage with oil slicks, massive load-bearing pillars, and steam.",
            characters=4,
            vehicles=True,
            props=["Two black SUVs", "Unmarked pursuit sedan", "Transformer junction box"],
            special_constraints=["Vehicle maneuvering space for 3 stunt cars", "Water spraying clearance for wet asphalt reflection"],
            requirements=[
                SceneRequirement(category="vehicle_access", description="Clearance height minimum 2.8m for camera chase cranes and SUVs", priority="required"),
                SceneRequirement(category="space_size", description="Unoccupied parking floor spanning at least 15,000 sq ft", priority="required"),
                SceneRequirement(category="special_permits", description="Private property film permission with overnight fire safety clearance", priority="required"),
            ],
            research_status="completed",
            recommendation_status="available",
        ),
        Scene(
            id=s3_id,
            project_id=DEMO_PROJECT_ID,
            scene_number=2,
            heading="INT. ABANDONED INDUSTRIAL WAREHOUSE - NIGHT",
            location="Textile Mill Warehouse",
            location_type="industrial",
            time_of_day="night",
            setting="interior",
            description="Decommissioned textile mill with rusted corrugated roof, exposed steel trusses, and clerestory windows.",
            characters=3,
            vehicles=True,
            props=["Iron workbench", "Steel chain sliding lock", "Industrial pallets", "Rusted loom gears"],
            special_constraints=["Generator truck access for 200A 3-phase lighting rig", "Hazer and smoke effect clearance"],
            requirements=[
                SceneRequirement(category="space_size", description="Cavernous open industrial floor of 8,000 - 15,000 sq ft with 25ft ceiling", priority="required"),
                SceneRequirement(category="vehicle_access", description="Direct loading dock door for equipment roll-in", priority="required"),
                SceneRequirement(category="special_permits", description="Structural stability inspection certification for film crew", priority="required"),
            ],
            research_status="completed",
            recommendation_status="available",
        ),
        Scene(
            id=s4_id,
            project_id=DEMO_PROJECT_ID,
            scene_number=3,
            heading="EXT. ROOFTOP CHASE - NIGHT (DUSK / NIGHT)",
            location="Commercial Tower Rooftop",
            location_type="exterior-urban",
            time_of_day="night",
            setting="exterior",
            description="Gravel rooftop with HVAC ducts, cellular antennas, water towers, and panoramic Mumbai skyline view.",
            characters=3,
            vehicles=False,
            props=["Fire escape ladder", "Stunt safety rigging", "Discharge pyrotechnics"],
            special_constraints=["Stunt wire-rig anchor points", "Parapet wall minimum 1.1m height for safety"],
            requirements=[
                SceneRequirement(category="space_size", description="Unrestricted 5,000 sq ft rooftop area with unblocked 180-degree skyline", priority="required"),
                SceneRequirement(category="special_permits", description="Aviation light & building management night shooting NOC", priority="required"),
                SceneRequirement(category="crew_size", description="Service elevator rated for 15+ passengers to roof level", priority="required"),
            ],
            research_status="completed",
            recommendation_status="available",
        ),
        Scene(
            id=s5_id,
            project_id=DEMO_PROJECT_ID,
            scene_number=4,
            heading="INT. CITY GENERAL HOSPITAL - DAY (DAWN)",
            location="Hospital Wing / Medical Archive",
            location_type="institutional",
            time_of_day="dawn",
            setting="interior",
            description="Sterile corridors with polished linoleum, triage bays, and archival medical record rooms.",
            characters=5,
            vehicles=False,
            props=["Medical trolleys", "Emergency gurneys", "Medical consultation clipboard"],
            special_constraints=["Silent filming in operational facility or decommissioned hospital wing"],
            requirements=[
                SceneRequirement(category="space_size", description="200ft straight corridor with adjoining consultation room", priority="required"),
                SceneRequirement(category="lighting_control", description="Fluorescent tube color temperature balance (5600K)", priority="preferred"),
                SceneRequirement(category="noise_sensitivity", description="Decommissioned hospital floor preferred to avoid clinical disruption", priority="required"),
            ],
            research_status="completed",
            recommendation_status="available",
        ),
    ]
    store.save_scenes(DEMO_PROJECT_ID, scenes)


    # 3. Candidates for Scene 3 (Warehouse) & Others
    cand_s3_1 = LocationCandidate(
        id=f"{DEMO_PROJECT_ID}-cand-s3-1",
        scene_id=s3_id,
        project_id=DEMO_PROJECT_ID,
        name="Mukesh Mills & Heritage Compound",
        description="Historic 12,000 sq ft sea-facing decommissioned textile mill with 30ft exposed steel trusses, rustic brickwork, and direct loading docks.",
        location_type="industrial",
        city="Mumbai (Colaba / Lower Parel)",
        match_score=94.5,
        score_breakdown=ScoreBreakdown(
            visual_match=24.5,
            location_requirements=19.5,
            accessibility=14.0,
            time_lighting=14.5,
            production_practicality=13.5,
            risk_score=8.5,
        ),
        strengths=[
            "Authentic 19th-century exposed truss roof and iron lattice windows matching screenplay description exactly",
            "Dedicated private compound with secure overnight perimeter for stunt equipment",
            "Over 12,000 sq ft uninterrupted interior space with concrete base",
            "Direct truck loading dock access for 125kVA generator power supply",
        ],
        weaknesses=[
            "Requires structural engineering sign-off for heavy rooftop lighting rigging",
            "No active air ventilation — requires high-capacity industrial fans for crew comfort",
        ],
        risks=[
            Risk(
                category="permit",
                description="Heritage precinct filming permission needed from Mumbai Municipal Corporation (BMC)",
                severity="medium",
                mitigation="Standard film commission fast-track window (5-7 business days via single-window clearance)",
            ),
            Risk(
                category="safety",
                description="Uneven floor patches near western loading bay",
                severity="low",
                mitigation="Production safety team to lay rubberized cable ramp track over uneven sections",
            ),
        ],
        evidence=[
            Evidence(
                requirement="Large industrial space > 8,000 sq ft",
                excerpt="...Mukesh Mills industrial complex provides over 15,000 sq ft of contiguous production space widely utilized for Bollywood feature films...",
                source_url="https://filminginindia.gov.in/locations/mumbai-mills",
                source_title="India Film Facilitation Portal",
                confidence="high",
            ),
            Evidence(
                requirement="Night shooting & generator vehicle access",
                excerpt="...compound features 24/7 gate security, private truck drive-in bay, and dedicated space for three 125 kVA generator vans...",
                source_url="https://mumbailocationscout.com/industrial/colaba-warehouse",
                source_title="Mumbai Location Directory",
                confidence="high",
            ),
        ],
        sources=[
            "https://filminginindia.gov.in/locations/mumbai-mills",
            "https://mumbailocationscout.com/industrial/colaba-warehouse",
        ],
        recommended_action="Book 3-day hold for Scene 3 and submit single-window film permit to BMC.",
        rank=1,
    )

    cand_s3_2 = LocationCandidate(
        id=f"{DEMO_PROJECT_ID}-cand-s3-2",
        scene_id=s3_id,
        project_id=DEMO_PROJECT_ID,
        name="Kanjurmarg Industrial Logistics Park",
        description="Modernized high-bay industrial warehouse spanning 10,000 sq ft with insulated metal roofing and active 3-phase power.",
        location_type="industrial",
        city="Mumbai (Kanjurmarg East)",
        match_score=86.0,
        score_breakdown=ScoreBreakdown(
            visual_match=20.0,
            location_requirements=18.0,
            accessibility=15.0,
            time_lighting=13.0,
            production_practicality=13.0,
            risk_score=7.0,
        ),
        strengths=[
            "Direct highway connectivity via Eastern Express Highway",
            "Modern power supply with 63A distribution board already installed",
            "Excellent soundproofing compared to open-truss heritage mills",
        ],
        weaknesses=[
            "Lacks authentic decay/rust aesthetic of the script — requires 1 day of scenic aging dressing",
            "Active daytime forklift traffic in adjacent bays",
        ],
        risks=[
            Risk(
                category="noise",
                description="Adjacent logistics bays operate between 06:00 and 22:00",
                severity="medium",
                mitigation="Restrict principal dialogue photography to 23:00 - 05:00 window",
            ),
        ],
        evidence=[
            Evidence(
                requirement="Clearance & power grid",
                excerpt="...facility offers 32 ft clear ceiling height, epoxy-coated dust-free flooring, and 200 kVA dedicated transformer...",
                source_url="https://logisticsinsider.in/warehouses/mumbai-kanjurmarg",
                source_title="Logistics Properties Mumbai",
                confidence="high",
            ),
        ],
        sources=["https://logisticsinsider.in/warehouses/mumbai-kanjurmarg"],
        recommended_action="Backup candidate if heritage permit encounters delays.",
        rank=2,
    )

    # Save candidates for each scene
    store.save_candidates(s3_id, [cand_s3_1, cand_s3_2])

    cand_s1_1 = LocationCandidate(
        id=f"{DEMO_PROJECT_ID}-cand-s1-1",
        scene_id=s2_id,
        project_id=DEMO_PROJECT_ID,
        name="Crescent Bay Skyline Penthouse Studio",
        description="1,200 sq ft retrofitted art-deco high-rise apartment with floor-to-ceiling city skyline views and acoustic damping.",
        location_type="residential",
        city="Mumbai (Parel)",
        match_score=92.0,
        score_breakdown=ScoreBreakdown(
            visual_match=24.0, location_requirements=18.5, accessibility=13.5,
            time_lighting=14.5, production_practicality=13.0, risk_score=8.5,
        ),
        strengths=["Stunning south Mumbai skyline panorama", "Built-in studio lighting tracks", "Freight elevator access"],
        weaknesses=["Strict midnight quiet hours for exterior courtyard"],
        risks=[],
        evidence=[Evidence(requirement="Skyline view", excerpt="...panoramic 42nd-floor vantage of Mumbai harbour...", source_url="https://filmshootsmumbai.com/studios/crescent", source_title="Studio Directory", confidence="high")],
        sources=["https://filmshootsmumbai.com/studios/crescent"],
        recommended_action="Book for Day 1 evening call.",
        rank=1,
    )
    store.save_candidates(s2_id, [cand_s1_1])

    cand_s2_1 = LocationCandidate(
        id=f"{DEMO_PROJECT_ID}-cand-s2-1",
        scene_id=s2_id,
        project_id=DEMO_PROJECT_ID,
        name="BKC Commercial Complex Sub-Basement B3",
        description="20,000 sq ft concrete underground parking structure with heavy industrial pillars and drainage grating.",
        location_type="commercial",
        city="Mumbai (Bandra-Kurla Complex)",
        match_score=95.0,
        score_breakdown=ScoreBreakdown(
            visual_match=25.0, location_requirements=19.5, accessibility=14.5,
            time_lighting=14.0, production_practicality=13.5, risk_score=8.5,
        ),
        strengths=["Dedicated B3 level closed to public on weekends", "Ample clearance for SUV stunt driving", "Concrete damp aesthetic"],
        weaknesses=["Requires carbon monoxide ventilation management during engine idling"],
        risks=[],
        evidence=[Evidence(requirement="Vehicle clearance", excerpt="...3.2m entrance ramp clearance with 80+ vehicle parking slots...", source_url="https://bkcspaces.com/parking", source_title="BKC Real Estate", confidence="high")],
        sources=["https://bkcspaces.com/parking"],
        recommended_action="Execute weekend night rental agreement with building facility team.",
        rank=1,
    )
    store.save_candidates(s2_id, [cand_s2_1])

    cand_s4_1 = LocationCandidate(
        id=f"{DEMO_PROJECT_ID}-cand-s4-1",
        scene_id=s4_id,
        project_id=DEMO_PROJECT_ID,
        name="Matulya Centre Commercial Rooftop",
        description="Open gravel rooftop overlooking Lower Parel financial towers with heavy-duty HVAC mechanical landscape and fire escape towers.",
        location_type="exterior-urban",
        city="Mumbai (Lower Parel)",
        match_score=93.0,
        score_breakdown=ScoreBreakdown(
            visual_match=24.0, location_requirements=19.0, accessibility=13.5,
            time_lighting=14.0, production_practicality=13.5, risk_score=9.0,
        ),
        strengths=["1.4m safety parapet walls allow dynamic camera crane tracking", "Industrial mechanical aesthetic", "Skyline backdrop"],
        weaknesses=["Weather exposed — backup rain contingency required"],
        risks=[],
        evidence=[Evidence(requirement="Skyline backdrop", excerpt="...unrivaled 360-degree vistas of Mumbai's high-rise corridor...", source_url="https://commercialspacesmumbai.com/matulya", source_title="Commercial Scouting Guide", confidence="high")],
        sources=["https://commercialspacesmumbai.com/matulya"],
        recommended_action="Schedule safety coordinator and stunt rigger recce.",
        rank=1,
    )
    store.save_candidates(s4_id, [cand_s4_1])

    cand_s5_1 = LocationCandidate(
        id=f"{DEMO_PROJECT_ID}-cand-s5-1",
        scene_id=s5_id,
        project_id=DEMO_PROJECT_ID,
        name="Whistling Woods Film City Medical Studio Set",
        description="Permanently dressed 4,000 sq ft hospital set featuring functioning emergency ward, triage bays, and records corridor.",
        location_type="institutional",
        city="Mumbai (Goregaon East)",
        match_score=96.0,
        score_breakdown=ScoreBreakdown(
            visual_match=25.0, location_requirements=20.0, accessibility=14.5,
            time_lighting=14.5, production_practicality=13.0, risk_score=9.0,
        ),
        strengths=["Zero disturbance to real patients", "Controllable LED overhead grids", "Full prop inventory included"],
        weaknesses=["Requires studio stage daily booking rate"],
        risks=[],
        evidence=[Evidence(requirement="Medical set", excerpt="...purpose-built 4-ward clinical set equipped with real medical equipment for cinema production...", source_url="https://whistlingwoods.net/campus/production-sets", source_title="Whistling Woods Studio Sets", confidence="high")],
        sources=["https://whistlingwoods.net/campus/production-sets"],
        recommended_action="Confirm studio stage booking for Day 3 dawn shoot.",
        rank=1,
    )
    store.save_candidates(s5_id, [cand_s5_1])

    # 4. Searches
    search_s3 = SearchResponse(
        objective="Find industrial filming locations in Mumbai with night shooting clearance and vehicle access",
        queries_run=[
            "industrial warehouse filming locations Mumbai Mukesh Mills",
            "abandoned textile mill shoot permit Mumbai Colaba",
            "high ceiling warehouse rental film production Mumbai",
        ],
        results=[
            SearchResult(
                title="Mukesh Mills Heritage Complex — Film Facilitation Portal",
                url="https://filminginindia.gov.in/locations/mumbai-mills",
                domain="filminginindia.gov.in",
                excerpt="Decommissioned textile mill compound in South Mumbai offering 15,000 sq ft of cavernous production floor with 24/7 filming permits.",
                query_used="industrial warehouse filming locations Mumbai Mukesh Mills",
                relevant_to=s3_id,
            ),
            SearchResult(
                title="Industrial Film Locations & Warehouses in Mumbai",
                url="https://mumbailocationscout.com/industrial/colaba-warehouse",
                domain="mumbailocationscout.com",
                excerpt="Features heavy generator truck bays, rustic industrial brickwork, and exposed iron roof trusses ideal for action noir cinema.",
                query_used="abandoned textile mill shoot permit Mumbai Colaba",
                relevant_to=s3_id,
            ),
        ],
        total_found=2,
    )
    store.save_search(s3_id, search_s3, DEMO_PROJECT_ID)

    # 5. Production Plan
    plan = ProductionPlan(
        id=f"{DEMO_PROJECT_ID}-plan-v1",
        project_id=DEMO_PROJECT_ID,
        version=1,
        total_days=3,
        shooting_days=[
            ShootingDay(
                day_number=1,
                date_label="Day 1 — Sub-Basement Vehicle Pursuit",
                location="BKC Sub-Basement B3 Parking Structure",
                call_time="18:00",
                wrap_time="03:30",
                crew_size=28,
                complexity="high",
                blocks=[
                    ShootingBlock(start_time="18:00", end_time="19:30", activity="Crew Call & Stunt Car Camera Rigging", scene_id=s2_id, scene_number=1, location="BKC Sub-Basement"),
                    ShootingBlock(start_time="19:30", end_time="23:30", activity="Principal Photography: Scene 1 (SUV Stunt Pursuit)", scene_id=s2_id, scene_number=1, location="BKC Sub-Basement"),
                    ShootingBlock(start_time="23:30", end_time="00:30", activity="Mid-Shoot Meal & Lighting Reset", scene_id=s2_id, scene_number=1, location="BKC Sub-Basement"),
                    ShootingBlock(start_time="00:30", end_time="03:00", activity="Coverage: High-Speed Cornering & Transformer Crash", scene_id=s2_id, scene_number=1, location="BKC Sub-Basement"),
                    ShootingBlock(start_time="03:00", end_time="03:30", activity="Wrap & Equipment Load-out", location="BKC Sub-Basement"),
                ],
                notes=[
                    "Wet asphalt effect requires 2,000L water bowser at BKC B3 ramp by 19:00.",
                    "Stunt coordinator clearance required before SUV pursuit ignition.",
                ],
            ),
            ShootingDay(
                day_number=2,
                date_label="Day 2 — Industrial Standoff & Rooftop Chase",
                location="Mukesh Mills Colaba + Matulya Centre Rooftop",
                call_time="17:00",
                wrap_time="04:30",
                crew_size=35,
                complexity="high",
                blocks=[
                    ShootingBlock(start_time="17:00", end_time="18:30", activity="Lighting Rigging: 125kVA Generator Power-Up", scene_id=s3_id, scene_number=2, location="Mukesh Mills"),
                    ShootingBlock(start_time="18:30", end_time="23:00", activity="Principal Photography: Scene 2 (Warehouse Standoff)", scene_id=s3_id, scene_number=2, location="Mukesh Mills"),
                    ShootingBlock(start_time="23:00", end_time="00:00", activity="Midnight Meal & Company Move to Lower Parel", scene_id=s4_id, scene_number=3, location="Transit"),
                    ShootingBlock(start_time="00:00", end_time="04:00", activity="Principal Photography: Scene 3 (Rooftop Wire-Rig Stunt)", scene_id=s4_id, scene_number=3, location="Matulya Rooftop"),
                    ShootingBlock(start_time="04:00", end_time="04:30", activity="Daily Wrap", location="Matulya Rooftop"),
                ],
                notes=[
                    "Fire department safety standby officer required during pyrotechnic discharge.",
                    "Wind speeds on Matulya rooftop must be monitored below 25 knots for stunt wire rigging.",
                ],
            ),
            ShootingDay(
                day_number=3,
                date_label="Day 3 — Hospital Corridors & Final Hand-off",
                location="Whistling Woods Medical Studio Set",
                call_time="05:30",
                wrap_time="14:00",
                crew_size=22,
                complexity="medium",
                blocks=[
                    ShootingBlock(start_time="05:30", end_time="06:30", activity="Dawn Lighting Setup & Medical Extras Wardrobe", scene_id=s5_id, scene_number=4, location="Studio Stage 2"),
                    ShootingBlock(start_time="06:30", end_time="11:30", activity="Principal Photography: Scene 4 (Corridor Infiltration)", scene_id=s5_id, scene_number=4, location="Studio Stage 2"),
                    ShootingBlock(start_time="11:30", end_time="13:30", activity="Consultation Room 4B Climax Exchange", scene_id=s5_id, scene_number=4, location="Studio Stage 2"),
                    ShootingBlock(start_time="13:30", end_time="14:00", activity="Production Picture Wrap", location="Studio Stage 2"),
                ],
                notes=[
                    "High key 5600K fluorescent emulation on studio dimmers.",
                    "All prop medical files and hard drives pre-cleared by art department.",
                ],
            ),
        ],
        constraints=[
            PlanConstraint(
                type="availability",
                description="BKC Sub-Basement B3 only accessible during weekend night window (Fri 20:00 to Sun 06:00)",
                affects_scene_ids=[s2_id],
                affects_location="BKC Sub-Basement B3",
            ),
        ],
        overall_risks=[
            "Monsoon rain variability during exterior rooftop sequence (Scene 3)",
            "Heavy generator transport traffic through Colaba narrow heritage lanes",
        ],
        dependencies=[
            "BMC Heritage Precinct filming NOC required 5 days prior to Day 2",
            "Stunt safety harness testing on Day 1 prep",
        ],
        recommended_actions=[
            "Dispatch advance location coordinator to Mukesh Mills for gate access clearance",
            "Lock in Whistling Woods Studio Stage 2 deposit",
        ],
        summary="Optimized 3-day production schedule grouping night exterior stunts and consolidating logistical base in South & Central Mumbai.",
    )
    store.save_plan(DEMO_PROJECT_ID, plan)

    # 6. Agent Run History
    run_id = f"{DEMO_PROJECT_ID}-run-complete"
    run = AgentRun(
        id=run_id,
        project_id=DEMO_PROJECT_ID,
        state=RunState.COMPLETED,
        run_type="scout",
        started_at=datetime.utcnow() - timedelta(minutes=14),
        completed_at=datetime.utcnow() - timedelta(minutes=13),
        total_duration_ms=48200,
        scenes_processed=4,
        searches_performed=4,
        candidates_found=5,
        steps=[
            AgentStep(run_id=run_id, step_index=0, name="Analyzing screenplay", status=StepStatus.COMPLETED, detail="4 scenes extracted from 'Neon Shadows' screenplay", duration_ms=4200, tool_used="gemini"),
            AgentStep(run_id=run_id, step_index=1, name="Extracting production requirements", status=StepStatus.COMPLETED, detail="12 physical & logistical requirements identified across 4 scenes", duration_ms=2100, tool_used="gemini"),
            AgentStep(run_id=run_id, step_index=2, name="Searching for Scene 1: Subterranean Parking Structure", status=StepStatus.COMPLETED, detail="Parallel Search: 11 web results for stunt-rated commercial garages", duration_ms=6100, tool_used="parallel_search"),
            AgentStep(run_id=run_id, step_index=3, name="Evaluating candidates for Scene 1", status=StepStatus.COMPLETED, detail="Top candidate: BKC Commercial Complex B3 (Score: 95.0/100)", duration_ms=4100, tool_used="gemini"),
            AgentStep(run_id=run_id, step_index=4, name="Searching for Scene 2: Textile Mill Warehouse", status=StepStatus.COMPLETED, detail="Parallel Search: 14 web results for industrial mills in Mumbai", duration_ms=6400, tool_used="parallel_search"),
            AgentStep(run_id=run_id, step_index=5, name="Evaluating candidates for Scene 2", status=StepStatus.COMPLETED, detail="Top candidate: Mukesh Mills Heritage Compound (Score: 94.5/100)", duration_ms=4400, tool_used="gemini"),
            AgentStep(run_id=run_id, step_index=6, name="Searching for Scene 3: Commercial Tower Rooftop", status=StepStatus.COMPLETED, detail="Parallel Search: 9 web results for high-rise skyline rooftops", duration_ms=5300, tool_used="parallel_search"),
            AgentStep(run_id=run_id, step_index=7, name="Evaluating candidates for Scene 3", status=StepStatus.COMPLETED, detail="Top candidate: Matulya Centre Rooftop (Score: 93.0/100)", duration_ms=3700, tool_used="gemini"),
            AgentStep(run_id=run_id, step_index=8, name="Searching & Evaluating Scene 4: Medical Studio Set", status=StepStatus.COMPLETED, detail="Top candidate: Whistling Woods Studio Set (Score: 96.0/100)", duration_ms=5100, tool_used="gemini"),
            AgentStep(run_id=run_id, step_index=9, name="Generating production plan", status=StepStatus.COMPLETED, detail="Autonomous 3-day shooting schedule created with call sheets and logistics", duration_ms=4600, tool_used="gemini"),
        ],
    )
    store.save_run(run)
    project.current_run_id = run_id
    store.save_project(project)

    # 7. Storyboard Moodboards
    store.save_storyboard(s3_id, DEMO_PROJECT_ID, {
        "scene_id": s3_id,
        "title": "Scene 2 — Industrial Warehouse Standoff",
        "visual_prompt": "Cavernous abandoned industrial textile mill in Mumbai at midnight, 30ft exposed rusted steel trusses, dust motes caught in moonlight shafts from clerestory windows, concrete floor with oil reflections, cinematic action composition, 8k resolution film still",
        "style": "Industrial Grit",
        "lighting": "Moonlight backlighting with sodium streetlamp spill",
        "color_palette": ["#18181B", "#27272A", "#71717A", "#E4E4E7"],
        "lens_focal_length": "50mm Anamorphic",
        "aspect_ratio": "2.39:1",
        "camera_angle": "Low-Angle Tracking",
        "director_notes": "Emphasize vertical steel trusses and claustrophobic isolation.",
    })

    # 8. Lyria 3 Audio Score Cues & Sound Design
    store.save_audio_cue(s2_id, DEMO_PROJECT_ID, {
        "scene_id": s2_id,
        "scene_number": 1,
        "location": "Subterranean Parking Structure",
        "track_title": "Concrete Echo Pursuit",
        "genre": "Subterranean Action Pulse",
        "bpm": 108,
        "key_signature": "C# Phrygian",
        "mood_descriptors": ["Urgent", "Echoing", "Aggressive", "Heavy"],
        "instrumentation": ["Distorted 808 Kicks", "Metallic Industrial Clangs", "Dark Arpeggiated Synths", "Sub-Harmonic Subwoofer Sweep"],
        "foley_layers": ["Dripping water echo on concrete", "Idling V8 SUV engines", "Tire squeals on damp concrete ramps"],
        "lyria_prompt": "Dark industrial action film score, 108 BPM, aggressive modular synth bassline, reverberant metallic percussion hits, high suspense, Trent Reznor cinematic style",
        "composer_notes": "Dynamic crescendos timed with SUV headlights sweeping past structural pillars.",
    })
    store.save_audio_cue(s3_id, DEMO_PROJECT_ID, {
        "scene_id": s3_id,
        "scene_number": 2,
        "location": "Textile Mill Warehouse",
        "track_title": "The Standoff at Mukesh Mill",
        "genre": "Industrial Noir Standoff",
        "bpm": 68,
        "key_signature": "A Minor",
        "mood_descriptors": ["Brooding", "Ominous", "Cavernous", "Suspenseful"],
        "instrumentation": ["Bowed Steel Strings", "Sub-Bass Drone (32Hz)", "Distant Metallic Anvil Hits", "Warm Brass Braams"],
        "foley_layers": ["Wind whistling through broken clerestory glass", "Rusted sliding iron chains", "Distant ocean tide from Colaba coastline"],
        "lyria_prompt": "Cavernous dark cinematic soundtrack, 68 BPM, bowed metal textures, ominous low brass braams, Hans Zimmer noir action aesthetic, atmospheric 8k audio",
        "composer_notes": "Drop all high frequencies to complete silence right before Arjun speaks.",
    })
    store.save_audio_cue(s4_id, DEMO_PROJECT_ID, {
        "scene_id": s4_id,
        "scene_number": 3,
        "location": "Commercial Tower Rooftop",
        "track_title": "Rooftop Velocity",
        "genre": "High-Octane Cinematic Chase",
        "bpm": 132,
        "key_signature": "F Minor",
        "mood_descriptors": ["Exhilarating", "Kinetic", "Airborne", "Dangerous"],
        "instrumentation": ["Driving 16th-note Synth Arps", "Epic Orchestral Stabs", "Distorted Taiko Drums", "Airborne Wind Synthesizer"],
        "foley_layers": ["Gale force wind gusts on gravel", "Footsteps sprinting across metal HVAC ducts", "Sparks ricocheting off metallic chimneys"],
        "lyria_prompt": "Epic high-velocity action movie chase cue, 132 BPM, driving electronic synth arpeggios, massive orchestral brass and hybrid cinematic percussion, soaring adrenaline",
        "composer_notes": "High kinetic energy matching Arjun's rooftop sprint and fire escape jump.",
    })
    store.save_audio_cue(s5_id, DEMO_PROJECT_ID, {
        "scene_id": s5_id,
        "scene_number": 4,
        "location": "Medical Studio Set",
        "track_title": "Dawn Infiltration Archive",
        "genre": "Clinical Minimalist Tension",
        "bpm": 80,
        "key_signature": "E Minor",
        "mood_descriptors": ["Sterile", "Suspenseful", "Subtle", "Resolving"],
        "instrumentation": ["Glass Marimba", "Soft Felt Piano", "Warm Tape-Saturated Synth Pad", "Subtle Heartbeat Pulse"],
        "foley_layers": ["Fluorescent light ballast hum (60Hz)", "Medical gurney wheels rolling on polished linoleum", "Subtle hospital air circulation"],
        "lyria_prompt": "Minimalist suspense score, 80 BPM, delicate soft felt piano with glass bell tones, subtle rhythmic heartbeat pulse, sterile hospital thriller tone, resolving chord progression",
        "composer_notes": "Soft, delicate textures leading into the final hand-off climax.",
    })

    # 9. Gemini 3.1 Flash TTS Multi-Speaker Table-Read & Dialogue Sentiment
    store.save_table_read(s3_id, DEMO_PROJECT_ID, {
        "scene_id": s3_id,
        "scene_number": 2,
        "scene_title": "INT. ABANDONED INDUSTRIAL WAREHOUSE - NIGHT",
        "tension_level": "Explosive Standoff (9.5/10)",
        "overall_sentiment": "High Stakes Betrayal & Tactical Confrontation",
        "characters": [
            {
                "name": "ARJUN",
                "voice_id": "Fenrir",
                "vocal_profile": "Low gravel, cold authority",
                "emotional_state": "Uncompromising resolve",
                "pacing": "Deliberate",
                "recommended_actor_reference": "Tactical Lead",
            },
            {
                "name": "VIKRAM",
                "voice_id": "Charon",
                "vocal_profile": "Smooth, mocking, bureaucratic menace",
                "emotional_state": "Smug arrogance masking lethal threat",
                "pacing": "Calculated & Slow",
                "recommended_actor_reference": "Corrupt Intelligence Bureau Chief",
            }
        ],
        "dialogue_lines": [
            {
                "character": "VIKRAM",
                "voice_id": "Charon",
                "delivery_tag": "[echoing through cavernous warehouse floor]",
                "line": "Did you really think a few decrypted server logs could bring down an entire ministry, Arjun?",
                "subtext": "You are completely powerless against the system.",
                "sentiment_score": -0.9,
            },
            {
                "character": "ARJUN",
                "voice_id": "Fenrir",
                "delivery_tag": "[stepping into sodium light shaft]",
                "line": "It's not just the ministry, Vikram. Kavita already mirrored the encrypted archive to the press bureau.",
                "subtext": "Checkmate. You've already lost.",
                "sentiment_score": 0.6,
            }
        ],
        "director_table_read_notes": "Use cavernous natural reverb. Vikram's voice should carry smooth arrogance before cracking on the press reveal.",
    })

    return project


