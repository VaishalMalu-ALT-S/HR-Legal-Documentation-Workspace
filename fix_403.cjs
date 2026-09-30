const fs = require('fs');
let content = fs.readFileSync('src/components/ApprovalWorkflow.tsx', 'utf8');

const oldHandleApproveStep = `  const handleApproveStep = (stepNumber: number) => {
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

const newHandleApproveStep = `  const handleApproveStep = (stepNumber: number) => {
    if (!selectedDoc) return;
    
    // Find the role for this step to authorize
    const step = selectedDoc.approvalWorkflow?.steps.find(s => s.stepNumber === stepNumber);
    if (step) {
      // Create the authorization record (This handles the step status update internally)
      const updated = DatabaseService.authorizeDocumentSignatory(
        selectedDoc.id,
        step.roleName,
        step.assignedToEmail || 'test@example.com'
      );
      setSelectedDoc(updated);
    }
    setComment('');
  };`;

content = content.replace(oldHandleApproveStep, newHandleApproveStep);
fs.writeFileSync('src/components/ApprovalWorkflow.tsx', content);
console.log("Fixed handleApproveStep");
