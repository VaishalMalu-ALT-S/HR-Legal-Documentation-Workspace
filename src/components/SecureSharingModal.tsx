import React, { useState } from 'react';
import { Share2, Copy, Check, X } from 'lucide-react';
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-brand-600" />
            <h3 className="text-base font-bold text-slate-900 font-heading">Secure Share Document</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Expiry Config */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase text-[10px]">Link Expiration</label>
            <select
              value={expiryDays}
              onChange={e => setExpiryDays(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value={1}>1 Day Expiry</option>
              <option value={7}>7 Days Expiry</option>
              <option value={30}>30 Days Expiry</option>
            </select>
          </div>

          {/* Password Protection Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="font-bold text-slate-900">Password Protection</div>
              <div className="text-[10px] text-slate-500">Require recipient password to view</div>
            </div>
            <input
              type="checkbox"
              checked={passwordProtected}
              onChange={e => setPasswordProtected(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
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
                className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-slate-400 text-center">
          🔒 Links are log-tracked and auto-expire based on access policy.
        </div>
      </div>
    </div>
  );
};
