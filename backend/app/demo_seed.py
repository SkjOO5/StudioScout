"""
StudioScout AI — Demo Data Seeder

Seeds a complete, production-grade 'Cipher Zero' sci-fi cyber thriller project.
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

DEMO_PROJECT_ID = "demo-cipher-zero"

DEMO_SCREENPLAY = """TITLE: CIPHER ZERO
GENRE: Sci-Fi Cyber Thriller
WRITTEN BY: Marcus Vance

SCENE 1
INT. QUANTUM LAB & SERVER VAULT - NIGHT
Sub-zero cooling mist rolls across black anodized server racks in a subterranean research vault.
Flashing optical fiber banks bathe the sterile concrete in pulsing sapphire light.
ELENA (29, biometrics cryptographer, tactical jumpsuit) rapidly bypasses security locks on a glowing quantum core.
MARCUS (36, black-ops operative, scarred jaw) keeps his thermal carbine trained on the heavy blast doors.
MARCUS
Neural handshake protocol verified. We have three minutes before containment seals.
ELENA
The core encryption key is cycling. If I pull the drive prematurely, the neural net wipes.
A red klaxon begins to strobe across the ceiling. Heavy magnetic locks disengage down the corridor.

SCENE 2
EXT. CARGO CONTAINER TERMINAL - NIGHT
Towering stacks of weathered ISO shipping containers loom like a steel labyrinth under coastal rain.
Massive overhead gantry cranes stand idle in the sea mist.
Two armored transport haulers idle at the dockside freight entrance.
Marcus leads Elena between container aisles. Headlight beams sweep across wet corrugated steel.
Pneumatic brakes hiss as pursuit drones deploy from the crane gantry.
MARCUS
Take cover behind the ballast crates. Vehicle clearance incoming on aisle four.

SCENE 3
INT. DECOMMISSIONED THERMAL POWER STATION - NIGHT
Cavernous 10,000 sq ft industrial turbine hall with soaring thirty-foot iron truss ceilings.
Abandoned copper generators, massive steam pipes, and rusted metal catwalks stretch into deep shadow.
Elena sets her mobile field terminal on an oxidized generator housing.
Marcus seals the hydraulic bay doors with an emergency steel chain hoist.
ELENA
Look at the acoustic resonance in this hall. Any perimeter breach will echo across the turbine floor.
MARCUS
Good. That gives us sightlines on both stairwells until extraction arrives at dawn.
Exterior floodlights suddenly flare against the broken glass skylights.

