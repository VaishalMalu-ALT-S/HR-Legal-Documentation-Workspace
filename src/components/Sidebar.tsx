import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, ChevronLeft,
  PenTool, LayoutTemplate, CheckCircle2, FileText,
  Clock, ShieldCheck, Layers, FileSignature
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeDocTemplate?: string;
  onSelectDocTemplate?: (templateKey: string) => void;
  currentRole: string;
  draftsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  activeDocTemplate = 'asset_acknowledgment',
  onSelectDocTemplate,
  currentRole,
  draftsCount = 0,
}) => {
  const [signingOpen, setSigningOpen] = useState(true);

  const handleSelectTemplate = (templateKey: string) => {
    if (onSelectDocTemplate) {
      onSelectDocTemplate(templateKey);
    }
    setCurrentTab('builder');
  };

  if (collapsed) {
    return (
      <aside className="w-12 bg-slate-50/70 border-r border-slate-200 shrink-0 flex flex-col items-center py-3 gap-2.5 select-none font-sans">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200/70 rounded-md text-slate-500 hover:text-slate-900 transition-colors"
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <ChevronRight size={15} />
        </button>

        <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs my-1">
          <img src="/altslogo.png" alt="ALT-S" className="w-full h-full object-contain" />
        </div>

        <div className="w-8 h-px bg-slate-200 my-0.5" />

        <button
          type="button"
          onClick={() => setCurrentTab('signature')}
          className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
            currentTab === 'signature'
              ? 'bg-indigo-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
          title="Document Signing Studio"
        >
          <PenTool size={16} />
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('approval')}
          className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
            currentTab === 'approval'
              ? 'bg-indigo-600 text-white shadow-xs font-semibold'
              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
          }`}
          title="Document Pipeline"
        >
          <CheckCircle2 size={16} />
        </button>

        {currentRole === 'hr' && (
          <button
            type="button"
            onClick={() => setCurrentTab('drafts')}
            className={`w-9 h-9 rounded-md flex items-center justify-center relative transition-all ${
              currentTab === 'drafts'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
            }`}
            title="Saved Drafts"
          >
            <FileText size={16} />
            {draftsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>
        )}

        {currentRole === 'hr' && (
          <button
            type="button"
            onClick={() => setCurrentTab('builder')}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition-all ${
              currentTab === 'builder'
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
            }`}
            title="Letterhead Editor"
          >
            <LayoutTemplate size={16} />
          </button>
        )}
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-slate-50/70 border-r border-slate-200 shrink-0 flex flex-col justify-between select-none h-full font-sans">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Workspace Brand Header */}
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-slate-200/80 bg-white/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center p-1 shadow-2xs shrink-0">
              <img src="/altslogo.png" alt="ALT-S" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-slate-900 tracking-tight leading-snug">
                ALT-S HR &amp; Legal
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                Enterprise Workspace
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-200/70 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="p-2.5 space-y-4">
          <div>
            <button
              type="button"
              onClick={() => setSigningOpen(!signingOpen)}
              className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 transition-colors"
            >
              <span>{currentRole === 'hr' ? 'HR Operations' : 'Signatory Portal'}</span>
              {signingOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>

            {signingOpen && (
              <div className="mt-1.5 space-y-0.5">
                {/* Document Pipeline */}
                <button
                  type="button"
                  onClick={() => setCurrentTab('approval')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all text-left ${
                    currentTab === 'approval'
                      ? 'bg-white text-indigo-700 border border-slate-200 shadow-xs ring-1 ring-slate-900/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <CheckCircle2 size={16} className={currentTab === 'approval' ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className="truncate">
                    {currentRole === 'hr' ? 'Document Pipeline' : 'Pending Approvals'}
                  </span>
                </button>

                {/* Drafts Manager (HR only) */}
                {currentRole === 'hr' && (
                  <button
                    type="button"
                    onClick={() => setCurrentTab('drafts')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-all text-left ${
                      currentTab === 'drafts'
                        ? 'bg-white text-indigo-700 border border-slate-200 shadow-xs ring-1 ring-slate-900/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={16} className={currentTab === 'drafts' ? 'text-indigo-600' : 'text-slate-400'} />
                      <span className="truncate">Saved Drafts</span>
                    </div>
                    {draftsCount > 0 && (
                      <span className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        {draftsCount}
                      </span>
                    )}
                  </button>
                )}

                {/* New Document (HR only) */}
                {currentRole === 'hr' && (
                  <button
                    type="button"
                    onClick={() => setCurrentTab('builder')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all text-left ${
                      currentTab === 'builder'
                        ? 'bg-white text-indigo-700 border border-slate-200 shadow-xs ring-1 ring-slate-900/5'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <LayoutTemplate size={16} className={currentTab === 'builder' ? 'text-indigo-600' : 'text-slate-400'} />
                    <span className="truncate">Letterhead Editor</span>
                  </button>
                )}

                {/* Digital Signing Studio */}
                <button
                  type="button"
                  onClick={() => setCurrentTab('signature')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all text-left ${
                    currentTab === 'signature'
                      ? 'bg-white text-indigo-700 border border-slate-200 shadow-xs ring-1 ring-slate-900/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <PenTool size={16} className={currentTab === 'signature' ? 'text-indigo-600' : 'text-slate-400'} />
                  <span className="truncate">
                    {currentRole === 'hr' ? 'Signing Studio' : 'Signed Documents'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info & System Verification Status */}
      <div className="p-3 border-t border-slate-200 bg-white/70 text-xs text-slate-500 flex items-center justify-between shrink-0 font-sans">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-indigo-600" />
          <span className="font-semibold text-slate-700 text-[11px]">SHA-256 Ledger</span>
        </div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Realtime
        </span>
      </div>
    </aside>
  );
};
