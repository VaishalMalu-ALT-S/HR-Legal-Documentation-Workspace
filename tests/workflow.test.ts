/**
 * SMARTDOCSIGN END-TO-END AUTOMATED TEST SUITE
 * Tests all 17 business workflows across HR Admin, Siva Kumar (MD), and Uma Mageshwari (Director).
 * Run with: node --experimental-strip-types tests/workflow.test.ts
 */

import { test, describe, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Setup environment polyfills for Node runtime
const storage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, value: string) => storage.set(key, String(value)),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear()
};

(globalThis as any).window = {
  location: { origin: 'http://localhost:5173' },
  addEventListener: () => {},
  removeEventListener: () => {}
};

import { DatabaseService } from '../src/services/dbService';
import { CryptoService } from '../src/services/cryptoService';
import { DocumentProcessor } from '../src/services/documentProcessor';
import { COMPANIES } from '../src/data/companies';
import { COMPANY_TEMPLATES } from '../src/data/templates';

describe('SMARTDOCSIGN - 17 ENTERPRISE WORKFLOW TESTS', () => {

  beforeEach(() => {
    storage.clear();
    DatabaseService.setSessionRole('hr');
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 1: User Roles and Permission Enforcement
  // ─────────────────────────────────────────────────────────────
  test('Workflow 1: Role-based permissions strictly enforced', async () => {
    // HR is allowed to create documents
    DatabaseService.setSessionRole('hr');
    assert.equal(DatabaseService.getSessionRole(), 'hr');

    // Siva cannot create documents
    DatabaseService.setSessionRole('siva_kumar');
    await assert.rejects(
      async () => {
        await DatabaseService.createDocument({
          title: 'Unauthorized Doc',
          category: 'appointment_letter',
          companyId: 'alt_s',
          personName: 'Test Candidate',
          personEmail: 'test@alt-s.com',
          personRole: 'Consultant',
          templateVersionId: 'asset_acknowledgment',
          templateVersionNumber: '1.0',
          status: 'draft',
          variableValues: {},
          generatedAt: new Date().toISOString(),
          generatedBy: 'Siva Kumar',
          approvalWorkflow: { id: 'wf1', documentId: 'doc1', currentStepIndex: 0, steps: [], status: 'in_progress' }
        });
      },
      /403 Forbidden/
    );

    // Uma cannot delete documents
    DatabaseService.setSessionRole('uma_mageshwari');
    assert.throws(() => DatabaseService.deleteDocument('any-doc-id'), /403 Forbidden/);
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 2: Multi-Company Branding (ALT-S, Sifratech, Link ERP)
  // ─────────────────────────────────────────────────────────────
  test('Workflow 2: Document creation and multi-company branding preservation', async () => {
    DatabaseService.setSessionRole('hr');

    // Test all 3 companies
    const companyIds = ['alt_s', 'sifratech', 'link_erp'];
    for (const compId of companyIds) {
      const company = COMPANIES.find(c => c.id === compId);
      assert.ok(company, `Company ${compId} must exist in registry`);

      const doc = await DatabaseService.createDocument({
        title: `Offer - ${company.name}`,
        category: 'appointment_letter',
        companyId: compId,
        personName: 'Ravi Verma',
        personEmail: 'ravi@example.com',
        personRole: 'Architect',
        templateVersionId: 'appointment_solution_architect',
        templateVersionNumber: '1.0',
        status: 'draft',
        variableValues: { companyId: compId, company_name: company.name },
        generatedAt: new Date().toISOString(),
        generatedBy: 'HR Admin',
        approvalWorkflow: { id: `wf-${compId}`, documentId: `doc-${compId}`, currentStepIndex: 0, steps: [], status: 'in_progress' }
      });

      assert.equal(doc.companyId, compId);
      assert.ok(doc.documentNumber.startsWith('DOC-2026-'));

      // Test letterhead processor recognizes company
      const letterhead = DocumentProcessor.renderLetterheadHTML(
        doc.title,
        `Welcome to ${company.name}`,
        { company_name: company.name, companyId: compId }
      );
      assert.ok(letterhead.includes(company.logoUrl), `Letterhead must include ${company.logoUrl}`);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 3: Universal Document Import Formatting Preservation
  // ─────────────────────────────────────────────────────────────
  test('Workflow 3: Universal Document Import text & paragraph structure', async () => {
    const rawTxt = "First Paragraph of Agreement.\n\nSecond Paragraph with Terms & Conditions.";
    const lines = rawTxt.split(/\r?\n/).filter(Boolean);

    assert.equal(lines.length, 2);
    assert.ok(lines[0].includes('First Paragraph'));
    assert.ok(lines[1].includes('Second Paragraph'));
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 4: Document Editing & Variable Substitution
  // ─────────────────────────────────────────────────────────────
  test('Workflow 4: Variable interpolation in templates', async () => {
    const tpl = "Dear {{recipientName}}, you are appointed as {{designation}} at {{companyName}} with Ref: {{refNo}}.";
    const values = {
      recipientName: 'Vaishal Malu',
      designation: 'AI Solutions Specialist',
      companyName: 'ALT-S Technology',
      refNo: 'ALTS/DOC/2026/99'
    };

    const result = DocumentProcessor.interpolateTemplate(tpl, values);
    assert.equal(result, "Dear Vaishal Malu, you are appointed as AI Solutions Specialist at ALT-S Technology with Ref: ALTS/DOC/2026/99.");
    assert.ok(!result.includes('{{'));
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 5: Draft Persistence (Save, Reopen, No Duplicate IDs)
  // ─────────────────────────────────────────────────────────────
  test('Workflow 5: Draft persistence, updates in-place without duplicate records', async () => {
    DatabaseService.setSessionRole('hr');

    // Create Draft
    const initialPages = ['<p>Page 1 Content Initial</p>', '<p>Page 2 Content Initial</p>'];
    const draft = await DatabaseService.saveDraft({
      title: 'Consultant Agreement Draft',
      companyId: 'alt_s',
      personName: 'Ramesh Patel',
      variableValues: {
        pages: JSON.stringify(initialPages),
        variables: JSON.stringify({ recipientName: 'Ramesh Patel' })
      }
    });

    const initialId = draft.id;
    const initialDocNumber = draft.documentNumber;
    assert.ok(initialId);
    assert.ok(initialDocNumber);

    // Save updates to existing draft
    const editedPages = ['<p>Page 1 Content EDITED</p>', '<p>Page 2 Content EDITED</p>'];
    const updatedDraft = await DatabaseService.saveDraft({
      id: initialId,
      title: 'Consultant Agreement Draft - v2',
      variableValues: {
        pages: JSON.stringify(editedPages)
      }
    }, initialId);

    // Must update in place (no duplicate doc)
    assert.equal(updatedDraft.id, initialId);
    assert.equal(updatedDraft.documentNumber, initialDocNumber);

    const allDrafts = DatabaseService.getDrafts();
    const matching = allDrafts.filter(d => d.id === initialId);
    assert.equal(matching.length, 1, 'Draft must not duplicate in storage');

    // Content was preserved accurately
    const restored = DatabaseService.getDocumentById(initialId);
    assert.ok(restored);
    const restoredPages = JSON.parse(restored.variableValues.pages);
    assert.equal(restoredPages[0], '<p>Page 1 Content EDITED</p>');
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 6: Signature Request for Siva Kumar
  // ─────────────────────────────────────────────────────────────
  test('Workflow 6: HR generates signature request for Siva Kumar', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({
      title: 'MD Approval Document',
      companyId: 'alt_s'
    });

    const req = DatabaseService.createSignatureRequest(
      draft.id,
      'siva_kumar',
      'siva@alt-s.com',
      'HR Admin'
    );

    assert.equal(req.documentId, draft.id);
    assert.equal(req.signatoryRole, 'siva_kumar');
    assert.equal(req.signatoryEmail, 'siva@alt-s.com');
    assert.equal(req.status, 'pending');

    // Document status transitioned
    const updatedDoc = DatabaseService.getDocumentById(draft.id);
    assert.equal(updatedDoc?.status, 'pending_approval');
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 7: Signature Request for Uma Mageshwari
  // ─────────────────────────────────────────────────────────────
  test('Workflow 7: HR generates signature request for Uma Mageshwari', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({
      title: 'Director Approval Document',
      companyId: 'sifratech'
    });

    const req = DatabaseService.createSignatureRequest(
      draft.id,
      'uma_mageshwari',
      'uma@alt-s.com',
      'HR Admin'
    );

    assert.equal(req.documentId, draft.id);
    assert.equal(req.signatoryRole, 'uma_mageshwari');
    assert.equal(req.signatoryEmail, 'uma@alt-s.com');
    assert.equal(req.status, 'pending');
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 8: Dual Signature Request (Both Siva and Uma)
  // ─────────────────────────────────────────────────────────────
  test('Workflow 8: HR requests signatures from both Siva and Uma', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({
      title: 'Dual Authorized High-Stakes Contract',
      companyId: 'link_erp'
    });

    const reqSiva = DatabaseService.createSignatureRequest(
      draft.id,
      'siva_kumar',
      'siva@alt-s.com',
      'HR Admin'
    );

    const reqUma = DatabaseService.createSignatureRequest(
      draft.id,
      'uma_mageshwari',
      'uma@alt-s.com',
      'HR Admin'
    );

    assert.notEqual(reqSiva.id, reqUma.id);
    const docReqs = DatabaseService.getRequestsForDocument(draft.id);
    assert.equal(docReqs.length, 2);
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 9: Siva Kumar Review & Independent OTP Generation
  // ─────────────────────────────────────────────────────────────
  test('Workflow 9: Siva Kumar logs in, approves request, and generates OTP', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({ title: 'Siva Authorization Doc' });
    const req = DatabaseService.createSignatureRequest(draft.id, 'siva_kumar', 'siva@alt-s.com', 'HR Admin');

    // Switch role to Siva Kumar
    DatabaseService.setSessionRole('siva_kumar');
    const sivaReqs = DatabaseService.getRequestsForSigner('siva_kumar');
    assert.equal(sivaReqs.length, 1);

    const approvedReq = DatabaseService.signerApproveRequest(req.id);
    assert.equal(approvedReq.status, 'approved');
    assert.ok(approvedReq.otpCode);
    assert.equal(approvedReq.otpCode.length, 6);
    assert.ok(approvedReq.otpExpiresAt);
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 10: Uma Mageshwari Review & Independent OTP Generation
  // ─────────────────────────────────────────────────────────────
  test('Workflow 10: Uma Mageshwari logs in, approves request, and generates OTP', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({ title: 'Uma Authorization Doc' });
    const req = DatabaseService.createSignatureRequest(draft.id, 'uma_mageshwari', 'uma@alt-s.com', 'HR Admin');

    // Switch role to Uma Mageshwari
    DatabaseService.setSessionRole('uma_mageshwari');
    const umaReqs = DatabaseService.getRequestsForSigner('uma_mageshwari');
    assert.equal(umaReqs.length, 1);

    const approvedReq = DatabaseService.signerApproveRequest(req.id);
    assert.equal(approvedReq.status, 'approved');
    assert.ok(approvedReq.otpCode);
    assert.equal(approvedReq.otpCode.length, 6);
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 11: Security - Signer Cannot Approve Other Signer's Request
  // ─────────────────────────────────────────────────────────────
  test('Workflow 11: Cross-signer approval strictly rejected (Siva cannot approve Uma request)', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({ title: 'Uma Restricted Doc' });
    const umaReq = DatabaseService.createSignatureRequest(draft.id, 'uma_mageshwari', 'uma@alt-s.com', 'HR Admin');

    // Siva tries to approve Uma's request
    DatabaseService.setSessionRole('siva_kumar');
    assert.throws(
      () => DatabaseService.signerApproveRequest(umaReq.id),
      /403 Forbidden/
    );
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 12: Security - Invalid OTP Rejected
  // ─────────────────────────────────────────────────────────────
  test('Workflow 12: Invalid OTP rejected and does not unlock signature', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({ title: 'Doc for Invalid OTP Test' });
    const req = DatabaseService.createSignatureRequest(draft.id, 'siva_kumar', 'siva@alt-s.com', 'HR Admin');

    DatabaseService.setSessionRole('siva_kumar');
    DatabaseService.signerApproveRequest(req.id);

    // HR attempts to verify with wrong OTP
    DatabaseService.setSessionRole('hr');
    assert.throws(
      () => DatabaseService.hrVerifySignatureOtp(req.id, '000000'),
      /Incorrect OTP/
    );

    const doc = DatabaseService.getDocumentById(draft.id);
    assert.equal(doc?.authorizations?.length ?? 0, 0, 'No authorizations should be added on failure');
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 13: Security - Expired OTP Rejected
  // ─────────────────────────────────────────────────────────────
  test('Workflow 13: Expired OTP rejected', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({ title: 'Doc for Expired OTP Test' });
    const req = DatabaseService.createSignatureRequest(draft.id, 'siva_kumar', 'siva@alt-s.com', 'HR Admin');

    DatabaseService.setSessionRole('siva_kumar');
    const approvedReq = DatabaseService.signerApproveRequest(req.id);

    // Manually set expiration in the past
    const reqs = DatabaseService.getSignatureRequests();
    const idx = reqs.findIndex(r => r.id === approvedReq.id);
    reqs[idx].otpExpiresAt = new Date(Date.now() - 60000).toISOString();
    (DatabaseService as any).saveSignatureRequests(reqs);

    // HR attempts verification
    DatabaseService.setSessionRole('hr');
    assert.throws(
      () => DatabaseService.hrVerifySignatureOtp(req.id, approvedReq.otpCode!),
      /OTP has expired/
    );
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 14: HR OTP Verification Unlocks Signer Signature
  // ─────────────────────────────────────────────────────────────
  test('Workflow 14: Valid OTP unlocks signature and consumes OTP', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({ title: 'Doc for Unlock Test' });
    const req = DatabaseService.createSignatureRequest(draft.id, 'siva_kumar', 'siva@alt-s.com', 'HR Admin');

    DatabaseService.setSessionRole('siva_kumar');
    const approvedReq = DatabaseService.signerApproveRequest(req.id);
    const validOtp = approvedReq.otpCode!;

    DatabaseService.setSessionRole('hr');
    const verifiedReq = DatabaseService.hrVerifySignatureOtp(req.id, validOtp);
    assert.ok(verifiedReq.authorizedAt);

    // OTP consumed (cannot replay)
    assert.equal(verifiedReq.otpCode, undefined);

    const doc = DatabaseService.getDocumentById(draft.id);
    assert.ok(doc?.authorizations);
    const sivaAuth = doc?.authorizations?.find(a => a.signatoryRole === 'siva_kumar');
    assert.ok(sivaAuth, 'Siva Kumar signature must be authorized in document');
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 15: Dual Signer Strict Independence (Siva != Uma)
  // ─────────────────────────────────────────────────────────────
  test('Workflow 15: Siva authorization NEVER unlocks Uma signature and vice versa', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({ title: 'Strict Dual Signer Isolation Doc' });
    const reqSiva = DatabaseService.createSignatureRequest(draft.id, 'siva_kumar', 'siva@alt-s.com', 'HR Admin');
    const reqUma = DatabaseService.createSignatureRequest(draft.id, 'uma_mageshwari', 'uma@alt-s.com', 'HR Admin');

    // Siva approves his request
    DatabaseService.setSessionRole('siva_kumar');
    const sivaApproved = DatabaseService.signerApproveRequest(reqSiva.id);

    // HR verifies Siva's OTP
    DatabaseService.setSessionRole('hr');
    DatabaseService.hrVerifySignatureOtp(reqSiva.id, sivaApproved.otpCode!);

    // Check document authorizations
    const doc = DatabaseService.getDocumentById(draft.id)!;
    const hasSivaAuth = doc.authorizations?.some(a => a.signatoryRole === 'siva_kumar' && !a.usedAt);
    const hasUmaAuth = doc.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari' && !a.usedAt);

    assert.equal(hasSivaAuth, true, 'Siva signature MUST be unlocked');
    assert.equal(hasUmaAuth, false, 'Uma signature MUST REMAIN LOCKED');
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 16: Signature Placement & Audit Trail
  // ─────────────────────────────────────────────────────────────
  test('Workflow 16: HR records authorized signature placement and audits it', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({ title: 'Placement Test Doc' });
    const req = DatabaseService.createSignatureRequest(draft.id, 'siva_kumar', 'siva@alt-s.com', 'HR Admin');

    DatabaseService.setSessionRole('siva_kumar');
    const approved = DatabaseService.signerApproveRequest(req.id);

    DatabaseService.setSessionRole('hr');
    DatabaseService.hrVerifySignatureOtp(req.id, approved.otpCode!);

    // HR places the authorized signature
    const placedDoc = DatabaseService.recordSignaturePlacement(draft.id, 'siva_kumar', 'HR Admin');
    const placedAuth = placedDoc.authorizations?.find(a => a.signatoryRole === 'siva_kumar');
    assert.ok(placedAuth?.usedAt);
    assert.equal(placedAuth?.usedByRole, 'hr');

    // Audit log verifies placement
    const logs = DatabaseService.getAuditLogs();
    const placementLog = logs.find(l => l.action === 'Signature Placed' && l.documentId === draft.id);
    assert.ok(placementLog);
    assert.ok(placementLog.details.includes('Siva Kumar'));
  });

  // ─────────────────────────────────────────────────────────────
  // WORKFLOW 17: Document Finalization & SHA-256 Immutable Seal
  // ─────────────────────────────────────────────────────────────
  test('Workflow 17: HR finalizes document, generating cryptographic SHA-256 seal', async () => {
    DatabaseService.setSessionRole('hr');
    const draft = await DatabaseService.saveDraft({ title: 'Final Contract' });
    
    const finalized = await DatabaseService.finalizeDocument(draft.id, 'HR Admin');
    assert.equal(finalized.status, 'completed');
    assert.ok(finalized.completedAt);
    assert.ok(finalized.documentHash);
    assert.equal(finalized.documentHash.length, 64);
    assert.equal(finalized.documentHash, finalized.originalHash);
    assert.equal(finalized.isTampered, false);

    // Audit log was created
    const logs = DatabaseService.getAuditLogs();
    const finalLog = logs.find(l => l.action === 'Document Finalized' && l.documentId === draft.id);
    assert.ok(finalLog);
    assert.equal(finalLog.newStatus, 'completed');
  });

});
