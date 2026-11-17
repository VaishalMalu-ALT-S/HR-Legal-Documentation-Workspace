-- ============================================================================
-- SMARTDOCSIGN (SIGNHR) — COMPLETE SUPABASE DATABASE SETUP & REALTIME CONFIG
-- ============================================================================
-- Run this entire script in your Supabase SQL Editor.
-- It creates all required tables, foreign keys, indexes, Row Level Security (RLS)
-- policies, Supabase Storage buckets, seed templates, and Realtime publications.
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables safely to allow clean execution
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS approval_steps CASCADE;
DROP TABLE IF EXISTS approval_workflows CASCADE;
DROP TABLE IF EXISTS signature_requests CASCADE;
DROP TABLE IF EXISTS document_authorizations CASCADE;
DROP TABLE IF EXISTS document_signatures CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS template_versions CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- ============================================================================
-- 3. TABLE DEFINITIONS
-- ============================================================================

-- A. Employees Table
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  designation TEXT,
  employment_type TEXT,
  date_of_joining TIMESTAMP WITH TIME ZONE,
  work_location TEXT,
  reporting_manager TEXT,
  salary_ctc NUMERIC,
  pan_number TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B. Contractors Table
CREATE TABLE contractors (
  id TEXT PRIMARY KEY,
  contractor_id TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  contract_start_date TIMESTAMP WITH TIME ZONE,
  contract_end_date TIMESTAMP WITH TIME ZONE,
  engagement_type TEXT,
  rate_compensation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- C. Document Templates
CREATE TABLE document_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  default_workflow JSONB DEFAULT '[]'::jsonb
);

