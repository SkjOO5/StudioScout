export type Genre =
  | 'action'
  | 'thriller'
  | 'drama'
  | 'comedy'
  | 'horror'
  | 'sci-fi'
  | 'romance'
  | 'documentary'
  | 'animation'
  | 'other';

export type BudgetTier = 'micro' | 'low' | 'mid' | 'high' | 'blockbuster';

export type ProjectStatus =
  | 'created'
  | 'analyzing'
  | 'researching'
  | 'planning'
  | 'completed'
  | 'failed';

export interface Project {
  id: string;
  name: string;
  genre: Genre;
  production_city: string;
  budget_tier: BudgetTier;
  status: ProjectStatus;
  scene_description?: string;
  screenplay_filename?: string;
  screenplay_text?: string;
  created_at: string;
  updated_at: string;
  current_run_id?: string;
  scene_count: number;
  has_recommendations: boolean;
  has_plan: boolean;
}

export interface SceneRequirement {
  category: string;
  description: string;
  priority: 'required' | 'preferred' | 'optional';
}

export interface Scene {
  id: string;
  project_id: string;
  scene_number: number;
  heading: string;
  location: string;
  location_type: string;
  time_of_day: string;
  setting: string;
  description?: string;
  characters: number;
  vehicles: boolean;
  props: string[];
  special_constraints: string[];
  requirements: SceneRequirement[];
  research_status: 'pending' | 'researching' | 'completed' | 'failed';
  recommendation_status: 'pending' | 'available' | 'failed';
}

export interface ScoreBreakdown {
  visual_match: number;
  location_requirements: number;
  accessibility: number;
  time_lighting: number;
  production_practicality: number;
  risk_score: number;
}

export interface Evidence {
  requirement: string;
  excerpt: string;
  source_url: string;
  source_title: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface Risk {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
}

export interface LocationCandidate {
  id: string;
  scene_id: string;
  project_id: string;
  name: string;
  description: string;
  location_type: string;
  address_hint?: string;
  city: string;
  match_score: number;
  score_breakdown: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  risks: Risk[];
  evidence: Evidence[];
  sources: string[];
  recommended_action: string;
  rank: number;
}

export interface ShootingBlock {
  start_time: string;
  end_time: string;
  activity: string;
  scene_id?: string;
  scene_number?: number;
  location?: string;
  notes?: string;
}

export interface ShootingDay {
  day_number: number;
  date_label: string;
  location: string;
  call_time: string;
  wrap_time: string;
  blocks: ShootingBlock[];
  crew_size: number;
  complexity: 'low' | 'medium' | 'high';
  notes: string[];
}

export interface PlanConstraint {
  id: string;
  type: string;
  description: string;
  affects_scene_ids: string[];
  affects_location?: string;
}

export interface ProductionPlan {
  id: string;
  project_id: string;
  version: number;
  shooting_days: ShootingDay[];
  total_days: number;
  constraints: PlanConstraint[];
  overall_risks: string[];
  dependencies: string[];
  recommended_actions: string[];
  summary: string;
  replan_reason?: string;
  previous_version_id?: string;
}

export type RunState =
  | 'queued'
  | 'analyzing'
  | 'researching'
  | 'evaluating'
  | 'planning'
  | 'replanning'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface AgentStep {
  id: string;
  run_id: string;
  step_index: number;
  name: string;
  status: StepStatus;
  detail?: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  tool_used?: string;
  error?: string;
}

export interface AgentRun {
  id: string;
  project_id: string;
  state: RunState;
  run_type: 'scout' | 'replan';
  steps: AgentStep[];
  started_at: string;
  completed_at?: string;
  total_duration_ms?: number;
  scenes_processed: number;
  searches_performed: number;
  candidates_found: number;
  error?: string;
  replan_reason?: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  excerpt: string;
  query_used?: string;
  scene_number?: number;
  scene_location?: string;
}

export interface HealthStatus {
  status: string;
  version: string;
  gemini_configured: boolean;
  parallel_configured: boolean;
  gemini_model: string;
}
