import React, { useState } from 'react';
import { 
  Layers, Plus, History, Edit3, Eye, Sparkles, CheckCircle, 
  AlertCircle, FileText, ArrowRight, ShieldCheck, X, RefreshCw
} from 'lucide-react';
import { DocumentTemplate, TemplateVersion, UserRole } from '../types';
import { DatabaseService } from '../services/dbService';
import { AIAssistantService } from '../services/aiAssistant';

interface TemplateManagerProps {
  templates: DocumentTemplate[];
  currentRole: UserRole;
  onNavigateToWizard: (templateId: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates,
  currentRole,
  onNavigateToWizard
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(templates[0] || null);
  const [editingContent, setEditingContent] = useState<string>(() => templates[0]?.versions?.[0]?.content || '');
  const [prevTemplateId, setPrevTemplateId] = useState<string | null>(() => templates[0]?.id || null);

  // Sync editing content when template selection changes
  if (selectedTemplate?.id !== prevTemplateId) {
    setPrevTemplateId(selectedTemplate?.id || null);
    if (selectedTemplate?.versions?.length) {
      setEditingContent(selectedTemplate.versions[0].content);
    }
  }

  // AI Clause Analysis
  const aiAnalysis = selectedTemplate ? AIAssistantService.analyzeTemplate(selectedTemplate, editingContent) : null;

  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !editingContent) return;

    const updatedTemplate = DatabaseService.createTemplateVersion(
      selectedTemplate.id,
      editingContent,
      changelogNote || 'Updated template wording and variable placeholders.',
      'HR Admin'
    );

