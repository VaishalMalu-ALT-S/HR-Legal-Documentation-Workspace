const fs = require('fs');
let content = fs.readFileSync('src/components/SignatureCenter.tsx', 'utf8');

// Replace "{isApproved ? (" with ""
content = content.replace(/\{isApproved \? \(\s*<>\s*<div className="h-5 w-px bg-\[#dfe1e6\]" \/>/, `<>\n              <div className="h-5 w-px bg-[#dfe1e6]" />`);

// Replace the end of the block
content = content.replace(/<\/button>\n            <\/>\n          \) : \(\s*<>\s*<div className="h-5 w-px bg-\[#dfe1e6\]" \/>\s*<div className="px-3 py-1 flex items-center gap-2 text-rose-600">\s*<Lock size=\{14\} \/>\s*<span className="text-xs font-bold">Signatures Locked: Awaiting Approval<\/span>\s*<\/div>\s*<\/>\s*\)/, `</button>\n            </>`);

fs.writeFileSync('src/components/SignatureCenter.tsx', content);
console.log("Updated SignatureCenter.tsx successfully");
