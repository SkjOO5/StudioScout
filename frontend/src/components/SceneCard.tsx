import React from 'react';
import { Scene } from '../types';
import { Clock, MapPin, Users, Car, AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface SceneCardProps {
  scene: Scene;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: (scene: Scene) => void;
  onDelete?: (scene: Scene) => void;
}

export const SceneCard: React.FC<SceneCardProps> = ({ scene, isSelected, onSelect, onEdit, onDelete }) => {
  const getStatusBadge = () => {
    if (scene.recommendation_status === 'available') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold bg-[#34D399] text-[#1E293B] border border-studio-border shadow-pop-xs">
          <CheckCircle2 className="w-3 h-3" /> Scouted
        </span>
      );
    }
    if (scene.research_status === 'researching') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold bg-[#FBBF24] text-[#1E293B] border border-studio-border shadow-pop-xs">
          <Loader2 className="w-3 h-3 animate-spin" /> Parallel Search
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold bg-studio-muted text-studio-muted border border-studio-border/30">
        Pending
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl cursor-pointer border-2 border-studio-border transition-all duration-150 text-left relative group ${
        isSelected
          ? 'bg-studio-surface shadow-pop-pink -translate-x-0.5 -translate-y-0.5 ring-2 ring-[#F472B6]'
          : 'bg-studio-surface shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-[#8B5CF6] text-white border border-studio-border text-[10px] font-display font-black shadow-pop-xs">
            SCENE {String(scene.scene_number).padStart(2, '0')}
          </span>
          {getStatusBadge()}
        </div>

        {/* Scene Action Buttons */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(scene);
                }}
                className="p-1 rounded-lg bg-studio-surface border border-studio-border shadow-pop-xs hover:bg-[#FEF3C7] dark:hover:bg-amber-950/40 text-studio-text transition-all"
                title="Edit Scene"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(scene);
                }}
                className="p-1 rounded-lg bg-studio-surface border border-studio-border shadow-pop-xs hover:bg-[#FEE2E2] dark:hover:bg-red-950/40 text-[#EF4444] transition-all"
                title="Delete Scene"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Heading */}
      <h4 className="text-sm font-display font-bold text-studio-text mb-1.5 truncate">
        {scene.heading}
      </h4>

      {/* Description Snippet */}
      {scene.description && (
        <p className="text-xs text-studio-muted mb-3 line-clamp-2 leading-relaxed font-medium">
          {scene.description}
        </p>
      )}

      {/* Metadata Badges */}
      <div className="flex flex-wrap gap-1.5 text-[10px] font-display font-bold text-studio-text">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-studio-muted border border-studio-border/30">
          <MapPin className="w-2.5 h-2.5 text-[#8B5CF6]" />
          {scene.location_type}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-studio-muted border border-studio-border/30 uppercase">
          <Clock className="w-2.5 h-2.5 text-[#FBBF24]" />
          {scene.time_of_day}
        </span>
        {scene.characters > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-studio-muted border border-studio-border/30">
            <Users className="w-2.5 h-2.5 text-[#F472B6]" />
            {scene.characters} Cast
          </span>
        )}
        {scene.vehicles && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-amber-950/40 text-studio-text border border-[#FBBF24]">
            <Car className="w-2.5 h-2.5 text-[#D97706] dark:text-[#FBBF24]" /> Vehicles
          </span>
        )}
      </div>

      {/* Requirements count indicator */}
      {scene.requirements.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-studio-border/20 flex items-center justify-between text-[11px] font-display font-bold text-studio-muted">
          <span>{scene.requirements.length} Requirements</span>
          <span className="text-[#8B5CF6] dark:text-[#A78BFA] hover:underline flex items-center gap-1">
            View &rarr;
          </span>
        </div>
      )}
    </div>
  );
};
