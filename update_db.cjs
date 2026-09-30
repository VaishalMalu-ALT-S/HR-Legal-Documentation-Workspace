const fs = require('fs');
let content = fs.readFileSync('src/services/dbService.ts', 'utf8');

const additions = `
  static authorizeDocumentSignatory(
    documentId: string,
    signatoryRole: string, // 'siva_kumar' | 'uma_mageshwari'
    signatoryEmail: string,
    method: 'otp' = 'otp'
  ): import('../types').SmartDocument {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');
    
    const doc = documents[index];
    if (!doc.authorizations) {
      doc.authorizations = [];
    }
    
    const signatoryName = signatoryRole === 'siva_kumar' ? 'Siva Kumar' : 'Uma Mageshwari';
    
    const newAuth = {
      id: \`auth-\${Date.now()}\`,
      documentId,
      signatoryRole,
      signatoryName,
      signatoryEmail,
      method,
      authorizedAt: new Date().toISOString()
    };
    
    doc.authorizations.push(newAuth as any);
    
    // Update step status to approved for the workflow
    if (doc.approvalWorkflow && doc.approvalWorkflow.steps) {
      const stepIndex = doc.approvalWorkflow.steps.findIndex(s => s.roleName === signatoryRole);
      if (stepIndex !== -1) {
        doc.approvalWorkflow.steps[stepIndex].status = 'approved';
        doc.approvalWorkflow.steps[stepIndex].updatedAt = new Date().toISOString();
        doc.approvalWorkflow.currentStepIndex = Math.min(doc.approvalWorkflow.steps.length, stepIndex + 1);
      }
      
      const allApproved = doc.approvalWorkflow.steps.every(s => s.status === 'approved');
      if (allApproved) {
        doc.status = 'signature_authorized';
        doc.approvalWorkflow.status = 'approved';
      }
    }
    
    documents[index] = doc;
    localStorage.setItem('doc-signing-documents', JSON.stringify(documents));
    
    this.logAuditAction(
      'System',
      'hr' as any,
      'Approval Verified',
      \`OTP verified for \${signatoryName} (\${signatoryEmail}). Signature unlocked.\`,
      doc.id,
      doc.documentNumber,
      doc.status,
      doc.status
    );
    
    this.notifySubscribers();
    return doc;
  }

  static recordSignaturePlacement(
    documentId: string,
    signatoryRole: string,
    hrUserName: string
  ): import('../types').SmartDocument {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');
    
    const doc = documents[index];
    if (!doc.authorizations) return doc;
    
    const authIndex = doc.authorizations.findIndex(a => a.signatoryRole === signatoryRole && !a.usedAt);
    if (authIndex !== -1) {
      doc.authorizations[authIndex].usedAt = new Date().toISOString();
      doc.authorizations[authIndex].usedByRole = 'hr';
      
      const signatoryName = signatoryRole === 'siva_kumar' ? 'Siva Kumar' : 'Uma Mageshwari';
      
      // If all required signatures are placed, update status to signed
      const allRequired = doc.approvalWorkflow?.steps.map(s => s.roleName) || [];
      const allPlaced = allRequired.every(role => 
        doc.authorizations?.some(a => a.signatoryRole === role && a.usedAt)
      );
      
      if (allPlaced) {
        doc.status = 'signed';
      }
      
      documents[index] = doc;
      localStorage.setItem('doc-signing-documents', JSON.stringify(documents));
      
      this.logAuditAction(
        hrUserName,
        'hr',
        'Signature Placed',
        \`\${signatoryName}'s authorized signature was placed by HR.\`,
        doc.id,
        doc.documentNumber,
        doc.status,
        doc.status
      );
      
      this.notifySubscribers();
    }
    return doc;
  }
`;

content = content.replace("static updateApprovalStatus(", additions + "\n\n  static updateApprovalStatus(");
fs.writeFileSync('src/services/dbService.ts', content);
console.log("Updated dbService.ts");
