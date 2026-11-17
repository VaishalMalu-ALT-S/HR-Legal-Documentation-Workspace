import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
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
      

      <div className="w-full max-w-4xl flex rounded-xl shadow-2xl bg-white overflow-hidden relative z-10 border border-slate-200/60">
        
        {/* Left Side: Branding & Features (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col w-[45%] bg-brand-900 text-white p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-900 z-0" />
          
          <div className="relative z-10 flex items-center gap-3 mb-16 bg-white py-2 px-4 rounded-md shadow-sm w-fit">
             <img src="/altslogo.png" alt="ALT-S Logo" className="h-8 object-contain" />
             <span className="text-2xl font-bold tracking-tight text-brand-900">SmartDocSign</span>
          </div>

          <div className="relative z-10 mt-auto mb-auto space-y-8">
            <h1 className="text-3xl font-bold leading-tight">
              Enterprise Document Management & e-Signatures
            </h1>
            <p className="text-slate-300 text-base leading-relaxed">
              Securely generate, approve, and sign official corporate documents with bank-grade encryption and full audit trails.
            </p>
            
            <div className="space-y-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 text-slate-300">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
                <span>End-to-End Encryption & Security</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Lock className="w-5 h-5 text-slate-400" />
                <span>Legally Binding e-Signatures</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <KeyRound className="w-5 h-5 text-slate-400" />
                <span>Role-Based Access Control</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 mt-auto text-sm text-slate-500 font-medium">
            © 2026 ALT-S Technology Private Limited.
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full lg:w-[55%] p-8 sm:p-10 md:p-16 flex flex-col justify-center bg-white relative">
          
          <div className="lg:hidden flex items-center gap-3 mb-10">
             <img src="/altslogo.png" alt="ALT-S Logo" className="h-8 object-contain" />
             <span className="text-xl font-bold text-brand-900 tracking-tight">SmartDocSign</span>
          </div>

          {/* LOGIN VIEW */}
          {view === 'login' && (
            <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-brand-900 mb-2 tracking-tight">Welcome back</h2>
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
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg outline-none transition-all font-medium text-slate-800"
                      placeholder="hr@alt-s.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-bold text-slate-700">Password</label>
                    <button type="button" onClick={() => setView('forgot')} className="text-xs font-bold text-brand-900 hover:text-[#334155] transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg outline-none transition-all font-medium text-slate-800"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-2 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-4">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Credentials */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Demo Accounts (Click to Auto-fill)
                </p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => { setEmail('hr@alt-s.com'); setPassword('admin123'); setError(''); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-md text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-700">HR Admin</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">(Full Access)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">hr@alt-s.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail('siva@alt-s.com'); setPassword('admin123'); setError(''); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-md text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-700">Siva Kumar</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">(Managing Director)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">siva@alt-s.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEmail('uma@alt-s.com'); setPassword('admin123'); setError(''); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-md text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-slate-700">Uma Mageshwari</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">(Board Director)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">uma@alt-s.com</span>
                  </button>
                </div>
              </div>

              <p className="mt-6 text-center text-sm font-medium text-slate-500">
                Don't have an account?{' '}
                <button onClick={() => setView('register')} className="text-brand-900 font-bold hover:underline">
                  Request Access
                </button>
              </p>
            </div>
          )}

          {/* REGISTER VIEW */}
          {view === 'register' && (
            <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-3xl font-bold text-brand-900 mb-2 tracking-tight">Request Access</h2>
              <p className="text-slate-500 mb-8 font-medium">Internal portal access requires admin approval.</p>
              
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setView('login'); }}>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg outline-none transition-all font-medium text-slate-800" placeholder="John Doe" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Company Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="email" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg outline-none transition-all font-medium text-slate-800" placeholder="john@alt-s.com" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-2 rounded-lg shadow-md transition-all mt-6">
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
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <KeyRound className="w-6 h-6 text-brand-900" />
              </div>
              <h2 className="text-3xl font-bold text-brand-900 mb-2 tracking-tight">Reset Password</h2>
              <p className="text-slate-500 mb-8 font-medium">Enter your email and we'll send you a secure recovery link.</p>
              
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setView('login'); }}>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="email" className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-300 rounded-lg outline-none transition-all font-medium text-slate-800" placeholder="hr@alt-s.com" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-brand-900 hover:bg-brand-800 text-white font-bold py-2 rounded-lg shadow-md transition-all">
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
