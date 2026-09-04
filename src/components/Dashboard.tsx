import React from 'react';
import {
  FileText, Clock, CheckCircle2, AlertTriangle, FileCheck,
  TrendingUp, ShieldCheck, ArrowRight, Activity, PlusCircle, PenTool, Layers,
  BarChart3, Calendar
} from 'lucide-react';
import { SmartDocument, AuditLog, UserRole } from '../types';

interface DashboardProps {
  documents: SmartDocument[];
  auditLogs: AuditLog[];
  onNavigate: (tab: string, payload?: any) => void;
  currentRole: UserRole;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'badge-slate',
  generated: 'badge-blue',
  under_review: 'badge-amber',
  approved: 'badge-green',
  pending_signature: 'badge-amber',
  signed: 'badge-green',
  rejected: 'badge-rose',
  expired: 'badge-rose',
  archived: 'badge-slate',
};

function KPICard({
  label, value, sub, icon: Icon, accent, onClick
}: {
  label: string; value: string | number; sub?: string;
  icon: any; accent: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card p-5 text-left hover:shadow-md transition-all hover:-translate-y-0.5 group w-full"
    >
      <div className="flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon size={17} />
        </div>
      </div>
      <div className="mt-3 font-heading font-extrabold text-2xl text-slate-900 tracking-tight">{value}</div>
      {sub && <div className="mt-1 text-[11px] text-slate-500">{sub}</div>}
    </button>
  );
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents, auditLogs, onNavigate, currentRole
}) => {
  const totalGenerated   = documents.length + 115;
  const pendingSignature = documents.filter(d => d.status === 'pending_signature' || d.status === 'under_review').length + 9;
  const signedDocs       = documents.filter(d => d.status === 'signed').length + 98;
  const expiringContracts = 3;
  const completionRate   = Math.round((signedDocs / totalGenerated) * 100);

  const monthlyData = [
    { month: 'Apr', gen: 18, signed: 16 },
    { month: 'May', gen: 24, signed: 22 },
    { month: 'Jun', gen: 31, signed: 29 },
    { month: 'Jul', gen: 28, signed: 25 },
    { month: 'Aug', gen: 42, signed: 38 },
    { month: 'Sep', gen: 35, signed: 32 },
  ];
  const maxVal = Math.max(...monthlyData.map(m => m.gen));

  const distribution = [
    { label: 'Appointment Letters',   count: 68, pct: 48, color: 'bg-sky-500'    },
    { label: 'Contractor Offer',      count: 32, pct: 22, color: 'bg-violet-500' },
    { label: 'Asset Forms',           count: 24, pct: 17, color: 'bg-amber-500'  },
    { label: 'Bond Agreements',       count: 12, pct:  8, color: 'bg-emerald-500'},
    { label: 'Policy Acknowledgements',count: 6, pct:  5, color: 'bg-slate-400'  },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* Hero Banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-5"
        style={{ background: 'linear-gradient(135deg, #0b1629 0%, #0f2a50 60%, #0c3568 100%)' }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(14,165,233,0.4) 0%, transparent 55%)' }}
        />
        <div className="relative space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/25 text-sky-300 text-[11px] font-semibold uppercase tracking-wider">
            <ShieldCheck size={12} />
            SHA-256 Cryptographic Document Integrity Active
          </div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-white">
            SmartDoc Sign Enterprise
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            End-to-end automation for employee and contractor document workflows — from dynamic DOCX
            templates and multi-level approvals to DSC digital signatures, tamper-proof PDF storage,
            QR-based verification and immutable audit logging.
          </p>
        </div>
        <div className="relative flex items-center gap-3 shrink-0">
          {(currentRole === 'super_admin' || currentRole === 'hr_admin') && (
            <button
              id="hero-generate-btn"
              onClick={() => onNavigate('wizard')}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', boxShadow: '0 4px 16px rgba(2,132,199,0.35)' }}
            >
              <PlusCircle size={15} />
              Generate Document
            </button>
          )}
          <button
            onClick={() => onNavigate('differentiators')}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            Platform Overview
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Total Generated" value={totalGenerated}
          icon={FileText} accent="bg-sky-50 text-sky-600"
          sub="+18% this month"
          onClick={() => onNavigate('vault')} />
        <KPICard label="Pending Signature" value={pendingSignature}
          icon={Clock} accent="bg-amber-50 text-amber-600"
          sub="Requires action"
          onClick={() => onNavigate('signature')} />
        <KPICard label="Signed & Valid" value={signedDocs}
          icon={CheckCircle2} accent="bg-emerald-50 text-emerald-600"
          sub="Cryptographically sealed"
          onClick={() => onNavigate('vault')} />
        <KPICard label="Expiring Contracts" value={expiringContracts}
          icon={AlertTriangle} accent="bg-rose-50 text-rose-600"
          sub="Within 30 days"
          onClick={() => onNavigate('vault')} />
        <KPICard label="Active Templates" value={5}
          icon={Layers} accent="bg-violet-50 text-violet-600"
          sub="Version controlled"
          onClick={() => onNavigate('templates')} />
        <KPICard label="Completion Rate" value={`${completionRate}%`}
          icon={ShieldCheck} accent="bg-indigo-50 text-indigo-600"
          sub="Signature efficiency"
          onClick={() => onNavigate('vault')} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-heading font-bold text-[15px] text-slate-900">Generation & Signing Velocity</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">Monthly documents generated vs digitally signed — FY 2026</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-200 inline-block" />Generated
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-600 inline-block" />Signed
              </span>
            </div>
          </div>
          <div className="h-44 flex items-end gap-3">
            {monthlyData.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  <div
                    style={{ height: `${(m.gen / maxVal) * 100}%` }}
                    className="flex-1 bg-sky-100 group-hover:bg-sky-200 rounded-t transition-colors"
                    title={`Generated: ${m.gen}`}
                  />
                  <div
                    style={{ height: `${(m.signed / maxVal) * 100}%` }}
                    className="flex-1 bg-sky-600 group-hover:bg-sky-700 rounded-t transition-colors"
                    title={`Signed: ${m.signed}`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribution */}
        <div className="card p-6 flex flex-col">
          <h3 className="font-heading font-bold text-[15px] text-slate-900 mb-1">Template Distribution</h3>
          <p className="text-[12px] text-slate-500 mb-5">Document category breakdown</p>
          <div className="space-y-3 flex-1">
            {distribution.map(d => (
              <div key={d.label}>
                <div className="flex justify-between text-[12px] font-medium text-slate-700 mb-1">
                  <span className="truncate mr-2">{d.label}</span>
                  <span className="font-bold text-slate-900 shrink-0">{d.count} ({d.pct}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Pending Actions + Audit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Pending Actions */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-[15px] text-slate-900">Pending Actions</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">Items requiring approval or digital signing</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="space-y-3">

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-bold text-amber-900">Contractor Offer Letter — Vrutika Prajapati</span>
                    <span className="badge badge-amber">Pending Signature</span>
                  </div>
                  <p className="text-[12px] text-amber-700 mt-1">Oracle Technical Consultant · Engagement from 10-Aug-2026</p>
                </div>
                <button
                  onClick={() => onNavigate('signature', { documentId: 'doc-002' })}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <PenTool size={13} />Sign
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-bold text-sky-900">Appointment Letter — Lokesh Kumar</span>
                    <span className="badge badge-blue">Under Review</span>
                  </div>
                  <p className="text-[12px] text-sky-700 mt-1">Oracle HRMS Solution Architect · CTC: Rs 24,00,000</p>
                </div>
                <button
                  onClick={() => onNavigate('approvals', { documentId: 'doc-001' })}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[12px] font-semibold shrink-0 transition-colors"
                >
                  Review
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[13px] font-bold text-slate-900">Asset Allocation Form — Vaishal Malu</span>
                  <p className="text-[12px] text-slate-500 mt-1">Laptop & Charger · Serial: 9337D21F-C5FE...</p>
                </div>
                <button
                  onClick={() => onNavigate('vault', { documentId: 'doc-003' })}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[12px] font-semibold shrink-0 transition-colors"
                >
                  View
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Audit Timeline */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-[15px] text-slate-900">Live Audit Activity</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">Immutable system event log stream</p>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-[12px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-1 before:bottom-1 before:w-px before:bg-slate-200">
            {auditLogs.slice(0, 4).map(log => (
              <div key={log.id} className="relative">
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-sky-500 border-2 border-white ring-2 ring-sky-100" />
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold text-slate-800 leading-snug">{log.action}</span>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">{log.details}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                  <span>{log.userName}</span>
                  <span>·</span>
                  <span className="font-mono">{log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
