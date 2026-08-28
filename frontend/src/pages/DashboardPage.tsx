import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { api } from '../lib/api';
import { 
  Film, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  PlayCircle,
  Compass,
  Radar,
  Activity,
  Terminal,
  Clapperboard,
  Layers,
  Trash2,
  Edit3
} from 'lucide-react';
import { 
  DEMO_PROJECT_NAME, 
  DEMO_PROJECT_CITY, 
  DEMO_PROJECT_GENRE, 
  DEMO_PROJECT_BUDGET, 
  DEMO_SCREENPLAY_TEXT 
} from '../lib/demoData';
import { EditProjectModal } from '../components/EditProjectModal';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const data = await api.listProjects();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    const formData = new FormData();
    formData.append('name', `${DEMO_PROJECT_NAME} (Demo)`);
    formData.append('genre', DEMO_PROJECT_GENRE);
    formData.append('production_city', DEMO_PROJECT_CITY);
    formData.append('budget_tier', DEMO_PROJECT_BUDGET);
    formData.append('scene_description', DEMO_SCREENPLAY_TEXT);

    const project = await api.createProject(formData);
    navigate(`/workspace/${project.id}?autostart=true`);
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string, projectName: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`Are you sure you want to delete "${projectName}"? This will remove all scenes, candidates, and call sheets.`)) {
      try {
        setDeletingId(projectId);
        await api.deleteProject(projectId);
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      } catch (err) {
        alert('Failed to delete project.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      <EditProjectModal
        isOpen={editingProject !== null}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSuccess={(updated) => {
          setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }}
      />

      {/* Control Center Header */}
      <div className="bg-studio-surface p-7 rounded-2xl border-2 border-studio-border shadow-pop flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden transition-colors duration-250">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#8B5CF6] dark:text-[#A78BFA] border border-studio-border text-xs font-display font-black mb-2 shadow-pop-xs">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
            <span>STUDIO COMMAND CENTER</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-studio-text tracking-tight">
            Production Dashboard
          </h1>
          <p className="text-sm text-studio-muted mt-1 font-medium">
            Manage autonomous screenplay breakdowns, live location research, and call sheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickDemo}
            className="btn-candy-yellow !py-3 !px-5 text-xs font-display font-bold flex items-center gap-2"
          >
            <PlayCircle className="w-4 h-4 text-[#1E293B]" />
            <span>Launch Thriller Demo</span>
          </button>

          <Link to="/new" className="btn-candy !py-3 !px-5 text-xs">
            <Plus className="w-4 h-4" />
            <span>New Production</span>
          </Link>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-studio-surface p-6 h-52 rounded-2xl border-2 border-studio-border shadow-pop animate-pulse"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-studio-surface p-14 text-center max-w-xl mx-auto my-12 rounded-2xl border-2 border-dashed border-studio-border shadow-pop">
          <Clapperboard className="w-14 h-14 text-[#8B5CF6] mx-auto mb-4" />
          <h3 className="text-xl font-display font-extrabold text-studio-text mb-2">No Active Productions Yet</h3>
          <p className="text-sm text-studio-muted mb-6 leading-relaxed font-medium">
            Create your first production project or load the pre-configured thriller demo to test the autonomous scouting agent.
          </p>
          <div className="flex items-center justify-center gap-3.5">
            <button onClick={handleQuickDemo} className="btn-candy-yellow !py-2.5 !px-5 text-xs font-display font-bold">
              <PlayCircle className="w-4 h-4 text-[#1E293B]" />
              <span>Load "Neon Shadows" Demo</span>
            </button>
            <Link to="/new" className="btn-candy !py-2.5 !px-5 text-xs">
              <Plus className="w-4 h-4" />
              <span>Start New Project</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/workspace/${project.id}`)}
              className="bg-studio-surface p-6 rounded-2xl border-2 border-studio-border shadow-pop hover:-translate-x-1 hover:-translate-y-1 hover:shadow-pop-lg transition-all duration-200 group flex flex-col justify-between cursor-pointer relative"
            >
              <div>
                {/* Status & Actions Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#7C3AED] dark:text-[#A78BFA] border border-studio-border text-[10px] font-display font-black uppercase shadow-pop-xs">
                      {project.genre}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-display font-black uppercase tracking-wider border border-studio-border shadow-pop-xs ${
                      project.status === 'completed'
                        ? 'bg-[#34D399] text-[#1E293B]'
                        : project.status === 'failed'
                        ? 'bg-[#F472B6] text-white'
                        : 'bg-[#FBBF24] text-[#1E293B] animate-pulse'
                    }`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEditProject(e, project)}
                      className="p-1.5 rounded-lg bg-studio-surface border border-studio-border shadow-pop-xs hover:bg-[#FEF3C7] dark:hover:bg-amber-950/40 text-studio-text transition-all"
                      title="Edit Project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                      disabled={deletingId === project.id}
                      className="p-1.5 rounded-lg bg-studio-surface border border-studio-border shadow-pop-xs hover:bg-[#FEE2E2] dark:hover:bg-red-950/40 text-[#EF4444] transition-all"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Project Title */}
                <h3 className="text-xl font-display font-extrabold text-studio-text group-hover:text-[#8B5CF6] transition-colors mb-3">
                  {project.name}
                </h3>

                {/* Metadata */}
                <div className="space-y-2 text-xs text-studio-muted mb-6 font-display font-bold">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>Target: <strong className="text-studio-text">{project.production_city}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Film className="w-3.5 h-3.5 text-[#F472B6]" />
                    <span>Budget Scale: <strong className="text-studio-text uppercase">{project.budget_tier}</strong></span>
                  </div>
                  {project.screenplay_filename && (
                    <div className="text-[11px] text-studio-muted truncate">
                      File: {project.screenplay_filename}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom stats row */}
              <div className="pt-4 border-t-2 border-studio-border/20 flex items-center justify-between text-xs font-display font-bold">
                <span className="text-studio-muted">
                  {project.scene_count > 0 ? `${project.scene_count} scenes analyzed` : 'Awaiting scout run'}
                </span>
                <span className="text-[#8B5CF6] dark:text-[#A78BFA] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Open Workspace &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

