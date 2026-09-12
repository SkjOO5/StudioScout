import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Project, 
  Scene, 
  LocationCandidate, 
  ProductionPlan, 
  AgentRun, 
  ResearchSource 
} from '../types';
import { api } from '../lib/api';
import { SceneCard } from '../components/SceneCard';
import { CandidateCard } from '../components/CandidateCard';
import { AgentActivityTimeline } from '../components/AgentActivityTimeline';
import { ProductionPlanView } from '../components/ProductionPlanView';
import { ScoreBreakdownModal } from '../components/ScoreBreakdownModal';
import { ReplanModal } from '../components/ReplanModal';
import { EditProjectModal } from '../components/EditProjectModal';
import { EditSceneModal } from '../components/EditSceneModal';
import { ExportModal } from '../components/ExportModal';
import { ProductionMap3D } from '../components/3d/ProductionMap3D';
import { AudioCuePlayer } from '../components/AudioCuePlayer';
import { TableReadPlayer } from '../components/TableReadPlayer';
import { 
  Film, 
  Sparkles, 
  MapPin, 
  Search, 
  Calendar, 
  RefreshCw, 
  ArrowLeft,
  Radar,
  Award,
  ExternalLink,
  Palette,
  Camera,
  Sliders,
  Music,
  Mic,
  Users,
  Edit3,
  Trash2,
  Plus,
  Compass,
  Download
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autostart = searchParams.get('autostart') === 'true';

  // State
  const [project, setProject] = useState<Project | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [candidates, setCandidates] = useState<LocationCandidate[]>([]);
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [storyboards, setStoryboards] = useState<Record<string, any>>({});
  const [audioCues, setAudioCues] = useState<Record<string, any>>({});
  const [tableReads, setTableReads] = useState<Record<string, any>>({});
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);

  // UI Tabs & Modals
  const [activeTab, setActiveTab] = useState<'scout' | 'storyboards' | 'audio' | 'tableread' | 'plan' | 'sources'>('scout');
  const [scoreModalCandidate, setScoreModalCandidate] = useState<LocationCandidate | null>(null);
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [sceneToEdit, setSceneToEdit] = useState<Scene | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);
  const [isStartingScout, setIsStartingScout] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  const [isGeneratingTableRead, setIsGeneratingTableRead] = useState<string | null>(null);
  const [show3DMap, setShow3DMap] = useState(true);

  const pollingRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      loadWorkspaceData(id);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [id]);

  // Autostart handler
  useEffect(() => {
    if (autostart && id && project && !activeRun && project.status === 'created') {
      handleStartScout();
    }
  }, [autostart, id, project]);

  const loadWorkspaceData = async (projectId: string) => {
    try {
      const [projData, scenesData, candsData] = await Promise.all([
        api.getProject(projectId),
        api.getProjectScenes(projectId).catch(() => []),
        api.getProjectRecommendations(projectId).catch(() => []),
      ]);

      setProject(projData);
      setScenes(scenesData);
      setCandidates(candsData);

      if (scenesData.length > 0 && !selectedScene) {
        setSelectedScene(scenesData[0]);
      }

      api.getProjectPlan(projectId).then(setPlan).catch(() => setPlan(null));
      api.getProjectSources(projectId).then(setSources).catch(() => setSources([]));
      api.getProjectStoryboards(projectId).then(setStoryboards).catch(() => setStoryboards({}));
      api.getProjectAudioCues(projectId).then(setAudioCues).catch(() => setAudioCues({}));
      api.getProjectTableReads(projectId).then(setTableReads).catch(() => setTableReads({}));

      if (projData.current_run_id) {
        const runData = await api.getRun(projData.current_run_id).catch(() => null);
        if (runData) {
          setActiveRun(runData);
          if (['queued', 'analyzing', 'researching', 'evaluating', 'planning', 'replanning'].includes(runData.state)) {
            startPolling(runData.id, projectId);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  };

  const startPolling = (runId: string, projectId: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const run = await api.getRun(runId);
        setActiveRun(run);

        // Incremental data reload
        const [updatedScenes, updatedCands] = await Promise.all([
          api.getProjectScenes(projectId).catch(() => []),
          api.getProjectRecommendations(projectId).catch(() => []),
        ]);

        setScenes(updatedScenes);
        setCandidates(updatedCands);

        if (!selectedScene && updatedScenes.length > 0) {
          setSelectedScene(updatedScenes[0]);
        }

        if (run.state === 'completed' || run.state === 'failed') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          api.getProjectPlan(projectId).then(setPlan).catch(() => null);
          api.getProjectSources(projectId).then(setSources).catch(() => null);
          api.getProjectStoryboards(projectId).then(setStoryboards).catch(() => null);
          api.getProjectAudioCues(projectId).then(setAudioCues).catch(() => null);
          api.getProjectTableReads(projectId).then(setTableReads).catch(() => null);
          api.getProject(projectId).then(setProject).catch(() => null);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  const handleStartScout = async () => {
    if (!id) return;
    try {
      setIsStartingScout(true);
      const res = await api.startScout(id);
      const newRun = await api.getRun(res.run_id);
      setActiveRun(newRun);
      startPolling(res.run_id, id);
    } catch (err) {
      console.error('Failed to start scout run:', err);
    } finally {
      setIsStartingScout(false);
    }
  };

  const handleTriggerReplan = async (data: { constraint: string; constraint_type?: string }) => {
    if (!id) return;
    try {
      setIsReplanning(true);
      const res = await api.triggerReplan(id, data);
      setIsReplanModalOpen(false);

      const run = await api.getRun(res.run_id);
      setActiveRun(run);
      startPolling(res.run_id, id);
      setActiveTab('plan');
    } catch (err) {
      console.error('Failed to trigger replan:', err);
    } finally {
      setIsReplanning(false);
    }
  };

  const handleGenerateStoryboard = async (sceneId: string) => {
    if (!id) return;
    try {
      setIsGeneratingStoryboard(sceneId);
      const concept = await api.generateSceneStoryboard(id, sceneId);
      setStoryboards((prev) => ({ ...prev, [sceneId]: concept }));
    } catch (err) {
      console.error('Failed to generate storyboard concept:', err);
    } finally {
      setIsGeneratingStoryboard(null);
    }
  };

  const handleGenerateAudioCue = async (sceneId: string) => {
    if (!id) return;
    try {
      setIsGeneratingAudio(sceneId);
      const cue = await api.generateSceneAudioCue(id, sceneId);
      setAudioCues((prev) => ({ ...prev, [sceneId]: cue }));
    } catch (err) {
      console.error('Failed to generate audio cue:', err);
    } finally {
      setIsGeneratingAudio(null);
    }
  };

  const handleGenerateTableRead = async (sceneId: string) => {
    if (!id) return;
    try {
      setIsGeneratingTableRead(sceneId);
      const tr = await api.generateSceneTableRead(id, sceneId);
      setTableReads((prev) => ({ ...prev, [sceneId]: tr }));
    } catch (err) {
      console.error('Failed to generate table read:', err);
    } finally {
      setIsGeneratingTableRead(null);
    }
  };

  const handleDeleteProject = async () => {
    if (!id || !project) return;
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        setIsDeletingProject(true);
        await api.deleteProject(id);
        navigate('/dashboard');
      } catch (err) {
        alert('Failed to delete project.');
      } finally {
        setIsDeletingProject(false);
      }
    }
  };

  const handleDeleteScene = async (scene: Scene) => {
    if (!id) return;
    if (window.confirm(`Are you sure you want to delete scene ${scene.scene_number}?`)) {
      try {
        await api.deleteScene(id, scene.id);
        setScenes((prev) => prev.filter((s) => s.id !== scene.id));
        if (selectedScene?.id === scene.id) {
          setSelectedScene(null);
        }
      } catch (err) {
        alert('Failed to delete scene.');
      }
    }
  };

  const handleDeleteCandidate = async (candidate: LocationCandidate) => {
    if (!id || !selectedScene) return;
    if (window.confirm(`Reject and remove "${candidate.name}" from Scene #${selectedScene.scene_number}?`)) {
      try {
        await api.deleteCandidate(id, selectedScene.id, candidate.id);
        setCandidates((prev) => prev.filter((c) => c.id !== candidate.id));
      } catch (err) {
        alert('Failed to remove candidate.');
      }
    }
  };

  const handleSceneSaved = (savedScene: Scene, isNew: boolean) => {
    if (isNew) {
      setScenes((prev) => [...prev, savedScene].sort((a, b) => a.scene_number - b.scene_number));
      setSelectedScene(savedScene);
    } else {
      setScenes((prev) => prev.map((s) => (s.id === savedScene.id ? savedScene : s)));
      if (selectedScene?.id === savedScene.id) {
        setSelectedScene(savedScene);
      }
    }
  };

  const selectedSceneCandidates = candidates.filter(
    (c) => c.scene_id === selectedScene?.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Top Banner / Project Info */}
      <div className="sketch-card sketch-tape p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors duration-200">
        <div className="flex items-center gap-4">
          {/* FIX 4: min-w-[44px] min-h-[44px] touch target */}
          <Link
            to="/dashboard"
            className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly bg-studio-surface text-studio-text border-2 border-studio-border shadow-sketch-xs flex items-center justify-center hover:bg-studio-yellow hover:text-slate-950 transition-all shrink-0 cursor-pointer"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-current" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-hand font-bold">
              <span className="px-3 py-0.5 rounded-wobbly text-xs uppercase tracking-wider bg-studio-yellow text-slate-950 border border-studio-border shadow-sketch-xs">
                {project?.genre || 'Thriller'}
              </span>
              <span className="text-xs text-studio-secondary flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-studio-red" />
                {project?.production_city}
              </span>
              <span className="text-xs text-studio-secondary dark:text-slate-300 uppercase font-bold">
                &bull; {project?.budget_tier} Tier
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-studio-text tracking-tight">
                {project?.name || 'Loading Production...'}
              </h1>
              {project && (
                <div className="flex items-center gap-1.5">
                  {/* FIX 4: min-w-[44px] min-h-[44px] */}
                  <button
                    onClick={() => setIsEditProjectOpen(true)}
                    className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly bg-studio-surface border-2 border-studio-border shadow-sketch-xs hover:bg-studio-yellow hover:text-slate-950 text-studio-text transition-all cursor-pointer"
                    title="Edit Production Details"
                    aria-label="Edit Production Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    disabled={isDeletingProject}
                    className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly bg-studio-surface border-2 border-studio-border shadow-sketch-xs hover:bg-studio-red hover:text-white text-accent-red-safe transition-all cursor-pointer"
                    title="Delete Project"
                    aria-label="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons in header - FIX 4: min-h-[44px] */}
        <div className="flex flex-wrap items-center gap-2.5">
          {(!activeRun || activeRun.state === 'failed') && scenes.length === 0 && (
            <button
              onClick={handleStartScout}
              disabled={isStartingScout}
              className="btn-sketch min-h-[44px] !py-2.5 !px-5 text-sm font-hand font-bold cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-studio-yellow" />
              <span>{isStartingScout ? 'INITIALIZING AGENT...' : 'START AUTONOMOUS SCOUT'}</span>
            </button>
          )}

          {scenes.length > 0 && (
            <button
              onClick={() => setShow3DMap(!show3DMap)}
              className="btn-secondary min-h-[44px] !py-2.5 !px-4 text-sm font-hand font-bold hidden sm:inline-flex cursor-pointer"
            >
              <Radar className="w-4 h-4 text-studio-red" />
              <span>{show3DMap ? 'Hide 3D Map' : 'Show 3D Map'}</span>
            </button>
          )}

          {project && (
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="btn-sketch min-h-[44px] !py-2.5 !px-4 text-sm font-hand font-bold flex items-center gap-1.5 shadow-sketch-xs cursor-pointer"
              title="Export Production Bible, Call Sheets, Calendar, or CSV"
            >
              <Download className="w-4 h-4 text-studio-yellow" />
              <span>Export Hub</span>
            </button>
          )}

          {plan && (
            <button
              onClick={() => setIsReplanModalOpen(true)}
              className="btn-sketch-yellow min-h-[44px] !py-2.5 !px-4 text-sm font-hand font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-slate-900" />
              <span>Modify Constraint</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D Production Map Container */}
      {show3DMap && scenes.length > 0 && (
        <div className="sketch-card p-4 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch overflow-hidden transition-colors duration-200">
          <ProductionMap3D
            scenes={scenes}
            selectedSceneId={selectedScene?.id || null}
            onSelectScene={(s) => setSelectedScene(s)}
          />
        </div>
      )}

      {/* Navigation Tabs - Mobile scrollable ribbon with >=44px touch targets */}
      <div className="flex items-center gap-2 pb-2.5 border-b-2 border-dashed border-studio-border/30 overflow-x-auto no-scrollbar sm:flex-wrap text-xs font-hand font-bold">
        <button
          onClick={() => setActiveTab('scout')}
          className={`touch-target min-h-[44px] shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-wobbly transition-all border-2 cursor-pointer ${
            activeTab === 'scout'
              ? 'bg-studio-yellow text-slate-950 border-studio-border shadow-sketch font-black'
              : 'bg-studio-surface text-studio-secondary dark:text-slate-200 border-studio-border/60 shadow-sketch-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Compass className="w-4 h-4 text-studio-red" />
          <span>LOCATION RADAR</span>
        </button>

        <button
          onClick={() => setActiveTab('storyboards')}
          className={`touch-target min-h-[44px] shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-wobbly transition-all border-2 cursor-pointer ${
            activeTab === 'storyboards'
              ? 'bg-studio-red text-white border-studio-border shadow-sketch font-black'
              : 'bg-studio-surface text-studio-secondary dark:text-slate-200 border-studio-border/60 shadow-sketch-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>VFX &amp; STORYBOARDS</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`touch-target min-h-[44px] shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-wobbly transition-all border-2 cursor-pointer ${
            activeTab === 'audio'
              ? 'bg-studio-yellow text-slate-950 border-studio-border shadow-sketch font-black'
              : 'bg-studio-surface text-studio-secondary dark:text-slate-200 border-studio-border/60 shadow-sketch-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>AUDIO &amp; SCORE CUES</span>
        </button>

        <button
          onClick={() => setActiveTab('tableread')}
          className={`touch-target min-h-[44px] shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-wobbly transition-all border-2 cursor-pointer ${
            activeTab === 'tableread'
              ? 'bg-studio-red text-white border-studio-border shadow-sketch font-black'
              : 'bg-studio-surface text-studio-secondary dark:text-slate-200 border-studio-border/60 shadow-sketch-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>TABLE-READ &amp; DIALOGUE</span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`touch-target min-h-[44px] shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-wobbly transition-all border-2 cursor-pointer ${
            activeTab === 'plan'
              ? 'bg-emerald-400 text-slate-950 border-studio-border shadow-sketch font-black'
              : 'bg-studio-surface text-studio-secondary dark:text-slate-200 border-studio-border/60 shadow-sketch-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>PRODUCTION PLAN {plan ? `(V${plan.version})` : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`touch-target min-h-[44px] shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-wobbly transition-all border-2 cursor-pointer ${
            activeTab === 'sources'
              ? 'bg-sky-200 dark:bg-sky-900 text-slate-950 dark:text-sky-100 border-studio-border shadow-sketch font-black'
              : 'bg-studio-surface text-studio-secondary dark:text-slate-200 border-studio-border/60 shadow-sketch-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>RESEARCH CITATIONS ({sources.length})</span>
        </button>
      </div>

      {/* Tab 1: Scout Workflow & Intelligence Slate */}
      {activeTab === 'scout' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Scene List & Telemetry (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <AgentActivityTimeline run={activeRun} isLoading={isStartingScout} />

            {/* Scene Selector Deck */}
            <div className="sketch-card p-5 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch space-y-3 transition-colors duration-200">
              <div className="flex items-center justify-between pb-2 border-b-2 border-dashed border-studio-border/30">
                <h3 className="text-xs font-display font-black uppercase tracking-wider text-studio-text flex items-center gap-2">
                  <Film className="w-4 h-4 text-studio-red" />
                  Extracted Scenes ({scenes.length})
                </h3>
                {/* FIX 4: min-h-[40px] touch target */}
                <button
                  onClick={() => {
                    setSceneToEdit(null);
                    setIsSceneModalOpen(true);
                  }}
                  className="touch-target min-h-[40px] px-3 py-1.5 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-hand font-bold shadow-sketch-xs hover:bg-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Scene</span>
                </button>
              </div>

              {scenes.length === 0 ? (
                <div className="py-8 text-center text-studio-muted">
                  <p className="text-sm font-hand font-bold">No scenes extracted yet.</p>
                  <p className="text-xs mt-1 font-hand">Click "Start Autonomous Scout" or "Add Scene".</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {scenes.map((sc) => (
                    <SceneCard
                      key={sc.id}
                      scene={sc}
                      isSelected={selectedScene?.id === sc.id}
                      onSelect={() => setSelectedScene(sc)}
                      onEdit={(target) => {
                        setSceneToEdit(target);
                        setIsSceneModalOpen(true);
                      }}
                      onDelete={handleDeleteScene}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recommendations for Selected Scene (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedScene ? (
              <div className="space-y-6">
                {/* Selected Scene Hero Banner */}
                <div className="sketch-card sketch-tape p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch transition-colors duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <span className="px-3 py-1 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-display font-black shadow-sketch-xs">
                      SCENE {String(selectedScene.scene_number).padStart(2, '0')} SCOUTING REPORT
                    </span>
                    <div className="flex items-center gap-2">
                      {/* FIX 4: min-h-[44px] */}
                      <button
                        onClick={() => {
                          setSceneToEdit(selectedScene);
                          setIsSceneModalOpen(true);
                        }}
                        className="touch-target min-h-[44px] px-3.5 py-1.5 rounded-wobbly bg-studio-surface border-2 border-studio-border text-xs font-hand font-bold shadow-sketch-xs hover:bg-studio-yellow hover:text-slate-950 text-studio-text flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Scene</span>
                      </button>
                      <button
                        onClick={() => handleDeleteScene(selectedScene)}
                        className="touch-target min-h-[44px] px-3.5 py-1.5 rounded-wobbly bg-studio-surface border-2 border-studio-border text-xs font-hand font-bold shadow-sketch-xs hover:bg-studio-red hover:text-white text-accent-red-safe flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-studio-text mb-2">
                    {selectedScene.heading}
                  </h2>

                  {selectedScene.description && (
                    <p className="text-sm sm:text-base text-studio-secondary leading-relaxed font-hand mb-4">
                      {selectedScene.description}
                    </p>
                  )}

                  {/* Requirements Pills */}
                  {selectedScene.requirements.length > 0 && (
                    <div className="pt-3 border-t-2 border-dashed border-studio-border/30 space-y-2">
                      <span className="text-xs font-hand font-bold uppercase tracking-wider text-studio-secondary dark:text-slate-200 block">
                        Technical Requirements for Scene:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedScene.requirements.map((req, rIdx) => (
                          <span
                            key={rIdx}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-wobbly text-xs font-hand font-bold border-2 border-studio-border shadow-sketch-xs ${
                              req.priority === 'required'
                                ? 'bg-red-100 dark:bg-rose-950/60 text-accent-red-safe' // FIX 1: safe contrast
                                : req.priority === 'preferred'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200'
                                : 'bg-studio-muted text-studio-text'
                            }`}
                          >
                            <span className="capitalize font-display">{req.category}:</span> {req.description}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Cards List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-display font-black uppercase tracking-wider text-studio-text flex items-center gap-2">
                      <Award className="w-4 h-4 text-studio-yellow" />
                      Parallel Search Candidates ({selectedSceneCandidates.length})
                    </h3>
                  </div>

                  {selectedSceneCandidates.length === 0 ? (
                    <div className="sketch-card p-12 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch text-center text-studio-muted">
                      <div className="w-14 h-14 rounded-wobbly bg-studio-yellow text-slate-950 border-2 border-studio-border flex items-center justify-center mx-auto mb-3 shadow-sketch-xs">
                        <Search className="w-7 h-7 text-slate-950" />
                      </div>
                      <p className="text-base font-display font-bold text-studio-text">
                        No scored candidates for this scene yet.
                      </p>
                      <p className="text-sm mt-1 text-studio-secondary font-hand">
                        The agent will query Parallel Search and evaluate matches via Gemini.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {selectedSceneCandidates.map((cand) => (
                        <CandidateCard
                          key={cand.id}
                          candidate={cand}
                          onViewScoreBreakdown={(c) => setScoreModalCandidate(c)}
                          onDeleteCandidate={handleDeleteCandidate}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="sketch-card p-16 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch text-center text-studio-muted">
                <Film className="w-10 h-10 mx-auto mb-3 text-studio-red" />
                <p className="text-lg font-display font-bold text-studio-text">Select a scene from the left to inspect scouting results.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: VFX & Storyboard Moodboards */}
      {activeTab === 'storyboards' && (
        <div className="space-y-6">
          <div className="sketch-card sketch-tape p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-wobbly bg-studio-red text-white border border-studio-border text-xs font-hand font-bold mb-2 shadow-sketch-xs">
                <span>GEMINI 2.5 + IMAGEN 3 CINEMATOGRAPHY ENGINE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-studio-text">
                Scene Storyboard &amp; Camera Concept Moodboards
              </h2>
              <p className="text-sm sm:text-base text-studio-secondary font-hand mt-1">
                AI Director of Photography frames lighting schemes, camera lenses, and visual reference prompts for every scene.
              </p>
            </div>
          </div>

          {scenes.length === 0 ? (
            <div className="sketch-card p-16 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch text-center text-studio-muted">
              <Palette className="w-12 h-12 mx-auto mb-3 text-studio-red" />
              <p className="text-base font-display font-bold text-studio-text">No scenes extracted yet to generate storyboards.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenes.map((scene) => {
                const sb = storyboards[scene.id];
                const isGen = isGeneratingStoryboard === scene.id;

                return (
                  <div
                    key={scene.id}
                    className="sketch-card sketch-pin p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-display font-black shadow-sketch-xs">
                          SCENE {scene.scene_number}
                        </span>
                        <span className="text-xs font-hand font-bold text-studio-secondary dark:text-slate-300">
                          {scene.time_of_day.toUpperCase()} &bull; {scene.setting.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-xl font-display font-extrabold text-studio-text mb-2">
                        {scene.heading}
                      </h3>

                      {sb ? (
                        <div className="space-y-3.5 mt-4">
                          <div className="rounded-wobbly-md border-2 border-studio-border overflow-hidden shadow-sketch-xs relative group">
                            <img
                              src={sb.image_url || `/storyboards/scene${scene.scene_number}.jpg`}
                              alt={sb.title || scene.heading}
                              className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `/storyboards/scene${scene.scene_number}.jpg`;
                              }}
                            />
                            <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-wobbly bg-black/75 backdrop-blur-sm border border-white/20 text-xs font-hand font-bold text-white">
                              IMAGEN 3 &bull; 8K CONCEPT STILL
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs font-hand font-bold">
                            <span className="px-2.5 py-1 rounded-wobbly bg-studio-muted text-studio-text border border-studio-border flex items-center gap-1 shadow-sketch-xs">
                              <Camera className="w-3.5 h-3.5 text-studio-red" />
                              {sb.lens_focal_length || '35mm Anamorphic'}
                            </span>
                            <span className="px-2.5 py-1 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border flex items-center gap-1 shadow-sketch-xs">
                              <Sliders className="w-3.5 h-3.5" />
                              {sb.aspect_ratio || '2.39:1'}
                            </span>
                            <span className="px-2.5 py-1 rounded-wobbly bg-sky-200 dark:bg-sky-950/60 text-slate-950 dark:text-sky-200 border border-studio-border shadow-sketch-xs">
                              {sb.camera_angle || 'Wide Establishing'}
                            </span>
                          </div>

                          {sb.color_palette && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs font-hand font-bold text-studio-secondary dark:text-slate-300">Palette:</span>
                              <div className="flex items-center gap-1.5">
                                {sb.color_palette.map((color: string, cIdx: number) => (
                                  <div
                                    key={cIdx}
                                    className="w-5 h-5 rounded-full border border-studio-border shadow-sketch-xs"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="p-3 bg-studio-bg rounded-wobbly-md border border-studio-border text-xs font-mono text-studio-text space-y-1.5">
                            <p className="font-bold text-xs uppercase text-studio-redText font-display">Imagen 3 Cinematic Prompt:</p>
                            <p className="line-clamp-3 text-xs leading-relaxed">"{sb.visual_prompt}"</p>
                          </div>

                          {sb.director_notes && (
                            <p className="text-xs text-studio-secondary font-hand italic">
                              <strong className="font-display not-italic text-studio-text">DP Notes:</strong> {sb.director_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-studio-muted">
                          <p className="text-sm font-hand font-bold text-studio-text mb-1">
                            Cinematic moodboard not yet generated.
                          </p>
                          <p className="text-xs font-hand">
                            Generate DP camera angles, lighting scheme, and Imagen prompt for this scene.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t-2 border-dashed border-studio-border/30">
                      {/* FIX 4: min-h-[44px] */}
                      <button
                        onClick={() => handleGenerateStoryboard(scene.id)}
                        disabled={isGen}
                        className="btn-sketch min-h-[44px] w-full !py-2.5 text-sm font-hand font-bold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Palette className="w-4 h-4 text-studio-yellow" />
                        <span>{isGen ? 'COMPUTING FRAME...' : sb ? 'RE-GENERATE CONCEPT' : 'GENERATE STORYBOARD'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Lyria 3 Soundtrack & Audio Atmosphere */}
      {activeTab === 'audio' && (
        <div className="space-y-6">
          <div className="sketch-card sketch-tape p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-hand font-bold mb-2 shadow-sketch-xs">
                <Music className="w-3.5 h-3.5 text-slate-900" />
                <span>GOOGLE DEEPMIND LYRIA 3 CINEMATIC SOUNDTRACKS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-studio-text">
                Scene Soundtracks &amp; Acoustic Atmosphere Cues
              </h2>
              <p className="text-sm sm:text-base text-studio-secondary font-hand mt-1">
                Generates tempo (BPM), key signatures, sound design foley layers, instrumentation, and Lyria 3 music prompts for composers.
              </p>
            </div>
          </div>

          {scenes.length === 0 ? (
            <div className="sketch-card p-16 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch text-center text-studio-muted">
              <Music className="w-12 h-12 mx-auto mb-3 text-studio-yellow" />
              <p className="text-base font-display font-bold text-studio-text">No scenes extracted yet to generate soundtrack cues.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenes.map((scene) => {
                const cue = audioCues[scene.id];
                const isGen = isGeneratingAudio === scene.id;

                return (
                  <div
                    key={scene.id}
                    className="sketch-card p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-display font-black shadow-sketch-xs">
                          SCENE {scene.scene_number} AUDIO
                        </span>
                        <span className="text-xs font-hand font-bold text-studio-secondary dark:text-slate-300">
                          {scene.location}
                        </span>
                      </div>

                      <h3 className="text-xl font-display font-extrabold text-studio-text mb-2">
                        {cue ? cue.track_title : scene.heading}
                      </h3>

                      {cue ? (
                        <AudioCuePlayer cue={cue} sceneNumber={scene.scene_number} />
                      ) : (
                        <div className="py-6 text-center text-studio-muted">
                          <p className="text-sm font-hand font-bold text-studio-text mb-1">
                            Soundtrack cue not yet generated.
                          </p>
                          <p className="text-xs font-hand">
                            Generate acoustic tempo, foley design, and Lyria prompt for this scene.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t-2 border-dashed border-studio-border/30">
                      {/* FIX 4: min-h-[44px] */}
                      <button
                        onClick={() => handleGenerateAudioCue(scene.id)}
                        disabled={isGen}
                        className="btn-sketch-yellow min-h-[44px] w-full !py-2.5 text-sm font-hand font-bold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Music className="w-4 h-4 text-slate-900" />
                        <span>{isGen ? 'COMPOSING AUDIO...' : cue ? 'RE-COMPOSE CUE' : 'GENERATE LYRIA 3 SCORE'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Gemini 3.1 Flash TTS Multi-Speaker Table-Read & Dialogue Sentiment */}
      {activeTab === 'tableread' && (
        <div className="space-y-6">
          <div className="sketch-card sketch-tape p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-wobbly bg-studio-red text-white border border-studio-border text-xs font-hand font-bold mb-2 shadow-sketch-xs">
                <Mic className="w-3.5 h-3.5" />
                <span>GEMINI 3.1 FLASH TTS &amp; MULTI-SPEAKER REHEARSAL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-studio-text">
                Script Table-Read &amp; Dialogue Sentiment Analysis
              </h2>
              <p className="text-sm sm:text-base text-studio-secondary font-hand mt-1">
                AI Voice Director casts actor voice archetypes, breaks down line-by-line subtext/emotion tags, and generates multi-speaker table-read audio streams.
              </p>
            </div>
          </div>

          {scenes.length === 0 ? (
            <div className="sketch-card p-16 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch text-center text-studio-muted">
              <Mic className="w-12 h-12 mx-auto mb-3 text-studio-red" />
              <p className="text-base font-display font-bold text-studio-text">No scenes extracted yet to generate table-read rehearsals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenes.map((scene) => {
                const tr = tableReads[scene.id];
                const isGen = isGeneratingTableRead === scene.id;

                return (
                  <div
                    key={scene.id}
                    className="sketch-card p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch flex flex-col justify-between space-y-4 hover:-translate-y-0.5 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-display font-black shadow-sketch-xs">
                          SCENE {scene.scene_number} TABLE-READ
                        </span>
                        <span className="text-xs font-hand font-bold text-studio-secondary dark:text-slate-300 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-studio-red" />
                          {tr?.characters?.length || 2} Cast Members
                        </span>
                      </div>

                      <h3 className="text-xl font-display font-extrabold text-studio-text mb-2">
                        {scene.heading}
                      </h3>

                      {tr ? (
                        <TableReadPlayer tableRead={tr} sceneNumber={scene.scene_number} />
                      ) : (
                        <div className="py-6 text-center text-studio-muted">
                          <p className="text-sm font-hand font-bold text-studio-text mb-1">
                            Table-read rehearsal not yet generated.
                          </p>
                          <p className="text-xs font-hand">
                            Synthesize character voice casting, delivery direction, and dialogue sentiment.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t-2 border-dashed border-studio-border/30">
                      {/* FIX 4: min-h-[44px] */}
                      <button
                        onClick={() => handleGenerateTableRead(scene.id)}
                        disabled={isGen}
                        className="btn-sketch min-h-[44px] w-full !py-2.5 text-sm font-hand font-bold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Mic className="w-4 h-4 text-studio-yellow" />
                        <span>{isGen ? 'SYNTHESIZING READ...' : tr ? 'RE-DIRECT TABLE READ' : 'GENERATE TABLE READ (TTS)'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Production Plan & Call Sheets (FIX 2 applied inside ProductionPlanView) */}
      {activeTab === 'plan' && (
        <div>
          {plan ? (
            <ProductionPlanView
              plan={plan}
              onOpenReplanModal={() => setIsReplanModalOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          ) : (
            <div className="sketch-card p-16 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch text-center text-studio-muted transition-colors duration-200">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-studio-yellow" />
              <h3 className="text-xl font-display font-bold text-studio-text mb-1">Production Plan Pending</h3>
              <p className="text-sm text-studio-secondary font-hand max-w-md mx-auto mb-6">
                The agent generates call sheets and shooting schedules after candidate evaluations finish.
              </p>
              <button
                onClick={handleStartScout}
                className="btn-sketch min-h-[44px] !py-3 !px-6 text-sm font-hand font-bold cursor-pointer"
              >
                Launch Scout Workflow
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Research Sources & Citations */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="sketch-card sketch-tape p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch transition-colors duration-200">
            <h2 className="text-2xl font-display font-extrabold text-studio-text mb-2">
              Parallel Search Verified Web Research
            </h2>
            <p className="text-sm sm:text-base text-studio-secondary font-hand">
              Every location recommendation is grounded in real-time Parallel Search queries with full URLs and exact citation snippets.
            </p>
          </div>

          {sources.length === 0 ? (
            <div className="sketch-card p-14 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch text-center text-studio-muted">
              <Search className="w-10 h-10 mx-auto mb-3 text-studio-yellow" />
              <p className="text-base font-display font-bold text-studio-text">No search sources retrieved yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sources.map((src, idx) => (
                <div key={idx} className="sketch-card p-5 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch hover:-translate-y-0.5 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-base font-display font-bold text-studio-text line-clamp-2">
                      {src.title || 'Web Result'}
                    </h4>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        /* FIX 4: min-h-[44px] */
                        className="touch-target min-h-[44px] px-2 text-studio-redText hover:underline flex items-center gap-1 text-xs font-hand font-bold shrink-0"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-studio-secondary leading-relaxed mb-3 line-clamp-3 font-sans italic">
                    "{src.excerpt}"
                  </p>
                  <div className="pt-2 border-t-2 border-dashed border-studio-border/30 flex items-center justify-between text-xs font-hand font-bold text-studio-muted">
                    <span className="text-studio-redText font-mono">{src.domain}</span>
                    <span>Query: {src.query_used}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {scoreModalCandidate && (
        <ScoreBreakdownModal
          candidate={scoreModalCandidate}
          onClose={() => setScoreModalCandidate(null)}
        />
      )}

      {isReplanModalOpen && (
        <ReplanModal
          isOpen={isReplanModalOpen}
          isSubmitting={isReplanning}
          onClose={() => setIsReplanModalOpen(false)}
          onSubmit={handleTriggerReplan}
        />
      )}

      <EditProjectModal
        isOpen={isEditProjectOpen}
        project={project}
        onClose={() => setIsEditProjectOpen(false)}
        onSuccess={(updated) => setProject(updated)}
      />

      <EditSceneModal
        isOpen={isSceneModalOpen}
        projectId={id || ''}
        scene={sceneToEdit}
        nextSceneNumber={scenes.length > 0 ? Math.max(...scenes.map(s => s.scene_number)) + 1 : 1}
        onClose={() => setIsSceneModalOpen(false)}
        onSuccess={handleSceneSaved}
      />

      {project && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          project={project}
          plan={plan}
        />
      )}
    </div>
  );
};