SCENE 4
EXT. COMMERCIAL TOWER HELIPAD - DAWN
Gale force winds whip across the rooftop helipad eighty stories above the waking metropolis.
The morning sun breaks through low storm clouds, casting golden reflections on the glass facade.
Elena clutches the insulated quantum drive case as Marcus coordinates the extraction approach.
A twin-turbine tactical transport helicopter flares over the perimeter ledge.
"""


def seed_demo_project() -> Project:
    """Seed the complete Cipher Zero project into persistent storage."""
    
    # 1. Project
    project = Project(
        id=DEMO_PROJECT_ID,
        name="Cipher Zero",
        genre=Genre.SCI_FI,
        production_city="Mumbai",
        budget_tier=BudgetTier.MID,
        status=ProjectStatus.COMPLETED,
        scene_description="A high-stakes sci-fi cyber thriller shot across specialized subterranean, freight terminal, and industrial power station locations.",
        screenplay_filename="cipher_zero_screenplay.pdf",
        screenplay_text=DEMO_SCREENPLAY,
        created_at=datetime.utcnow() - timedelta(minutes=15),
        updated_at=datetime.utcnow(),
        scene_count=4,
        has_recommendations=True,
        has_plan=True,
    )
    store.save_project(project)

    # 2. Scenes
    s1_id = f"{DEMO_PROJECT_ID}-scene-1"
    s2_id = f"{DEMO_PROJECT_ID}-scene-2"
    s3_id = f"{DEMO_PROJECT_ID}-scene-3"
    s4_id = f"{DEMO_PROJECT_ID}-scene-4"

    scenes = [
        Scene(
            id=s1_id,
            project_id=DEMO_PROJECT_ID,
            scene_number=1,
            heading="INT. QUANTUM LAB & SERVER VAULT - NIGHT",
            location="Subterranean Research Center",
            location_type="institutional",
            time_of_day="night",
            setting="interior",
            description="Sterile data center with anodized server racks, cold blue optical lighting, and security blast doors.",
            characters=2,
            vehicles=False,
            props=["Optical quantum core drive", "Biometric terminal", "Thermal tactical carbine", "Security blast locks"],
            special_constraints=["Cryo-fog / hazer atmospheric haze clearance", "Precision LED tube lighting control"],
            requirements=[
                SceneRequirement(category="space_size", description="Subterranean high-tech server corridor or modular soundstage cleanroom", priority="required"),
                SceneRequirement(category="lighting_control", description="Complete blackout capability with isolated DMX LED lighting grid", priority="required"),
                SceneRequirement(category="special_permits", description="Hazer and theatrical atmospheric smoke clearance", priority="preferred"),
            ],
            research_status="completed",
            recommendation_status="available",
        ),
        Scene(
            id=s2_id,
            project_id=DEMO_PROJECT_ID,
            scene_number=2,
            heading="EXT. CARGO CONTAINER TERMINAL - NIGHT",
            location="Container Freight Station",
            location_type="industrial",
            time_of_day="night",
            setting="exterior",
            description="Towering multi-tier shipping container terminal with overhead gantry cranes, sea mist, and heavy transport haulers.",
            characters=4,
            vehicles=True,
            props=["Two armored transport haulers", "Pursuit drone rig", "Ballast cargo crates"],
            special_constraints=["Stunt vehicle maneuvering between container stacks", "Overnight perimeter security clearance"],
            requirements=[
                SceneRequirement(category="vehicle_access", description="Heavy vehicle drive-in lanes with minimum 4.5m crane clearance", priority="required"),
                SceneRequirement(category="space_size", description="Active or decommissioned freight yard spanning at least 25,000 sq ft", priority="required"),
                SceneRequirement(category="special_permits", description="Port authority and customs jurisdiction filming NOC", priority="required"),
            ],
            research_status="completed",
            recommendation_status="available",
        ),
        Scene(
            id=s3_id,
            project_id=DEMO_PROJECT_ID,
            scene_number=3,
            heading="INT. DECOMMISSIONED THERMAL POWER STATION - NIGHT",
            location="Turbine Hall / Power Compound",
            location_type="industrial",
            time_of_day="night",
            setting="interior",
            description="Cavernous 10,000 sq ft turbine hall with thirty-foot iron trusses, rusted steam pipes, and oxidized generator housings.",
            characters=3,
            vehicles=True,
            props=["Mobile field terminal", "Hydraulic chain hoist", "High-output searchlights"],
            special_constraints=["Generator truck access for 200A 3-phase lighting rig", "Acoustic control for dialogue capture"],
            requirements=[
                SceneRequirement(category="space_size", description="Cavernous open industrial floor of 8,000 - 15,000 sq ft with 30ft ceiling", priority="required"),
                SceneRequirement(category="vehicle_access", description="Direct loading dock door for equipment roll-in", priority="required"),
                SceneRequirement(category="special_permits", description="Structural stability inspection certification for film crew", priority="required"),
            ],
            research_status="completed",
            recommendation_status="available",
        ),
        Scene(
            id=s4_id,
            project_id=DEMO_PROJECT_ID,
            scene_number=4,
            heading="EXT. COMMERCIAL TOWER HELIPAD - DAWN",
            location="Commercial Tower Rooftop & Helipad",
            location_type="exterior-urban",
            time_of_day="dawn",
            setting="exterior",
            description="High-altitude commercial skyscraper helipad with panoramic skyline backdrop and morning cloud reflections.",
            characters=3,
            vehicles=False,
            props=["Insulated quantum drive case", "Tactical extraction beacon", "Helipad aviation marker lights"],
            special_constraints=["Civil aviation night-to-dawn flight and rooftop staging clearance"],
            requirements=[
                SceneRequirement(category="space_size", description="Certified commercial helipad with unblocked 360-degree skyline horizon", priority="required"),
                SceneRequirement(category="special_permits", description="Aviation authority (DGCA) & building management NOC", priority="required"),
                SceneRequirement(category="crew_size", description="High-speed service elevator access to rooftop staging level", priority="required"),
            ],
            research_status="completed",
            recommendation_status="available",
        ),
    ]
    store.save_scenes(DEMO_PROJECT_ID, scenes)

    # 3. Candidates for Scene 3 (Turbine Hall) & Scene 2
    cand_s3_1 = LocationCandidate(
        id=f"{DEMO_PROJECT_ID}-cand-s3-1",
        scene_id=s3_id,
        project_id=DEMO_PROJECT_ID,
        name="Mukesh Mills & Heritage Power Hall",
        description="Historic 12,000 sq ft sea-facing decommissioned industrial compound with 30ft exposed steel trusses, rustic brickwork, and direct loading docks.",
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
            "Authentic industrial exposed truss roof and lattice windows matching screenplay description exactly",
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
                excerpt="...Mukesh Mills industrial complex provides over 15,000 sq ft of contiguous production space widely utilized for feature films and commercial shoots...",
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
        name="Kanjurmarg Logistics & Industrial Park",
        description="Modernized high-bay industrial warehouse spanning 10,000 sq ft with insulated metal roofing and active 3-phase power.",
        location_type="industrial",
        city="Mumbai (Kanjurmarg East)",
        match_score=82.0,
        score_breakdown=ScoreBreakdown(
            visual_match=19.0,
            location_requirements=18.0,
            accessibility=14.5,
            time_lighting=13.0,
            production_practicality=12.5,
            risk_score=5.0,
        ),
        strengths=[
            "Fully sound-insulated roof panels reducing external traffic noise",
            "Active 3-phase 415V power eliminates need for auxiliary generator trucks",
        ],
        weaknesses=[
            "Modern corrugated cladding lacks historic distress described in screenplay",
            "Adjacent active logistics dock operates forklifts until 22:00",
        ],
        risks=[
            Risk(
                category="noise",
                description="Active logistics operations nearby until 22:00",
                severity="medium",
                mitigation="Schedule sound-sensitive dialogue blocks post 22:30",
            ),
        ],
        evidence=[
            Evidence(
                requirement="3-phase electrical supply",
                excerpt="...facilities equipped with dedicated 250 kVA transformer substations and direct heavy-duty distribution boards...",
                source_url="https://mumbailocationscout.com/industrial/kanjurmarg-logistics",
                source_title="Mumbai Commercial Properties",
                confidence="medium",
            ),
        ],
        sources=["https://mumbailocationscout.com/industrial/kanjurmarg-logistics"],
        recommended_action="Keep as secondary backup option if heritage permits face delays.",
        rank=2,
    )

    cand_s4_1 = LocationCandidate(
        id=f"{DEMO_PROJECT_ID}-cand-s4-1",
        scene_id=s4_id,
        project_id=DEMO_PROJECT_ID,
        name="One World Center Skydeck & Helipad",
        description="80-story commercial tower rooftop with certified helipad, panoramic skyline backdrop, and service elevator access.",
        location_type="exterior-urban",
        city="Mumbai (Lower Parel)",
        match_score=91.0,
        score_breakdown=ScoreBreakdown(
            visual_match=24.0,
            location_requirements=18.5,
            accessibility=13.5,
            time_lighting=14.0,
            production_practicality=13.0,
            risk_score=8.0,
        ),
        strengths=[
            "Unobstructed 360-degree sunrise skyline view with glass curtain wall architecture",
            "Heavy-capacity freight elevator opens directly to roof staging vestibule",
        ],
        weaknesses=[
            "High-altitude wind velocity restricts delicate sound boom microphones",
        ],
        risks=[
            Risk(
                category="weather",
                description="High rooftop wind speeds at dawn",
                severity="medium",
                mitigation="Utilize wireless lavalier mics with high-density wind jammers for dialogue",
            )
        ],
        evidence=[
            Evidence(
                requirement="Commercial rooftop helipad",
                excerpt="...helipad facility features certified perimeter safety netting, floodlighting, and dedicated equipment staging...",
                source_url="https://filminginindia.gov.in/locations/commercial-towers",
                source_title="Maharashtra Film Locations",
                confidence="high"
            )
        ],
        sources=["https://filminginindia.gov.in/locations/commercial-towers"],
        recommended_action="Confirm aviation authority dawn filming clearance.",
        rank=1
    )

    store.save_candidates(s3_id, [cand_s3_1, cand_s3_2])
    store.save_candidates(s4_id, [cand_s4_1])

    # 4. Production Plan
    plan = ProductionPlan(
        id=f"{DEMO_PROJECT_ID}-plan",
        project_id=DEMO_PROJECT_ID,
        version=1,
        shooting_days=[
            ShootingDay(
                day_number=1,
                date_label="Mon 2 Sep (Night)",
                location="Subterranean Research Center",
                call_time="17:30",
                wrap_time="03:00",
                crew_size=38,
                complexity="high",
                notes=["Stage cryo-fog machines by 18:00", "Night meal call at 22:30", "Secure optical core prop in locked safe"],
                blocks=[
                    ShootingBlock(start_time="17:30", end_time="18:30", activity="Crew Call & Lighting Rigging", location="Subterranean Research Center", notes="Setup sapphire LED tubes and smoke hazer"),
                    ShootingBlock(start_time="18:30", end_time="21:30", activity="Scene 1: Quantum Vault Infiltration", scene_id=s1_id, scene_number=1, location="Subterranean Research Center", notes="Elena optical core bypass master shots"),
                    ShootingBlock(start_time="21:30", end_time="22:30", activity="Scene 1: Klaxon & Lockdown Sequence", scene_id=s1_id, scene_number=1, location="Subterranean Research Center", notes="Strobe alarm and blast door stunts"),
                    ShootingBlock(start_time="22:30", end_time="23:30", activity="Night Meal Break & Company Reset", location="Catering Area"),
                    ShootingBlock(start_time="23:30", end_time="03:00", activity="Scene 1: Close-up Inserts & Wrap", scene_id=s1_id, scene_number=1, location="Subterranean Research Center", notes="Terminal macro inserts and company wrap"),
                ],
            ),
            ShootingDay(
                day_number=2,
                date_label="Tue 3 Sep (Night)",
                location="Container Freight Station & Terminal",
                call_time="18:00",
                wrap_time="04:00",
                crew_size=52,
                complexity="high",
                notes=["Stunt driver safety briefing at 18:30", "Water tanker for wet pavement reflections", "Night meal call at 23:00"],
                blocks=[
                    ShootingBlock(start_time="18:00", end_time="19:30", activity="Company Call & Stunt Safety Briefing", location="Container Freight Station", notes="Coordinate crane drone shots and stunt vehicles"),
                    ShootingBlock(start_time="19:30", end_time="23:00", activity="Scene 2: Gantry Crane & Container Aisle Pursuit", scene_id=s2_id, scene_number=2, location="Container Freight Station", notes="Armored transport truck driving sequences"),
                    ShootingBlock(start_time="23:00", end_time="00:00", activity="Company Dinner & Wet Asphalt Reset", location="Unit Base"),
                    ShootingBlock(start_time="00:00", end_time="04:00", activity="Scene 2: Ballast Crate Cover & Drone Evasion", scene_id=s2_id, scene_number=2, location="Container Freight Station", notes="Pneumatic brake stunt and company wrap"),
                ],
            ),
            ShootingDay(
                day_number=3,
                date_label="Wed 4 Sep (Night into Dawn)",
                location="Mukesh Mills & Skydeck Helipad",
                call_time="19:00",
                wrap_time="06:30",
                crew_size=45,
                complexity="high",
                notes=["Turbine Hall hold from 19:00 to 02:00", "Company move to Skydeck Helipad at 02:30", "Catch golden hour dawn light at 05:45"],
                blocks=[
                    ShootingBlock(start_time="19:00", end_time="23:30", activity="Scene 3: Turbine Hall Standoff", scene_id=s3_id, scene_number=3, location="Mukesh Mills & Heritage Power Hall", notes="Hydraulic chain hoist barricade setup"),
                    ShootingBlock(start_time="23:30", end_time="00:30", activity="Midnight Meal Break", location="Unit Base"),
                    ShootingBlock(start_time="00:30", end_time="02:30", activity="Scene 3: Skylight Searchlight Infiltration", scene_id=s3_id, scene_number=3, location="Mukesh Mills & Heritage Power Hall", notes="Searchlight beam lighting rig"),
                    ShootingBlock(start_time="02:30", end_time="04:30", activity="Company Transit to One World Center Skydeck", location="Company Move", notes="Equipment transit to skyscraper rooftop"),
                    ShootingBlock(start_time="04:30", end_time="06:30", activity="Scene 4: Dawn Helipad Extraction", scene_id=s4_id, scene_number=4, location="One World Center Skydeck & Helipad", notes="Sunrise golden hour helicopter arrival sequence"),
                ],
            ),
        ],
        total_days=3,
        constraints=[
            PlanConstraint(
                type="availability",
                description="Mukesh Mills turbine hall available Mon-Fri only; weekend requires special industrial trust NOC",
                affects_scene_ids=[s3_id],
                affects_location="Mukesh Mills & Heritage Power Hall",
            ),
            PlanConstraint(
                type="permit",
                description="Rooftop helipad dawn filming requires civil aviation NOC",
                affects_scene_ids=[s4_id],
                affects_location="One World Center Skydeck & Helipad",
            ),
        ],
        overall_risks=[
            "Heritage precinct filming clearance required from municipal authorities for Turbine Hall",
            "High-altitude dawn wind speeds on commercial rooftop helipad require wind-shielded microphones",
            "Cryo-fog atmospheric effects in subterranean vault require building HVAC shutdown",
        ],
        dependencies=[
            "Single-window film permit approval from Mumbai Municipal Corporation (BMC)",
            "Commercial skyscraper rooftop aviation clearance for dawn helicopter pass",
            "Port authority freight terminal night filming clearance",
        ],
        recommended_actions=[
            "Execute booking contract for Mukesh Mills 3-day window",
            "Submit aviation notice to DGCA for Scene 4 dawn skydeck helicopter pass",
            "Confirm sound-damping blankets for generator van parking near Turbine Hall",
        ],
        summary="Optimized 3-day production plan sequencing subterranean data vault on Day 1, container freight terminal on Day 2, and concluding with industrial turbine hall into dawn skyscraper helipad on Day 3.",
    )
    store.save_plan(DEMO_PROJECT_ID, plan)

    # 5. Completed Agent Run Telemetry
    run_id = f"{DEMO_PROJECT_ID}-run"
    run = AgentRun(
        id=run_id,
        project_id=DEMO_PROJECT_ID,
        state=RunState.COMPLETED,
        run_type="scout",
        scenes_processed=4,
        searches_performed=4,
        candidates_found=3,
        started_at=datetime.utcnow() - timedelta(minutes=14),
        completed_at=datetime.utcnow() - timedelta(minutes=13),
        steps=[
            AgentStep(
                run_id=run_id,
                step_index=1,
                name="Screenplay Analysis",
                detail="Parsed screenplay PDF into 4 structured scene specifications using Google Gemini 3.1 Flash.",
                status=StepStatus.COMPLETED,
                tool_used="gemini",
                started_at=datetime.utcnow() - timedelta(minutes=14),
                completed_at=datetime.utcnow() - timedelta(minutes=13, seconds=45),
            ),
            AgentStep(
                run_id=run_id,
                step_index=2,
                name="Autonomous Parallel Search",
                detail="Dispatched 4 targeted multi-queries to Parallel Search API; retrieved verified web sources.",
                status=StepStatus.COMPLETED,
                tool_used="parallel_search",
                started_at=datetime.utcnow() - timedelta(minutes=13, seconds=45),
                completed_at=datetime.utcnow() - timedelta(minutes=13, seconds=25),
            ),
            AgentStep(
                run_id=run_id,
                step_index=3,
                name="6-Dimension Candidate Evaluation",
                detail="Scored candidates against explainable rubric with source citations and verified risk registers.",
                status=StepStatus.COMPLETED,
                tool_used="gemini",
                started_at=datetime.utcnow() - timedelta(minutes=13, seconds=25),
                completed_at=datetime.utcnow() - timedelta(minutes=13, seconds=10),
            ),
            AgentStep(
                run_id=run_id,
                step_index=4,
                name="Production Schedule & Call Sheet Generation",
                detail="Synthesized 3-day shooting schedule with location clustering, call times, and contingency buffers.",
                status=StepStatus.COMPLETED,
                tool_used="planner",
                started_at=datetime.utcnow() - timedelta(minutes=13, seconds=10),
                completed_at=datetime.utcnow() - timedelta(minutes=13),
            ),
        ],
    )
    store.save_run(run)

    return project
