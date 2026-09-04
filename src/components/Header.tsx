import React, { useState } from 'react';
import {
  Search, Plus
} from 'lucide-react';

interface HeaderProps {
  onOpenCreate?: () => void;
  activeTab?: string;
  onNavigate?: (tab: string, payload?: { documentId?: string; documentNumber?: string; templateId?: string; search?: string }) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreate,
  activeTab = 'signature',
  onNavigate,
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      onNavigate?.('vault', { search: searchValue });
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#ebecf0] px-4 flex items-center justify-between shrink-0 select-none z-40 relative">
      {/* Left Section: App Switcher + Brand Logo + Functional Tabs */}
      <div className="flex items-center gap-2">
        {/* App Switcher 9-dots */}
        <div className="relative">
          <button
            onClick={() => setShowAppSwitcher(!showAppSwitcher)}
            className="p-1.5 hover:bg-[#ebecf0] rounded-md transition-colors text-[#42526e]"
            title="App Launcher"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="5" r="2.2" />
              <circle cx="12" cy="5" r="2.2" />
              <circle cx="19" cy="5" r="2.2" />
              <circle cx="5" cy="12" r="2.2" />
              <circle cx="12" cy="12" r="2.2" />
              <circle cx="19" cy="12" r="2.2" />
              <circle cx="5" cy="19" r="2.2" />
              <circle cx="12" cy="19" r="2.2" />
              <circle cx="19" cy="19" r="2.2" />
            </svg>
          </button>

          {showAppSwitcher && (
            <div className="absolute top-10 left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-xs animate-in zoom-in-95 duration-150">
              <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2 px-1">ALT-S Apps & Tools</p>
              <div className="space-y-1">
                <button
                  onClick={() => { onNavigate?.('signature'); setShowAppSwitcher(false); }}
                  className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">✍</div>
                  <div>
                    <div className="font-bold text-slate-800">Sign & Stamp Studio</div>
                    <div className="text-[10px] text-slate-500">Sign PDFs & DOCX docs</div>
                  </div>
                </button>
                <button
                  onClick={() => { onNavigate?.('builder'); setShowAppSwitcher(false); }}
                  className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">📄</div>
                  <div>
                    <div className="font-bold text-slate-800">ALT-S Letterhead Editor</div>
                    <div className="text-[10px] text-slate-500">Multi-page A4 templates</div>
                  </div>
                </button>
                <button
                  onClick={() => { onNavigate?.('vault'); setShowAppSwitcher(false); }}
                  className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">🗄</div>
                  <div>
                    <div className="font-bold text-slate-800">Document Vault</div>
                    <div className="text-[10px] text-slate-500">Tamper-proof ledger</div>
                  </div>
                </button>
                <button
                  onClick={() => { onNavigate?.('verification'); setShowAppSwitcher(false); }}
                  className="w-full text-left p-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors"
                >
                  <div className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">🛡</div>
                  <div>
                    <div className="font-bold text-slate-800">Verification Portal</div>
                    <div className="text-[10px] text-slate-500">SHA-256 hash checks</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Portal Logo: Official ALT-S Logo */}
        <div
          onClick={() => onNavigate && onNavigate('signature')}
          className="flex items-center gap-2.5 pl-1 pr-3 cursor-pointer group border-r border-[#ebecf0]"
          title="ALT-S SmartDoc Sign"
        >
          <img
            src="/altslogo.png"
            alt="ALT-S Logo"
            className="h-7 object-contain"
          />
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-[15px] text-[#172b4d] tracking-tight">
              SmartDoc<span className="text-[#0052cc]">Sign</span>
            </span>
          </div>
        </div>

        {/* Primary Functional Tabs */}
        <nav className="flex items-center gap-1 text-[13px] ml-1">
          <button
            onClick={() => onNavigate && onNavigate('signature')}
            className={`relative px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'signature'
                ? 'text-[#0052cc] font-semibold'
                : 'text-[#42526e] hover:bg-[#ebecf0]'
            }`}
          >
            Document Signing
            {activeTab === 'signature' && (
              <span className="absolute bottom-[-9px] left-3 right-3 h-[3px] bg-[#0052cc] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate && onNavigate('builder')}
            className={`relative px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'builder'
                ? 'text-[#0052cc] font-semibold'
                : 'text-[#42526e] hover:bg-[#ebecf0]'
            }`}
          >
            Letterhead Editor
            {activeTab === 'builder' && (
              <span className="absolute bottom-[-9px] left-3 right-3 h-[3px] bg-[#0052cc] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate && onNavigate('vault')}
            className={`relative px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'vault'
                ? 'text-[#0052cc] font-semibold'
                : 'text-[#42526e] hover:bg-[#ebecf0]'
            }`}
          >
            Document Vault
            {activeTab === 'vault' && (
              <span className="absolute bottom-[-9px] left-3 right-3 h-[3px] bg-[#0052cc] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavigate && onNavigate('verification')}
            className={`relative px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'verification'
                ? 'text-[#0052cc] font-semibold'
                : 'text-[#42526e] hover:bg-[#ebecf0]'
            }`}
          >
            Verification Portal
            {activeTab === 'verification' && (
              <span className="absolute bottom-[-9px] left-3 right-3 h-[3px] bg-[#0052cc] rounded-full" />
            )}
          </button>
        </nav>
      </div>

      {/* Right Section: Search + New Doc Button + Profile */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative w-44 md:w-56">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6b778c]" />
          <input
            type="text"
            placeholder="Search docs (Press Enter)..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-8 pr-2.5 py-1.5 text-[12.5px] bg-[#fafbfc] border border-[#dfe1e6] rounded text-[#172b4d] placeholder-[#7a869a] focus:bg-white focus:border-[#4c9aff] focus:ring-1 focus:ring-[#4c9aff] outline-none transition-all"
          />
        </div>

        {/* New Document Button */}
        <button
          onClick={onOpenCreate}
          className="bg-[#0052cc] hover:bg-[#0065ff] active:bg-[#0747a6] text-white text-[12.5px] font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Plus size={14} />
          <span>New Document</span>
        </button>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 border-l border-[#ebecf0] hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-full bg-[#0052cc] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
              HR
            </div>
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-[12px] font-bold text-[#172b4d]">HR Admin</span>
              <span className="text-[10px] text-[#6b778c]">ALT-S Tech</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute top-10 right-0 w-52 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 text-xs animate-in zoom-in-95 duration-150">
              <div className="pb-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">ALT-S HR Operations</p>
                <p className="text-[10px] text-slate-500">hr@alt-s.com</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[9px] rounded border border-emerald-200">
                  ● Enterprise Active
                </span>
              </div>
              <div className="pt-2 space-y-1">
                <button
                  onClick={() => { onNavigate?.('builder'); setShowProfileMenu(false); }}
                  className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-slate-700"
                >
                  Document Builder
                </button>
                <button
                  onClick={() => { onNavigate?.('vault'); setShowProfileMenu(false); }}
                  className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded text-slate-700"
                >
                  Document Vault
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
