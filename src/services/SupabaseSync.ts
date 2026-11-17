import { supabase, isSupabaseConfigured } from './supabaseClient';
import { SmartDocument, Employee, SignatureRequest, AuditLog, DocumentSignature, DocumentAuthorization } from '../types';

const STORAGE_KEYS = {
  DOCUMENTS: 'smartdoc_documents_v1',
  SIGNATURE_REQUESTS: 'smartdoc_sig_requests_v1',
  AUDIT_LOGS: 'smartdoc_audit_logs_v1'
};

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
    completed_at: doc.completedAt,
    created_at: doc.createdAt || new Date().toISOString(),
    updated_at: doc.updatedAt || new Date().toISOString()
  };
};

export class SupabaseSync {
  private static realtimeChannel: any = null;

  static async pushDocument(doc: SmartDocument) {
    if (!isSupabaseConfigured) return;
    try {
      const row = mapDocToRow(doc);
      const { error } = await supabase.from('documents').upsert(row);
      if (error) console.error('Supabase sync error (documents):', error);

      // Sync workflow if exists
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

      // Sync signatures if present
      if (doc.signatures && doc.signatures.length > 0) {
        for (const sig of doc.signatures) {
          await supabase.from('document_signatures').upsert({
            id: sig.id,
            document_id: doc.id,
            signatory_name: sig.signatoryName,
            signatory_role: sig.signatoryRole,
            signatory_email: sig.signatoryEmail,
            method: sig.method,
            certificate_serial: sig.certificateSerial,
            certificate_issuer: sig.certificateIssuer,
            algorithm: sig.algorithm,
            signed_at: sig.signedAt,
            signature_hash: sig.signatureHash,
            status: sig.status || 'valid'
          });
        }
      }

      // Sync authorizations if present
      if (doc.authorizations && doc.authorizations.length > 0) {
        for (const auth of doc.authorizations) {
          await supabase.from('document_authorizations').upsert({
            id: auth.id,
            document_id: doc.id,
            signatory_role: auth.signatoryRole,
            signatory_name: auth.signatoryName,
            signatory_email: auth.signatoryEmail,
            method: auth.method,
            authorized_at: auth.authorizedAt,
            used_at: auth.usedAt,
            used_by_role: auth.usedByRole
          });
        }
      }
    } catch (e) {
      console.error('Failed to push document to Supabase', e);
    }
  }

