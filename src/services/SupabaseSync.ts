import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SmartDocument, Employee, SignatureRequest, AuditLog } from '../types';

// Helper to map SmartDocument to Supabase row
const mapDocToRow = (doc: SmartDocument) => {
  return {
    id: doc.id,
    document_number: doc.documentNumber || `DOC-${Date.now()}`,
    title: doc.title,
    category: doc.category,
    company_id: doc.companyId,
    person_name: doc.personName,
    person_email: doc.personEmail,
    person_role: doc.personRole,
    template_version_id: doc.templateVersionId,
    template_version_number: doc.templateVersionNumber,
    status: doc.status,
    variable_values: doc.variableValues || {},
    document_hash: doc.documentHash || '',
    original_hash: doc.originalHash || '',
    is_tampered: doc.isTampered || false,
    qr_verification_code: doc.qrVerificationCode,
    verification_url: doc.verificationUrl,
    generated_at: doc.generatedAt,
    generated_by: doc.generatedBy,
    signed_at: doc.signedAt,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString()
  };
};

export class SupabaseSync {
  static async pushDocument(doc: SmartDocument) {
    if (!isSupabaseConfigured) return;
    try {
      const row = mapDocToRow(doc);
      const { error } = await supabase.from('documents').upsert(row);
      if (error) console.error('Supabase sync error (documents):', error);

      // Also sync workflow if exists
      if (doc.approvalWorkflow) {
        await supabase.from('approval_workflows').upsert({
          id: doc.approvalWorkflow.id,
          document_id: doc.id,
          current_step_index: doc.approvalWorkflow.currentStepIndex,
          status: doc.approvalWorkflow.status
        });
        
        for (const step of doc.approvalWorkflow.steps) {
          await supabase.from('approval_steps').upsert({
            workflow_id: doc.approvalWorkflow.id,
            step_number: step.stepNumber,
            role_name: step.roleName,
            assigned_to_name: step.assignedToName,
            status: step.status,
            comment: step.comment,
            updated_at: step.updatedAt || new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.error('Failed to push document to Supabase', e);
    }
  }

  static async pushEmployee(emp: Employee) {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('employees').upsert({
        id: emp.id,
        employee_id: emp.employeeId,
        full_name: emp.fullName,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        employment_type: emp.employmentType,
        work_location: emp.workLocation,
        created_at: emp.createdAt || new Date().toISOString()
      });
      if (error) console.error('Supabase sync error (employees):', error);
    } catch (e) {}
  }

  static async pushSignatureRequest(req: SignatureRequest) {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('signature_requests').upsert({
        id: req.id,
        document_id: req.documentId,
        document_title: req.documentTitle,
        document_number: req.documentNumber,
        signatory_role: req.signatoryRole,
        signatory_name: req.signatoryName,
        signatory_email: req.signatoryEmail,
        requested_by: req.requestedBy,
        requested_at: req.requestedAt,
        status: req.status,
        otp_code: req.otpCode,
        otp_generated_at: req.otpGeneratedAt,
        otp_expires_at: req.otpExpiresAt,
        otp_verified_at: req.otpVerifiedAt,
        authorized_at: req.authorizedAt
      });
      if (error) console.error('Supabase sync error (signature_requests):', error);
    } catch (e) {}
  }

  static async pushAuditLog(log: AuditLog) {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('audit_logs').upsert({
        id: log.id,
        document_id: log.documentId,
        document_number: log.documentNumber,
        user_name: log.userName,
        user_role: log.userRole,
        action: log.action,
        details: log.details,
        ip_address: log.ipAddress,
        timestamp: log.timestamp
      });
      if (error) console.error('Supabase sync error (audit_logs):', error);
    } catch (e) {}
  }

  // Naive full pull on boot
  static async pullAllData() {
    if (!isSupabaseConfigured) return null;
    try {
      const [docs, emps, reqs, logs] = await Promise.all([
        supabase.from('documents').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('signature_requests').select('*'),
        supabase.from('audit_logs').select('*')
      ]);

      return {
        documents: docs.data,
        employees: emps.data,
        signatureRequests: reqs.data,
        auditLogs: logs.data
      };
    } catch (e) {
      console.error('Failed to pull data from Supabase', e);
      return null;
    }
  }
}
