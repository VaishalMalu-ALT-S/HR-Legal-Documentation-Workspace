const fs = require('fs');
let content = fs.readFileSync('src/components/SignatureCenter.tsx', 'utf8');

content = content.replace(
  /\{isApproved \? \([\s\S]*?\} \/\* Corporate Seal \*\//,
  `<>
              <div className="h-5 w-px bg-[#dfe1e6]" />

              {/* Signatures */}
              {currentRole === 'hr' && (
                <div className="flex items-center gap-2 mr-2">
                  <span className="font-bold text-[10px] text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Signature Available</span>
                </div>
              )}

              {/* Show Siva signature if approved by Siva (HR sees it locked if not approved) */}
              {currentRole === 'hr' && (
                <button
                  onClick={() => {
                    const isAuth = targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar');
                    if (!isAuth) return;
                    addSig('/sign1.jpg', 'signature', 'siva_kumar');
                  }}
                  disabled={!targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar')}
                  className={\`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11.5px] transition-colors \${
                    !targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar')
                      ? 'text-slate-400 bg-slate-50 cursor-not-allowed border border-slate-200' 
                      : 'text-[#172b4d] hover:bg-[#ebecf0]'
                  }\`}
                  title={!targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar') ? "Locked: Awaiting Manager Approval" : "Place Siva Kumar Signature"}
                >
                  {!targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar') ? <Lock size={12} className="text-rose-500" /> : <Pen size={14} className="text-[#0052cc]" />}
                  <span>Siva Kumar</span>
                </button>
              )}

              {/* Show Uma signature if approved by Uma (HR sees it locked if not approved) */}
              {currentRole === 'hr' && (
                <button
                  onClick={() => {
                    const isAuth = targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari');
                    if (!isAuth) return;
                    addSig('/sign2.jpg', 'signature', 'uma_mageshwari');
                  }}
                  disabled={!targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari')}
                  className={\`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11.5px] transition-colors \${
                    !targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari')
                      ? 'text-slate-400 bg-slate-50 cursor-not-allowed border border-slate-200' 
                      : 'text-[#172b4d] hover:bg-[#ebecf0]'
                  }\`}
                  title={!targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari') ? "Locked: Awaiting Manager Approval" : "Place Uma Mageshwari Signature"}
                >
                  {!targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari') ? <Lock size={12} className="text-rose-500" /> : <Pen size={14} className="text-[#0052cc]" />}
                  <span>Uma Mageshwari</span>
                </button>
              )}

              {/* Corporate Seal */`
);

content = content.replace(
  /<\/button>\n            <\/>\n          \) : \([\s\S]*?Signatures Locked: Awaiting Approval[\s\S]*?<\/>\n          \)}/,
  `</button>
            </>`
);

fs.writeFileSync('src/components/SignatureCenter.tsx', content);
console.log("Updated SignatureCenter.tsx again");`
