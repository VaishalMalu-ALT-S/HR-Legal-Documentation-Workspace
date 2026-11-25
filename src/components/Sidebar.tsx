import React, { useState } from 'react';
import {
  PenTool, LayoutTemplate, CheckCircle2, FileText,
  Plus, Settings, LogOut, ChevronRight, ShieldCheck
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
  currentRole,
  draftsCount = 0,
}) => {
  return (
    <aside className="w-[72px] bg-[#162A45] flex flex-col items-center justify-between py-5 shrink-0 select-none z-30 font-sans shadow-lg">
      {/* Top: Logo + Navigation Rail */}
      <div className="flex flex-col items-center w-full gap-6">
        {/* Brand Mark (White Circular Emblem like G in reference) */}
        <div 
          onClick={() => setCurrentTab('signature')}
          className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-2 cursor-pointer transition-all shadow-inner group"
          title="ALT-S SmartDocSign"
        >
          <img src="/altslogo.png" alt="ALT-S" className="w-full h-full object-contain brightness-0 invert" />
        </div>

        {/* Primary Icon Navigation Rail */}
        <nav className="flex flex-col items-center gap-3 w-full px-3">
          {/* Document Signing Studio */}
          <button
            type="button"
            onClick={() => setCurrentTab('signature')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative group cursor-pointer ${
              currentTab === 'signature'
                ? 'bg-white text-[#162A45] shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Digital Signing Studio"
            aria-label="Digital Signing Studio"
          >
            <PenTool size={19} className="stroke-[2.2]" />
            {/* Tooltip on hover */}
            <span className="absolute left-14 bg-slate-900 text-white text-[11px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              Signing Studio
            </span>
          </button>

          {/* Letterhead Editor (HR only) */}
          {currentRole === 'hr' && (
            <button
              type="button"
              onClick={() => setCurrentTab('builder')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative group cursor-pointer ${
                currentTab === 'builder'
                  ? 'bg-white text-[#162A45] shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Corporate Letterhead Editor"
              aria-label="Corporate Letterhead Editor"
            >
              <LayoutTemplate size={19} className="stroke-[2.2]" />
              <span className="absolute left-14 bg-slate-900 text-white text-[11px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Letterhead Editor
              </span>
            </button>
          )}

          {/* Saved Drafts (HR only) */}
          {currentRole === 'hr' && (
            <button
              type="button"
              onClick={() => setCurrentTab('drafts')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative group cursor-pointer ${
                currentTab === 'drafts'
                  ? 'bg-white text-[#162A45] shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Saved Drafts"
              aria-label="Saved Drafts"
            >
              <FileText size={19} className="stroke-[2.2]" />
              {draftsCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#162A45]" />
              )}
              <span className="absolute left-14 bg-slate-900 text-white text-[11px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                Saved Drafts ({draftsCount})
              </span>
            </button>
          )}

          {/* Document Pipeline / Signature Requests */}
          <button
            type="button"
            onClick={() => setCurrentTab('approval')}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative group cursor-pointer ${
              currentTab === 'approval'
                ? 'bg-white text-[#162A45] shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Document Pipeline"
            aria-label="Document Pipeline"
          >
            <CheckCircle2 size={19} className="stroke-[2.2]" />
            <span className="absolute left-14 bg-slate-900 text-white text-[11px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              {currentRole === 'hr' ? 'Signature Pipeline' : 'My Approvals'}
            </span>
          </button>
        </nav>
      </div>

      {/* Bottom: Quick Add (+) & Verification indicator */}
      <div className="flex flex-col items-center gap-4 w-full px-3">
        {/* Quick Add Document (+) Button (like reference bottom button) */}
        {currentRole === 'hr' && (
          <button
            type="button"
            onClick={() => setCurrentTab('builder')}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm group"
            title="Create New Document"
            aria-label="Create New Document"
          >
            <Plus size={18} className="stroke-[2.5] group-hover:rotate-90 transition-transform" />
          </button>
        )}

        {/* Ledger Verified Indicator Dot */}
        <div 
          className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shadow-inner cursor-pointer"
          title="Cryptographic SHA-256 Ledger Realtime Active"
        >
          <ShieldCheck size={16} />
        </div>
      </div>
    </aside>
  );
};
