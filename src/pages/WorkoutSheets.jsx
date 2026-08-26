import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Edit3, 
  Save, 
  X, 
  Video, 
  ArrowLeft,
  Dumbbell
} from 'lucide-react';
import { 
  getWorkoutSheets, 
  createWorkoutSheet, 
  deleteWorkoutSheet, 
  saveWorkoutSheetWithExercises 
} from '../supabase';

export default function WorkoutSheets() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit mode states
  const [editingSheet, setEditingSheet] = useState(null); // holds the sheet structure when editing
  const [sheetName, setSheetName] = useState('');
  const [sheetDescription, setSheetDescription] = useState('');
  const [exercisesList, setExercisesList] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSheets();
  }, []);

  async function loadSheets() {
    setLoading(true);
    try {
      const data = await getWorkoutSheets();
      setSheets(data);
    } catch (e) {
      console.error('Error loading sheets', e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateSheet = async () => {
    try {
      const newSheet = await createWorkoutSheet('Nova Ficha', 'Descrição da ficha');
      setSheets([...sheets, newSheet]);
      handleStartEdit(newSheet);
    } catch (e) {
      console.error('Error creating sheet', e);
    }
  };

  const handleDeleteSheet = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza de que deseja deletar esta ficha de treino?')) return;
    try {
      await deleteWorkoutSheet(id);
      setSheets(sheets.filter(s => s.id !== id));
      if (editingSheet && editingSheet.id === id) {
        setEditingSheet(null);
      }
    } catch (e) {
      console.error('Error deleting sheet', e);
    }
  };

  const handleStartEdit = (sheet) => {
    setEditingSheet(sheet);
    setSheetName(sheet.name);
    setSheetDescription(sheet.description || '');
    setExercisesList(
      sheet.exercises ? JSON.parse(JSON.stringify(sheet.exercises)) : []
    );
  };

  const handleAddExercise = () => {
    setExercisesList([
      ...exercisesList,
      {
        id: 'new-' + Math.random().toString(36).substr(2, 9),
        name: '',
        target_sets: 4,
        target_reps: 10,
        rest_seconds: 90,
        youtube_url: ''
      }
    ]);
  };

  const handleRemoveExercise = (idx) => {
    const list = [...exercisesList];
    list.splice(idx, 1);
    setExercisesList(list);
  };

  const handleUpdateExerciseField = (idx, field, val) => {
    const list = [...exercisesList];
    list[idx][field] = val;
    setExercisesList(list);
  };

  const handleMoveExercise = (idx, direction) => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === exercisesList.length - 1) return;

    const list = [...exercisesList];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;
    setExercisesList(list);
  };

  const handleSaveSheet = async () => {
    if (!sheetName.trim()) {
      alert('O nome da ficha é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      await saveWorkoutSheetWithExercises(editingSheet.id, sheetName, sheetDescription, exercisesList);
      setEditingSheet(null);
      await loadSheets();
    } catch (e) {
      console.error('Error saving sheet', e);
      alert('Erro ao salvar o treino.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !editingSheet) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- RENDERING EDIT SHEET VIEW ---
  if (editingSheet) {
    return (
      <div className="space-y-6 max-w-lg mx-auto pb-10">
        
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setEditingSheet(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white font-semibold text-xs py-1.5 pr-3 pl-1 bg-slate-900 border border-slate-800 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          
          <button
            onClick={handleSaveSheet}
            disabled={saving}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold py-1.5 px-3.5 rounded-xl text-xs shadow-lg shadow-indigo-600/20"
          >
            {saving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar
          </button>
        </div>

        {/* Sheet Title and Description Editing */}
        <div className="glass-card rounded-3xl border border-slate-800 p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
            Detalhes do Treino
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nome do Treino (ex: Pull A)"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-full bg-slate-950/60 dark:bg-slate-950/60 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-300 focus:border-indigo-500 rounded-2xl py-3 px-4 text-sm font-bold text-white dark:text-white light:text-slate-900 placeholder-slate-500 outline-none"
            />
            <textarea
              placeholder="Descrição ou observações adicionais"
              value={sheetDescription}
              onChange={(e) => setSheetDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950/60 dark:bg-slate-950/60 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-300 focus:border-indigo-500 rounded-2xl py-3 px-4 text-xs text-white dark:text-white light:text-slate-900 placeholder-slate-500 outline-none resize-none"
            />
          </div>
        </div>

        {/* Exercises Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Exercícios ({exercisesList.length})
            </h3>
            <button
              onClick={handleAddExercise}
              className="flex items-center gap-1 text-xs text-indigo-400 font-bold hover:text-indigo-300 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/15"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Adicionar</span>
            </button>
          </div>

          {exercisesList.length === 0 ? (
            <div className="glass-card rounded-2xl py-8 px-4 text-center text-xs text-slate-500">
              Nenhum exercício cadastrado. Clique em Adicionar acima.
            </div>
          ) : (
            <div className="space-y-3">
              {exercisesList.map((ex, idx) => (
                <div key={ex.id} className="glass-card rounded-2xl border border-slate-800 p-4 relative flex flex-col gap-3">
                  
                  {/* Top Header / Sorting / Trash */}
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-xs font-bold text-slate-500 bg-slate-800/40 w-5 h-5 rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>

                    {/* Controls */}
                    <div className="flex items-center gap-1">
                      {/* Up Arrow */}
                      <button 
                        disabled={idx === 0}
                        onClick={() => handleMoveExercise(idx, 'up')}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      
                      {/* Down Arrow */}
                      <button 
                        disabled={idx === exercisesList.length - 1}
                        onClick={() => handleMoveExercise(idx, 'down')}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Divider */}
                      <span className="w-[1px] h-3.5 bg-slate-800 mx-1" />

                      {/* Trash */}
                      <button 
                        onClick={() => handleRemoveExercise(idx)}
                        className="p-1 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Fields Grid */}
                  <div className="space-y-2">
                    {/* Exercise Name */}
                    <input
                      type="text"
                      placeholder="Nome do Exercício (ex: Supino Reto)"
                      value={ex.name}
                      onChange={(e) => handleUpdateExerciseField(idx, 'name', e.target.value)}
                      className="w-full bg-slate-950/40 dark:bg-slate-950/40 light:bg-white border border-slate-850 dark:border-slate-850 light:border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white dark:text-white light:text-slate-900 placeholder-slate-500 outline-none"
                    />

                    {/* Sets, Reps & Rest Targets */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block pl-1">
                          Séries Alvo
                        </label>
                        <input
                          type="number"
                          placeholder="Séries"
                          value={ex.target_sets}
                          onChange={(e) => handleUpdateExerciseField(idx, 'target_sets', e.target.value)}
                          className="w-full bg-slate-950/40 dark:bg-slate-950/40 light:bg-white border border-slate-850 dark:border-slate-850 light:border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white dark:text-white light:text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block pl-1">
                          Reps Alvo
                        </label>
                        <input
                          type="number"
                          placeholder="Reps"
                          value={ex.target_reps}
                          onChange={(e) => handleUpdateExerciseField(idx, 'target_reps', e.target.value)}
                          className="w-full bg-slate-950/40 dark:bg-slate-950/40 light:bg-white border border-slate-850 dark:border-slate-850 light:border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white dark:text-white light:text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block pl-1">
                          Descanso (s)
                        </label>
                        <input
                          type="number"
                          placeholder="90"
                          value={ex.rest_seconds ?? 90}
                          onChange={(e) => handleUpdateExerciseField(idx, 'rest_seconds', e.target.value)}
                          className="w-full bg-slate-950/40 dark:bg-slate-950/40 light:bg-white border border-slate-850 dark:border-slate-850 light:border-slate-200 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white dark:text-white light:text-slate-900 outline-none"
                        />
                      </div>
                    </div>

                    {/* YouTube URL */}
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        <Video className="w-4 h-4" />
                      </span>
                      <input
                        type="url"
                        placeholder="Link do YouTube para demonstração"
                        value={ex.youtube_url}
                        onChange={(e) => handleUpdateExerciseField(idx, 'youtube_url', e.target.value)}
                        className="w-full bg-slate-950/40 dark:bg-slate-950/40 light:bg-white border border-slate-850 dark:border-slate-850 light:border-slate-200 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white dark:text-white light:text-slate-900 placeholder-slate-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDERING SHEETS LIST VIEW ---
  return (
    <div className="space-y-6 max-w-lg mx-auto pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-white dark:text-white light:text-slate-900 tracking-tight">
            Fichas de Treino
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 light:text-slate-500 mt-0.5 tracking-wide">
            Configure suas divisões de treinos diários.
          </p>
        </div>

        <button
          onClick={handleCreateSheet}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-2xl text-xs shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Ficha</span>
        </button>
      </div>

      {/* Sheets Grid */}
      {sheets.length === 0 ? (
        <div className="glass-card rounded-3xl py-12 px-4 text-center">
          <div className="bg-slate-900 p-4 rounded-full w-fit mx-auto mb-4 text-slate-500">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1">Nenhuma ficha criada</h4>
          <p className="text-xs text-slate-500 max-w-[240px] mx-auto leading-relaxed">
            Clique em "Criar Ficha" acima para começar a organizar sua rotina de musculação.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sheets.map((sheet) => (
            <div 
              key={sheet.id}
              onClick={() => handleStartEdit(sheet)}
              className="glass-card rounded-3xl border border-slate-800/80 p-5 hover:border-indigo-500/40 hover:bg-slate-900/30 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1 pr-4">
                  <h3 className="font-bold text-base text-white dark:text-white light:text-slate-900 leading-tight">
                    {sheet.name}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 line-clamp-2 leading-relaxed">
                    {sheet.description || 'Sem descrição.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleStartEdit(sheet); }}
                    className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteSheet(sheet.id, e)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exercises tags summary */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-850/60 dark:border-slate-850/60 light:border-slate-200">
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                  {sheet.exercises?.length || 0} exercícios
                </span>
                {sheet.exercises?.slice(0, 3).map((ex) => (
                  <span key={ex.id} className="text-[10px] font-medium text-slate-500 dark:text-slate-500 light:text-slate-650 bg-slate-800/30 px-2 py-1 rounded-full">
                    {ex.name.length > 15 ? `${ex.name.substring(0, 15)}...` : ex.name}
                  </span>
                ))}
                {sheet.exercises?.length > 3 && (
                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-800/20 px-2 py-1 rounded-full">
                    +{sheet.exercises.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
