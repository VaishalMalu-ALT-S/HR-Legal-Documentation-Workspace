import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DocumentBuilder } from './components/DocumentBuilder';
import { SignatureCenter } from './components/SignatureCenter';
import { ApprovalWorkflow } from './components/ApprovalWorkflow';
import { SecureSharingModal } from './components/SecureSharingModal';

import { UserRole } from './types';
import { DatabaseService } from './services/dbService';

export function App() {
  const [currentTab, setCurrentTab] = useState('signature');
  const [selectedTemplate, setSelectedTemplate] = useState('offer_letter');
  const [collapsed, setCollapsed] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('hr');
  const [shareModalDocId, setShareModalDocId] = useState<string | null>(null);

  // Navigation Payloads
  const [signatureDocId, setSignatureDocId] = useState<string | undefined>();
  const [verificationDocNumber, setVerificationDocNumber] = useState<string>('DOC-2026-000124');

  // Reactive DB States
  const [documents, setDocuments] = useState(DatabaseService.getDocuments());

  // Subscribe to DB updates
  useEffect(() => {
    const unsubscribe = DatabaseService.subscribe(() => {
      setDocuments(DatabaseService.getDocuments());
    });
    return unsubscribe;
  }, []);

  // Redirect if role changes to restricted tabs
  useEffect(() => {
    if (currentRole !== 'hr' && currentTab === 'builder') {
      setCurrentTab('approval');
    }
  }, [currentRole, currentTab]);

  const handleNavigate = (tab: string, payload?: { documentId?: string; documentNumber?: string; templateId?: string }) => {
    if (payload?.documentId) setSignatureDocId(payload.documentId);
    if (payload?.documentNumber) setVerificationDocNumber(payload.documentNumber);
    setCurrentTab(tab);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white text-[#172b4d] font-sans antialiased select-none">
      {/* Top Header */}
      <Header
        onNavigate={handleNavigate}
        activeTab={currentTab}
        onOpenCreate={() => {
          setSelectedTemplate('offer_letter');
          setCurrentTab('signature');
        }}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />

      {/* Main Container: Sidebar + Content Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          activeDocTemplate={selectedTemplate}
          onSelectDocTemplate={(tpl) => setSelectedTemplate(tpl)}
          currentRole={currentRole}
        />

        {/* Content Area */}
        <main className="flex-1 h-full overflow-hidden flex flex-col">
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
                initialTemplateId={selectedTemplate}
                onSaveSuccess={() => handleNavigate('signature')}
              />
            </div>
          )}

          {currentTab === 'approval' && (
            <div className="flex-1 h-full overflow-y-auto p-6 bg-[#f4f5f7]">
              <div className="max-w-6xl mx-auto">
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


        </main>
      </div>

      {/* Secure Link Sharing Modal */}
      {shareModalDocId && (
        <SecureSharingModal
          documentId={shareModalDocId}
          onClose={() => setShareModalDocId(null)}
        />
      )}
    </div>
  );
}

export default App;
