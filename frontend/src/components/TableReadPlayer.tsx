import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Volume2, Mic, Users, Activity, MessageSquare } from 'lucide-react';

interface TableReadProps {
  tableRead: {
    scene_title?: string;
    tension_level?: string;
    overall_sentiment?: string;
    characters?: Array<{
      name: string;
      voice_id: string;
      vocal_profile: string;
      emotional_state?: string;
      pacing?: string;
      recommended_actor_reference?: string;
    }>;
    dialogue_lines?: Array<{
      character: string;
      voice_id?: string;
      delivery_tag: string;
      line: string;
      subtext?: string;
      sentiment_score?: number;
    }>;
    director_table_read_notes?: string;
  };
  sceneNumber: number;
}

export const TableReadPlayer: React.FC<TableReadProps> = ({ tableRead, sceneNumber }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLineIdx, setActiveLineIdx] = useState<number | null>(null);
  const lines = tableRead.dialogue_lines || [];
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      stopPlayback();
    };
  }, []);

  const speakLine = (index: number) => {
    if (!synthRef.current || index >= lines.length || !isPlayingRef.current) {
      setIsPlaying(false);
      setActiveLineIdx(null);
      return;
    }

    setActiveLineIdx(index);
    const lineItem = lines[index];
    const utterance = new SpeechSynthesisUtterance(lineItem.line);

    // Adjust pitch and rate per character
    const charName = lineItem.character.toUpperCase();
    if (charName.includes('MARCUS') || charName.includes('ARJUN')) {
      utterance.pitch = 0.75;
      utterance.rate = 1.05;
    } else if (charName.includes('ELENA') || charName.includes('KAVITA')) {
      utterance.pitch = 1.25;
      utterance.rate = 1.15;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    utterance.onend = () => {
      if (isPlayingRef.current) {
        setTimeout(() => {
          speakLine(index + 1);
        }, 350);
      }
    };

    utterance.onerror = () => {
      if (isPlayingRef.current) {
        speakLine(index + 1);
      }
    };

    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  };

  const startPlayback = () => {
    if (!synthRef.current || lines.length === 0) return;
    isPlayingRef.current = true;
    setIsPlaying(true);
    speakLine(0);
  };

  const stopPlayback = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setActiveLineIdx(null);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const playSingleLine = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!synthRef.current) return;
    stopPlayback();
    setActiveLineIdx(index);
    const lineItem = lines[index];
    const utterance = new SpeechSynthesisUtterance(lineItem.line);

    const charName = lineItem.character.toUpperCase();
    if (charName.includes('MARCUS') || charName.includes('ARJUN')) {
      utterance.pitch = 0.75;
      utterance.rate = 1.05;
    } else if (charName.includes('ELENA') || charName.includes('KAVITA')) {
      utterance.pitch = 1.25;
      utterance.rate = 1.15;
    }

    utterance.onend = () => {
      setActiveLineIdx(null);
    };

    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  };

  return (
    <div className="space-y-4 mt-4 text-left">
      {/* Overview telemetry badges */}
      <div className="flex flex-wrap gap-2 text-xs font-hand font-bold">
        <span className="px-3 py-1 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border flex items-center gap-1.5 shadow-sketch-xs">
          <Activity className="w-3.5 h-3.5" />
          Tension: {tableRead.tension_level || 'High Escalation'}
        </span>
        <span className="px-3 py-1 rounded-wobbly bg-studio-muted text-studio-text border border-studio-border flex items-center gap-1.5 shadow-sketch-xs">
          <MessageSquare className="w-3.5 h-3.5 text-studio-red" />
          Sentiment: {tableRead.overall_sentiment || 'Tactical Suspense'}
        </span>
      </div>

      {/* Play / Stop Master Button - FIX 4: min-h-[44px] */}
      <div className="flex items-center justify-between gap-3 p-3.5 bg-studio-bg rounded-wobbly-md border-2 border-studio-border shadow-sketch-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-studio-red text-white flex items-center justify-center border border-studio-border shadow-sketch-xs">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-studio-text">Multi-Speaker Table-Read Audio</p>
            <p className="font-hand text-xs text-studio-secondary">Live speech synthesis with character voice archetypes</p>
          </div>
        </div>

        {/* FIX 4: >=44px touch target */}
        <button
          onClick={togglePlayback}
          className={`min-h-[44px] px-4 py-2 rounded-wobbly border-2 border-studio-border text-xs font-hand font-bold flex items-center gap-2 shadow-sketch-xs transition-all cursor-pointer ${
            isPlaying
              ? 'bg-studio-red text-white animate-pulse'
              : 'btn-sketch-yellow'
          }`}
          title={isPlaying ? 'Stop Multi-Speaker Voice Read' : 'Play Live Multi-Speaker Voice Rehearsal'}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>STOP READING</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>PLAY TABLE-READ (VOICES)</span>
            </>
          )}
        </button>
      </div>

      {/* Character Voice Cast Cards */}
      {tableRead.characters && tableRead.characters.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-hand font-bold uppercase tracking-wider text-studio-secondary dark:text-slate-200 block">
            Gemini TTS Voice Casting:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {tableRead.characters.map((char, cIdx) => (
              <div
                key={cIdx}
                className="p-3 rounded-wobbly-md bg-studio-bg border border-studio-border space-y-1 text-xs"
              >
                <div className="flex items-center justify-between font-display font-bold">
                  <span className="text-studio-text uppercase text-sm">{char.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-wobbly bg-studio-yellow text-slate-950 border border-studio-border font-bold">
                    Voice: {char.voice_id}
                  </span>
                </div>
                <p className="font-hand text-sm text-studio-secondary dark:text-slate-200 line-clamp-2">{char.vocal_profile}</p>
                {char.recommended_actor_reference && (
                  <p className="text-xs font-hand font-bold text-studio-blue dark:text-sky-300 italic">
                    Archetype: {char.recommended_actor_reference}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FIX 2: Body-text legibility on dense data screens */}
      {/* Script Dialogue Lines Preview with Active Line Highlight. Uses plain sans-serif (font-sans text-sm sm:text-base) for crystal clear legibility on dense scripts! */}
      {lines.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-hand font-bold uppercase tracking-wider text-studio-secondary dark:text-slate-200 block">
              Rehearsal Dialogue &amp; Subtext (Click line to speak):
            </span>
            <span className="text-xs font-hand font-bold text-studio-secondary dark:text-slate-300">
              {lines.length} lines
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {lines.map((line, lIdx) => {
              const isActive = activeLineIdx === lIdx;
              return (
                <div
                  key={lIdx}
                  onClick={(e) => playSingleLine(lIdx, e)}
                  /* FIX 4: min-h-[44px] touch target */
                  className={`min-h-[44px] p-3 rounded-wobbly-md border-2 text-xs space-y-1 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-studio-yellow shadow-sketch-xs'
                      : 'bg-studio-surface border-studio-border hover:border-studio-red'
                  }`}
                  title="Click to speak this line"
                >
                  <div className="flex items-center justify-between">
                    {/* FIX 1: Contrast-safe text for character label */}
                    <span className="font-display font-bold text-studio-text uppercase text-xs flex items-center gap-1.5">
                      {isActive && <Volume2 className="w-3.5 h-3.5 text-studio-red animate-bounce" />}
                      <span className="px-1.5 py-0.5 rounded bg-studio-muted text-studio-text font-mono text-[11px] font-bold">
                        {line.character}
                      </span>
                    </span>
                    <span className="text-xs font-mono text-studio-secondary dark:text-amber-200/90 italic font-medium">
                      {line.delivery_tag}
                    </span>
                  </div>

                  {/* FIX 2: Plain sans-serif font for dialogue line body text ensures maximum legibility */}
                  <p className={`font-sans text-sm sm:text-base leading-relaxed ${isActive ? 'text-studio-text font-bold' : 'text-studio-text'}`}>
                    "{line.line}"
                  </p>

                  {line.subtext && (
                    <p className="font-hand text-xs text-studio-secondary dark:text-slate-200 italic border-t border-dashed border-studio-border/30 pt-1">
                      <strong className="not-italic text-studio-text dark:text-amber-300 font-display font-bold">Subtext:</strong> {line.subtext}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tableRead.director_table_read_notes && (
        <p className="font-hand text-sm text-studio-secondary dark:text-slate-200 italic pt-1">
          <strong className="font-display not-italic text-studio-text">Voice Director:</strong>{' '}
          {tableRead.director_table_read_notes}
        </p>
      )}
    </div>
  );
};
