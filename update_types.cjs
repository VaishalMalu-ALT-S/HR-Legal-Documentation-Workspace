const fs = require('fs');
let content = fs.readFileSync('src/types/index.ts', 'utf8');

const docAuth = `
export interface DocumentAuthorization {
  id: string;
  documentId: string;
  signatoryRole: string; // 'siva_kumar' | 'uma_mageshwari'
  signatoryName: string;
  signatoryEmail: string;
  method: 'otp' | 'direct';
  authorizedAt: string;
  usedAt?: string;
  usedByRole?: string; // e.g. 'hr'
}

export interface DocumentApprovalWorkflow {`;

content = content.replace("export interface DocumentApprovalWorkflow {", docAuth);

content = content.replace("signatures?: DigitalSignature[];\r\n  approvalWorkflow?: DocumentApprovalWorkflow;\r\n}", "signatures?: DigitalSignature[];\n  authorizations?: DocumentAuthorization[];\n  approvalWorkflow?: DocumentApprovalWorkflow;\n}");
content = content.replace("signatures?: DigitalSignature[];\n  approvalWorkflow?: DocumentApprovalWorkflow;\n}", "signatures?: DigitalSignature[];\n  authorizations?: DocumentAuthorization[];\n  approvalWorkflow?: DocumentApprovalWorkflow;\n}");

fs.writeFileSync('src/types/index.ts', content);
console.log("Updated types");
