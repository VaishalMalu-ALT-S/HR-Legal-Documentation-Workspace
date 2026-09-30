const fs = require('fs');
let content = fs.readFileSync('src/components/DocumentUploader.tsx', 'utf8');

content = content.replace('CheckCircle2,', '');
fs.writeFileSync('src/components/DocumentUploader.tsx', content);

console.log("Removed CheckCircle2");
