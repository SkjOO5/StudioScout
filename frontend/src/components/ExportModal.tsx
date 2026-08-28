import React, { useState } from 'react';
import { Project, ProductionPlan } from '../types';
import { api } from '../lib/api';
import {
  FileText,
  Calendar,
  Table as TableIcon,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Film,
  Clock,
  ExternalLink,
  Layers,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-studio-surface w-full max-w-4xl rounded-3xl border-2 border-studio-border shadow-pop overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-7 py-5 bg-studio-bg border-b-2 border-studio-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6] border-2 border-[#8B5CF6]/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-display font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white">
                  EXPORT HUB
                </span>
                <span className="text-xs text-studio-muted font-medium">Canonical Production Artifacts</span>
              </div>
              <h2 className="text-xl font-display font-extrabold text-studio-text">
                Export Production Package — {project.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-studio-muted hover:text-studio-text hover:bg-studio-surface border border-transparent hover:border-studio-border transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="mx-7 mt-5 p-3.5 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-7 mt-5 p-3.5 rounded-xl bg-rose-500/10 border-2 border-rose-500/30 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body / Export Options Grid */}
        <div className="p-7 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* 1. Production Bible PDF */}
            <div className="p-5 rounded-2xl bg-studio-bg border-2 border-studio-border shadow-pop-xs flex flex-col justify-between hover:border-[#8B5CF6] transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-display font-black uppercase px-2.5 py-1 rounded-md bg-[#8B5CF6]/20 text-[#8B5CF6]">
                    OFFICIAL PDF
                  </span>
                </div>
                <h3 className="text-base font-display font-bold text-studio-text mb-1.5 flex items-center gap-1.5">
                  <span>Production Bible</span>
                </h3>
                <p className="text-xs text-studio-muted leading-relaxed font-medium mb-4">
                  Complete editorial production dossier including title page, executive summary, 6-dimension candidate breakdown, Parallel Search citations, risk matrix, and full shooting schedule.
                </p>
              </div>

              <button
                onClick={handleExportBible}
                disabled={activeExport === 'bible'}
                className="w-full btn-candy-purple !py-2.5 text-xs font-display font-bold flex items-center justify-center gap-2"
              >
                {activeExport === 'bible' ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Download Production Bible (PDF)</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Daily Call Sheet PDF */}
            <div className="p-5 rounded-2xl bg-studio-bg border-2 border-studio-border shadow-pop-xs flex flex-col justify-between hover:border-[#F472B6] transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-[#F472B6]/10 text-[#F472B6] border border-[#F472B6]/30">
                    <Film className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-display font-black uppercase px-2.5 py-1 rounded-md bg-[#F472B6]/20 text-[#F472B6]">
                    DAILY SHEET
                  </span>
                </div>
                <h3 className="text-base font-display font-bold text-studio-text mb-1.5">
                  Daily Call Sheet
                </h3>
                <p className="text-xs text-studio-muted leading-relaxed font-medium mb-3">
                  Single-day production call sheet with crew call time, estimated wrap, scene timeline, cast and equipment notes, location access, and emergency contact placeholders.
                </p>

                {/* Day Selector */}
                {shootingDays.length > 0 && (
                  <div className="mb-4">
                    <label className="text-[11px] font-display font-bold text-studio-text block mb-1.5">
                      Select Shooting Day:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {shootingDays.map((d) => (
                        <button
                          key={d.day_number}
                          type="button"
                          onClick={() => setSelectedDay(d.day_number)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-display font-bold border transition-all ${
                            selectedDay === d.day_number
                              ? 'bg-[#F472B6] text-white border-studio-border shadow-pop-xs'
                              : 'bg-studio-surface text-studio-muted border-studio-border hover:text-studio-text'
                          }`}
                        >
                          Day {d.day_number} ({d.call_time})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleExportCallSheet}
                disabled={activeExport === 'callsheet' || shootingDays.length === 0}
                className="w-full btn-candy-pink !py-2.5 text-xs font-display font-bold flex items-center justify-center gap-2"
              >
                {activeExport === 'callsheet' ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Generating Call Sheet...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export Call Sheet — Day {selectedDay} (PDF)</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. Shooting Calendar (.ICS) */}
            <div className="p-5 rounded-2xl bg-studio-bg border-2 border-studio-border shadow-pop-xs flex flex-col justify-between hover:border-[#38BDF8] transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-display font-black uppercase px-2.5 py-1 rounded-md bg-[#38BDF8]/20 text-[#38BDF8]">
                    ICALENDAR .ICS
                  </span>
                </div>
                <h3 className="text-base font-display font-bold text-studio-text mb-1.5">
                  Shooting Calendar (.ics)
                </h3>
                <p className="text-xs text-studio-muted leading-relaxed font-medium mb-4">
                  RFC 5545 compliant calendar export with shooting blocks, scene assignments, and crew calls. One-click import into Google Calendar, Apple Calendar, and Outlook.
                </p>
              </div>

              <button
                onClick={handleExportCalendar}
                disabled={activeExport === 'calendar' || shootingDays.length === 0}
                className="w-full bg-[#38BDF8] text-[#0F172A] border-2 border-studio-border py-2.5 rounded-xl shadow-pop-xs hover:shadow-pop font-display font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {activeExport === 'calendar' ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Preparing .ICS File...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 text-[#0F172A]" />
                    <span>Download Calendar (.ICS)</span>
                  </>
                )}
              </button>
            </div>

            {/* 4. Google Sheets / CSV Schedule */}
            <div className="p-5 rounded-2xl bg-studio-bg border-2 border-studio-border shadow-pop-xs flex flex-col justify-between hover:border-[#10B981] transition-all group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                    <TableIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-display font-black uppercase px-2.5 py-1 rounded-md bg-[#10B981]/20 text-[#10B981]">
                    GOOGLE SHEETS / CSV
                  </span>
                </div>
                <h3 className="text-base font-display font-bold text-studio-text mb-1.5">
                  Shooting Schedule (CSV)
                </h3>
                <p className="text-xs text-studio-muted leading-relaxed font-medium mb-4">
                  Formatted spreadsheet schedule with UTF-8 BOM encoding. Ready to open directly in Google Sheets or Microsoft Excel with dates, times, scenes, cast counts, and risk tags.
                </p>
              </div>

              <button
                onClick={handleExportSchedule}
                disabled={activeExport === 'schedule' || shootingDays.length === 0}
                className="w-full bg-[#10B981] text-white border-2 border-studio-border py-2.5 rounded-xl shadow-pop-xs hover:shadow-pop font-display font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {activeExport === 'schedule' ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    <span>Exporting Schedule...</span>
                  </>
                ) : (
                  <>
                    <TableIcon className="w-4 h-4" />
                    <span>Export to Google Sheets (CSV)</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-7 py-4 bg-studio-bg border-t-2 border-studio-border flex items-center justify-between text-xs text-studio-muted font-medium">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FBBF24]" />
            <span>All exports are generated deterministically from your canonical project plan.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-studio-surface border-2 border-studio-border text-studio-text font-display font-bold text-xs hover:bg-studio-bg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
