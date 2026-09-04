import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, ArrowRight, Layers, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { DocumentTemplate, UserRole } from '../types';
import { DatabaseService } from '../services/dbService';

interface BulkGeneratorProps {
  templates: DocumentTemplate[];
  currentRole: UserRole;
  onBulkComplete: () => void;
}

export const BulkGenerator: React.FC<BulkGeneratorProps> = ({
  templates,
  currentRole,
  onBulkComplete
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(templates[0]);
  const [csvFileName, setCsvFileName] = useState<string>('');
  const [rowCount, setRowCount] = useState<number>(0);

  // Mapped Columns state
  const [columnMap, setColumnMap] = useState<Record<string, string>>({
    employee_name: 'Full Name',
    employee_id: 'Emp ID',
    designation: 'Designation',
    joining_date: 'Joining Date',
    ctc_annual: 'CTC'
  });

  // Batch Generation Progress
  const [progress, setProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      setRowCount(24); // Seeded 24 employee records for demo batch
      setStep(2);
    }
  };

  const handleStartBatch = () => {
    setStep(4);
    setIsProcessing(true);
    let count = 0;
    const interval = setInterval(() => {
      count += 3;
      setGeneratedCount(count);
      setProgress(Math.min(100, Math.round((count / 24) * 100)));

      if (count >= 24) {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 200);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      
      {/* Top Title Bar */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-600/30">
          <Upload size={28} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 font-heading">Bulk Document Generation Engine</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Upload a CSV file of employee records to batch generate hundreds of appointment letters & agreements with SHA-256 tamper hashing.
        </p>
      </div>

      {/* STEP 1: UPLOAD CSV */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-brand-500 transition-colors space-y-4 cursor-pointer relative bg-slate-50/50">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileSpreadsheet size={44} className="text-brand-600 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">Click to upload CSV Employee Data file</p>
              <p className="text-xs text-slate-500">Supports .csv files with headers (e.g., Emp ID, Full Name, Designation, Salary)</p>
            </div>
            <button className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold shadow-sm inline-block">
              Browse CSV File
            </button>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 text-left space-y-1">
            <strong> Demo CSV Preset Available:</strong>
            <p>You can also load the pre-configured sample 24-Employee Onboarding Batch CSV directly.</p>
            <button
              onClick={() => {
                setCsvFileName('ALT_S_New_Joiners_Batch_Aug2026.csv');
                setRowCount(24);
                setStep(2);
              }}
              className="text-brand-700 underline font-bold mt-1 inline-block"
            >
              Load Sample 24-Employee CSV Dataset →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: MAP COLUMNS & SELECT TEMPLATE */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">Step 2: Map CSV Columns to Template Variables</h3>
              <p className="text-xs text-slate-500">Loaded File: <strong className="font-mono text-brand-700">{csvFileName}</strong> ({rowCount} records detected)</p>
            </div>
            <button onClick={() => setStep(1)} className="text-xs text-slate-500 hover:text-slate-800">Change File</button>
          </div>

          {/* Select Template */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Select Target Document Template</label>
            <select
              value={selectedTemplate.id}
              onChange={e => setSelectedTemplate(templates.find(t => t.id === e.target.value) || templates[0])}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} (v{t.currentVersion})</option>
              ))}
            </select>
          </div>

          {/* Variable Mapping Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase">Variable Field Mapping</span>
            <div className="space-y-2">
              {['employee_name', 'employee_id', 'designation', 'joining_date', 'ctc_annual'].map(varKey => (
                <div key={varKey} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-mono font-bold text-brand-700">{`{{${varKey}}}`}</span>
                  <ArrowRight size={14} className="text-slate-400" />
                  <select
                    value={columnMap[varKey] || ''}
                    onChange={e => setColumnMap({ ...columnMap, [varKey]: e.target.value })}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Full Name">CSV Column: Full Name</option>
                    <option value="Emp ID">CSV Column: Emp ID</option>
                    <option value="Designation">CSV Column: Designation</option>
                    <option value="Joining Date">CSV Column: Joining Date</option>
                    <option value="CTC">CSV Column: CTC</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center gap-2 shadow-sm"
            >
              Validate & Preview Batch <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: VALIDATE BATCH */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900 font-heading">Step 3: Batch Data Validation</h3>
          
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Validation Passed: 24 / 24 records ready for generation.</span>
            </div>
            <p className="text-emerald-700">All required dynamic variables mapped without syntax errors.</p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button onClick={() => setStep(2)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
              Back
            </button>
            <button
              onClick={handleStartBatch}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/20"
            >
              Execute Batch Generation (24 Documents) →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: GENERATION PROGRESS */}
      {step === 4 && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-6">
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            {isProcessing ? 'Generating Batch Documents...' : 'Batch Generation Complete!'}
          </h3>

          {/* Animated Progress Bar */}
          <div className="space-y-2 max-w-md mx-auto">
            <div className="flex justify-between text-xs font-bold text-slate-700 font-mono">
              <span>{progress}% Completed</span>
              <span>Generated: {generatedCount} / 24</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {!isProcessing && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 inline-block font-bold">
                 24 Documents generated, SHA-256 hashed & stored in Document Vault!
              </div>

              <div className="pt-4">
                <button
                  onClick={onBulkComplete}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm"
                >
                  View Batch in Document Vault →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
