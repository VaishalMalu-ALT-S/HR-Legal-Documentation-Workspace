import React, { useState } from 'react';
import { 
  Check, ArrowRight, ArrowLeft, Search, Sparkles, FileText, 
  Download, ShieldCheck, CheckCircle2, User, Building, QrCode
} from 'lucide-react';
import { Employee, Contractor, DocumentTemplate, SmartDocument, UserRole } from '../types';
import { DatabaseService } from '../services/dbService';
import { DocumentProcessor } from '../services/documentProcessor';
import { AIAssistantService } from '../services/aiAssistant';

interface DocumentWizardProps {
  employees: Employee[];
  contractors: Contractor[];
  templates: DocumentTemplate[];
  initialEmployeeId?: string;
  initialTemplateId?: string;
  currentRole: UserRole;
  onComplete: (newDoc: SmartDocument) => void;
}

export const DocumentWizard: React.FC<DocumentWizardProps> = ({
  employees,
  contractors,
  templates,
  initialEmployeeId,
  initialTemplateId,
  currentRole,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Wizard Selections
  const [selectedCategory, setSelectedCategory] = useState<string>('appointment_letter');
  const [selectedPerson, setSelectedPerson] = useState<Employee | Contractor | null>(
    employees.find(e => e.id === initialEmployeeId) || employees[0] || null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(
    templates.find(t => t.id === initialTemplateId) || templates[0] || null
  );
  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    selectedTemplate?.versions[0]?.id || ''
  );

  // Auto-Populated Variable Values
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<SmartDocument | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Auto-populate variables whenever person or template changes
  React.useEffect(() => {
    if (!selectedPerson || !selectedTemplate) return;

    const isEmp = 'employeeId' in selectedPerson;
    const emp = isEmp ? (selectedPerson as Employee) : null;
    const con = !isEmp ? (selectedPerson as Contractor) : null;

    const initialValues: Record<string, string> = {
      joining_date: emp?.dateOfJoining || '10-08-2026',
      issue_date: '03-July-2026',
      employee_name: emp?.fullName || con?.fullName || '',
      contractor_name: con?.fullName || '',
      salutation: 'Mr.',
      employee_id: emp?.employeeId || con?.contractorId || '',
      designation: emp?.designation || con?.role || '',
      department: emp?.department || 'Technology',
      company_name: con?.companyName || 'ALT-S Technology Private Limited',
      work_location: emp?.workLocation || 'Chennai / Hybrid',
      reporting_manager: emp?.reportingManager || 'Umamaheshwari. S (Managing Director)',
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
      ctc_annual: emp ? (emp.salaryCtc || 2400000).toLocaleString('en-IN') : '24,00,000.00',
      net_monthly: '1,66,461.00',
      net_annual: '19,97,532.00',
      role: con?.role || emp?.designation || '',
      start_date: con?.contractStartDate || '10th August 2026',
      end_date: con?.contractEndDate || '10th October 2026',
      professional_fee: con?.rateCompensation || 'INR 1,50,000/-',
      tds_rate: '1%',
      asset_type: 'Laptop & Charger',
      device_id: '9337D21F-C5FE-4614-B8C8-4A29CEEB40A6',
      asset_condition: 'Used',
      accessories_provided: 'Laptop Charger / Mouse'
    };

    setVariableValues(initialValues);
  }, [selectedPerson, selectedTemplate]);

  // Handle Step 5 Preview HTML rendering
  const activeVersion = selectedTemplate?.versions.find(v => v.id === selectedVersionId) || selectedTemplate?.versions[0];
  const rawContent = activeVersion?.content || '';
  const interpolatedText = DocumentProcessor.interpolateTemplate(rawContent, variableValues);

  const previewHtml = DocumentProcessor.renderLetterheadHTML(
    selectedTemplate?.name || 'Document Preview',
    interpolatedText,
    variableValues,
    [],
    'DOC-2026-000127',
    qrCodeDataUrl
  );

  // Generate QR Code on Step 5 transition
  React.useEffect(() => {
    if (currentStep === 5) {
      DocumentProcessor.generateQRCodeDataUrl('https://smartdoc-sign.app/verify/DOC-2026-000127')
        .then(url => setQrCodeDataUrl(url));
    }
  }, [currentStep]);

  // Validation Warnings
  const validation = AIAssistantService.validateDocumentInputs(selectedCategory, variableValues);

  const handleGenerateFinalDoc = async () => {
    setIsGenerating(true);

    const isEmp = selectedPerson && 'employeeId' in selectedPerson;
    const personName = selectedPerson?.fullName || 'Recipient';
    const personEmail = selectedPerson?.email || '';
    const personRole = isEmp ? (selectedPerson as Employee).designation : (selectedPerson as Contractor).role;

    const newDoc = await DatabaseService.createDocument({
      title: `${selectedTemplate.name} — ${personName}`,
      category: selectedCategory as any,
      employeeId: isEmp ? selectedPerson.id : undefined,
      contractorId: !isEmp ? selectedPerson?.id : undefined,
      personName,
      personEmail,
      personRole,
      templateVersionId: activeVersion?.id || '',
      templateVersionNumber: activeVersion?.versionNumber || '1.0',
      status: 'generated',
      variableValues,
      generatedAt: new Date().toISOString(),
      generatedBy: 'HR Admin',
      contentRenderedHtml: previewHtml,
      approvalWorkflow: {
        id: `wf-${Date.now()}`,
        documentId: '',
        currentStepIndex: 1,
        status: 'in_progress',
        steps: [
          { stepNumber: 1, roleName: 'HR Admin', status: 'approved', comment: 'Document generated via wizard.', updatedAt: new Date().toISOString() },
          { stepNumber: 2, roleName: 'HR Manager Review', status: 'pending' },
          { stepNumber: 3, roleName: 'Authorized Signatory', status: 'pending' },
          { stepNumber: 4, roleName: 'Employee Acknowledgement', status: 'pending' }
        ]
      }
    });

    setGeneratedDoc(newDoc);
    setIsGenerating(false);
    setCurrentStep(6);
  };

  const wizardSteps = [
    'Document Type', 'Recipient Data', 'Template Version', 'Auto-Populate Data', 'Letterhead Preview', 'Generated PDF'
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-heading">6-Step Automated Document Generation Wizard</h1>
          <p className="text-xs text-slate-500">Select employee/contractor, auto-populate variables, preview official letterhead & compute SHA-256 tamper hash</p>
        </div>
      </div>

      {/* Step Indicator Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          {wizardSteps.map((stepName, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;
            return (
              <React.Fragment key={stepNum}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono transition-all ${
                    isCompleted ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-brand-600 text-white ring-4 ring-brand-100' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <Check size={16} /> : stepNum}
                  </div>
                  <span className={`text-xs font-semibold hidden md:inline ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                    {stepName}
                  </span>
                </div>
                {stepNum < 6 && <div className="flex-1 h-0.5 bg-slate-200 mx-2 hidden sm:block"></div>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STEP 1: SELECT DOCUMENT TYPE */}
      {currentStep === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 font-heading">Step 1: Select Document Type Category</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'appointment_letter', name: 'Employee Appointment Letter', desc: 'Full-time employment agreements with Annexure I CTC breakdown & terms.' },
              { id: 'contractor_offer', name: 'Contractor Offer Letter', desc: 'Fixed-term contractor engagement agreement with monthly professional fees.' },
              { id: 'asset_form', name: 'Asset Allocation Form', desc: 'IT hardware issuance & Laptop serial number acknowledgment form.' },
              { id: 'bond_agreement', name: 'Service Bond Agreement', desc: 'Service commitment & specialized training cost reimbursement agreement.' },
              { id: 'acknowledgement_form', name: 'Policy Acknowledgement Form', desc: 'Employee Code of Conduct, Security Policy & NDA acknowledgement.' },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedCategory(type.id);
                  const matchingTpl = templates.find(t => t.category === type.id) || templates[0];
                  setSelectedTemplate(matchingTpl);
                }}
                className={`p-4 rounded-xl text-left border transition-all ${
                  selectedCategory === type.id 
                    ? 'bg-brand-50 border-brand-500 shadow-md ring-2 ring-brand-500/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs text-slate-900">{type.name}</div>
                <p className="text-[11px] text-slate-500 mt-1">{type.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2"
            >
              Continue to Select Recipient <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT PERSON */}
      {currentStep === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 font-heading">Step 2: Select Employee or Contractor Recipient</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedCategory === 'contractor_offer' ? (
              contractors.map(con => (
                <button
                  key={con.id}
                  onClick={() => setSelectedPerson(con)}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    selectedPerson?.id === con.id 
                      ? 'bg-indigo-50 border-indigo-500 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{con.fullName} ({con.contractorId})</div>
                  <div className="text-xs text-indigo-700 font-semibold">{con.role}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{con.companyName} • {con.rateCompensation}</div>
                </button>
              ))
            ) : (
              employees.map(emp => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedPerson(emp)}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    selectedPerson?.id === emp.id 
                      ? 'bg-brand-50 border-brand-500 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900">{emp.fullName} ({emp.employeeId})</div>
                  <div className="text-xs text-brand-700 font-semibold">{emp.designation}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{emp.department} • CTC: ₹{(emp.salaryCtc || 0).toLocaleString('en-IN')}</div>
                </button>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button onClick={() => setCurrentStep(1)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setCurrentStep(3)} className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2">
              Select Template Version <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT TEMPLATE VERSION */}
      {currentStep === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 font-heading">Step 3: Select Template Version</h3>

          <div className="space-y-3">
            {selectedTemplate.versions.map(ver => (
              <button
                key={ver.id}
                onClick={() => setSelectedVersionId(ver.id)}
                className={`w-full p-4 rounded-xl text-left border transition-all ${
                  selectedVersionId === ver.id 
                    ? 'bg-brand-50 border-brand-500 shadow-md' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs font-mono text-brand-700">Version {ver.versionNumber}</span>
                  <span className="text-[10px] text-slate-400">Created: {new Date(ver.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium mt-1">{ver.changelog}</p>
                <div className="text-[11px] font-mono text-slate-500 mt-2">
                  Variables ({ver.variables.length}): {ver.variables.join(', ')}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button onClick={() => setCurrentStep(2)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setCurrentStep(4)} className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2">
              Auto-Populate Data <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: AUTO-POPULATE & EDIT VARIABLES */}
      {currentStep === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 font-heading">Step 4: Auto-Populated Variable Fields</h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Auto-filled from Master Database
            </span>
          </div>

          {validation.warnings.length > 0 && (
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-1">
              {validation.warnings.map((w, i) => <div key={i}>{w}</div>)}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-1">
            {Object.keys(variableValues).map(key => (
              <div key={key} className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key.replace('_', ' ')}</label>
                <input
                  type="text"
                  value={variableValues[key]}
                  onChange={e => setVariableValues({ ...variableValues, [key]: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white text-slate-900 font-mono"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button onClick={() => setCurrentStep(3)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
              <ArrowLeft size={16} /> Back
            </button>
            <button onClick={() => setCurrentStep(5)} className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2">
              Preview Letterhead <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: LETTERHEAD PREVIEW */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Step 5: High-Quality Letterhead Preview</h3>
              <p className="text-xs text-slate-500">Inspect formatting, company logo header, compensation structure table & QR code footer</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentStep(4)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
                Edit Variables
              </button>
              <button
                onClick={handleGenerateFinalDoc}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center gap-2"
              >
                {isGenerating ? 'Computing SHA-256 Hash...' : 'Generate PDF & Save to Vault'} <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Document Render Paper Preview */}
          <div className="overflow-x-auto p-4 bg-slate-200/60 rounded-2xl border border-slate-300">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      )}

      {/* STEP 6: GENERATED PDF COMPLETE */}
      {currentStep === 6 && generatedDoc && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 font-heading">Document Generated & Saved!</h2>
            <p className="text-xs text-slate-500">Document ID: <strong className="font-mono text-brand-700">{generatedDoc.documentNumber}</strong></p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">SHA-256 Hash:</span>
              <span className="font-bold text-slate-900 truncate max-w-[200px]">{generatedDoc.documentHash}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-blue-600 capitalize">{generatedDoc.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Approval Workflow:</span>
              <span className="font-bold text-emerald-600">Initiated (4 Steps)</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => DocumentProcessor.exportToPDF('pdf-document-paper', `${generatedDoc.documentNumber}.pdf`)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2"
            >
              <Download size={15} /> Download PDF
            </button>
            <button
              onClick={() => onComplete(generatedDoc)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
            >
              Proceed to Signature Center <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
