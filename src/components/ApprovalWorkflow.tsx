import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, XCircle, MessageSquare, ShieldCheck, 
  ArrowRight, Filter, Eye, UserCheck, AlertCircle
} from 'lucide-react';
import { SmartDocument, UserRole } from '../types';
import { DatabaseService } from '../services/dbService';

interface ApprovalWorkflowProps {
  documents: SmartDocument[];
  currentRole: UserRole;
  onNavigateToSignature: (docId: string) => void;
}

export const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({
  documents,
  currentRole,
  onNavigateToSignature
}) => {
  const [selectedDoc, setSelectedDoc] = useState<SmartDocument>(documents[0] || null);
  const [comment, setComment] = useState('');

  const handleApproveStep = (stepNumber: number) => {
    if (!selectedDoc) return;
    const updated = DatabaseService.updateApprovalStatus(
      selectedDoc.id,
      stepNumber,
      'approved',
      comment || 'Approved after review.',
      'Suresh Kumar',
      currentRole
    );
    setSelectedDoc(updated);
    setComment('');
  };

  const handleRejectStep = (stepNumber: number) => {
    if (!selectedDoc) return;
    const updated = DatabaseService.updateApprovalStatus(
      selectedDoc.id,
      stepNumber,
      'rejected',
      comment || 'Rejected during review.',
      'Suresh Kumar',
      currentRole
    );
    setSelectedDoc(updated);
    setComment('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 font-heading">Multi-Stage Document Approval Workflows</h1>
        <p className="text-xs text-slate-500">Track and authorize multi-level approvals before digital signing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Document Selection List */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Approval Queue</span>
          
          <div className="space-y-2">
            {documents.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected ? 'bg-brand-50 border-brand-300 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-brand-700">{doc.documentNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      doc.status === 'signed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {doc.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 mt-1 truncate">{doc.title}</div>
                  <p className="text-[11px] text-slate-500">{doc.personName} • {doc.personRole}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Workflow Status Details */}
        {selectedDoc && (
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-heading">{selectedDoc.title}</h3>
                  <p className="text-xs text-slate-500 font-mono">Ref: {selectedDoc.documentNumber} • Generated on {new Date(selectedDoc.generatedAt).toLocaleDateString()}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                  {selectedDoc.status.replace('_', ' ')}
                </span>
              </div>

              {/* Visual Approval Progress Pipeline */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Approval Sequence</span>
                
                <div className="space-y-3">
                  {selectedDoc.approvalWorkflow?.steps.map((step) => {
                    const isApproved = step.status === 'approved';
                    const isRejected = step.status === 'rejected';
                    const isPending = step.status === 'pending';

                    return (
                      <div key={step.stepNumber} className={`p-4 rounded-xl border transition-all ${
                        isApproved ? 'bg-emerald-50/50 border-emerald-200' : isRejected ? 'bg-rose-50/50 border-rose-200' : 'bg-amber-50/50 border-amber-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isApproved ? 'bg-emerald-500 text-white' : isRejected ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {isApproved ? <CheckCircle2 size={16} /> : isRejected ? <XCircle size={16} /> : step.stepNumber}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900">{step.roleName}</div>
                              <p className="text-[11px] text-slate-500">{step.assignedToName || 'Assigned Reviewer'}</p>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold capitalize ${
                            isApproved ? 'bg-emerald-100 text-emerald-800' : isRejected ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {step.status}
                          </span>
                        </div>

                        {step.comment && (
                          <div className="mt-2 text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200 font-medium">
                             "{step.comment}"
                          </div>
                        )}

                        {/* Action Buttons for Pending Step */}
                        {isPending && (currentRole === 'super_admin' || currentRole === 'hr_admin' || currentRole === 'signatory') && (
                          <div className="mt-3 pt-3 border-t border-amber-200/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <input
                              type="text"
                              value={comment}
                              onChange={e => setComment(e.target.value)}
                              placeholder="Add approval comment or feedback..."
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleRejectStep(step.stepNumber)}
                                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleApproveStep(step.stepNumber)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                Approve Stage
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next Action Button */}
              {selectedDoc.status === 'pending_signature' && (
                <div className="p-4 bg-brand-50 rounded-xl border border-brand-200 flex items-center justify-between">
                  <div className="text-xs text-brand-900 font-semibold">
                    All approval stages passed! Ready for DSC Digital Signing.
                  </div>
                  <button
                    onClick={() => onNavigateToSignature(selectedDoc.id)}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm"
                  >
                    Open Digital Signature Center →
                  </button>
                </div>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
