import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, ChevronLeft,
  PenTool, LayoutTemplate, ShieldCheck, Archive,
  CheckCircle
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  activeDocTemplate?: string;
  onSelectDocTemplate?: (templateKey: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  collapsed,
  setCollapsed,
  activeDocTemplate = 'offer_letter',
  onSelectDocTemplate,
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
          onClick={() => setCurrentTab('builder')}
          className={`p-2 rounded transition-colors ${
            currentTab === 'builder' ? 'bg-[#deebff] text-[#0052cc]' : 'text-[#42526e] hover:bg-[#ebecf0]'
          }`}
          title="Letterhead Editor"
        >
          <LayoutTemplate size={16} />
        </button>

        <button
          onClick={() => setCurrentTab('vault')}
          className={`p-2 rounded transition-colors ${
            currentTab === 'vault' ? 'bg-[#deebff] text-[#0052cc]' : 'text-[#42526e] hover:bg-[#ebecf0]'
          }`}
          title="Signed Document Vault"
        >
          <Archive size={16} />
        </button>

        <button
          onClick={() => setCurrentTab('verification')}
          className={`p-2 rounded transition-colors ${
            currentTab === 'verification' ? 'bg-[#deebff] text-[#0052cc]' : 'text-[#42526e] hover:bg-[#ebecf0]'
          }`}
          title="Verification Portal"
        >
          <ShieldCheck size={16} />
        </button>
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
          {/* Group 1: DOCUMENTS & SIGNING */}
          <div>
            <button
              onClick={() => setSigningOpen(!signingOpen)}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-[#6b778c] uppercase tracking-wider hover:text-[#172b4d]"
            >
              {signingOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>DOCUMENTS & SIGNING</span>
            </button>

            {signingOpen && (
              <div className="mt-1 space-y-0.5 pl-1">
                {/* Active Studio */}
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
                  <span className="truncate">Sign & Stamp Studio</span>
                </button>

                {/* Asset Form */}
                <button
                  onClick={() => handleSelectTemplate('asset_acknowledgment')}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition-colors text-left ${
                    activeDocTemplate === 'asset_acknowledgment' && currentTab === 'builder'
                      ? 'bg-[#ebecf0] font-semibold text-[#172b4d]'
                      : 'text-[#42526e] hover:bg-[#ebecf0]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeDocTemplate === 'asset_acknowledgment' ? 'bg-[#0052cc]' : 'bg-[#6b778c]'}`} />
                    <span className="truncate">Asset Acknowledgment</span>
                  </div>
                  <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded">
                    Hardware
                  </span>
                </button>

                {/* Appointment Solution Architect */}
                <button
                  onClick={() => handleSelectTemplate('appointment_solution_architect')}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition-colors text-left ${
                    activeDocTemplate === 'appointment_solution_architect' && currentTab === 'builder'
                      ? 'bg-[#ebecf0] font-semibold text-[#172b4d]'
                      : 'text-[#42526e] hover:bg-[#ebecf0]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeDocTemplate === 'appointment_solution_architect' ? 'bg-[#0052cc]' : 'bg-[#6b778c]'}`} />
                    <span className="truncate">Appt: Solution Architect</span>
                  </div>
                  <span className="text-[9px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1 py-0.2 rounded">
                    Full-Time
                  </span>
                </button>

                {/* Contractor Offer */}
                <button
                  onClick={() => handleSelectTemplate('contractor_offer')}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition-colors text-left ${
                    activeDocTemplate === 'contractor_offer' && currentTab === 'builder'
                      ? 'bg-[#ebecf0] font-semibold text-[#172b4d]'
                      : 'text-[#42526e] hover:bg-[#ebecf0]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeDocTemplate === 'contractor_offer' ? 'bg-[#0052cc]' : 'bg-[#6b778c]'}`} />
                    <span className="truncate">Contractor Offer (SOW)</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
                    1.5L/mo
                  </span>
                </button>

                {/* Appointment Admin Executive */}
                <button
                  onClick={() => handleSelectTemplate('appointment_admin_executive')}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition-colors text-left ${
                    activeDocTemplate === 'appointment_admin_executive' && currentTab === 'builder'
                      ? 'bg-[#ebecf0] font-semibold text-[#172b4d]'
                      : 'text-[#42526e] hover:bg-[#ebecf0]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeDocTemplate === 'appointment_admin_executive' ? 'bg-[#0052cc]' : 'bg-[#6b778c]'}`} />
                    <span className="truncate">Appt: Admin Executive</span>
                  </div>
                </button>

                {/* Blank Letterhead (Manual Type) */}
                <button
                  onClick={() => handleSelectTemplate('blank_letterhead')}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-[12px] transition-colors text-left ${
                    activeDocTemplate === 'blank_letterhead' && currentTab === 'builder'
                      ? 'bg-[#ebecf0] font-semibold text-[#172b4d]'
                      : 'text-[#42526e] hover:bg-[#ebecf0]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeDocTemplate === 'blank_letterhead' ? 'bg-[#0052cc]' : 'bg-[#6b778c]'}`} />
                    <span className="truncate">Blank Headpad (Type)</span>
                  </div>
                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
                    Manual
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Group 2: TEMPLATES & BUILDER */}
          <div className="pt-2 border-t border-[#ebecf0]">
            <button
              onClick={() => setAutomationOpen(!automationOpen)}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-[#6b778c] uppercase tracking-wider hover:text-[#172b4d]"
            >
              {automationOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>TEMPLATES & BUILDER</span>
            </button>

            {automationOpen && (
              <div className="mt-1 space-y-0.5 pl-1">
                <button
                  onClick={() => setCurrentTab('builder')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                    currentTab === 'builder'
                      ? 'bg-[#deebff] text-[#0052cc] font-semibold'
                      : 'text-[#42526e] hover:bg-[#ebecf0]'
                  }`}
                >
                  <LayoutTemplate size={13.5} className="shrink-0 text-[#0052cc]" />
                  <span className="truncate">ALT-S Letterhead Editor</span>
                </button>
              </div>
            )}
          </div>

          {/* Group 3: COMPLIANCE & ARCHIVE */}
          <div className="pt-2 border-t border-[#ebecf0]">
            <button
              onClick={() => setComplianceOpen(!complianceOpen)}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-[#6b778c] uppercase tracking-wider hover:text-[#172b4d]"
            >
              {complianceOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
              <span>COMPLIANCE & ARCHIVE</span>
            </button>

            {complianceOpen && (
              <div className="mt-1 space-y-0.5 pl-1">
                {/* Signed Document Vault */}
                <button
                  onClick={() => setCurrentTab('vault')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                    currentTab === 'vault'
                      ? 'bg-[#deebff] text-[#0052cc] font-semibold'
                      : 'text-[#42526e] hover:bg-[#ebecf0]'
                  }`}
                >
                  <Archive size={13.5} className="shrink-0 text-[#36b37e]" />
                  <span className="truncate">Signed Document Vault</span>
                </button>

                {/* Public Verification */}
                <button
                  onClick={() => setCurrentTab('verification')}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-[12.5px] transition-colors text-left ${
                    currentTab === 'verification'
                      ? 'bg-[#deebff] text-[#0052cc] font-semibold'
                      : 'text-[#42526e] hover:bg-[#ebecf0]'
                  }`}
                >
                  <ShieldCheck size={13.5} className="shrink-0 text-[#0052cc]" />
                  <span className="truncate">Public Verification</span>
                </button>
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
