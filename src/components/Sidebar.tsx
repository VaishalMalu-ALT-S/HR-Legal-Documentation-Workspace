import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, ChevronLeft,
  PenTool, LayoutTemplate, ShieldCheck, Archive,
  CheckCircle, CheckCircle2, FileText
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
      <aside className="w-10 bg-[#fafbfc] border-r border-[#ebecf0] shrink-0 flex flex-col items-center py-3 gap-3 select-none">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 hover:bg-[#ebecf0] rounded text-[#42526e] transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight size={14} />
        </button>

        <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-xs">
          <img src="/altslogo.png" alt="ALT-S" className="w-full h-full object-contain" />
        </div>

        <div className="w-8 h-px bg-[#dfe1e6] my-1" />

        <button
          onClick={() => setCurrentTab('signature')}
          className={`p-2 rounded transition-colors ${
            currentTab === 'signature' ? 'bg-[#e2e8f0] text-brand-900 font-semibold' : 'text-[#475569] hover:bg-[#f1f5f9]'
          }`}
          title="Sign & Stamp Studio"
        >
          <PenTool size={14} />
        </button>

        <button
          onClick={() => setCurrentTab('approval')}
          className={`p-2 rounded transition-colors ${
            currentTab === 'approval' ? 'bg-[#e2e8f0] text-brand-900 font-semibold' : 'text-[#475569] hover:bg-[#f1f5f9]'
          }`}
          title="Document Pipeline"
        >
          <CheckCircle2 size={14} />
        </button>

        {currentRole === 'hr' && (
          <button
            onClick={() => setCurrentTab('drafts')}
            className={`p-2 rounded transition-colors relative ${
              currentTab === 'drafts' ? 'bg-[#e2e8f0] text-brand-900 font-semibold' : 'text-[#475569] hover:bg-[#f1f5f9]'
            }`}
            title="HR Document Drafts"
          >
            <FileText size={14} />
            {draftsCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>
        )}

        {currentRole === 'hr' && (
          <button
            onClick={() => setCurrentTab('builder')}
            className={`p-2 rounded transition-colors ${
              currentTab === 'builder' ? 'bg-[#e2e8f0] text-brand-900 font-semibold' : 'text-[#475569] hover:bg-[#f1f5f9]'
            }`}
            title="Letterhead Editor"
          >
            <LayoutTemplate size={14} />
          </button>
        )}


      </aside>
    );
  }

  return (
    <aside className="w-[230px] bg-[#fafbfc] border-r border-[#ebecf0] shrink-0 flex flex-col justify-between select-none h-full">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Workspace Title & Collapse Toggle */}
        <div className="px-3 pt-3.5 pb-2.5 flex items-center justify-between border-b border-[#ebecf0]/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-xs shrink-0">
              <img src="/altslogo.png" alt="ALT-S" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[12px] text-[#172b4d] tracking-tight leading-none">
                ALT-S HR & Legal
              </span>
              <span className="text-[9px] text-[#6b778c] font-medium mt-0.5">
                Document Workspace
              </span>
            </div>
          </div>

          <button
            onClick={() => setCollapsed(true)}
            className="p-1 hover:bg-[#ebecf0] rounded text-[#6b778c] hover:text-[#172b4d] transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Tree Items */}
        <div className="px-2 py-2 space-y-3">
          {/* Group 1: Workspace */}
          <div>
            <button
              onClick={() => setSigningOpen(!signingOpen)}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-[12px] font-bold text-[#6b778c] uppercase tracking-wider hover:text-[#172b4d]"
            >
              {signingOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>{currentRole === 'hr' ? 'HR WORKSPACE' : 'MANAGEMENT'}</span>
            </button>

            {signingOpen && (
              <div className="mt-1 space-y-0.5 pl-1">
                {currentRole === 'hr' && (
                  <button
                    onClick={() => setCurrentTab('approval')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'approval'
                        ? 'bg-[#e2e8f0] text-brand-900 font-semibold'
                        : 'text-[#475569] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span className="truncate">Document Pipeline</span>
                  </button>
                )}

                {currentRole === 'hr' && (
                  <button
                    onClick={() => setCurrentTab('drafts')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'drafts'
                        ? 'bg-[#e2e8f0] text-brand-900 font-semibold'
                        : 'text-[#475569] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={16} className="shrink-0" />
                      <span className="truncate">Drafts</span>
                    </div>
                    {draftsCount > 0 && (
                      <span className="text-[12px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 shrink-0 ml-1">
                        {draftsCount}
                      </span>
                    )}
                  </button>
                )}

                {currentRole === 'hr' && (
                  <button
                    onClick={() => setCurrentTab('builder')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'builder'
                        ? 'bg-[#e2e8f0] text-brand-900 font-semibold'
                        : 'text-[#475569] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <LayoutTemplate size={16} className="shrink-0" />
                    <span className="truncate">New Document</span>
                  </button>
                )}

                {currentRole === 'hr' && (
                  <button
                    onClick={() => setCurrentTab('signature')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'signature'
                        ? 'bg-[#e2e8f0] text-brand-900 font-semibold'
                        : 'text-[#475569] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <PenTool size={16} className="shrink-0" />
                    <span className="truncate">Completed Documents</span>
                  </button>
                )}

                {currentRole !== 'hr' && (
                  <button
                    onClick={() => setCurrentTab('approval')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'approval'
                        ? 'bg-[#e2e8f0] text-brand-900 font-semibold'
                        : 'text-[#475569] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span className="truncate">Pending Approvals</span>
                  </button>
                )}

                {currentRole !== 'hr' && (
                  <button
                    onClick={() => setCurrentTab('signature')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'signature'
                        ? 'bg-[#e2e8f0] text-brand-900 font-semibold'
                        : 'text-[#475569] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <PenTool size={16} className="shrink-0" />
                    <span className="truncate">Signed Documents</span>
                  </button>
                )}
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#ebecf0] bg-[#fafbfc] text-[13px] text-[#6b778c] flex items-center justify-between shrink-0">
        <span>ALT-S Technology</span>
        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
          <CheckCircle size={11} /> Live
        </span>
      </div>
    </aside>
  );
};
