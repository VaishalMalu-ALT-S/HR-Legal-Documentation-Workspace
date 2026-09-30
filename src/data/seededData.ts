import { Employee, Contractor, DocumentTemplate, SmartDocument, AuditLog } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    employeeId: 'ALT-1082',
    fullName: 'Lokesh Kumar',
    email: 'lokesh.kumar@alt-s.in',
    phone: '+91 98765 43210',
    department: 'Enterprise Applications',
    designation: 'Oracle HRMS/HCM Solution Architect',
    employmentType: 'Full-Time',
    dateOfJoining: '2026-08-10',
    workLocation: 'Chennai / Work from Home',
    reportingManager: 'Umamaheshwari. S (Managing Director)',
    salaryCtc: 2400000,
    panNumber: 'ABCDE1234F',
    address: 'No. 42, Grand Trunk Road, Guindy, Chennai, Tamil Nadu - 600032',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'emp-002',
    employeeId: 'SIF-2041',
    fullName: 'Manisha',
    email: 'manisha@sifratech.in',
    phone: '+91 98123 45678',
    department: 'Administration & HR',
    designation: 'Administration Executive',
    employmentType: 'Full-Time',
    dateOfJoining: '2026-07-30',
    workLocation: 'Chennai Office',
    reportingManager: 'Rajesh Subramanian (Head of Admin)',
    salaryCtc: 480000,
    panNumber: 'FGHIJ5678K',
    address: 'Flat 301, Lakeview Apartments, Velachery, Chennai, Tamil Nadu - 600042',
    createdAt: '2026-07-25T09:00:00Z',
  },
  {
    id: 'emp-003',
    employeeId: 'TR001',
    fullName: 'Vaishal Malu',
    email: 'vaishal.malu@alt-s.in',
    phone: '+91 78455 03084',
    department: 'Artificial Intelligence',
    designation: 'AI Trainee',
    employmentType: 'Trainee',
    dateOfJoining: '2026-07-03',
    workLocation: 'Chennai Office / Hybrid',
    reportingManager: 'Karthik Raja (AI Practice Lead)',
    salaryCtc: 600000,
    panNumber: 'KLMNO9012P',
    address: 'No. 4, Mullai Street, Thiruvalluvar Nagar, Kamaraj Nagar, Poonamallee, Tiruvallur, Tamil Nadu - 600071',
    createdAt: '2026-07-01T08:00:00Z',
  },
  {
    id: 'emp-004',
    employeeId: 'ALT-1095',
    fullName: 'Ananya Sharma',
    email: 'ananya.sharma@alt-s.in',
    phone: '+91 97711 22334',
    department: 'Software Engineering',
    designation: 'Senior Full Stack Engineer',
    employmentType: 'Full-Time',
    dateOfJoining: '2026-09-01',
    workLocation: 'Chennai HQ',
    reportingManager: 'Lokesh Kumar',
    salaryCtc: 1800000,
    panNumber: 'PQRST3456U',
    address: 'B-404, Silicon Towers, OMR, Chennai, Tamil Nadu - 600096',
    createdAt: '2026-08-20T11:30:00Z',
  }
];

export const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: 'con-001',
    contractorId: 'CON-2026-08',
    fullName: 'Vrutika Prajapati',
    companyName: 'ALT-S Technology Private Limited',
    email: 'vrutika.prajapati@contractor.alt-s.in',
    phone: '+91 99001 12233',
    role: 'Oracle Technical Consultant',
    contractStartDate: '2026-08-10',
    contractEndDate: '2026-10-10',
    engagementType: 'Fixed-Term',
    rateCompensation: 'INR 1,50,000 / Month (TDS @ 1%)',
    createdAt: '2026-08-05T14:00:00Z',
  },
  {
    id: 'con-002',
    contractorId: 'CON-2026-12',
    fullName: 'Rajesh Verma',
    companyName: 'CyberGuard Solutions',
    email: 'rajesh.verma@cyberguard.io',
    phone: '+91 98888 77766',
    role: 'Database Security Specialist',
    contractStartDate: '2026-09-15',
    contractEndDate: '2026-12-15',
    engagementType: 'Project-Based',
    rateCompensation: 'INR 2,20,000 / Month',
    createdAt: '2026-08-25T16:00:00Z',
  }
];

