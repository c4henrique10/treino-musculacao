import React from 'react';
import { 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  LogOut, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff, 
  User 
} from 'lucide-react';
import { isSupabaseConfigured } from '../supabase';

export default function Navigation({ activeTab, setActiveTab, user, onLogout, isDarkMode, setIsDarkMode }) {
  const tabs = [
    { id: 'dashboard', name: 'Painel', icon: Calendar },
    { id: 'sheets', name: 'Treinos', icon: Dumbbell },
    { id: 'progress', name: 'Progresso', icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col md:flex-row">
      {/* --- DESKTOP SIDEBAR --- */}
      {/* Fixed so it doesn't take up in-flow height next to the main content
          area (which is a block sibling in App.jsx, not a flex row) — without
          this, the sidebar's own min-h-screen pushed the real page content
          down by a full viewport height. */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:z-30 flex-col w-64 glass-card border-r border-slate-800 p-6 justify-between shrink-0">
        <div>
          {/* Logo & Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white dark:text-white light:text-slate-900">
                Antigravity Fit
              </h1>
              <span className="text-xs text-indigo-400 font-medium tracking-wide uppercase">
                Workout Tracker
              </span>
            </div>
          </div>

          {/* Sync Status Banner */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-6 font-medium ${
            isSupabaseConfigured 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {isSupabaseConfigured ? (
              <>
                <Wifi className="w-3.5 h-3.5 animate-pulse" />
                <span>Nuvem Supabase Ativa</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Modo Local Offline</span>
              </>
            )}
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id || (tab.id === 'sheets' && activeTab === 'execution');
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 light:text-slate-500'}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile / Bottom Controls */}
        <div className="space-y-4 pt-6 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <div className="bg-slate-800 dark:bg-slate-800 light:bg-slate-200 p-2 rounded-full text-slate-300 dark:text-slate-300 light:text-slate-700">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white dark:text-white light:text-slate-900 truncate">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Theme & Logout Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-800 hover:bg-slate-800/50 light:border-slate-200 light:hover:bg-slate-100 text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900 text-xs font-semibold"
              title="Alternar Tema"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Escuro</span>
                </>
              )}
            </button>
            
            <button
              onClick={onLogout}
              className="flex items-center justify-center p-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* --- MOBILE NAVIGATION (HEADER + BOTTOM BAR) --- */}
      {/* No min-h-screen here: this is chrome only (header + fixed bottom
          nav), not a content container — the real page content is a
          separate sibling rendered by App.jsx. Forcing this to full-viewport
          height pushed that real content a whole screen down. */}
      <div className="flex md:hidden flex-col w-full bg-slate-950 dark:bg-slate-950 light:bg-slate-50">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-4 glass-card border-b border-slate-800/60 dark:border-slate-800/60 light:border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-md">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-base text-white dark:text-white light:text-slate-900 leading-tight">
              Antigravity Fit
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase status circle indicator */}
            <span 
              className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}
              title={isSupabaseConfigured ? 'Supabase ativo' : 'Salvar offline (Local)'}
            />
            
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-300"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Bottom Nav Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 dark:bg-slate-900/90 light:bg-slate-100/90 backdrop-blur-xl border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200/80 flex items-center justify-around py-2.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (tab.id === 'sheets' && activeTab === 'execution');
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive 
                    ? 'text-indigo-500 dark:text-indigo-400 scale-105' 
                    : 'text-slate-500 dark:text-slate-500 light:text-slate-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-bold tracking-wide uppercase">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
