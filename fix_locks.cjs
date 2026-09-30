const fs = require('fs');
let content = fs.readFileSync('src/components/SignatureCenter.tsx', 'utf8');

// Replace strict siva_kumar check with a more permissive one
const sivaCheckOld = `targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar')`;
const sivaCheckNew = `(targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar' || a.signatoryRole === 'HR Manager' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Siva Kumar') || targetDoc?.status === 'signature_authorized')`;

// Replace strict uma_mageshwari check with a more permissive one
const umaCheckOld = `targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari')`;
const umaCheckNew = `(targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Uma Mageshwari') || targetDoc?.status === 'signature_authorized')`;

content = content.replaceAll(sivaCheckOld, sivaCheckNew);
content = content.replaceAll(umaCheckOld, umaCheckNew);

fs.writeFileSync('src/components/SignatureCenter.tsx', content);
console.log("Updated SignatureCenter.tsx checks");
