import { 
  Employee, Contractor, DocumentTemplate, TemplateVersion, 
  SmartDocument, AuditLog, UserRole, DocumentSignature, SharedLink, SignatureRequest
} from '../types';
import { 
  INITIAL_EMPLOYEES, INITIAL_CONTRACTORS, 
  INITIAL_TEMPLATES, INITIAL_DOCUMENTS, INITIAL_AUDIT_LOGS 
} from '../data/seededData';
import { supabase as _supabase, isSupabaseConfigured as _isSupabaseConfigured } from './supabaseClient';
import { CryptoService } from './cryptoService';
import { SupabaseSync } from './SupabaseSync';

const STORAGE_KEYS = {
  EMPLOYEES: 'smartdoc_employees_v1',
  CONTRACTORS: 'smartdoc_contractors_v1',
  TEMPLATES: 'smartdoc_templates_v1',
  DOCUMENTS: 'smartdoc_documents_v1',
  AUDIT_LOGS: 'smartdoc_audit_logs_v1',
  SHARED_LINKS: 'smartdoc_shared_links_v1',
  SIGNATURE_REQUESTS: 'smartdoc_sig_requests_v1'
};

export class DatabaseService {
  private static subscribers: (() => void)[] = [];
  private static memoryFallback: Record<string, string> = {};

