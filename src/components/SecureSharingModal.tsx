import React, { useState } from 'react';
import { Share2, Copy, Check, X, Lock } from 'lucide-react';
import { DatabaseService } from '../services/dbService';

interface SecureSharingModalProps {
  documentId: string;
  onClose: () => void;
}

export const SecureSharingModal: React.FC<SecureSharingModalProps> = ({ documentId, onClose }) => {
  const [expiryDays, setExpiryDays] = useState(7);
  const [passwordProtected, setPasswordProtected] = useState(true);
  const [copied, setCopied] = useState(false);

  const sharedLink = DatabaseService.createSharedLink(documentId, expiryDays, passwordProtected);

  const handleCopy = () => {
    navigator.clipboard.writeText(sharedLink.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-brand-900" />
            <h3 className="text-base font-bold text-slate-900 font-heading">Secure Share Document</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md"><X size={18} /></button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Expiry Config */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase text-[10px]">Link Expiration</label>
            <select
              value={expiryDays}
              onChange={e => setExpiryDays(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md"
            >
              <option value={1}>1 Day Expiry</option>
              <option value={7}>7 Days Expiry</option>
              <option value={30}>30 Days Expiry</option>
            </select>
          </div>

          {/* Password Protection Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
            <div>
              <div className="font-bold text-slate-900">Password Protection</div>
              <div className="text-[10px] text-slate-500">Require recipient password to view</div>
            </div>
            <input
              type="checkbox"
              checked={passwordProtected}
              onChange={e => setPasswordProtected(e.target.checked)}
              className="w-4 h-4 text-brand-900 rounded border-slate-300 focus:ring-brand-900"
            />
          </div>

          {/* Generated Link Output */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase text-[10px]">Generated Secure URL</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={sharedLink.shareUrl}
                className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-md font-mono text-[11px] text-slate-800"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-brand-900 hover:bg-brand-800 text-white rounded-md font-bold flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
          <Lock size={12} className="text-slate-400" />
          <span>Links are log-tracked and auto-expire based on access policy.</span>
        </div>
      </div>
    </div>
  );
};
