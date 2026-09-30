const fs = require('fs');

const content = `import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, ArrowLeft, Loader2, Send } from 'lucide-react';
import * as mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import { DatabaseService } from '../services/dbService';
import { DocumentCategory } from '../types';

export const DocumentUploader: React.FC<{ onSwitch: () => void; onSaveSuccess: () => void; }> = ({ onSwitch, onSaveSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const [approver, setApprover] = useState<'siva_kumar' | 'uma_mageshwari' | 'both'>('siva_kumar');
  const [docTitle, setDocTitle] = useState('');

  const processDoc = useCallback(async (f: File) => {
    setIsProcessing(true);
    setFile(f);
    setDocTitle(f.name.replace(/\\.[^/.]+$/, ''));
    const ext = f.name.split('.').pop()?.toLowerCase();

    try {
      if (ext === 'pdf') {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + pdfjs.version + '/pdf.worker.min.mjs';
        const buf = await f.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buf }).promise;
        const outPages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale: 1.8 });
          const c = document.createElement('canvas');
          c.width = vp.width;
          c.height = vp.height;
          await page.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise;
          outPages.push(c.toDataURL('image/png'));
        }
        setPages(outPages);
      } else if (ext === 'docx' || ext === 'doc') {
        const buf = await f.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buf });
        const div = document.createElement('div');
        div.style.cssText =
          'width:794px;min-height:1050px;background:white;padding:60px 72px;box-sizing:border-box;font-family:Calibri,Arial,sans-serif;font-size:14px;line-height:1.6;position:fixed;left:-9999px;top:0;';
        div.innerHTML = result.value;
        document.body.appendChild(div);
        const c = await html2canvas(div, { scale: 2, useCORS: true });
        document.body.removeChild(div);
        setPages([c.toDataURL('image/png')]);
      }
    } catch (err) {
      alert('Failed to process document. Please try a different file.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleSend = async () => {
    if (!file || pages.length === 0) return;

    const steps: any[] = [];
    if (approver === 'siva_kumar' || approver === 'both') {
      steps.push({
        stepNumber: steps.length + 1,
        roleName: 'siva_kumar',
        assignedToName: 'Siva Kumar',
        status: 'pending'
      });
    }
    if (approver === 'uma_mageshwari' || approver === 'both') {
      steps.push({
        stepNumber: steps.length + 1,
        roleName: 'uma_mageshwari',
        assignedToName: 'Uma Mageshwari',
        status: 'pending'
      });
    }

    // Use DatabaseService.createDocument so correct storage key is used and subscribers notified
    await DatabaseService.createDocument({
      title: docTitle || file.name,
      category: 'other' as DocumentCategory,
      companyId: 'alt_s',
      personName: 'Uploaded Document',
      personEmail: 'hr@alt-s.com',
      personRole: 'N/A',
      templateVersionId: 'uploaded',
      templateVersionNumber: '1.0',
      status: 'pending_approval',
      variableValues: {
        uploadedImages: JSON.stringify(pages),
        isUploaded: 'true'
      },
      generatedAt: new Date().toISOString(),
      generatedBy: 'HR Admin',
      approvalWorkflow: {
        id: 'wf_' + Date.now(),
        documentId: '',
        currentStepIndex: 0,
        status: 'in_progress',
        steps: steps
      },
      authorizations: []
    } as any);

    onSaveSuccess();
  };

  return (
    <div className="h-full flex flex-col bg-[#f1f3f6] overflow-hidden font-sans text-slate-900">
      <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center space-x-4">
          <button
            onClick={onSwitch}
            className="flex items-center space-x-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Templates</span>
          </button>
          <div className="h-4 w-px bg-slate-300" />
          <h2 className="text-sm font-bold text-slate-700">Upload Existing Document</h2>
        </div>

        {pages.length > 0 && (
          <button
            onClick={handleSend}
            className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold shadow-sm transition-colors text-sm"
          >
            <Send size={14} />
            <span>Send for Approval</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-8 flex justify-center">
        <div className="w-full max-w-4xl flex gap-8">

          {/* Left panel */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-base font-bold text-slate-800 mb-4">1. Upload File</h3>
              {!file ? (
                <label className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <UploadCloud size={40} className="text-indigo-500 mb-4" />
                  <p className="text-sm font-bold text-slate-700">Click or drag file to upload</p>
                  <p className="text-xs text-slate-500 mt-1">Supports PDF, DOC, DOCX</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files?.[0]) processDoc(e.target.files[0]);
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded text-emerald-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">{file.name}</p>
                      <p className="text-xs text-emerald-700">
                        {isProcessing ? 'Processing...' : pages.length + ' page(s) ready'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setFile(null); setPages([]); }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-3 py-1 bg-emerald-100 rounded"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {pages.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-base font-bold text-slate-800 mb-4">2. Required Signatories</h3>
                <p className="text-xs text-slate-500 mb-4">Select who needs to authorize and sign this document.</p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="radio" name="approver" className="w-4 h-4 text-indigo-600"
                      checked={approver === 'siva_kumar'} onChange={() => setApprover('siva_kumar')} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Siva Kumar (Managing Director)</p>
                      <p className="text-xs text-slate-500">Requires Siva Kumar's OTP &amp; Signature</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="radio" name="approver" className="w-4 h-4 text-indigo-600"
                      checked={approver === 'uma_mageshwari'} onChange={() => setApprover('uma_mageshwari')} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Uma Mageshwari (Board Member)</p>
                      <p className="text-xs text-slate-500">Requires Uma Mageshwari's OTP &amp; Signature</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors bg-indigo-50/30 border-indigo-100">
                    <input type="radio" name="approver" className="w-4 h-4 text-indigo-600"
                      checked={approver === 'both'} onChange={() => setApprover('both')} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Both Signatories Required</p>
                      <p className="text-xs text-slate-500">Requires OTP &amp; Signature from both parties</p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Right preview panel */}
          <div className="w-[450px] bg-slate-200/50 rounded-xl border border-slate-200 overflow-hidden flex flex-col" style={{ minHeight: '400px' }}>
            <div className="bg-slate-100 border-b border-slate-200 p-3 text-xs font-bold text-slate-600 flex justify-between items-center shadow-sm">
              <span>Document Preview</span>
              {pages.length > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                  {pages.length} Pages
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center text-slate-500 py-20">
                  <Loader2 size={32} className="animate-spin text-indigo-500 mb-4" />
                  <p className="text-sm font-bold">Processing Document...</p>
                  <p className="text-xs mt-1">Converting pages for secure viewing</p>
                </div>
              ) : pages.length > 0 ? (
                <div className="space-y-4">
                  {pages.map((p, i) => (
                    <img key={i} src={p} alt={'Page ' + (i + 1)} className="w-full bg-white shadow border border-slate-200 pointer-events-none" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 py-20">
                  <FileText size={48} className="opacity-20 mb-4" />
                  <p className="text-sm">No document uploaded yet</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/DocumentUploader.tsx', content, 'utf8');
console.log('DocumentUploader.tsx fixed - now uses correct storage key via DatabaseService.createDocument');