  private static safeSetItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (e: any) {
      console.warn(`LocalStorage quota exceeded for ${key}. Falling back to in-memory storage.`);
      DatabaseService.memoryFallback[key] = value;
    }
  }

  private static safeGetItem(key: string): string | null {
    if (DatabaseService.memoryFallback[key]) {
      return DatabaseService.memoryFallback[key];
    }
    return localStorage.getItem(key);
  }


  static setSessionRole(role: UserRole) {
    localStorage.setItem('secure_session_role', role);
    this.notifySubscribers();
  }

  static getSessionRole(): UserRole {
    return (localStorage.getItem('secure_session_role') as UserRole) || 'hr';
  }

  /**
   * Cross-tab storage listener for real-time sync across multiple browser tabs
   */
  static initStorageListener() {
    if (typeof window !== 'undefined' && !(window as any).__db_storage_listener_attached) {
      window.addEventListener('storage', (e) => {
        if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
          DatabaseService.notifySubscribers();
        }
      });
      (window as any).__db_storage_listener_attached = true;
    }
  }

  /**
   * Subscribe to store updates
   */
  static subscribe(callback: () => void) {
    this.initStorageListener();
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private static notifySubscribers() {
    this.subscribers.forEach(cb => cb());
  }

  static async hydrateFromSupabase() {
    const data = await SupabaseSync.pullAllData();
    if (!data) return;

    // 1. Load documents into local cache and notify (merge with local data, never wipe)
    if (data.documents && data.documents.length > 0) {
      const localDocs: SmartDocument[] = JSON.parse(this.safeGetItem(STORAGE_KEYS.DOCUMENTS) || '[]');
      const remoteMappedDocs: SmartDocument[] = data.documents.map(d => {
        const docSigs: DocumentSignature[] = ((data as any).signatures || [])
          .filter((s: any) => s.document_id === d.id)
          .map((s: any) => ({
            id: s.id,
            documentId: s.document_id,
            signatoryName: s.signatory_name,
            signatoryRole: s.signatory_role,
            signatoryEmail: s.signatory_email,
            method: s.method,
            certificateSerial: s.certificate_serial,
            certificateIssuer: s.certificate_issuer,
            algorithm: s.algorithm,
            signedAt: s.signed_at,
            signatureHash: s.signature_hash,
            status: s.status
          }));

        const docAuths: any[] = ((data as any).authorizations || [])
          .filter((a: any) => a.document_id === d.id)
          .map((a: any) => ({
            id: a.id,
            documentId: a.document_id,
            signatoryRole: a.signatory_role,
            signatoryName: a.signatory_name,
            signatoryEmail: a.signatory_email,
            method: a.method,
            authorizedAt: a.authorized_at,
            usedAt: a.used_at,
            usedByRole: a.used_by_role
          }));

        return {
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
          signatures: docSigs,
          authorizations: docAuths,
          approvalWorkflow: { id: `wf-${d.id}`, documentId: d.id, currentStepIndex: 0, steps: [], status: 'in_progress' }
        };
      });

      // Merge: preserve local drafts that may not have been synced yet, or keep latest
      const mergedMap = new Map<string, SmartDocument>();
      remoteMappedDocs.forEach(d => mergedMap.set(d.id, d));
      localDocs.forEach(local => {
        const remote = mergedMap.get(local.id);
        if (!remote) {
          mergedMap.set(local.id, local);
        } else {
          const localTime = new Date(local.updatedAt || local.createdAt).getTime();
          const remoteTime = new Date(remote.updatedAt || remote.createdAt).getTime();
          if (localTime >= remoteTime) {
            mergedMap.set(local.id, local);
          }
        }
      });

      this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(Array.from(mergedMap.values())));
    }

    // 2. Signature Requests merge
    if (data.signatureRequests && data.signatureRequests.length > 0) {
      const localReqs: SignatureRequest[] = JSON.parse(this.safeGetItem(STORAGE_KEYS.SIGNATURE_REQUESTS) || '[]');
      const remoteReqs: SignatureRequest[] = data.signatureRequests.map((r: any) => ({
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
      }));

      const reqMap = new Map<string, SignatureRequest>();
      remoteReqs.forEach(r => reqMap.set(r.id, r));
      localReqs.forEach(l => {
        if (!reqMap.has(l.id)) {
          reqMap.set(l.id, l);
        }
      });
      this.safeSetItem(STORAGE_KEYS.SIGNATURE_REQUESTS, JSON.stringify(Array.from(reqMap.values())));
    }

    // 3. Audit Logs merge
    if (data.auditLogs && data.auditLogs.length > 0) {
      const localLogs: AuditLog[] = JSON.parse(this.safeGetItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
      const remoteLogs: AuditLog[] = data.auditLogs.map((l: any) => ({
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
      }));

      const logMap = new Map<string, AuditLog>();
      localLogs.forEach(l => logMap.set(l.id, l));
      remoteLogs.forEach(r => logMap.set(r.id, r));
      this.safeSetItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(Array.from(logMap.values())));
    }

    // 4. Initialize Supabase Realtime Listener
    SupabaseSync.initRealtime(() => this.notifySubscribers());
    
    // We notify subscribers after hydrating
    this.notifySubscribers();
  }


  // --- EMPLOYEES ---
  static getEmployees(): Employee[] {
    const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(data);
  }

  static addEmployee(employee: Omit<Employee, 'id' | 'createdAt'>): Employee {
    const employees = this.getEmployees();
    const newEmp: Employee = {
      ...employee,
      id: `emp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    employees.unshift(newEmp);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    this.logAuditAction('Super Admin', 'uma_mageshwari', 'Added Employee', `Created employee profile for ${newEmp.fullName} (${newEmp.employeeId})`);
    this.notifySubscribers();
    SupabaseSync.pushEmployee(newEmp);
    return newEmp;
  }

  static updateEmployee(id: string, updates: Partial<Employee>): Employee {
    const employees = this.getEmployees();
    const index = employees.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Employee not found');

    employees[index] = { ...employees[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    this.notifySubscribers();
    return employees[index];
  }

  static deleteEmployee(id: string): void {
    let employees = this.getEmployees();
    const emp = employees.find(e => e.id === id);
    employees = employees.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    if (emp) {
      this.logAuditAction('HR Admin', 'hr', 'Deleted Employee', `Removed employee profile ${emp.fullName} (${emp.employeeId})`);
    }
    this.notifySubscribers();
  }

  // --- CONTRACTORS ---
  static getContractors(): Contractor[] {
    const data = localStorage.getItem(STORAGE_KEYS.CONTRACTORS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.CONTRACTORS, JSON.stringify(INITIAL_CONTRACTORS));
      return INITIAL_CONTRACTORS;
    }
    return JSON.parse(data);
  }

  static addContractor(contractor: Omit<Contractor, 'id' | 'createdAt'>): Contractor {
    const contractors = this.getContractors();
    const newCon: Contractor = {
      ...contractor,
      id: `con-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    contractors.unshift(newCon);
    localStorage.setItem(STORAGE_KEYS.CONTRACTORS, JSON.stringify(contractors));
    this.logAuditAction('HR Admin', 'hr', 'Added Contractor', `Created contractor profile for ${newCon.fullName} (${newCon.contractorId})`);
    this.notifySubscribers();
    return newCon;
  }

  // --- TEMPLATES & VERSIONS ---
  static getTemplates(): DocumentTemplate[] {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
      return INITIAL_TEMPLATES;
    }
    return JSON.parse(data);
  }

  static addTemplate(template: Omit<DocumentTemplate, 'id' | 'createdAt' | 'updatedAt' | 'versions'>, initialContent: string): DocumentTemplate {
    const templates = this.getTemplates();
    const newId = `tpl-${Date.now()}`;
    const initialVer: TemplateVersion = {
      id: `ver-${newId}-1.0`,
      templateId: newId,
      versionNumber: '1.0',
      content: initialContent,
      changelog: 'Initial version created.',
      createdBy: template.createdBy,
      createdAt: new Date().toISOString(),
      variables: (initialContent.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || []).map(v => v.replace(/[{}]/g, ''))
    };

    const newTemplate: DocumentTemplate = {
      ...template,
      id: newId,
      currentVersion: '1.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versions: [initialVer]
    };

    templates.unshift(newTemplate);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    this.logAuditAction(template.createdBy, 'uma_mageshwari', 'Created Document Template', `Created template ${template.name}`);
    this.notifySubscribers();
    return newTemplate;
  }

  static createTemplateVersion(templateId: string, content: string, changelog: string, userName: string): DocumentTemplate {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === templateId);
    if (index === -1) throw new Error('Template not found');

    const template = templates[index];
    const currentNum = parseFloat(template.currentVersion || '1.0');
    const newVerNum = (currentNum + 0.1).toFixed(1);

    const newVersion: TemplateVersion = {
      id: `ver-${templateId}-${newVerNum}`,
      templateId,
      versionNumber: newVerNum,
      content,
      changelog,
      createdBy: userName,
      createdAt: new Date().toISOString(),
      variables: (content.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || []).map(v => v.replace(/[{}]/g, ''))
    };

    template.versions.unshift(newVersion);
    template.currentVersion = newVerNum;
    template.updatedAt = new Date().toISOString();

    templates[index] = template;
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    this.logAuditAction(userName, 'hr', 'Updated Template Version', `Created template version ${newVerNum} for ${template.name}`);
    this.notifySubscribers();
    return template;
  }

  // --- DOCUMENTS ---
  static getDocuments(): SmartDocument[] {
    const data = this.safeGetItem(STORAGE_KEYS.DOCUMENTS);
    let docs: SmartDocument[] = [];
    if (!data) {
      this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
      docs = INITIAL_DOCUMENTS;
    } else {
      docs = JSON.parse(data);
    }

    const sessionRole = this.getSessionRole();
    return docs.filter(doc => {
      if (sessionRole === 'hr') {
        return true; // HR can see all their documents
      }
      if (sessionRole === 'siva_kumar') {
        const requiresSiva = doc.approvalWorkflow?.steps.some(s => s.roleName.toLowerCase().includes('siva_kumar'));
        return requiresSiva || doc.status === 'completed' || doc.status === 'signed' || doc.status === 'signature_authorized';
      }
      if (sessionRole === 'uma_mageshwari') {
        const requiresUma = doc.approvalWorkflow?.steps.some(s => s.roleName.toLowerCase().includes('uma_mageshwari'));
        return requiresUma || doc.status === 'completed' || doc.status === 'signed' || doc.status === 'signature_authorized';
      }
      return false;
    });
  }

  static getDocumentById(id: string): SmartDocument | undefined {
    const documents = this.getDocuments();
    return documents.find(d => d.id === id || d.documentNumber === id || d.qrVerificationCode === id);
  }

  static async createDocument(docData: Omit<SmartDocument, 'id' | 'documentNumber' | 'documentHash' | 'originalHash' | 'isTampered' | 'qrVerificationCode' | 'verificationUrl' | 'createdAt' | 'updatedAt' | 'signatures'>): Promise<SmartDocument> {
    const sessionRole = this.getSessionRole();
    if (sessionRole !== 'hr') {
      throw new Error("403 Forbidden: Only HR Administrators can create documents.");
    }
    const documents = this.getDocuments();
    const docNumber = `DOC-2026-${String(documents.length + 125).padStart(6, '0')}`;
    
    // Hash content
    const rawContentStr = JSON.stringify(docData.variableValues);
    const hash = await CryptoService.generateSHA256(rawContentStr);

    const newDoc: SmartDocument = {
      ...docData,
      id: `doc-${Date.now()}`,
      documentNumber: docNumber,
      documentHash: hash,
      originalHash: hash,
      isTampered: false,
      qrVerificationCode: docNumber,
      verificationUrl: `/verify/${docNumber}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      signatures: []
    };

    documents.unshift(newDoc);
    this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    this.logAuditAction(
      docData.generatedBy, 
      'hr', 
      'Document Generated', 
      `Generated ${docData.title} (${docNumber}) with SHA-256 hash ${hash.substring(0, 12)}...`,
      newDoc.id,
      docNumber,
      'Draft',
      newDoc.status
    );
    this.notifySubscribers();
    return newDoc;
  }

  static async signDocument(
    documentId: string, 
    signature: DocumentSignature,
    userName: string,
    userRole: UserRole
  ): Promise<SmartDocument> {
    const sessionRole = this.getSessionRole();
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');

    const doc = documents[index];
    if (doc.status !== 'approved' && doc.status !== 'signed' && doc.status !== 'completed' && doc.status !== 'signature_authorized') {
      throw new Error("403 Forbidden: Document must be approved before signing.");
    }
    doc.signatures.push(signature);
    const prevStatus = doc.status;
    doc.status = 'signed';
    doc.signedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();

    // Mark current workflow step as approved
    if (doc.approvalWorkflow && doc.approvalWorkflow.steps) {
      doc.approvalWorkflow.steps.forEach(step => {
        if (step.roleName.toLowerCase().includes('siva_kumar') || step.roleName.toLowerCase().includes('employee_archived')) {
          step.status = 'approved';
          step.comment = `Signed electronically via ${signature.method.toUpperCase()}.`;
          step.updatedAt = new Date().toISOString();
        }
      });
      doc.approvalWorkflow.status = 'approved';
    }

    documents[index] = doc;
    this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    this.logAuditAction(
      userName,
      userRole,
      'Digitally Signed',
      `Applied ${signature.method.toUpperCase()} digital signature. Cert serial: ${signature.certificateSerial || 'N/A'}. Hash: ${signature.signatureHash.substring(0, 12)}...`,
      doc.id,
      doc.documentNumber,
      prevStatus,
      'signed'
    );
    this.notifySubscribers();
    return doc;
  }

  
  static authorizeDocumentSignatory(
    documentId: string,
    signatoryRole: 'siva_kumar' | 'uma_mageshwari',
    signatoryEmail: string,
    method: 'otp' | 'direct' = 'otp'
  ): import('../types').SmartDocument {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');
    
    const doc = documents[index];
    if (!doc.authorizations) {
      doc.authorizations = [];
    }
    
    // Check if an active unused authorization already exists for this exact role
    const existingIndex = doc.authorizations.findIndex(a => a.signatoryRole === signatoryRole && !a.usedAt);
    const signatoryName = signatoryRole === 'siva_kumar' ? 'Siva Kumar' : 'Uma Mageshwari';
    
    if (existingIndex === -1) {
      const newAuth = {
        id: `auth-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        documentId,
        signatoryRole,
        signatoryName,
        signatoryEmail,
        method,
        authorizedAt: new Date().toISOString()
      };
      doc.authorizations.push(newAuth as any);
    }
    
    // Update step status to approved for the workflow
    if (doc.approvalWorkflow && doc.approvalWorkflow.steps) {
      const stepIndex = doc.approvalWorkflow.steps.findIndex(s => s.roleName === signatoryRole);
      if (stepIndex !== -1) {
        doc.approvalWorkflow.steps[stepIndex].status = 'approved';
        doc.approvalWorkflow.steps[stepIndex].updatedAt = new Date().toISOString();
        doc.approvalWorkflow.currentStepIndex = Math.min(doc.approvalWorkflow.steps.length, stepIndex + 1);
      }
      
      const allApproved = doc.approvalWorkflow.steps.every(s => s.status === 'approved');
      if (allApproved) {
        doc.status = 'signature_authorized';
        doc.approvalWorkflow.status = 'approved';
      }
    }
    
    documents[index] = doc;
    this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    SupabaseSync.pushDocument(doc).catch(() => {});
    
    this.logAuditAction(
      'System',
      'hr' as any,
      'Approval Verified',
      `OTP verified for ${signatoryName} (${signatoryEmail}). Signature unlocked.`,
      doc.id,
      doc.documentNumber,
      doc.status,
      doc.status
    );
    
    this.notifySubscribers();
    return doc;
  }

  // --- DRAFTS & DOCUMENT MANAGEMENT ---
  static getDrafts(): SmartDocument[] {
    const docs = this.getDocuments();
    return docs
      .filter(d => d.status === 'draft')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  }

  static async saveDraft(
    draftData: Partial<SmartDocument> & { title: string },
    existingDocId?: string
  ): Promise<SmartDocument> {
    const sessionRole = this.getSessionRole();
    if (sessionRole !== 'hr') {
      throw new Error("403 Forbidden: Only HR Administrators can save drafts.");
    }
    const documents: SmartDocument[] = JSON.parse(this.safeGetItem(STORAGE_KEYS.DOCUMENTS) || '[]');

    const targetId = existingDocId || draftData.id;
    const existingIndex = targetId ? documents.findIndex(d => d.id === targetId) : -1;

    // Hash content
    const rawContentStr = JSON.stringify(draftData.variableValues || {});
    const hash = await CryptoService.generateSHA256(rawContentStr);
    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      // UPDATE EXISTING DRAFT (same document ID, no duplicates)
      const existing = documents[existingIndex];
      const contentChanged = Boolean(existing.documentHash && existing.documentHash !== hash);
      
      const updatedDoc: SmartDocument = {
        ...existing,
        ...draftData,
        id: existing.id,
        documentNumber: existing.documentNumber,
        status: 'draft',
        documentHash: hash,
        originalHash: existing.originalHash || hash,
        updatedAt: now,
        // Material changes invalidate unused authorizations
        authorizations: contentChanged ? [] : (existing.authorizations || []),
        // Preserve signatures
        signatures: existing.signatures || [],
        approvalWorkflow: draftData.approvalWorkflow || existing.approvalWorkflow || {
          id: `wf-${Date.now()}`,
          documentId: existing.id,
          currentStepIndex: 0,
          steps: [],
          status: 'in_progress'
        },
        variableValues: {
          ...(existing.variableValues || {}),
          ...(draftData.variableValues || {})
        }
      };

      documents[existingIndex] = updatedDoc;
      this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
      SupabaseSync.pushDocument(updatedDoc).catch(() => {});

      this.logAuditAction(
        draftData.generatedBy || 'HR Admin',
        'hr',
        contentChanged ? 'Draft Modified (Authorizations Reset)' : 'Draft Updated',
        `Draft document ${updatedDoc.documentNumber} (${updatedDoc.title}) updated.${contentChanged ? ' Content modified; authorizations reset.' : ''}`,
        updatedDoc.id,
        updatedDoc.documentNumber,
        'draft',
        'draft'
      );

      this.notifySubscribers();
      return updatedDoc;
    } else {
      // CREATE NEW DRAFT
      const docNumber = `DOC-2026-${String(documents.length + 125).padStart(6, '0')}`;
      const newId = targetId || `doc-${Date.now()}`;

      const newDraft: SmartDocument = {
        id: newId,
        documentNumber: docNumber,
        title: draftData.title || 'Untitled Draft Document',
        category: draftData.category || 'appointment_letter',
        companyId: draftData.companyId || 'alt_s',
        employeeId: draftData.employeeId,
        contractorId: draftData.contractorId,
        personName: draftData.personName || 'Candidate / Employee',
        personEmail: draftData.personEmail || 'hr@alt-s.com',
        personRole: draftData.personRole || 'Employee',
        templateVersionId: draftData.templateVersionId || 'draft',
        templateVersionNumber: draftData.templateVersionNumber || '1.0',
        status: 'draft',
        variableValues: draftData.variableValues || {},
        documentHash: hash,
        originalHash: hash,
        isTampered: false,
        qrVerificationCode: docNumber,
        verificationUrl: `/verify/${docNumber}`,
        generatedAt: now,
        generatedBy: draftData.generatedBy || 'HR Admin',
        createdAt: now,
        updatedAt: now,
        signatures: [],
        authorizations: [],
        approvalWorkflow: draftData.approvalWorkflow || {
          id: `wf-${Date.now()}`,
          documentId: newId,
          currentStepIndex: 0,
          steps: [],
          status: 'in_progress'
        }
      };

      documents.unshift(newDraft);
      this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
      SupabaseSync.pushDocument(newDraft).catch(() => {});

      this.logAuditAction(
        newDraft.generatedBy,
        'hr',
        'Draft Created',
        `New draft created: ${newDraft.title} (${docNumber}).`,
        newDraft.id,
        docNumber,
        'None',
        'draft'
      );

      this.notifySubscribers();
      return newDraft;
    }
  }

  static async updateDocument(id: string, updates: Partial<SmartDocument>): Promise<SmartDocument> {
    const documents: SmartDocument[] = JSON.parse(this.safeGetItem(STORAGE_KEYS.DOCUMENTS) || '[]');
    const index = documents.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Document not found');

    const updated = {
      ...documents[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    documents[index] = updated;
    this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    SupabaseSync.pushDocument(updated).catch(() => {});
    this.notifySubscribers();
    return updated;
  }

  static deleteDocument(id: string): void {
    const sessionRole = this.getSessionRole();
    if (sessionRole !== 'hr') {
      throw new Error("403 Forbidden: Only HR Administrators can delete documents.");
    }
    let documents: SmartDocument[] = JSON.parse(this.safeGetItem(STORAGE_KEYS.DOCUMENTS) || '[]');
    const doc = documents.find(d => d.id === id);
    documents = documents.filter(d => d.id !== id);
    this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    SupabaseSync.deleteDocument(id).catch(() => {});

    // Remove signature requests associated with this doc
    const reqs = this.getSignatureRequests().filter(r => r.documentId !== id);
    this.saveSignatureRequests(reqs);

    if (doc) {
      this.logAuditAction(
        'HR Admin',
        'hr',
        'Document Deleted',
        `Deleted draft/document ${doc.documentNumber} (${doc.title})`,
        doc.id,
        doc.documentNumber
      );
    }
    this.notifySubscribers();
  }


  // ─────────────────────────────────────────────────────────────────
  // SIGNATURE REQUESTS  (HR → Siva/Uma → OTP → HR unlocks signature)
  // ─────────────────────────────────────────────────────────────────

  static getSignatureRequests(): import('../types').SignatureRequest[] {
    const raw = this.safeGetItem('smartdoc_sig_requests_v1');
    return raw ? JSON.parse(raw) : [];
  }

  private static saveSignatureRequests(reqs: import('../types').SignatureRequest[]) {
    this.safeSetItem('smartdoc_sig_requests_v1', JSON.stringify(reqs));
    this.notifySubscribers();
  }

  /** HR calls this after selecting signer + email */
  static createSignatureRequest(
    documentId: string,
    signatoryRole: 'siva_kumar' | 'uma_mageshwari',
    signatoryEmail: string,
    requestedBy: string
  ): import('../types').SignatureRequest {
    const sessionRole = this.getSessionRole();
    if (sessionRole !== 'hr') {
      throw new Error('403 Forbidden: Only HR Administrators can create signature requests.');
    }
    const doc = this.getDocumentById(documentId);
    if (!doc) throw new Error('Document not found');

    const signatoryName = signatoryRole === 'siva_kumar' ? 'Siva Kumar' : 'Uma Mageshwari';
    
    // Prevent duplicate pending requests for the same signer on the same doc
    const existingReq = this.getSignatureRequests().find(
      r => r.documentId === documentId && r.signatoryRole === signatoryRole && r.status === 'pending'
    );
    if (existingReq) {
      return existingReq;
    }

    const req: import('../types').SignatureRequest = {
      id: `sreq-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      documentId,
      documentTitle: doc.title,
      documentNumber: doc.documentNumber,
      signatoryRole,
      signatoryName,
      signatoryEmail,
      requestedBy,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    const reqs = this.getSignatureRequests();
    reqs.unshift(req);
    this.saveSignatureRequests(reqs);
    SupabaseSync.pushSignatureRequest(req).catch(() => {});

    // Update document status + workflow step
    const docs = this.getDocuments();
    const di = docs.findIndex(d => d.id === documentId);
    if (di !== -1) {
      docs[di].status = 'pending_approval';
      docs[di].updatedAt = new Date().toISOString();
      if (!docs[di].approvalWorkflow) {
        docs[di].approvalWorkflow = {
          id: `wf-${Date.now()}`,
          documentId,
          currentStepIndex: 0,
          steps: [],
          status: 'in_progress'
        };
      }
      const existingStep = docs[di].approvalWorkflow.steps.find((s: any) => s.roleName === signatoryRole);
      if (!existingStep) {
        docs[di].approvalWorkflow.steps.push({
          stepNumber: docs[di].approvalWorkflow.steps.length + 1,
          roleName: signatoryRole,
          assignedToName: signatoryName,
          status: 'pending'
        });
      }
      this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
      SupabaseSync.pushDocument(docs[di]).catch(() => {});
    }

    this.logAuditAction(requestedBy, 'hr', 'Signature Request Sent',
      `Signature request sent to ${signatoryName} (${signatoryEmail}) for ${doc.documentNumber}`,
      doc.id, doc.documentNumber);
    this.notifySubscribers();
    return req;
  }

  /** Signer (Siva/Uma) clicks "Approve Signature" — generates OTP */
  static signerApproveRequest(requestId: string): import('../types').SignatureRequest {
    const reqs = this.getSignatureRequests();
    const i = reqs.findIndex((r: any) => r.id === requestId);
    if (i === -1) throw new Error('Signature request not found');

    const sessionRole = this.getSessionRole();
    if (sessionRole !== reqs[i].signatoryRole) {
      throw new Error(`403 Forbidden: Only ${reqs[i].signatoryName} (${reqs[i].signatoryRole}) can approve this signature request.`);
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const expires = new Date(now.getTime() + 10 * 60 * 1000);

    reqs[i] = {
      ...reqs[i],
      status: 'approved',
      otpCode: otp,
      otpGeneratedAt: now.toISOString(),
      otpExpiresAt: expires.toISOString()
    };
    this.saveSignatureRequests(reqs);
    SupabaseSync.pushSignatureRequest(reqs[i]).catch(() => {});

    this.logAuditAction(
      reqs[i].signatoryName,
      reqs[i].signatoryRole,
      'Signature Approved',
      `${reqs[i].signatoryName} approved signature. OTP generated for ${reqs[i].documentNumber}.`,
      reqs[i].documentId,
      reqs[i].documentNumber
    );
    return reqs[i];
  }

  /** HR enters the OTP communicated by Siva/Uma */
  static hrVerifySignatureOtp(requestId: string, enteredOtp: string): import('../types').SignatureRequest {
    const sessionRole = this.getSessionRole();
    if (sessionRole !== 'hr') {
      throw new Error('403 Forbidden: Only HR Administrators can verify signature OTPs.');
    }

    const reqs = this.getSignatureRequests();
    const i = reqs.findIndex((r: any) => r.id === requestId);
    if (i === -1) throw new Error('Signature request not found');

    const req = reqs[i];
    if (req.status !== 'approved' || !req.otpCode) {
      throw new Error('No OTP available. The signer must approve first.');
    }
    if (req.otpExpiresAt && new Date() > new Date(req.otpExpiresAt)) {
      throw new Error('OTP has expired. Ask the signer to generate a new one.');
    }
    if (req.otpCode !== enteredOtp.trim()) {
      throw new Error('Incorrect OTP. Please verify with the signer and try again.');
    }

    const now = new Date().toISOString();
    // Invalidate OTP after successful single-use verification
    reqs[i] = { ...req, otpCode: undefined, otpVerifiedAt: now, authorizedAt: now };
    this.saveSignatureRequests(reqs);
    SupabaseSync.pushSignatureRequest(reqs[i]).catch(() => {});

    // Unlock the signature on the document
    this.authorizeDocumentSignatory(req.documentId, req.signatoryRole, req.signatoryEmail);

    this.logAuditAction(
      'HR Admin',
      'hr',
      'OTP Verified',
      `HR verified OTP for ${req.signatoryName}. Signature unlocked on ${req.documentNumber}.`,
      req.documentId,
      req.documentNumber
    );
    return reqs[i];
  }

  static getRequestsForSigner(role: 'siva_kumar' | 'uma_mageshwari'): import('../types').SignatureRequest[] {
    return this.getSignatureRequests().filter((r: any) => r.signatoryRole === role);
  }

  static getRequestsForDocument(documentId: string): import('../types').SignatureRequest[] {
    return this.getSignatureRequests().filter((r: any) => r.documentId === documentId);
  }

  static sendDocumentForApproval(documentId: string, userName: string): import('../types').SmartDocument {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');
    
    const doc = documents[index];
    if (doc.status !== 'draft') {
      throw new Error('Only draft documents can be sent for approval');
    }
    
    doc.status = 'pending_approval';
    if (doc.approvalWorkflow) {
      doc.approvalWorkflow.status = 'in_progress';
      doc.approvalWorkflow.currentStepIndex = 1;
    }
    doc.updatedAt = new Date().toISOString();
    
    documents[index] = doc;
    this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    SupabaseSync.pushDocument(doc).catch(() => {});
    
    this.logAuditAction(
      userName,
      'hr',
      'Approval Requested',
      `Document sent for approval`,
      doc.id,
      doc.documentNumber,
      'draft',
      'pending_approval'
    );
    this.notifySubscribers();
    return doc;
  }

  static recordSignaturePlacement(
    documentId: string,
    signatoryRole: string,
    hrUserName: string = 'HR Admin'
  ): import('../types').SmartDocument {
    const sessionRole = this.getSessionRole();
    if (sessionRole !== 'hr') {
      throw new Error('403 Forbidden: Only HR Administrators can place signatures.');
    }
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');
    
    const doc = documents[index];
    if (!doc.authorizations) return doc;
    
    const authIndex = doc.authorizations.findIndex(a => a.signatoryRole === signatoryRole && !a.usedAt);
    if (authIndex !== -1) {
      doc.authorizations[authIndex].usedAt = new Date().toISOString();
      doc.authorizations[authIndex].usedByRole = 'hr';
      
      const signatoryName = signatoryRole === 'siva_kumar' ? 'Siva Kumar' : 'Uma Mageshwari';
      
      // If all required signatures are placed, update status to signed
      const allRequired = doc.approvalWorkflow?.steps.map(s => s.roleName) || [];
      const allPlaced = allRequired.length > 0 && allRequired.every(role => 
        doc.authorizations?.some(a => a.signatoryRole === role && a.usedAt)
      );
      
      if (allPlaced) {
        doc.status = 'signed';
      }
      
      documents[index] = doc;
      this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
      SupabaseSync.pushDocument(doc).catch(() => {});
      
      this.logAuditAction(
        hrUserName,
        'hr',
        'Signature Placed',
        `${signatoryName}'s authorized signature was placed by HR (${hrUserName}).`,
        doc.id,
        doc.documentNumber,
        doc.status,
        doc.status
      );
      
      this.notifySubscribers();
    }
    return doc;
  }

  static async finalizeDocument(documentId: string, hrUserName: string = 'HR Admin'): Promise<SmartDocument> {
    const sessionRole = this.getSessionRole();
    if (sessionRole !== 'hr') {
      throw new Error('403 Forbidden: Only HR Administrators can finalize documents.');
    }
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');

    const doc = documents[index];
    const prevStatus = doc.status;
    doc.status = 'completed';
    const now = new Date().toISOString();
    doc.completedAt = now;
    doc.updatedAt = now;

    // Generate cryptographic final document hash over entire payload
    const finalPayload = JSON.stringify({
      id: doc.id,
      documentNumber: doc.documentNumber,
      content: doc.variableValues,
      signatures: doc.signatures,
      authorizations: doc.authorizations,
      completedAt: now
    });
    doc.documentHash = await CryptoService.generateSHA256(finalPayload);
    doc.originalHash = doc.documentHash;
    doc.isTampered = false;

    documents[index] = doc;
    this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    SupabaseSync.pushDocument(doc).catch(() => {});

    this.logAuditAction(
      hrUserName,
      'hr',
      'Document Finalized',
      `Document ${doc.documentNumber} (${doc.title}) finalized. Status changed to completed with immutable hash ${doc.documentHash.substring(0, 12)}...`,
      doc.id,
      doc.documentNumber,
      prevStatus,
      'completed'
    );
    this.notifySubscribers();
    return doc;
  }


  static updateApprovalStatus(
    documentId: string,
    stepNumber: number,
    status: 'approved' | 'correction_required' | 'changes_requested',
    comment: string,
    userName: string,
    userRole: UserRole
  ): SmartDocument {
    const sessionRole = this.getSessionRole();
    if (sessionRole === 'hr') {
      throw new Error("403 Forbidden: HR cannot approve documents.");
    }
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');

    const doc = documents[index];
    if (doc.approvalWorkflow && doc.approvalWorkflow.steps) {
      const stepIndex = doc.approvalWorkflow.steps.findIndex(s => s.stepNumber === stepNumber);
      if (stepIndex !== -1) {
        doc.approvalWorkflow.steps[stepIndex].status = status;
        doc.approvalWorkflow.steps[stepIndex].comment = comment;
        doc.approvalWorkflow.steps[stepIndex].updatedAt = new Date().toISOString();
      }

      if (status === 'approved') {
        doc.approvalWorkflow.currentStepIndex = Math.min(doc.approvalWorkflow.steps.length, stepNumber + 1);
        if (stepNumber === doc.approvalWorkflow.steps.length - 1) {
          doc.status = 'signature_authorized';
        } else {
          doc.status = 'pending_approval';
        }
      } else if (status === 'correction_required') {
        doc.status = 'correction_required';
        doc.approvalWorkflow.status = 'correction_required';
      }
    }

    doc.updatedAt = new Date().toISOString();
    documents[index] = doc;
    this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    this.logAuditAction(
      userName,
      userRole,
      `Approval Stage ${status.toUpperCase()}`,
      `Step ${stepNumber} marked as ${status}. Comment: ${comment}`,
      doc.id,
      doc.documentNumber
    );
    this.notifySubscribers();
    return doc;
  }

  /**
   * Simulates document tampering for verification testing
   */
  static simulateTamper(documentId: string): SmartDocument {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');

    const doc = documents[index];
    doc.documentHash = '9999999999999999999999999999999999999999999999999999999999999999'; // Tampered hash
    doc.isTampered = true;
    doc.updatedAt = new Date().toISOString();

    documents[index] = doc;
    this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    this.logAuditAction('System Security Audit', 'hr', ' TAMPER DETECTED', `Document hash mismatch simulated for ${doc.documentNumber}`);
    this.notifySubscribers();
    return doc;
  }

  static restoreIntegrity(documentId: string): SmartDocument {
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');

    const doc = documents[index];
    doc.documentHash = doc.originalHash;
    doc.isTampered = false;
    doc.updatedAt = new Date().toISOString();

    documents[index] = doc;
    this.safeSetItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    this.logAuditAction('System Security Audit', 'hr', 'Integrity Restored', `Restored original SHA-256 hash for ${doc.documentNumber}`);
    this.notifySubscribers();
    return doc;
  }

  // --- AUDIT LOGS ---
  static getAuditLogs(): AuditLog[] {
    const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(data);
  }

  static logAuditAction(
    userName: string,
    userRole: UserRole,
    action: string,
    details: string,
    documentId?: string,
    documentNumber?: string,
    previousStatus?: string,
    newStatus?: string
  ): AuditLog {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      documentId,
      documentNumber,
      userName,
      userRole,
      action,
      details,
      ipAddress: '192.168.1.104',
      previousStatus,
      newStatus,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    SupabaseSync.pushAuditLog(newLog).catch(() => {});
    return newLog;
  }

  // --- SECURE SHARING LINKS ---
  static createSharedLink(documentId: string, expiryDays: number, passwordProtected: boolean): SharedLink {
    const links = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHARED_LINKS) || '[]');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const newLink: SharedLink = {
      id: `share-${Date.now()}`,
      documentId,
      shareUrl: `${window.location.origin}/share/${documentId}`,
      expiryDays,
      expiresAt: expiresAt.toISOString(),
      passwordProtected,
      accessCount: 0,
      maxDownloads: 5,
      createdAt: new Date().toISOString()
    };

    links.unshift(newLink);
    localStorage.setItem(STORAGE_KEYS.SHARED_LINKS, JSON.stringify(links));
    this.logAuditAction('HR Admin', 'hr', 'Created Secure Link', `Generated secure share link for document ID ${documentId}`);
    return newLink;
  }
}
