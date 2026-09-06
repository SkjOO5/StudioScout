import React, { useState, useEffect } from 'react';
import { X, Save, Film } from 'lucide-react';
import { Scene } from '../types';
import { api } from '../lib/api';

interface EditSceneModalProps {
  isOpen: boolean;
  projectId: string;
  scene: Scene | null;
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-pop-in text-left">
      <div className="sketch-card w-full max-w-lg rounded-wobbly-md border-[2.5px] border-studio-border bg-studio-surface shadow-sketch-lg overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Header */}
        <div className="p-5 bg-studio-bg border-b-2 border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-wobbly bg-studio-yellow text-slate-950 border-2 border-studio-border flex items-center justify-center shadow-sketch-xs">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-extrabold text-studio-text">
                {isNew ? 'Add Screenplay Scene' : `Edit Scene #${scene?.scene_number}`}
              </h3>
              <p className="text-xs font-hand font-bold text-studio-secondary">
                {isNew ? 'New Scene Extraction' : scene?.heading}
              </p>
            </div>
          </div>

          {/* FIX 4: Close button touch target >= 44x44px */}
          <button
            onClick={onClose}
            className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly bg-studio-surface text-studio-text border-2 border-studio-border flex items-center justify-center shadow-sketch-xs hover:bg-studio-red hover:text-white transition-all cursor-pointer"
            aria-label="Close edit scene modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* FIX 1: WCAG AA compliant error message */}
          {error && (
            <div className="p-3 rounded-wobbly bg-red-100 dark:bg-rose-950/60 border-2 border-studio-border text-xs font-hand font-bold text-accent-red-safe">
              {error}
            </div>
          )}

          <div>
            <label className="label">Scene Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="e.g. INT. SECURE SERVER VAULT - NIGHT"
              className="input font-mono text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Location Name</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Server Vault"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Location Type</label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value)}
                className="input"
              >
                <option value="industrial">Industrial</option>
                <option value="commercial">Commercial / Office</option>
                <option value="residential">Residential</option>
                <option value="outdoor">Outdoor / Urban</option>
                <option value="hospital">Medical / Institutional</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Time of Day</label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="input"
              >
                <option value="day">Day</option>
                <option value="night">Night</option>
                <option value="magic_hour">Magic Hour / Sunset</option>
                <option value="dawn">Dawn</option>
                <option value="continuous">Continuous</option>
              </select>
            </div>
            <div>
              <label className="label">Setting</label>
              <select
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                className="input"
              >
                <option value="interior">Interior (INT)</option>
                <option value="exterior">Exterior (EXT)</option>
                <option value="both">Both (INT/EXT)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Scene Action Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happens in this scene, physical space needs, camera atmosphere..."
              className="input h-24 resize-y leading-relaxed text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Cast Count</label>
              <input
                type="number"
                min="1"
                max="50"
                value={characters}
                onChange={(e) => setCharacters(parseInt(e.target.value) || 1)}
                className="input"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="scene-vehicles"
                checked={vehicles}
                onChange={(e) => setVehicles(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-studio-border text-studio-red cursor-pointer"
              />
              <label htmlFor="scene-vehicles" className="font-hand font-bold text-sm text-studio-text cursor-pointer">
                Requires Vehicles
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t-2 border-dashed border-studio-border/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary min-h-[44px] !py-2.5 !px-5 text-sm font-hand font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-sketch min-h-[44px] !py-2.5 !px-6 text-sm font-hand font-bold flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-studio-yellow" />
              <span>{isSaving ? 'Saving...' : isNew ? 'Add Scene' : 'Update Scene'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