  static async deleteDocument(docId: string) {
    if (!isSupabaseConfigured) return;
    try {
      const { error } = await supabase.from('documents').delete().eq('id', docId);
      if (error) console.error('Supabase delete error (documents):', error);
    } catch (e) {
      console.error('Failed to delete document from Supabase', e);
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
        previous_status: log.previousStatus,
        new_status: log.newStatus,
        timestamp: log.timestamp
      });
      if (error) console.error('Supabase sync error (audit_logs):', error);
    } catch (e) {}
  }

  static async pullAllData() {
    if (!isSupabaseConfigured) return null;
    try {
      const [docs, emps, reqs, logs, sigs, auths] = await Promise.all([
        supabase.from('documents').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('signature_requests').select('*'),
        supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200),
        supabase.from('document_signatures').select('*'),
        supabase.from('document_authorizations').select('*')
      ]);

      return {
        documents: docs.data,
        employees: emps.data,
        signatureRequests: reqs.data,
        auditLogs: logs.data,
        signatures: sigs.data,
        authorizations: auths.data
      };
    } catch (e) {
      console.error('Failed to pull data from Supabase', e);
      return null;
    }
  }

  /**
   * Initializes Supabase Realtime subscription on documents, signature_requests, and audit_logs.
   * Dispatches updates directly to local cache and executes onChange callback.
   */
  static initRealtime(onChange: () => void) {
    if (typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || Boolean((process as any).env?.NODE_TEST_CONTEXT))) {
      return;
    }
    if (!isSupabaseConfigured || typeof window === 'undefined') return;
    if (this.realtimeChannel) return; // Prevent duplicate channels

    try {
      this.realtimeChannel = supabase
        .channel('public:realtime_store')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'documents' },
          (payload: any) => {
            SupabaseSync.handleDocRealtime(payload);
            onChange();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'signature_requests' },
          (payload: any) => {
            SupabaseSync.handleSigRequestRealtime(payload);
            onChange();
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'audit_logs' },
          (payload: any) => {
            SupabaseSync.handleAuditLogRealtime(payload);
            onChange();
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] Supabase Realtime channel connected.');
          }
        });
    } catch (e) {
      console.warn('[Realtime] Subscription error:', e);
    }
  }

  private static handleDocRealtime(payload: any) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      let localDocs: SmartDocument[] = raw ? JSON.parse(raw) : [];

      if (payload.eventType === 'DELETE') {
        const deletedId = payload.old?.id;
        if (deletedId) {
          localDocs = localDocs.filter(d => d.id !== deletedId);
          localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(localDocs));
        }
        return;
      }

      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const d = payload.new;
        if (!d || !d.id) return;

        const mapped: SmartDocument = {
          id: d.id,
          documentNumber: d.document_number,
          title: d.title,
          category: d.category,
          companyId: d.company_id,
          personName: d.person_name,
          personEmail: d.person_email,
          personRole: d.person_role,
          templateVersionId: d.template_version_id,
          templateVersionNumber: d.template_version_number,
          status: d.status,
          variableValues: d.variable_values || {},
          documentHash: d.document_hash,
          originalHash: d.original_hash,
          isTampered: d.is_tampered,
          qrVerificationCode: d.qr_verification_code,
          verificationUrl: d.verification_url,
          generatedAt: d.generated_at,
          generatedBy: d.generated_by,
          signedAt: d.signed_at,
          completedAt: d.completed_at,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          signatures: [],
          approvalWorkflow: { id: `wf-${d.id}`, documentId: d.id, currentStepIndex: 0, steps: [], status: 'in_progress' }
        };

        const existingIdx = localDocs.findIndex(doc => doc.id === mapped.id);
        if (existingIdx !== -1) {
          // Preserve local signatures/authorizations if present
          mapped.signatures = localDocs[existingIdx].signatures || [];
          mapped.authorizations = localDocs[existingIdx].authorizations || [];
          mapped.approvalWorkflow = localDocs[existingIdx].approvalWorkflow || mapped.approvalWorkflow;
          localDocs[existingIdx] = mapped;
        } else {
          localDocs.unshift(mapped);
        }
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(localDocs));
      }
    } catch (e) {
      console.warn('[Realtime] Failed to process document change:', e);
    }
  }

  private static handleSigRequestRealtime(payload: any) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SIGNATURE_REQUESTS);
      let localReqs: SignatureRequest[] = raw ? JSON.parse(raw) : [];

      if (payload.eventType === 'DELETE') {
        const deletedId = payload.old?.id;
        if (deletedId) {
          localReqs = localReqs.filter(r => r.id !== deletedId);
          localStorage.setItem(STORAGE_KEYS.SIGNATURE_REQUESTS, JSON.stringify(localReqs));
        }
        return;
      }

      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const r = payload.new;
        if (!r || !r.id) return;

        const mapped: SignatureRequest = {
          id: r.id,
          documentId: r.document_id,
          documentTitle: r.document_title,
          documentNumber: r.document_number,
          signatoryRole: r.signatory_role,
          signatoryName: r.signatory_name,
          signatoryEmail: r.signatory_email,
          requestedBy: r.requested_by,
          requestedAt: r.requested_at,
          status: r.status,
          otpCode: r.otp_code,
          otpGeneratedAt: r.otp_generated_at,
          otpExpiresAt: r.otp_expires_at,
          otpVerifiedAt: r.otp_verified_at,
          authorizedAt: r.authorized_at
        };

        const existingIdx = localReqs.findIndex(req => req.id === mapped.id);
        if (existingIdx !== -1) {
          localReqs[existingIdx] = mapped;
        } else {
          localReqs.unshift(mapped);
        }
        localStorage.setItem(STORAGE_KEYS.SIGNATURE_REQUESTS, JSON.stringify(localReqs));
      }
    } catch (e) {
      console.warn('[Realtime] Failed to process signature request change:', e);
    }
  }

  private static handleAuditLogRealtime(payload: any) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      let localLogs: AuditLog[] = raw ? JSON.parse(raw) : [];

      const l = payload.new;
      if (!l || !l.id) return;

      const mapped: AuditLog = {
        id: l.id,
        documentId: l.document_id,
        documentNumber: l.document_number,
        userName: l.user_name,
        userRole: l.user_role,
        action: l.action,
        details: l.details,
        ipAddress: l.ip_address,
        previousStatus: l.previous_status,
        newStatus: l.new_status,
        timestamp: l.timestamp
      };

      if (!localLogs.some(log => log.id === mapped.id)) {
        localLogs.unshift(mapped);
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(localLogs));
      }
    } catch (e) {
      console.warn('[Realtime] Failed to process audit log change:', e);
    }
  }
}
