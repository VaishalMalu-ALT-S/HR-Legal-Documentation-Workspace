const fs = require('fs');
let content = fs.readFileSync('src/components/DocumentBuilder.tsx', 'utf8');

content = content.replace(
  "  // Current active template",
  `  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('alt_s');
  const selectedCompany = COMPANIES.find(c => c.id === selectedCompanyId) || COMPANIES[0];

  // Current active template`
);

fs.writeFileSync('src/components/DocumentBuilder.tsx', content);
console.log('Fixed selectedCompanyId in DocumentBuilder');
