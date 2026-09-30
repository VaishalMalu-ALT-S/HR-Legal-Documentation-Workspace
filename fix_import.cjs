const fs = require('fs');
let content = fs.readFileSync('src/components/DocumentBuilder.tsx', 'utf8');

if (!content.includes('import { COMPANIES, CompanyBrand }')) {
  content = content.replace(
    "import { COMPANY_TEMPLATES } from '../data/templates';",
    "import { COMPANY_TEMPLATES } from '../data/templates';\nimport { COMPANIES, CompanyBrand } from '../data/companies';"
  );
  fs.writeFileSync('src/components/DocumentBuilder.tsx', content);
  console.log("Fixed COMPANIES import");
}
