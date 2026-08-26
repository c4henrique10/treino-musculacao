import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Plus, Minus } from 'lucide-react';

export default function Timer({ duration, onClose }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  const totalDuration = useRef(duration);

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

      // Vibrate mobile device if API is supported
      if ('vibrate' in navigator) {
        navigator.vibrate([150, 100, 150]);
      }
    } catch (e) {
      console.warn('AudioContext chimes blocked or unsupported', e);
    }
  };

  useEffect(() => {
    setTimeLeft(duration);
    totalDuration.current = duration;
    setIsRunning(true);
  }, [duration]);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playEndChime();
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const percentage = (timeLeft / totalDuration.current) * 100;

  const adjustTime = (amount) => {
    setTimeLeft((prev) => {
      const nextVal = Math.max(0, prev + amount);
      // Adjust total duration if we add time past original
      if (nextVal > totalDuration.current) {
        totalDuration.current = nextVal;
      }
      return nextVal;
    });
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
              {timeLeft === 0 ? 'Concluído!' : 'Descansando'}
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
            onClick={() => setTimeLeft(totalDuration.current)}
            className="flex-1 flex justify-center items-center py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setIsRunning(!isRunning)}
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
