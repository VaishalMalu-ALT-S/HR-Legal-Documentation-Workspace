import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, Clock, Eye, ShieldCheck, FileText, Send, ChevronRight } from 'lucide-react';
import { SmartDocument, UserRole, SignatureRequest } from '../types';
import { DatabaseService } from '../services/dbService';
import { OtpVerificationModal } from './OtpVerificationModal';

interface SignatureRequestsProps {
  documents: SmartDocument[];
  currentRole: UserRole;
  onNavigateToSignature: (docId: string) => void;
}

export const ApprovalWorkflow: React.FC<SignatureRequestsProps> = ({
  documents,
  currentRole,
  onNavigateToSignature
}) => {
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // OTP states — HR mode
  const [hrOtpReqId, setHrOtpReqId] = useState<string | null>(null);

  // OTP states — Signer mode (after clicking Approve)
  const [signerOtpInfo, setSignerOtpInfo] = useState<{reqId: string; otp: string; expiresAt: string} | null>(null);

  const reload = () => {
    if (currentRole === 'hr') {
      setRequests(DatabaseService.getSignatureRequests());
    } else {
      setRequests(DatabaseService.getRequestsForSigner(currentRole as any));
    }
  };

  useEffect(() => {
    reload();
    return DatabaseService.subscribe(reload);
  }, [currentRole]);

  const groupedDocs = React.useMemo(() => {
    const map = new Map<string, { docId: string; title: string; num: string; reqs: SignatureRequest[] }>();
    requests.forEach(r => {
      if (!map.has(r.documentId)) {
        map.set(r.documentId, {
          docId: r.documentId,
          title: r.documentTitle,
          num: r.documentNumber,
          reqs: []
        });
      }
      map.get(r.documentId)!.reqs.push(r);
    });
    return Array.from(map.values());
  }, [requests]);

  const selectedDoc = groupedDocs.find(g => g.docId === selectedDocId) ?? groupedDocs[0] ?? null;

  // ── Signer: Approve (generates OTP)
  const handleSignerApprove = (reqId: string) => {
    try {
      const updated = DatabaseService.signerApproveRequest(reqId);
      setSignerOtpInfo({
        reqId: updated.id,
        otp: updated.otpCode!,
        expiresAt: updated.otpExpiresAt!
      });
      reload();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // ── HR: Verify OTP entered
  const handleHrOtpSuccess = (otp: string) => {
    if (!hrOtpReqId) return;
    DatabaseService.hrVerifySignatureOtp(hrOtpReqId, otp);
    setHrOtpReqId(null);
    reload();
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 font-sans">
      {/* Header Bento Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8EDF3] shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 shadow-2xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
                {currentRole === 'hr' ? 'Executive Signature Pipeline' : 'Signature Authorization Requests'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentRole === 'hr'
                  ? 'Manage, verify single-use OTPs, and unlock corporate signatures for placement'
                  : 'Review HR legal documents awaiting your cryptographic signing authorization'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F4F6F9] text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Realtime Pipeline</span>
          </span>
        </div>
      </div>

      {groupedDocs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8EDF3] p-16 text-center shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Send size={24} />
          </div>
          <p className="font-bold text-slate-800 text-base">No signature requests in queue</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            {currentRole === 'hr'
              ? 'Open any draft in the Signature Studio and click "Request Signature" to initiate an executive authorization flow.'
              : 'HR has not dispatched any documents for your authorization yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Request List Grouped By Document (Bento Card) */}
          <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-[#E8EDF3] shadow-[0_1px_3px_rgba(15,23,42,0.03)] space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Documents ({groupedDocs.length})
              </span>
            </div>
            <div className="space-y-2">
              {groupedDocs.map(docGroup => {
                const allAuth = docGroup.reqs.every(r => r.authorizedAt);
                const someReady = docGroup.reqs.some(r => r.status === 'approved' && !r.authorizedAt);
                const badge = allAuth ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-600" /> Authorized
                  </span>
                ) : someReady ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                    <Clock size={11} className="text-amber-600" /> OTP Ready
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                    Pending
                  </span>
                );

                const isSelected = selectedDoc?.docId === docGroup.docId;

                return (
                  <button
                    key={docGroup.docId}
                    type="button"
                    onClick={() => setSelectedDocId(docGroup.docId)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F8FAFC] border-slate-300 shadow-2xs ring-1 ring-slate-900/5'
                        : 'border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200 tabular-nums">
                        {docGroup.num}
                      </span>
                      {badge}
                    </div>
                    <div className="font-bold text-xs text-[#0F172A] truncate">{docGroup.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{docGroup.reqs.length} Signer{docGroup.reqs.length > 1 ? 's' : ''} Requested</span>
                      <ChevronRight size={13} className="text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detail View (Bento Card) */}
          {selectedDoc && (
            <div className="lg:col-span-2 space-y-5">
              
              {/* Document Overview Header */}
              <div className="bg-white rounded-3xl border border-[#E8EDF3] shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-6 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 tabular-nums">
                      {selectedDoc.num}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-[#0F172A] truncate">{selectedDoc.title}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Authorization and OTP workflow verification ledger</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToSignature(selectedDoc.docId)}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Open in Canvas</span>
                </button>
              </div>

              {/* Loop through signers for this document */}
              {selectedDoc.reqs.map(req => (
                <div key={req.id} className="bg-white rounded-3xl border border-[#E8EDF3] shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-6 space-y-5">
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-slate-900 text-white text-[11px] font-semibold flex items-center justify-center shadow-2xs">
                        {req.signatoryRole === 'siva_kumar' ? 'SK' : req.signatoryRole === 'uma_mageshwari' ? 'UM' : 'S'}
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-xs">
                          {req.signatoryName}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {req.signatoryRole === 'siva_kumar' ? 'Managing Director' : 'Director'}
                        </p>
                      </div>
                    </div>

                    <div>
                      {req.authorizedAt ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-emerald-600" /> Authorized
                        </span>
                      ) : req.status === 'approved' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                          <Clock size={11} className="text-amber-600" /> OTP Generated
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Pending Approval
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Signer info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200">
                      <p className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider mb-1">Requested Signer</p>
                      <p className="font-semibold text-slate-800">{req.signatoryName}</p>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">{req.signatoryEmail}</p>
                    </div>
                    <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200">
                      <p className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider mb-1">Requested By</p>
                      <p className="font-semibold text-slate-800">{req.requestedBy}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5 font-mono">{new Date(req.requestedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Status Flow */}
                  <div className="border-t border-slate-100 pt-3.5 space-y-3">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Signing Progress</p>

                    {/* Step 1: Request Sent */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 size={12} />
                      </div>
                      <div className="flex-1 flex items-baseline justify-between">
                        <p className="font-semibold text-slate-800">1. Signature Request Sent</p>
                        <p className="text-slate-400 text-[11px] font-mono">{new Date(req.requestedAt).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    {/* Step 2: Signer Approved */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        req.status === 'approved' || req.authorizedAt
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        {req.status === 'approved' || req.authorizedAt
                          ? <CheckCircle2 size={12} />
                          : <Clock size={12} />
                        }
                      </div>
                      <div className="flex-1 flex items-baseline justify-between">
                        <p className={`font-semibold ${req.status === 'approved' || req.authorizedAt ? 'text-slate-800' : 'text-slate-400'}`}>
                          2. Approved by {req.signatoryName} • Security Passcode Issued
                        </p>
                        {req.otpGeneratedAt && (
                          <p className="text-slate-400 text-[11px] font-mono">{new Date(req.otpGeneratedAt).toLocaleTimeString()}</p>
                        )}
                      </div>
                    </div>

                    {/* Step 3: OTP Verified */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        req.authorizedAt ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {req.authorizedAt
                          ? <CheckCircle2 size={12} />
                          : <Lock size={12} />
                        }
                      </div>
                      <div className="flex-1 flex items-baseline justify-between">
                        <p className={`font-semibold ${req.authorizedAt ? 'text-slate-800' : 'text-slate-400'}`}>
                          3. Passcode Confirmed • Signature Ready to Place
                        </p>
                        {req.authorizedAt && (
                          <p className="text-slate-400 text-[11px] font-mono">{new Date(req.authorizedAt).toLocaleTimeString()}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Panel */}

                  {/* ── HR: Not yet approved by signer */}
                  {currentRole === 'hr' && !req.authorizedAt && req.status === 'pending' && (
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-amber-700" />
                        <p className="font-semibold text-amber-900 text-xs">Waiting for {req.signatoryName}</p>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        {req.signatoryName} has been notified to review the document and provide authorization.
                      </p>
                    </div>
                  )}

                  {/* ── HR: Signer approved, OTP ready — enter it */}
                  {currentRole === 'hr' && !req.authorizedAt && req.status === 'approved' && (
                    <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <ShieldCheck size={15} className="text-blue-700" />
                          <p className="font-semibold text-blue-900 text-xs">Passcode Ready to Verify</p>
                        </div>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          {req.signatoryName} has authorized signing. Enter their 6-digit passcode to place their signature on the document.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHrOtpReqId(req.id)}
                        className="shrink-0 px-4 py-2 rounded-full bg-[#162A45] hover:bg-[#0F172A] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                      >
                        Enter Passcode
                      </button>
                    </div>
                  )}

                  {/* ── HR: Authorized — go to signature studio */}
                  {currentRole === 'hr' && req.authorizedAt && (
                    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <CheckCircle2 size={15} className="text-emerald-700" />
                          <p className="font-semibold text-emerald-900 text-xs">Ready to Sign</p>
                        </div>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                          {req.signatoryName}'s signature is unlocked. Open the studio to place their signature on the contract.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigateToSignature(selectedDoc.docId)}
                        className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                      >
                        <ShieldCheck size={13} />
                        Place Signature in Studio
                      </button>
                    </div>
                  )}

                  {/* ── Signer: Pending — Approve */}
                  {currentRole !== 'hr' && !req.authorizedAt && req.status === 'pending' && (
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-indigo-600" />
                        <p className="text-xs font-semibold text-slate-900">Executive Authorization Required</p>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong>{req.requestedBy}</strong> has submitted this document for your digital signature and corporate authorization.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSignerApprove(req.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                      >
                        <ShieldCheck size={13} />
                        <span>Approve &amp; Generate Authorization OTP</span>
                      </button>
                    </div>
                  )}

                  {/* ── Signer: OTP generated — show it */}
                  {currentRole !== 'hr' && !req.authorizedAt && req.status === 'approved' && req.otpCode && (
                    <div className="bg-emerald-50/80 border border-emerald-300 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-700" />
                        <p className="font-semibold text-emerald-950 text-xs">Authorization Approved</p>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Share this single-use authorization OTP with HR to authorize signature placement:
                      </p>
                      <div className="bg-white border border-emerald-200 rounded-lg p-3 text-center shadow-2xs">
                        <p className="text-2xl font-black tracking-[0.3em] text-slate-900 font-mono tabular-nums">{req.otpCode}</p>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-mono">
                        Valid until {new Date(req.otpExpiresAt!).toLocaleTimeString()}
                      </p>
                    </div>
                  )}

                  {/* ── Signer: Done */}
                  {currentRole !== 'hr' && req.authorizedAt && (
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5 flex items-center gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
                      <div>
                        <p className="font-semibold text-emerald-950 text-xs">Signature Successfully Authorized</p>
                        <p className="text-xs text-emerald-800 mt-0.5">
                          HR verified your single-use OTP and the document has entered final placement.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* HR OTP entry modal */}
      {hrOtpReqId && (() => {
        const req = requests.find(r => r.id === hrOtpReqId);
        return (
          <OtpVerificationModal
            isOpen={true}
            onClose={() => setHrOtpReqId(null)}
            onSuccess={handleHrOtpSuccess}
            title="Verify Signature Authorization"
            mode="hr_enter_otp"
            signerName={req?.signatoryName}
            signerEmail={req?.signatoryEmail}
          />
        );
      })()}

      {/* Signer OTP display (after they approve — show OTP they need to share) */}
      {signerOtpInfo && (
        <OtpVerificationModal
          isOpen={true}
          onClose={() => setSignerOtpInfo(null)}
          onSuccess={() => setSignerOtpInfo(null)}
          title="Your Authorization OTP"
          mode="signer_approve"
          otpToShow={signerOtpInfo.otp}
          otpExpiresAt={signerOtpInfo.expiresAt}
        />
      )}
    </div>
  );
};
