import React, { useState, useEffect } from 'react';
import { Play, Calendar, Trophy, Clock, CheckCircle2, ArrowRight, Activity, Trash2 } from 'lucide-react';
import { getWorkoutSheets, getWorkoutLogs, deleteWorkoutLog } from '../supabase';

export default function Dashboard({ user, onStartWorkout, navigateToSheets }) {
  const [sheets, setSheets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingLogId, setDeletingLogId] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const fetchedSheets = await getWorkoutSheets();
        const fetchedLogs = await getWorkoutLogs();
        setSheets(fetchedSheets);
        setLogs(fetchedLogs);
        
        if (fetchedSheets.length > 0) {
          setSelectedSheetId(fetchedSheets[0].id);
        }
      } catch (e) {
        console.error('Error loading dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const selectedSheet = sheets.find(s => s.id === selectedSheetId);

  // Stats Calculation
  const totalWorkouts = logs.length;
  
  const totalDurationMin = logs.reduce((sum, log) => sum + (log.duration_seconds || 0), 0) / 60;
  const hours = Math.floor(totalDurationMin / 60);
  const minutes = Math.round(totalDurationMin % 60);
  const durationStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;

  // Streak/Consistency (workouts in past 7 days)
  const past7DaysWorkouts = logs.filter(log => {
    const logDate = new Date(log.completed_at);
    const diffTime = Math.abs(new Date() - logDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  }).length;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDeleteLog = async (e, logId, sheetName) => {
    e.stopPropagation();
    if (!window.confirm(`Tem certeza de que deseja excluir o treino "${sheetName}"? Essa ação não pode ser desfeita.`)) return;

    setDeletingLogId(logId);
    try {
      await deleteWorkoutLog(logId);
      setLogs(logs.filter(log => log.id !== logId));
    } catch (e) {
      console.error('Error deleting workout log', e);
      alert('Erro ao excluir o treino.');
    } finally {
      setDeletingLogId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
          Olá, {user.full_name?.split(' ')[0] || 'Atleta'}! 👋
        </h2>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5 tracking-wide">
          Bora treinar hoje? Seu progresso te espera.
        </p>
      </div>

      {/* Grid Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {/* Stat 1 */}
        <div className="glass-card rounded-2xl p-3 flex flex-col justify-between h-[105px] relative overflow-hidden">
          <div className="bg-indigo-500/10 p-1.5 rounded-lg w-fit text-indigo-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-white dark:text-white light:text-slate-900">{totalWorkouts}</div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-500 light:text-slate-600 uppercase tracking-wider mt-0.5">Treinos</div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card rounded-2xl p-3 flex flex-col justify-between h-[105px]">
          <div className="bg-emerald-500/10 p-1.5 rounded-lg w-fit text-emerald-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-white dark:text-white light:text-slate-900 truncate leading-none mb-1">{durationStr}</div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-500 light:text-slate-600 uppercase tracking-wider">Tempo</div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card rounded-2xl p-3 flex flex-col justify-between h-[105px]">
          <div className="bg-purple-500/10 p-1.5 rounded-lg w-fit text-purple-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-2xl font-black text-white dark:text-white light:text-slate-900">{past7DaysWorkouts}/7</div>
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-500 light:text-slate-600 uppercase tracking-wider mt-0.5">Freq. Semanal</div>
          </div>
        </div>
      </div>

      {/* Action / Workout Sheet Selector */}
      <div className="glass-card rounded-3xl border border-slate-800/80 p-5 relative overflow-hidden">
        {/* Subtle glowing radial background */}
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

        <h3 className="text-sm font-bold text-slate-300 dark:text-slate-300 light:text-slate-800 mb-4 flex items-center gap-2">
          <Play className="w-4.5 h-4.5 text-indigo-400 fill-current" />
          <span>Treino de Hoje</span>
        </h3>

        {sheets.length === 0 ? (
          <div className="text-center py-6 px-4">
            <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-500 mb-4 leading-relaxed">
              Você ainda não tem fichas de treino criadas. Crie a primeira para iniciar o registro!
            </p>
            <button
              onClick={navigateToSheets}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-5 rounded-2xl shadow-lg shadow-indigo-600/20 text-xs transition-colors"
            >
              <span>Criar Ficha de Treino</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 light:text-slate-600 uppercase tracking-wider mb-1.5 block">
                Escolha a ficha de treino
              </label>
              <select
                value={selectedSheetId}
                onChange={(e) => setSelectedSheetId(e.target.value)}
                className="w-full bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 focus:border-indigo-500 rounded-2xl py-3 px-4 text-sm text-white dark:text-white light:text-slate-900 outline-none"
              >
                {sheets.map(sheet => (
                  <option key={sheet.id} value={sheet.id} className="bg-slate-950 text-white">
                    {sheet.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedSheet && (
              <div className="bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-100/60 border border-slate-800/40 dark:border-slate-800/40 light:border-slate-200/50 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white dark:text-white light:text-slate-900 leading-tight">
                    {selectedSheet.name}
                  </h4>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {selectedSheet.description || 'Nenhuma descrição informada.'}
                  </p>
                  <div className="flex gap-4 mt-3">
                    <span className="text-xs text-indigo-400 font-semibold">
                      {selectedSheet.exercises?.length || 0} exercícios
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      ~{(selectedSheet.exercises?.length || 0) * 12} min duração
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onStartWorkout(selectedSheet)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all text-xs mt-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Este Treino</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Activity Timeline */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-500 light:text-slate-600 uppercase tracking-wider pl-1">
          Atividades Recentes
        </h3>
        {logs.length === 0 ? (
          <div className="glass-card rounded-2xl p-5 text-center text-xs text-slate-500">
            Nenhum treino registrado ainda. Seu histórico aparecerá aqui.
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.slice(0, 4).map((log) => {
              const totalSetsCount = log.set_logs?.filter(s => s.completed).length || 0;
              return (
                <div key={log.id} className="glass-card rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500/10 p-2 rounded-xl text-indigo-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white dark:text-white light:text-slate-900 leading-tight">
                        {log.workout_sheet_name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-500 light:text-slate-600 font-semibold mt-1">
                        <span>{formatDate(log.completed_at)} às {getDayName(log.completed_at)}</span>
                        <span>•</span>
                        <span>{Math.round(log.duration_seconds / 60)} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      {totalSetsCount} séries
                    </span>
                    <button
                      onClick={(e) => handleDeleteLog(e, log.id, log.workout_sheet_name)}
                      disabled={deletingLogId === log.id}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-50 transition-colors"
                      title="Excluir treino"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
