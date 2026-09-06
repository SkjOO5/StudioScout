import React from 'react';
import { Scene } from '../types';
import { Clock, MapPin, Users, Car, CheckCircle2, Loader2, Edit3, Trash2 } from 'lucide-react';

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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-wobbly text-xs font-hand font-bold bg-emerald-400 text-slate-950 border border-studio-border shadow-sketch-xs">
          <CheckCircle2 className="w-3.5 h-3.5" /> Scouted
        </span>
      );
    }
    if (scene.research_status === 'researching') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-wobbly text-xs font-hand font-bold bg-studio-yellow text-slate-950 border border-studio-border shadow-sketch-xs">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Parallel Search
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-wobbly text-xs font-hand font-bold bg-studio-muted text-studio-secondary border border-studio-border/40">
        Pending
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-wobbly-md cursor-pointer border-[2.5px] border-studio-border transition-all duration-150 text-left relative group ${
        isSelected
          ? 'bg-studio-surface shadow-sketch-red ring-2 ring-studio-red -rotate-[0.5deg]'
          : 'bg-studio-surface shadow-sketch hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sketch-md'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border text-xs font-display font-black shadow-sketch-xs">
            SCENE {String(scene.scene_number).padStart(2, '0')}
          </span>
          {getStatusBadge()}
        </div>

        {/* Scene Action Buttons - FIX 4: >=44x44px touch targets */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(scene);
                }}
                className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly bg-studio-surface border-2 border-studio-border shadow-sketch-xs hover:bg-studio-yellow hover:text-slate-950 text-studio-text transition-all cursor-pointer"
                title="Edit Scene"
                aria-label={`Edit Scene ${scene.scene_number}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(scene);
                }}
                className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly bg-studio-surface border-2 border-studio-border shadow-sketch-xs hover:bg-studio-red hover:text-white text-accent-red-safe transition-all cursor-pointer"
                title="Delete Scene"
                aria-label={`Delete Scene ${scene.scene_number}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Heading */}
      <h4 className="text-base font-display font-bold text-studio-text mb-1.5 truncate">
        {scene.heading}
      </h4>

      {/* Description Snippet */}
      {scene.description && (
        <p className="text-xs text-studio-secondary mb-3 line-clamp-2 leading-relaxed font-hand">
          {scene.description}
        </p>
      )}

      {/* Metadata Badges */}
      <div className="flex flex-wrap gap-1.5 text-xs font-hand font-bold text-studio-text">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-wobbly bg-studio-muted border border-studio-border/40">
          <MapPin className="w-3 h-3 text-studio-red" />
          {scene.location_type}
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-wobbly bg-studio-muted border border-studio-border/40 uppercase">
          <Clock className="w-3 h-3 text-studio-yellow" />
          {scene.time_of_day}
        </span>
        {scene.characters > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-wobbly bg-studio-muted border border-studio-border/40">
            <Users className="w-3 h-3 text-studio-blue" />
            {scene.characters} Cast
          </span>
        )}
        {scene.vehicles && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-wobbly bg-amber-100 dark:bg-amber-950/50 text-slate-900 dark:text-amber-200 border border-studio-border">
            <Car className="w-3 h-3 text-studio-yellow" /> Vehicles
          </span>
        )}
      </div>

      {/* Requirements count indicator */}
      {scene.requirements.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-dashed border-studio-border/30 flex items-center justify-between text-xs font-hand font-bold text-studio-secondary dark:text-slate-300">
          <span>{scene.requirements.length} Requirements</span>
          <span className="text-studio-redText hover:underline flex items-center gap-1">
            View &rarr;
          </span>
        </div>
      )}
    </div>
  );
};
