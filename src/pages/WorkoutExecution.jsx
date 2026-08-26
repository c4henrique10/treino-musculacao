import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Check,
  Clock,
  Video,
  AlertTriangle,
  X,
  Award,
  ChevronRight,
  HelpCircle,
  Plus
} from 'lucide-react';
import { saveWorkoutLog, getWorkoutLogs } from '../supabase';
import Timer from '../components/Timer';

// --- LOCAL DRAFT AUTOSAVE (in-progress workout session) ---
// Scoped per workout_sheet id so reopening a different ficha never restores
// someone else's in-progress sets. Best-effort: storage errors are swallowed
// since autosave must never block the actual workout.
const DRAFT_KEY_PREFIX = 'workout_draft_';

const loadDraft = (sheetId) => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY_PREFIX + sheetId);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const saveDraft = (sheetId, draft) => {
  try {
    localStorage.setItem(DRAFT_KEY_PREFIX + sheetId, JSON.stringify(draft));
  } catch (e) {
    // Storage unavailable/full — autosave is best-effort, ignore.
  }
};

const clearDraft = (sheetId) => {
  try {
    localStorage.removeItem(DRAFT_KEY_PREFIX + sheetId);
  } catch (e) {
    // Ignore.
  }
};

const buildInitialExerciseStates = (sheet) => {
  if (!sheet || !sheet.exercises) return [];
  return sheet.exercises.map(ex => {
    const numSets = parseInt(ex.target_sets || 4);
    const targetReps = parseInt(ex.target_reps || 10);

    const sets = Array.from({ length: numSets }, (_, i) => ({
      set_number: i + 1,
      weight: '',
      reps: targetReps,
      completed: false
    }));

    return {
      exercise_id: ex.id,
      exercise_name: ex.name,
      youtube_url: ex.youtube_url,
      rest_seconds: parseInt(ex.rest_seconds) || 90,
      sets
    };
  });
};

// A draft only counts as usable if it belongs to this exact ficha AND still
// has the same number of exercises — otherwise the ficha was edited since
// the draft was saved and restoring it could show stale/mismatched sets.
const draftMatchesSheet = (draft, sheet) => {
  if (!draft || !sheet) return false;
  if (draft.sheetId !== sheet.id) return false;
  if (!Array.isArray(draft.exerciseStates)) return false;
  return draft.exerciseStates.length === (sheet.exercises?.length || 0);
};

