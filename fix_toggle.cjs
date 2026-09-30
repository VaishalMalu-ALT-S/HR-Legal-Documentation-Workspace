const fs = require('fs');
let content = fs.readFileSync('src/components/DocumentBuilder.tsx', 'utf8');

if (!content.includes('Upload Document')) {
  content = content.replace(
    /<\/select>\s*<input\s*type="text"/,
    `</select>

          <div className="flex items-center space-x-2 border-l border-slate-200 pl-3 ml-2">
            <button
              onClick={() => setCreationMode('upload')}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded border border-indigo-200 transition-colors shadow-sm"
              title="Upload your own PDF or Word document"
            >
              <UploadCloud size={14} />
              <span>Upload Document</span>
            </button>
          </div>

          <input type="text"`
  );
  fs.writeFileSync('src/components/DocumentBuilder.tsx', content);
  console.log('Fixed toggle button');
} else {
  console.log('Toggle button already exists');
}
