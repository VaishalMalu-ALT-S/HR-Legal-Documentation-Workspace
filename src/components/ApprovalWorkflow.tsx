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
    try {
      DatabaseService.hrVerifySignatureOtp(hrOtpReqId, otp);
      setHrOtpReqId(null);
      reload();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-brand-900">
          {currentRole === 'hr' ? 'Signature Requests' : 'My Signature Requests'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {currentRole === 'hr'
            ? 'Manage signature authorization requests sent to signers'
            : 'Documents where your signature has been requested'}
        </p>
      </div>

      {groupedDocs.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <Send size={40} className="mx-auto text-slate-300 mb-4" />
          <p className="font-bold text-slate-500">No signature requests yet</p>
          <p className="text-xs text-slate-400 mt-1">
            {currentRole === 'hr'
              ? 'Open a document in the Signature Studio and click "Request Signature" to start'
              : 'HR will send you a signature request when your authorization is needed'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Request List Grouped By Document */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Documents ({groupedDocs.length})
            </span>
            <div className="space-y-2 mt-2">
              {groupedDocs.map(docGroup => {
                const allAuth = docGroup.reqs.every(r => r.authorizedAt);
                const someReady = docGroup.reqs.some(r => r.status === 'approved' && !r.authorizedAt);
                const badge = allAuth ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-brand-900">✓ Fully Authorized</span> :
                              someReady ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">⏳ OTP Ready</span> :
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-200">Pending</span>;

                return (
                  <button
                    key={docGroup.docId}
                    onClick={() => setSelectedDocId(docGroup.docId)}
                    className={`w-full text-left p-3 rounded-md border-b border-transparent transition-all ${
                      selectedDoc?.docId === docGroup.docId
                        ? 'bg-slate-50 border-l-2 border-l-slate-900 rounded-none'
                        : 'border-b-slate-100 hover:bg-slate-50 rounded-none'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] font-bold text-indigo-700">{docGroup.num}</span>
                      {badge}
                    </div>
                    <div className="font-bold text-xs text-brand-900 truncate">{docGroup.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {docGroup.reqs.length} Signer{docGroup.reqs.length > 1 ? 's' : ''} Requested
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detail */}
          {selectedDoc && (
            <div className="lg:col-span-2 space-y-4">
              
              {/* Document Overview Header */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-brand-900">{selectedDoc.title}</h2>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedDoc.num}</p>
                </div>
                <button
                  onClick={() => onNavigateToSignature(selectedDoc.docId)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  <Eye size={13} />
                  View Document
                </button>
              </div>

              {/* Loop through signers for this document */}
              {selectedDoc.reqs.map(req => (
                <div key={req.id} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-4">
                  
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                    <span className="w-6 h-6 rounded-full bg-brand-900 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {req.signatoryRole === 'siva_kumar' ? 'SK' : req.signatoryRole === 'uma_mageshwari' ? 'UM' : 'S'}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {req.signatoryName}
                    </h3>
                  </div>

                  {/* Signer info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Requested Signer</p>
                      <p className="font-bold text-slate-800">{req.signatoryName}</p>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">{req.signatoryEmail}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Requested By</p>
                      <p className="font-bold text-slate-800">{req.requestedBy}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{new Date(req.requestedAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Status Flow */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authorization Status</p>

                    {/* Step 1: Request Sent */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className="w-6 h-6 rounded-sm bg-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={13} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Signature Request Sent</p>
                        <p className="text-slate-500">{new Date(req.requestedAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Step 2: Signer Approved */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        req.status === 'approved' || req.authorizedAt
                          ? 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`}>
                        {req.status === 'approved' || req.authorizedAt
                          ? <CheckCircle2 size={13} className="text-white" />
                          : <Clock size={13} className="text-slate-400" />
                        }
                      </div>
                      <div>
                        <p className={`font-semibold ${req.status === 'approved' || req.authorizedAt ? 'text-slate-800' : 'text-slate-400'}`}>
                          {req.signatoryName} Approved Signature
                        </p>
                        {req.otpGeneratedAt && (
                          <p className="text-slate-500">{new Date(req.otpGeneratedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>

                    {/* Step 3: OTP Verified */}
                    <div className="flex items-center gap-3 text-xs">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        req.authorizedAt ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}>
                        {req.authorizedAt
                          ? <CheckCircle2 size={13} className="text-white" />
                          : <Lock size={13} className="text-slate-400" />
                        }
                      </div>
                      <div>
                        <p className={`font-semibold ${req.authorizedAt ? 'text-slate-800' : 'text-slate-400'}`}>
                          OTP Verified — Signature Unlocked
                        </p>
                        {req.authorizedAt && (
                          <p className="text-slate-500">{new Date(req.authorizedAt).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Panel */}

                  {/* ── HR: Not yet approved by signer */}
                  {currentRole === 'hr' && !req.authorizedAt && req.status === 'pending' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-amber-600" />
                        <p className="font-bold text-amber-800 text-sm">Waiting for {req.signatoryName}</p>
                      </div>
                      <p className="text-xs text-amber-700">
                        {req.signatoryName} needs to open their Signature Requests portal, view the document, and click <strong>"Approve Signature"</strong> to generate an OTP.
                      </p>
                    </div>
                  )}

                  {/* ── HR: Signer approved, OTP ready — enter it */}
                  {currentRole === 'hr' && !req.authorizedAt && req.status === 'approved' && (
                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck size={16} className="text-indigo-600" />
                          <p className="font-bold text-indigo-800 text-sm">OTP Ready — Enter to Unlock</p>
                        </div>
                        <p className="text-xs text-indigo-700">
                          {req.signatoryName} has approved and generated an OTP. Ask them for the code and enter it below to unlock the signature.
                        </p>
                      </div>
                      <button
                        onClick={() => setHrOtpReqId(req.id)}
                        className="shrink-0 px-4 py-2.5 rounded-lg bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        Enter OTP
                      </button>
                    </div>
                  )}

                  {/* ── HR: Authorized — go to signature studio */}
                  {currentRole === 'hr' && req.authorizedAt && (
                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 size={16} className="text-brand-900" />
                          <p className="font-bold text-brand-900 text-sm">{req.signatoryName}'s Signature is Authorized</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Signer: Pending — Approve */}
                  {currentRole !== 'hr' && !req.authorizedAt && req.status === 'pending' && (
                    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
                      <p className="text-sm font-bold text-slate-800">Action Required</p>
                      <p className="text-xs text-slate-600">
                        <strong>{req.requestedBy}</strong> has requested your signature authorization.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleSignerApprove(req.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold transition-colors shadow-sm"
                        >
                          <ShieldCheck size={13} /> Approve Signature
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Signer: OTP generated — show it */}
                  {currentRole !== 'hr' && !req.authorizedAt && req.status === 'approved' && req.otpCode && (
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-brand-900" />
                        <p className="font-bold text-brand-900 text-sm">Signature Approved</p>
                      </div>
                      <p className="text-xs text-slate-600">Share this OTP with HR to complete the authorization:</p>
                      <div className="bg-white border-2 border-emerald-200 rounded-lg p-4 text-center">
                        <p className="text-3xl font-black tracking-[0.35em] text-brand-900 font-mono">{req.otpCode}</p>
                      </div>
                      <p className="text-[11px] text-brand-900">
                        This OTP expires at {new Date(req.otpExpiresAt!).toLocaleTimeString()}
                      </p>
                    </div>
                  )}

                  {/* ── Signer: Done */}
                  {currentRole !== 'hr' && req.authorizedAt && (
                    <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 flex items-center gap-3">
                      <CheckCircle2 size={20} className="text-brand-900 shrink-0" />
                      <div>
                        <p className="font-bold text-brand-900 text-sm">Signature Fully Authorized</p>
                        <p className="text-xs text-brand-900 mt-0.5">
                          HR has verified the OTP.
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
