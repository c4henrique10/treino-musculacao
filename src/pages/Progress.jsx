import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Award, 
  Flame, 
  Calendar, 
  BarChart3,
  Dumbbell
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { getWorkoutLogs } from '../supabase';

export default function Progress() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exerciseNames, setExerciseNames] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const fetchedLogs = await getWorkoutLogs();
        setLogs(fetchedLogs);
        
        // Extract unique exercise names
        const namesSet = new Set();
        fetchedLogs.forEach(log => {
          log.set_logs?.forEach(set => {
            if (set.completed && set.exercise_name) {
              namesSet.add(set.exercise_name);
            }
          });
        });
        
        const sortedNames = Array.from(namesSet).sort();
        setExerciseNames(sortedNames);
        
        if (sortedNames.length > 0) {
          setSelectedExercise(sortedNames[0]);
        }
      } catch (e) {
        console.error('Error loading history logs', e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Generate data points for chart
  const getProgressionData = () => {
    if (!selectedExercise) return [];
    
    // Filter and sort chronologically (oldest to newest)
    const points = [];
    
    // Sort logs ascending for time series graph
    const chronologicalLogs = [...logs].sort(
      (a, b) => new Date(a.completed_at) - new Date(b.completed_at)
    );

    chronologicalLogs.forEach(log => {
      const setsOfExercise = log.set_logs?.filter(
        s => s.exercise_name.toLowerCase() === selectedExercise.toLowerCase() && s.completed
      ) || [];
      
      if (setsOfExercise.length > 0) {
        // Find max weight in this workout
        const maxWeight = Math.max(...setsOfExercise.map(s => s.weight || 0));
        
        // Find corresponding reps for max weight (first match)
        const correspondingRepObj = setsOfExercise.find(s => s.weight === maxWeight);
        const reps = correspondingRepObj ? correspondingRepObj.reps : 0;
        
        points.push({
          date: new Date(log.completed_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          dateFull: new Date(log.completed_at).toLocaleDateString('pt-BR'),
          weight: maxWeight,
          reps: reps,
          // 1-Rep Max estimation using Epley formula: w * (1 + r/30)
          est1RM: Math.round(maxWeight * (1 + reps / 30) * 10) / 10
        });
      }
    });

    return points;
  };

  const chartData = getProgressionData();

  // Stats calculation
  const getStats = () => {
    if (chartData.length === 0) return { pr: 0, maxVolume: 0, pr1RM: 0 };
    
    const pr = Math.max(...chartData.map(d => d.weight));
    const pr1RM = Math.max(...chartData.map(d => d.est1RM));
    
    // Find all reps matching max weight
    const prPoints = chartData.filter(d => d.weight === pr);
    const maxRepsAtPR = Math.max(...prPoints.map(p => p.reps));

    return {
      pr,
      maxVolume: maxRepsAtPR,
      pr1RM
    };
  };

  const { pr, maxVolume, pr1RM } = getStats();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-xl">
          <p className="text-[10px] font-bold text-indigo-400 mb-1">{payload[0].payload.dateFull}</p>
          <p className="text-xs text-white font-semibold">Carga Máxima: <span className="font-black text-indigo-300">{payload[0].value} kg</span></p>
          <p className="text-[10px] text-slate-400 mt-0.5">Série correspondente: {payload[0].payload.reps} reps</p>
          <p className="text-[10px] text-emerald-400 mt-1 font-bold">1RM Estimado: {payload[0].payload.est1RM} kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-10">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
          Análise de Progresso
        </h2>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5 tracking-wide">
          Acompanhe o ganho de força e cargas por exercício.
        </p>
      </div>

      {exerciseNames.length === 0 ? (
        <div className="glass-card rounded-3xl py-12 px-4 text-center">
          <div className="bg-slate-900 p-4 rounded-full w-fit mx-auto mb-4 text-slate-500">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1">Sem dados de progresso</h4>
          <p className="text-xs text-slate-500 max-w-[260px] mx-auto leading-relaxed">
            Realize e complete pelo menos uma série em um exercício para começar a gerar estatísticas.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dropdown Selection */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 light:text-slate-600 uppercase tracking-wider mb-1.5 block pl-1">
              Selecione o Exercício
            </label>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 focus:border-indigo-500 rounded-2xl py-3 px-4 text-sm text-white dark:text-white light:text-slate-900 outline-none"
            >
              {exerciseNames.map(name => (
                <option key={name} value={name} className="bg-slate-950 text-white">
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* PR / 1RM Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* PR Card */}
            <div className="glass-card rounded-2xl p-3 flex flex-col justify-between h-[100px]">
              <div className="bg-indigo-500/10 p-1.5 rounded-lg w-fit text-indigo-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-black text-white dark:text-white light:text-slate-900">{pr} kg</div>
                <div className="text-[9px] font-bold text-slate-500 dark:text-slate-500 light:text-slate-600 uppercase tracking-wider">Recorde Pessoal</div>
              </div>
            </div>

            {/* Reps volume card */}
            <div className="glass-card rounded-2xl p-3 flex flex-col justify-between h-[100px]">
              <div className="bg-purple-500/10 p-1.5 rounded-lg w-fit text-purple-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-black text-white dark:text-white light:text-slate-900">{maxVolume} reps</div>
                <div className="text-[9px] font-bold text-slate-500 dark:text-slate-500 light:text-slate-600 uppercase tracking-wider">Reps no PR</div>
              </div>
            </div>

            {/* 1RM Card */}
            <div className="glass-card rounded-2xl p-3 flex flex-col justify-between h-[100px]">
              <div className="bg-emerald-500/10 p-1.5 rounded-lg w-fit text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xl font-black text-white dark:text-white light:text-slate-900">{pr1RM} kg</div>
                <div className="text-[9px] font-bold text-slate-500 dark:text-slate-500 light:text-slate-600 uppercase tracking-wider">1RM Estimado</div>
              </div>
            </div>
          </div>

          {/* Progression Graph */}
          <div className="glass-card rounded-3xl border border-slate-800 p-4">
            <h3 className="text-xs font-bold text-slate-350 dark:text-slate-350 light:text-slate-800 mb-4 uppercase tracking-wider pl-1">
              Curva de Carga Máxima
            </h3>
            
            {chartData.length < 2 ? (
              <div className="h-44 flex flex-col items-center justify-center text-center text-xs text-slate-500 p-4">
                <p>Gráficos requerem dados de pelo menos 2 treinos diferentes para traçar uma curva de evolução.</p>
                <span className="mt-2 text-[10px] text-indigo-400 font-bold bg-indigo-500/5 px-2 py-0.5 rounded-full">
                  Registros atuais: {chartData.length}
                </span>
              </div>
            ) : (
              <div className="h-48 w-full select-none text-[10px] font-semibold text-slate-500">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: -25, right: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      tickLine={false} 
                      axisLine={false} 
                      dy={8}
                    />
                    <YAxis 
                      stroke="#475569" 
                      tickLine={false} 
                      axisLine={false} 
                      dx={-4}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 2, fill: '#0b0f19' }}
                      activeDot={{ r: 6, fill: '#6366f1' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* History list for this specific exercise */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1">
              Histórico de Cargas
            </h3>
            <div className="space-y-2">
              {[...chartData].reverse().map((dataPoint, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-3.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-350 dark:text-slate-350 light:text-slate-750">{dataPoint.dateFull}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-white dark:text-white light:text-slate-900">{dataPoint.weight} kg</span>
                    <span className="text-slate-500 dark:text-slate-500 light:text-slate-600 bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-200/50 px-2.5 py-1 rounded-lg font-bold">
                      {dataPoint.reps} reps
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
