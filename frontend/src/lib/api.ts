import axios from 'axios';
import {
  Project,
  Scene,
  LocationCandidate,
  ProductionPlan,
  AgentRun,
  ResearchSource,
  HealthStatus,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000/api');

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health & Status
  getHealth: async (): Promise<HealthStatus> => {
    const res = await client.get<HealthStatus>('/health');
    return res.data;
  },

  // Projects
  createProject: async (formData: FormData): Promise<Project> => {
    const res = await client.post<Project>('/projects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  listProjects: async (): Promise<Project[]> => {
    const res = await client.get<Project[]>('/projects');
    return res.data;
  },

  getProject: async (id: string): Promise<Project> => {
    const res = await client.get<Project>(`/projects/${id}`);
    return res.data;
  },

  getProjectScenes: async (id: string): Promise<Scene[]> => {
    const res = await client.get<Scene[]>(`/projects/${id}/scenes`);
    return res.data;
  },

  getProjectRecommendations: async (id: string): Promise<LocationCandidate[]> => {
    const res = await client.get<LocationCandidate[]>(`/projects/${id}/recommendations`);
    return res.data;
  },

  getProjectPlan: async (id: string): Promise<ProductionPlan> => {
    const res = await client.get<ProductionPlan>(`/projects/${id}/plan`);
    return res.data;
  },

  getProjectSources: async (id: string): Promise<ResearchSource[]> => {
    const res = await client.get<ResearchSource[]>(`/projects/${id}/sources`);
    return res.data;
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const res = await client.patch<Project>(`/projects/${id}`, updates);
    return res.data;
  },

  deleteProject: async (id: string): Promise<{ message: string; id: string }> => {
    const res = await client.delete<{ message: string; id: string }>(`/projects/${id}`);
    return res.data;
  },

  // Scene Operations
  addScene: async (projectId: string, scene: Partial<Scene>): Promise<Scene> => {
    const res = await client.post<Scene>(`/projects/${projectId}/scenes`, scene);
    return res.data;
  },

  updateScene: async (projectId: string, sceneId: string, updates: Partial<Scene>): Promise<Scene> => {
    const res = await client.patch<Scene>(`/projects/${projectId}/scenes/${sceneId}`, updates);
    return res.data;
  },

  deleteScene: async (projectId: string, sceneId: string): Promise<{ message: string; id: string }> => {
    const res = await client.delete<{ message: string; id: string }>(`/projects/${projectId}/scenes/${sceneId}`);
    return res.data;
  },

  // Candidate Operations
  deleteCandidate: async (projectId: string, sceneId: string, candidateId: string): Promise<{ message: string; id: string }> => {
    const res = await client.delete<{ message: string; id: string }>(`/projects/${projectId}/scenes/${sceneId}/candidates/${candidateId}`);
    return res.data;
  },


  // Storyboard Moodboards
  getProjectStoryboards: async (projectId: string): Promise<Record<string, any>> => {
    const res = await client.get<Record<string, any>>(`/projects/${projectId}/storyboards`);
    return res.data;
  },

  generateSceneStoryboard: async (projectId: string, sceneId: string): Promise<any> => {
    const res = await client.post<any>(`/projects/${projectId}/scenes/${sceneId}/storyboard`);
    return res.data;
  },

  // Audio Cues & Soundtracks (Lyria 3)
  getProjectAudioCues: async (projectId: string): Promise<Record<string, any>> => {
    const res = await client.get<Record<string, any>>(`/projects/${projectId}/audio`);
    return res.data;
  },

  generateSceneAudioCue: async (projectId: string, sceneId: string): Promise<any> => {
    const res = await client.post<any>(`/projects/${projectId}/scenes/${sceneId}/audio`);
    return res.data;
  },

  // Table-Read & Dialogue Sentiment (Gemini 3.1 Flash TTS)
  getProjectTableReads: async (projectId: string): Promise<Record<string, any>> => {
    const res = await client.get<Record<string, any>>(`/projects/${projectId}/table-reads`);
    return res.data;
  },

  generateSceneTableRead: async (projectId: string, sceneId: string): Promise<any> => {
    const res = await client.post<any>(`/projects/${projectId}/scenes/${sceneId}/table-read`);
    return res.data;
  },

  // Demo Seeding (Instant Showcase for Hackathon Judges)
  seedDemo: async (): Promise<{ status: string; message: string; project_id: string; scene_count: number }> => {
    const res = await client.post<{ status: string; message: string; project_id: string; scene_count: number }>('/demo/seed');
    return res.data;
  },

  // Agent Runs
  startScout: async (projectId: string): Promise<{ run_id: string; status: string; project_id: string }> => {
    const res = await client.post<{ run_id: string; status: string; project_id: string }>(
      `/projects/${projectId}/scout`
    );
    return res.data;
  },

  triggerReplan: async (
    projectId: string,
    data: {
      constraint: string;
      constraint_type?: string;
      affects_location?: string;
      affects_scene_ids?: string[];
    }
  ): Promise<{ run_id: string; status: string; replan_reason: string }> => {
    const res = await client.post<{ run_id: string; status: string; replan_reason: string }>(
      `/projects/${projectId}/replan`,
      data
    );
    return res.data;
  },

  getRun: async (runId: string): Promise<AgentRun> => {
    const res = await client.get<AgentRun>(`/runs/${runId}`);
    return res.data;
  },

  getProjectRuns: async (projectId: string): Promise<AgentRun[]> => {
    const res = await client.get<AgentRun[]>(`/projects/${projectId}/runs`);
    return res.data;
  },

  // Document & Schedule Exports
  downloadProductionBible: async (projectId: string, filename?: string): Promise<void> => {
    const res = await client.get(`/projects/${projectId}/export/production-bible`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'StudioScout-Production-Bible.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadCallSheet: async (projectId: string, day: number = 1, filename?: string): Promise<void> => {
    const res = await client.get(`/projects/${projectId}/export/call-sheet`, {
      params: { day },
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `StudioScout-Call-Sheet-Day-${day.toString().padStart(2, '0')}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadCalendar: async (projectId: string, filename?: string): Promise<void> => {
    const res = await client.get(`/projects/${projectId}/export/calendar`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'StudioScout-Shooting-Calendar.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadScheduleCsv: async (projectId: string, filename?: string): Promise<void> => {
    const res = await client.get(`/projects/${projectId}/export/schedule`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'StudioScout-Shooting-Schedule.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

