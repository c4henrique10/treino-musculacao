import React, { useState } from 'react';
import { Dumbbell, Mail, Lock, User, AlertCircle, WifiOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { signIn, signUp, resetPassword, isSupabaseConfigured } from '../supabase';

export default function Login({ onLoginSuccess }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLoginTab && !fullName)) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }
    
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLoginTab) {
        const user = await signIn(email, password);
        setSuccessMsg('Login realizado com sucesso!');
        setTimeout(() => onLoginSuccess(user), 600);
      } else {
        const user = await signUp(email, password, fullName);
        setSuccessMsg(
          isSupabaseConfigured 
            ? 'Cadastro realizado! Verifique seu e-mail de confirmação ou faça login.' 
            : 'Conta de demonstração criada!'
        );
        if (!isSupabaseConfigured) {
          setTimeout(() => onLoginSuccess(user), 1000);
        } else {
          setIsLoginTab(true);
          setLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro no processamento.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Informe seu e-mail para receber o link de redefinição.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccessMsg('Se este e-mail estiver cadastrado, enviamos um link para redefinir sua senha. Confira sua caixa de entrada.');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Não foi possível enviar o link de redefinição.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 dark:bg-slate-950 light:bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        
        {/* App Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 p-3.5 rounded-2xl shadow-xl shadow-indigo-600/30 mb-3.5">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white dark:text-white light:text-slate-900 tracking-tight leading-tight">
            Antigravity Fit
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-500 mt-1 font-medium text-center max-w-[280px]">
            Registre seus treinos de forma ágil, direta e sem fricção.
          </p>
        </div>

        {/* Form Container */}
        <div className="glass-card rounded-3xl border border-slate-800/80 p-7 shadow-2xl relative overflow-hidden">
          
          {/* Top border light indicator */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

          {/* Offline/Mock Mode alert */}
          {!isSupabaseConfigured && (
            <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-2xl text-xs mb-6 font-medium">
              <WifiOff className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Modo de Demonstração Ativo:</span>
                <p className="opacity-90 mt-0.5">As credenciais do Supabase não foram configuradas. Você pode fazer login/cadastro com qualquer dado de teste.</p>
              </div>
            </div>
          )}

          {/* Form Tabs */}
          {!showForgotPassword && (
            <div className="flex bg-slate-900/50 dark:bg-slate-900/50 light:bg-slate-200/50 p-1.5 rounded-2xl mb-7">
              <button
                onClick={() => { setIsLoginTab(true); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isLoginTab
                    ? 'bg-slate-800 text-white shadow-md dark:bg-slate-800 light:bg-white light:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-800'
                }`}
              >
                Entrar
              </button>
              <button
                onClick={() => { setIsLoginTab(false); setErrorMsg(''); setSuccessMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  !isLoginTab
                    ? 'bg-slate-800 text-white shadow-md dark:bg-slate-800 light:bg-white light:text-slate-900'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-800'
                }`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {showForgotPassword && (
            <button
              type="button"
              onClick={() => { setShowForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar para login
            </button>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl text-xs mb-5 font-semibold">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-xs mb-5 font-semibold">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Input Form */}
          {!showForgotPassword && (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full name (only in signup) */}
            {!isLoginTab && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider pl-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 light:text-slate-400">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLoginTab}
                    className="w-full bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-300 focus:border-indigo-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white dark:text-white light:text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider pl-1">
                E-mail
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 light:text-slate-400">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-300 focus:border-indigo-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white dark:text-white light:text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider pl-1">
                Senha
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 light:text-slate-400">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  placeholder="Min. 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-300 focus:border-indigo-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white dark:text-white light:text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-slate-400 outline-none transition-all"
                />
              </div>
              {isLoginTab && (
                <button
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold block ml-auto pt-0.5"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all text-sm mt-3 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{isLoginTab ? 'Entrar no App' : 'Confirmar Cadastro'}</span>
              )}
            </button>
          </form>
          )}

          {/* Forgot Password Form */}
          {showForgotPassword && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500 leading-relaxed">
                Informe o e-mail da sua conta. Se ela existir, enviaremos um link para você redefinir a senha.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider pl-1">
                  E-mail
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 light:text-slate-400">
                    <Mail className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900/60 dark:bg-slate-900/60 light:bg-white border border-slate-800/80 dark:border-slate-800/80 light:border-slate-300 focus:border-indigo-500 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white dark:text-white light:text-slate-900 placeholder-slate-500 dark:placeholder-slate-500 light:placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all text-sm mt-3 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Enviar Link de Redefinição</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
