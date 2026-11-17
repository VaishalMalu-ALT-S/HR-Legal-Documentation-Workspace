-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to ensure a clean setup and prevent "already exists" errors
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

-- 1. Employees Table
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

-- 2. Contractors Table
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

-- 3. Document Templates
CREATE TABLE document_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  current_version TEXT NOT NULL,
  status TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  default_workflow JSONB DEFAULT '[]'::jsonb
);

-- 4. Template Versions
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

-- 5. Documents (SmartDocument)
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
  status TEXT NOT NULL,
  variable_values JSONB DEFAULT '{}'::jsonb,
  document_hash TEXT NOT NULL,
  original_hash TEXT NOT NULL,
  is_tampered BOOLEAN DEFAULT FALSE,
  qr_verification_code TEXT,
  verification_url TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  generated_by TEXT,
  signed_at TIMESTAMP WITH TIME ZONE,
  content_rendered_html TEXT,
  pdf_data_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Document Signatures
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

-- 7. Document Authorizations
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

-- 8. Signature Requests
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

-- 9. Approval Workflows
CREATE TABLE approval_workflows (
  id TEXT PRIMARY KEY,
  document_id TEXT UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
  current_step_index INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress'
);

-- 10. Approval Steps
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

-- 11. Audit Logs
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

-- Optional: Enable Row Level Security (RLS) for all tables
-- Safely drop policies if they exist so we can recreate them without errors
DO $$ 
DECLARE
    t text;
    p text;
BEGIN
    FOR t IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
        AND tablename IN ('employees', 'contractors', 'document_templates', 'template_versions', 'documents', 'document_signatures', 'document_authorizations', 'signature_requests', 'approval_workflows', 'approval_steps', 'audit_logs')
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        
        FOR p IN 
            SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I;', p, t);
        END LOOP;
        
        EXECUTE format('CREATE POLICY "Enable all for authenticated users" ON %I FOR ALL USING (true);', t);
    END LOOP;
END $$;
