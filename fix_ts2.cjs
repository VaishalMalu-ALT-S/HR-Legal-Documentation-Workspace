const fs = require('fs');

// Fix DocumentBuilder
let db = fs.readFileSync('src/components/DocumentBuilder.tsx', 'utf8');
if (!db.includes('UploadCloud')) {
  db = db.replace('Upload,', 'Upload, UploadCloud,');
  db = db.replace('FileText,', 'FileText, UploadCloud,');
}
fs.writeFileSync('src/components/DocumentBuilder.tsx', db);

// Fix types
let types = fs.readFileSync('src/types/index.ts', 'utf8');
types = types.replace(/assignedToName: string;/g, 'assignedToName: string;\n  assignedToEmail?: string;');
fs.writeFileSync('src/types/index.ts', types);

console.log("Fixed TS errors");
