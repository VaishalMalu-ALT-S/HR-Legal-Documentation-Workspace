const fs = require('fs');
let content = fs.readFileSync('src/components/ApprovalWorkflow.tsx', 'utf8');

const sourceLabel = `
                      <span className={\`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase \${doc.variableValues?.isUploaded === 'true' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}\`}>
                        {doc.variableValues?.isUploaded === 'true' ? 'Uploaded Document' : 'Template Document'}
                      </span>
`;

// Insert it above the title in the sidebar list
content = content.replace(
  /<div className="font-bold text-xs text-slate-900 mt-1 truncate">\{doc\.title\}<\/div>/g,
  `
                    <div className="font-bold text-xs text-slate-900 mt-1 flex flex-col gap-1">
                      <div className="truncate">{doc.title}</div>
                      ${sourceLabel}
                    </div>`
);

// Insert it in the main detail view next to the ref
content = content.replace(
  /<p className="text-xs text-slate-500 font-mono">Ref: \{selectedDoc\.documentNumber\} • Generated on \{new Date\(selectedDoc\.generatedAt\)\.toLocaleDateString\(\)\}<\/p>/g,
  `<p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                      <span>Ref: {selectedDoc.documentNumber}</span>
                      <span>•</span>
                      <span>Generated on {new Date(selectedDoc.generatedAt).toLocaleDateString()}</span>
                      <span className={\`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase \${selectedDoc.variableValues?.isUploaded === 'true' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}\`}>
                        {selectedDoc.variableValues?.isUploaded === 'true' ? 'Uploaded Document' : 'Template Document'}
                      </span>
                    </p>`
);

fs.writeFileSync('src/components/ApprovalWorkflow.tsx', content);
console.log("Added source labels to ApprovalWorkflow.tsx");
