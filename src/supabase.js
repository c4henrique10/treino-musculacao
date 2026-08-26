import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are provided
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');

// Initialize client if configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

console.log(
  isSupabaseConfigured 
    ? '⚡ Supabase connected successfully.' 
    : 'ℹ️ Supabase environment variables missing. Falling back to LocalStorage Mock Mode.'
);

// --- INITIAL SEED DATA FOR LOCAL STORAGE MOCK MODE ---
const initialSheets = [
  {
    id: 'sheet-pull-1',
    name: 'Pull (Costas e Bíceps)',
    description: 'Foco em puxadas verticais e horizontais, além de bíceps.',
    exercises: [
      { id: 'ex-pull-1', name: 'Barra Fixa ou Pulldown', target_sets: 4, target_reps: 8, youtube_url: 'https://www.youtube.com/watch?v=eGo4IYlbE5g', order_index: 0 },
      { id: 'ex-pull-2', name: 'Remada Curvada', target_sets: 3, target_reps: 10, youtube_url: 'https://www.youtube.com/watch?v=jk3aRz6n07Y', order_index: 1 },
      { id: 'ex-pull-3', name: 'Rosca Direta HBL', target_sets: 3, target_reps: 12, youtube_url: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo', order_index: 2 },
      { id: 'ex-pull-4', name: 'Rosca Martelo Halteres', target_sets: 3, target_reps: 10, youtube_url: 'https://www.youtube.com/watch?v=zC3nLl5yA4Y', order_index: 3 }
    ]
  },
  {
    id: 'sheet-push-1',
    name: 'Push (Peito, Ombro e Tríceps)',
    description: 'Foco em empurrar, desenvolvimento e tríceps.',
    exercises: [
      { id: 'ex-push-1', name: 'Supino Reto Halteres', target_sets: 4, target_reps: 10, youtube_url: 'https://www.youtube.com/watch?v=q9PHgZf4g54', order_index: 0 },
      { id: 'ex-push-2', name: 'Desenvolvimento Militar', target_sets: 3, target_reps: 8, youtube_url: 'https://www.youtube.com/watch?v=2yjwXTZQDDI', order_index: 1 },
      { id: 'ex-push-3', name: 'Elevação Lateral', target_sets: 4, target_reps: 12, youtube_url: 'https://www.youtube.com/watch?v=3VcKaXatLD0', order_index: 2 },
      { id: 'ex-push-4', name: 'Tríceps Testa Polia', target_sets: 3, target_reps: 12, youtube_url: 'https://www.youtube.com/watch?v=tI9S007C-wM', order_index: 3 }
    ]
  },
  {
    id: 'sheet-legs-1',
    name: 'Legs (Quadríceps e Posterior)',
    description: 'Membros inferiores completos com foco em progressão.',
    exercises: [
      { id: 'ex-legs-1', name: 'Agachamento Livre', target_sets: 4, target_reps: 8, youtube_url: 'https://www.youtube.com/watch?v=Uv_K1T7sC8c', order_index: 0 },
      { id: 'ex-legs-2', name: 'Leg Press 45', target_sets: 3, target_reps: 10, youtube_url: 'https://www.youtube.com/watch?v=q60Pj32Yf3g', order_index: 1 },
      { id: 'ex-legs-3', name: 'Cadeira Extensora', target_sets: 3, target_reps: 12, youtube_url: 'https://www.youtube.com/watch?v=Jm3Uo1v9v7Q', order_index: 2 },
      { id: 'ex-legs-4', name: 'Mesa Flexora', target_sets: 4, target_reps: 10, youtube_url: 'https://www.youtube.com/watch?v=aG3m0iUqO_w', order_index: 3 }
    ]
  }
];

const initialLogs = [
  // Seed load history for progression graphs
  {
    id: 'log-1',
    workout_sheet_id: 'sheet-push-1',
    workout_sheet_name: 'Push (Peito, Ombro e Tríceps)',
    completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    duration_seconds: 2800,
    set_logs: [
      { exercise_id: 'ex-push-1', exercise_name: 'Supino Reto Halteres', set_number: 1, weight: 22, reps: 10, completed: true },
      { exercise_id: 'ex-push-1', exercise_name: 'Supino Reto Halteres', set_number: 2, weight: 22, reps: 10, completed: true },
      { exercise_id: 'ex-push-1', exercise_name: 'Supino Reto Halteres', set_number: 3, weight: 22, reps: 9, completed: true },
      { exercise_id: 'ex-push-2', exercise_name: 'Desenvolvimento Militar', set_number: 1, weight: 14, reps: 8, completed: true },
      { exercise_id: 'ex-push-2', exercise_name: 'Desenvolvimento Militar', set_number: 2, weight: 14, reps: 8, completed: true }
    ]
  },
  {
    id: 'log-2',
    workout_sheet_id: 'sheet-push-1',
    workout_sheet_name: 'Push (Peito, Ombro e Tríceps)',
    completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    duration_seconds: 3100,
    set_logs: [
      { exercise_id: 'ex-push-1', exercise_name: 'Supino Reto Halteres', set_number: 1, weight: 24, reps: 10, completed: true },
      { exercise_id: 'ex-push-1', exercise_name: 'Supino Reto Halteres', set_number: 2, weight: 24, reps: 10, completed: true },
      { exercise_id: 'ex-push-1', exercise_name: 'Supino Reto Halteres', set_number: 3, weight: 24, reps: 8, completed: true },
      { exercise_id: 'ex-push-2', exercise_name: 'Desenvolvimento Militar', set_number: 1, weight: 16, reps: 8, completed: true },
      { exercise_id: 'ex-push-2', exercise_name: 'Desenvolvimento Militar', set_number: 2, weight: 16, reps: 7, completed: true }
    ]
  }
];

const initializeMockDb = () => {
  if (!localStorage.getItem('workout_sheets')) {
    localStorage.setItem('workout_sheets', JSON.stringify(initialSheets));
  }
  if (!localStorage.getItem('workout_logs')) {
    localStorage.setItem('workout_logs', JSON.stringify(initialLogs));
  }
  if (!localStorage.getItem('mock_user')) {
    localStorage.setItem('mock_user', JSON.stringify({
      id: 'mock-user-123',
      email: 'treino@exemplo.com',
      full_name: 'Atleta Antigravity'
    }));
  }
};

initializeMockDb();

// --- AUTH ACTIONS ---

// Normalizes a Supabase auth user (which only carries full_name inside
// user_metadata) into the same flat shape used by the LocalStorage mock user,
// so Dashboard/Navigation can read `user.full_name` regardless of the mode.
const normalizeSupabaseUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || user.email
  };
};

