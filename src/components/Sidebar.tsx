import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, ChevronLeft,
  PenTool, LayoutTemplate, ShieldCheck, Archive,
  CheckCircle, CheckCircle2
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeDocTemplate?: string;
  onSelectDocTemplate?: (templateKey: string) => void;
  currentRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  activeDocTemplate = 'offer_letter',
  onSelectDocTemplate,
  currentRole,
}) => {
  const [signingOpen, setSigningOpen] = useState(true);
  const [automationOpen, setAutomationOpen] = useState(true);
  const [complianceOpen, setComplianceOpen] = useState(true);

  const handleSelectTemplate = (templateKey: string) => {
    if (onSelectDocTemplate) {
      onSelectDocTemplate(templateKey);
    }
    setCurrentTab('builder');
  };

  if (collapsed) {
    return (
      <aside className="w-12 bg-[#fafbfc] border-r border-[#ebecf0] shrink-0 flex flex-col items-center py-3 gap-3 select-none">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 hover:bg-[#ebecf0] rounded text-[#42526e] transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>

        <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-xs">
          <img src="/altslogo.png" alt="ALT-S" className="w-full h-full object-contain" />
        </div>

        <div className="w-8 h-px bg-[#dfe1e6] my-1" />

        <button
          onClick={() => setCurrentTab('signature')}
          className={`p-2 rounded transition-colors ${
            currentTab === 'signature' ? 'bg-[#deebff] text-[#0052cc]' : 'text-[#42526e] hover:bg-[#ebecf0]'
          }`}
          title="Sign & Stamp Studio"
        >
          <PenTool size={16} />
        </button>

        <button
          onClick={() => setCurrentTab('approval')}
          className={`p-2 rounded transition-colors ${
            currentTab === 'approval' ? 'bg-[#deebff] text-[#0052cc]' : 'text-[#42526e] hover:bg-[#ebecf0]'
          }`}
          title="Approval Center"
        >
          <CheckCircle2 size={16} />
        </button>

        {currentRole === 'hr' && (
          <button
            onClick={() => setCurrentTab('builder')}
            className={`p-2 rounded transition-colors ${
              currentTab === 'builder' ? 'bg-[#deebff] text-[#0052cc]' : 'text-[#42526e] hover:bg-[#ebecf0]'
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
    <aside className="w-[236px] bg-[#fafbfc] border-r border-[#ebecf0] shrink-0 flex flex-col justify-between select-none h-full">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Workspace Title & Collapse Toggle */}
        <div className="px-3 pt-3.5 pb-2.5 flex items-center justify-between border-b border-[#ebecf0]/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-white border border-slate-200 flex items-center justify-center p-0.5 shadow-xs shrink-0">
              <img src="/altslogo.png" alt="ALT-S" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[13.5px] text-[#172b4d] tracking-tight leading-none">
                ALT-S HR & Legal
              </span>
              <span className="text-[10px] text-[#6b778c] font-medium mt-0.5">
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
              className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-[#6b778c] uppercase tracking-wider hover:text-[#172b4d]"
            >
              {signingOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>{currentRole === 'hr' ? 'HR WORKSPACE' : 'MANAGEMENT'}</span>
            </button>

            {signingOpen && (
              <div className="mt-1 space-y-0.5 pl-1">
                {currentRole === 'hr' && (
                  <button
                    onClick={() => setCurrentTab('approval')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'approval'
                        ? 'bg-[#deebff] text-[#0052cc]'
                        : 'text-[#42526e] hover:bg-[#ebecf0]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded bg-[#e6ffe6] border border-[#36b37e] flex items-center justify-center shrink-0">
                      <CheckCircle2 size={11} className="text-[#36b37e]" />
                    </div>
                    <span className="truncate">Document Pipeline</span>
                  </button>
                )}

                {currentRole === 'hr' && (
                  <button
                    onClick={() => setCurrentTab('builder')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'builder'
                        ? 'bg-[#deebff] text-[#0052cc]'
                        : 'text-[#42526e] hover:bg-[#ebecf0]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded bg-[#e6fcff] border border-[#00b8d9] flex items-center justify-center shrink-0">
                      <LayoutTemplate size={11} className="text-[#00a3bf]" />
                    </div>
                    <span className="truncate">New Document</span>
                  </button>
                )}

                {currentRole === 'hr' && (
                  <button
                    onClick={() => setCurrentTab('signature')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'signature'
                        ? 'bg-[#deebff] text-[#0052cc]'
                        : 'text-[#42526e] hover:bg-[#ebecf0]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded bg-[#e6fcff] border border-[#00b8d9] flex items-center justify-center shrink-0">
                      <PenTool size={11} className="text-[#00a3bf]" />
                    </div>
                    <span className="truncate">Completed Documents</span>
                  </button>
                )}

                {currentRole !== 'hr' && (
                  <button
                    onClick={() => setCurrentTab('approval')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'approval'
                        ? 'bg-[#deebff] text-[#0052cc]'
                        : 'text-[#42526e] hover:bg-[#ebecf0]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded bg-[#e6ffe6] border border-[#36b37e] flex items-center justify-center shrink-0">
                      <CheckCircle2 size={11} className="text-[#36b37e]" />
                    </div>
                    <span className="truncate">Documents to Review</span>
                  </button>
                )}

                {currentRole !== 'hr' && (
                  <button
                    onClick={() => setCurrentTab('signature')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'signature'
                        ? 'bg-[#deebff] text-[#0052cc]'
                        : 'text-[#42526e] hover:bg-[#ebecf0]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded bg-[#e6fcff] border border-[#00b8d9] flex items-center justify-center shrink-0">
                      <PenTool size={11} className="text-[#00a3bf]" />
                    </div>
                    <span className="truncate">Approved Documents</span>
                  </button>
                )}

                {currentRole !== 'hr' && (
                  <button
                    onClick={() => setCurrentTab('signature')}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[13px] font-semibold transition-colors text-left ${
                      currentTab === 'signature'
                        ? 'bg-[#deebff] text-[#0052cc]'
                        : 'text-[#42526e] hover:bg-[#ebecf0]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded bg-[#e6fcff] border border-[#00b8d9] flex items-center justify-center shrink-0">
                      <CheckCircle2 size={11} className="text-[#00a3bf]" />
                    </div>
                    <span className="truncate">Completed Documents</span>
                  </button>
                )}
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#ebecf0] bg-[#fafbfc] text-[11px] text-[#6b778c] flex items-center justify-between shrink-0">
        <span>ALT-S Technology</span>
        <span className="flex items-center gap-1 text-emerald-600 font-semibold">
          <CheckCircle size={11} /> Live
        </span>
      </div>
    </aside>
  );
};
