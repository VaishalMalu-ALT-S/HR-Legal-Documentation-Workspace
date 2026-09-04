import { DocumentTemplate, AIAnalysisResult, SmartDocument } from '../types';

export class AIAssistantService {
  /**
   * Evaluates a document template and provides quality score, clause suggestions, and risk alerts
   */
  static analyzeTemplate(template: DocumentTemplate, contentOverride?: string): AIAnalysisResult {
    const text = contentOverride || (template.versions && template.versions.length > 0 ? template.versions[0].content : '');

    const missingClauses: { title: string; text: string; reason: string }[] = [];
    const riskAlerts: { level: 'low' | 'medium' | 'high'; message: string }[] = [];

    // Check Confidentiality
    if (!text.toLowerCase().includes('confidential')) {
      missingClauses.push({
        title: 'Add Confidentiality & Non-Disclosure Clause',
        text: 'During and after employment, the employee must maintain strict confidentiality regarding company data, customer details, and trade secrets.',
        reason: 'Recommended for all enterprise employment agreements to protect IP.'
      });
    }

    // Check Parallel Employment
    if (!text.toLowerCase().includes('parallel employment') && !text.toLowerCase().includes('moonlighting')) {
      missingClauses.push({
        title: 'Add Dual Employment Restriction',
        text: 'The employee shall devote full time to the company and shall not engage in parallel employment or external commercial activity.',
        reason: 'Prevents conflict of interest and unauthorized external engagements.'
      });
    }

    // Check Governing Law & Jurisdiction
    if (!text.toLowerCase().includes('jurisdiction') && !text.toLowerCase().includes('court')) {
      missingClauses.push({
        title: 'Add Governing Law & Jurisdiction Clause',
        text: 'Any disputes arising out of this agreement shall be subject to the exclusive jurisdiction of courts in Chennai, Tamil Nadu.',
        reason: 'Essential legal clarity for dispute resolution location.'
      });
    }

    // Check Notice Period
    if (!text.toLowerCase().includes('notice') && template.category === 'appointment_letter') {
      riskAlerts.push({
        level: 'high',
        message: 'Notice period duration is not specified in the termination clause.'
      });
    }

    // Check Variable Placeholders
    const variablesDetected = (text.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || []).map(v => v.replace(/[{}]/g, ''));
    const missingVariables: string[] = [];

    if (!variablesDetected.includes('joining_date') && template.category === 'appointment_letter') {
      missingVariables.push('joining_date');
    }
    if (!variablesDetected.includes('designation') && template.category === 'appointment_letter') {
      missingVariables.push('designation');
    }
    if (!variablesDetected.includes('employee_name')) {
      missingVariables.push('employee_name');
    }

    if (missingVariables.length > 0) {
      riskAlerts.push({
        level: 'medium',
        message: `Missing mandatory variable placeholders: ${missingVariables.join(', ')}`
      });
    }

    // Calculate Completeness Score
    let completeness = 100 - (missingVariables.length * 15);
    if (completeness < 40) completeness = 40;

    let legalCoverage = 100 - (missingClauses.length * 12);
    if (legalCoverage < 50) legalCoverage = 50;

    return {
      completenessScore: Math.min(100, Math.max(0, completeness)),
      legalCoverageScore: Math.min(100, Math.max(0, legalCoverage)),
      missingVariables,
      suggestedClauses: missingClauses,
      riskAlerts
    };
  }

  /**
   * Pre-generation document risk analysis for specific variable inputs
   */
  static validateDocumentInputs(
    category: string, 
    values: Record<string, string>
  ): { isValid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    if (!values.employee_name && !values.contractor_name) {
      warnings.push(' Recipient Name is required before generation.');
    }

    if (category === 'appointment_letter') {
      if (!values.joining_date) warnings.push(' Joining Date is missing or invalid.');
      if (!values.designation) warnings.push(' Designation is not specified.');
      if (!values.ctc_annual && !values.salary_annual) warnings.push(' Salary / CTC breakdown is incomplete.');
    }

    if (category === 'contractor_offer') {
      if (values.start_date && values.end_date) {
        const start = new Date(values.start_date);
        const end = new Date(values.end_date);
        if (end < start) {
          warnings.push(' Contract End Date cannot be earlier than Contract Start Date.');
        }
      }
      if (!values.professional_fee) warnings.push(' Professional Fee amount is not specified.');
    }

    if (category === 'asset_form') {
      if (!values.device_id) warnings.push(' Device Serial / ID number is missing.');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  /**
   * Smart Copilot Natural Language Command Interpreter
   */
  static processCopilotCommand(
    query: string, 
    documents: SmartDocument[]
  ): { textResponse: string; actionType?: string; actionPayload?: any } {
    const q = query.toLowerCase();

    if (q.includes('generate appointment letter') || q.includes('lokesh kumar')) {
      return {
        textResponse: 'I can help you generate the Appointment Letter for Lokesh Kumar. Opening the 6-step Document Wizard with auto-filled employee data...',
        actionType: 'NAVIGATE_WIZARD',
        actionPayload: { employeeId: 'emp-001', category: 'appointment_letter' }
      };
    }

    if (q.includes('pending') || q.includes('signature') || q.includes('unsigned')) {
      const pendingDocs = documents.filter(d => d.status === 'pending_signature' || d.status === 'under_review');
      return {
        textResponse: `There are currently ${pendingDocs.length} documents awaiting approval or digital signature. Opening the Signature Center...`,
        actionType: 'NAVIGATE_SIGNATURE_CENTER'
      };
    }

    if (q.includes('expire') || q.includes('contract')) {
      return {
        textResponse: 'Found 1 expiring contractor agreement: Vrutika Prajapati (Contractor Offer Letter, expiring 10th Oct 2026). View details in Document Vault.',
        actionType: 'NAVIGATE_VAULT'
      };
    }

    if (q.includes('asset') || q.includes('vaishal')) {
      return {
        textResponse: 'Found Asset Allocation Letter for Vaishal Malu (Laptop & Charger, Device ID: 9337D21F...). Opening document preview...',
        actionType: 'VIEW_DOCUMENT',
        actionPayload: { documentId: 'doc-003' }
      };
    }

    return {
      textResponse: 'SmartDoc Copilot is ready! Try asking: "Generate appointment letter for Lokesh Kumar", "Show pending signatures", or "Which contracts expire this month?".'
    };
  }
}