export const signUp = async (email, password, fullName) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    if (error) throw error;

    // Create profile
    if (data?.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        username: email.split('@')[0]
      });
    }
    return normalizeSupabaseUser(data.user);
  } else {
    // Mock Signup
    const mockUser = { id: 'mock-user-' + Math.random().toString(36).substr(2, 9), email, full_name: fullName };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    return mockUser;
  }
};

export const signIn = async (email, password) => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return normalizeSupabaseUser(data.user);
  } else {
    // Mock Login
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === email) return user;
    }
    // Seed and return
    const defaultUser = { id: 'mock-user-123', email, full_name: 'Atleta Antigravity' };
    localStorage.setItem('mock_user', JSON.stringify(defaultUser));
    return defaultUser;
  }
};

export const signOut = async () => {
  if (isSupabaseConfigured) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } else {
    localStorage.removeItem('mock_user');
  }
};

export const resetPassword = async (email) => {
  if (isSupabaseConfigured) {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    return true;
  } else {
    // Honest fallback: LocalStorage Mock Mode has no real e-mail delivery,
    // so there is nothing to actually reset. Never pretend success here.
    throw new Error('A redefinição de senha por e-mail exige credenciais do Supabase configuradas. No modo de demonstração, não há e-mail real para enviar o link.');
  }
};

export const getUser = async () => {
  if (isSupabaseConfigured) {
    const { data: { user } } = await supabase.auth.getUser();
    return normalizeSupabaseUser(user);
  } else {
    const storedUser = localStorage.getItem('mock_user');
    return storedUser ? JSON.parse(storedUser) : null;
  }
};

// --- DATA ACCESS ACTIONS ---

export const getWorkoutSheets = async () => {
  if (isSupabaseConfigured) {
    const { data: sheets, error } = await supabase
      .from('workout_sheets')
      .select(`
        id,
        name,
        description,
        exercises (
          id,
          name,
          target_sets,
          target_reps,
          rest_seconds,
          youtube_url,
          order_index
        )
      `)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    // Sort exercises in each sheet
    return (sheets || []).map(sheet => ({
      ...sheet,
      exercises: (sheet.exercises || []).sort((a, b) => a.order_index - b.order_index)
    }));
  } else {
    // LocalStorage
    return JSON.parse(localStorage.getItem('workout_sheets') || '[]');
  }
};

export const createWorkoutSheet = async (name, description = '') => {
  if (isSupabaseConfigured) {
    const userObj = await getUser();
    const { data, error } = await supabase
      .from('workout_sheets')
      .insert([{ user_id: userObj.id, name, description }])
      .select()
      .single();

    if (error) throw error;
    return { ...data, exercises: [] };
  } else {
    const sheets = JSON.parse(localStorage.getItem('workout_sheets') || '[]');
    const newSheet = {
      id: 'sheet-' + Math.random().toString(36).substr(2, 9),
      name,
      description,
      exercises: []
    };
    sheets.push(newSheet);
    localStorage.setItem('workout_sheets', JSON.stringify(sheets));
    return newSheet;
  }
};

export const deleteWorkoutSheet = async (id) => {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('workout_sheets')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } else {
    let sheets = JSON.parse(localStorage.getItem('workout_sheets') || '[]');
    sheets = sheets.filter(sheet => sheet.id !== id);
    localStorage.setItem('workout_sheets', JSON.stringify(sheets));
    return true;
  }
};

