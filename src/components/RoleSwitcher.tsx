import React, { useState } from 'react';
import { DatabaseService } from '../services/dbService';
import { UserRole } from '../types';
import { Shield, UserCheck, Key, Eye, User, ChevronDown } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roles: { role: UserRole; label: string; desc: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }[] = [
  { role: 'hr',    label: 'HR',                     desc: 'Create and manage documents',                 icon: UserCheck, color: 'text-sky-600'    },
  { role: 'siva_kumar',   label: 'Siva Kumar',             desc: 'Managing Director - Approve & Sign',          icon: Shield,    color: 'text-amber-600'  },
  { role: 'uma_mageshwari', label: 'Uma Mageshwari',         desc: 'Board of Director - Approve & Sign',          icon: Key,       color: 'text-violet-600' },
];

const roleLabelMap: Record<string, string> = {
  hr: 'HR',
  siva_kumar: 'Siva Kumar',
  uma_mageshwari: 'Uma Mageshwari',
};

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        id="role-switcher-trigger"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span>{roleLabelMap[currentRole]}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-800">Switch Application Role</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Test role-based access control permissions</p>
            </div>
            <div className="p-1.5 space-y-0.5">
              {roles.map(r => {
                const Icon = r.icon;
                const isSelected = currentRole === r.role;
                return (
                  <button
                    key={r.role}
                    id={`role-option-${r.role}`}
                    onClick={() => { 
                      onRoleChange(r.role); 
                      DatabaseService.setSessionRole(r.role);
                      setOpen(false); 
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                      isSelected
                        ? 'bg-sky-50 border border-sky-200'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <Icon size={15} className={`mt-0.5 shrink-0 ${isSelected ? 'text-sky-600' : r.color}`} />
                    <div className="min-w-0">
                      <div className={`text-xs font-bold ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                        {r.label}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{r.desc}</div>
                    </div>
                    {isSelected && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
