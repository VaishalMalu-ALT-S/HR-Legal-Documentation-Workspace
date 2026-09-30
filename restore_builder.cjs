const fs = require('fs');
let content = fs.readFileSync('src/components/DocumentBuilder.tsx', 'utf8');

if (!content.includes('import { DocumentUploader }')) {
  content = content.replace(
    "import { DocumentCategory } from '../types';", 
    "import { DocumentCategory } from '../types';\nimport { DocumentUploader } from './DocumentUploader';"
  );
}

if (!content.includes('const [creationMode')) {
  const insertState = `const [creationMode, setCreationMode] = useState<'template'|'upload'>('template');
  
  if (creationMode === 'upload') {
    return <DocumentUploader onSwitch={() => setCreationMode('template')} onSaveSuccess={() => onSaveSuccess && onSaveSuccess()} />;
  }

  // Current active template & company`;
  
  content = content.replace('// Current active template & company', insertState);
}

// Ensure UploadCloud is imported
if (!content.includes('UploadCloud')) {
  content = content.replace('Upload,', 'Upload, UploadCloud,');
  content = content.replace('FileText,', 'FileText, UploadCloud,');
}

// Add the upload toggle next to the template selector
content = content.replace(
  /(\{\s*COMPANY_TEMPLATES\.map\(tpl => \([\s\S]*?<\/option>\s*\)\)\s*\}\s*<\/select>)/,
  `$1
          
          <div className="flex items-center space-x-2 border-l border-slate-200 pl-3 ml-2">
            <button
              onClick={() => setCreationMode('upload')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-md border border-indigo-200 shadow-sm transition-colors"
              title="Upload existing Document"
            >
              <UploadCloud size={14} />
              <span>Upload Document</span>
            </button>
          </div>`
);

fs.writeFileSync('src/components/DocumentBuilder.tsx', content);
console.log('Restored uploader logic correctly');
