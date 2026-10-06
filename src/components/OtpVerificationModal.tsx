import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';

interface OtpVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (otp: string) => void;  // passes the OTP entered so caller can verify
  title?: string;
  description?: string;
  /** If provided, show it read-only — HR is entering the OTP signer communicated */
  signerName?: string;
  signerEmail?: string;
  /** If the signer already approved and has an OTP ready — shown to the signer */
  otpToShow?: string;
  otpExpiresAt?: string;
  mode?: 'hr_enter_otp' | 'signer_approve'; // default hr_enter_otp
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Verify Signature Authorization',
  description,
  signerName,
  signerEmail,
  otpToShow,
  otpExpiresAt,
  mode = 'hr_enter_otp'
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) { setOtp(''); setError(null); }
  }, [isOpen]);

  useEffect(() => {
    if (!otpExpiresAt) return;
    const update = () => {
      const diff = Math.floor((new Date(otpExpiresAt).getTime() - Date.now()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [otpExpiresAt]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length < 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    setError(null);
    // Small artificial delay for UX
    await new Promise(r => setTimeout(r, 400));
    setLoading(false);
    onSuccess(otp.trim());
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-slate-800">
            <ShieldCheck size={20} className="text-emerald-600" />
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Signer mode: show the OTP for them to communicate to HR */}
          {mode === 'signer_approve' && otpToShow && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">{description || 'Your signature has been approved. Share this OTP with HR to complete the authorization.'}</p>
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 text-center">
                <p className="text-xs font-bold uppercase text-emerald-700 mb-2 tracking-wider">Your Authorization OTP</p>
                <p className="text-4xl font-black tracking-[0.3em] text-emerald-800 font-mono">{otpToShow}</p>
                {timeLeft !== null && timeLeft > 0 && (
                  <p className="text-xs text-emerald-600 mt-2">Expires in <span className="font-bold">{formatTime(timeLeft)}</span></p>
                )}
                {timeLeft === 0 && (
                  <p className="text-xs text-red-600 mt-2 font-semibold">⚠ OTP expired. Please generate a new one.</p>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>Instructions:</strong> Read this OTP to HR Admin over phone/in-person. HR will enter it in the Signature Studio to unlock your signature on the document.
              </div>
              <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-bold text-sm hover:bg-slate-700 transition-colors">
                Done
              </button>
            </div>
          )}

          {/* Signer mode: after approving, show OTP */}
          {mode === 'signer_approve' && !otpToShow && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">{description}</p>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
                <Loader2 className="animate-spin mx-auto text-indigo-600 mb-2" size={24} />
                <p className="text-sm text-indigo-700 font-semibold">Generating OTP...</p>
              </div>
            </div>
          )}

          {/* HR mode: enter OTP communicated by signer */}
          {mode === 'hr_enter_otp' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {signerName && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1">Authorizing signature for</p>
                  <p className="font-bold text-slate-900">{signerName}</p>
                  {signerEmail && <p className="text-xs text-slate-500 font-mono">{signerEmail}</p>}
                </div>
              )}

              <p className="text-sm text-slate-600">
                {description || `Ask ${signerName || 'the signer'} to open their Signature Request portal and click "Approve Signature". They will receive a 6-digit OTP to share with you.`}
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enter OTP from {signerName || 'Signer'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(null); }}
                  placeholder="000000"
                  className="w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-center text-2xl font-black tracking-[0.4em] font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Verify & Unlock Signature'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
