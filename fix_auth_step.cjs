const fs = require('fs');

let content = fs.readFileSync('src/components/ApprovalWorkflow.tsx', 'utf8');

const replacement = `  const handleApproveStep = (stepNumber: number) => {
    if (!selectedDoc) return;
    
    // Find the role for this step to authorize
    const step = selectedDoc.approvalWorkflow?.steps.find(s => s.stepNumber === stepNumber);
    if (step) {
      // Create the authorization record
      DatabaseService.authorizeDocumentSignatory(
        selectedDoc.id,
        step.roleName,
        step.assignedToEmail || 'test@example.com'
      );
    }
    
    // Update the visual step status
    const updated = DatabaseService.updateApprovalStatus(
      selectedDoc.id,
      stepNumber,
      'approved',
      comment || 'Approved after review.',
      'Suresh Kumar',
      currentRole
    );
    
    setSelectedDoc(updated);
    setComment('');
  };`;

content = content.replace(/  const handleApproveStep = \(stepNumber: number\) => \{\s+if \(!selectedDoc\) return;\s+const updated = DatabaseService\.updateApprovalStatus\(\s+selectedDoc\.id,\s+stepNumber,\s+'approved',\s+comment \|\| 'Approved after review\.',\s+'Suresh Kumar',\s+currentRole\s+\);\s+setSelectedDoc\(updated\);\s+setComment\(''\);\s+\};/, replacement);

fs.writeFileSync('src/components/ApprovalWorkflow.tsx', content);
console.log("Updated handleApproveStep");
