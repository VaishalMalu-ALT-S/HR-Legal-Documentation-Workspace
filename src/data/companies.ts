export interface CompanyBrand {
  id: string;
  name: string;
  logoUrl: string;
  headerText: string;
  footerText: string;
  themeColor: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  cin: string;
  gstin: string;
}

export const COMPANIES: CompanyBrand[] = [
  {
    id: 'sifratech',
    name: 'Sifratech',
    logoUrl: '/Sifratech.png',
    headerText: 'Sifratech Solutions',
    footerText: 'Sifratech Solutions Private Limited • Confidential',
    themeColor: '#0052cc',
    address: 'Sifratech Tech Park, Bangalore, India',
    phone: '+91 80 4567 8900',
    email: 'contact@sifratech.in',
    website: 'www.sifratech.in',
    cin: 'U72900KA2020PTC123456',
    gstin: '29AAECS1234F1Z1',
  },
  {
    id: 'link_erp',
    name: 'Link ERP',
    logoUrl: '/LinkERP.png',
    headerText: 'Link ERP Enterprise Systems',
    footerText: 'Link ERP Solutions • Strictly Confidential',
    themeColor: '#0c5c9e', // Professional Blue to match their logo
    address: 'Link ERP Hub, Mumbai, India',
    phone: '+91 22 2845 6789',
    email: 'info@linkerp.com',
    website: 'www.linkerp.com',
    cin: 'U72200MH2015PTC789012',
    gstin: '27AABCL5678G1Z2',
  },
  {
    id: 'alt_s',
    name: 'ALT-S Technology',
    logoUrl: '/altslogo.png',
    headerText: 'ALT-S TECHNOLOGY PRIVATE LIMITED',
    footerText: 'ALT-S Technology Private Limited • All Rights Reserved',
    themeColor: '#4f46e5',
    address: 'No. 4, Mullai Street, Thiruvalluvar Nagar,\nKamarajnagar, Poonamallee, Tiruvallur,\nTamil Nadu - 600071, INDIA',
    phone: '+91 78455 03084',
    email: 'info@alt-s.in',
    website: 'www.alt-s.in',
    cin: 'U62099TN2023PTC163053',
    gstin: '33AAZCA2708F1ZN',
  }
];
