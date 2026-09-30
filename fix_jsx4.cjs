const fs = require('fs');
let content = fs.readFileSync('src/components/SignatureCenter.tsx', 'utf8');

const regex = /\) \: \(\s*<>\s*<div className="h-5 w-px bg-\[#dfe1e6\]" \/>\s*<div className="px-3 py-1 flex items-center gap-2 text-rose-600">\s*<Lock size=\{14\} \/>\s*<span className="text-xs font-bold">Signatures Locked: Awaiting Approval<\/span>\s*<\/div>\s*<\/>\s*\)}/;

content = content.replace(regex, "");
fs.writeFileSync('src/components/SignatureCenter.tsx', content);
console.log("Fixed for real");
