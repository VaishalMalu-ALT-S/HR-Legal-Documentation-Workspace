const fs = require('fs');
let content = fs.readFileSync('src/components/DocumentBuilder.tsx', 'utf8');

const insertState = `const [creationMode, setCreationMode] = useState<'template'|'upload'>('template');
  
  if (creationMode === 'upload') {
    return <DocumentUploader onSwitch={() => setCreationMode('template')} onSaveSuccess={() => onSaveSuccess && onSaveSuccess()} />;
  }

  // Current active template`;
  
content = content.replace('// Current active template', insertState);

fs.writeFileSync('src/components/DocumentBuilder.tsx', content);
console.log('Fixed creationMode definition');
