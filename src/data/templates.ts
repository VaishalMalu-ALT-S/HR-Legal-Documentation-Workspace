// Auto-generated real templates from company documents with discrete A4 multi-page structure
export interface CompanyDocTemplate {
  id: string;
  name: string;
  category: 'HR' | 'Contractor' | 'Asset' | 'Blank';
  description: string;
  sourceDoc: string;
  pages: string[];
  content: string; // Combined fallback
}

export const COMPANY_TEMPLATES: CompanyDocTemplate[] = [
  {
    id: 'blank_document',
    name: 'Untitled Document',
    category: 'Blank',
    description: 'A completely blank template with only the dynamic company header and footer. Start typing anything.',
    sourceDoc: 'Blank Template',
    pages: [
      `<h2 class="text-center text-base font-bold underline my-3 text-slate-900 tracking-wide">Untitled Document</h2>
<div class="my-3 text-xs text-slate-800 min-h-[300px]">
  <p>[Start typing your custom content here...]</p>
</div>`
    ],
    content: ''
  },
  {
    id: 'asset_acknowledgment',
    name: 'Asset Acknowledgment Letter',
    category: 'Asset',
    description: 'Hardware issue & laptop return terms with device ID, condition and employee declaration',
    sourceDoc: 'ALT-S_Asset Form_Vaishal Malu.pdf',
    pages: [
      `<h2 class="text-center text-base font-bold underline my-3 text-slate-900 tracking-wide">Asset Acknowledgment Letter</h2>

<div class="my-3 space-y-1 text-xs text-slate-800">
  <p><strong>Date:</strong> 03-July-2026</p>
  <p><strong>Employee Name:</strong> Vaishal Malu</p>
  <p><strong>Trainee ID:</strong> TR001</p>
  <p><strong>Designation:</strong> AI Trainee</p>
  <p><strong>Company Name:</strong> ALT-S Technology Private Limited</p>
</div>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-4 mb-2">Asset Details</h3>
<div class="my-2 overflow-x-auto">
  <table class="w-full border-collapse border border-slate-400 text-xs">
    <thead>
      <tr class="bg-slate-100 text-slate-900">
        <th class="border border-slate-400 px-3 py-2 text-left font-bold">Asset Type</th>
        <th class="border border-slate-400 px-3 py-2 text-left font-bold">Device Id</th>
        <th class="border border-slate-400 px-3 py-2 text-left font-bold">Condition</th>
        <th class="border border-slate-400 px-3 py-2 text-left font-bold">Accessories Provided</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-400 px-3 py-2 font-medium">Laptop &amp; Charger</td>
        <td class="border border-slate-400 px-3 py-2 font-mono text-[11px]">9337D21F-C5FE-4614-B8C8-4A29CEEB40A6</td>
        <td class="border border-slate-400 px-3 py-2">Used</td>
        <td class="border border-slate-400 px-3 py-2">Laptop Charger / Mouse</td>
      </tr>
    </tbody>
  </table>
</div>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-5 mb-2">Terms and Conditions</h3>
<ol class="list-decimal pl-5 space-y-2 text-xs text-slate-700 leading-relaxed">
  <li>The employee acknowledges receipt of the above company asset(s) and agrees to use them solely for work-related activities.</li>
  <li>The employee is responsible for keeping the asset in good condition and reporting any damages or issues immediately.</li>
  <li>In case of loss or damage due to negligence, the employee may be held liable for repair or replacement costs.</li>
  <li>The asset remains the property of the company and must be returned upon resignation, termination, or upon request.</li>
  <li>Any unauthorized modifications, installations, or use of personal software on the device is prohibited.</li>
  <li>The employee must return the laptop in the same condition as issued, without any physical or functional damage, at the time of relieving. The last month's salary will be processed only after successful verification of the asset condition.</li>
</ol>

<div class="mt-6 pt-3 border-t border-slate-200">
  <h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Employee Acknowledgment</h3>
  <p class="text-xs text-slate-700 leading-relaxed mb-6">
    I, Mr. Vaishal Malu, acknowledge receiving the above-mentioned company asset(s) and agree with the terms stated in this document.
  </p>

  <div class="flex justify-between items-end pt-4">
    <div class="space-y-4 text-xs text-slate-800">
      <p><strong>Signature:</strong> ________________________________</p>
      <p><strong>Date:</strong> _____________________________________</p>
    </div>
    <div class="text-right text-xs text-slate-600">
      <p class="font-semibold text-slate-800">For ALT-S Technology Private Limited</p>
      <p class="text-[11px] text-slate-500 mt-1">Authorized Signatory &amp; Stamp</p>
    </div>
  </div>
</div>`
    ],
    get content() { return this.pages.join('\n<hr class="my-6 border-dashed border-slate-300"/>\n'); }
  },
  {
    id: 'appointment_solution_architect',
    name: 'Appointment Letter - Solution Architect',
    category: 'HR',
    description: 'Full-time employment terms with Compensation breakdown annexure & mandatory documents checklist',
    sourceDoc: 'Appointment Letter_Lokesh Kumar_Oracle HRMS Solution Architect.docx',
    pages: [
      // Page 1: Offer intro & Core Terms
      `<div class="flex justify-between items-center my-2 font-semibold text-slate-700 text-xs"><span>Date: 10-08-2026</span><span class="text-xs text-slate-500">Ref: ALTS/DOC/2026/08</span></div>
<h2 class="text-center text-base font-bold underline my-2 text-slate-900 tracking-wide">Appointment Letter</h2>
<p class="text-center text-xs font-bold text-slate-800 mb-3">Subject: Appointment Letter for the Position of Oracle HRMS/HCM Solution Architect.</p>
<p class="my-1.5 font-semibold text-xs text-slate-800">Dear Mr. Lokesh Kumar,</p>
<p class="my-1.5 font-bold text-[#0052cc] text-xs">Heartiest Congratulations!</p>
<p class="my-1 text-xs text-slate-700 leading-relaxed">We are pleased to offer you the position of Oracle HRMS/HCM Solution Architect and welcome you to be part of the emerging success of ALT-S Technology Private Limited (hereinafter referred to as "ALT-S Technology", "Company", or "Organization") on the following terms and conditions.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">DESIGNATION AND PLACE OF WORK</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">You will be designated as Oracle HRMS/HCM Solution Architect and will be based on WFH/Client Office based on Company's Requirements. You will be required to work from the Company's Chennai office and shall also be available to work from client locations, other offices of the Company, or work from home depending on project and business requirements.</p>
<p class="my-1 text-xs text-slate-700 leading-relaxed">You may also be transferred to any of the Company's establishments in India or abroad, as per business requirements.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">REMUNERATION</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Your remuneration details are strictly confidential, and you are required to maintain this confidentiality. The Annual Compensation, Variable Pay, and Performance Bonus are subject to TDS in accordance with the Income Tax Act, 1961, and all other applicable Central and State legislation.</p>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Net take-home pay is subject to deductions such as PF, Gratuity, Professional Tax, and other statutory deductions as per applicable rules. Provident Fund deductions shall be governed by the Employees' Provident Funds Act, 1952.</p>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Gratuity shall be payable in accordance with the Payment of Gratuity Act, 1972, upon completion of 4 years and 11 months of continuous service.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">ONSITE ALLOWANCE CLAUSE</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">The employee will be eligible for an Onsite Allowance of USD 40 (Forty US Dollars) per day when deputed to work at the client location or project site outside the regular place of work. Such onsite assignments will be based on project requirements and business needs.</p>`,

      // Page 2: Service Conditions, Termination & Signatures
      `<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mb-1 border-b border-slate-200 pb-0.5">SALARY REVIEW &amp; MEDICAL FITNESS</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Salary revisions will be based on individual performance and the Company's overall performance at the sole discretion of the Company. You are required to submit a self-declaration of medical fitness along with a general fitness certificate.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">TERMINATION OF EMPLOYMENT</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Your employment may be terminated by either party by giving three (3) months' written notice or payment of basic salary in lieu of notice. Employment may be terminated immediately for breach of company policies, false information, misconduct, non-performance, or parallel employment.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">WORKING HOURS, LEAVES &amp; RETIREMENT</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">You will follow the working hours and leave policy applicable to your assigned project. The retirement age in the Company is 58 years.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">CONFIDENTIALITY &amp; JURISDICTION</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">During and after your employment, you must maintain strict confidentiality regarding company information, trade secrets, customer data, and proprietary information. Any disputes shall be subject to the jurisdiction of competent courts in Chennai, Tamil Nadu.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">ACCEPTANCE OF OFFER</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Your employment will commence from 11th August 2026. Kindly sign and return the duplicate copy of this letter within 3 days as a token of acceptance.</p>

<div class="mt-6 pt-4 border-t border-slate-200 flex justify-between items-end">
  <div class="space-y-4 text-xs text-slate-800">
    <p><strong>Candidate Signature:</strong> ______________________</p>
    <p><strong>Name:</strong> Mr. Lokesh Kumar</p>
    <p><strong>Date of Acceptance:</strong> _____________________</p>
  </div>
  <div class="text-right text-xs text-slate-700">
    <p class="font-bold text-slate-900">For ALT-S Technology Private Limited</p>
    <p class="mt-4 font-semibold">Umamaheshwari. S</p>
    <p class="text-[11px] text-slate-500">Managing Director</p>
  </div>
</div>`,

      // Page 3: Annexure I - Remuneration Structure
      `<h2 class="text-center text-base font-bold underline my-2 text-slate-900 tracking-wide">ANNEXURE – I: COMPENSATION STRUCTURE</h2>
<p class="text-xs text-slate-600 mb-3 text-center">Name: Mr. Lokesh Kumar | Designation: Oracle HRMS/HCM Solution Architect</p>

<div class="my-3 overflow-x-auto">
  <table class="w-full border-collapse border border-slate-400 text-xs">
    <thead>
      <tr class="bg-slate-100 text-slate-900">
        <th class="border border-slate-400 px-3 py-1.5 text-left font-bold">Fixed Remuneration Component</th>
        <th class="border border-slate-400 px-3 py-1.5 text-right font-bold">Annual (INR)</th>
        <th class="border border-slate-400 px-3 py-1.5 text-right font-bold">Monthly (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-400 px-3 py-1.5 font-medium">Basic Pay</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">1,440,000.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">120,000.00</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-400 px-3 py-1.5 font-medium">House Rent Allowance (HRA)</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">480,000.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">40,000.00</td>
      </tr>
      <tr>
        <td class="border border-slate-400 px-3 py-1.5 font-medium">Special Allowance</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">458,400.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">38,200.00</td>
      </tr>
      <tr class="bg-blue-50/60 font-semibold text-slate-900">
        <td class="border border-slate-400 px-3 py-1.5">MONTHLY GROSS</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">2,378,400.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">198,200.00</td>
      </tr>
      <tr>
        <td class="border border-slate-400 px-3 py-1.5 font-medium">Firm Contribution to PF</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">21,600.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">1,800.00</td>
      </tr>
      <tr class="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-500">
        <td class="border border-slate-400 px-3 py-1.5">TOTAL FIXED REMUNERATION (CTC)</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">2,400,000.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">200,000.00</td>
      </tr>
      <tr class="bg-slate-200/80 font-bold text-slate-800">
        <td colspan="3" class="border border-slate-400 px-3 py-1 text-xs">STATUTORY DEDUCTIONS</td>
      </tr>
      <tr>
        <td class="border border-slate-400 px-3 py-1.5">Employer Contribution to PF</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">21,600.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">1,800.00</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-400 px-3 py-1.5">Employee Contribution to PF</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">21,600.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">1,800.00</td>
      </tr>
      <tr>
        <td class="border border-slate-400 px-3 py-1.5">Professional Tax</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">2,508.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">209.00</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-400 px-3 py-1.5">Tax Deducted at Source (TDS approx)</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">356,760.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">29,730.00</td>
      </tr>
      <tr class="bg-red-50/60 font-semibold text-slate-900">
        <td class="border border-slate-400 px-3 py-1.5">TOTAL DEDUCTIONS</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">402,468.00</td>
        <td class="border border-slate-400 px-3 py-1.5 text-right font-mono">33,539.00</td>
      </tr>
      <tr class="bg-emerald-50 font-bold text-emerald-900 border-t-2 border-emerald-500">
        <td class="border border-slate-400 px-3 py-2">NET TAKE HOME PAYABLE</td>
        <td class="border border-slate-400 px-3 py-2 text-right font-mono text-emerald-800">1,997,532.00</td>
        <td class="border border-slate-400 px-3 py-2 text-right font-mono text-emerald-800">166,461.00</td>
      </tr>
    </tbody>
  </table>
</div>
<p class="text-[11px] text-slate-500 mt-2">* Performance bonus and variable pay are subject to annual evaluation and applicable tax laws.</p>`,

      // Page 4: Annexure II - Mandatory Documents Checklist
      `<h2 class="text-center text-base font-bold underline my-2 text-slate-900 tracking-wide">ANNEXURE – II: MANDATORY DOCUMENTS CHECKLIST</h2>
<p class="text-xs text-slate-600 mb-3 text-center">Please submit photocopies along with original documents for verification at the time of joining.</p>

<div class="my-2 overflow-x-auto">
  <table class="w-full border-collapse border border-slate-400 text-xs">
    <thead>
      <tr class="bg-slate-100 text-slate-900">
        <th class="border border-slate-400 px-3 py-1.5 text-center w-12 font-bold">S.No</th>
        <th class="border border-slate-400 px-3 py-1.5 text-left font-bold">Document Particulars</th>
        <th class="border border-slate-400 px-3 py-1.5 text-center w-28 font-bold">Copies Required</th>
      </tr>
    </thead>
    <tbody>
      <tr class="bg-slate-100 font-bold text-slate-800"><td colspan="3" class="border border-slate-400 px-3 py-1">EDUCATIONAL CERTIFICATES</td></tr>
      <tr><td class="border border-slate-400 px-3 py-1 text-center">1</td><td class="border border-slate-400 px-3 py-1">10th Mark Sheets / Passing Certificates</td><td class="border border-slate-400 px-3 py-1 text-center">1 Copy</td></tr>
      <tr class="bg-slate-50"><td class="border border-slate-400 px-3 py-1 text-center">2</td><td class="border border-slate-400 px-3 py-1">12th Mark Sheets / Passing Certificates</td><td class="border border-slate-400 px-3 py-1 text-center">1 Copy</td></tr>
      <tr><td class="border border-slate-400 px-3 py-1 text-center">3</td><td class="border border-slate-400 px-3 py-1">Graduation Degree / Mark Sheets</td><td class="border border-slate-400 px-3 py-1 text-center">1 Copy</td></tr>
      <tr class="bg-slate-50"><td class="border border-slate-400 px-3 py-1 text-center">4</td><td class="border border-slate-400 px-3 py-1">PG Degree / Software Certifications</td><td class="border border-slate-400 px-3 py-1 text-center">1 Copy</td></tr>
      
      <tr class="bg-slate-100 font-bold text-slate-800"><td colspan="3" class="border border-slate-400 px-3 py-1">RESIDENCE &amp; IDENTITY PROOF</td></tr>
      <tr><td class="border border-slate-400 px-3 py-1 text-center">5</td><td class="border border-slate-400 px-3 py-1">Electricity Bill / Gas Bill / Rental Agreement</td><td class="border border-slate-400 px-3 py-1 text-center">1 Copy</td></tr>
      <tr class="bg-slate-50"><td class="border border-slate-400 px-3 py-1 text-center">6</td><td class="border border-slate-400 px-3 py-1">Driving License / Voter ID</td><td class="border border-slate-400 px-3 py-1 text-center">1 Copy</td></tr>
      <tr><td class="border border-slate-400 px-3 py-1 text-center">7</td><td class="border border-slate-400 px-3 py-1">PAN Card &amp; Aadhaar Card</td><td class="border border-slate-400 px-3 py-1 text-center">2 Copies</td></tr>
      <tr class="bg-slate-50"><td class="border border-slate-400 px-3 py-1 text-center">8</td><td class="border border-slate-400 px-3 py-1">Passport</td><td class="border border-slate-400 px-3 py-1 text-center">2 Copies</td></tr>
      
      <tr class="bg-slate-100 font-bold text-slate-800"><td colspan="3" class="border border-slate-400 px-3 py-1">EMPLOYMENT HISTORY &amp; PHOTOS</td></tr>
      <tr><td class="border border-slate-400 px-3 py-1 text-center">9</td><td class="border border-slate-400 px-3 py-1">Relieving &amp; Experience Letters from previous employers</td><td class="border border-slate-400 px-3 py-1 text-center">1 Copy Each</td></tr>
      <tr class="bg-slate-50"><td class="border border-slate-400 px-3 py-1 text-center">10</td><td class="border border-slate-400 px-3 py-1">Passport Size Color Photographs (White background)</td><td class="border border-slate-400 px-3 py-1 text-center">5 Copies</td></tr>
    </tbody>
  </table>
</div>

<div class="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
  <p>Employee Verification Signature: ____________________</p>
  <p>HR Operations Sign-off: ____________________</p>
</div>`
    ],
    get content() { return this.pages.join('\n<hr class="my-6 border-dashed border-slate-300"/>\n'); }
  },
  {
    id: 'contractor_offer',
    name: 'Contractor Letter of Offer',
    category: 'Contractor',
    description: 'Independent consultant SOW, fixed duration, INR 1.5L fee, TDS 1%, and KRAs',
    sourceDoc: 'Vrutika_ Contractor Offer letter.docx',
    pages: [
      // Page 1: SOW, Period, Fee & Responsibilities
      `<h2 class="text-center text-base font-bold underline my-2 text-slate-900 tracking-wide">Contractor – Letter of Offer</h2>
<p class="my-1.5 text-xs text-slate-700 leading-relaxed">To,<br/><strong>Mrs. Vrutika Prajapati</strong></p>
<p class="my-2 text-xs font-bold text-slate-900">Subject: Offer of Contract Engagement as Oracle Technical Consultant</p>
<p class="my-1.5 text-xs font-semibold text-slate-800">Dear Raghu,</p>
<p class="my-1 text-xs text-slate-700 leading-relaxed">We are pleased to offer you an engagement as an Oracle Technical Consultant on a contractual basis with ALT-S Technology Private Limited for a fixed period commencing from <strong>10th August 2026</strong> and ending on <strong>10th October 2026</strong>. The contract may be extended based on project requirements.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">1. ENGAGEMENT PERIOD</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Your contract engagement shall be effective from 10th August 2026 and shall automatically expire on 10th October 2026, unless extended in writing by ALT-S Technology Private Limited.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">2. PROFESSIONAL FEE</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">You shall be paid a professional fee of <strong>INR 1,50,000/- (Rupees One Lakh Fifty Thousand Only)</strong> per month. Applicable Tax Deducted at Source (TDS) at 1% shall be deducted as per prevailing tax regulations.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">3. NATURE OF ENGAGEMENT</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">This engagement is purely contractual in nature and does not constitute permanent employment. Upon expiry of the contract term, the engagement shall automatically terminate without notice pay or retrenchment compensation.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">4. DUTIES AND RESPONSIBILITIES</h3>
<ul class="list-disc pl-5 space-y-1 text-xs text-slate-700 leading-relaxed">
  <li>Work as an Oracle Technical Consultant driving implementation activities.</li>
  <li>Develop and support interfaces and system integrations.</li>
  <li>Ensure Super Users are adequately trained and provided with necessary documentation.</li>
  <li>Perform all assigned duties efficiently, satisfactorily, and economically.</li>
</ul>`,

      // Page 2: KRAs, Payment terms, Asset return & Signatures
      `<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mb-1 border-b border-slate-200 pb-0.5">5. TRANSFER AND ASSIGNMENT</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">The Company reserves the right to assign work or utilize your services in any unit, project site, or client location as required.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">6. KEY RESULT AREAS (KRAs)</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Performance will be evaluated on successful delivery of Oracle Technical milestones, timely completion of interfaces, and maintaining customer feedback rating of 4 or 5 out of 5.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">7. PAYMENT TERMS &amp; SETTLEMENT</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Monthly payments shall be processed within 15 days after completion of the respective month's services, subject to approved timesheets.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">8. RETURN OF COMPANY ASSETS</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">All company assets, including assigned laptops and documentation, remain company property and must be returned upon contract termination. Final month settlement is subject to asset clearance.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">9. ACCEPTANCE OF OFFER</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Please sign and return a copy of this letter as a token of your acceptance of the terms and conditions stated herein.</p>

<div class="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end">
  <div class="space-y-4 text-xs text-slate-800">
    <p><strong>Consultant Signature:</strong> ______________________</p>
    <p><strong>Name:</strong> Mrs. Vrutika Prajapati</p>
    <p><strong>Date:</strong> _____________________</p>
  </div>
  <div class="text-right text-xs text-slate-700">
    <p class="font-bold text-slate-900">For ALT-S Technology Private Limited</p>
    <p class="mt-4 font-semibold">Uma Maheshwari A</p>
    <p class="text-[11px] text-slate-500">Managing Director</p>
  </div>
</div>`
    ],
    get content() { return this.pages.join('\n<hr class="my-6 border-dashed border-slate-300"/>\n'); }
  },
  {
    id: 'appointment_admin_executive',
    name: 'Appointment Letter - Admin Executive',
    category: 'HR',
    description: 'Executive appointment terms, consolidated pay structure and service conditions',
    sourceDoc: 'Appointment Letter_Manisha_ Admin Executive.docx',
    pages: [
      // Page 1: Offer & Consolidated Remuneration
      `<div class="flex justify-between items-center my-2 font-semibold text-slate-700 text-xs"><span>Date: 30-07-2026</span><span class="text-xs text-slate-500">Ref: ALTS/DOC/2026/08</span></div>
<h2 class="text-center text-base font-bold underline my-2 text-slate-900 tracking-wide">Appointment Letter</h2>
<p class="text-center text-xs font-bold text-slate-800 mb-3">Subject: Appointment Letter for the Position of Administration Executive.</p>
<p class="my-1.5 font-semibold text-xs text-slate-800">Dear Mrs. Manisha,</p>
<p class="my-1.5 font-bold text-[#0052cc] text-xs">Heartiest Congratulations!</p>
<p class="my-1 text-xs text-slate-700 leading-relaxed">We are pleased to offer you the position of Administration Executive and welcome you to be part of the emerging success of ALT-S Technology Private Limited on the following terms and conditions.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">DESIGNATION AND PLACE OF WORK</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">You will be designated as Administration Executive and will be based at our WFH/Client Office based on Company's Requirements. You will be required to work from the Company's Chennai office and shall also be available to work from client locations.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">REMUNERATION - CONSOLIDATED PAY</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Your total remuneration will be <strong>INR 20,000/- (Twenty Thousand Rupees only)</strong> per month on a consolidated basis. This compensation is inclusive of all statutory and non-statutory components.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">SALARY REVIEW &amp; MEDICAL FITNESS</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Salary revisions will be based on individual performance and company review cycles. You are required to submit a self-declaration of medical fitness in the prescribed format.</p>`,

      // Page 2: Service Rules & Acceptance
      `<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mb-1 border-b border-slate-200 pb-0.5">TERMINATION OF EMPLOYMENT</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Your employment may be terminated by either party by giving three (3) months' written notice or payment of basic salary in lieu of notice.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">WORKING HOURS &amp; LEAVE POLICY</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">You will follow the working hours, shift schedules, and holidays applicable to the Chennai office. The retirement age in the Company is 58 years.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">CONFIDENTIALITY &amp; JURISDICTION</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">During and after your employment, you must maintain strict confidentiality regarding company records and employee data. Any legal disputes shall fall under the jurisdiction of competent courts in Chennai, Tamil Nadu.</p>

<h3 class="font-bold text-xs uppercase tracking-wider text-slate-800 mt-3 mb-1 border-b border-slate-200 pb-0.5">ACCEPTANCE OF APPOINTMENT</h3>
<p class="my-1 text-xs text-slate-700 leading-relaxed">Kindly sign and return a duplicate copy of this letter within 3 days as a token of acceptance.</p>

<div class="mt-8 pt-4 border-t border-slate-200 flex justify-between items-end">
  <div class="space-y-4 text-xs text-slate-800">
    <p><strong>Employee Signature:</strong> ______________________</p>
    <p><strong>Name:</strong> Mrs. Manisha</p>
    <p><strong>Date:</strong> _____________________</p>
  </div>
  <div class="text-right text-xs text-slate-700">
    <p class="font-bold text-slate-900">For ALT-S Technology Private Limited</p>
    <p class="mt-4 font-semibold">Umamaheshwari. S</p>
    <p class="text-[11px] text-slate-500">Managing Director</p>
  </div>
</div>`
    ],
    get content() { return this.pages.join('\n<hr class="my-6 border-dashed border-slate-300"/>\n'); }
  },
  {
    id: 'blank_letterhead',
    name: 'Blank Letterhead (Manual Typing)',
    category: 'Blank',
    description: 'Clean official ALT-S letterhead ready for custom HR letters and notices',
    sourceDoc: 'Official ALT-S Headpad',
    pages: [
      `<div style="min-height: 400px;"></div>`
    ],
    get content() { return this.pages.join('\n<hr class="my-6 border-dashed border-slate-300"/>\n'); }
  }
];