export const INITIAL_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl-app-letter',
    name: 'Standard Employee Appointment Letter',
    category: 'appointment_letter',
    currentVersion: '1.1',
    status: 'active',
    createdBy: 'Super Admin',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-08-01T11:20:00Z',
    defaultWorkflow: ['HR Admin', 'HR Manager', 'Authorized Signatory', 'Employee'],
    versions: [
      {
        id: 'ver-app-1.0',
        templateId: 'tpl-app-letter',
        versionNumber: '1.0',
        changelog: 'Initial version created with basic employment terms and 1-month notice period.',
        createdBy: 'Super Admin',
        createdAt: '2026-06-01T10:00:00Z',
        variables: ['joining_date', 'employee_name', 'designation', 'company_name', 'work_location', 'salary_monthly', 'salary_annual'],
        content: `Date: {{joining_date}}

APPOINTMENT LETTER

{{company_name}}
No. 4, Mullai Street, Thiruvalluvar Nagar, Kamaraj Nagar,
Poonamallee, Tiruvallur, Tamil Nadu – 600071, India

Subject: Appointment Letter for the Position of {{designation}}

Dear {{salutation}} {{employee_name}},

Heartiest Congratulations!

We are pleased to offer you the position of {{designation}} and welcome you to be part of the emerging success of {{company_name}} on the following terms and conditions:

1. DESIGNATION AND PLACE OF WORK
You will be designated as {{designation}} and will be based at {{work_location}}. You will be required to work from the Company's Chennai office and shall also be available to work from client locations or work from home depending on project requirements.

2. REMUNERATION & COMPENSATION
Your total fixed remuneration shall be INR {{salary_annual}} per annum.

3. TERMINATION OF EMPLOYMENT
Either party may terminate employment by giving 3 months' written notice.

Yours faithfully,
For {{company_name}}

Umamaheshwari. S
Managing Director`
      },
      {
        id: 'ver-app-1.1',
        templateId: 'tpl-app-letter',
        versionNumber: '1.1',
        changelog: 'Added Annexure I compensation breakdown table, Annexure II mandatory document checklist, non-compete clause, and background verification terms.',
        createdBy: 'Legal Team',
        createdAt: '2026-08-01T11:20:00Z',
        variables: [
          'joining_date', 'employee_name', 'salutation', 'designation', 'company_name', 
          'work_location', 'basic_monthly', 'basic_annual', 'hra_monthly', 'hra_annual', 
          'special_monthly', 'special_annual', 'gross_monthly', 'gross_annual', 
          'pf_monthly', 'pf_annual', 'ctc_monthly', 'ctc_annual', 'net_monthly', 'net_annual'
        ],
        content: `Date: {{joining_date}}                                                       Appointment Letter

{{company_name}}
No. 4, Mullai Street, Thiruvalluvar Nagar, Kamaraj Nagar,
Poonamallee, Tiruvallur, Tamil Nadu – 600071, India

Subject: Appointment Letter for the Position of {{designation}}.

Dear {{salutation}} {{employee_name}},

Heartiest Congratulations!

We are pleased to offer you the position of {{designation}} and welcome you to be part of the emerging success of {{company_name}} (hereinafter referred to as "Company" or "Organization") on the following terms and conditions.

DESIGNATION AND PLACE OF WORK
You will be designated as {{designation}} and will be based on {{work_location}} based on Company's Requirements. You will be required to work from the Company's Chennai office and shall also be available to work from client locations, other offices of the Company, or work from home depending on project and business requirements.

TERMINATION OF EMPLOYMENT
Your employment may be terminated by either party by giving three (3) months' written notice or payment of basic salary in lieu of notice.
Immediate Termination: Violation of laws/policies, false documents provided during hiring, parallel employment, or unauthorized absence (>3 days).

CONFIDENTIALITY AND TRADE SECRETS
During and after your employment, you must maintain strict confidentiality regarding company information, trade secrets, customer data, and proprietary information.

JURISDICTION
Any disputes arising from this employment shall be subject to the jurisdiction of competent courts in Chennai, Tamil Nadu.

ACCEPTANCE OF OFFER
Your employment will commence from your {{joining_date}}. Kindly sign and return the duplicate copy of this letter as a token of acceptance.

Yours faithfully,
For {{company_name}}

Umamaheshwari. S
Managing Director

ANNEXURE – I: REMUNERATION STRUCTURE
[COMPENSATION_TABLE]

ANNEXURE – II: LIST OF MANDATORY DOCUMENTS (PHOTOCOPIES)
1. 10th & 12th Marksheets / Passing Certificates (1 copy)
2. Graduation Degree / Provisional Certificate (1 copy)
3. Ration Card / Telephone Bill / Electricity Bill (1 copy)
4. Driving License / Voter ID / PAN Card (2 copies)
5. Passport Size Photographs (5 copies)
6. Relieving Letters of all previous employments (1 copy)`
      }
    ]
  },
  {
    id: 'tpl-contractor-offer',
    name: 'Contractor Offer Letter of Engagement',
    category: 'contractor_offer',
    currentVersion: '1.0',
    status: 'active',
    createdBy: 'HR Manager',
    createdAt: '2026-07-15T09:00:00Z',
    updatedAt: '2026-08-05T10:00:00Z',
    defaultWorkflow: ['HR Admin', 'Authorized Signatory', 'Contractor'],
    versions: [
      {
        id: 'ver-con-1.0',
        templateId: 'tpl-contractor-offer',
        versionNumber: '1.0',
        changelog: 'Official fixed-term contractor engagement agreement template with TDS clause & KRA criteria.',
        createdBy: 'HR Manager',
        createdAt: '2026-08-05T10:00:00Z',
        variables: [
          'contractor_name', 'salutation', 'role', 'company_name', 'start_date', 
          'end_date', 'professional_fee', 'tds_rate'
        ],
        content: `Contractor – Letter of Offer

To,
{{salutation}} {{contractor_name}},

Subject: Offer of Contract Engagement as {{role}}

Dear {{contractor_name}},

We are pleased to offer you an engagement as an {{role}} on a contractual basis with {{company_name}} for a fixed period commencing from {{start_date}} and ending on {{end_date}}. The contract may be extended based on project requirements.

1. Engagement Period
Your contract engagement shall be effective from {{start_date}} and shall automatically expire on {{end_date}}, unless extended in writing by {{company_name}}.

2. Professional Fee
You shall be paid a professional fee of {{professional_fee}} per month. Applicable Tax Deducted at Source (TDS) at {{tds_rate}} shall be deducted as per prevailing tax regulations.

3. Nature of Engagement
This engagement is purely contractual in nature and does not constitute permanent employment with the Company. You shall not have any claim to permanent employment.

4. Key Result Areas (KRAs)
Your performance during the contract period shall be evaluated based on:
- Successful delivery of assigned consulting responsibilities.
- Timely completion of implementation activities.
- Customer feedback rating of 4 or 5 out of 5.

5. Payment Terms
Monthly payments shall be processed within 15 days after completion of the respective month's services, subject to approved timesheet submission.

6. Return of Company Assets
All Company assets (laptops, documents, access cards) must be returned prior to final settlement release.

For {{company_name}}

Uma Maheshwari A
Managing Director`
      }
    ]
  },
  {
    id: 'tpl-asset-form',
    name: 'Asset Allocation & Acknowledgment Letter',
    category: 'asset_form',
    currentVersion: '1.0',
    status: 'active',
    createdBy: 'IT Admin',
    createdAt: '2026-07-01T12:00:00Z',
    updatedAt: '2026-07-01T12:00:00Z',
    defaultWorkflow: ['IT Admin', 'Employee'],
    versions: [
      {
        id: 'ver-asset-1.0',
        templateId: 'tpl-asset-form',
        versionNumber: '1.0',
        changelog: 'Standard IT hardware asset allocation & policy acknowledgment form.',
        createdBy: 'IT Admin',
        createdAt: '2026-07-01T12:00:00Z',
        variables: [
          'issue_date', 'employee_name', 'employee_id', 'designation', 'company_name',
          'asset_type', 'device_id', 'asset_condition', 'accessories_provided'
        ],
        content: `Asset Acknowledgment Letter

Date: {{issue_date}}
Employee Name: {{employee_name}}
Employee ID: {{employee_id}}
Designation: {{designation}}
Company Name: {{company_name}}

Asset Details:
---------------------------------------------------------------------------------------
Asset Type         | Device ID                              | Condition | Accessories Provided
---------------------------------------------------------------------------------------
{{asset_type}}     | {{device_id}}                         | {{asset_condition}} | {{accessories_provided}}
---------------------------------------------------------------------------------------

Terms and Conditions:
1. The employee acknowledges receipt of the above company asset(s) and agrees to use them solely for work-related activities.
2. The employee is responsible for keeping the asset in good condition and reporting any damages or issues immediately.
3. In case of loss or damage due to negligence, the employee may be held liable for repair or replacement costs.
4. The asset remains the property of the company and must be returned upon resignation, termination, or upon request.
5. Any unauthorized modifications, installations, or use of personal software on the device is prohibited.
6. The employee must return the laptop in the same condition as issued. Last month's salary will be processed only after successful verification of asset condition.

Employee Acknowledgment:
I, {{employee_name}}, acknowledge receiving the above-mentioned company asset(s) and agree with the terms stated in this document.

Signature: ______________________                  Date: {{issue_date}}`
      }
    ]
  },
  {
    id: 'tpl-bond-agreement',
    name: 'Employee Service Bond Agreement',
    category: 'bond_agreement',
    currentVersion: '1.0',
    status: 'active',
    createdBy: 'Legal Admin',
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-07-10T10:00:00Z',
    defaultWorkflow: ['HR Admin', 'Authorized Signatory', 'Employee'],
    versions: [
      {
        id: 'ver-bond-1.0',
        templateId: 'tpl-bond-agreement',
        versionNumber: '1.0',
        changelog: 'Service bond agreement with 2-year commitment & specialized training cost clause.',
        createdBy: 'Legal Admin',
        createdAt: '2026-07-10T10:00:00Z',
        variables: ['employee_name', 'employee_id', 'joining_date', 'bond_months', 'bond_amount', 'company_name'],
        content: `SERVICE BOND AGREEMENT

This Agreement is made on {{joining_date}} between {{company_name}} and {{employee_name}} (Employee ID: {{employee_id}}).

WHEREAS the Company agrees to impart specialized domain and technical training to the Employee, the Employee undertakes to serve the Company for a minimum period of {{bond_months}} months from the date of joining.

IN THE EVENT of breach or early resignation prior to completion of {{bond_months}} months, the Employee agrees to liquidate and pay damages of INR {{bond_amount}} to compensate for training costs and administrative overheads.

Signed by Employee: {{employee_name}}
Signed for {{company_name}}: Authorized Signatory`
      }
    ]
  },
  {
    id: 'tpl-ack-form',
    name: 'Employee Policy & NDA Acknowledgement Form',
    category: 'acknowledgement_form',
    currentVersion: '1.0',
    status: 'active',
    createdBy: 'HR Admin',
    createdAt: '2026-07-05T10:00:00Z',
    updatedAt: '2026-07-05T10:00:00Z',
    defaultWorkflow: ['HR Admin', 'Employee'],
    versions: [
      {
        id: 'ver-ack-1.0',
        templateId: 'tpl-ack-form',
        versionNumber: '1.0',
        changelog: 'Standard IT security, code of conduct & NDA acknowledgment.',
        createdBy: 'HR Admin',
        createdAt: '2026-07-05T10:00:00Z',
        variables: ['employee_name', 'employee_id', 'department', 'date', 'company_name'],
        content: `EMPLOYEE POLICY & NDA ACKNOWLEDGEMENT FORM

I, {{employee_name}} (Employee ID: {{employee_id}}), hereby confirm that I have received, read, and understood the Employee Code of Conduct, Information Security Policy, and Non-Disclosure Agreement of {{company_name}}.

I agree to strictly abide by all company policies during my tenure.

Date: {{date}}
Signature: {{employee_name}}`
      }
    ]
  }
];

