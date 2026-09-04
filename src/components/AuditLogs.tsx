import React, { useState } from 'react';
import { History, Search, ShieldCheck, Filter, User, Terminal, Laptop } from 'lucide-react';
import { AuditLog, UserRole } from '../types';

interface AuditLogsProps {
  auditLogs: AuditLog[];
  currentRole: UserRole;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ auditLogs, currentRole }) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
                          log.userName.toLowerCase().includes(search.toLowerCase()) ||
                          log.details.toLowerCase().includes(search.toLowerCase()) ||
                          (log.documentNumber && log.documentNumber.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-heading">Immutable System Audit Trail</h1>
          <p className="text-xs text-slate-500">Complete tamper-evident log history of all document generation, approval, and digital signature events</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span>Audit Logging: <strong>IMMUTABLE ACTIVE</strong></span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs by action, user, or Document ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All User Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="hr_admin">HR Admin</option>
            <option value="signatory">Authorized Signatory</option>
            <option value="auditor">Auditor / System</option>
          </select>
        </div>
      </div>

      {/* Audit Timeline Feed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 space-y-6">
          {filteredLogs.map(log => (
            <div key={log.id} className="relative pl-10 space-y-2 group">
              <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-brand-600 border-2 border-white ring-4 ring-brand-100 transition-all group-hover:scale-125"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{log.action}</span>
                  {log.documentNumber && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      {log.documentNumber}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">{log.details}</p>

              <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-mono pt-1">
                <span className="flex items-center gap-1 text-slate-600">
                  <User size={12} /> {log.userName} (<strong className="capitalize text-slate-700">{log.userRole.replace('_', ' ')}</strong>)
                </span>
                <span className="flex items-center gap-1">
                  <Laptop size={12} /> IP: {log.ipAddress}
                </span>
                {log.previousStatus && log.newStatus && (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-sans">
                    State: {log.previousStatus} → <strong>{log.newStatus}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
