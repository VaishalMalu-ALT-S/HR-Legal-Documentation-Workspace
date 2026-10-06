import React from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';

interface SessionExpiredProps {
  onRelogin: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredProps> = ({ onRelogin }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Session Expired</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          For your security, your session has timed out due to inactivity. Please sign in again to continue working securely.
        </p>
        <button
          onClick={onRelogin}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In Again</span>
        </button>
      </div>
    </div>
  );
};
