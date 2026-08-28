import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Disc, Radio, Music } from 'lucide-react';

interface AudioCueProps {
  cue: {
    track_title?: string;
    genre?: string;
    bpm?: number;
    key_signature?: string;
    mood_descriptors?: string[];
    instrumentation?: string[];
    foley_layers?: string[];
    lyria_prompt?: string;
    composer_notes?: string;
  };
  sceneNumber: number;
}

export const AudioCuePlayer: React.FC<AudioCueProps> = ({ cue, sceneNumber }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<any>(null);
  const animationFrameRef = useRef<any>(null);
  const nodesRef = useRef<any[]>([]);

  const DURATION = 30; // 30-second cue
  const bpm = cue.bpm || 80;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const getRootFrequency = (keySig: string = ''): number => {
    const key = keySig.toUpperCase();
    if (key.includes('D')) return 146.83; // D3
    if (key.includes('C#') || key.includes('DB')) return 138.59;
    if (key.includes('C')) return 130.81; // C3
    if (key.includes('E')) return 164.81; // E3
    if (key.includes('F#')) return 185.0;
    if (key.includes('F')) return 174.61;
    if (key.includes('G')) return 196.0;
    if (key.includes('A')) return 220.0; // A3
    if (key.includes('B')) return 246.94;
    return 146.83; // Default D
  };

  const startAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const rootFreq = getRootFrequency(cue.key_signature);
      const nodes: any[] = [];

      // 1. Sub-Bass Drone Layer (Deep & Heavy)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(rootFreq / 2, ctx.currentTime); // Low root
      subGain.gain.setValueAtTime(0.18, ctx.currentTime);

      const subFilter = ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(160, ctx.currentTime);

      subOsc.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start();
      nodes.push(subOsc);

      // 2. Atmospheric Sci-Fi Pad Layer (Rich 5th & Minor 3rd Chords)
      const padFreqs = [rootFreq, rootFreq * 1.2, rootFreq * 1.5]; // Root, Minor 3rd, 5th
      padFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const padGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Slow pitch modulation (LFO vibrato)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.3 + idx * 0.1, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();
        nodes.push(lfo);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        padGain.gain.setValueAtTime(0.12, ctx.currentTime);

        osc.connect(filter);
        filter.connect(padGain);
        padGain.connect(masterGain);
        osc.start();
        nodes.push(osc);
      });

      // 3. Rhythmic Cybernetic Pulse / Arpeggiator (Synced to Scene BPM)
      const beatInterval = 60 / bpm;
      const arpOsc = ctx.createOscillator();
      const arpGain = ctx.createGain();
      const arpFilter = ctx.createBiquadFilter();

      arpOsc.type = 'sawtooth';
      arpOsc.frequency.setValueAtTime(rootFreq * 2, ctx.currentTime);

      arpFilter.type = 'bandpass';
      arpFilter.frequency.setValueAtTime(800, ctx.currentTime);
      arpFilter.Q.setValueAtTime(4, ctx.currentTime);

      arpGain.gain.setValueAtTime(0, ctx.currentTime);

      // Schedule rhythmic pulses
      const now = ctx.currentTime;
      for (let t = 0; t < DURATION; t += beatInterval) {
        const hitTime = now + t;
        arpGain.gain.setValueAtTime(0, hitTime);
        arpGain.gain.linearRampToValueAtTime(0.15, hitTime + 0.02);
        arpGain.gain.exponentialRampToValueAtTime(0.001, hitTime + beatInterval * 0.6);
      }

      arpOsc.connect(arpFilter);
      arpFilter.connect(arpGain);
      arpGain.connect(masterGain);
      arpOsc.start();
      nodes.push(arpOsc);

      nodesRef.current = nodes;
      setIsPlaying(true);

      // Progress Tracker
      const startTime = Date.now() - currentTime * 1000;
      intervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= DURATION) {
          stopAudio();
          setCurrentTime(0);
        } else {
          setCurrentTime(elapsed);
        }
      }, 100);
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  const stopAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    nodesRef.current.forEach((n) => {
      try {
        n.stop();
        n.disconnect();
      } catch (e) {}
    });
    nodesRef.current = [];

    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const toggleMute = () => {
    if (!gainNodeRef.current) {
      setIsMuted(!isMuted);
      return;
    }
    if (isMuted) {
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current?.currentTime || 0);
      setIsMuted(false);
    } else {
      gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current?.currentTime || 0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (!isMuted && gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(val, audioCtxRef.current.currentTime);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Generate and Download WAV File
  const handleDownloadWav = () => {
    const sampleRate = 44100;
    const numChannels = 2;
    const numSamples = sampleRate * 10; // 10-sec export
    const buffer = new ArrayBuffer(44 + numSamples * numChannels * 2);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * numChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * numChannels * 2, true);

    const rootFreq = getRootFrequency(cue.key_signature);
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const sub = Math.sin(2 * Math.PI * (rootFreq / 2) * t) * 0.3;
      const pad = (Math.sin(2 * Math.PI * rootFreq * t) + Math.sin(2 * Math.PI * (rootFreq * 1.5) * t)) * 0.2;
      const sample = Math.max(-1, Math.min(1, sub + pad)) * 0.8;
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      view.setInt16(offset + 2, intSample, true);
      offset += 4;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `StudioScout-Scene-${sceneNumber}-Lyria-Score.wav`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const progressPct = Math.min(100, (currentTime / DURATION) * 100);

  return (
    <div className="space-y-3.5 mt-4">
      {/* Top audio badges */}
      <div className="flex flex-wrap gap-2 text-[11px] font-display font-bold">
        <span className="px-2.5 py-1 rounded-md bg-[#FEF3C7] dark:bg-amber-950/40 text-[#D97706] dark:text-[#FBBF24] border border-studio-border flex items-center gap-1 shadow-pop-xs">
          <Radio className="w-3.5 h-3.5" />
          {cue.bpm || 80} BPM
        </span>
        <span className="px-2.5 py-1 rounded-md bg-[#DDD6FE] dark:bg-[#8B5CF6]/30 text-[#8B5CF6] dark:text-[#A78BFA] border border-studio-border flex items-center gap-1 shadow-pop-xs">
          <Disc className="w-3.5 h-3.5" />
          Key: {cue.key_signature || 'D Minor'}
        </span>
        <span className="px-2.5 py-1 rounded-md bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0284C7] dark:text-sky-300 border border-studio-border shadow-pop-xs">
          {cue.genre || 'Industrial Sci-Fi Score'}
        </span>
      </div>

      {/* Interactive Audio Player & Dynamic Visualizer */}
      <div className="p-4 bg-[#0B0F17] rounded-xl border-2 border-studio-border shadow-pop-xs space-y-3 text-white">
        <div className="flex items-center justify-between gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border-2 border-studio-border shadow-pop-xs transition-all ${
              isPlaying
                ? 'bg-[#EF4444] text-white hover:scale-105'
                : 'bg-[#FBBF24] text-[#1E293B] hover:scale-105 active:scale-95'
            }`}
            title={isPlaying ? 'Pause Audio Cue' : 'Play Live Synthesized Audio Cue'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Animated Waveform Visualizer */}
          <div className="flex-1 flex items-center gap-1 h-8 px-2 bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden">
            {[45, 70, 85, 35, 95, 60, 80, 50, 90, 65, 40, 85, 55, 75, 100, 45, 90, 65, 35, 80, 50, 70, 95, 60].map(
              (baseHeight, bIdx) => {
                const isPassed = (bIdx / 24) * 100 <= progressPct;
                const animatedHeight = isPlaying
                  ? Math.min(100, Math.max(15, baseHeight + Math.sin(currentTime * 8 + bIdx) * 30))
                  : isPassed
                  ? baseHeight
                  : Math.max(15, baseHeight * 0.4);

                return (
                  <div
                    key={bIdx}
                    className={`flex-1 rounded-full transition-all duration-75 ${
                      isPassed ? 'bg-[#FBBF24]' : 'bg-slate-700'
                    }`}
                    style={{ height: `${animatedHeight}%` }}
                  />
                );
              }
            )}
          </div>

          {/* Time & Download Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono font-bold text-amber-400 min-w-[50px] text-right">
              {formatTime(currentTime)} / {formatTime(DURATION)}
            </span>
            <button
              onClick={handleDownloadWav}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Download Synthesized WAV Audio Track"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Volume & Scrub Track */}
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="hover:text-white transition-colors">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#FBBF24]"
            />
          </div>

          <span className="font-mono text-[10px] text-amber-300 font-bold">
            {isPlaying ? '● REAL-TIME WEB AUDIO SYNTH ACTIVE' : 'CLICK PLAY TO HEAR REAL AUDIO'}
          </span>
        </div>
      </div>

      {/* Instrumentation Chips */}
      {cue.instrumentation && cue.instrumentation.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-display font-black uppercase tracking-wider text-studio-muted block">
            Lead Instrumentation:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {cue.instrumentation.map((inst, iIdx) => (
              <span
                key={iIdx}
                className="px-2 py-0.5 rounded-md bg-studio-muted text-studio-text border border-studio-border/30 text-[11px] font-medium"
              >
                {inst}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Foley Atmosphere Layers */}
      {cue.foley_layers && cue.foley_layers.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-display font-black uppercase tracking-wider text-studio-muted block">
            Foley & Environmental Layers:
          </span>
          <ul className="text-xs text-studio-muted font-medium space-y-0.5 pl-4 list-disc">
            {cue.foley_layers.map((foley, fIdx) => (
              <li key={fIdx}>{foley}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Lyria 3 Prompt Box */}
      {cue.lyria_prompt && (
        <div className="p-3 bg-studio-bg rounded-xl border border-studio-border text-xs font-mono text-studio-text space-y-1.5">
          <p className="font-bold text-[10px] uppercase text-[#D97706] dark:text-[#FBBF24] font-display">
            Lyria 3 Music Generator Prompt:
          </p>
          <p className="line-clamp-3 text-[11px] leading-relaxed">"{cue.lyria_prompt}"</p>
        </div>
      )}

      {cue.composer_notes && (
        <p className="text-xs text-studio-muted font-medium italic">
          <strong className="font-display not-italic text-studio-text">Composer Notes:</strong>{' '}
          {cue.composer_notes}
        </p>
      )}
    </div>
  );
};
