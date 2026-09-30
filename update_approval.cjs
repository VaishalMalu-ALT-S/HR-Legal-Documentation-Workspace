const fs = require('fs');
let content = fs.readFileSync('src/components/ApprovalWorkflow.tsx', 'utf8');

// Replace handleApproveStep
content = content.replace(
  /const handleApproveStep = \(stepNumber: number\) => \{[\s\S]*?setComment\(''\);\n  \};/,
  `const handleApproveStep = (stepNumber: number) => {
    if (!selectedDoc) return;
    const step = selectedDoc.approvalWorkflow?.steps.find(s => s.stepNumber === stepNumber);
    if (!step) return;
    
    // HR is the one verifying the OTP to unlock the signatory's signature
    const updated = DatabaseService.authorizeDocumentSignatory(
      selectedDoc.id,
      step.roleName, // 'siva_kumar' or 'uma_mageshwari'
      step.roleName === 'siva_kumar' ? 'siva@alt-s.com' : 'uma@alt-s.com',
      'otp'
    );
    
    setSelectedDoc(updated);
  };`
);

// Remove Manager Simplified View and change HR Detailed View
const hrDetailedViewRegex = /\{\/\* Manager Simplified View \*\/\}[\s\S]*?\{\/\* Contextual Action Bar \*\/\}/;

const newViews = `{/* Manager Authorized Documents View */}
                {currentRole !== 'hr' && (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-slate-800">Authorization Status</p>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase">
                        {selectedDoc.authorizations?.some(a => a.signatoryRole === currentRole) ? 'Authorized' : 'Pending Authorization'}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedDoc.authorizations?.filter(a => a.signatoryRole === currentRole).map(auth => (
                        <div key={auth.id} className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                          <div className="font-semibold text-slate-800 mb-1">✓ Approved by {auth.signatoryName}</div>
                          <div className="text-[10px] text-slate-500">{new Date(auth.authorizedAt).toLocaleString()}</div>
                          
                          {auth.usedAt && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <div className="font-semibold text-slate-800 mb-1">✓ Signature Placed</div>
                              <div className="text-[10px] text-slate-500">{new Date(auth.usedAt).toLocaleString()}</div>
                              <div className="text-[10px] text-slate-500">Placed by HR</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HR Detailed View */}
                {currentRole === 'hr' && (
                  <div className="space-y-3 mt-4">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Required Authorizations</p>
                    
                    {selectedDoc.approvalWorkflow?.steps?.map((step) => {
                      const auth = selectedDoc.authorizations?.find(a => a.signatoryRole === step.roleName);
                      const isApproved = !!auth;
                      
                      return (
                        <div key={step.stepNumber} className={\`p-4 rounded-xl border transition-all \${
                          isApproved ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/50 border-slate-200'
                        }\`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs \${
                                isApproved ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
                              }\`}>
                                {isApproved ? <CheckCircle2 size={16} /> : step.stepNumber}
                              </div>
                              <div>
                                <div className="font-bold text-xs text-slate-900">{step.assignedToName}</div>
                                <p className="text-[11px] text-slate-500">{step.roleName === 'siva_kumar' ? 'Managing Director' : 'Board of Director'}</p>
                              </div>
                            </div>

                            {isApproved ? (
                              <div className="text-right">
                                <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 size={12} /> Authorized
                                </span>
                                <div className="text-[9px] text-slate-500 mt-1">{new Date(auth.authorizedAt).toLocaleString()}</div>
                              </div>
                            ) : (
                              <button
                                onClick={() => initiateApproveStep(step.stepNumber)}
                                className="px-3 py-1.5 rounded bg-[#0052cc] hover:bg-[#0047b3] text-white text-[11px] font-semibold transition-colors"
                              >
                                Send OTP to Authorize
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Contextual Action Bar */}`;

content = content.replace(hrDetailedViewRegex, newViews);

fs.writeFileSync('src/components/ApprovalWorkflow.tsx', content);
console.log("Updated ApprovalWorkflow.tsx");
