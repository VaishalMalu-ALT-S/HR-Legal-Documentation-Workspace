import React, { useState } from 'react';
import { 
  FileEdit, Search, ArrowRight, Trash2, Plus, 
  Building2, User, Clock, FileText, UploadCloud,
  Layers, CheckCircle, AlertCircle, Sparkles
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

  // Filter only draft documents
  const allDrafts = documents.filter(d => d.status === 'draft');

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
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
              <FileEdit size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">HR Document Drafts</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Work-in-progress documents saved safely. Continue editing anytime or send for signatures when ready.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#0052cc] hover:bg-[#0065ff] active:bg-[#0747a6] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus size={15} />
          <span>New Document</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Saved Drafts</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">{allDrafts.length}</span>
            <span className="text-[10px] text-amber-700 font-bold px-1.5 py-0.5 rounded bg-amber-50">In Progress</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ALT-S Technology</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">
              {allDrafts.filter(d => d.companyId === 'alt_s').length}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Draft docs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploaded Files</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900">
              {allDrafts.filter(d => d.variableValues?.isUploaded === 'true' || d.variableValues?.uploadedImages).length}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">PDF / Word</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workflow Protection</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle size={14} /> 100% Isolated
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">No premature notifications or OTPs</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative w-full max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search drafts by title, recipient, or doc number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#4c9aff] focus:ring-1 focus:ring-[#4c9aff] outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium">Company:</span>
          <select
            value={selectedCompanyFilter}
            onChange={(e) => setSelectedCompanyFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 outline-none hover:border-slate-300 cursor-pointer"
          >
            <option value="all">All Companies</option>
            {COMPANIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Drafts List */}
      {filteredDrafts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <FileEdit size={26} />
          </div>
          <h3 className="font-bold text-slate-700 text-base">
            {allDrafts.length === 0 ? 'No drafts saved yet' : 'No matching drafts found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            {allDrafts.length === 0
              ? 'When HR creates or uploads a document and clicks "Save Draft", it will stay safely stored here so you can leave and continue anytime.'
              : 'Try clearing your search terms or company filter to see all saved drafts.'}
          </p>
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0052cc] hover:bg-[#0065ff] text-white text-xs font-bold rounded-xl transition-colors"
          >
            <Plus size={14} />
            <span>Create or Upload a Document</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDrafts.map(doc => {
            const company = getCompanyInfo(doc.companyId);
            const isUploaded = doc.variableValues?.isUploaded === 'true' || !!doc.variableValues?.uploadedImages;

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-indigo-300 p-4 transition-all shadow-xs hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Document info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isUploaded
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {isUploaded ? <UploadCloud size={20} /> : <FileText size={20} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                        {doc.documentNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Draft
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Building2 size={11} className="text-slate-400" />
                        {company.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {isUploaded ? '• Uploaded File' : '• Letterhead Template'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      {doc.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      {doc.personName && (
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          <span>{doc.personName} {doc.personRole ? `(${doc.personRole})` : ''}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        <span>Saved {formatRelativeTime(doc.updatedAt || doc.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => setDeleteConfirmDoc(doc)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Discard Draft"
                  >
                    <Trash2 size={15} />
                  </button>

                  <button
                    onClick={() => onContinueEditing(doc)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0065ff] active:bg-[#0747a6] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>Continue Editing</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 size={20} />
            </div>
            <h3 className="font-bold text-base text-slate-900">Discard this draft?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Are you sure you want to discard <strong>{deleteConfirmDoc.title}</strong> ({deleteConfirmDoc.documentNumber})? This will permanently remove this unfinished draft.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDraft(deleteConfirmDoc)}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
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
