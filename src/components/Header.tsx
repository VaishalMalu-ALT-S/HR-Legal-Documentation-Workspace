import React, { useState } from 'react';
import {
  Search, Plus, PenTool, FileText, ChevronDown, Shield, LogOut, Lock,
  Building2, CheckCircle2, Sparkles, Layers
} from 'lucide-react';

import { RoleSwitcher } from './RoleSwitcher';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenCreate?: () => void;
  activeTab?: string;
  onNavigate?: (tab: string, payload?: { documentId?: string; documentNumber?: string; templateId?: string; search?: string }) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onExpireSession?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreate,
  activeTab = 'signature',
  onNavigate,
  currentRole,
  onRoleChange,
  onExpireSession,
  onLogout
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      if (currentRole === 'hr') {
        onNavigate?.('drafts', { search: searchValue });
      } else {
        onNavigate?.('approval', { search: searchValue });
      }
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'siva_kumar':
        return { label: 'Managing Director', initials: 'SK', email: 'siva@alt-s.com', name: 'Siva Kumar' };
      case 'uma_mageshwari':
        return { label: 'Director', initials: 'UM', email: 'uma@alt-s.com', name: 'Uma Mageshwari' };
      default:
        return { label: 'HR Administrator', initials: 'HR', email: 'hr@alt-s.com', name: 'HR Admin' };
    }
  };

  const roleInfo = getRoleBadge(currentRole);

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 select-none z-40 relative shadow-[0_1px_2px_rgba(0,0,0,0.03)] font-sans">
      {/* Left Section: App Launcher + Brand Logo + Nav Tabs */}
      <div className="flex items-center gap-3">
        {/* Microsoft Fluent 9-dot App Launcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAppSwitcher(!showAppSwitcher)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
              showAppSwitcher ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-300' : ''
            }`}
            title="ALT-S Platform Switcher"
            aria-label="App Launcher"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
            <div className="absolute top-11 left-0 w-72 bg-white rounded-lg shadow-xl border border-slate-200 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-2 py-1 mb-1.5 border-b border-slate-100">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">
                  Enterprise Workspaces
                </span>
                <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">v2.4</span>
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { onNavigate?.('signature'); setShowAppSwitcher(false); }}
                  className="w-full text-left p-2.5 rounded-md hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 group-hover:text-indigo-700">Digital Signing Studio</div>
                    <div className="text-[11px] text-slate-500">DSC, OTP authorizations &amp; seals</div>
                  </div>
                </button>

                {currentRole === 'hr' && (
                  <button
                    type="button"
                    onClick={() => { onNavigate?.('builder'); setShowAppSwitcher(false); }}
                    className="w-full text-left p-2.5 rounded-md hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-md bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-900 group-hover:text-sky-700">Corporate Letterhead Editor</div>
                      <div className="text-[11px] text-slate-500">Universal multi-page A4 templates</div>
                    </div>
                  </button>
                )}

                <div className="pt-2 border-t border-slate-100 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAppSwitcher(false);
                      onLogout && onLogout();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-md hover:bg-rose-50 text-rose-700 flex items-center justify-between text-xs font-semibold transition-colors"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Brand Separator */}
        <div className="h-5 w-px bg-slate-200" />

        {/* Portal Branding */}
        <div
          onClick={() => onNavigate && onNavigate('signature')}
          className="flex items-center gap-2.5 cursor-pointer group pr-2"
          title="ALT-S HR & Legal Documentation Workspace"
        >
          <img
            src="/altslogo.png"
            alt="ALT-S Logo"
            className="h-6 object-contain"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[13px] text-slate-900 tracking-tight">
                SmartDoc<span className="text-indigo-600 font-extrabold">Sign</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Enterprise
              </span>
            </div>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 ml-2 text-xs">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('signature')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'signature'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Document Signing
          </button>

          {currentRole === 'hr' && (
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('builder')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'builder'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Letterhead Editor
            </button>
          )}

          {currentRole === 'hr' && (
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('drafts')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'drafts'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Saved Drafts
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('approval')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'approval'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {currentRole === 'hr' ? 'Signature Pipeline' : 'My Approvals'}
          </button>
        </nav>
      </div>

      {/* Right Section: Search + Primary Action + Role Switcher + Profile */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative w-44 lg:w-56">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all shadow-2xs"
          />
        </div>

        {/* Primary CTA: New Document (HR Only) */}
        {currentRole === 'hr' && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="h-8.5 px-3 bg-brand-900 hover:bg-brand-950 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-sm active:scale-98 transition-all"
            title="Create or import a new document"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>New Document</span>
          </button>
        )}

        <div className="h-5 w-px bg-slate-200" />

        {/* Role Switcher Pill */}
        <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />

        <div className="h-5 w-px bg-slate-200" />

        {/* Executive Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-md hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            aria-label="User Profile Menu"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
              {roleInfo.initials}
            </div>
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="text-xs font-semibold text-slate-900">
                {roleInfo.name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {roleInfo.label}
              </span>
            </div>
            <ChevronDown size={13} className="text-slate-400 hidden lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute top-11 right-0 w-60 bg-white rounded-lg shadow-xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="pb-2.5 border-b border-slate-100">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-bold text-slate-900 text-xs">{roleInfo.name}</p>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded border border-emerald-200">
                    <CheckCircle2 size={10} /> Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono tracking-tight">{roleInfo.email}</p>
                <p className="text-[10px] text-slate-400 mt-1">Role: {roleInfo.label}</p>
              </div>

              <div className="pt-2 space-y-1">
                {currentRole === 'hr' && (
                  <button
                    type="button"
                    onClick={() => { onNavigate?.('builder'); setShowProfileMenu(false); }}
                    className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-md text-slate-700 text-xs font-medium flex items-center justify-between"
                  >
                    <span>Letterhead Editor</span>
                    <FileText size={13} className="text-slate-400" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onExpireSession && onExpireSession();
                  }}
                  className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded-md text-slate-700 hover:text-slate-900 text-xs font-medium flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Lock size={12} className="text-slate-400" />
                    Lock Session
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">256-bit</span>
                </button>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout && onLogout();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-md hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-between transition-colors"
                >
                  <span>Sign Out</span>
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