    setSelectedTemplate(updatedTemplate);
    setIsEditing(false);
    setChangelogNote('');
  };

  const handleInsertVariable = (varName: string) => {
    setEditingContent(prev => prev + ` {{${varName}}}`);
  };

  const handleInsertClause = (clauseText: string) => {
    setEditingContent(prev => prev + `\n\n${clauseText}`);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-heading">Document Template Management</h1>
          <p className="text-xs text-slate-500">Configure reusable document templates, edit clauses, track version history & analyze AI completeness score</p>
        </div>

        {selectedTemplate && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateToWizard(selectedTemplate.id)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
            >
              <FileText size={15} /> Use Template in Wizard
            </button>
          </div>
        )}
      </div>

      {/* Main Template Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Template Navigation Sidebar */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Templates Catalog</span>
          
          <div className="space-y-1">
            {templates.map(tpl => {
              const isSelected = selectedTemplate?.id === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected 
                      ? 'bg-brand-50/80 border-brand-200 text-brand-900 shadow-sm' 
                      : 'border-transparent hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{tpl.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 font-mono">
                      v{tpl.currentVersion}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span className="capitalize">{tpl.category.replace('_', ' ')}</span>
                    <span>{tpl.versions.length} versions</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content & Editor Area */}
        {selectedTemplate && (
          <div className="lg:col-span-3 space-y-6">
            
            {/* Template Info & AI Score Header Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 font-heading">{selectedTemplate.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active v{selectedTemplate.currentVersion}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Category: <strong className="capitalize text-slate-700">{selectedTemplate.category.replace('_', ' ')}</strong> • Last updated by {selectedTemplate.versions[0]?.createdBy || 'Admin'}
                </p>
              </div>

              {/* AI Quality Score Widget */}
              {aiAnalysis && (
                <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="text-center px-2">
                    <div className="text-xs font-extrabold text-brand-600 font-mono">{aiAnalysis.completenessScore}%</div>
                    <div className="text-[10px] font-medium text-slate-500">Completeness</div>
                  </div>
                  <div className="h-6 w-px bg-slate-200"></div>
                  <div className="text-center px-2">
                    <div className="text-xs font-extrabold text-indigo-600 font-mono">{aiAnalysis.legalCoverageScore}%</div>
                    <div className="text-[10px] font-medium text-slate-500">Legal Coverage</div>
                  </div>
                </div>
              )}
            </div>

            {/* Editor / View Mode Toggle Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className={`text-xs font-bold transition-colors ${!isEditing ? 'text-brand-600 border-b-2 border-brand-600 pb-1' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    Template View & Variables
                  </button>
                  {(currentRole === 'super_admin' || currentRole === 'hr_admin') && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className={`text-xs font-bold transition-colors flex items-center gap-1.5 ${isEditing ? 'text-brand-600 border-b-2 border-brand-600 pb-1' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      <Edit3 size={13} /> Edit Template Clauses
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setCompareVersions(selectedTemplate.versions)}
                  className="text-xs text-slate-600 hover:text-brand-600 font-semibold flex items-center gap-1"
                >
                  <History size={13} /> View Version History ({selectedTemplate.versions.length})
                </button>
              </div>

              <div className="p-6">
                
                {/* VIEW MODE */}
                {!isEditing && (
                  <div className="space-y-6">
                    {/* Detected Variables Bar */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Detected Dynamic Placeholders ({selectedTemplate.versions[0]?.variables.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(selectedTemplate.versions[0]?.variables || []).map(v => (
                          <span key={v} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono border border-slate-200">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Template Content Body */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {selectedTemplate.versions[0]?.content}
                    </div>
                  </div>
                )}

                {/* EDIT MODE WITH AI CLAUSE ASSISTANT */}
                {isEditing && (
                  <form onSubmit={handleSaveVersion} className="space-y-6">
                    
                    {/* Insert Variable Quick Toolbar */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 uppercase">Insert Dynamic Variable:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'employee_name', 'employee_id', 'designation', 'department', 
                          'joining_date', 'salary_annual', 'work_location', 'company_name'
                        ].map(varName => (
                          <button
                            key={varName}
                            type="button"
                            onClick={() => handleInsertVariable(varName)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 border border-slate-200 text-xs font-mono"
                          >
                            + {`{{${varName}}}`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Main Textarea Editor */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase">Template Wording & Wording Content</label>
                      <textarea
                        value={editingContent}
                        onChange={e => setEditingContent(e.target.value)}
                        rows={14}
                        className="w-full p-4 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900 leading-relaxed"
                      />
                    </div>

                    {/* AI Smart Clause Suggestions Box */}
                    {aiAnalysis && aiAnalysis.suggestedClauses.length > 0 && (
                      <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                          <Sparkles size={16} className="text-amber-600" />
                          <span>AI Smart Clause Suggestions ({aiAnalysis.suggestedClauses.length})</span>
                        </div>
                        <div className="space-y-2">
                          {aiAnalysis.suggestedClauses.map((clause, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg border border-amber-200 flex items-start justify-between gap-3 text-xs">
                              <div>
                                <div className="font-bold text-slate-900">{clause.title}</div>
                                <p className="text-slate-600 text-[11px] mt-0.5">{clause.reason}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleInsertClause(clause.text)}
                                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] shrink-0"
                              >
                                + Add Clause
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Changelog Note Input & Action Buttons */}
                    <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <input
                        type="text"
                        value={changelogNote}
                        onChange={e => setChangelogNote(e.target.value)}
                        placeholder="Version changelog note (e.g. Added non-compete clause)..."
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm"
                        >
                          Save New Version v{(parseFloat(selectedTemplate.currentVersion) + 0.1).toFixed(1)}
                        </button>
                      </div>
                    </div>

                  </form>
                )}

              </div>
            </div>

          </div>
        )}

      </div>

      {/* VERSION HISTORY & COMPARISON MODAL */}
      {compareVersions && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 font-heading">Template Version Audit History</h3>
              <button onClick={() => setCompareVersions(null)} className="p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              {compareVersions.map(ver => (
                <div key={ver.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-brand-700">Version {ver.versionNumber}</span>
                    <span className="text-[11px] text-slate-500">Modified on {new Date(ver.createdAt).toLocaleDateString()} by {ver.createdBy}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{ver.changelog}</p>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {ver.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
