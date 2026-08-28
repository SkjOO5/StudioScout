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

    # 6. Pre-seeded VFX & Storyboard Concept Boards (Imagen 3 Visual Frames)
    store.save_storyboard(s1_id, DEMO_PROJECT_ID, {
        "scene_id": s1_id,
        "scene_number": 1,
        "location": "Subterranean Quantum Lab & Server Vault",
        "title": "Subterranean Quantum Core Breach",
        "aspect_ratio": "2.39:1 (Anamorphic Panavision)",
        "camera_angle": "Wide Establishing Low-Angle tracking into Tactical Close-Up",
        "lens_focal_length": "35mm / 50mm Anamorphic",
        "lighting_style": "High-Contrast Sapphire & Cyan Chiaroscuro with Cryo-Mist Diffusion",
        "color_palette": ["#030712", "#0284C7", "#06B6D4", "#E0F2FE"],
        "visual_prompt": "Ultra-detailed 8K cinematic film still from a sci-fi thriller. Subterranean quantum lab and server vault at night. A vast, sterile data center with towering anodized server racks stretching into the distance. Dominant cold blue LED tube lighting casting sharp beams through residual cryo-fog haze. In the center, a glowing glass cube quantum core illuminated in sapphire light. Operative in tactical jumpsuit holding a field terminal. Panavision 2.39:1 widescreen, photorealistic.",
        "director_notes": "The emotional beat is one of isolated tension and immense pressure. The precision LED tube lighting should be used to create sharp, almost surgical beams that slice through the residual haze, drawing the eye directly to the 'Optical Quantum Core Drive'.",
        "image_url": "/storyboards/scene1.jpg",
    })

    store.save_storyboard(s2_id, DEMO_PROJECT_ID, {
        "scene_id": s2_id,
        "scene_number": 2,
        "location": "Container Freight Station & Gantry Terminal",
        "title": "Industrial Container Labyrinth Pursuit",
        "aspect_ratio": "2.39:1 (Anamorphic Panavision)",
        "camera_angle": "High-Angle Gantry Crane Overhead & Wet Low-Angle Tracking",
        "lens_focal_length": "40mm Anamorphic",
        "lighting_style": "Sodium Vapor Amber & Cold Rain Cyan Backlight",
        "color_palette": ["#0B0F17", "#D97706", "#0284C7", "#94A3B8"],
        "visual_prompt": "Cinematic 8K film still of an outdoor cargo container terminal freight depot at night under heavy coastal rain. Towering multi-colored ISO shipping containers stacked high like a steel canyon labyrinth. Giant overhead gantry crane looms in sea mist. Wet reflective asphalt with sweeping vehicle headlight beams. Tactical operatives in rain gear navigating container aisles. Panavision 2.39:1 widescreen, moody cyan and amber sodium vapor street lighting.",
        "director_notes": "Emphasize verticality of container stacks. Wet ground reflections capture sweeping vehicle headlights. Drone cameras sweep over crane gantry.",
        "image_url": "/storyboards/scene2.jpg",
    })

    store.save_storyboard(s3_id, DEMO_PROJECT_ID, {
        "scene_id": s3_id,
        "scene_number": 3,
        "location": "Mukesh Mills & Heritage Power Hall",
        "title": "Turbine Hall Barricade & Stand-Off",
        "aspect_ratio": "2.39:1 (Anamorphic Panavision)",
        "camera_angle": "Cavernous Cathedral Wide & Dutch Angle Stairwell Framing",
        "lens_focal_length": "28mm Ultra-Wide Anamorphic",
        "lighting_style": "Moonlight Shafts through Broken Skylights with Flaring Exterior Floodlights",
        "color_palette": ["#0F172A", "#334155", "#059669", "#F1F5F9"],
        "visual_prompt": "Cinematic 8K film still of an abandoned decommissioned thermal power station turbine hall at night. Soaring 30-foot iron truss cathedral ceilings, massive rusty copper generators, weathered steam pipes, steel catwalks stretching into deep shadow. Moonlight filtering through broken glass skylights. Operatives barricading a heavy hydraulic iron hoist door. Dramatic volumetric light rays, industrial film noir, Panavision 2.39:1 widescreen.",
        "director_notes": "Acoustic resonance is visualised through volumetric dust shafts and iron silhouettes. Contrast warm generator rust with cold moonlight beams.",
        "image_url": "/storyboards/scene3.jpg",
    })

    store.save_storyboard(s4_id, DEMO_PROJECT_ID, {
        "scene_id": s4_id,
        "scene_number": 4,
        "location": "One World Center Skydeck & Helipad",
        "title": "Dawn Skyscraper Extraction",
        "aspect_ratio": "2.39:1 (Anamorphic Panavision)",
        "camera_angle": "Epic Skydeck Wide into Golden Hour Helicopter Flare",
        "lens_focal_length": "50mm / 85mm Prime Anamorphic",
        "lighting_style": "Golden Hour Dawn Sunbreak & Aerodynamic Rotor Flare",
        "color_palette": ["#1E1B4B", "#D97706", "#F59E0B", "#FEF3C7"],
        "visual_prompt": "Cinematic 8K film still of a commercial skyscraper rooftop helipad eighty stories high at dawn. Morning sun breaking through storm clouds casting golden and amber light on modern glass and steel facade. Wind whipping across the helipad surface. A sleek tactical transport helicopter flaring over the edge for extraction. Two operatives with high-tech equipment case waiting on the tarmac. Epic cinematic composition, 2.39:1 widescreen.",
        "director_notes": "Dramatic sunrise payoff after night of survival. Lens flares reflect off skyscraper glass and spinning helicopter blades.",
        "image_url": "/storyboards/scene4.jpg",
    })

    # 7. Pre-seeded Lyria 3 Soundtrack & Acoustic Atmosphere Cues
    store.save_audio_cue(s1_id, DEMO_PROJECT_ID, {
        "scene_id": s1_id,
        "scene_number": 1,
        "location": "Subterranean Research Center",
        "track_title": "Subterranean Core Infiltration",
        "genre": "Dark Ambient / Industrial Sci-Fi / Pulsating Thriller Score",
        "bpm": 82,
        "key_signature": "D Minor / F# Phrygian",
        "mood_descriptors": ["Tense", "Claustrophobic", "Subterranean", "Pulsing"],
        "instrumentation": [
            "Deep, resonant analog synth pads (Prophet-5, OB-X)",
            "Processed metallic percussion (found objects, industrial samples)",
            "Sub-bass drones with subtle modulation",
            "Distorted, bowed metal textures",
            "High-frequency digital artifacts and glitches",
            "Low, guttural synth bass",
        ],
        "foley_layers": [
            "Constant, low-frequency hum of server racks",
            "Subtle, high-frequency whine of optical drives",
            "Distant, muffled hiss of cryo-fog dispersal",
            "Metallic creaks and groans of blast doors settling",
            "Barefoot/booted footsteps on polished concrete, slightly muffled",
            "Low, resonant thrum of the quantum core drive",
            "Occasional, sharp clack of biometric terminal activation",
        ],
        "lyria_prompt": "A 30-second cue beginning with a deep, sustained D minor drone, slowly modulating with a subtle, unsettling vibrato. At 0:05, introduce a sparse, metallic pulse (82 BPM) with a slight reverb tail, reminiscent of distant machinery. Layer in bowed metal textures and high-frequency digital glitches to build tension. At 0:18, add a low, guttural synth bassline that throbs in sync with the pulse. End on an unresolved, high-frequency synth tone with a lingering, hollow decay.",
        "composer_notes": "Maintain a sparse, almost clinical soundscape. The music should primarily occupy the lower-mid frequencies to allow dialogue and critical foley to cut through clearly. Use dynamic ducking on synth pads during dialogue.",
    })

    store.save_audio_cue(s2_id, DEMO_PROJECT_ID, {
        "scene_id": s2_id,
        "scene_number": 2,
        "location": "Cargo Freight Terminal",
        "track_title": "Labyrinth Freight Pursuit",
        "genre": "High-Octane Industrial Percussion & Kinetic Bass",
        "bpm": 128,
        "key_signature": "E Minor",
        "mood_descriptors": ["Kinetic", "Urgent", "Industrial", "Relentless"],
        "instrumentation": ["Distorted 909 Kick Drums", "Metallic Slapback Percussion", "Anamorphic Brass Stabs", "Acid Synth Basslines"],
        "foley_layers": ["Rain drumming on hollow corrugated shipping containers", "Pneumatic air-brake hiss", "Overhead crane cable groans", "Heavy radial tire squeal on wet asphalt"],
        "lyria_prompt": "Driving 128 BPM industrial chase score featuring heavy distorted kick drums, relentless metallic percussion hits against container steel, and aggressive synth bass risers building into sudden pneumatic silence.",
        "composer_notes": "Sync heavy downbeats with camera pans past towering container corners. Drop sub-bass during close-up dialogue.",
    })

    store.save_audio_cue(s3_id, DEMO_PROJECT_ID, {
        "scene_id": s3_id,
        "scene_number": 3,
        "location": "Turbine Power Station",
        "track_title": "Echoes of the Turbine Floor",
        "genre": "Acoustic Resonance & Tension Drone",
        "bpm": 65,
        "key_signature": "C Minor / G Harmonic",
        "mood_descriptors": ["Cavernous", "Echoing", "Heavy", "Ominous"],
        "instrumentation": ["Bowed Cello Solo with 6-second Hall Reverb", "Sub-Harmonic Resonator", "Granular Water Droplet Synth", "Hydraulic Iron Clangs"],
        "foley_layers": ["Long 4.5s acoustic reverb decay", "Wind whistling through broken glass skylights", "Chain hoist rattles", "Boiler pipe thermal contraction clicks"],
        "lyria_prompt": "Cavernous industrial atmospheric drone at 65 BPM with haunting solo cello melody, massive 5-second acoustic reverb tail, and rhythmic iron chain impacts.",
        "composer_notes": "Exploit the hall's natural reverberation. Keep musical space open for acoustic footsteps and perimeter alerts.",
    })

    store.save_audio_cue(s4_id, DEMO_PROJECT_ID, {
        "scene_id": s4_id,
        "scene_number": 4,
        "location": "Skydeck Helipad",
        "track_title": "Dawn Extraction Horizon",
        "genre": "Epic Climactic Orchestral Electronic",
        "bpm": 110,
        "key_signature": "A Major / D Major",
        "mood_descriptors": ["Triumphant", "Climactic", "Expansive", "Cathartic"],
        "instrumentation": ["Full Orchestral Brass Ensemble", "Analog Arpeggiator (Juno-106)", "Epic Taiko Drums", "Skyline Ambient Synth Pads"],
        "foley_layers": ["High-altitude 80-story gale force wind wash", "Twin-turbine helicopter rotor chop", "Rooftop door slam", "Dawn birdcalls over metropolis below"],
        "lyria_prompt": "Climactic dawn score at 110 BPM opening with soaring golden hour brass chords, pulsing synth arpeggio, and thunderous cinematic drums as extraction aircraft arrives.",
        "composer_notes": "Gradually open low-pass filter on synth brass as sun crests the horizon. Maximize dynamic emotional lift at extraction.",
    })

    # 8. Pre-seeded Gemini 3.1 Flash TTS Multi-Speaker Table Reads
    store.save_table_read(s1_id, DEMO_PROJECT_ID, {
        "scene_id": s1_id,
        "scene_number": 1,
        "scene_title": "INT. QUANTUM LAB & SERVER VAULT - NIGHT",
        "tension_level": "Critical (9.2/10)",
        "overall_sentiment": "High-Stakes Technical Infiltration",
        "characters": [
            {
                "name": "ELENA",
                "voice_id": "Aoede",
                "vocal_profile": "Intense, articulate, urgent cryptographer tone with fast technical precision",
                "emotional_state": "Laser-focused under extreme time pressure",
                "pacing": "Rapid & Decisive (155 WPM)",
                "recommended_actor_reference": "Biometrics Cryptographer",
            },
            {
                "name": "MARCUS",
                "voice_id": "Fenrir",
                "vocal_profile": "Low, commanding, tactical operative whisper with measured cadence",
                "emotional_state": "Perimeter defense readiness, hypervigilant",
                "pacing": "Measured & Tactical (110 WPM)",
                "recommended_actor_reference": "Black-Ops Operative",
            },
        ],
        "dialogue_lines": [
            {
                "character": "MARCUS",
                "voice_id": "Fenrir",
                "delivery_tag": "[low whisper, thermal carbine trained on blast door]",
                "line": "Neural handshake protocol verified. We have three minutes before containment seals.",
                "subtext": "Time has expired; perimeter security is descending right now.",
                "sentiment_score": -0.7,
            },
            {
                "character": "ELENA",
                "voice_id": "Aoede",
                "delivery_tag": "[rapid keystrokes, eyes fixed on quantum core]",
                "line": "The core encryption key is cycling. If I pull the drive prematurely, the neural net wipes.",
                "subtext": "Exfiltrating the complete payload is worth the lethal risk.",
                "sentiment_score": 0.3,
            },
            {
                "character": "MARCUS",
                "voice_id": "Fenrir",
                "delivery_tag": "[urgent radio click, stepping toward corridor]",
                "line": "Red klaxon active. Magnetic locks disengaging on sublevel two. Elena, pull it now!",
                "subtext": "We are out of time; survival takes precedence over total data extraction.",
                "sentiment_score": -0.9,
            },
        ],
        "director_table_read_notes": "Staccato pacing. Elena's delivery should be clipped and technical, contrasted against Marcus's steady tactical situational awareness.",
    })

    store.save_table_read(s2_id, DEMO_PROJECT_ID, {
        "scene_id": s2_id,
        "scene_number": 2,
        "scene_title": "EXT. CARGO CONTAINER TERMINAL - NIGHT",
        "tension_level": "High (8.6/10)",
        "overall_sentiment": "Tactical Evasion & Evasive Maneuvers",
        "characters": [
            {
                "name": "MARCUS",
                "voice_id": "Fenrir",
                "vocal_profile": "Commanding, sharp tactical whisper over rain and engine idle",
                "emotional_state": "Combat maneuvering",
                "pacing": "Urgent",
                "recommended_actor_reference": "Tactical Operative",
            },
            {
                "name": "ELENA",
                "voice_id": "Aoede",
                "vocal_profile": "Breathless, shielding insulated drive case",
                "emotional_state": "Physical exertion and hyper-awareness",
                "pacing": "Fast",
                "recommended_actor_reference": "Cryptographer",
            },
        ],
        "dialogue_lines": [
            {
                "character": "MARCUS",
                "voice_id": "Fenrir",
                "delivery_tag": "[ducking behind container corner, pointing forward]",
                "line": "Take cover behind the ballast crates. Vehicle clearance incoming on aisle four.",
                "subtext": "Heavy pursuit vehicles are closing our only exit lane.",
                "sentiment_score": -0.6,
            },
            {
                "character": "ELENA",
                "voice_id": "Aoede",
                "delivery_tag": "[breathless, clutching insulated drive case]",
                "line": "Gantry drones deploying above. We can't cross open tarmac without thermal cover.",
                "subtext": "We need to cut through the power substation to avoid overhead radar.",
                "sentiment_score": -0.4,
            },
        ],
        "director_table_read_notes": "Lines delivered against the backdrop of driving coastal rain and heavy diesel engine rumble.",
    })

    store.save_table_read(s3_id, DEMO_PROJECT_ID, {
        "scene_id": s3_id,
        "scene_number": 3,
        "scene_title": "INT. DECOMMISSIONED THERMAL POWER STATION - NIGHT",
        "tension_level": "Suspenseful (8.0/10)",
        "overall_sentiment": "Echoing Claustrophobia & Barricade Hold",
        "characters": [
            {
                "name": "ELENA",
                "voice_id": "Aoede",
                "vocal_profile": "Acoustic assessment whisper, observing vaulted ceiling",
                "emotional_state": "Analytical relief, setting up field terminal",
                "pacing": "Deliberate",
                "recommended_actor_reference": "Cryptographer",
            },
            {
                "name": "MARCUS",
                "voice_id": "Fenrir",
                "vocal_profile": "Exerting physical force on iron hoist chain",
                "emotional_state": "Establishing defensive perimeter",
                "pacing": "Controlled",
                "recommended_actor_reference": "Tactical Operative",
            },
        ],
        "dialogue_lines": [
            {
                "character": "ELENA",
                "voice_id": "Aoede",
                "delivery_tag": "[whispering, looking up at thirty-foot iron trusses]",
                "line": "Look at the acoustic resonance in this hall. Any perimeter breach will echo across the turbine floor.",
                "subtext": "The industrial acoustics give us early tactical warning.",
                "sentiment_score": 0.4,
            },
            {
                "character": "MARCUS",
                "voice_id": "Fenrir",
                "delivery_tag": "[locking steel hoist chain in place]",
                "line": "Good. That gives us sightlines on both stairwells until extraction arrives at dawn.",
                "subtext": "We only need to hold this position for four more hours.",
                "sentiment_score": 0.5,
            },
        ],
        "director_table_read_notes": "Use natural pauses to emphasize the cathedral acoustics and echoing metallic environment.",
    })

    store.save_table_read(s4_id, DEMO_PROJECT_ID, {
        "scene_id": s4_id,
        "scene_number": 4,
        "scene_title": "EXT. COMMERCIAL TOWER HELIPAD - DAWN",
        "tension_level": "Climactic Release (7.5/10)",
        "overall_sentiment": "Triumphant Catharsis & Extraction",
        "characters": [
            {
                "name": "MARCUS",
                "voice_id": "Fenrir",
                "vocal_profile": "Shouting over eighty-story dawn wind and helicopter rotor chop",
                "emotional_state": "Exhilarated tactical relief",
                "pacing": "Decisive",
                "recommended_actor_reference": "Tactical Operative",
            },
            {
                "name": "ELENA",
                "voice_id": "Aoede",
                "vocal_profile": "Triumphant, boarding transport ramp",
                "emotional_state": "Mission success and survival",
                "pacing": "Energetic",
                "recommended_actor_reference": "Cryptographer",
            },
        ],
        "dialogue_lines": [
            {
                "character": "MARCUS",
                "voice_id": "Fenrir",
                "delivery_tag": "[shouting over twin-turbine rotor wash, signaling pilot]",
                "line": "Transport locked on approach! Quantum core secured. Boarding ramp is green!",
                "subtext": "We made it through the night alive.",
                "sentiment_score": 0.9,
            },
            {
                "character": "ELENA",
                "voice_id": "Aoede",
                "delivery_tag": "[smiling against golden sunrise light, drive case in hand]",
                "line": "Decryption complete. The entire city will see the truth by morning.",
                "subtext": "The mission was a total victory.",
                "sentiment_score": 1.0,
            },
        ],
        "director_table_read_notes": "Full vocal projection over helicopter audio and golden dawn wind. Emotional resolution.",
    })

    return project
