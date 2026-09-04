import React from 'react';
import { 
  CheckCircle2, ShieldCheck, Layers, FileCode2, Key, 
  History, UserCheck, Lock, Upload, Sparkles, ArrowRight
} from 'lucide-react';

interface WhySmartDocSignProps {
  onNavigate: (tab: string) => void;
}

export const WhySmartDocSign: React.FC<WhySmartDocSignProps> = ({ onNavigate }) => {
  const differentiators = [
    {
      num: '01',
      title: 'Template-Driven Automation',
      desc: 'Eliminates repetitive manual document creation with automated employee variable injection.',
      icon: Layers,
      tab: 'templates'
    },
    {
      num: '02',
      title: 'Configurable Without Code',
      desc: 'HR admins can modify clauses, wording, and annexures without requiring developer code changes.',
      icon: FileCode2,
      tab: 'templates'
    },
    {
      num: '03',
      title: 'DSC-Ready Hardware Architecture',
      desc: 'Designed for legally valid digital signatures with eMudhra / Capricorn USB Hardware Token integration.',
      icon: Key,
      tab: 'signature'
    },
    {
      num: '04',
      title: 'SHA-256 Tamper Detection',
      desc: 'Every document generates a cryptographic SHA-256 hash to immediately flag any post-signing alteration.',
      icon: ShieldCheck,
      tab: 'verification'
    },
    {
      num: '05',
      title: 'QR-Based Verification',
      desc: 'Instant authenticity verification via QR code scanning linking directly to public verification ledger.',
      icon: CheckCircle2,
      tab: 'verification'
    },
    {
      num: '06',
      title: 'Immutable Audit Trail',
      desc: 'Records every single action, user ID, timestamp, and IP address for 100% compliance auditing.',
      icon: History,
      tab: 'audit'
    },
    {
      num: '07',
      title: 'Multi-Level Enterprise Approvals',
      desc: 'Configurable approval pipelines (HR → Manager → Legal → Signatory → Employee).',
      icon: UserCheck,
      tab: 'approvals'
    },
    {
      num: '08',
      title: 'Secure Document Vault',
      desc: 'Centralized document repository with role-based access control and secure password sharing.',
      icon: Lock,
      tab: 'vault'
    },
    {
      num: '09',
      title: 'Bulk Batch Generation',
      desc: 'Upload CSV data files to batch generate hundreds of appointment letters & agreements at once.',
      icon: Upload,
      tab: 'bulk'
    },
    {
      num: '10',
      title: 'AI-Assisted Template Intelligence',
      desc: 'Smart clause suggestion engine, variable validation, and completeness risk scoring.',
      icon: Sparkles,
      tab: 'templates'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-brand-900 text-white p-8 rounded-2xl shadow-xl text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-bold uppercase tracking-wider">
          Enterprise Differentiators
        </span>
        <h1 className="text-3xl font-extrabold font-heading text-white">Why SmartDoc Sign?</h1>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto">
          The 10 key technical innovations replacing manual paper-based document workflows with automated, tamper-proof digital signature lifecycle management.
        </p>
      </div>

      {/* 10 Differentiators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {differentiators.map(diff => {
          const Icon = diff.icon;
          return (
            <div
              key={diff.num}
              onClick={() => onNavigate(diff.tab)}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Icon size={20} />
                </div>
                <span className="font-mono text-xs font-extrabold text-slate-300 group-hover:text-brand-500">
                  {diff.num}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 font-heading">{diff.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{diff.desc}</p>

              <div className="pt-2 text-xs font-bold text-brand-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Explore Module <ArrowRight size={13} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
