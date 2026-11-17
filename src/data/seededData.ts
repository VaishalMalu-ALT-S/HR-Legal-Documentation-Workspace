import { Employee, Contractor, DocumentTemplate, SmartDocument, AuditLog } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_CONTRACTORS: Contractor[] = [];

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

export const INITIAL_DOCUMENTS: SmartDocument[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
