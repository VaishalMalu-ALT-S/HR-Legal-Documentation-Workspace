import React, { useState } from 'react';
import { CheckCircle2, XCircle, Lock } from 'lucide-react';
import { SmartDocument, UserRole } from '../types';
import { DatabaseService } from '../services/dbService';
import { OtpVerificationModal } from './OtpVerificationModal';

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
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingApprovalStep, setPendingApprovalStep] = useState<number | null>(null);

  const initiateApproveStep = (stepNumber: number) => {
    setPendingApprovalStep(stepNumber);
    setShowOtpModal(true);
  };

  const handleApproveStep = (stepNumber: number) => {
    if (!selectedDoc) return;
    
    // Find the role for this step to authorize
    const step = selectedDoc.approvalWorkflow?.steps.find(s => s.stepNumber === stepNumber);
    if (step) {
      // Create the authorization record (This handles the step status update internally)
      const updated = DatabaseService.authorizeDocumentSignatory(
        selectedDoc.id,
        step.roleName,
        (step as any).assignedToEmail || 'test@example.com'
      );
      setSelectedDoc(updated);
    }
    setComment('');
  };

  const handleRejectStep = (stepNumber: number) => {
    if (!selectedDoc) return;
    const updated = DatabaseService.updateApprovalStatus(
      selectedDoc.id,
      stepNumber,
      'correction_required',
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
        <h1 className="text-xl font-bold text-slate-900 font-heading">Document Approval</h1>
        <p className="text-xs text-slate-500">Review and authorize documents before digital signing</p>
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
                  
                    <div className="font-bold text-xs text-slate-900 mt-1 flex flex-col gap-1">
                      <div className="truncate">{doc.title}</div>
                      
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${doc.variableValues?.isUploaded === 'true' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
                        {doc.variableValues?.isUploaded === 'true' ? 'Uploaded Document' : 'Template Document'}
                      </span>

                    </div>
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
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                      <span>Ref: {selectedDoc.documentNumber}</span>
                      <span>•</span>
                      <span>Generated on {new Date(selectedDoc.generatedAt).toLocaleDateString()}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${selectedDoc.variableValues?.isUploaded === 'true' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
                        {selectedDoc.variableValues?.isUploaded === 'true' ? 'Uploaded Document' : 'Template Document'}
                      </span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onNavigateToSignature(selectedDoc.id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    View Document
                  </button>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-brand-50 text-brand-700 border border-brand-200">
                    {selectedDoc.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Visual Approval Progress Pipeline */}
              <div className="space-y-4">
                {currentRole === 'hr' && (
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Approval Required</span>
                )}
                
                {/* Manager Authorized Documents View */}
                {currentRole !== 'hr' && (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-slate-800">Authorization Status</p>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase">
                        {selectedDoc.authorizations?.some(a => a.signatoryRole === currentRole) ? 'Authorized' : 'Pending Authorization'}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedDoc.authorizations?.filter(a => a.signatoryRole === currentRole).map(auth => (
                        <div key={auth.id} className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                          <div className="font-semibold text-slate-800 mb-1">✓ Approved by {auth.signatoryName}</div>
                          <div className="text-[10px] text-slate-500">{new Date(auth.authorizedAt).toLocaleString()}</div>
                          
                          {auth.usedAt && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <div className="font-semibold text-slate-800 mb-1">✓ Signature Placed</div>
                              <div className="text-[10px] text-slate-500">{new Date(auth.usedAt).toLocaleString()}</div>
                              <div className="text-[10px] text-slate-500">Placed by HR</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HR Detailed View */}
                {currentRole === 'hr' && (
                  <div className="space-y-3 mt-4">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Required Authorizations</p>
                    
                    {selectedDoc.approvalWorkflow?.steps?.map((step) => {
                      const auth = selectedDoc.authorizations?.find(a => a.signatoryRole === step.roleName);
                      const isApproved = !!auth;
                      
                      return (
                        <div key={step.stepNumber} className={`p-4 rounded-xl border transition-all ${
                          isApproved ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/50 border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                isApproved ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                              }`}>
                                {isApproved ? <CheckCircle2 size={16} /> : step.stepNumber}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-slate-900">{step.assignedToName}</div>
                                <p className="text-[11px] text-slate-500">{step.roleName === 'siva_kumar' ? 'Managing Director' : 'Board of Director'}</p>
                              </div>
                            </div>

                            {isApproved ? (
                              <div className="text-right">
                                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Authorized
                                </span>
                                <div className="text-[9px] text-slate-500 mt-1">{new Date(auth.authorizedAt).toLocaleString()}</div>
                              </div>
                            ) : (
                              <button
                                onClick={() => initiateApproveStep(step.stepNumber)}
                                className="px-3 py-1.5 rounded bg-[#0052cc] hover:bg-[#0047b3] text-white text-[11px] font-semibold transition-colors"
                              >
                                Send OTP to Authorize
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Contextual Action Bar */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                {currentRole === 'hr' ? (
                  <>
                    {selectedDoc.status === 'draft' && (
                      <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors">Edit</button>
                        <button className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors">Send for Approval</button>
                      </div>
                    )}
                    {selectedDoc.status === 'signature_authorized' && (
                      <div className="p-4 bg-brand-50 rounded-xl border border-brand-200 flex items-center justify-between">
                        <div className="text-sm text-brand-900 font-semibold">
                          Approved! Ready for Signature Placement.
                        </div>
                        <button
                          onClick={() => onNavigateToSignature(selectedDoc.id)}
                          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold shadow-sm"
                        >
                          Open Digital Signature Center →
                        </button>
                      </div>
                    )}
                    {selectedDoc.status === 'signed' && (
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                        <div className="text-sm text-emerald-900 font-semibold">
                          Document Finalized & Signed
                        </div>
                        <button
                          onClick={() => onNavigateToSignature(selectedDoc.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-sm flex items-center gap-2"
                        >
                          Download PDF
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {selectedDoc.status === 'signed' && (
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                        <div className="text-sm text-emerald-900 font-semibold">
                          Document Finalized & Signed
                        </div>
                        <button
                          onClick={() => onNavigateToSignature(selectedDoc.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-sm flex items-center gap-2"
                        >
                          Download PDF
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

      {/* OTP Modal */}
      <OtpVerificationModal 
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setPendingApprovalStep(null);
        }}
        onSuccess={() => {
          if (pendingApprovalStep !== null) {
            handleApproveStep(pendingApprovalStep);
            setShowOtpModal(false);
            setPendingApprovalStep(null);
          }
        }}
        title="Approve Document Stage"
        description={`Please verify your identity with OTP to formally approve stage ${pendingApprovalStep} for ${selectedDoc?.title}.`}
      />

    </div>
  );
};
