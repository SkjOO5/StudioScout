import React, { useState, useEffect } from 'react';
import { X, Sparkles, Film, MapPin, Save, Plus } from 'lucide-react';
import { Scene } from '../types';
import { api } from '../lib/api';

interface EditSceneModalProps {
  isOpen: boolean;
  projectId: string;
  scene: Scene | null; // null means "Add New Scene"
  nextSceneNumber: number;
  onClose: () => void;
  onSuccess: (scene: Scene, isNew: boolean) => void;
}

export const EditSceneModal: React.FC<EditSceneModalProps> = ({
  isOpen,
  projectId,
  scene,
  nextSceneNumber,
  onClose,
  onSuccess,
}) => {
  const [heading, setHeading] = useState('');
  const [location, setLocation] = useState('');
  const [locationType, setLocationType] = useState('industrial');
  const [timeOfDay, setTimeOfDay] = useState('night');
  const [setting, setSetting] = useState('interior');
  const [description, setDescription] = useState('');
  const [characters, setCharacters] = useState(2);
  const [vehicles, setVehicles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isNew = scene === null;

  useEffect(() => {
    if (scene) {
      setHeading(scene.heading);
      setLocation(scene.location);
      setLocationType(scene.location_type || 'industrial');
      setTimeOfDay(scene.time_of_day || 'night');
      setSetting(scene.setting || 'interior');
      setDescription(scene.description || '');
      setCharacters(scene.characters || 2);
      setVehicles(scene.vehicles || false);
    } else {
      setHeading(`INT. NEW LOCATION - NIGHT`);
      setLocation('New Location');
      setLocationType('industrial');
      setTimeOfDay('night');
      setSetting('interior');
      setDescription('');
      setCharacters(2);
      setVehicles(false);
    }
    setError(null);
  }, [scene, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!heading.trim() || !location.trim()) {
      setError('Scene heading and location name are required.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (isNew) {
        const created = await api.addScene(projectId, {
          scene_number: nextSceneNumber,
          heading: heading.trim(),
          location: location.trim(),
          location_type: locationType,
          time_of_day: timeOfDay,
          setting,
          description: description.trim() || undefined,
          characters,
          vehicles,
          requirements: [
            { category: 'space', description: `Requires ${setting} space for ${characters} characters.`, priority: 'required' }
          ],
        });
        onSuccess(created, true);
      } else {
        const updated = await api.updateScene(projectId, scene.id, {
          heading: heading.trim(),
          location: location.trim(),
          location_type: locationType,
          time_of_day: timeOfDay,
          setting,
          description: description.trim() || undefined,
          characters,
          vehicles,
        });
        onSuccess(updated, false);
      }
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to save scene.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-studio-surface w-full max-w-lg rounded-2xl border-2 border-studio-border shadow-pop-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-250">
        {/* Header */}
        <div className="p-5 bg-[#FDE047] dark:bg-amber-950/40 border-b-2 border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-studio-surface border-2 border-studio-border flex items-center justify-center shadow-pop-xs text-xl">
              🎬
            </div>
            <div>
              <h3 className="text-lg font-display font-extrabold text-studio-text">
                {isNew ? `Add Scene #${nextSceneNumber}` : `Edit Scene #${scene?.scene_number}`}
              </h3>
              <p className="text-xs font-bold text-studio-muted">
                {isNew ? 'Define a new scene breakdown entry' : `Updating ${scene?.heading}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-studio-surface text-studio-text border-2 border-studio-border flex items-center justify-center shadow-pop-xs hover:bg-[#FEE2E2] dark:hover:bg-red-950/40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-[#FEE2E2] dark:bg-red-950/40 border-2 border-[#EF4444] text-xs font-bold text-[#B91C1C] dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-display font-black text-studio-text block mb-1">
              Scene Heading (Slugline)
            </label>
            <input
              type="text"
              required
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. EXT. INDUSTRIAL HARBOR DOCKS - NIGHT"
              className="w-full px-3.5 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-mono font-bold text-studio-text focus:outline-none focus:bg-studio-surface focus:shadow-pop-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-display font-black text-studio-text block mb-1">
                Location Name
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Harbor Warehouse"
                className="w-full px-3.5 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface focus:shadow-pop-xs"
              />
            </div>

            <div>
              <label className="text-xs font-display font-black text-studio-text block mb-1">
                Location Archetype
              </label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface"
              >
                <option value="industrial">Industrial</option>
                <option value="commercial">Commercial</option>
                <option value="residential">Residential</option>
                <option value="exterior">Exterior / Natural</option>
                <option value="hospital">Hospital / Medical</option>
                <option value="heritage">Heritage / Monument</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-display font-black text-studio-text block mb-1">
                Time of Day
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface"
              >
                <option value="night">Night</option>
                <option value="day">Day</option>
                <option value="dusk">Dusk</option>
                <option value="dawn">Dawn</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-display font-black text-studio-text block mb-1">
                Setting
              </label>
              <select
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface"
              >
                <option value="interior">Interior (INT)</option>
                <option value="exterior">Exterior (EXT)</option>
                <option value="both">Both (INT/EXT)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-display font-black text-studio-text block mb-1">
              Scene Action Description & Physical Constraints
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happens in this scene, physical needs, camera requirements..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-medium text-studio-text focus:outline-none focus:bg-studio-surface focus:shadow-pop-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-display font-black text-studio-text block mb-1">
                Cast Members On-Set
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={characters}
                onChange={(e) => setCharacters(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-studio-bg border-2 border-studio-border text-xs font-bold text-studio-text focus:outline-none focus:bg-studio-surface"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="vehiclesCheck"
                checked={vehicles}
                onChange={(e) => setVehicles(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-studio-border accent-[#8B5CF6]"
              />
              <label htmlFor="vehiclesCheck" className="text-xs font-display font-black text-studio-text cursor-pointer">
                Requires Vehicles / Stunts
              </label>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-studio-border/20 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary !py-2.5 !px-5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-candy-yellow !py-2.5 !px-6 text-xs font-display font-black flex items-center gap-2"
            >
              {isNew ? <Plus className="w-3.5 h-3.5 text-[#1E293B]" /> : <Save className="w-3.5 h-3.5 text-[#1E293B]" />}
              <span>{isSaving ? 'SAVING...' : isNew ? 'ADD SCENE' : 'UPDATE SCENE'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
