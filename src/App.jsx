import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkoutSheets from './pages/WorkoutSheets';
import WorkoutExecution from './pages/WorkoutExecution';
import Progress from './pages/Progress';
import { getUser, signOut } from './supabase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeWorkoutSheet, setActiveWorkoutSheet] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to Dark Mode

  // 1. Initial auth check
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getUser();
        setUser(currentUser);
      } catch (e) {
        console.error('Auth check failed', e);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // 2. Manage theme classes on root element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLoginSuccess = (userObj) => {
    setUser(userObj);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setActiveTab('dashboard');
      setActiveWorkoutSheet(null);
    } catch (e) {
      console.error('Logout error', e);
    }
  };

  const handleStartWorkout = (sheet) => {
    setActiveWorkoutSheet(sheet);
    setActiveTab('execution');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not logged in, render the login view
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 transition-colors">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      >
        {/* Child views are injected dynamically below depending on activeTab */}
      </Navigation>

      {/* Main View Area (Adjusted for sidebar/desktop vs mobile bottom bar) */}
      <div className="md:pl-64 min-h-screen flex flex-col">
        {/* Header container padding spacing for mobile view headers */}
        <div className="flex-1 px-4 py-6 md:p-8 max-w-5xl w-full mx-auto pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              user={user} 
              onStartWorkout={handleStartWorkout}
              navigateToSheets={() => setActiveTab('sheets')}
            />
          )}

          {activeTab === 'sheets' && (
            <WorkoutSheets />
          )}

          {activeTab === 'execution' && activeWorkoutSheet && (
            <WorkoutExecution 
              sheet={activeWorkoutSheet}
              onCancel={() => {
                setActiveWorkoutSheet(null);
                setActiveTab('dashboard');
              }}
              onFinish={() => {
                setActiveWorkoutSheet(null);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'progress' && (
            <Progress />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
