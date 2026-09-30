const fs = require('fs');
let content = fs.readFileSync('src/components/DocumentBuilder.tsx', 'utf8');

// 1. Remove the early conditional return from the top
content = content.replace(
`  if (creationMode === 'upload') {
    return <DocumentUploader onSwitch={() => setCreationMode('template')} onSaveSuccess={() => onSaveSuccess && onSaveSuccess()} />;
  }`,
  ""
);

// 2. Insert it right before the main return statement
content = content.replace(
  "  return (",
  `  if (creationMode === 'upload') {
    return <DocumentUploader onSwitch={() => setCreationMode('template')} onSaveSuccess={() => onSaveSuccess && onSaveSuccess()} />;
  }

  return (`
);

fs.writeFileSync('src/components/DocumentBuilder.tsx', content);
console.log('Fixed Rules of Hooks violation');
