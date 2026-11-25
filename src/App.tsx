import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DocumentBuilder } from './components/DocumentBuilder';
import { SignatureCenter } from './components/SignatureCenter';
import { ApprovalWorkflow } from './components/ApprovalWorkflow';
import { DraftsManager } from './components/DraftsManager';
import { AuthScreens } from './components/AuthScreens';
import { SecureSharingModal } from './components/SecureSharingModal';
import { SessionExpiredModal } from './components/SessionExpiredModal';
import { NotFoundScreen } from './components/NotFoundScreen';

import { UserRole } from './types';
import { DatabaseService } from './services/dbService';

export function App() {
  const [currentTab, setCurrentTab] = useState(() => {
    return localStorage.getItem('signhr_active_tab') || 'signature';
  });
  const [selectedTemplate, setSelectedTemplate] = useState('asset_acknowledgment');
  const [collapsed, setCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(() => (localStorage.getItem('signhr_auth_role') as UserRole) || 'hr');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('signhr_auth_status') === 'true');
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [shareModalDocId, setShareModalDocId] = useState<string | null>(null);

  // Navigation Payloads
  const [signatureDocId, setSignatureDocId] = useState<string | undefined>(() => {
    return localStorage.getItem('signhr_active_doc_id') || undefined;
  });
  const [verificationDocNumber, setVerificationDocNumber] = useState<string>('DOC-2026-000124');
  // Increment to force DocumentBuilder remount (guarantees clean state on New Document)
  const [builderKey, setBuilderKey] = useState<number>(0);

  // Reactive DB States
  const [documents, setDocuments] = useState(DatabaseService.getDocuments());

  // Subscribe to DB updates and hydrate from Supabase
  useEffect(() => {
    DatabaseService.hydrateFromSupabase();
    
    const unsubscribe = DatabaseService.subscribe(() => {
      setDocuments(DatabaseService.getDocuments());
    });
    return unsubscribe;
  }, []);

  // Redirect if role changes to restricted tabs
  useEffect(() => {
    if (currentRole !== 'hr' && (currentTab === 'builder' || currentTab === 'drafts')) {
      setCurrentTab('approval');
    }
  }, [currentRole, currentTab]);

  const handleNavigate = (tab: string, payload?: { documentId?: string; documentNumber?: string; templateId?: string }) => {
    if (payload?.documentId) {
      setSignatureDocId(payload.documentId);
      localStorage.setItem('signhr_active_doc_id', payload.documentId);
    }
    if (payload?.documentNumber) setVerificationDocNumber(payload.documentNumber);
    setCurrentTab(tab);
    localStorage.setItem('signhr_active_tab', tab);
  };

  const draftsCount = documents.filter(d => d.status === 'draft').length;

  if (!isAuthenticated) {
    return (
      <AuthScreens 
        onLogin={(role) => {
          setCurrentRole(role);
          localStorage.setItem('signhr_auth_role', role);
          localStorage.setItem('signhr_auth_status', 'true');
          DatabaseService.setSessionRole(role);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#F4F6F9] text-[#0F172A] font-sans antialiased select-none">
      {/* Left Vertical Navigation Rail (Navy #162A45) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeDocTemplate={selectedTemplate}
        onSelectDocTemplate={(tpl) => setSelectedTemplate(tpl)}
        currentRole={currentRole}
        draftsCount={draftsCount}
      />

      {/* Main Container: Top Header + Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <Header
          onNavigate={handleNavigate}
          activeTab={currentTab}
          onOpenCreate={() => {
            setSelectedTemplate('asset_acknowledgment');
            setSignatureDocId(undefined);
            localStorage.removeItem('signhr_active_doc_id');
            setBuilderKey(k => k + 1); // Force remount → clean landing screen
            setCurrentTab('builder');
            localStorage.setItem('signhr_active_tab', 'builder');
          }}
          currentRole={currentRole}
          onRoleChange={(role) => {
            setCurrentRole(role);
            localStorage.setItem('signhr_auth_role', role);
            localStorage.setItem('signhr_auth_status', 'true');
            DatabaseService.setSessionRole(role);
          }}
          onExpireSession={() => setIsSessionExpired(true)}
          onLogout={() => {
            localStorage.removeItem('signhr_auth_role');
            localStorage.removeItem('signhr_auth_status');
            setIsAuthenticated(false);
          }}
        />

        {/* Content Area */}
        <main className="flex-1 h-full overflow-hidden flex flex-col p-4 md:p-6 bg-[#F4F6F9]">
          {currentTab === 'signature' && (
            <SignatureCenter
              documents={documents}
              currentRole={currentRole}
              preselectedDocId={signatureDocId}
              selectedTemplate={selectedTemplate}
              onSignatureSuccess={() => handleNavigate('signature')}
            />
          )}

          {currentTab === 'builder' && currentRole === 'hr' && (
            <div className="flex-1 h-full overflow-hidden">
              <DocumentBuilder
                key={`builder-${builderKey}-${signatureDocId ?? 'new'}`}
                initialTemplateId={selectedTemplate}
                initialDocId={signatureDocId}
                onSaveSuccess={() => handleNavigate('drafts')}
                onRequestSignatureSuccess={(docId) => handleNavigate('approval')}
              />
            </div>
          )}

          {currentTab === 'drafts' && currentRole === 'hr' && (
            <div className="flex-1 h-full overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <DraftsManager
                  documents={documents}
                  onContinueEditing={(doc) => {
                    // Always open in the DocumentBuilder editor so branding is preserved
                    setSignatureDocId(doc.id);
                    localStorage.setItem('signhr_active_doc_id', doc.id);
                    setCurrentTab('builder');
                    localStorage.setItem('signhr_active_tab', 'builder');
                  }}
                  onOpenCreate={() => {
                    setSelectedTemplate('asset_acknowledgment');
                    setSignatureDocId(undefined);
                    localStorage.removeItem('signhr_active_doc_id');
                    setBuilderKey(k => k + 1); // Force remount → clean landing screen
                    setCurrentTab('builder');
                    localStorage.setItem('signhr_active_tab', 'builder');
                  }}
                />
              </div>
            </div>
          )}

          {currentTab === 'approval' && (
            <div className="flex-1 h-full overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <ApprovalWorkflow
                  documents={documents}
                  currentRole={currentRole}
                  onNavigateToSignature={(docId) => {
                    setSignatureDocId(docId);
                    setCurrentTab('signature');
                  }}
                />
              </div>
            </div>
          )}

          {/* 404 Fallback State */}
          {currentTab !== 'signature' && currentTab !== 'builder' && currentTab !== 'approval' && currentTab !== 'drafts' && (
            <NotFoundScreen onGoHome={() => setCurrentTab('signature')} />
          )}

        </main>
      </div>

      {/* Secure Link Sharing Modal */}
      {shareModalDocId && (
        <SecureSharingModal
          documentId={shareModalDocId}
          onClose={() => setShareModalDocId(null)}
        />
      )}
      
      {/* Session Expired Overlay */}
      {isSessionExpired && (
        <SessionExpiredModal onRelogin={() => {
          setIsSessionExpired(false);
          setIsAuthenticated(false);
        }} />
      )}
    </div>
  );
}

export default App;
