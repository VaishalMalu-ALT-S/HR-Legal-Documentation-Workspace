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
    return <DocumentUploader onSwitch={() => setCreationMode('template')} onSaveSuccess={onSaveSuccess} />;
  }

  // Current active template & company`;
  
  content = content.replace('// Current active template & company', insertState);
}

const addUploadButton = `</select>
          </div>

          <div className="flex items-center space-x-2 border-l border-slate-200 pl-3 ml-3">
            <button
              onClick={() => setCreationMode('upload')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md transition-colors border border-indigo-200"
            >
              <UploadCloud size={14} />
              <span>Upload Existing Document</span>
            </button>
          </div>`;

// find the exact place to put the new button. It is after the template selector.
if (!content.includes('Upload Existing Document')) {
  const target = `</select>
          </div>`;
  // Replace the first occurrence of this target that comes after `Template:`
  content = content.replace(
    /(<span className="text-xs font-bold uppercase tracking-wider text-slate-500">Template:<\/span>\s*<\/div>\s*<select[\s\S]*?<\/select>\s*<\/div>)/,
    `$1

          <div className="flex items-center space-x-2 border-l border-slate-200 pl-3 ml-1">
            <button
              onClick={() => setCreationMode('upload')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded border border-indigo-200 transition-colors shadow-sm"
              title="Upload your own PDF or Word document"
            >
              <UploadCloud size={14} />
              <span>Upload Document</span>
            </button>
          </div>`
  );
}

// Add UploadCloud to lucide imports if needed
if (!content.includes('UploadCloud')) {
  content = content.replace('Upload,', 'Upload, UploadCloud,');
  content = content.replace('FileText,', 'FileText, UploadCloud,');
}

fs.writeFileSync('src/components/DocumentBuilder.tsx', content);
console.log("Updated DocumentBuilder.tsx with uploader toggle");
