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
      utterance.pitch = 0.75; // Lower, deeper male tactical voice
      utterance.rate = 1.05;
    } else if (charName.includes('ELENA') || charName.includes('KAVITA')) {
      utterance.pitch = 1.25; // Higher, articulate female operative voice
      utterance.rate = 1.15;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
    }

    utterance.onend = () => {
      if (isPlayingRef.current) {
        setTimeout(() => {
          speakLine(index + 1);
        }, 350); // Natural actor pause between cues
      }
    };

    utterance.onerror = () => {
      if (isPlayingRef.current) {
        speakLine(index + 1);
      }
    };

    synthRef.current.cancel(); // Cancel any prior queue
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

    utterance.onend = () => setActiveLineIdx(null);
    synthRef.current.cancel();
    synthRef.current.speak(utterance);
  };

  return (
    <div className="space-y-4 mt-3">
      {/* Tension & Sentiment Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 text-[11px] font-display font-bold">
          <span className="px-2.5 py-1 rounded-md bg-[#FFE4E6] dark:bg-rose-950/40 text-[#E11D48] dark:text-rose-300 border border-studio-border flex items-center gap-1 shadow-pop-xs">
            <Activity className="w-3.5 h-3.5" />
            Tension: {tableRead.tension_level || 'High (8.5/10)'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#EDE9FE] dark:bg-[#8B5CF6]/30 text-[#7C3AED] dark:text-[#A78BFA] border border-studio-border flex items-center gap-1 shadow-pop-xs">
            <MessageSquare className="w-3.5 h-3.5" />
            Tone: {tableRead.overall_sentiment || 'Tactical Paranoia'}
          </span>
        </div>

        {/* Live Multi-Speaker Audio Playback Trigger */}
        <button
          onClick={togglePlayback}
          className={`px-3.5 py-1.5 rounded-xl border-2 border-studio-border text-xs font-display font-black flex items-center gap-2 shadow-pop-xs transition-all ${
            isPlaying
              ? 'bg-[#EF4444] text-white animate-pulse'
              : 'bg-[#EC4899] text-white hover:scale-105 active:scale-95'
          }`}
          title={isPlaying ? 'Stop Multi-Speaker Voice Read' : 'Play Live Multi-Speaker Voice Rehearsal'}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP READING</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY TABLE-READ (VOICES)</span>
            </>
          )}
        </button>
      </div>

      {/* Character Voice Cast Cards */}
      {tableRead.characters && tableRead.characters.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-display font-black uppercase tracking-wider text-studio-muted block">
            Gemini TTS Voice Casting:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tableRead.characters.map((char, cIdx) => (
              <div
                key={cIdx}
                className="p-2.5 rounded-xl bg-studio-bg border border-studio-border/40 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between font-display font-black">
                  <span className="text-studio-text uppercase">{char.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#7C3AED] dark:text-[#A78BFA] border border-studio-border">
                    Voice: {char.voice_id}
                  </span>
                </div>
                <p className="text-[11px] text-studio-muted line-clamp-2">{char.vocal_profile}</p>
                {char.recommended_actor_reference && (
                  <p className="text-[10px] font-medium text-[#0284C7] dark:text-sky-300 italic">
                    Archetype: {char.recommended_actor_reference}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Script Dialogue Lines Preview with Active Line Highlight */}
      {lines.length > 0 && (
        <div className="space-y-2">
          <span className="text-[10px] font-display font-black uppercase tracking-wider text-studio-muted block">
            Rehearsal Dialogue & Subtext:
          </span>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {lines.map((line, lIdx) => {
              const isActive = activeLineIdx === lIdx;
              return (
                <div
                  key={lIdx}
                  onClick={(e) => playSingleLine(lIdx, e)}
                  className={`p-3 rounded-xl border text-xs space-y-1 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#FDF2F8] dark:bg-pink-950/60 border-[#EC4899] shadow-pop-xs scale-[1.01]'
                      : 'bg-studio-bg border-studio-border hover:border-studio-border/80'
                  }`}
                  title="Click to speak this line"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-[#EC4899] uppercase text-[11px] flex items-center gap-1.5">
                      {isActive && <Volume2 className="w-3.5 h-3.5 text-[#EC4899] animate-bounce" />}
                      {line.character}
                    </span>
                    <span className="text-[10px] font-mono text-studio-muted italic">
                      {line.delivery_tag}
                    </span>
                  </div>
                  <p className={`font-medium text-xs ${isActive ? 'text-[#BE185D] dark:text-pink-200 font-bold' : 'text-studio-text'}`}>
                    "{line.line}"
                  </p>
                  {line.subtext && (
                    <p className="text-[10px] text-studio-muted italic border-t border-studio-border/20 pt-1">
                      <strong>Subtext:</strong> {line.subtext}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tableRead.director_table_read_notes && (
        <p className="text-xs text-studio-muted font-medium italic pt-1">
          <strong className="font-display not-italic text-studio-text">Voice Director:</strong>{' '}
          {tableRead.director_table_read_notes}
        </p>
      )}
    </div>
  );
};
