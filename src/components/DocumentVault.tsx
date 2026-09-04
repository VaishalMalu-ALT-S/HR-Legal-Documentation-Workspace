import React, { useState } from 'react';
import { 
  FileCheck, Search, Filter, Download, Share2, ShieldCheck, 
  Eye, Archive, AlertTriangle, RefreshCw, FileText, CheckCircle2, Lock, X
} from 'lucide-react';
import { SmartDocument, UserRole } from '../types';
import { DatabaseService } from '../services/dbService';
import { DocumentProcessor } from '../services/documentProcessor';

interface DocumentVaultProps {
  documents: SmartDocument[];
  currentRole: UserRole;
  onNavigateToVerify: (docId: string) => void;
  onOpenShareModal: (docId: string) => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  currentRole,
  onNavigateToVerify,
  onOpenShareModal
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<SmartDocument | null>(null);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
                          doc.personName.toLowerCase().includes(search.toLowerCase()) ||
                          doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSimulateTamper = (docId: string) => {
    DatabaseService.simulateTamper(docId);
  };

  const handleRestoreIntegrity = (docId: string) => {
    DatabaseService.restoreIntegrity(docId);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-heading">Secure Document Vault</h1>
          <p className="text-xs text-slate-500">Centralized tamper-proof repository for generated and digitally signed documents</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Total Vault Records: <strong className="text-slate-900">{documents.length}</strong></span>
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
            placeholder="Search by Document ID, recipient name, or title..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Document Statuses</option>
            <option value="signed">Signed & Verified</option>
            <option value="pending_signature">Pending Signature</option>
            <option value="under_review">Under Review</option>
            <option value="generated">Generated</option>
          </select>
        </div>
      </div>

      {/* Main Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Document ID</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Template Ver</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4">Status & Integrity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredDocs.map(doc => {
                const isTampered = doc.isTampered;
                const isSigned = doc.status === 'signed';

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">{doc.documentNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{doc.personName}</div>
                      <div className="text-[11px] text-slate-400">{doc.personRole}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{doc.title}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">v{doc.templateVersionNumber}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(doc.generatedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      {isTampered ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 w-max animate-pulse">
                          <AlertTriangle size={12} /> TAMPERED
                        </span>
                      ) : isSigned ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                          <CheckCircle2 size={12} /> Signed & Valid
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 w-max capitalize">
                          {doc.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPreviewDoc(doc)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                          title="Preview Document"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => onOpenShareModal(doc.id)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-brand-600"
                          title="Share Secure Link"
                        >
                          <Share2 size={15} />
                        </button>
                        <button
                          onClick={() => onNavigateToVerify(doc.documentNumber)}
                          className="px-2.5 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-[11px] border border-brand-200"
                          title="Verify SHA-256 Hash"
                        >
                          Verify Hash
                        </button>

                        {/* Tamper Simulation Toggle for Testing */}
                        {isTampered ? (
                          <button
                            onClick={() => handleRestoreIntegrity(doc.id)}
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200"
                            title="Restore Original Hash"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSimulateTamper(doc.id)}
                            className="px-2 py-1 rounded bg-rose-50 text-rose-600 font-bold text-[10px] border border-rose-200"
                            title="Simulate Tamper Attack"
                          >
                            Tamper
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">{selectedPreviewDoc.title}</h3>
                <p className="text-xs text-slate-500 font-mono">Ref: {selectedPreviewDoc.documentNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => DocumentProcessor.exportToPDF('pdf-document-paper', `${selectedPreviewDoc.documentNumber}.pdf`)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Download size={14} /> Download PDF
                </button>
                <button onClick={() => setSelectedPreviewDoc(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700" title="Close Preview">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto p-4 bg-slate-100 rounded-xl">
              <div dangerouslySetInnerHTML={{ __html: selectedPreviewDoc.contentRenderedHtml || DocumentProcessor.renderLetterheadHTML(selectedPreviewDoc.title, 'Sample preview content', selectedPreviewDoc.variableValues, selectedPreviewDoc.signatures, selectedPreviewDoc.documentNumber, '') }} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
