import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Project } from '../types';
import { api } from '../lib/api';
import { 
  Film, 
  MapPin, 
  Plus, 
  PlayCircle,
  Clapperboard,
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

      {/* Control Center Header Styled like a Clipboard Slate */}
      <div className="sketch-card sketch-tape p-7 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch flex flex-col md:flex-row md:items-center justify-between gap-6 relative transition-colors duration-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-hand font-bold mb-2 shadow-sketch-xs">
            <span className="w-2 h-2 rounded-full bg-studio-red animate-pulse"></span>
            <span>STUDIO COMMAND CENTER</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-studio-text tracking-tight">
            Production Dashboard
          </h1>
          <p className="text-base text-studio-secondary mt-1 font-hand">
            Manage autonomous screenplay breakdowns, live location research, and call sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleQuickDemo}
            className="btn-sketch-yellow min-h-[44px] !py-3 !px-5 text-base font-hand font-bold flex items-center gap-2 cursor-pointer"
          >
            <PlayCircle className="w-5 h-5 text-slate-900" />
            <span>Launch Thriller Demo</span>
          </button>

          <Link to="/new" className="btn-sketch min-h-[44px] !py-3 !px-5 text-base font-hand font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>New Production</span>
          </Link>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="sketch-card p-6 h-52 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch animate-pulse"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="sketch-card p-14 text-center max-w-xl mx-auto my-12 rounded-wobbly-md border-[2.5px] border-dashed border-studio-border bg-studio-surface shadow-sketch">
          <Clapperboard className="w-14 h-14 text-studio-red mx-auto mb-4" />
          <h3 className="text-2xl font-display font-extrabold text-studio-text mb-2">No Active Productions Yet</h3>
          <p className="text-base text-studio-secondary mb-6 leading-relaxed font-hand">
            Create your first production project or load the pre-configured thriller demo to test the autonomous scouting agent.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <button onClick={handleQuickDemo} className="btn-sketch-yellow min-h-[44px] !py-2.5 !px-5 text-base font-hand font-bold flex items-center gap-2 cursor-pointer">
              <PlayCircle className="w-4 h-4 text-slate-900" />
              <span>Load "Cipher Zero" Demo</span>
            </button>
            <Link to="/new" className="btn-sketch min-h-[44px] !py-2.5 !px-5 text-base font-hand font-bold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Start New Project</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, pIdx) => {
            const isTilted = pIdx % 2 === 0 ? 'transform -rotate-[0.5deg]' : 'transform rotate-[0.5deg]';
            return (
              <div
                key={project.id}
                onClick={() => navigate(`/workspace/${project.id}`)}
                className={`sketch-card p-6 rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch hover:-translate-x-1 hover:-translate-y-1 hover:shadow-sketch-lg transition-all duration-150 group flex flex-col justify-between cursor-pointer relative ${isTilted} hover:rotate-0`}
              >
                <div>
                  {/* Status & Actions Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-wobbly bg-studio-muted text-studio-text border border-studio-border text-xs font-hand font-bold uppercase shadow-sketch-xs">
                        {project.genre}
                      </span>
                      <span className={`px-3 py-1 rounded-wobbly text-xs font-hand font-bold uppercase tracking-wider border border-studio-border shadow-sketch-xs ${
                        project.status === 'completed'
                          ? 'bg-emerald-400 text-slate-950'
                          : project.status === 'failed'
                          ? 'bg-studio-red text-white' // FIX 1: high-contrast white on red
                          : 'bg-studio-yellow text-slate-950 animate-pulse'
                      }`}>
                        {project.status}
                      </span>
                    </div>

                    {/* FIX 4: Edit & Delete Action Buttons with min-w-[44px] min-h-[44px] touch target */}
                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditProject(e, project)}
                        className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly bg-studio-surface border-2 border-studio-border shadow-sketch-xs hover:bg-studio-yellow hover:text-slate-950 text-studio-text transition-all cursor-pointer"
                        title="Edit Project"
                        aria-label={`Edit ${project.name}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id, project.name)}
                        disabled={deletingId === project.id}
                        className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly bg-studio-surface border-2 border-studio-border shadow-sketch-xs hover:bg-studio-red hover:text-white text-accent-red-safe transition-all cursor-pointer"
                        title="Delete Project"
                        aria-label={`Delete ${project.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Project Title */}
                  <h3 className="text-2xl font-display font-extrabold text-studio-text group-hover:text-studio-redText transition-colors mb-3">
                    {project.name}
                  </h3>

                  {/* Metadata */}
                  <div className="space-y-2 text-sm text-studio-secondary mb-6 font-hand">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-studio-red" />
                      <span>Target: <strong className="text-studio-text font-bold">{project.production_city}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-studio-yellow" />
                      <span>Budget Scale: <strong className="text-studio-text uppercase font-bold">{project.budget_tier}</strong></span>
                    </div>
                    {project.screenplay_filename && (
                      <div className="text-xs text-studio-secondary dark:text-slate-300 truncate font-mono">
                        File: {project.screenplay_filename}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom stats row */}
                <div className="pt-4 border-t-2 border-dashed border-studio-border/30 flex items-center justify-between text-sm font-hand font-bold">
                  <span className="text-studio-secondary dark:text-slate-300">
                    {project.scene_count > 0 ? `${project.scene_count} scenes analyzed` : 'Awaiting scout run'}
                  </span>
                  <span className="text-studio-redText flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Open Workspace &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
