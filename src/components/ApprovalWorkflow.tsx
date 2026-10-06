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
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

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

  const selectedReq = requests.find(r => r.id === selectedReqId) ?? requests[0] ?? null;

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

  const statusBadge = (req: SignatureRequest) => {
    if (req.authorizedAt) return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">✓ Authorized</span>;
    if (req.status === 'approved') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">⏳ OTP Ready</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Pending</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {currentRole === 'hr' ? 'Signature Requests' : 'My Signature Requests'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {currentRole === 'hr'
            ? 'Manage signature authorization requests sent to signers'
            : 'Documents where your signature has been requested'}
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
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

          {/* Left: Request List */}
          <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Requests ({requests.length})
            </span>
            <div className="space-y-2 mt-2">
              {requests.map(req => (
                <button
                  key={req.id}
                  onClick={() => setSelectedReqId(req.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedReq?.id === req.id
                      ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-indigo-700">{req.documentNumber}</span>
                    {statusBadge(req)}
                  </div>
                  <div className="font-bold text-xs text-slate-900 truncate">{req.documentTitle}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {currentRole === 'hr' ? `→ ${req.signatoryName}` : `From: ${req.requestedBy}`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Detail */}
          {selectedReq && (
            <div className="lg:col-span-2 space-y-4">

              {/* Document Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{selectedReq.documentTitle}</h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedReq.documentNumber}</p>
                  </div>
                  <button
                    onClick={() => onNavigateToSignature(selectedReq.documentId)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                  >
                    <Eye size={13} />
                    View Document
                  </button>
                </div>

                {/* Signer info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Requested Signer</p>
                    <p className="font-bold text-slate-800">{selectedReq.signatoryName}</p>
                    <p className="text-slate-500 font-mono text-[11px] mt-0.5">{selectedReq.signatoryEmail}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-slate-400 text-[10px] uppercase font-bold mb-1">Requested By</p>
                    <p className="font-bold text-slate-800">{selectedReq.requestedBy}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{new Date(selectedReq.requestedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Status Flow */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authorization Status</p>

                  {/* Step 1: Request Sent */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={13} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Signature Request Sent</p>
                      <p className="text-slate-500">{new Date(selectedReq.requestedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Step 2: Signer Approved */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      selectedReq.status === 'approved' || selectedReq.authorizedAt
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}>
                      {selectedReq.status === 'approved' || selectedReq.authorizedAt
                        ? <CheckCircle2 size={13} className="text-white" />
                        : <Clock size={13} className="text-slate-400" />
                      }
                    </div>
                    <div>
                      <p className={`font-semibold ${selectedReq.status === 'approved' || selectedReq.authorizedAt ? 'text-slate-800' : 'text-slate-400'}`}>
                        {selectedReq.signatoryName} Approved Signature
                      </p>
                      {selectedReq.otpGeneratedAt && (
                        <p className="text-slate-500">{new Date(selectedReq.otpGeneratedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  {/* Step 3: OTP Verified */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      selectedReq.authorizedAt ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}>
                      {selectedReq.authorizedAt
                        ? <CheckCircle2 size={13} className="text-white" />
                        : <Lock size={13} className="text-slate-400" />
                      }
                    </div>
                    <div>
                      <p className={`font-semibold ${selectedReq.authorizedAt ? 'text-slate-800' : 'text-slate-400'}`}>
                        OTP Verified — Signature Unlocked
                      </p>
                      {selectedReq.authorizedAt && (
                        <p className="text-slate-500">{new Date(selectedReq.authorizedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Panel */}

              {/* ── HR: Not yet approved by signer */}
              {currentRole === 'hr' && !selectedReq.authorizedAt && selectedReq.status === 'pending' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-amber-600" />
                    <p className="font-bold text-amber-800 text-sm">Waiting for {selectedReq.signatoryName}</p>
                  </div>
                  <p className="text-xs text-amber-700">
                    {selectedReq.signatoryName} needs to open their Signature Requests portal, view the document, and click <strong>"Approve Signature"</strong> to generate an OTP.
                    Once they share the OTP with you, click the button below.
                  </p>
                </div>
              )}

              {/* ── HR: Signer approved, OTP ready — enter it */}
              {currentRole === 'hr' && !selectedReq.authorizedAt && selectedReq.status === 'approved' && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck size={16} className="text-indigo-600" />
                      <p className="font-bold text-indigo-800 text-sm">OTP Ready — Enter to Unlock</p>
                    </div>
                    <p className="text-xs text-indigo-700">
                      {selectedReq.signatoryName} has approved and generated an OTP. Ask them for the code and enter it below to unlock the signature.
                    </p>
                  </div>
                  <button
                    onClick={() => setHrOtpReqId(selectedReq.id)}
                    className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Enter OTP
                  </button>
                </div>
              )}

              {/* ── HR: Authorized — go to signature studio */}
              {currentRole === 'hr' && selectedReq.authorizedAt && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <p className="font-bold text-emerald-800 text-sm">{selectedReq.signatoryName}'s Signature is Authorized</p>
                    </div>
                    <p className="text-xs text-emerald-700">
                      You can now open the Signature Studio and drag {selectedReq.signatoryName}'s signature onto the document.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigateToSignature(selectedReq.documentId)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Open Signature Studio <ChevronRight size={13} />
                  </button>
                </div>
              )}

              {/* ── Signer: Pending — Approve */}
              {currentRole !== 'hr' && !selectedReq.authorizedAt && selectedReq.status === 'pending' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <p className="text-sm font-bold text-slate-800">Action Required</p>
                  <p className="text-xs text-slate-600">
                    <strong>{selectedReq.requestedBy}</strong> has requested your signature authorization for this document.
                    Please review the document and click <strong>Approve Signature</strong> if you agree.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => onNavigateToSignature(selectedReq.documentId)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                    >
                      <Eye size={13} /> Review Document
                    </button>
                    <button
                      onClick={() => handleSignerApprove(selectedReq.id)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      <ShieldCheck size={13} /> Approve Signature
                    </button>
                  </div>
                </div>
              )}

              {/* ── Signer: OTP generated — show it */}
              {currentRole !== 'hr' && !selectedReq.authorizedAt && selectedReq.status === 'approved' && selectedReq.otpCode && (
                <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <p className="font-bold text-emerald-800 text-sm">Signature Approved</p>
                  </div>
                  <p className="text-xs text-emerald-700">Share this OTP with HR to complete the authorization:</p>
                  <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-3xl font-black tracking-[0.35em] text-emerald-800 font-mono">{selectedReq.otpCode}</p>
                  </div>
                  <p className="text-[11px] text-emerald-600">
                    This OTP expires at {new Date(selectedReq.otpExpiresAt!).toLocaleTimeString()}
                  </p>
                </div>
              )}

              {/* ── Signer: Done */}
              {currentRole !== 'hr' && selectedReq.authorizedAt && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-3">
                  <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">Signature Fully Authorized</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      HR has verified the OTP and your signature is now available for placement on {selectedReq.documentTitle}.
                    </p>
                  </div>
                </div>
              )}
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