-- D. Template Versions
CREATE TABLE template_versions (
  id TEXT PRIMARY KEY,
  template_id TEXT REFERENCES document_templates(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  content TEXT NOT NULL,
  changelog TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  variables JSONB DEFAULT '[]'::jsonb
);

-- E. Documents (Core SmartDocument Vault)
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  document_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  company_id TEXT NOT NULL,
  employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  contractor_id TEXT REFERENCES contractors(id) ON DELETE SET NULL,
  person_name TEXT NOT NULL,
  person_email TEXT NOT NULL,
  person_role TEXT,
  template_version_id TEXT,
  template_version_number TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  variable_values JSONB DEFAULT '{}'::jsonb,
  document_hash TEXT NOT NULL DEFAULT '',
  original_hash TEXT NOT NULL DEFAULT '',
  is_tampered BOOLEAN DEFAULT FALSE,
  qr_verification_code TEXT,
  verification_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  generated_by TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  content_rendered_html TEXT,
  pdf_data_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- F. Document Signatures (Cryptographic DSC & eSign records)
CREATE TABLE document_signatures (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  signatory_name TEXT NOT NULL,
  signatory_role TEXT NOT NULL,
  signatory_email TEXT NOT NULL,
  method TEXT NOT NULL,
  certificate_serial TEXT,
  certificate_issuer TEXT,
  algorithm TEXT,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  signature_hash TEXT NOT NULL,
  status TEXT DEFAULT 'valid'
);

-- G. Document Authorizations (Signer OTP unlocks recorded per document)
CREATE TABLE document_authorizations (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  signatory_role TEXT NOT NULL,
  signatory_name TEXT NOT NULL,
  signatory_email TEXT NOT NULL,
  method TEXT NOT NULL,
  authorized_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by_role TEXT
);

-- H. Signature Requests (Lifecycle: HR Request -> Signer OTP -> HR Verified)
CREATE TABLE signature_requests (
  id TEXT PRIMARY KEY,
  document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
  document_title TEXT NOT NULL,
  document_number TEXT NOT NULL,
  signatory_role TEXT NOT NULL,
  signatory_name TEXT NOT NULL,
  signatory_email TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  otp_code TEXT,
  otp_generated_at TIMESTAMP WITH TIME ZONE,
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  otp_verified_at TIMESTAMP WITH TIME ZONE,
  authorized_at TIMESTAMP WITH TIME ZONE
);

-- I. Approval Workflows
CREATE TABLE approval_workflows (
  id TEXT PRIMARY KEY,
  document_id TEXT UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
  current_step_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress'
);

-- J. Approval Steps
CREATE TABLE approval_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id TEXT REFERENCES approval_workflows(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  role_name TEXT NOT NULL,
  assigned_to_name TEXT,
  status TEXT DEFAULT 'pending',
  comment TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- K. Immutable Audit Logs
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  document_id TEXT,
  document_number TEXT,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  previous_status TEXT,
  new_status TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. PERFORMANCE INDEXES
-- ============================================================================
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_updated_at ON documents(updated_at DESC);
CREATE INDEX idx_sig_requests_doc_id ON signature_requests(document_id);
CREATE INDEX idx_sig_requests_role ON signature_requests(signatory_role);
CREATE INDEX idx_sig_requests_status ON signature_requests(status);
CREATE INDEX idx_doc_auth_doc_id ON document_authorizations(document_id);
CREATE INDEX idx_doc_auth_role ON document_authorizations(signatory_role);
CREATE INDEX idx_audit_logs_doc_id ON audit_logs(document_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
DO $$ 
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN (
          'employees', 'contractors', 'document_templates', 'template_versions', 
          'documents', 'document_signatures', 'document_authorizations', 
          'signature_requests', 'approval_workflows', 'approval_steps', 'audit_logs'
        )
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public access to %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public access to %I" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;

-- ============================================================================
-- 6. SUPABASE REALTIME CONFIGURATION
-- ============================================================================
-- Set REPLICA IDENTITY to FULL so update broadcasts include previous & new records
ALTER TABLE documents REPLICA IDENTITY FULL;
ALTER TABLE signature_requests REPLICA IDENTITY FULL;
ALTER TABLE document_signatures REPLICA IDENTITY FULL;
ALTER TABLE document_authorizations REPLICA IDENTITY FULL;
ALTER TABLE approval_workflows REPLICA IDENTITY FULL;
ALTER TABLE approval_steps REPLICA IDENTITY FULL;
ALTER TABLE audit_logs REPLICA IDENTITY FULL;
ALTER TABLE employees REPLICA IDENTITY FULL;

-- Ensure the supabase_realtime publication exists and includes the active tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Safely add tables to publication if not already present
DO $$
DECLARE
  t text;
  tables_to_add text[] := ARRAY[
    'documents', 
    'signature_requests', 
    'document_signatures', 
    'document_authorizations', 
    'approval_workflows', 
    'approval_steps', 
    'audit_logs', 
    'employees'
  ];
BEGIN
  FOREACH t IN ARRAY tables_to_add
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I;', t);
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 7. SUPABASE STORAGE SETUP (Documents & Attachments Bucket)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public write documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update documents bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete documents bucket" ON storage.objects;

CREATE POLICY "Allow public read documents bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'documents');

CREATE POLICY "Allow public write documents bucket" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public update documents bucket" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'documents');

CREATE POLICY "Allow public delete documents bucket" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'documents');

-- ============================================================================
-- 8. INITIAL SEED DATA
-- ============================================================================

-- Seed Key Employees
INSERT INTO employees (id, employee_id, full_name, email, department, designation, employment_type, work_location)
VALUES 
  ('emp-siva', 'EMP-001', 'Siva Kumar', 'siva@alt-s.com', 'Executive Management', 'Managing Director', 'Full-time', 'Chennai'),
  ('emp-uma', 'EMP-002', 'Uma Mageshwari', 'uma@alt-s.com', 'Board of Directors', 'Director', 'Full-time', 'Chennai'),
  ('emp-hr', 'EMP-003', 'HR Admin', 'hr@alt-s.com', 'Human Resources', 'HR Operations Lead', 'Full-time', 'Chennai')
ON CONFLICT (id) DO NOTHING;

-- Seed Templates
INSERT INTO document_templates (id, name, category, current_version, status, created_by, default_workflow)
VALUES 
  ('tpl-app-letter', 'Standard Employee Appointment Letter', 'appointment_letter', '1.1', 'active', 'Super Admin', '["HR Admin", "HR Manager", "Authorized Signatory", "Employee"]'::jsonb),
  ('tpl-asset-form', 'IT Hardware Asset Allocation Form', 'asset_policy', '1.0', 'active', 'IT Admin', '["IT Admin", "Employee"]'::jsonb),
  ('tpl-bond-agreement', 'Employee Service Bond Agreement', 'bond_agreement', '1.0', 'active', 'Legal Admin', '["HR Admin", "Authorized Signatory", "Employee"]'::jsonb),
  ('tpl-ack-form', 'Employee Policy & NDA Acknowledgement Form', 'acknowledgement_form', '1.0', 'active', 'HR Admin', '["HR Admin", "Employee"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Template Versions
INSERT INTO template_versions (id, template_id, version_number, content, changelog, created_by, variables)
VALUES 
  ('ver-app-1.1', 'tpl-app-letter', '1.1', 
   'Date: {{joining_date}}\n\nAPPOINTMENT LETTER\n\n{{company_name}}\n\nDear {{salutation}} {{employee_name}},\n\nWe are pleased to appoint you as {{designation}} at {{work_location}}.\nFixed Remuneration: INR {{salary_annual}} per annum.\n\nYours faithfully,\nFor {{company_name}}', 
   'Standard Appointment Letter', 'Legal Team', 
   '["joining_date", "employee_name", "salutation", "designation", "company_name", "work_location", "salary_annual"]'::jsonb),
  ('ver-asset-1.0', 'tpl-asset-form', '1.0', 
   'Asset Acknowledgment Letter\n\nDate: {{issue_date}}\nEmployee: {{employee_name}} ({{employee_id}})\nDesignation: {{designation}}\nCompany: {{company_name}}\n\nDevice: {{asset_type}} (ID: {{device_id}})\nCondition: {{asset_condition}}\nAccessories: {{accessories_provided}}\n\nSignature: ______________________ Date: {{issue_date}}', 
   'IT Hardware allocation form', 'IT Admin', 
   '["issue_date", "employee_name", "employee_id", "designation", "company_name", "asset_type", "device_id", "asset_condition", "accessories_provided"]'::jsonb),
  ('ver-bond-1.0', 'tpl-bond-agreement', '1.0', 
   'SERVICE BOND AGREEMENT\n\nThis Agreement is made on {{joining_date}} between {{company_name}} and {{employee_name}} (Employee ID: {{employee_id}}).\n\nTerm: {{bond_months}} months.\nDamages on breach: INR {{bond_amount}}.\n\nSigned by Employee: {{employee_name}}\nSigned for {{company_name}}: Authorized Signatory', 
   'Service bond agreement', 'Legal Admin', 
   '["employee_name", "employee_id", "joining_date", "bond_months", "bond_amount", "company_name"]'::jsonb),
  ('ver-ack-1.0', 'tpl-ack-form', '1.0', 
   'EMPLOYEE POLICY & NDA ACKNOWLEDGEMENT FORM\n\nI, {{employee_name}} (Employee ID: {{employee_id}}), confirm receipt and understanding of the Code of Conduct and NDA of {{company_name}}.\n\nDate: {{date}}\nSignature: {{employee_name}}', 
   'Standard NDA acknowledgment', 'HR Admin', 
   '["employee_name", "employee_id", "department", "date", "company_name"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Initial System Audit Log
INSERT INTO audit_logs (id, user_name, user_role, action, details)
VALUES 
  ('log-init', 'System Admin', 'hr', 'Database Setup', 'Supabase database initialized with full schema, Realtime publication, and initial templates.')
ON CONFLICT (id) DO NOTHING;
