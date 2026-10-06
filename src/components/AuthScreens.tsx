import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, FileSignature, KeyRound, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';
import { LegalModals } from './LegalModals';
import { DatabaseService } from '../services/dbService';

interface AuthProps {
  onLogin: (role: UserRole) => void;
}

export const AuthScreens: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [legalTab, setLegalTab] = useState<'privacy' | 'terms' | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    // Mock authentication — also write role to localStorage for dbService
    let role: UserRole = 'hr';
    if (email.includes('siva')) {
      role = 'siva_kumar';
    } else if (email.includes('uma')) {
      role = 'uma_mageshwari';
    }
    DatabaseService.setSessionRole(role);
    onLogin(role);
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f5f7] flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl flex rounded-2xl shadow-2xl bg-white overflow-hidden relative z-10 border border-slate-200/60">
        
        {/* Left Side: Branding & Features (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col w-[45%] bg-[#0f172a] text-white p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-slate-900/90 z-0" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
          
          <div className="relative z-10 flex items-center gap-3 mb-16">
             <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                <FileSignature className="w-6 h-6 text-indigo-700" />
             </div>
             <span className="text-2xl font-bold tracking-tight">SignHR</span>
          </div>

          <div className="relative z-10 mt-auto mb-auto space-y-8">
            <h1 className="text-4xl font-bold leading-tight">
              Enterprise Document Management & e-Signatures
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Securely generate, approve, and sign official corporate documents with bank-grade encryption and full audit trails.
            </p>
            
            <div className="space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 text-slate-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>End-to-End Encryption & Security</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <FileSignature className="w-5 h-5 text-blue-400" />
                <span>Legally Binding e-Signatures</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <span>Role-Based Access Control</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-auto text-sm text-slate-500 font-medium">
            © 2026 ALT-S Technology Private Limited.
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full lg:w-[55%] p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white relative">
          
          {/* Logo for Mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
             <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow">
                <FileSignature className="w-5 h-5 text-white" />
             </div>
             <span className="text-xl font-bold text-slate-800">SignHR</span>
          </div>

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome back</h2>
              <p className="text-slate-500 mb-8 font-medium">Sign in to access your secure workspace.</p>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl outline-none transition-all font-medium text-slate-800"
                      placeholder="hr@alt-s.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-bold text-slate-700">Password</label>
                    <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl outline-none transition-all font-medium text-slate-800"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-4">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <p className="mt-8 text-center text-sm font-medium text-slate-500">
                Don't have an account?{' '}
                <button onClick={() => setView('register')} className="text-indigo-600 font-bold hover:underline">
                  Request Access
                </button>
              </p>
            </div>
          )}

          {/* REGISTER VIEW */}
          {view === 'register' && (
            <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Request Access</h2>
              <p className="text-slate-500 mb-8 font-medium">Internal portal access requires admin approval.</p>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setView('login'); }}>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg outline-none transition-all font-medium text-slate-800" placeholder="John Doe" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Company Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg outline-none transition-all font-medium text-slate-800" placeholder="john@alt-s.com" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg shadow-md transition-all mt-6">
                  Submit Request
                </button>
              </form>

              <button onClick={() => setView('login')} className="mt-6 w-full text-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                &larr; Back to Login
              </button>
            </div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {view === 'forgot' && (
            <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <KeyRound className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Reset Password</h2>
              <p className="text-slate-500 mb-8 font-medium">Enter your email and we'll send you a secure recovery link.</p>
              
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setView('login'); }}>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl outline-none transition-all font-medium text-slate-800" placeholder="hr@alt-s.com" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-all">
                  Send Recovery Link
                </button>
              </form>

              <button onClick={() => setView('login')} className="mt-8 w-full text-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                &larr; Back to Login
              </button>
            </div>
          )}

          <div className="mt-auto pt-10 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <button onClick={() => setLegalTab('privacy')} className="hover:text-slate-600 mr-4 transition-colors">Privacy Policy</button>
            <button onClick={() => setLegalTab('terms')} className="hover:text-slate-600 transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
      
      {legalTab && (
        <LegalModals initialTab={legalTab} onClose={() => setLegalTab(null)} />
      )}
    </div>
  );
};
