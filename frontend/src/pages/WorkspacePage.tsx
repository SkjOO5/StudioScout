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
import { 
  Film, 
  Sparkles, 
  MapPin, 
  Search, 
  Calendar, 
  RefreshCw, 
  ArrowLeft,
  Layers, 
  Radar,
  Award,
  ExternalLink,
  Palette,
  Camera,
  Sliders,
  Music,
  Volume2,
  Radio,
  Disc,
  Play,
  Mic,
  Users,
  MessageSquare,
  Activity,
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

  // Filter recommendations for currently selected scene
  const selectedSceneCandidates = candidates.filter(
    (c) => c.scene_id === selectedScene?.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">


      {/* Top Banner / Project Info */}
      <div className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors duration-250">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="w-10 h-10 rounded-xl bg-studio-surface text-studio-text border-2 border-studio-border shadow-pop-xs flex items-center justify-center hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop hover:bg-studio-hover transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-studio-text" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1.5 font-display">
              <span className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#8B5CF6] dark:text-[#A78BFA] border border-studio-border shadow-pop-xs">
                {project?.genre || 'Thriller'}
              </span>
              <span className="text-xs text-studio-muted font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
                {project?.production_city}
              </span>
              <span className="text-xs text-studio-muted font-bold uppercase">
                &bull; {project?.budget_tier} Tier
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-studio-text tracking-tight">
                {project?.name || 'Loading Production...'}
              </h1>
              {project && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsEditProjectOpen(true)}
                    className="p-1.5 rounded-lg bg-studio-surface border border-studio-border shadow-pop-xs hover:bg-[#FEF3C7] dark:hover:bg-amber-950/40 text-studio-text transition-all"
                    title="Edit Production Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    disabled={isDeletingProject}
                    className="p-1.5 rounded-lg bg-studio-surface border border-studio-border shadow-pop-xs hover:bg-[#FEE2E2] dark:hover:bg-red-950/40 text-[#EF4444] transition-all"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons in header */}
        <div className="flex items-center gap-3">
          {(!activeRun || activeRun.state === 'failed') && scenes.length === 0 && (
            <button
              onClick={handleStartScout}
              disabled={isStartingScout}
              className="btn-candy !py-3 !px-6 text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isStartingScout ? 'INITIALIZING AGENT...' : 'START AUTONOMOUS SCOUT'}</span>
            </button>
          )}

          {scenes.length > 0 && (
            <button
              onClick={() => setShow3DMap(!show3DMap)}
              className="btn-secondary !py-2.5 !px-4 text-xs hidden sm:inline-flex"
            >
              <Radar className="w-4 h-4 text-[#8B5CF6]" />
              <span>{show3DMap ? 'Hide 3D Map' : 'Show 3D Map'}</span>
            </button>
          )}

          {project && (
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="btn-candy-purple !py-2.5 !px-4 text-xs font-display font-bold flex items-center gap-1.5 shadow-pop-xs"
              title="Export Production Bible, Call Sheets, Calendar, or CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export Hub</span>
            </button>
          )}

          {plan && (
            <button
              onClick={() => setIsReplanModalOpen(true)}
              className="btn-candy-yellow !py-2.5 !px-4 text-xs font-display font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-[#1E293B]" />
              <span>Modify Constraint</span>
            </button>
          )}
        </div>
      </div>

      {/* 3D Production Map Container */}
      {show3DMap && scenes.length > 0 && (
        <div className="bg-studio-surface p-4 rounded-2xl border-2 border-studio-border shadow-pop overflow-hidden transition-colors duration-250">
          <ProductionMap3D
            scenes={scenes}
            selectedSceneId={selectedScene?.id || null}
            onSelectScene={(s) => setSelectedScene(s)}
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b-2 border-studio-border/20 pb-3 text-xs font-display font-black">
        <button
          onClick={() => setActiveTab('scout')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border-2 ${
            activeTab === 'scout'
              ? 'bg-[#8B5CF6] text-white border-studio-border shadow-pop'
              : 'bg-studio-surface text-studio-muted border-studio-border/40 shadow-pop-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>LOCATION RADAR</span>
        </button>

        <button
          onClick={() => setActiveTab('storyboards')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border-2 ${
            activeTab === 'storyboards'
              ? 'bg-[#F472B6] text-white border-studio-border shadow-pop'
              : 'bg-studio-surface text-studio-muted border-studio-border/40 shadow-pop-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>VFX & STORYBOARDS (IMAGEN 3)</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border-2 ${
            activeTab === 'audio'
              ? 'bg-[#FBBF24] text-[#1E293B] border-studio-border shadow-pop'
              : 'bg-studio-surface text-studio-muted border-studio-border/40 shadow-pop-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>AUDIO & SCORE CUES (LYRIA 3)</span>
        </button>

        <button
          onClick={() => setActiveTab('tableread')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border-2 ${
            activeTab === 'tableread'
              ? 'bg-[#A78BFA] text-[#1E293B] border-studio-border shadow-pop'
              : 'bg-studio-surface text-studio-muted border-studio-border/40 shadow-pop-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>TABLE-READ & DIALOGUE (TTS)</span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border-2 ${
            activeTab === 'plan'
              ? 'bg-[#34D399] text-[#1E293B] border-studio-border shadow-pop'
              : 'bg-studio-surface text-studio-muted border-studio-border/40 shadow-pop-xs hover:bg-studio-hover hover:text-studio-text'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>PRODUCTION PLAN {plan ? `(V${plan.version})` : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all border-2 ${
            activeTab === 'sources'
              ? 'bg-[#38BDF8] text-[#1E293B] border-studio-border shadow-pop'
              : 'bg-studio-surface text-studio-muted border-studio-border/40 shadow-pop-xs hover:bg-studio-hover hover:text-studio-text'
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
            <div className="bg-studio-surface p-5 rounded-2xl border-2 border-studio-border shadow-pop space-y-3 transition-colors duration-250">
              <div className="flex items-center justify-between pb-2 border-b-2 border-studio-border/20">
                <h3 className="text-xs font-display font-black uppercase tracking-wider text-studio-text flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#8B5CF6]" />
                  Extracted Scenes ({scenes.length})
                </h3>
                <button
                  onClick={() => {
                    setSceneToEdit(null);
                    setIsSceneModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-[#FBBF24] border border-studio-border text-[10px] font-display font-black shadow-pop-xs hover:bg-[#FDE047] transition-all flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Scene</span>
                </button>
              </div>

              {scenes.length === 0 ? (
                <div className="py-8 text-center text-studio-muted">
                  <p className="text-xs font-display font-bold">No scenes extracted yet.</p>
                  <p className="text-[11px] mt-1 font-medium">Click "Start Autonomous Scout" or "Add Scene".</p>
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
                <div className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop transition-colors duration-250">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-[#8B5CF6] text-white border border-studio-border text-xs font-display font-black shadow-pop-xs">
                      SCENE {String(selectedScene.scene_number).padStart(2, '0')} SCOUTING REPORT
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSceneToEdit(selectedScene);
                          setIsSceneModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-studio-surface border border-studio-border text-xs font-display font-bold shadow-pop-xs hover:bg-[#FEF3C7] dark:hover:bg-amber-950/40 text-studio-text flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-studio-text" />
                        <span>Edit Scene</span>
                      </button>
                      <button
                        onClick={() => handleDeleteScene(selectedScene)}
                        className="px-2.5 py-1 rounded-lg bg-studio-surface border border-studio-border text-xs font-display font-bold shadow-pop-xs hover:bg-[#FEE2E2] dark:hover:bg-red-950/40 text-[#EF4444] flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  <h2 className="text-2xl font-display font-extrabold text-studio-text mb-2">
                    {selectedScene.heading}
                  </h2>

                  {selectedScene.description && (
                    <p className="text-xs sm:text-sm text-studio-muted leading-relaxed font-medium mb-4">
                      {selectedScene.description}
                    </p>
                  )}

                  {/* Requirements Pills */}
                  {selectedScene.requirements.length > 0 && (
                    <div className="pt-3 border-t-2 border-studio-border/20 space-y-2">
                      <span className="text-[10px] font-display font-black uppercase tracking-wider text-studio-muted block">
                        Technical Requirements for Scene
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedScene.requirements.map((req, rIdx) => (
                          <span
                            key={rIdx}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-bold border border-studio-border shadow-pop-xs ${
                              req.priority === 'required'
                                ? 'bg-[#FFE4E6] dark:bg-rose-950/40 text-[#E11D48] dark:text-rose-300'
                                : req.priority === 'preferred'
                                ? 'bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-amber-300'
                                : 'bg-studio-muted text-studio-text'
                            }`}
                          >
                            <span className="capitalize">{req.category}:</span> {req.description}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Cards List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-display font-black uppercase tracking-wider text-studio-text flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#8B5CF6]" />
                      Parallel Search Candidates ({selectedSceneCandidates.length})
                    </h3>
                  </div>

                  {selectedSceneCandidates.length === 0 ? (
                    <div className="bg-studio-surface p-12 rounded-2xl border-2 border-studio-border shadow-pop text-center text-studio-muted">
                      <div className="w-14 h-14 rounded-full bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 border-2 border-studio-border flex items-center justify-center mx-auto mb-3 shadow-pop-xs">
                        <Search className="w-7 h-7 text-[#8B5CF6] dark:text-[#A78BFA]" />
                      </div>
                      <p className="text-sm font-display font-bold text-studio-text">
                        No scored candidates for this scene yet.
                      </p>
                      <p className="text-xs mt-1 text-studio-muted font-medium">
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
              <div className="bg-studio-surface p-16 rounded-2xl border-2 border-studio-border shadow-pop text-center text-studio-muted">
                <Film className="w-10 h-10 mx-auto mb-3 text-[#8B5CF6]" />
                <p className="text-base font-display font-bold text-studio-text">Select a scene from the left to inspect scouting results.</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Tab 2: VFX & Storyboard Moodboards (Imagen 3 & Gemini DP) */}
      {activeTab === 'storyboards' && (
        <div className="space-y-6">
          <div className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-250">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FCE7F3] dark:bg-[#F472B6]/30 border border-studio-border text-xs font-display font-black text-[#F472B6] mb-2 shadow-pop-xs">
                <span>GEMINI 2.5 + IMAGEN 3 CINEMATOGRAPHY ENGINE</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-studio-text">
                Scene Storyboard & Camera Concept Moodboards
              </h2>
              <p className="text-xs sm:text-sm text-studio-muted font-medium mt-1">
                AI Director of Photography frames lighting schemes, camera lenses, and visual reference prompts for every scene.
              </p>
            </div>
          </div>

          {scenes.length === 0 ? (
            <div className="bg-studio-surface p-16 rounded-2xl border-2 border-studio-border shadow-pop text-center text-studio-muted">
              <Palette className="w-12 h-12 mx-auto mb-3 text-[#F472B6]" />
              <p className="text-sm font-display font-bold text-studio-text">No scenes extracted yet to generate storyboards.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenes.map((scene) => {
                const sb = storyboards[scene.id];
                const isGen = isGeneratingStoryboard === scene.id;

                return (
                  <div
                    key={scene.id}
                    className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6] text-white border border-studio-border text-[11px] font-display font-black shadow-pop-xs">
                          SCENE {scene.scene_number}
                        </span>
                        <span className="text-xs font-display font-bold text-studio-muted">
                          {scene.time_of_day.toUpperCase()} &bull; {scene.setting.toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-lg font-display font-extrabold text-studio-text mb-2">
                        {scene.heading}
                      </h3>

                      {sb ? (
                        <div className="space-y-3.5 mt-4">
                          {/* Image preview if generated */}
                          {sb.image_url && (
                            <div className="rounded-xl border-2 border-studio-border overflow-hidden shadow-pop-xs">
                              <img
                                src={sb.image_url}
                                alt={sb.title || scene.heading}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                          )}

                          {/* Technical Specs Tags */}
                          <div className="flex flex-wrap gap-2 text-[11px] font-display font-bold">
                            <span className="px-2.5 py-1 rounded-md bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#8B5CF6] dark:text-[#A78BFA] border border-studio-border flex items-center gap-1 shadow-pop-xs">
                              <Camera className="w-3.5 h-3.5" />
                              {sb.lens_focal_length || '35mm Anamorphic'}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-[#FBBF24] border border-studio-border flex items-center gap-1 shadow-pop-xs">
                              <Sliders className="w-3.5 h-3.5" />
                              {sb.aspect_ratio || '2.39:1'}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-[#FCE7F3] dark:bg-[#F472B6]/30 text-[#F472B6] border border-studio-border shadow-pop-xs">
                              {sb.camera_angle || 'Wide Establishing'}
                            </span>
                          </div>

                          {/* Color Palette Chips */}
                          {sb.color_palette && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[10px] font-display font-bold text-studio-muted">Palette:</span>
                              <div className="flex items-center gap-1.5">
                                {sb.color_palette.map((color: string, cIdx: number) => (
                                  <div
                                    key={cIdx}
                                    className="w-5 h-5 rounded-full border border-studio-border shadow-pop-xs"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Prompt & Notes */}
                          <div className="p-3 bg-studio-bg rounded-xl border border-studio-border text-xs font-mono text-studio-text space-y-1.5">
                            <p className="font-bold text-[10px] uppercase text-[#8B5CF6] dark:text-[#A78BFA] font-display">Imagen 3 Cinematic Prompt:</p>
                            <p className="line-clamp-3 text-[11px] leading-relaxed">"{sb.visual_prompt}"</p>
                          </div>

                          {sb.director_notes && (
                            <p className="text-xs text-studio-muted font-medium italic">
                              <strong className="font-display not-italic text-studio-text">DP Notes:</strong> {sb.director_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-studio-muted">
                          <p className="text-xs font-display font-bold text-studio-text mb-1">
                            Cinematic moodboard not yet generated.
                          </p>
                          <p className="text-[11px] font-medium">
                            Generate DP camera angles, lighting scheme, and Imagen prompt for this scene.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t-2 border-studio-border/20">
                      <button
                        onClick={() => handleGenerateStoryboard(scene.id)}
                        disabled={isGen}
                        className="btn-candy-pink w-full !py-2.5 text-xs font-display font-bold flex items-center justify-center gap-2"
                      >
                        <Palette className="w-4 h-4" />
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
          <div className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-250">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-amber-950/40 border border-studio-border text-xs font-display font-black text-[#D97706] dark:text-[#FBBF24] mb-2 shadow-pop-xs">
                <Music className="w-3.5 h-3.5 text-[#1E293B] dark:text-[#FBBF24]" />
                <span>GOOGLE DEEPMIND LYRIA 3 CINEMATIC SOUNDTRACKS</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-studio-text">
                Scene Soundtracks & Acoustic Atmosphere Cues
              </h2>
              <p className="text-xs sm:text-sm text-studio-muted font-medium mt-1">
                Generates tempo (BPM), key signatures, sound design foley layers, instrumentation, and Lyria 3 music prompts for composers.
              </p>
            </div>
          </div>

          {scenes.length === 0 ? (
            <div className="bg-studio-surface p-16 rounded-2xl border-2 border-studio-border shadow-pop text-center text-studio-muted">
              <Music className="w-12 h-12 mx-auto mb-3 text-[#FBBF24]" />
              <p className="text-sm font-display font-bold text-studio-text">No scenes extracted yet to generate soundtrack cues.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenes.map((scene) => {
                const cue = audioCues[scene.id];
                const isGen = isGeneratingAudio === scene.id;

                return (
                  <div
                    key={scene.id}
                    className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FBBF24] text-[#1E293B] border border-studio-border text-[11px] font-display font-black shadow-pop-xs">
                          SCENE {scene.scene_number} AUDIO
                        </span>
                        <span className="text-xs font-display font-bold text-studio-muted flex items-center gap-1">
                          <Volume2 className="w-3.5 h-3.5 text-[#D97706] dark:text-[#FBBF24]" />
                          {scene.location}
                        </span>
                      </div>

                      <h3 className="text-lg font-display font-extrabold text-studio-text mb-2">
                        {cue ? cue.track_title : scene.heading}
                      </h3>

                      {cue ? (
                        <div className="space-y-3.5 mt-4">
                          {/* Top audio badges */}
                          <div className="flex flex-wrap gap-2 text-[11px] font-display font-bold">
                            <span className="px-2.5 py-1 rounded-md bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-[#FBBF24] border border-studio-border flex items-center gap-1 shadow-pop-xs">
                              <Radio className="w-3.5 h-3.5" />
                              {cue.bpm} BPM
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#8B5CF6] dark:text-[#A78BFA] border border-studio-border flex items-center gap-1 shadow-pop-xs">
                              <Disc className="w-3.5 h-3.5" />
                              Key: {cue.key_signature}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0284C7] dark:text-sky-300 border border-studio-border shadow-pop-xs">
                              {cue.genre}
                            </span>
                          </div>

                          {/* Sound wave visual bar mock */}
                          <div className="p-3 bg-[#0B0F17] rounded-xl border border-studio-border shadow-pop-xs flex items-center gap-3 text-white">
                            <div className="w-8 h-8 rounded-full bg-[#FBBF24] text-[#1E293B] flex items-center justify-center shrink-0 shadow-pop-xs">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                            <div className="flex-1 flex items-center gap-1 h-6">
                              {[40, 65, 85, 30, 95, 55, 75, 45, 90, 60, 35, 80, 50, 70, 95, 40, 85, 60, 30, 75].map((h, bIdx) => (
                                <div
                                  key={bIdx}
                                  className="flex-1 bg-[#FBBF24] rounded-full transition-all"
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">0:30</span>
                          </div>

                          {/* Instrumentation Chips */}
                          {cue.instrumentation && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-display font-black uppercase tracking-wider text-studio-muted block">
                                Lead Instrumentation:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {cue.instrumentation.map((inst: string, iIdx: number) => (
                                  <span
                                    key={iIdx}
                                    className="px-2 py-0.5 rounded-md bg-studio-muted text-studio-text border border-studio-border/30 text-[11px] font-medium"
                                  >
                                    {inst}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Foley Atmosphere Layers */}
                          {cue.foley_layers && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-display font-black uppercase tracking-wider text-studio-muted block">
                                Foley & Environmental Layers:
                              </span>
                              <ul className="text-xs text-studio-muted font-medium space-y-0.5 pl-4 list-disc">
                                {cue.foley_layers.map((foley: string, fIdx: number) => (
                                  <li key={fIdx}>{foley}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Lyria 3 Prompt Box */}
                          <div className="p-3 bg-studio-bg rounded-xl border border-studio-border text-xs font-mono text-studio-text space-y-1.5">
                            <p className="font-bold text-[10px] uppercase text-[#D97706] dark:text-[#FBBF24] font-display">Lyria 3 Music Generator Prompt:</p>
                            <p className="line-clamp-3 text-[11px] leading-relaxed">"{cue.lyria_prompt}"</p>
                          </div>

                          {cue.composer_notes && (
                            <p className="text-xs text-studio-muted font-medium italic">
                              <strong className="font-display not-italic text-studio-text">Composer Notes:</strong> {cue.composer_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-studio-muted">
                          <p className="text-xs font-display font-bold text-studio-text mb-1">
                            Soundtrack cue not yet generated.
                          </p>
                          <p className="text-[11px] font-medium">
                            Generate acoustic tempo, foley design, and Lyria prompt for this scene.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t-2 border-studio-border/20">
                      <button
                        onClick={() => handleGenerateAudioCue(scene.id)}
                        disabled={isGen}
                        className="btn-candy-yellow w-full !py-2.5 text-xs font-display font-bold flex items-center justify-center gap-2"
                      >
                        <Music className="w-4 h-4 text-[#1E293B]" />
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
          <div className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-250">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FCE7F3] dark:bg-[#EC4899]/30 border border-studio-border text-xs font-display font-black text-[#EC4899] mb-2 shadow-pop-xs">
                <Mic className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>GEMINI 3.1 FLASH TTS & MULTI-SPEAKER REHEARSAL</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-studio-text">
                Script Table-Read & Dialogue Sentiment Analysis
              </h2>
              <p className="text-xs sm:text-sm text-studio-muted font-medium mt-1">
                AI Voice Director casts actor voice archetypes, breaks down line-by-line subtext/emotion tags, and generates multi-speaker table-read audio streams.
              </p>
            </div>
          </div>

          {scenes.length === 0 ? (
            <div className="bg-studio-surface p-16 rounded-2xl border-2 border-studio-border shadow-pop text-center text-studio-muted">
              <Mic className="w-12 h-12 mx-auto mb-3 text-[#EC4899]" />
              <p className="text-sm font-display font-bold text-studio-text">No scenes extracted yet to generate table-read rehearsals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scenes.map((scene) => {
                const tr = tableReads[scene.id];
                const isGen = isGeneratingTableRead === scene.id;

                return (
                  <div
                    key={scene.id}
                    className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EC4899] text-white border border-studio-border text-[11px] font-display font-black shadow-pop-xs">
                          SCENE {scene.scene_number} TABLE-READ
                        </span>
                        <span className="text-xs font-display font-bold text-studio-muted flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#EC4899]" />
                          {tr?.characters?.length || 2} Cast Members
                        </span>
                      </div>

                      <h3 className="text-lg font-display font-extrabold text-studio-text mb-2">
                        {scene.heading}
                      </h3>

                      {tr ? (
                        <div className="space-y-4 mt-3">
                          {/* Tension & Sentiment Metrics */}
                          <div className="flex flex-wrap gap-2 text-[11px] font-display font-bold">
                            <span className="px-2.5 py-1 rounded-md bg-[#FFE4E6] dark:bg-rose-950/40 text-[#E11D48] dark:text-rose-300 border border-studio-border flex items-center gap-1 shadow-pop-xs">
                              <Activity className="w-3.5 h-3.5" />
                              Tension: {tr.tension_level}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-[#EDE9FE] dark:bg-[#8B5CF6]/30 text-[#7C3AED] dark:text-[#A78BFA] border border-studio-border flex items-center gap-1 shadow-pop-xs">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Tone: {tr.overall_sentiment}
                            </span>
                          </div>

                          {/* Character Voice Cast Cards */}
                          {tr.characters && tr.characters.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-display font-black uppercase tracking-wider text-studio-muted block">
                                Gemini TTS Voice Casting:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {tr.characters.map((char: any, cIdx: number) => (
                                  <div
                                    key={cIdx}
                                    className="p-2.5 rounded-xl bg-studio-bg border border-studio-border/40 space-y-1 text-xs"
                                  >
                                    <div className="flex items-center justify-between font-display font-black">
                                      <span className="text-studio-text uppercase">{char.name}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#7C3AED] dark:text-[#A78BFA] border border-studio-border">
                                        Voice: {char.voice_id}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-studio-muted line-clamp-2">{char.vocal_profile}</p>
                                    {char.recommended_actor_reference && (
                                      <p className="text-[10px] font-medium text-[#0284C7] dark:text-sky-300 italic">
                                        Archetype: {char.recommended_actor_reference}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Script Dialogue Lines Preview */}
                          {tr.dialogue_lines && tr.dialogue_lines.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-display font-black uppercase tracking-wider text-studio-muted block">
                                Rehearsal Dialogue & Subtext:
                              </span>
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {tr.dialogue_lines.map((line: any, lIdx: number) => (
                                  <div
                                    key={lIdx}
                                    className="p-2.5 bg-studio-bg rounded-xl border border-studio-border text-xs space-y-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-display font-black text-[#EC4899] uppercase text-[11px]">
                                        {line.character}
                                      </span>
                                      <span className="text-[10px] font-mono text-studio-muted italic">
                                        {line.delivery_tag}
                                      </span>
                                    </div>
                                    <p className="font-medium text-studio-text text-xs">
                                      "{line.line}"
                                    </p>
                                    {line.subtext && (
                                      <p className="text-[10px] text-studio-muted italic border-t border-studio-border/20 pt-1">
                                        <strong>Subtext:</strong> {line.subtext}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {tr.director_table_read_notes && (
                            <p className="text-xs text-studio-muted font-medium italic pt-1">
                              <strong className="font-display not-italic text-studio-text">Voice Director:</strong> {tr.director_table_read_notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-studio-muted">
                          <p className="text-xs font-display font-bold text-studio-text mb-1">
                            Table-read rehearsal not yet generated.
                          </p>
                          <p className="text-[11px] font-medium">
                            Synthesize character voice casting, delivery direction, and dialogue sentiment.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t-2 border-studio-border/20">
                      <button
                        onClick={() => handleGenerateTableRead(scene.id)}
                        disabled={isGen}
                        className="btn-candy w-full !py-2.5 text-xs font-display font-bold flex items-center justify-center gap-2 !bg-[#EC4899] hover:!bg-[#DB2777]"
                      >
                        <Mic className="w-4 h-4 text-white" />
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

      {/* Tab 5: Production Plan & Call Sheets */}
      {activeTab === 'plan' && (
        <div>
          {plan ? (
            <ProductionPlanView
              plan={plan}
              onOpenReplanModal={() => setIsReplanModalOpen(true)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />
          ) : (
            <div className="bg-studio-surface p-16 rounded-2xl border-2 border-studio-border shadow-pop text-center text-studio-muted transition-colors duration-250">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-[#8B5CF6]" />
              <h3 className="text-lg font-display font-bold text-studio-text mb-1">Production Plan Pending</h3>
              <p className="text-xs text-studio-muted font-medium max-w-md mx-auto mb-6">
                The agent generates call sheets and shooting schedules after candidate evaluations finish.
              </p>
              <button
                onClick={handleStartScout}
                className="btn-candy !py-3 !px-6 text-xs"
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
          <div className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop transition-colors duration-250">
            <h2 className="text-xl font-display font-extrabold text-studio-text mb-2">
              Parallel Search Verified Web Research
            </h2>
            <p className="text-xs sm:text-sm text-studio-muted font-medium">
              Every location recommendation is grounded in real-time Parallel Search queries with full URLs and exact citation snippets.
            </p>
          </div>

          {sources.length === 0 ? (
            <div className="bg-studio-surface p-14 rounded-2xl border-2 border-studio-border shadow-pop text-center text-studio-muted">
              <Search className="w-10 h-10 mx-auto mb-3 text-[#8B5CF6]" />
              <p className="text-sm font-display font-bold text-studio-text">No search sources retrieved yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sources.map((src, idx) => (
                <div key={idx} className="bg-studio-surface p-5 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-sm font-display font-bold text-studio-text line-clamp-2">
                      {src.title || 'Web Result'}
                    </h4>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8B5CF6] dark:text-[#A78BFA] hover:underline flex items-center gap-1 text-[11px] font-bold shrink-0"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-studio-muted leading-relaxed mb-3 line-clamp-3 font-medium">
                    "{src.excerpt}"
                  </p>
                  <div className="pt-2 border-t-2 border-studio-border/20 flex items-center justify-between text-[10px] font-display font-bold text-studio-muted">
                    <span className="text-[#8B5CF6] dark:text-[#A78BFA] font-mono">{src.domain}</span>
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
