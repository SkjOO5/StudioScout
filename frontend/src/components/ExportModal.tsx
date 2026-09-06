import React, { useState } from 'react';
import { Project, ProductionPlan } from '../types';
import { api } from '../lib/api';
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Film,
  Calendar,
  Table as TableIcon,
  Printer
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  plan: ProductionPlan | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  plan,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [activeExport, setActiveExport] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const shootingDays = plan?.shooting_days || [];
  const safeProjectName = project.name.replace(/[^a-zA-Z0-9_\- ]+/g, '').replace(/\s+/g, '-');

  const handleExportBible = async () => {
    try {
      setActiveExport('bible');
      setErrorMessage(null);
      await api.downloadProductionBible(project.id, `${safeProjectName}-Production-Bible.pdf`);
      setSuccessMessage('Production Bible PDF downloaded successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to download Production Bible PDF');
    } finally {
      setActiveExport(null);
    }
  };

  const handleExportCallSheet = async () => {
    try {
      setActiveExport('callsheet');
      setErrorMessage(null);
      await api.downloadCallSheet(project.id, selectedDay, `${safeProjectName}-Call-Sheet-Day-${selectedDay.toString().padStart(2, '0')}.pdf`);
      setSuccessMessage(`Day ${selectedDay} Call Sheet PDF downloaded successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to download Call Sheet PDF');
    } finally {
      setActiveExport(null);
    }
  };

  const handleExportCalendar = async () => {
    try {
      setActiveExport('calendar');
      setErrorMessage(null);
      await api.downloadCalendar(project.id, `${safeProjectName}-Shooting-Calendar.ics`);
      setSuccessMessage('Shooting Calendar (.ICS) downloaded! Ready to import into Google Calendar or Apple Calendar.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to download shooting calendar');
    } finally {
      setActiveExport(null);
    }
  };

  const handleExportSchedule = async () => {
    try {
      setActiveExport('schedule');
      setErrorMessage(null);
      await api.downloadScheduleCsv(project.id, `${safeProjectName}-Shooting-Schedule.csv`);
      setSuccessMessage('Shooting Schedule CSV downloaded! Compatible with Google Sheets & Excel.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to download schedule CSV');
    } finally {
      setActiveExport(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-pop-in text-left">
      <div 
        className="bg-studio-surface w-full max-w-4xl rounded-wobbly-md border-[2.5px] border-studio-border shadow-sketch-lg overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-7 py-5 bg-studio-bg border-b-2 border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-wobbly bg-studio-yellow text-slate-950 border-2 border-studio-border flex items-center justify-center shadow-sketch-xs shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-display font-black tracking-wider uppercase px-2 py-0.5 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border">
                  EXPORT HUB
                </span>
                <span className="text-xs font-hand text-studio-secondary font-bold">Canonical Production Artifacts</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-studio-text">
                Export Production Package — {project.name}
              </h2>
            </div>
          </div>

          {/* FIX 4: Close button touch target >= 44x44px */}
          <button
            onClick={onClose}
            className="touch-target min-w-[44px] min-h-[44px] p-2 rounded-wobbly text-studio-text hover:bg-studio-red hover:text-white border-2 border-studio-border shadow-sketch-xs transition-colors cursor-pointer"
            aria-label="Close export hub"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="mx-7 mt-5 p-3.5 rounded-wobbly bg-emerald-100 dark:bg-emerald-950/60 border-2 border-studio-border text-sm font-hand font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-sketch-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FIX 1: WCAG AA compliant error contrast */}
        {errorMessage && (
          <div className="mx-7 mt-5 p-3.5 rounded-wobbly bg-red-100 dark:bg-rose-950/60 border-2 border-studio-border text-sm font-hand font-bold text-accent-red-safe flex items-center gap-2 shadow-sketch-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-accent-red-safe" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body / Export Options Grid */}
        <div className="p-7 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* 1. Production Bible PDF */}
            <div className="p-5 rounded-wobbly-md bg-studio-bg border-2 border-studio-border shadow-sketch-xs flex flex-col justify-between hover:border-studio-red transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border flex items-center justify-center shadow-sketch-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-display font-black uppercase px-2.5 py-1 rounded-wobbly bg-studio-surface border border-studio-border text-studio-text">
                    OFFICIAL PDF
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-studio-text mb-1.5 flex items-center gap-1.5">
                  <span>Production Bible</span>
                </h3>
                <p className="text-sm text-studio-secondary leading-relaxed font-hand mb-4">
                  Complete editorial production dossier including title page, executive summary, 6-dimension candidate breakdown, Parallel Search citations, risk matrix, and full shooting schedule.
                </p>
              </div>

              {/* FIX 4: >=44px touch target */}
              <button
                onClick={handleExportBible}
                disabled={activeExport === 'bible'}
                className="w-full btn-sketch min-h-[44px] !py-3 text-sm font-hand font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {activeExport === 'bible' ? (
                  <span>Generating PDF...</span>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Download Production Bible (PDF)</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Daily Call Sheet PDF */}
            <div className="p-5 rounded-wobbly-md bg-studio-bg border-2 border-studio-border shadow-sketch-xs flex flex-col justify-between hover:border-studio-yellow transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-wobbly bg-studio-red text-white border border-studio-border flex items-center justify-center shadow-sketch-xs">
                    <Film className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-display font-black uppercase px-2.5 py-1 rounded-wobbly bg-studio-surface border border-studio-border text-studio-text">
                    DAILY SHEET
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-studio-text mb-1.5">
                  Daily Call Sheet
                </h3>
                <p className="text-sm text-studio-secondary leading-relaxed font-hand mb-3">
                  Single-day production call sheet with crew call time, estimated wrap, scene timeline, cast and equipment notes, location access, and emergency contact placeholders.
                </p>

                {/* Day Selector */}
                {shootingDays.length > 0 && (
                  <div className="mb-4">
                    <label className="text-xs font-display font-bold text-studio-text block mb-1.5">
                      Select Shooting Day:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {shootingDays.map((d) => (
                        <button
                          key={d.day_number}
                          type="button"
                          onClick={() => setSelectedDay(d.day_number)}
                          /* FIX 4: min-h-[44px] touch target */
                          className={`touch-target min-h-[44px] px-3.5 py-2 rounded-wobbly text-xs font-hand font-bold border-2 transition-all cursor-pointer ${
                            selectedDay === d.day_number
                              ? 'bg-studio-yellow text-slate-950 border-studio-border shadow-sketch-xs'
                              : 'bg-studio-surface text-studio-secondary border-studio-border hover:text-studio-text'
                          }`}
                        >
                          Day {d.day_number} ({d.call_time})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* FIX 4: >=44px touch target */}
              <button
                onClick={handleExportCallSheet}
                disabled={activeExport === 'callsheet' || shootingDays.length === 0}
                className="w-full btn-sketch-yellow min-h-[44px] !py-3 text-sm font-hand font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {activeExport === 'callsheet' ? (
                  <span>Generating Call Sheet...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-900" />
                    <span>Export Call Sheet — Day {selectedDay} (PDF)</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. Shooting Calendar .ICS */}
            <div className="p-5 rounded-wobbly-md bg-studio-bg border-2 border-studio-border shadow-sketch-xs flex flex-col justify-between hover:border-studio-blue transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-wobbly bg-sky-200 text-slate-950 border border-studio-border flex items-center justify-center shadow-sketch-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-display font-black uppercase px-2.5 py-1 rounded-wobbly bg-studio-surface border border-studio-border text-studio-text">
                    CALENDAR SYNC
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-studio-text mb-1.5">
                  Calendar Schedule (.ICS)
                </h3>
                <p className="text-sm text-studio-secondary leading-relaxed font-hand mb-4">
                  Standard RFC 5545 iCalendar feed. Imports multi-day call times, wrap hours, and venue locations directly into Apple Calendar, Google Calendar, or Outlook.
                </p>
              </div>

              {/* FIX 4: >=44px touch target */}
              <button
                onClick={handleExportCalendar}
                disabled={activeExport === 'calendar'}
                className="w-full btn-secondary min-h-[44px] !py-3 text-sm font-hand font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {activeExport === 'calendar' ? (
                  <span>Exporting Calendar...</span>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 text-studio-text" />
                    <span>Download Calendar (.ICS)</span>
                  </>
                )}
              </button>
            </div>

            {/* 4. Shooting Schedule CSV */}
            <div className="p-5 rounded-wobbly-md bg-studio-bg border-2 border-studio-border shadow-sketch-xs flex flex-col justify-between hover:border-emerald-500 transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-wobbly bg-emerald-300 text-slate-950 border border-studio-border flex items-center justify-center shadow-sketch-xs">
                    <TableIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-display font-black uppercase px-2.5 py-1 rounded-wobbly bg-studio-surface border border-studio-border text-studio-text">
                    SPREADSHEET
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-studio-text mb-1.5">
                  Production Schedule (CSV)
                </h3>
                <p className="text-sm text-studio-secondary leading-relaxed font-hand mb-4">
                  Tabular shooting breakdown with scene numbers, call times, estimated wrap, locations, and crew notes for Excel, Google Sheets, or Movie Magic Scheduling.
                </p>
              </div>

              {/* FIX 4: >=44px touch target */}
              <button
                onClick={handleExportSchedule}
                disabled={activeExport === 'schedule'}
                className="w-full btn-sketch min-h-[44px] !py-3 text-sm font-hand font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                {activeExport === 'schedule' ? (
                  <span>Exporting CSV...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-studio-yellow" />
                    <span>Download Schedule (CSV)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