export default function WorkoutExecution({ sheet, onCancel, onFinish }) {
  const initialDraftRef = useRef(loadDraft(sheet.id));
  const hasUsableDraft = draftMatchesSheet(initialDraftRef.current, sheet);
  if (initialDraftRef.current && !hasUsableDraft) {
    // Stale draft (different ficha, or ficha shape changed) — discard it.
    clearDraft(sheet.id);
  }

  const [duration, setDuration] = useState(() => (hasUsableDraft ? initialDraftRef.current.duration : 0));
  const [exerciseStates, setExerciseStates] = useState(() =>
    hasUsableDraft ? initialDraftRef.current.exerciseStates : buildInitialExerciseStates(sheet)
  );
  const [historyLogs, setHistoryLogs] = useState([]);

  // Timer Modal Control
  const [activeTimerDuration, setActiveTimerDuration] = useState(null);

  // Video Modal Control
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  const timerRef = useRef(null);

  // 1. Clock timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // 2. Fetch history to resolve previous weights
  useEffect(() => {
    async function loadHistory() {
      try {
        const logs = await getWorkoutLogs();
        setHistoryLogs(logs);
      } catch (e) {
        console.error(e);
      }
    }
    loadHistory();
  }, []);

  // 3. Autosave the in-progress session locally (debounced) so a refresh,
  // a killed mobile tab, or a failed final save doesn't lose typed sets.
  useEffect(() => {
    const id = setTimeout(() => {
      saveDraft(sheet.id, { sheetId: sheet.id, duration, exerciseStates, savedAt: Date.now() });
    }, 400);
    return () => clearTimeout(id);
  }, [sheet.id, duration, exerciseStates]);

  // Helper to query historical weights
  const getPreviousPerformance = (exName) => {
    for (const log of historyLogs) {
      const matchedSet = log.set_logs?.find(
        s => s.exercise_name.toLowerCase() === exName.toLowerCase() && s.completed
      );
      if (matchedSet) {
        return `${matchedSet.weight}kg x ${matchedSet.reps}`;
      }
    }
    return 'Nenhum';
  };

  const handleToggleSet = (exIdx, setIdx) => {
    const list = [...exerciseStates];
    const set = list[exIdx].sets[setIdx];

    if (!set.completed) {
      // Complete set - validate weights
      if (!set.weight || parseFloat(set.weight) <= 0) {
        alert('Por favor, informe a carga antes de concluir a série.');
        return;
      }
      set.completed = true;

      // Auto launch rest timer using this exercise's configured rest time
      // (falls back to 90s if the exercise predates this field)
      setActiveTimerDuration(list[exIdx].rest_seconds || 90);
    } else {
      // Undo completion
      set.completed = false;
    }
    setExerciseStates(list);
  };

  const handleUpdateSetField = (exIdx, setIdx, field, val) => {
    const list = [...exerciseStates];
    list[exIdx].sets[setIdx][field] = val;
    setExerciseStates(list);
  };

  // Appends a manual extra set at the end of an exercise's list, numbered
  // sequentially after the last existing set. Reuses the previous set's reps
  // as a sensible default target.
  const handleAddExtraSet = (exIdx) => {
    const list = [...exerciseStates];
    const sets = list[exIdx].sets;
    const lastSet = sets[sets.length - 1];
    sets.push({
      set_number: sets.length + 1,
      weight: '',
      reps: lastSet ? lastSet.reps : 10,
      completed: false
    });
    setExerciseStates(list);
  };

  const handleSaveWorkout = async () => {
    // Collect all completed sets
    const completedSets = [];
    exerciseStates.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed) {
          completedSets.push({
            exercise_id: ex.exercise_id,
            exercise_name: ex.exercise_name,
            set_number: set.set_number,
            weight: parseFloat(set.weight),
            reps: parseInt(set.reps),
            completed: true
          });
        }
      });
    });

    if (completedSets.length === 0) {
      alert('Realize e conclua pelo menos uma série antes de finalizar o treino.');
      return;
    }

    clearInterval(timerRef.current);
    try {
      await saveWorkoutLog(sheet.id, sheet.name, duration, completedSets);
      clearDraft(sheet.id);
      alert('Treino concluído e salvo com sucesso! Bom trabalho! 💪🔥');
      onFinish();
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar o treino. Seu progresso foi mantido localmente — tente novamente.');
    }
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Helper to resolve youtube embed iframe sources
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-16">
      
      {/* Top Floating Control Bar */}
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between sticky top-16 z-30 border border-slate-800 shadow-md">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
            Executando Treino
          </span>
          <h2 className="text-sm font-bold text-white truncate max-w-[200px]">
            {sheet.name}
          </h2>
        </div>

        {/* Counter & Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300 font-mono text-sm bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-xl">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{formatTimer(duration)}</span>
          </div>

          <button
            onClick={handleSaveWorkout}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20"
          >
            Finalizar
          </button>
        </div>
      </div>

      {/* Exercises Lists */}
      <div className="space-y-5">
        {exerciseStates.map((ex, exIdx) => {
          const previousPerf = getPreviousPerformance(ex.exercise_name);
          const embedSrc = getYouTubeEmbedUrl(ex.youtube_url);
          
          return (
            <div key={ex.exercise_id || exIdx} className="glass-card rounded-3xl border border-slate-800 p-5 space-y-4">
              
              {/* Exercise Header */}
              <div className="flex justify-between items-start border-b border-slate-850/80 pb-3">
                <div className="pr-4">
                  <h3 className="font-bold text-sm text-white dark:text-white light:text-slate-900 leading-tight">
                    {ex.exercise_name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span className="text-indigo-400">Anterior: {previousPerf}</span>
                  </div>
                </div>

                {/* Demonstration Button */}
                {ex.youtube_url && (
                  <button
                    onClick={() => setActiveVideoUrl(ex.youtube_url)}
                    className="flex items-center gap-1 text-[10px] font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 transition-all shrink-0 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Demo</span>
                  </button>
                )}
              </div>

              {/* Set Tracker Table Header */}
              <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                <span className="col-span-2">Série</span>
                <span className="col-span-4">Carga (kg)</span>
                <span className="col-span-3 text-center">Reps</span>
                <span className="col-span-3 text-right pr-2">Ok</span>
              </div>

              {/* Series List Rows */}
              <div className="space-y-2">
                {ex.sets.map((set, setIdx) => (
                  <div 
                    key={setIdx} 
                    className={`grid grid-cols-12 gap-2 items-center py-2.5 px-3 rounded-2xl border transition-all ${
                      set.completed 
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-300' 
                        : 'bg-slate-900/40 border-slate-850/60 text-slate-300'
                    }`}
                  >
                    {/* Set Number */}
                    <span className="col-span-2 text-xs font-black text-slate-400">
                      {set.set_number}
                    </span>

                    {/* Weight Input */}
                    <div className="col-span-4 relative flex items-center">
                      <input
                        type="number"
                        placeholder="0"
                        value={set.weight}
                        disabled={set.completed}
                        onChange={(e) => handleUpdateSetField(exIdx, setIdx, 'weight', e.target.value)}
                        className={`w-full bg-slate-950/60 dark:bg-slate-950/60 light:bg-white border rounded-xl py-1.5 px-2.5 text-xs text-center font-bold outline-none transition-all ${
                          set.completed 
                            ? 'border-transparent text-emerald-400 bg-transparent' 
                            : 'border-slate-800 dark:border-slate-800 light:border-slate-200 focus:border-indigo-500 text-white dark:text-white light:text-slate-900'
                        }`}
                      />
                      <span className="absolute right-2.5 text-[9px] font-semibold text-slate-600 uppercase pointer-events-none">
                        kg
                      </span>
                    </div>

                    {/* Reps Input */}
                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="10"
                        value={set.reps}
                        disabled={set.completed}
                        onChange={(e) => handleUpdateSetField(exIdx, setIdx, 'reps', e.target.value)}
                        className={`w-full bg-slate-950/60 dark:bg-slate-950/60 light:bg-white border rounded-xl py-1.5 px-2 text-xs text-center font-bold outline-none transition-all ${
                          set.completed 
                            ? 'border-transparent text-emerald-400 bg-transparent' 
                            : 'border-slate-800 dark:border-slate-800 light:border-slate-200 focus:border-indigo-500 text-white dark:text-white light:text-slate-900'
                        }`}
                      />
                    </div>

                    {/* Status Checkmark */}
                    <div className="col-span-3 text-right pr-1">
                      <button
                        onClick={() => handleToggleSet(exIdx, setIdx)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer inline-flex items-center justify-center ${
                          set.completed
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'border-slate-800 hover:border-slate-700 text-slate-600 hover:text-slate-400 hover:bg-slate-800/30'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Extra Set */}
              <button
                onClick={() => handleAddExtraSet(exIdx)}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 py-2.5 rounded-2xl border border-dashed border-slate-800 hover:border-indigo-500/40 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Série Extra</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Cancel Workout trigger */}
      <div className="pt-4 text-center">
        <button
          onClick={() => {
            if (window.confirm('Tem certeza de que deseja cancelar este treino? Os dados correntes serão perdidos.')) {
              clearDraft(sheet.id);
              onCancel();
            }
          }}
          className="text-xs text-rose-500 hover:text-rose-400 font-bold border border-rose-500/10 bg-rose-500/5 hover:bg-rose-500/10 px-5 py-2.5 rounded-2xl transition-colors"
        >
          Cancelar Sessão de Treino
        </button>
      </div>

      {/* --- FLOATING REST TIMER OVERLAY --- */}
      {activeTimerDuration !== null && (
        <Timer 
          duration={activeTimerDuration} 
          onClose={() => setActiveTimerDuration(null)} 
        />
      )}

      {/* --- YOUTUBE DEMO EMBED MODAL --- */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl glass-card border border-rose-500/15 overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-850 bg-slate-900/60">
              <span className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wide">
                <Video className="w-4 h-4 text-rose-500" />
                Demonstração Técnica
              </span>
              <button 
                onClick={() => setActiveVideoUrl(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video container */}
            <div className="relative aspect-video w-full bg-black">
              {getYouTubeEmbedUrl(activeVideoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideoUrl)}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
                  <p className="text-xs text-slate-400 mb-4">Link inválido para incorporação automática do player.</p>
                  <a 
                    href={activeVideoUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-bold text-white transition-colors"
                  >
                    Abrir no YouTube Externo
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
