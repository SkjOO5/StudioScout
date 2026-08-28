"""
StudioScout AI — Persistent SQLite Store

Thread-safe, durable SQLite-backed storage for StudioScout AI.
Persists all projects, scenes, candidates, production plans, runs,
searches, storyboard assets, and Lyria 3 audio cues across server restarts.
"""
import json
import logging
import os
import sqlite3
import threading
from typing import Optional, List, Dict
from datetime import datetime

from app.models.project import Project
from app.models.scene import Scene
from app.models.candidate import LocationCandidate
from app.models.plan import ProductionPlan
from app.models.agent_run import AgentRun
from app.models.search import SearchResponse

logger = logging.getLogger(__name__)

DB_PATH = os.environ.get("STUDIOSCOUT_DB_PATH", os.path.join(os.path.dirname(__file__), "..", "studioscout.db"))


class PersistentStore:
    """Durable SQLite storage with fast in-memory caching."""

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = os.path.abspath(db_path)
        self._lock = threading.RLock()
        
        # In-memory fast cache
        self.projects: Dict[str, Project] = {}
        self.scenes: Dict[str, List[Scene]] = {}          # project_id → scenes
        self.candidates: Dict[str, List[LocationCandidate]] = {}  # scene_id → candidates
        self.plans: Dict[str, ProductionPlan] = {}         # project_id → plan
        self.runs: Dict[str, AgentRun] = {}               # run_id → run
        self.searches: Dict[str, SearchResponse] = {}     # scene_id → search response
        self.storyboards: Dict[str, Dict] = {}            # scene_id → storyboard info
        self.audio_cues: Dict[str, Dict] = {}             # scene_id → audio info
        self.table_reads: Dict[str, Dict] = {}            # scene_id → table read info

        self._init_db()
        self._load_all()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.execute("PRAGMA synchronous = NORMAL;")
        return conn

    def _init_db(self):
        """Create database tables if they do not exist."""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        with self._lock, self._get_conn() as conn:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS scenes (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    scene_number INTEGER NOT NULL,
                    data TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS candidates (
                    id TEXT PRIMARY KEY,
                    scene_id TEXT NOT NULL,
                    project_id TEXT NOT NULL,
                    rank INTEGER NOT NULL,
                    data TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS plans (
                    project_id TEXT PRIMARY KEY,
                    data TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS runs (
                    id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    started_at TEXT NOT NULL,
                    data TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS searches (
                    scene_id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    data TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS storyboards (
                    scene_id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    data TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS audio_cues (
                    scene_id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    data TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS table_reads (
                    scene_id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    data TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_scenes_project ON scenes(project_id);
                CREATE INDEX IF NOT EXISTS idx_candidates_scene ON candidates(scene_id);
                CREATE INDEX IF NOT EXISTS idx_candidates_project ON candidates(project_id);
                CREATE INDEX IF NOT EXISTS idx_runs_project ON runs(project_id);
                CREATE INDEX IF NOT EXISTS idx_searches_project ON searches(project_id);
                CREATE INDEX IF NOT EXISTS idx_storyboards_project ON storyboards(project_id);
                CREATE INDEX IF NOT EXISTS idx_audio_cues_project ON audio_cues(project_id);
                CREATE INDEX IF NOT EXISTS idx_table_reads_project ON table_reads(project_id);
            """)
            conn.commit()
            logger.info(f"[Store] Initialized SQLite database at {self.db_path}")

    def _load_all(self):
        """Load all records from SQLite into the fast in-memory cache."""
        with self._lock, self._get_conn() as conn:
            # Load projects
            for row in conn.execute("SELECT data FROM projects ORDER BY created_at DESC"):
                try:
                    p = Project.model_validate_json(row["data"])
                    self.projects[p.id] = p
                except Exception as e:
                    logger.error(f"[Store] Error loading project: {e}")

            # Load scenes
            scene_dict: Dict[str, List[Scene]] = {}
            for row in conn.execute("SELECT project_id, data FROM scenes ORDER BY scene_number ASC"):
                try:
                    s = Scene.model_validate_json(row["data"])
                    scene_dict.setdefault(row["project_id"], []).append(s)
                except Exception as e:
                    logger.error(f"[Store] Error loading scene: {e}")
            self.scenes = scene_dict

            # Load candidates
            candidate_dict: Dict[str, List[LocationCandidate]] = {}
            for row in conn.execute("SELECT scene_id, data FROM candidates ORDER BY rank ASC"):
                try:
                    c = LocationCandidate.model_validate_json(row["data"])
                    candidate_dict.setdefault(row["scene_id"], []).append(c)
                except Exception as e:
                    logger.error(f"[Store] Error loading candidate: {e}")
            self.candidates = candidate_dict

            # Load plans
            for row in conn.execute("SELECT project_id, data FROM plans"):
                try:
                    plan = ProductionPlan.model_validate_json(row["data"])
                    self.plans[row["project_id"]] = plan
                except Exception as e:
                    logger.error(f"[Store] Error loading plan: {e}")

            # Load runs
            for row in conn.execute("SELECT data FROM runs ORDER BY started_at DESC"):
                try:
                    run = AgentRun.model_validate_json(row["data"])
                    self.runs[run.id] = run
                except Exception as e:
                    logger.error(f"[Store] Error loading run: {e}")

            # Load searches
            for row in conn.execute("SELECT scene_id, data FROM searches"):
                try:
                    sr = SearchResponse.model_validate_json(row["data"])
                    self.searches[row["scene_id"]] = sr
                except Exception as e:
                    logger.error(f"[Store] Error loading search: {e}")

            # Load storyboards
            for row in conn.execute("SELECT scene_id, data FROM storyboards"):
                try:
                    self.storyboards[row["scene_id"]] = json.loads(row["data"])
                except Exception as e:
                    logger.error(f"[Store] Error loading storyboard: {e}")

            # Load audio cues
            for row in conn.execute("SELECT scene_id, data FROM audio_cues"):
                try:
                    self.audio_cues[row["scene_id"]] = json.loads(row["data"])
                except Exception as e:
                    logger.error(f"[Store] Error loading audio cue: {e}")

            # Load table reads
            for row in conn.execute("SELECT scene_id, data FROM table_reads"):
                try:
                    self.table_reads[row["scene_id"]] = json.loads(row["data"])
                except Exception as e:
                    logger.error(f"[Store] Error loading table read: {e}")

            logger.info(
                f"[Store] Loaded {len(self.projects)} projects, {len(self.runs)} runs, "
                f"{len(self.plans)} plans, {len(self.audio_cues)} audio cues, "
                f"{len(self.table_reads)} table reads from SQLite"
            )

    # ─── Projects ─────────────────────────────────────────────────────────────
    def save_project(self, project: Project) -> Project:
        with self._lock:
            self.projects[project.id] = project
            with self._get_conn() as conn:
                conn.execute(
                    """
                    INSERT INTO projects (id, data, created_at)
                    VALUES (?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET data=excluded.data
                    """,
                    (project.id, project.model_dump_json(), project.created_at.isoformat())
                )
                conn.commit()
        return project

    def get_project(self, project_id: str) -> Optional[Project]:
        with self._lock:
            return self.projects.get(project_id)

    def list_projects(self) -> List[Project]:
        with self._lock:
            return sorted(self.projects.values(), key=lambda p: p.created_at, reverse=True)

    def delete_project(self, project_id: str) -> bool:
        with self._lock:
            self.projects.pop(project_id, None)
            scenes = self.scenes.pop(project_id, [])
            for s in scenes:
                self.candidates.pop(s.id, None)
                self.searches.pop(s.id, None)
                self.storyboards.pop(s.id, None)
                self.audio_cues.pop(s.id, None)
                self.table_reads.pop(s.id, None)
            self.plans.pop(project_id, None)
            self.runs = {k: r for k, r in self.runs.items() if r.project_id != project_id}

            with self._get_conn() as conn:
                conn.execute("DELETE FROM projects WHERE id = ?", (project_id,))
                conn.execute("DELETE FROM scenes WHERE project_id = ?", (project_id,))
                conn.execute("DELETE FROM candidates WHERE project_id = ?", (project_id,))
                conn.execute("DELETE FROM plans WHERE project_id = ?", (project_id,))
                conn.execute("DELETE FROM runs WHERE project_id = ?", (project_id,))
                conn.execute("DELETE FROM searches WHERE project_id = ?", (project_id,))
                conn.execute("DELETE FROM storyboards WHERE project_id = ?", (project_id,))
                conn.execute("DELETE FROM audio_cues WHERE project_id = ?", (project_id,))
                conn.execute("DELETE FROM table_reads WHERE project_id = ?", (project_id,))
                conn.commit()
            return True

    def update_project(self, project_id: str, updates: dict) -> Optional[Project]:
        with self._lock:
            p = self.projects.get(project_id)
            if not p:
                return None
            for k, v in updates.items():
                if v is not None and hasattr(p, k):
                    setattr(p, k, v)
            p.updated_at = datetime.utcnow()
            return self.save_project(p)

    # ─── Scenes ───────────────────────────────────────────────────────────────
    def save_scenes(self, project_id: str, scenes: List[Scene]) -> List[Scene]:
        with self._lock:
            self.scenes[project_id] = scenes
            with self._get_conn() as conn:
                conn.execute("DELETE FROM scenes WHERE project_id = ?", (project_id,))
                for s in scenes:
                    conn.execute(
                        """
                        INSERT INTO scenes (id, project_id, scene_number, data)
                        VALUES (?, ?, ?, ?)
                        """,
                        (s.id, project_id, s.scene_number, s.model_dump_json())
                    )
                conn.commit()
        return scenes

    def get_scenes(self, project_id: str) -> List[Scene]:
        with self._lock:
            return sorted(self.scenes.get(project_id, []), key=lambda s: s.scene_number)

    def add_scene(self, project_id: str, scene: Scene) -> Scene:
        with self._lock:
            scenes = self.scenes.get(project_id, [])
            scenes.append(scene)
            self.save_scenes(project_id, scenes)
            p = self.projects.get(project_id)
            if p:
                p.scene_count = len(scenes)
                self.save_project(p)
            return scene

    def update_scene(self, project_id: str, scene_id: str, updates: dict) -> Optional[Scene]:
        with self._lock:
            scenes = self.scenes.get(project_id, [])
            target = next((s for s in scenes if s.id == scene_id), None)
            if not target:
                return None
            for k, v in updates.items():
                if v is not None and hasattr(target, k):
                    setattr(target, k, v)
            self.save_scenes(project_id, scenes)
            return target

    def delete_scene(self, project_id: str, scene_id: str) -> bool:
        with self._lock:
            scenes = self.scenes.get(project_id, [])
            new_scenes = [s for s in scenes if s.id != scene_id]
            if len(new_scenes) == len(scenes):
                return False
            # Re-index scene numbers
            for idx, s in enumerate(new_scenes, start=1):
                s.scene_number = idx
            self.save_scenes(project_id, new_scenes)
            self.candidates.pop(scene_id, None)
            self.searches.pop(scene_id, None)
            self.storyboards.pop(scene_id, None)
            self.audio_cues.pop(scene_id, None)
            self.table_reads.pop(scene_id, None)
            with self._get_conn() as conn:
                conn.execute("DELETE FROM candidates WHERE scene_id = ?", (scene_id,))
                conn.execute("DELETE FROM searches WHERE scene_id = ?", (scene_id,))
                conn.execute("DELETE FROM storyboards WHERE scene_id = ?", (scene_id,))
                conn.execute("DELETE FROM audio_cues WHERE scene_id = ?", (scene_id,))
                conn.execute("DELETE FROM table_reads WHERE scene_id = ?", (scene_id,))
                conn.commit()
            p = self.projects.get(project_id)
            if p:
                p.scene_count = len(new_scenes)
                self.save_project(p)
            return True

    # ─── Candidates ───────────────────────────────────────────────────────────
    def save_candidates(self, scene_id: str, candidates: List[LocationCandidate]) -> None:
        with self._lock:
            self.candidates[scene_id] = candidates
            with self._get_conn() as conn:
                conn.execute("DELETE FROM candidates WHERE scene_id = ?", (scene_id,))
                for c in candidates:
                    conn.execute(
                        """
                        INSERT INTO candidates (id, scene_id, project_id, rank, data)
                        VALUES (?, ?, ?, ?, ?)
                        ON CONFLICT(id) DO UPDATE SET
                            scene_id = excluded.scene_id,
                            project_id = excluded.project_id,
                            rank = excluded.rank,
                            data = excluded.data
                        """,
                        (c.id, scene_id, c.project_id, c.rank, c.model_dump_json())
                    )
                conn.commit()


    def delete_candidate(self, scene_id: str, candidate_id: str) -> bool:
        with self._lock:
            cands = self.candidates.get(scene_id, [])
            new_cands = [c for c in cands if c.id != candidate_id]
            if len(new_cands) == len(cands):
                return False
            for idx, c in enumerate(new_cands, start=1):
                c.rank = idx
            self.save_candidates(scene_id, new_cands)
            return True


    def get_candidates(self, scene_id: str) -> List[LocationCandidate]:
        with self._lock:
            return sorted(self.candidates.get(scene_id, []), key=lambda c: c.rank)

    def get_all_candidates(self, project_id: str) -> List[LocationCandidate]:
        with self._lock:
            scenes = self.get_scenes(project_id)
            all_cands = []
            for scene in scenes:
                all_cands.extend(self.get_candidates(scene.id))
            return all_cands

    # ─── Plans ────────────────────────────────────────────────────────────────
    def save_plan(self, project_id: str, plan: ProductionPlan) -> None:
        with self._lock:
            self.plans[project_id] = plan
            with self._get_conn() as conn:
                conn.execute(
                    """
                    INSERT INTO plans (project_id, data)
                    VALUES (?, ?)
                    ON CONFLICT(project_id) DO UPDATE SET data=excluded.data
                    """,
                    (project_id, plan.model_dump_json())
                )
                conn.commit()

    def get_plan(self, project_id: str) -> Optional[ProductionPlan]:
        with self._lock:
            return self.plans.get(project_id)

    # ─── Runs ─────────────────────────────────────────────────────────────────
    def save_run(self, run: AgentRun) -> AgentRun:
        with self._lock:
            self.runs[run.id] = run
            with self._get_conn() as conn:
                conn.execute(
                    """
                    INSERT INTO runs (id, project_id, started_at, data)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(id) DO UPDATE SET data=excluded.data
                    """,
                    (run.id, run.project_id, run.started_at.isoformat(), run.model_dump_json())
                )
                conn.commit()
        return run

    def get_run(self, run_id: str) -> Optional[AgentRun]:
        with self._lock:
            return self.runs.get(run_id)

    def get_project_runs(self, project_id: str) -> List[AgentRun]:
        with self._lock:
            return sorted(
                [r for r in self.runs.values() if r.project_id == project_id],
                key=lambda r: r.started_at,
                reverse=True
            )

    # ─── Searches ─────────────────────────────────────────────────────────────
    def save_search(self, scene_id: str, response: SearchResponse, project_id: str = "") -> None:
        with self._lock:
            self.searches[scene_id] = response
            with self._get_conn() as conn:
                conn.execute(
                    """
                    INSERT INTO searches (scene_id, project_id, data)
                    VALUES (?, ?, ?)
                    ON CONFLICT(scene_id) DO UPDATE SET data=excluded.data
                    """,
                    (scene_id, project_id, response.model_dump_json())
                )
                conn.commit()

    def get_search(self, scene_id: str) -> Optional[SearchResponse]:
        with self._lock:
            return self.searches.get(scene_id)

    def get_all_searches(self, project_id: str) -> List[SearchResponse]:
        with self._lock:
            scenes = self.get_scenes(project_id)
            results = []
            for scene in scenes:
                sr = self.get_search(scene.id)
                if sr:
                    results.append(sr)
            return results

    # ─── Storyboards ──────────────────────────────────────────────────────────
    def save_storyboard(self, scene_id: str, project_id: str, storyboard_data: Dict) -> None:
        with self._lock:
            self.storyboards[scene_id] = storyboard_data
            with self._get_conn() as conn:
                conn.execute(
                    """
                    INSERT INTO storyboards (scene_id, project_id, data)
                    VALUES (?, ?, ?)
                    ON CONFLICT(scene_id) DO UPDATE SET data=excluded.data
                    """,
                    (scene_id, project_id, json.dumps(storyboard_data))
                )
                conn.commit()

    def get_storyboard(self, scene_id: str) -> Optional[Dict]:
        with self._lock:
            return self.storyboards.get(scene_id)

    def get_project_storyboards(self, project_id: str) -> Dict[str, Dict]:
        with self._lock:
            return {
                s.id: self.storyboards[s.id]
                for s in self.get_scenes(project_id)
                if s.id in self.storyboards
            }

    # ─── Audio Cues (Lyria 3) ─────────────────────────────────────────────────
    def save_audio_cue(self, scene_id: str, project_id: str, audio_data: Dict) -> None:
        with self._lock:
            self.audio_cues[scene_id] = audio_data
            with self._get_conn() as conn:
                conn.execute(
                    """
                    INSERT INTO audio_cues (scene_id, project_id, data)
                    VALUES (?, ?, ?)
                    ON CONFLICT(scene_id) DO UPDATE SET data=excluded.data
                    """,
                    (scene_id, project_id, json.dumps(audio_data))
                )
                conn.commit()

    def get_audio_cue(self, scene_id: str) -> Optional[Dict]:
        with self._lock:
            return self.audio_cues.get(scene_id)

    def get_project_audio_cues(self, project_id: str) -> Dict[str, Dict]:
        with self._lock:
            return {
                s.id: self.audio_cues[s.id]
                for s in self.get_scenes(project_id)
                if s.id in self.audio_cues
            }

    # ─── Table Reads (Gemini 3.1 Flash TTS) ───────────────────────────────────

    def save_table_read(self, scene_id: str, project_id: str, table_read_data: Dict) -> None:
        with self._lock:
            self.table_reads[scene_id] = table_read_data
            with self._get_conn() as conn:
                conn.execute(
                    """
                    INSERT INTO table_reads (scene_id, project_id, data)
                    VALUES (?, ?, ?)
                    ON CONFLICT(scene_id) DO UPDATE SET data=excluded.data
                    """,
                    (scene_id, project_id, json.dumps(table_read_data))
                )
                conn.commit()

    def get_table_read(self, scene_id: str) -> Optional[Dict]:
        with self._lock:
            return self.table_reads.get(scene_id)

    def get_project_table_reads(self, project_id: str) -> Dict[str, Dict]:
        with self._lock:
            return {
                s.id: self.table_reads[s.id]
                for s in self.get_scenes(project_id)
                if s.id in self.table_reads
            }


# Global singleton instance
store = PersistentStore()

