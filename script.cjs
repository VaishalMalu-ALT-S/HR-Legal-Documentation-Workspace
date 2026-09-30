const fs = require('fs');
let content = fs.readFileSync('src/data/seededData.ts', 'utf8');

// Replace roles safely
content = content.replace(/'hr_admin'/g, "'hr'");
content = content.replace(/'signatory'/g, "'siva_kumar'");
content = content.replace(/'super_admin'/g, "'uma_mageshwari'");
content = content.replace(/'employee_archived'/g, "'uma_mageshwari'");
content = content.replace(/'auditor_archived'/g, "'uma_mageshwari'");

// Find INITIAL_DOCUMENTS array and replace category inside it
const docStart = content.indexOf('export const INITIAL_DOCUMENTS: SmartDocument[]');
const docEnd = content.indexOf('export const INITIAL_AUDIT_LOGS');

if (docStart !== -1 && docEnd !== -1) {
    let docsText = content.substring(docStart, docEnd);
    docsText = docsText.replace(/category:\s*'([^']+)',/g, "category: '$1',\n      companyId: 'alt_s',");
    content = content.substring(0, docStart) + docsText + content.substring(docEnd);
}

fs.writeFileSync('src/data/seededData.ts', content);

let dw = fs.readFileSync('src/components/DocumentWizard.tsx', 'utf8');
dw = dw.replace(/category: (.*?)(,\n|\n)/g, "category: $1,\n        companyId: 'alt_s',\n");
fs.writeFileSync('src/components/DocumentWizard.tsx', dw);
console.log("Done");