export const saveWorkoutSheetWithExercises = async (sheetId, name, description, exercisesList) => {
  if (isSupabaseConfigured) {
    // 1. Update Sheet
    const { error: sheetError } = await supabase
      .from('workout_sheets')
      .update({ name, description })
      .eq('id', sheetId);

    if (sheetError) throw sheetError;

    // 2. Capture the exercises that exist today so we know what to remove
    // once the new list is safely in. We deliberately insert BEFORE
    // deleting: if the insert below fails, the ficha keeps its previous
    // exercises instead of being left empty.
    const { data: existingExercises, error: fetchError } = await supabase
      .from('exercises')
      .select('id')
      .eq('workout_sheet_id', sheetId);

    if (fetchError) throw fetchError;
    const oldExerciseIds = (existingExercises || []).map(ex => ex.id);

    // 3. Insert the updated list
    if (exercisesList.length > 0) {
      const dbExercises = exercisesList.map((ex, idx) => ({
        workout_sheet_id: sheetId,
        name: ex.name,
        target_sets: parseInt(ex.target_sets || 4),
        target_reps: parseInt(ex.target_reps || 10),
        rest_seconds: parseInt(ex.rest_seconds) || 90,
        youtube_url: ex.youtube_url || '',
        order_index: idx
      }));

      const { error: insertError } = await supabase
        .from('exercises')
        .insert(dbExercises);

      if (insertError) throw insertError;
    }

    // 4. Only now remove the previous exercises, targeting the exact ids
    // captured in step 2 (never by workout_sheet_id) so the rows just
    // inserted above are never touched. If this step fails, the ficha ends
    // up with duplicated exercises — recoverable by saving again — instead
    // of silently losing data.
    if (oldExerciseIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .in('id', oldExerciseIds);

      if (deleteError) throw deleteError;
    }

    return true;
  } else {
    // LocalStorage
    const sheets = JSON.parse(localStorage.getItem('workout_sheets') || '[]');
    const sheetIdx = sheets.findIndex(s => s.id === sheetId);
    if (sheetIdx !== -1) {
      sheets[sheetIdx].name = name;
      sheets[sheetIdx].description = description;
      sheets[sheetIdx].exercises = exercisesList.map((ex, idx) => ({
        id: ex.id || 'ex-' + Math.random().toString(36).substr(2, 9),
        name: ex.name,
        target_sets: parseInt(ex.target_sets || 4),
        target_reps: parseInt(ex.target_reps || 10),
        rest_seconds: parseInt(ex.rest_seconds) || 90,
        youtube_url: ex.youtube_url || '',
        order_index: idx
      }));
      localStorage.setItem('workout_sheets', JSON.stringify(sheets));
    }
    return true;
  }
};

// --- LOGGING ACTIONS ---

export const getWorkoutLogs = async () => {
  if (isSupabaseConfigured) {
    const { data: logs, error } = await supabase
      .from('workout_logs')
      .select(`
        id,
        workout_sheet_id,
        workout_sheet_name,
        completed_at,
        duration_seconds,
        set_logs (
          id,
          exercise_name,
          exercise_id,
          set_number,
          weight,
          reps,
          completed
        )
      `)
      .order('completed_at', { ascending: false });

    if (error) throw error;
    return logs || [];
  } else {
    return JSON.parse(localStorage.getItem('workout_logs') || '[]');
  }
};

export const saveWorkoutLog = async (sheetId, sheetName, durationSeconds, setLogsList) => {
  if (isSupabaseConfigured) {
    const userObj = await getUser();
    
    // 1. Save Workout Log
    const { data: workoutLog, error: logError } = await supabase
      .from('workout_logs')
      .insert([{
        user_id: userObj.id,
        workout_sheet_id: sheetId,
        workout_sheet_name: sheetName,
        duration_seconds: durationSeconds
      }])
      .select()
      .single();

    if (logError) throw logError;

    // 2. Save Set Logs
    if (setLogsList.length > 0) {
      const dbSets = setLogsList.map(set => ({
        workout_log_id: workoutLog.id,
        exercise_name: set.exercise_name,
        exercise_id: set.exercise_id || null,
        set_number: set.set_number,
        weight: parseFloat(set.weight || 0),
        reps: parseInt(set.reps || 0),
        completed: set.completed
      }));

      const { error: setsError } = await supabase
        .from('set_logs')
        .insert(dbSets);

      if (setsError) throw setsError;
    }
    return true;
  } else {
    const logs = JSON.parse(localStorage.getItem('workout_logs') || '[]');
    const newLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      workout_sheet_id: sheetId,
      workout_sheet_name: sheetName,
      completed_at: new Date().toISOString(),
      duration_seconds: durationSeconds,
      set_logs: setLogsList.map(set => ({
        id: 'set-' + Math.random().toString(36).substr(2, 9),
        exercise_name: set.exercise_name,
        exercise_id: set.exercise_id,
        set_number: set.set_number,
        weight: parseFloat(set.weight || 0),
        reps: parseInt(set.reps || 0),
        completed: set.completed
      }))
    };
    logs.unshift(newLog);
    localStorage.setItem('workout_logs', JSON.stringify(logs));
    return true;
  }
};