export const INITIAL_DOCUMENTS: SmartDocument[] = [
  {
    id: 'doc-001',
    documentNumber: 'DOC-2026-000124',
    title: 'Appointment Letter — Lokesh Kumar',
    category: 'appointment_letter',
      companyId: 'alt_s',
    employeeId: 'emp-001',
    personName: 'Lokesh Kumar',
    personEmail: 'lokesh.kumar@alt-s.in',
    personRole: 'Oracle HRMS/HCM Solution Architect',
    templateVersionId: 'ver-app-1.1',
    templateVersionNumber: '1.1',
    status: 'signed',
    variableValues: {
      joining_date: '10-08-2026',
      employee_name: 'Lokesh Kumar',
      salutation: 'Mr.',
      designation: 'Oracle HRMS/HCM Solution Architect',
      company_name: 'ALT-S Technology Private Limited',
      work_location: 'WFH / Client Office in Chennai',
      basic_monthly: '1,20,000.00',
      basic_annual: '14,40,000.00',
      hra_monthly: '40,000.00',
      hra_annual: '4,80,000.00',
      special_monthly: '38,200.00',
      special_annual: '4,58,400.00',
      gross_monthly: '1,98,200.00',
      gross_annual: '23,78,400.00',
      pf_monthly: '1,800.00',
      pf_annual: '21,600.00',
      ctc_monthly: '2,00,000.00',
      ctc_annual: '24,00,000.00',
      net_monthly: '1,66,461.00',
      net_annual: '19,97,532.00',
    },
    documentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    originalHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    isTampered: false,
    qrVerificationCode: 'DOC-2026-000124',
    verificationUrl: '/verify/DOC-2026-000124',
    generatedAt: '2026-08-01T10:30:00Z',
    generatedBy: 'HR Admin (Preeti Nair)',
    signedAt: '2026-08-01T11:22:00Z',
    createdAt: '2026-08-01T10:30:00Z',
    updatedAt: '2026-08-01T11:22:00Z',
    signatures: [
      {
        id: 'sig-001',
        documentId: 'doc-001',
        signatoryName: 'Umamaheshwari. S',
        signatoryRole: 'Managing Director (Authorized Signatory)',
        signatoryEmail: 'uma@alt-s.in',
        method: 'dsc_token',
        certificateSerial: '8A9F-341C-9902-E7B1',
        certificateIssuer: 'eMudhra Enterprise CA Class 3',
        algorithm: 'SHA-256 with RSA 2048-bit',
        signedAt: '2026-08-01T11:21:00Z',
        signatureHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        status: 'valid'
      }
    ],
    approvalWorkflow: {
      id: 'wf-001',
      documentId: 'doc-001',
      currentStepIndex: 4,
      status: 'approved',
      steps: [
        { stepNumber: 1, roleName: 'HR Admin', assignedToName: 'Preeti Nair', status: 'approved', comment: 'Document generated with verified CTC details.', updatedAt: '2026-08-01T10:32:00Z' },
        { stepNumber: 2, roleName: 'HR Manager', assignedToName: 'Suresh Kumar', status: 'approved', comment: 'Approved appointment terms and band grade.', updatedAt: '2026-08-01T10:45:00Z' },
        { stepNumber: 3, roleName: 'Legal Review', assignedToName: 'Anil Mehta', status: 'approved', comment: 'Legal clauses compliance verified.', updatedAt: '2026-08-01T11:10:00Z' },
        { stepNumber: 4, roleName: 'Authorized Signatory', assignedToName: 'Umamaheshwari. S', status: 'approved', comment: 'Digitally signed via Class 3 DSC USB Token.', updatedAt: '2026-08-01T11:21:00Z' }
      ]
    }
  },
  {
    id: 'doc-002',
    documentNumber: 'DOC-2026-000125',
    title: 'Contractor Offer Letter — Vrutika Prajapati',
    category: 'contractor_offer',
      companyId: 'alt_s',
    contractorId: 'con-001',
    personName: 'Vrutika Prajapati',
    personEmail: 'vrutika.prajapati@contractor.alt-s.in',
    personRole: 'Oracle Technical Consultant',
    templateVersionId: 'ver-con-1.0',
    templateVersionNumber: '1.0',
    status: 'signature_authorized',
    variableValues: {
      contractor_name: 'Vrutika Prajapati',
      salutation: 'Mrs.',
      role: 'Oracle Technical Consultant',
      company_name: 'ALT-S Technology Private Limited',
      start_date: '10th August 2026',
      end_date: '10th October 2026',
      professional_fee: 'INR 1,50,000/-',
      tds_rate: '1%'
    },
    documentHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    originalHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    isTampered: false,
    qrVerificationCode: 'DOC-2026-000125',
    verificationUrl: '/verify/DOC-2026-000125',
    generatedAt: '2026-08-05T14:10:00Z',
    generatedBy: 'HR Admin (Preeti Nair)',
    createdAt: '2026-08-05T14:10:00Z',
    updatedAt: '2026-08-05T14:10:00Z',
    signatures: [],
    approvalWorkflow: {
      id: 'wf-002',
      documentId: 'doc-002',
      currentStepIndex: 2,
      status: 'in_progress',
      steps: [
        { stepNumber: 1, roleName: 'HR Admin', assignedToName: 'Preeti Nair', status: 'approved', comment: 'Contractor agreement drafted.', updatedAt: '2026-08-05T14:12:00Z' },
        { stepNumber: 2, roleName: 'Authorized Signatory', assignedToName: 'Uma Maheshwari A', status: 'pending', comment: 'Awaiting DSC digital signature execution.' }
      ]
    }
  },
  {
    id: 'doc-003',
    documentNumber: 'DOC-2026-000126',
    title: 'Asset Acknowledgment Letter — Vaishal Malu',
    category: 'asset_form',
      companyId: 'alt_s',
    employeeId: 'emp-003',
    personName: 'Vaishal Malu',
    personEmail: 'vaishal.malu@alt-s.in',
    personRole: 'AI Trainee',
    templateVersionId: 'ver-asset-1.0',
    templateVersionNumber: '1.0',
    status: 'signed',
    variableValues: {
      issue_date: '03-July-2026',
      employee_name: 'Vaishal Malu',
      employee_id: 'TR001',
      designation: 'AI Trainee',
      company_name: 'ALT-S Technology Private Limited',
      asset_type: 'Laptop & Charger',
      device_id: '9337D21F-C5FE-4614-B8C8-4A29CEEB40A6',
      asset_condition: 'Used',
      accessories_provided: 'Laptop Charger / Mouse'
    },
    documentHash: '8f4e04a796e625a698a44275f1a26084050a41d4021272635905d47154030612',
    originalHash: '8f4e04a796e625a698a44275f1a26084050a41d4021272635905d47154030612',
    isTampered: false,
    qrVerificationCode: 'DOC-2026-000126',
    verificationUrl: '/verify/DOC-2026-000126',
    generatedAt: '2026-07-03T09:00:00Z',
    generatedBy: 'IT Asset Admin',
    signedAt: '2026-07-03T09:15:00Z',
    createdAt: '2026-07-03T09:00:00Z',
    updatedAt: '2026-07-03T09:15:00Z',
    signatures: [
      {
        id: 'sig-003',
        documentId: 'doc-003',
        signatoryName: 'Vaishal Malu',
        signatoryRole: 'Employee Acknowledgment',
        signatoryEmail: 'vaishal.malu@alt-s.in',
        method: 'demo_mode',
        signedAt: '2026-07-03T09:15:00Z',
        signatureHash: '439d5843b0d7d23d8c1c4f2756a12b',
        status: 'valid'
      }
    ],
    approvalWorkflow: {
      id: 'wf-003',
      documentId: 'doc-003',
      currentStepIndex: 2,
      status: 'approved',
      steps: [
        { stepNumber: 1, roleName: 'IT Admin', assignedToName: 'Ramesh IT Lead', status: 'approved', comment: 'Asset issued and serial logged.', updatedAt: '2026-07-03T09:05:00Z' },
        { stepNumber: 2, roleName: 'Employee', assignedToName: 'Vaishal Malu', status: 'approved', comment: 'Acknowledged asset receipt.', updatedAt: '2026-07-03T09:15:00Z' }
      ]
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    documentId: 'doc-001',
    documentNumber: 'DOC-2026-000124',
    userName: 'Preeti Nair',
    userRole: 'hr',
    action: 'Document Created',
    details: 'Initiated Appointment Letter wizard for Lokesh Kumar (Oracle HRMS Solution Architect).',
    ipAddress: '192.168.1.104',
    previousStatus: 'None',
    newStatus: 'Draft',
    timestamp: '2026-08-01T10:30:00Z'
  },
  {
    id: 'log-002',
    documentId: 'doc-001',
    documentNumber: 'DOC-2026-000124',
    userName: 'Preeti Nair',
    userRole: 'hr',
    action: 'PDF & SHA-256 Hash Generated',
    details: 'Calculated initial document SHA-256 hash (e3b0c44298...b855) and generated PDF letterhead preview.',
    ipAddress: '192.168.1.104',
    previousStatus: 'Draft',
    newStatus: 'Generated',
    timestamp: '2026-08-01T10:32:00Z'
  },
  {
    id: 'log-003',
    documentId: 'doc-001',
    documentNumber: 'DOC-2026-000124',
    userName: 'Suresh Kumar',
    userRole: 'hr',
    action: 'Approval Stage Passed',
    details: 'HR Manager approved CTC & Designation terms.',
    ipAddress: '192.168.1.110',
    previousStatus: 'Generated',
    newStatus: 'Under Review',
    timestamp: '2026-08-01T10:45:00Z'
  },
  {
    id: 'log-004',
    documentId: 'doc-001',
    documentNumber: 'DOC-2026-000124',
    userName: 'Umamaheshwari. S',
    userRole: 'siva_kumar',
    action: 'DSC Token Connected',
    details: 'Connected Class 3 USB Hardware DSC Token (Serial: 8A9F-341C-9902-E7B1, eMudhra CA).',
    ipAddress: '192.168.1.50',
    timestamp: '2026-08-01T11:20:00Z'
  },
  {
    id: 'log-005',
    documentId: 'doc-001',
    documentNumber: 'DOC-2026-000124',
    userName: 'Umamaheshwari. S',
    userRole: 'siva_kumar',
    action: 'Cryptographic Signature Applied',
    details: 'Document digitally signed using RSA 2048-bit private key. Tamper-proof lock applied.',
    ipAddress: '192.168.1.50',
    previousStatus: 'Pending Signature',
    newStatus: 'Signed',
    timestamp: '2026-08-01T11:21:00Z'
  },
  {
    id: 'log-006',
    documentId: 'doc-001',
    documentNumber: 'DOC-2026-000124',
    userName: 'Preeti Nair',
    userRole: 'hr',
    action: 'Secure Link Shared',
    details: 'Generated secure employee portal link with password protection.',
    ipAddress: '192.168.1.104',
    timestamp: '2026-08-01T11:22:00Z'
  }
];
