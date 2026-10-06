import React, { useState } from 'react';
import { Shield, FileText, Lock, Eye, X } from 'lucide-react';

type LegalTab = 'privacy' | 'terms' | 'security' | 'cookies';

interface LegalModalsProps {
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ initialTab = 'privacy', onClose }) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  const tabs: { id: LegalTab; label: string; icon: React.ReactNode }[] = [
    { id: 'privacy', label: 'Privacy Policy', icon: <Eye className="w-4 h-4" /> },
    { id: 'terms', label: 'Terms of Service', icon: <FileText className="w-4 h-4" /> },
    { id: 'security', label: 'Security Policy', icon: <Shield className="w-4 h-4" /> },
    { id: 'cookies', label: 'Cookie Preferences', icon: <Lock className="w-4 h-4" /> }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300 select-none">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">Legal & Compliance</h2>
              <p className="text-xs text-slate-500 font-medium">ALT-S Technology Private Limited</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          
          {/* Sidebar Nav */}
          <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-4 shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${
                  activeTab === tab.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Main Scrollable Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white text-sm text-slate-600 leading-relaxed font-medium">
            
            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h3>
                <p><strong>Last Updated:</strong> October 2026</p>
                <p>At ALT-S Technology Private Limited, we take your privacy seriously. This policy explains how we collect, use, and protect your personal and corporate data within the SignHR platform.</p>
                
                <h4 className="text-lg font-bold text-slate-800 mt-6">1. Data Collection</h4>
                <p>We collect essential identity data necessary for generating legally binding employment documents, including Full Names, Contact Information, Signatures, and IP addresses used during the digital signing process.</p>
                
                <h4 className="text-lg font-bold text-slate-800 mt-6">2. Data Usage</h4>
                <p>Data is used exclusively to facilitate document generation, approval workflows, and e-signatures. We do not sell your data to third parties.</p>

                <h4 className="text-lg font-bold text-slate-800 mt-6">3. Data Retention</h4>
                <p>Signed documents are retained securely in an encrypted vault for 7 years to comply with statutory labor and corporate laws.</p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h3>
                <p>By using SignHR, you agree to these terms governing your access to the document builder and signature vault.</p>
                
                <h4 className="text-lg font-bold text-slate-800 mt-6">1. Acceptable Use</h4>
                <p>The platform must only be used for generating and signing legitimate corporate documentation. Fraudulent use of the signature tools will result in immediate termination.</p>
                
                <h4 className="text-lg font-bold text-slate-800 mt-6">2. Legal Binding of Signatures</h4>
                <p>SignHR utilizes standardized cryptographic verification. By signing a document via the platform, you acknowledge that your digital signature carries the exact same legal weight as a physical ink signature.</p>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security Policy</h3>
                <p>SignHR implements bank-grade security protocols to protect sensitive HR and legal documentation.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <h5 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Lock className="w-4 h-4 text-emerald-600" /> At-Rest Encryption</h5>
                    <p className="text-xs">All documents and signature metadata are encrypted using AES-256 before being stored in the database.</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <h5 className="font-bold text-slate-900 flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-blue-600" /> Audit Trails</h5>
                    <p className="text-xs">Every view, edit, and signature event is logged immutably, ensuring complete traceability for compliance.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cookies' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cookie Preferences</h3>
                <p>We use essential cookies to maintain your authenticated session. You can manage your preferences below.</p>
                
                <div className="space-y-4 mt-6">
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-900">Essential Session Cookies</p>
                      <p className="text-xs text-slate-500">Required for maintaining login state. Cannot be disabled.</p>
                    </div>
                    <div className="w-12 h-6 bg-emerald-500 rounded-full relative opacity-70 cursor-not-allowed">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                    <div>
                      <p className="font-bold text-slate-900">Analytics Tracking</p>
                      <p className="text-xs text-slate-500">Helps us understand how the workflow editor is being used.</p>
                    </div>
                    <div className="w-12 h-6 bg-slate-300 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all"></div>
                    </div>
                  </div>
                </div>
                <button className="mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-sm">Save Preferences</button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
