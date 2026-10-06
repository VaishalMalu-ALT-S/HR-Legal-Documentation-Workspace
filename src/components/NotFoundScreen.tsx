import React from 'react';
import { FileQuestion, Home } from 'lucide-react';

interface NotFoundProps {
  onGoHome: () => void;
}

export const NotFoundScreen: React.FC<NotFoundProps> = ({ onGoHome }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 p-8 select-none">
      <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion className="w-12 h-12 text-indigo-600" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Page Not Found</h1>
      <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
        We couldn't find the page or document you're looking for. It might have been moved, deleted, or you might not have the right permissions to view it.
      </p>
      
      <button 
        onClick={onGoHome}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};
