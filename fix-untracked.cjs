
const fs = require('fs');
function fix(f) {
  if (fs.existsSync(f)) {
    let text = fs.readFileSync(f, 'utf-8');
    text = text.replace(/isSigned  'border-/g, 'isSigned ? \'border-');
    text = text.replace(/isApproved  'border-/g, 'isApproved ? \'border-');
    text = text.replace(/isPending  'border-/g, 'isPending ? \'border-');
    text = text.replace(/canResubmit  'border-/g, 'canResubmit ? \'border-');
    text = text.replace(/isSigned  'bg-/g, 'isSigned ? \'bg-');
    text = text.replace(/isApproved  'bg-/g, 'isApproved ? \'bg-');
    text = text.replace(/isPending  'bg-/g, 'isPending ? \'bg-');
    text = text.replace(/canResubmit  'bg-/g, 'canResubmit ? \'bg-');
    text = text.replace(/===  \?/g, '=== 0 ?');
    text = text.replace(/filter === 'all'[\r\n\s]+'bg/g, 'filter === \'all\' ? \'bg');
    text = text.replace(/filter === 'pending'[\r\n\s]+'bg/g, 'filter === \'pending\' ? \'bg');
    text = text.replace(/filter === 'done'[\r\n\s]+'bg/g, 'filter === \'done\' ? \'bg');
    text = text.replace(/status\.step > i \+ 1  'bg/g, 'status.step > i + 1 ? \'bg');
    text = text.replace(/personRole  \/g, 'personRole ? \');
    
    // OtpVerificationModal.tsx
    text = text.replace(/isLoading  'bg-slate-400/g, 'isLoading ? \'bg-slate-400');
    text = text.replace(/step === 'phone'  'Send OTP'/g, 'step === \'phone\' ? \'Send OTP\'');
    text = text.replace(/success  'bg-emerald-50 text-emerald-600'/g, 'success ? \'bg-emerald-50 text-emerald-600\'');
    text = text.replace(/error  'bg-rose-50 border/g, 'error ? \'bg-rose-50 border');
    text = text.replace(/step === 'phone'  \(/g, 'step === \'phone\' ? (');
    text = text.replace(/success  \(/g, 'success ? (');
    text = text.replace(/error  \(/g, 'error ? (');
    
    // SecurityTestRunner.tsx
    text = text.replace(/t\.status === 'running'  'border-blue-200/g, 't.status === \'running\' ? \'border-blue-200');
    text = text.replace(/t\.status === 'running'  \(/g, 't.status === \'running\' ? (');
    text = text.replace(/t\.status === 'passed'  \(/g, 't.status === \'passed\' ? (');
    text = text.replace(/t\.status === 'failed'  \(/g, 't.status === \'failed\' ? (');

    fs.writeFileSync(f, text);
  }
}
fix('src/components/HRMyDocuments.tsx');
fix('src/components/OtpVerificationModal.tsx');
fix('src/components/SecurityTestRunner.tsx');

