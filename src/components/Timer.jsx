import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Plus, Minus } from 'lucide-react';

export default function Timer({ duration, onClose }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  const totalDuration = useRef(duration);

  // Absolute-timestamp countdown: setInterval alone drifts/throttles when the
  // tab is backgrounded or the phone screen locks, so the tick always
  // recomputes remaining time from Date.now() vs a fixed target timestamp
  // instead of trusting an accumulated decrement. endTimeRef is meaningful
  // while running; pausedRemainingMsRef holds the frozen remainder while
  // paused. hasFiredEndRef guards the chime/vibration from firing more than
  // once for the same countdown.
  const endTimeRef = useRef(Date.now() + duration * 1000);
  const pausedRemainingMsRef = useRef(duration * 1000);
  const hasFiredEndRef = useRef(false);

  // Play a beautiful synthetic notification sound using Web Audio API
  const playEndChime = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // Sweet chime sounds
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        
        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.8);
      });

      // Vibrate mobile device if API is supported (no-op on iOS Safari,
      // which has no navigator.vibrate — the 'in' check skips it silently,
      // and the chime above still plays as an audible fallback there)
      if ('vibrate' in navigator) {
        navigator.vibrate([300, 100, 300, 100, 300]);
      }
    } catch (e) {
      console.warn('AudioContext chimes blocked or unsupported', e);
    }
  };

  useEffect(() => {
    setTimeLeft(duration);
    totalDuration.current = duration;
    endTimeRef.current = Date.now() + duration * 1000;
    pausedRemainingMsRef.current = duration * 1000;
    hasFiredEndRef.current = false;
    setIsRunning(true);
  }, [duration]);

  // Recomputes timeLeft from the absolute target timestamp and fires the
  // end chime/vibration exactly once when time's up. Called on every tick
  // AND immediately when the tab regains visibility, so a throttled/paused
  // background interval never leaves a stale number on screen.
  const syncFromClock = () => {
    const remainingMs = Math.max(0, endTimeRef.current - Date.now());
    const remainingSec = Math.ceil(remainingMs / 1000);
    setTimeLeft(remainingSec);
    if (remainingMs <= 0 && !hasFiredEndRef.current) {
      hasFiredEndRef.current = true;
      pausedRemainingMsRef.current = 0; // so "Retomar" after time's up doesn't restart from the full duration
      setIsRunning(false);
      playEndChime();
    }
  };

  useEffect(() => {
    if (!isRunning) return;
    syncFromClock();
    // The interval only needs to be frequent enough for a smooth display —
    // correctness never depends on it firing on time, since each tick
    // re-derives the truth from Date.now() rather than decrementing.
    const interval = setInterval(syncFromClock, 250);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isRunning) syncFromClock();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const percentage = (timeLeft / totalDuration.current) * 100;

  // +15s/-15s: shifts whichever timestamp is currently authoritative
  // (the running end-time, or the frozen paused remainder) so the change
  // sticks correctly whether or not the countdown is ticking.
  const adjustTime = (amountSeconds) => {
    const amountMs = amountSeconds * 1000;
    if (isRunning) {
      endTimeRef.current += amountMs;
    } else {
      pausedRemainingMsRef.current = Math.max(0, pausedRemainingMsRef.current + amountMs);
    }
    const remainingMs = Math.max(0, isRunning ? endTimeRef.current - Date.now() : pausedRemainingMsRef.current);
    const remainingSec = Math.ceil(remainingMs / 1000);
    setTimeLeft(remainingSec);
    if (remainingSec > totalDuration.current) {
      totalDuration.current = remainingSec;
    }
    if (remainingMs > 0) {
      hasFiredEndRef.current = false;
    }
  };

  const handleToggleRunning = () => {
    if (isRunning) {
      // Freeze the exact remainder so resuming doesn't jump/skip time.
      pausedRemainingMsRef.current = Math.max(0, endTimeRef.current - Date.now());
      setIsRunning(false);
    } else {
      endTimeRef.current = Date.now() + pausedRemainingMsRef.current;
      hasFiredEndRef.current = false;
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    const ms = totalDuration.current * 1000;
    if (isRunning) {
      endTimeRef.current = Date.now() + ms;
    } else {
      pausedRemainingMsRef.current = ms;
    }
    hasFiredEndRef.current = false;
    setTimeLeft(totalDuration.current);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl glass-card border border-indigo-500/20 p-6 flex flex-col items-center relative shadow-2xl shadow-indigo-950/40">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <h3 className="text-sm font-semibold tracking-wide uppercase text-indigo-400 mb-6">
          Tempo de Descanso
        </h3>

        {/* Circular Display */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-6">
          <svg className="absolute w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="76"
              className="stroke-slate-800 fill-none"
              strokeWidth="6"
            />
            <circle
              cx="88"
              cy="88"
              r="76"
              className={`fill-none transition-all duration-1000 ${
                timeLeft === 0 ? 'stroke-rose-500' : 'stroke-indigo-500'
              }`}
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 76}
              strokeDashoffset={2 * Math.PI * 76 * (1 - percentage / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-center z-10">
            <span className={`text-4xl font-extrabold font-mono tracking-tight transition-colors ${
              timeLeft === 0 ? 'text-rose-500 animate-pulse' : 'text-white'
            }`}>
              {formatTime(timeLeft)}
            </span>
            <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">
              {timeLeft === 0 ? 'TEMPO!' : 'Descansando'}
            </p>
          </div>
        </div>

        {/* Adjust Buttons */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => adjustTime(-15)} 
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
          >
            <Minus className="w-3.5 h-3.5" /> 15s
          </button>
          <button 
            onClick={() => adjustTime(15)} 
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" /> 15s
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 w-full">
          <button
            onClick={handleReset}
            className="flex-1 flex justify-center items-center py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleRunning}
            className={`flex-2 flex justify-center items-center py-3 px-6 rounded-2xl text-white font-bold transition-all ${
              isRunning 
                ? 'bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/20' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
            }`}
          >
            {isRunning ? (
              <span className="flex items-center gap-2"><Pause className="w-5 h-5 fill-current" /> Pausar</span>
            ) : (
              <span className="flex items-center gap-2"><Play className="w-5 h-5 fill-current" /> Retomar</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
