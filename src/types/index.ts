export type UserRole = 'uma_mageshwari' | 'hr' | 'siva_kumar';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Probation' | 'Trainee';
  dateOfJoining: string;
  workLocation: string;
  reportingManager: string;
  salaryCtc: number; // e.g. 2400000
  panNumber: string;
  address: string;
  createdAt: string;
}

export interface Contractor {
  id: string;
  contractorId: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  role: string;
  contractStartDate: string;
  contractEndDate: string;
  engagementType: 'Fixed-Term' | 'Project-Based' | 'Hourly';
  rateCompensation: string; // e.g. "INR 1,50,000 / Month"
  createdAt: string;
}

export type DocumentCategory = 
  | 'appointment_letter' 
  | 'contractor_offer' 
  | 'asset_form' 
  | 'bond_agreement' 
  | 'acknowledgement_form';

export interface TemplateVariable {
  key: string;
  label: string;
  defaultValue?: string;
  description?: string;
  required: boolean;
  category: 'employee_archived' | 'contractor' | 'company' | 'custom';
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  versionNumber: string; // e.g. "1.0", "1.1", "2.0"
  content: string; // HTML / markdown string with {{placeholders}}
  changelog: string;
  createdBy: string;
  createdAt: string;
  variables: string[]; // detected variable keys
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: DocumentCategory;
  currentVersion: string;
  status: 'active' | 'draft' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  versions: TemplateVersion[];
  defaultWorkflow: string[]; // roles in approval order
}

export type DocumentStatus = 
  | 'draft'
  | 'pending_approval'
    | 'waiting_for_approval'
  | 'correction_required'
  | 'approved'
  | 'signature_authorized'
  | 'signed'
  | 'completed';

export interface DocumentSignature {
  id: string;
  documentId: string;
  signatoryName: string;
  signatoryRole: string;
  signatoryEmail: string;
  method: 'dsc_token' | 'demo_mode' | 'esign';
  certificateSerial?: string;
  certificateIssuer?: string;
  algorithm?: string;
  signedAt: string;
  signatureHash: string;
  status: 'valid' | 'revoked';
}

export interface ApprovalStep {
  stepNumber: number;
  roleName: string; // 'HR Admin' | 'HR Manager' | 'Legal' | 'Authorized Signatory'
  assignedToName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'correction_required' | 'changes_requested';
  comment?: string;
  updatedAt?: string;
}

export interface DocumentAuthorization {
  id: string;
  documentId: string;
  signatoryRole: string; // 'siva_kumar' | 'uma_mageshwari'
  signatoryName: string;
  signatoryEmail: string;
  method: 'otp' | 'direct';
  authorizedAt: string;
  usedAt?: string;
  usedByRole?: string; // e.g. 'hr'
}


export interface DocumentAuthorization {
  id: string;
  documentId: string;
  signatoryRole: string; // 'siva_kumar' | 'uma_mageshwari'
  signatoryName: string;
  signatoryEmail: string;
  method: 'otp' | 'direct';
  authorizedAt: string;
  usedAt?: string;
  usedByRole?: string; // e.g. 'hr'
}

// ── Signature Request ──────────────────────────────────────────────
// HR creates this to request signature authorization from Siva/Uma.
// The signer views the document, clicks Approve, gets an OTP.
// HR enters the OTP to unlock the signature in the Signature Studio.
export interface SignatureRequest {
  id: string;
  documentId: string;
  documentTitle: string;
  documentNumber: string;
  signatoryRole: 'siva_kumar' | 'uma_mageshwari';
  signatoryName: string;
  signatoryEmail: string;       // email HR entered
  requestedBy: string;          // HR Admin
  requestedAt: string;
  status: 'pending' | 'viewed' | 'approved' | 'rejected';
  // OTP fields — generated when signer clicks "Approve Signature"
  otpCode?: string;             // 6-digit code stored here (demo mode, no real email)
  otpGeneratedAt?: string;
  otpExpiresAt?: string;        // 10 min expiry
  otpVerifiedAt?: string;       // set when HR verifies successfully
  // Set after HR OTP verification succeeds
  authorizedAt?: string;
}

export interface DocumentApprovalWorkflow {
  id: string;
  documentId: string;
  currentStepIndex: number;
  steps: ApprovalStep[];
  status: 'in_progress' | 'approved' | 'rejected' | 'correction_required';
}

export interface SmartDocument {
  id: string;
  documentNumber: string; // e.g. DOC-2026-000124
  title: string;
  category: DocumentCategory;
  companyId: string;
  employeeId?: string;
  contractorId?: string;
  personName: string;
  personEmail: string;
  personRole: string;
  templateVersionId: string;
  templateVersionNumber: string;
  status: DocumentStatus;
  variableValues: Record<string, string>;
  documentHash: string; // SHA-256
  originalHash: string;
  isTampered: boolean;
  qrVerificationCode: string;
  verificationUrl: string;
  generatedAt: string;
  generatedBy: string;
  signedAt?: string;
  signatures: DocumentSignature[];
  approvalWorkflow: DocumentApprovalWorkflow;
    authorizations?: DocumentAuthorization[];
  contentRenderedHtml?: string;
  pdfDataUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  documentId?: string;
  documentNumber?: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. "Document Generated", "DSC Signed", "Approved"
  details: string;
  ipAddress: string;
  previousStatus?: string;
  newStatus?: string;
  timestamp: string;
}

export interface SharedLink {
  id: string;
  documentId: string;
  shareUrl: string;
  expiryDays: number;
  expiresAt: string;
  passwordProtected: boolean;
  accessCount: number;
  maxDownloads: number;
  createdAt: string;
}

export interface DSCTokenState {
  isConnected: boolean;
  holderName: string;
  issuer: string;
  serialNumber: string;
  validUntil: string;
  algorithm: string;
  pinValidated: boolean;
  providerType: 'eMudhra' | 'Capricorn' | 'nCode' | 'Generic DSC';
}

export interface AIAnalysisResult {
  completenessScore: number;
  legalCoverageScore: number;
  missingVariables: string[];
  suggestedClauses: { title: string; text: string; reason: string }[];
  riskAlerts: { level: 'low' | 'medium' | 'high'; message: string }[];
}
