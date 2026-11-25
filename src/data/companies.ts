export interface CompanyBrand {
  id: string;
  name: string;
  logoUrl: string;
  letterheadUrl?: string;
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
    id: 'alt_s',
    name: 'ALT-S Technology Private Limited',
    logoUrl: '/altslogo.png',
    letterheadUrl: '/alts_letterhead.jpg',
    headerText: 'ALT-S TECHNOLOGY PRIVATE LIMITED',
    footerText: 'CIN: U62099TN2023PTC163053 | GSTIN: 33AAZCA2708F1ZN',
    themeColor: '#0a3161',
    address: 'No. 4, Mullai Street, Thiruvalluvar Nagar,\nKamarajnagar, Poonamallee, Tiruvallur,\nTamil Nadu - 600071, INDIA',
    phone: '+91 78455 03084',
    email: 'info@alt-s.in',
    website: 'www.alt-s.in',
    cin: 'U62099TN2023PTC163053',
    gstin: '33AAZCA2708F1ZN',
  },
  {
    id: 'link_erp',
    name: 'Link ERP Technologies L.L.C',
    logoUrl: '/LinkERP.png',
    letterheadUrl: '/linkerp_letterhead.jpg',
    headerText: 'LINK ERP TECHNOLOGIES L.L.C',
    footerText: 'TR No: 105272498400003  CR No: 105272498400001',
    themeColor: '#0a1e38',
    address: 'HILAL SALIM BIN TARRAF\nBUILDING - 76, BUR DUBAI,\nAL WASL - M8, DUBAI',
    phone: '+971508568455',
    email: 'info@linkerptech.com',
    website: 'linkerptech.com',
    cin: '105272498400001',
    gstin: '105272498400003',
  },
  {
    id: 'sifratech',
    name: 'Sifratech Consulting LLC',
    logoUrl: '/Sifratech.png',
    letterheadUrl: '/sifratech_letterhead.jpg',
    headerText: 'SIFRATECH CONSULTING LLC',
    footerText: 'CR No: 105310106700001  TRN: 105310106700003',
    themeColor: '#042750',
    address: 'AL MAMZAR BUILDING,\nPLOT NO. 232-0,\nDUBAI, UNITED ARAB EMIRATES.',
    phone: '+971524581340',
    email: 'contact@sifratc.com',
    website: 'sifratc.com',
    cin: '105310106700001',
    gstin: '105310106700003',
  }
];
