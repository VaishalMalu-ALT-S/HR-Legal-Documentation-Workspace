const fs = require('fs');

let db = fs.readFileSync('src/components/DocumentBuilder.tsx', 'utf8');
if (!db.includes('UploadCloud')) {
    db = db.replace('Upload,', 'Upload, UploadCloud,');
}
fs.writeFileSync('src/components/DocumentBuilder.tsx', db);

let types = fs.readFileSync('src/types/index.ts', 'utf8');
types = types.replace('assignedToName: string;', 'assignedToName: string;\n  assignedToEmail?: string;');
fs.writeFileSync('src/types/index.ts', types);

let aw = fs.readFileSync('src/components/ApprovalWorkflow.tsx', 'utf8');
aw = aw.replace('step.assignedToEmail ||', '(step as any).assignedToEmail ||');
fs.writeFileSync('src/components/ApprovalWorkflow.tsx', aw);

console.log("Done");
