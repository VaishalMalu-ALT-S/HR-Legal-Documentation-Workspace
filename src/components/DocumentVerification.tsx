import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Search, QrCode, CheckCircle2, 
  AlertTriangle, Lock, Award, FileText, Key, Calendar
} from 'lucide-react';
import { SmartDocument } from '../types';
import { DatabaseService } from '../services/dbService';
import { CryptoService } from '../services/cryptoService';

interface DocumentVerificationProps {
  initialDocNumber?: string;
  documents: SmartDocument[];
}

export const DocumentVerification: React.FC<DocumentVerificationProps> = ({
  initialDocNumber = 'DOC-2026-000124',
  documents
}) => {
  const [docQuery, setDocQuery] = useState(initialDocNumber);
  const [targetDoc, setTargetDoc] = useState<SmartDocument | undefined>(
    DatabaseService.getDocumentById(initialDocNumber) || documents[0]
  );
  const [isSearching, setIsSearching] = useState(false);

  const handleVerifySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      const found = DatabaseService.getDocumentById(docQuery);
      setTargetDoc(found);
      setIsSearching(false);
    }, 400);
  };

  const verificationResult = targetDoc 
    ? CryptoService.verifyIntegrity(targetDoc.documentHash, targetDoc.originalHash)
    : null;

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      
      {/* Verification Header Banner */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading">Public Document Verification Portal</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Enter any Document ID or scan the embedded QR code to verify tamper-proof authenticity against the immutable SHA-256 ledger.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleVerifySearch} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={docQuery}
            onChange={e => setDocQuery(e.target.value)}
            placeholder="Enter Document ID (e.g. DOC-2026-000124)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-2"
        >
          {isSearching ? 'Verifying Ledger...' : 'Verify Authenticity'}
        </button>
      </form>

      {/* VERIFICATION RESULTS BOARD */}
      {targetDoc && verificationResult ? (
        <div className="space-y-6">
          
          {/* STATUS BADGE BANNER */}
          {verificationResult.isValid && !targetDoc.isTampered ? (
            <div className="bg-emerald-500 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between border border-emerald-400">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs font-bold bg-emerald-600/60 px-3 py-1 rounded-full w-max border border-emerald-400/50">
                  <CheckCircle2 size={15} /> VERIFICATION PASSED
                </div>
                <h2 className="text-xl font-extrabold font-heading">DOCUMENT STATUS: VALID</h2>
                <p className="text-xs text-emerald-100">
                  SHA-256 Cryptographic Hash matches original stored ledger record exactly. Document has NOT been modified or tampered with.
                </p>
              </div>
              <ShieldCheck size={48} className="text-emerald-200 shrink-0 hidden sm:block" />
            </div>
          ) : (
            <div className="bg-rose-600 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between border border-rose-500 animate-pulse">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs font-bold bg-rose-800/80 px-3 py-1 rounded-full w-max border border-rose-400">
                  <AlertTriangle size={15} /> SECURITY WARNING
                </div>
                <h2 className="text-xl font-extrabold font-heading">DOCUMENT INTEGRITY COMPROMISED</h2>
                <p className="text-xs text-rose-100">
                   Current document hash does NOT match original stored hash. This document may have been edited, forged, or altered after signing.
                </p>
              </div>
              <ShieldAlert size={48} className="text-rose-200 shrink-0 hidden sm:block" />
            </div>
          )}

          {/* VERIFICATION METADATA CARDS */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 font-heading border-b border-slate-100 pb-3">
              Official Document Metadata
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Document ID</span>
                <strong className="text-brand-700 font-bold">{targetDoc.documentNumber}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Document Type</span>
                <strong className="text-slate-900 capitalize font-sans">{targetDoc.category.replace('_', ' ')}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Recipient Person</span>
                <strong className="text-slate-900 font-bold font-sans">{targetDoc.personName}</strong>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Generated Date</span>
                <strong className="text-slate-700 font-sans">{new Date(targetDoc.generatedAt).toLocaleDateString()}</strong>
              </div>
            </div>

            {/* SHA-256 Cryptographic Breakdown */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-bold text-brand-400">Cryptographic Hash Verification</span>
                <span className="text-[10px] text-slate-400">SHA-256 Ledger Standard</span>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400">Current Computed Hash:</div>
                <div className={`p-2 rounded bg-navy-950 border ${verificationResult.isValid && !targetDoc.isTampered ? 'border-emerald-500/50 text-emerald-400' : 'border-rose-500/50 text-rose-400'} truncate`}>
                  {targetDoc.documentHash}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400">Original Stored Hash:</div>
                <div className="p-2 rounded bg-navy-950 border border-slate-800 text-slate-300 truncate">
                  {targetDoc.originalHash}
                </div>
              </div>
            </div>

            {/* Digital Signature Certificate Details */}
            {targetDoc.signatures.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Digital Signature Certificate Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {targetDoc.signatures.map(sig => (
                    <div key={sig.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{sig.signatoryName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {sig.method.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{sig.signatoryRole}</p>
                      <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-200 mt-2">
                        Issuer: {sig.certificateIssuer || 'SmartDoc CA'}<br/>
                        Serial: {sig.certificateSerial || 'DEMO-8A9F-341C'}<br/>
                        Signed: {new Date(sig.signedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <AlertTriangle size={36} className="text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Document Found</h3>
          <p className="text-xs text-slate-500">Document ID "{docQuery}" was not found in the repository ledger.</p>
        </div>
      )}

    </div>
  );
};
