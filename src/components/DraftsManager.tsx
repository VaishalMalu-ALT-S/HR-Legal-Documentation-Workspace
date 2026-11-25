import React, { useState } from 'react';
import { 
  FileEdit, Search, ArrowRight, Trash2, Plus, 
  Building2, User, Clock, FileText, UploadCloud,
  Layers, CheckCircle, AlertCircle
} from 'lucide-react';
import { SmartDocument } from '../types';
import { DatabaseService } from '../services/dbService';
import { COMPANIES } from '../data/companies';

interface DraftsManagerProps {
  documents: SmartDocument[];
  onContinueEditing: (doc: SmartDocument) => void;
  onOpenCreate: () => void;
}

export const DraftsManager: React.FC<DraftsManagerProps> = ({
  documents,
  onContinueEditing,
  onOpenCreate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('all');
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<SmartDocument | null>(null);

  // Filter only draft documents and sort by latest updated first
  const allDrafts = documents
    .filter(d => !d.status || d.status === 'draft')
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  const filteredDrafts = allDrafts.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.personName && doc.personName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCompany = 
      selectedCompanyFilter === 'all' || doc.companyId === selectedCompanyFilter;

    return matchesSearch && matchesCompany;
  });

  const handleDeleteDraft = (doc: SmartDocument) => {
    try {
      DatabaseService.deleteDocument(doc.id);
      setDeleteConfirmDoc(null);
    } catch (e: any) {
      alert('Error deleting draft: ' + e.message);
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Recently';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getCompanyInfo = (companyId: string) => {
    return COMPANIES.find(c => c.id === companyId) || { name: 'ALT-S Technology', id: 'alt_s' };
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 font-sans">
      {/* Bento Grid Row 1: KPI Stats (Matching Growly Overview Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total Saved Drafts (Highlight Blue Card like reference Growly card) */}
        <div className="bg-[#1E6FD9] text-white p-6 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Total Saved Drafts</span>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
              <FileEdit size={14} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-4xl font-extrabold tracking-tight tabular-nums">{allDrafts.length}</span>
              <p className="text-xs text-white/80 mt-1">In-progress legal documents</p>
            </div>
            <span className="text-[11px] font-semibold bg-white text-[#1E6FD9] px-2.5 py-1 rounded-full shadow-2xs">
              Live Vault
            </span>
          </div>
        </div>

        {/* Card 2: ALT-S Corporate Docs (Clean White Bento Card) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8EDF3] shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">ALT-S Technology</span>
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Building2 size={14} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-[#0F172A] tabular-nums">
              {allDrafts.filter(d => d.companyId === 'alt_s').length}
            </span>
            <p className="text-xs text-slate-400 mt-1">Direct corporate templates</p>
          </div>
        </div>

        {/* Card 3: Uploaded Files (Clean White Bento Card) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8EDF3] shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Imported Documents</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <UploadCloud size={14} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-[#0F172A] tabular-nums">
              {allDrafts.filter(d => d.variableValues?.isUploaded === 'true' || d.variableValues?.uploadedImages).length}
            </span>
            <p className="text-xs text-slate-400 mt-1">DOCX, PDF &amp; TXT imported</p>
          </div>
        </div>

        {/* Card 4: Workflow Security (Clean White Bento Card) */}
        <div className="bg-white p-6 rounded-3xl border border-[#E8EDF3] shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security Ledger</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle size={14} />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-base">
              <span>Isolated Sandbox</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Zero unauthorized dispatches</p>
          </div>
        </div>
      </div>

      {/* Bento Card: Drafts Management Data Table Container */}
      <div className="bg-white rounded-3xl border border-[#E8EDF3] shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-6">
        {/* Table Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A]">Active Draft Records</h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                {filteredDrafts.length} Documents
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Resume composition or edit dynamic template parameters</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Pill */}
            <div className="relative w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search drafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F4F6F9] hover:bg-[#EEF2F6] focus:bg-white border border-transparent focus:border-slate-300 rounded-full text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
            </div>

            {/* Company Filter Dropdown */}
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="text-xs font-semibold bg-[#F4F6F9] border border-transparent hover:border-slate-300 text-slate-700 rounded-full px-3 py-1.5 outline-none cursor-pointer"
            >
              <option value="all">All Companies</option>
              {COMPANIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Drafts List Rows */}
        {filteredDrafts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <FileEdit size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              {allDrafts.length === 0 ? 'No drafts saved yet' : 'No matching drafts found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
              {allDrafts.length === 0
                ? 'Create or import an HR document to start composing in our verified letterhead editor.'
                : 'Clear your search filters to display all saved documents.'}
            </p>
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#162A45] hover:bg-[#0F172A] text-white text-xs font-semibold rounded-full shadow-sm transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Create New Document</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDrafts.map(doc => {
              const company = getCompanyInfo(doc.companyId);
              const isUploaded = doc.variableValues?.isUploaded === 'true' || !!doc.variableValues?.uploadedImages;

              return (
                <div
                  key={doc.id}
                  className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8FAFC] -mx-6 px-6 transition-colors group"
                >
                  {/* Left: Document info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                      isUploaded
                        ? 'bg-amber-50/80 text-amber-700 border-amber-200'
                        : 'bg-blue-50/80 text-blue-700 border-blue-200'
                    }`}>
                      {isUploaded ? <UploadCloud size={20} /> : <FileText size={20} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 tabular-nums">
                          {doc.documentNumber}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Draft
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {company.name}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-[#0F172A] truncate group-hover:text-[#1E6FD9] transition-colors">
                        {doc.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        {doc.personName && (
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-slate-400" />
                            <span>{doc.personName} {doc.personRole ? `(${doc.personRole})` : ''}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock size={12} />
                          <span>Saved {formatRelativeTime(doc.updatedAt || doc.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Pills */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmDoc(doc)}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Discard Draft"
                    >
                      <Trash2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onContinueEditing(doc)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                    >
                      <span>Continue Editing</span>
                      <ArrowRight size={13} className="text-slate-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5 border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Discard this draft?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Are you sure you want to discard <strong>{deleteConfirmDoc.title}</strong> ({deleteConfirmDoc.documentNumber})? This will permanently remove this unfinished draft.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDraft(deleteConfirmDoc)}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors shadow-xs"
              >
                Discard Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
