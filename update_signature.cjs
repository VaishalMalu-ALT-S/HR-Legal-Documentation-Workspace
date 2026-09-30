const fs = require('fs');
let content = fs.readFileSync('src/components/SignatureCenter.tsx', 'utf8');

// 1. Remove handleApproveFromViewer
content = content.replace(/const handleApproveFromViewer = async \(\) => \{[\s\S]*?alert\('Failed to approve and unlock\.'\);\n    \}\n  \};\n\n/, '');

// 2. Remove bottom toolbar button for managers
content = content.replace(/\) \: currentRole \!\=\= 'hr' \? \([\s\S]*?\) \: \(/, ') : (');

// 3. Update addSig to check authorizations and record placement
content = content.replace(/const addSig = \(src: string, type: 'signature' \| 'stamp' \| 'date' = 'signature'\) => \{/, 
`const addSig = (src: string, type: 'signature' | 'stamp' | 'date' = 'signature', signatoryRole?: string) => {
    if (type === 'signature' && signatoryRole && targetDoc) {
      DatabaseService.recordSignaturePlacement(targetDoc.id, signatoryRole, 'Suresh Kumar');
    }`);

// 4. Update the HR signature buttons to use targetDoc.authorizations
const sivaSigRegex = /\{\/\* Show Siva signature if approved by Siva, or if we are Siva \(HR sees it locked if not approved\) \*\/\}[\s\S]*?\{\/\* Show Uma signature if approved by Uma, or if we are Uma \(HR sees it locked if not approved\) \*\/\}/;

const newSivaSig = `{/* Show Siva signature if approved by Siva (HR sees it locked if not approved) */}
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
`;

content = content.replace(sivaSigRegex, newSivaSig);

const umaSigRegex = /\{\/\* Show Uma signature if approved by Uma \(HR sees it locked if not approved\) \*\/\}[\s\S]*?\{\/\* Corporate Seal \*\/\}/;
const newUmaSig = `{/* Show Uma signature if approved by Uma (HR sees it locked if not approved) */}
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

              {/* Corporate Seal */}`;

content = content.replace(umaSigRegex, newUmaSig);

fs.writeFileSync('src/components/SignatureCenter.tsx', content);
console.log("Updated SignatureCenter.tsx");
