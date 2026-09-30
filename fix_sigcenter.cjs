const fs = require('fs');
let content = fs.readFileSync('src/components/SignatureCenter.tsx', 'utf8');

// Ensure useEffect is imported
if (!content.includes('useEffect')) {
  content = content.replace(
    /import React, \{([\s\S]*?)\} from 'react';/,
    (match, p1) => {
      return `import React, { useEffect, ${p1.trim()} } from 'react';`;
    }
  );
}

// Add the initialization logic
const targetDocCheck = `
    const [zoom, setZoom] = useState(100);`;

const newEffect = `
    const [zoom, setZoom] = useState(100);

    useEffect(() => {
      if (targetDoc?.variableValues?.isUploaded === 'true' && targetDoc?.variableValues?.uploadedImages) {
        setDocPages(JSON.parse(targetDoc.variableValues.uploadedImages));
        setHasUploadedDoc(true);
        setDocName(targetDoc.title);
      }
    }, [targetDoc]);
`;

if (!content.includes('JSON.parse(targetDoc.variableValues.uploadedImages)')) {
  content = content.replace(targetDocCheck, newEffect);
}

fs.writeFileSync('src/components/SignatureCenter.tsx', content);
console.log("Added useEffect to SignatureCenter.tsx for uploaded docs");
