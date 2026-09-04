import { 
  Employee, Contractor, DocumentTemplate, TemplateVersion, 
  SmartDocument, AuditLog, UserRole, DocumentSignature, SharedLink 
} from '../types';
import { 
  INITIAL_EMPLOYEES, INITIAL_CONTRACTORS, 
  INITIAL_TEMPLATES, INITIAL_DOCUMENTS, INITIAL_AUDIT_LOGS 
} from '../data/seededData';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { CryptoService } from './cryptoService';

const STORAGE_KEYS = {
  EMPLOYEES: 'smartdoc_employees_v1',
  CONTRACTORS: 'smartdoc_contractors_v1',
  TEMPLATES: 'smartdoc_templates_v1',
  DOCUMENTS: 'smartdoc_documents_v1',
  AUDIT_LOGS: 'smartdoc_audit_logs_v1',
  SHARED_LINKS: 'smartdoc_shared_links_v1'
};

export class DatabaseService {
  private static subscribers: (() => void)[] = [];

  /**
   * Subscribe to store updates
   */
  static subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private static notifySubscribers() {
    this.subscribers.forEach(cb => cb());
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
    this.logAuditAction('Super Admin', 'super_admin', 'Added Employee', `Created employee profile for ${newEmp.fullName} (${newEmp.employeeId})`);
    this.notifySubscribers();
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
      this.logAuditAction('HR Admin', 'hr_admin', 'Deleted Employee', `Removed employee profile ${emp.fullName} (${emp.employeeId})`);
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
    this.logAuditAction('HR Admin', 'hr_admin', 'Added Contractor', `Created contractor profile for ${newCon.fullName} (${newCon.contractorId})`);
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
    this.logAuditAction(template.createdBy, 'super_admin', 'Created Document Template', `Created template ${template.name}`);
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
    this.logAuditAction(userName, 'hr_admin', 'Updated Template Version', `Created template version ${newVerNum} for ${template.name}`);
    this.notifySubscribers();
    return template;
  }

  // --- DOCUMENTS ---
  static getDocuments(): SmartDocument[] {
    const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
      return INITIAL_DOCUMENTS;
    }
    return JSON.parse(data);
  }

  static getDocumentById(id: string): SmartDocument | undefined {
    const documents = this.getDocuments();
    return documents.find(d => d.id === id || d.documentNumber === id || d.qrVerificationCode === id);
  }

  static async createDocument(docData: Omit<SmartDocument, 'id' | 'documentNumber' | 'documentHash' | 'originalHash' | 'isTampered' | 'qrVerificationCode' | 'verificationUrl' | 'createdAt' | 'updatedAt' | 'signatures'>): Promise<SmartDocument> {
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
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    this.logAuditAction(
      docData.generatedBy, 
      'hr_admin', 
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
    const documents = this.getDocuments();
    const index = documents.findIndex(d => d.id === documentId);
    if (index === -1) throw new Error('Document not found');

    const doc = documents[index];
    doc.signatures.push(signature);
    const prevStatus = doc.status;
    doc.status = 'signed';
    doc.signedAt = new Date().toISOString();
    doc.updatedAt = new Date().toISOString();

    // Mark current workflow step as approved
    if (doc.approvalWorkflow && doc.approvalWorkflow.steps) {
      doc.approvalWorkflow.steps.forEach(step => {
        if (step.roleName.toLowerCase().includes('signatory') || step.roleName.toLowerCase().includes('employee')) {
          step.status = 'approved';
          step.comment = `Signed electronically via ${signature.method.toUpperCase()}.`;
          step.updatedAt = new Date().toISOString();
        }
      });
      doc.approvalWorkflow.status = 'approved';
    }

    documents[index] = doc;
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
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

  static updateApprovalStatus(
    documentId: string,
    stepNumber: number,
    status: 'approved' | 'rejected' | 'changes_requested',
    comment: string,
    userName: string,
    userRole: UserRole
  ): SmartDocument {
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
          doc.status = 'pending_signature';
        } else {
          doc.status = 'under_review';
        }
      } else if (status === 'rejected') {
        doc.status = 'rejected';
        doc.approvalWorkflow.status = 'rejected';
      }
    }

    doc.updatedAt = new Date().toISOString();
    documents[index] = doc;
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
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
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    this.logAuditAction('System Security Audit', 'auditor', ' TAMPER DETECTED', `Document hash mismatch simulated for ${doc.documentNumber}`);
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
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    this.logAuditAction('System Security Audit', 'auditor', 'Integrity Restored', `Restored original SHA-256 hash for ${doc.documentNumber}`);
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
    this.logAuditAction('HR Admin', 'hr_admin', 'Created Secure Link', `Generated secure share link for document ID ${documentId}`);
    return newLink;
  }
}
