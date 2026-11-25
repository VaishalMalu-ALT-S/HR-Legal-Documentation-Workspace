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
    <header className="h-16 bg-[#F4F6F9] px-6 flex items-center justify-between shrink-0 select-none z-40 relative font-sans">
      {/* Left Section: Page Heading & Subtitle */}
      <div className="flex flex-col justify-center">
        <h1 className="text-xl md:text-2xl font-bold text-[#0F172A] tracking-tight">
          {activeTab === 'signature' && 'Document Signing Studio'}
          {activeTab === 'builder' && 'Corporate Letterhead Editor'}
          {activeTab === 'drafts' && 'HR Document Drafts'}
          {activeTab === 'approval' && (currentRole === 'hr' ? 'Document Signature Pipeline' : 'Signature Requests')}
        </h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          {activeTab === 'signature' && 'Review, authorize, and cryptographically stamp corporate documents'}
          {activeTab === 'builder' && 'Compose multi-page letterhead documents with official branding'}
          {activeTab === 'drafts' && 'Safely stored work-in-progress legal documents and templates'}
          {activeTab === 'approval' && 'Executive single-use OTP authorization and ledger tracking'}
        </p>
      </div>

      {/* Center: Search Pill (Matching reference: filled gray, rounded-full, with ⌘K badge) */}
      <div className="hidden md:flex items-center relative w-72 lg:w-96">
        <Search size={15} className="absolute left-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search for data / people / documents..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="w-full pl-10 pr-12 py-2 text-xs bg-[#EEF2F6] hover:bg-[#E2E8F0]/70 focus:bg-white border border-transparent focus:border-slate-300 rounded-full text-slate-800 placeholder:text-slate-400 outline-none transition-all shadow-inner"
        />
        <div className="absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white/80 border border-slate-200 pointer-events-none shadow-2xs">
          ⌘ K
        </div>
      </div>

      {/* Right Section: Action Controls, Role Switcher & Executive Profile */}
      <div className="flex items-center gap-3">
        {/* Quick New Document (HR Only) */}
        {currentRole === 'hr' && (
          <button
            type="button"
            onClick={onOpenCreate}
            className="h-9 px-4 bg-[#162A45] hover:bg-[#0F172A] text-white text-xs font-semibold rounded-full flex items-center gap-2 shadow-sm active:scale-98 transition-all cursor-pointer"
            title="Create or import a new document"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>New Document</span>
          </button>
        )}

        {/* Share / Verification Utility Button (matching reference share button) */}
        <button
          type="button"
          onClick={() => {
            if (activeTab === 'signature') onNavigate?.('approval');
            else onNavigate?.('signature');
          }}
          className="h-9 px-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-full flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          title="Share & Verify"
        >
          <Sparkles size={14} className="text-amber-500" />
          <span className="hidden sm:inline">Ledger</span>
        </button>

        {/* Role Switcher Pill Dropdown */}
        <div className="relative">
          <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
        </div>

        {/* Executive Profile Avatar (Matching circular pill in reference) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-slate-900 border border-slate-300 flex items-center justify-center text-white text-xs font-bold shadow-2xs hover:ring-2 hover:ring-slate-400 transition-all cursor-pointer"
            title={`${roleInfo.name} (${roleInfo.label})`}
          >
            {roleInfo.initials}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
              <div className="flex items-center gap-3 p-2 border-b border-slate-100 mb-2">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  {roleInfo.initials}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 truncate">{roleInfo.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate">{roleInfo.email}</div>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="px-2 py-1.5 bg-slate-50 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Session Security</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active
                  </span>
                </div>

                {onExpireSession && (
                  <button
                    type="button"
                    onClick={() => { setShowProfileMenu(false); onExpireSession(); }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center justify-between transition-colors"
                  >
                    <span>Test Expire Session</span>
                    <Lock size={13} className="text-slate-400" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { setShowProfileMenu(false); onLogout?.(); }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-rose-50 text-rose-700 font-semibold flex items-center justify-between transition-colors"
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
