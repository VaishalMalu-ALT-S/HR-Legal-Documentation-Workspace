const fs = require('fs');
let content = fs.readFileSync('src/components/DocumentBuilder.tsx', 'utf8');

content = content.replace(
  /category: \(selectedTemplateId === 'asset_acknowledgment' \? 'acknowledgement_form' : 'appointment_letter'\) as DocumentCategory,\s*personName: variables\.recipientName \|\| 'Employee \/ Consultant',/,
  "category: (selectedTemplateId === 'asset_acknowledgment' ? 'acknowledgement_form' : 'appointment_letter') as DocumentCategory,\n        companyId: selectedCompanyId,\n        personName: variables.recipientName || 'Employee / Consultant',"
);

fs.writeFileSync('src/components/DocumentBuilder.tsx', content);
console.log('Fixed companyId in DocumentBuilder');
