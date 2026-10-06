import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Upload, Download, Pen, Move, X,
  RotateCcw, RotateCw, Crop, Sun, Contrast, Layers,
  Eraser, ZoomIn, ZoomOut, Send, Plus, CheckCircle2,
  Settings, RefreshCw, Eye,
  FolderOpen, Maximize2, Calendar, Stamp, Lock, Unlock
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as mammoth from 'mammoth';
import { getAltSCorporateStamp } from '../utils/stampGenerator';
import { COMPANY_TEMPLATES } from '../data/templates';
import { COMPANIES, CompanyBrand } from '../data/companies';
import { SmartDocument, SignatureRequest } from '../types';
import { DatabaseService } from '../services/dbService';

/* ─── Types ─────────────────────────────────────────────────────────── */
interface Sig {
  id: string;
  src: string;
  originalSrc: string;
  x: number; y: number;
  w: number; h: number;
  rotation: number;
  brightness: number;
  contrast: number;
  opacity: number;
  selected: boolean;
  bgRemoved: boolean;
  type?: 'signature' | 'stamp' | 'date';
}

const STORE_KEY = 'smartdoc_saved_signatures';
const getSaved = (): string[] => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
  catch { return []; }
};
const storeSig = (src: string) => {
  const e = getSaved();
  if (!e.includes(src)) localStorage.setItem(STORE_KEY, JSON.stringify([src, ...e].slice(0, 8)));
};

/* ─── Background Removal (canvas pixel manipulation) ─────────────────── */
async function removeBg(src: string, tolerance = 32): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = data.data;
      const bgR = d[0], bgG = d[1], bgB = d[2];
      for (let i = 0; i < d.length; i += 4) {
        const diff = Math.abs(d[i] - bgR) + Math.abs(d[i + 1] - bgG) + Math.abs(d[i + 2] - bgB);
        if (diff < tolerance * 3) {
          d[i + 3] = 0;
        }
      }
      ctx.putImageData(data, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.crossOrigin = 'anonymous';
    img.src = src;
  });
}

/* ─── Crop Helper ─────────────────────────────────────────────────────── */
function cropImage(src: string, rx: number, ry: number, rw: number, rh: number): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const sw = Math.max(10, img.width * rw);
      const sh = Math.max(10, img.height * rh);
      const canvas = document.createElement('canvas');
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, img.width * rx, img.height * ry, sw, sh, 0, 0, sw, sh);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = src;
  });
}

/* ─── Crop Modal Component ───────────────────────────────────────────── */
function CropModal({ src, onCrop, onCancel }: {
  src: string;
  onCrop: (rx: number, ry: number, rw: number, rh: number) => void;
  onCancel: () => void;
}) {
  const [sel, setSel] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const getRelative = (e: React.MouseEvent) => {
    const rect = imgRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const p = getRelative(e);
    setDragStart(p);
    setSel({ x: p.x, y: p.y, w: 0, h: 0 });
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return;
    const p = getRelative(e);
    setSel({
      x: Math.min(dragStart.x, p.x),
      y: Math.min(dragStart.y, p.y),
      w: Math.abs(p.x - dragStart.x),
      h: Math.abs(p.y - dragStart.y),
    });
  };
  const onMouseUp = () => setDragStart(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-5 max-w-lg w-full border border-slate-200">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Crop Signature Area</h3>
            <p className="text-xs text-slate-500">Drag to box the signature tightly</p>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700">
            <X size={16} />
          </button>
        </div>

        <div
          className="relative bg-slate-100 rounded-lg overflow-hidden cursor-crosshair select-none flex items-center justify-center p-2"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          <img ref={imgRef} src={src} alt="crop target" className="max-h-56 object-contain pointer-events-none" draggable={false} />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          {sel.w > 0 && sel.h > 0 && (
            <div
              className="absolute border-2 border-[#0052cc] bg-[#0052cc]/20 pointer-events-none shadow-sm"
              style={{
                left: `${sel.x * 100}%`,
                top: `${sel.y * 100}%`,
                width: `${sel.w * 100}%`,
                height: `${sel.h * 100}%`,
              }}
            />
          )}
        </div>

        <div className="flex gap-2.5 mt-4">
          <button onClick={onCancel} className="flex-1 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => onCrop(sel.x, sel.y, sel.w || 1, sel.h || 1)}
            className="flex-1 py-1.5 rounded-md bg-[#0052cc] text-white text-xs font-bold hover:bg-[#0065ff] shadow-sm"
          >
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Logical Document Signing Studio ─────────────────────────────────── */
/* ─── Logical Document Signing Studio ─────────────────────────────────── */
interface SignatureCenterProps {
  documents?: SmartDocument[];
  currentRole?: string;
  preselectedDocId?: string;
  onSignatureSuccess?: (doc?: unknown) => void;
  selectedTemplate?: string;
}

export const SignatureCenter: React.FC<SignatureCenterProps> = ({
  documents = [],
  preselectedDocId,
  onSignatureSuccess,
  selectedTemplate = 'offer_letter',
  currentRole = 'hr',
}) => {
  const targetDoc = documents.find(d => d.id === preselectedDocId);
  const isApproved = targetDoc?.status === 'signature_authorized' || targetDoc?.status === 'approved';
  const approvedBy = targetDoc?.approvalWorkflow?.steps.find(s => s.status === 'approved')?.roleName;
  const parsedVars = targetDoc?.variableValues?.variables ? JSON.parse(targetDoc.variableValues.variables) : {};
  const approverRoleStr = parsedVars.approver || approvedBy;
  
  let approverName = 'Authorized Signatory';
  let approverTitle = 'Authorized Representative';
  
  if (approverRoleStr?.toLowerCase().includes('siva') || approverRoleStr?.toLowerCase().includes('managing')) {
      approverName = 'Siva Kumar';
      approverTitle = 'Managing Director';
  } else if (approverRoleStr?.toLowerCase().includes('uma') || approverRoleStr?.toLowerCase().includes('board')) {
      approverName = 'Uma Mageshwari';
      approverTitle = 'Board of Director';
  }
  // Document state
  const [docPages, setDocPages] = useState<string[]>([]);
  const [hasUploadedDoc, setHasUploadedDoc] = useState(false);
  const [docName, setDocName] = useState('Offer_Letter_Vrutika_Prajapati.pdf');
  const [currentPage, setCurrentPage] = useState(0);
  const [docLoading, setDocLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  // ── Request Signature dialog state
  const [showReqSigDialog, setShowReqSigDialog] = useState(false);
  const [reqSigSelection, setReqSigSelection] = useState<'siva_kumar' | 'uma_mageshwari' | 'both'>('siva_kumar');
  const [reqSivaEmail, setReqSivaEmail] = useState('');
  const [reqUmaEmail, setReqUmaEmail] = useState('');
  const [reqSigSent, setReqSigSent] = useState(false);
  // Track live signature requests for this document
  const [docSigRequests, setDocSigRequests] = useState<SignatureRequest[]>([]);

  useEffect(() => {
    const reload = () => {
      if (targetDoc?.id) {
        setDocSigRequests(DatabaseService.getRequestsForDocument(targetDoc.id));
      }
    };
    reload();
    return DatabaseService.subscribe(reload);
  }, [targetDoc?.id]);

  useEffect(() => {
    if (targetDoc?.variableValues?.uploadedImages) {
      try {
        const parsedPages = JSON.parse(targetDoc.variableValues.uploadedImages);
        if (parsedPages && parsedPages.length > 0) {
          setDocPages(parsedPages);
          setHasUploadedDoc(true);
          setDocName(targetDoc.title || 'Uploaded Document');
        }
      } catch (e) {
        console.error("Failed to parse uploaded images", e);
      }
    } else if (targetDoc?.variableValues?.pages && targetDoc.variableValues.isUploaded) {
      try {
        const parsedPages = JSON.parse(targetDoc.variableValues.pages);
        if (parsedPages && parsedPages.length > 0) {
          setDocPages(parsedPages);
          setHasUploadedDoc(true);
          setDocName(targetDoc.title || 'Uploaded Document');
        }
      } catch (e) {}
    }
  }, [targetDoc]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('alt_s');
  const selectedCompany = COMPANIES.find(c => c.id === selectedCompanyId) || COMPANIES[0];

  // Signatures state
  const [sigs, setSigs] = useState<Sig[]>([]);
  const [_savedSigs, setSavedSigs] = useState<string[]>(getSaved);
  const [cropModal, setCropModal] = useState<{ sigId: string; src: string } | null>(null);
  const [bgRemoving, setBgRemoving] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'upload' | 'draw' | 'stamp' | 'date'>('select');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Zoom
  const [zoom, setZoom] = useState(100);

  // Drag / Resize refs
  const dragging = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const resizing = useRef<{ id: string; sx: number; sy: number; sw: number; sh: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);

  // Drawing
  const drawRef = useRef<HTMLCanvasElement>(null);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawModalOpen, setDrawModalOpen] = useState(false);

  const updateSig = (id: string, patch: Partial<Sig>) =>
    setSigs(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const selectedSig = sigs.find(s => s.selected);

  /* ── Document Processing (PDF, DOCX, Image) ── */
  const processDoc = useCallback(async (file: File) => {
    setDocLoading(true);
    setError(null);
    setDocName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      if (ext === 'pdf') {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc =
          `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        const buf = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buf }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const vp = page.getViewport({ scale: 1.8 });
          const c = document.createElement('canvas');
          c.width = vp.width;
          c.height = vp.height;
          await page.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise;
          pages.push(c.toDataURL('image/png'));
        }
        setDocPages(pages);
        setHasUploadedDoc(true);
      } else if (ext === 'docx' || ext === 'doc') {
        const buf = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: buf });
        const div = document.createElement('div');
        div.style.cssText =
          'width:794px;min-height:1050px;background:white;padding:60px 72px;box-sizing:border-box;font-family:Calibri,Arial,sans-serif;font-size:14px;line-height:1.6;position:fixed;left:-9999px;top:0;';
        div.innerHTML = result.value;
        document.body.appendChild(div);
        const c = await html2canvas(div, { scale: 2, useCORS: true });
        document.body.removeChild(div);
        setDocPages([c.toDataURL('image/png')]);
        setHasUploadedDoc(true);
      } else {
        const src: string = await new Promise((res) => {
          const r = new FileReader();
          r.onload = e => res(e.target!.result as string);
          r.readAsDataURL(file);
        });
        setDocPages([src]);
        setHasUploadedDoc(true);
      }
      setCurrentPage(0);
    } catch (err: unknown) {
      setError(`Could not process document: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDocLoading(false);
    }
  }, []);

  const onDocInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processDoc(f);
  };

  /* ── Add Signature ── */
  const addSig = (src: string, type: 'signature' | 'stamp' | 'date' = 'signature', signatoryRole?: string) => {
    if (type === 'signature' && signatoryRole && targetDoc) {
      DatabaseService.recordSignaturePlacement(targetDoc.id, signatoryRole, 'Suresh Kumar');
    }
    if (type === 'signature') {
      storeSig(src);
      setSavedSigs(getSaved());
    }
    setSigs(prev => [
      ...prev.map(s => ({ ...s, selected: false })),
      {
        id: `sig-${Date.now()}`,
        src,
        originalSrc: src,
        x: 480,
        y: 840,
        w: type === 'stamp' ? 140 : 180,
        h: type === 'stamp' ? 60 : 75,
        rotation: 0,
        brightness: 100,
        contrast: 100,
        opacity: 100,
        selected: true,
        bgRemoved: false,
        type,
      }
    ]);
  };

  const onSigInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => addSig(ev.target!.result as string, 'signature');
    r.readAsDataURL(f);
  };

  /* ── Date Stamp ── */
  const addDateStamp = () => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d')!;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#0052cc';
    ctx.fillText(`Signed: ${today}`, 10, 38);
    addSig(canvas.toDataURL('image/png'), 'date');
  };

  /* ── Official Stamp ── */
  const addOfficialStamp = () => {
    addSig(getAltSCorporateStamp(), 'stamp');
  };

  /* ── Effects ── */
  const handleRemoveBg = async (sig: Sig) => {
    setBgRemoving(sig.id);
    const newSrc = await removeBg(sig.bgRemoved ? sig.originalSrc : sig.src);
    updateSig(sig.id, { src: newSrc, bgRemoved: !sig.bgRemoved });
    setBgRemoving(null);
  };

  const resetSig = (sig: Sig) => {
    updateSig(sig.id, {
      src: sig.originalSrc,
      bgRemoved: false,
      rotation: 0,
      brightness: 100,
      contrast: 100,
      opacity: 100
    });
  };

  const handleCrop = async (rx: number, ry: number, rw: number, rh: number) => {
    if (!cropModal) return;
    const cropped = await cropImage(cropModal.src, rx, ry, rw, rh);
    updateSig(cropModal.sigId, { src: cropped });
    setCropModal(null);
  };

  /* ── Hand-Draw ── */
  const startDraw = (e: React.MouseEvent) => {
    if (!drawRef.current) return;
    setDrawing(true);
    const r = drawRef.current.getBoundingClientRect();
    lastPt.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const draw = (e: React.MouseEvent) => {
    if (!drawing || !drawRef.current || !lastPt.current) return;
    const r = drawRef.current.getBoundingClientRect();
    const curr = { x: e.clientX - r.left, y: e.clientY - r.top };
    const ctx = drawRef.current.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(lastPt.current.x, lastPt.current.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.strokeStyle = '#091e42';
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPt.current = curr;
  };
  const endDraw = () => setDrawing(false);
  const clearDraw = () => {
    const ctx = drawRef.current?.getContext('2d');
    if (ctx && drawRef.current) ctx.clearRect(0, 0, drawRef.current.width, drawRef.current.height);
  };
  const useDraw = () => {
    if (!drawRef.current) return;
    addSig(drawRef.current.toDataURL('image/png'), 'signature');
    setDrawModalOpen(false);
    clearDraw();
  };

  /* ── Drag & Resize ── */
  const onSigMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sig = sigs.find(s => s.id === id);
    if (!sig || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    dragging.current = { id, ox: e.clientX - r.left - sig.x, oy: e.clientY - r.top - sig.y };
    setSigs(prev => prev.map(s => ({ ...s, selected: s.id === id })));
  };

  const onResizeDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sig = sigs.find(s => s.id === id);
    if (!sig) return;
    resizing.current = { id, sx: e.clientX, sy: e.clientY, sw: sig.w, sh: sig.h };
  };

  const onCanvasMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    if (dragging.current) {
      const { id, ox, oy } = dragging.current;
      const sig = sigs.find(s => s.id === id);
      const nx = Math.max(0, Math.min(e.clientX - r.left - ox, r.width - (sig?.w || 0)));
      const ny = Math.max(0, Math.min(e.clientY - r.top - oy, r.height - (sig?.h || 0)));
      updateSig(id, { x: nx, y: ny });
    }
    if (resizing.current) {
      const { id, sx, sy, sw, sh } = resizing.current;
      updateSig(id, {
        w: Math.max(40, sw + e.clientX - sx),
        h: Math.max(20, sh + e.clientY - sy)
      });
    }
  };

  const onCanvasUp = () => {
    dragging.current = null;
    resizing.current = null;
  };

  /* ── Export to PDF ── */
  const handleDownload = async () => {
    if (!canvasRef.current) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const c = await html2canvas(canvasRef.current, { scale: 2, useCORS: true });
    pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
    pdf.save(`Signed_${docName.replace(/\.[^/.]+$/, "")}.pdf`);
    onSignatureSuccess?.({});
  };

  /* ── Render Document Template ── */
  const handleApproveFromViewer = async () => {
    if (!targetDoc) return;
    try {
      // Find the pending step for this manager
      const stepIndex = targetDoc.approvalWorkflow?.steps.findIndex(s => s.status === 'pending');
      if (stepIndex !== undefined && stepIndex !== -1) {
        const stepNum = targetDoc.approvalWorkflow.steps[stepIndex].stepNumber;
        DatabaseService.updateApprovalStatus(
          targetDoc.id,
          stepNum,
          'approved',
          'Approved & Unlocked via Signature Viewer',
          currentRole === 'siva_kumar' ? 'Siva Kumar' : 'Uma Mageshwari',
          currentRole as any
        );
        if (onSignatureSuccess) onSignatureSuccess();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to approve and unlock.');
    }
  };

  const renderTemplateBody = () => {
    // If we have saved HTML content, use it!
    if (targetDoc?.variableValues?.content) {
      return (
        <div
          contentEditable={false} // Prevent editing of approved docs
          className="outline-none text-[13px] leading-relaxed min-h-[500px]"
          dangerouslySetInnerHTML={{ __html: targetDoc.variableValues.content }}
        />
      );
    }

    // Fallback to generating from template (should rarely happen now)
    const templateKey = targetDoc?.category || selectedTemplate;

    // Check if templateKey matches any company template ID
    const tpl = COMPANY_TEMPLATES.find(t => t.id === templateKey) ||
      (templateKey === 'employment_agreement' ? COMPANY_TEMPLATES.find(t => t.id === 'appointment_solution_architect') : null) ||
      (templateKey === 'contractor_agreement' ? COMPANY_TEMPLATES.find(t => t.id === 'contractor_offer') : null) ||
      (templateKey === 'nda_policy' ? COMPANY_TEMPLATES.find(t => t.id === 'asset_acknowledgment') : null) ||
      COMPANY_TEMPLATES[0];

    return (
      <div
        contentEditable
        suppressContentEditableWarning
        className="outline-none text-[13px] leading-relaxed cursor-text min-h-[500px]"
        dangerouslySetInnerHTML={{ __html: tpl.content }}
      />
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#f4f5f7] overflow-hidden select-none font-sans">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
        onChange={onDocInput}
        className="hidden"
      />
      <input
        ref={sigInputRef}
        type="file"
        accept="image/*"
        onChange={onSigInput}
        className="hidden"
      />

      {/* ─── Logical Top Subheader Bar ─── */}
      <div className="h-11 border-b border-[#ebecf0] px-5 flex items-center justify-between bg-white z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 border-r border-slate-200 pr-3">
            <span className="text-[10px] text-slate-500 font-medium">COMPANY:</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded px-1.5 py-0.5 outline-none hover:border-indigo-400"
            >
              {COMPANIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <span className="text-[11px] text-[#6b778c] font-medium">
            Human Resources / Documents & Signing
          </span>
          <span className="text-slate-300">/</span>
          <span className="text-[13px] font-bold text-[#172b4d]">
            {hasUploadedDoc ? docName : 'Official Employment Offer Letter'}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Ready for Signing
          </span>
        </div>

        {/* Quick Toolbar Action Buttons */}
        <div className="flex items-center gap-2">
          {currentRole === 'hr' && targetDoc && (
            <button
              onClick={() => { setShowReqSigDialog(true); setReqSigSent(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors shadow-sm"
            >
              <Send size={12} />
              Request Signature
            </button>
          )}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-semibold transition-colors shadow-xs border ${
              isPreviewMode 
                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Eye size={14} />
            <span>{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>
          {isApproved && (
            <button
              onClick={handleDownload}
              className="bg-[#0052cc] hover:bg-[#0065ff] text-white text-[12px] font-semibold px-4 py-1.5 rounded shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Download size={14} />
              <span>Finish &amp; Save</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Request Signature Dialog ─── */}
      {showReqSigDialog && targetDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Send size={18} className="text-indigo-600" />
                <h3 className="font-bold text-slate-800">Request Signature</h3>
              </div>
              <button onClick={() => setShowReqSigDialog(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            {reqSigSent ? (
              <div className="p-6 text-center space-y-4">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
                <div>
                  <p className="font-bold text-slate-900 text-lg">Request Sent!</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {reqSigSelection === 'siva_kumar' ? 'Siva Kumar' :
                     reqSigSelection === 'uma_mageshwari' ? 'Uma Mageshwari' : 'Both signers'}
                    {' '}will see the request in their Signature Requests portal.
                  </p>
                </div>
                <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
                  Once they approve, they'll generate an OTP. Ask them to share it with you, then enter it in the <strong>Signature Requests</strong> tab to unlock the signature.
                </p>
                <button onClick={() => setShowReqSigDialog(false)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm">
                  Close
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Who should sign this document?</p>
                  <div className="space-y-2">
                    {[
                      { val: 'siva_kumar', label: 'Siva Kumar', subtitle: 'Managing Director' },
                      { val: 'uma_mageshwari', label: 'Uma Mageshwari', subtitle: 'Director' },
                      { val: 'both', label: 'Both Signatories', subtitle: 'Siva Kumar & Uma Mageshwari' }
                    ].map(opt => (
                      <label key={opt.val} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        reqSigSelection === opt.val ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                        <input type="radio" name="signer" value={opt.val} checked={reqSigSelection === opt.val}
                          onChange={() => setReqSigSelection(opt.val as any)} className="accent-indigo-600" />
                        <div>
                          <p className="font-bold text-sm text-slate-800">{opt.label}</p>
                          <p className="text-xs text-slate-500">{opt.subtitle}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {(reqSigSelection === 'siva_kumar' || reqSigSelection === 'both') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Siva Kumar's Email</label>
                    <input type="email" value={reqSivaEmail} onChange={e => setReqSivaEmail(e.target.value)}
                      placeholder="siva@example.com"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                )}
                {(reqSigSelection === 'uma_mageshwari' || reqSigSelection === 'both') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Uma Mageshwari's Email</label>
                    <input type="email" value={reqUmaEmail} onChange={e => setReqUmaEmail(e.target.value)}
                      placeholder="uma@example.com"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
                  </div>
                )}

                <button
                  onClick={() => {
                    try {
                      if (reqSigSelection === 'siva_kumar' || reqSigSelection === 'both') {
                        if (!reqSivaEmail.trim()) { alert("Please enter Siva Kumar's email."); return; }
                        DatabaseService.createSignatureRequest(targetDoc.id, 'siva_kumar', reqSivaEmail.trim(), 'HR Admin');
                      }
                      if (reqSigSelection === 'uma_mageshwari' || reqSigSelection === 'both') {
                        if (!reqUmaEmail.trim()) { alert("Please enter Uma Mageshwari's email."); return; }
                        DatabaseService.createSignatureRequest(targetDoc.id, 'uma_mageshwari', reqUmaEmail.trim(), 'HR Admin');
                      }
                      setReqSigSent(true);
                    } catch (e) {
                      alert('Error: ' + (e as any).message);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Send size={15} />
                  Send Signature Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FULLY SCROLLABLE DOCUMENT CANVAS ─── */}
      <div
        className="flex-1 overflow-y-auto overflow-x-auto flex flex-col items-center py-6 px-4 min-h-0 bg-[#f4f5f7] custom-scrollbar"
        style={{
          backgroundImage: 'radial-gradient(#dfe1e6 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Document A4 Page Container */}
        <div
          ref={canvasRef}
          onMouseMove={onCanvasMove}
          onMouseUp={onCanvasUp}
          onMouseLeave={onCanvasUp}
          className="relative bg-white shadow-[0_8px_30px_rgba(9,30,66,0.12)] border border-[#dfe1e6] rounded-xs shrink-0 mb-32 transition-transform duration-150"
          style={{
            width: '794px',
            minHeight: '1050px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {docLoading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center z-30">
              <div className="w-9 h-9 border-3 border-[#0052cc] border-t-transparent rounded-full animate-spin mb-2.5" />
              <p className="text-xs font-bold text-[#172b4d]">Rendering document pages...</p>
            </div>
          )}

          {/* Document Content View */}
          {hasUploadedDoc ? (
            <div className="w-full h-full relative">
              <img
                src={docPages[currentPage]}
                alt="Uploaded Document"
                className="w-full h-auto block pointer-events-none"
                draggable={false}
              />
            </div>
          ) : (
            <div className="w-full h-full p-12 text-[#172b4d] flex flex-col justify-between select-text">
              <div>
                {/* Official Letterhead Header */}
                <div className="mb-4">
                  <div className="flex items-end mb-8 w-full relative">
                    {/* Company Logo */}
                    <img
                      src={selectedCompany.logoUrl}
                      alt={selectedCompany.name}
                      className="max-h-[75px] max-w-[260px] object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />

                    {/* Right Side: Address & Thick Bar */}
                    <div className="flex flex-col flex-1 max-h-[75px] justify-between ml-2">
                      <div className="flex justify-end w-full">
                        <div className="border-l-[1.5px] border-slate-400 pl-2.5 py-0.5 text-[10px] leading-[1.3] text-slate-800 text-left font-sans">
                          <p className="font-bold text-[11px] uppercase text-slate-900 border-b-[1px] border-slate-400 pb-[3px] mb-[3px]">{selectedCompany.headerText}</p>
                          <div className="whitespace-pre-line text-slate-800">{selectedCompany.address}</div>
                        </div>
                      </div>
                      
                      {/* Solid Dark Separator Bar matching PDF */}
                      <div className="h-[14px] w-full rounded-l-3xl mb-[4px]" style={{ backgroundColor: '#474a51' }}></div>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                {renderTemplateBody()}
              </div>

              {/* Signature Acceptance Box */}
              <div className="pt-16 pb-6 flex justify-between items-end border-t border-slate-200 mt-12">
                <div>
                  <p className="font-bold text-[12px] text-slate-800">{approverName}</p>
                  <p className="text-[11px] text-slate-500">{approverTitle} - {selectedCompany.name}</p>
                  <div className="mt-1.5 text-[9.5px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                    ✓ Verified Corporate Seal
                  </div>
                </div>

                <div className="w-64 text-right">
                  <div className="h-16 border-b border-dashed border-slate-400 flex items-center justify-center text-slate-400 text-xs italic">
                    {sigs.length === 0 ? 'Drag signature into this box' : ''}
                  </div>
                  <p className="font-bold text-[12px] text-slate-800 mt-1">Candidate Signature & Acceptance</p>
                  <p className="text-[10px] text-slate-500">Sign & date above</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Draggable Signatures Overlay ── */}
          {sigs.map(sig => (
            <div
              key={sig.id}
              style={{
                position: 'absolute',
                left: sig.x,
                top: sig.y,
                width: sig.w,
                height: sig.h,
                transform: `rotate(${sig.rotation}deg)`,
                transformOrigin: 'center center',
                outline: (sig.selected && !isPreviewMode) ? '2px solid #0052cc' : 'none',
                outlineOffset: 3,
              }}
              className="group"
            >
              <img
                src={sig.src}
                alt="Signature overlay"
                style={{
                  filter: `brightness(${sig.brightness}%) contrast(${sig.contrast}%) opacity(${sig.opacity}%)`,
                }}
                className="w-full h-full object-contain cursor-grab active:cursor-grabbing pointer-events-auto"
                onMouseDown={e => onSigMouseDown(e, sig.id)}
                draggable={false}
              />

              {/* Delete Button */}
              <button
                onMouseDown={e => {
                  e.stopPropagation();
                  setSigs(p => p.filter(s => s.id !== sig.id));
                }}
                className="absolute -top-3 -right-3 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow"
                title="Remove signature"
              >
                <X size={11} />
              </button>

              {/* Resize Handle */}
              <div
                onMouseDown={e => onResizeDown(e, sig.id)}
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#0052cc] rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow pointer-events-auto"
                title="Resize signature"
              />
            </div>
          ))}
        </div>

        {/* ── Signature Adjustment Inspector (Opens beside selected sig) ── */}
        {selectedSig && !isPreviewMode && (
          <div className="fixed top-28 right-6 w-68 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgba(9,30,66,0.18)] border border-[#dfe1e6] p-3.5 z-40 space-y-3">
            <div className="flex items-center justify-between border-b border-[#ebecf0] pb-2">
              <div className="flex items-center gap-1.5">
                <Settings size={14} className="text-[#0052cc]" />
                <span className="font-bold text-[12.5px] text-[#172b4d]">Signature Adjustments</span>
              </div>
              <button
                onClick={() => resetSig(selectedSig)}
                className="p-1 hover:bg-[#ebecf0] rounded text-[#6b778c] hover:text-[#172b4d]"
                title="Reset effects"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRemoveBg(selectedSig)}
                disabled={bgRemoving === selectedSig.id}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded text-[11px] font-semibold border transition-all ${
                  selectedSig.bgRemoved
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-[#fafbfc] border-[#dfe1e6] hover:bg-[#ebecf0] text-[#172b4d]'
                }`}
              >
                {bgRemoving === selectedSig.id ? (
                  <div className="w-3 h-3 border-2 border-[#0052cc] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Eraser size={12} className="text-[#0052cc]" />
                )}
                <span>{selectedSig.bgRemoved ? 'Restore BG' : 'Remove BG'}</span>
              </button>

              <button
                onClick={() => setCropModal({ sigId: selectedSig.id, src: selectedSig.src })}
                className="flex items-center justify-center gap-1 py-1.5 px-2 rounded text-[11px] font-semibold border border-[#dfe1e6] bg-[#fafbfc] hover:bg-[#ebecf0] text-[#172b4d]"
              >
                <Crop size={12} className="text-[#0052cc]" />
                <span>Crop Area</span>
              </button>
            </div>

            {/* Rotation */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-[#42526e] mb-1">
                <span>Rotation</span>
                <span>{selectedSig.rotation}°</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateSig(selectedSig.id, { rotation: selectedSig.rotation - 90 })}
                  className="p-1 border border-[#dfe1e6] rounded hover:bg-[#ebecf0] text-[#42526e]"
                  title="Rotate -90°"
                >
                  <RotateCcw size={12} />
                </button>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={selectedSig.rotation}
                  onChange={e => updateSig(selectedSig.id, { rotation: Number(e.target.value) })}
                  className="flex-1 h-1.5 accent-[#0052cc] cursor-pointer"
                />
                <button
                  onClick={() => updateSig(selectedSig.id, { rotation: selectedSig.rotation + 90 })}
                  className="p-1 border border-[#dfe1e6] rounded hover:bg-[#ebecf0] text-[#42526e]"
                  title="Rotate +90°"
                >
                  <RotateCw size={12} />
                </button>
              </div>
            </div>

            {/* Brightness */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-[#42526e] mb-0.5">
                <span className="flex items-center gap-1"><Sun size={11} /> Brightness</span>
                <span>{selectedSig.brightness}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={300}
                value={selectedSig.brightness}
                onChange={e => updateSig(selectedSig.id, { brightness: Number(e.target.value) })}
                className="w-full h-1.5 accent-[#0052cc] cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-[#42526e] mb-0.5">
                <span className="flex items-center gap-1"><Contrast size={11} /> Contrast</span>
                <span>{selectedSig.contrast}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={300}
                value={selectedSig.contrast}
                onChange={e => updateSig(selectedSig.id, { contrast: Number(e.target.value) })}
                className="w-full h-1.5 accent-[#0052cc] cursor-pointer"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-[#42526e] mb-0.5">
                <span className="flex items-center gap-1"><Layers size={11} /> Ink Blend (Opacity)</span>
                <span>{selectedSig.opacity}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={selectedSig.opacity}
                onChange={e => updateSig(selectedSig.id, { opacity: Number(e.target.value) })}
                className="w-full h-1.5 accent-[#0052cc] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Floating Whiteboard Action Palette (Fixed Center Bottom) ─── */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center">
        <div className="bg-white rounded-xl shadow-[0_6px_24px_rgba(9,30,66,0.16)] border border-[#dfe1e6] px-3 py-1.5 flex items-center gap-2.5">
          {/* Hand Move Tool */}
          <button
            onClick={() => setActiveTool('select')}
            className={`p-1.5 rounded-lg transition-colors ${
              activeTool === 'select' ? 'bg-[#091e42] text-white' : 'text-[#42526e] hover:bg-[#ebecf0]'
            }`}
            title="Move Tool"
          >
            <Move size={15} />
          </button>

          <>
              <div className="h-5 w-px bg-[#dfe1e6]" />

              {/* Signatures */}
              {currentRole === 'hr' && (
                <div className="flex items-center gap-2 mr-2">
                  <span className="font-bold text-[10px] text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Signature Available</span>
                </div>
              )}

              {/* Show Siva signature if approved by Siva (HR sees it locked if not approved) */}
              {currentRole === 'hr' && (
                <button
                  onClick={() => {
                    const isAuth = targetDoc?.authorizations?.some(a => (a.signatoryRole === 'siva_kumar' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Siva Kumar') && !a.usedAt);
                    if (!isAuth) return;
                    addSig('/sign1.jpg', 'signature', 'siva_kumar');
                  }}
                  disabled={!(targetDoc?.authorizations?.some(a => (a.signatoryRole === 'siva_kumar' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Siva Kumar') && !a.usedAt))}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11.5px] transition-colors ${
                    !(targetDoc?.authorizations?.some(a => (a.signatoryRole === 'siva_kumar' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Siva Kumar') && !a.usedAt))
                      ? 'text-slate-400 bg-slate-50 cursor-not-allowed border border-slate-200' 
                      : 'text-[#172b4d] hover:bg-[#ebecf0]'
                  }`}
                  title={!(targetDoc?.authorizations?.some(a => (a.signatoryRole === 'siva_kumar' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Siva Kumar') && !a.usedAt)) ? "Locked: Awaiting Manager Approval or Signature Already Used" : "Place Siva Kumar Signature"}
                >
                  {!(targetDoc?.authorizations?.some(a => (a.signatoryRole === 'siva_kumar' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Siva Kumar') && !a.usedAt)) ? <Lock size={12} className="text-rose-500" /> : <Pen size={14} className="text-[#0052cc]" />}
                  <span>Siva Kumar</span>
                </button>
              )}

              {/* Show Uma signature if approved by Uma (HR sees it locked if not approved) */}
              {currentRole === 'hr' && (
                <button
                  onClick={() => {
                    const isAuth = targetDoc?.authorizations?.some(a => (a.signatoryRole === 'uma_mageshwari' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Uma Mageshwari') && !a.usedAt);
                    if (!isAuth) return;
                    addSig('/sign2.jpg', 'signature', 'uma_mageshwari');
                  }}
                  disabled={!(targetDoc?.authorizations?.some(a => (a.signatoryRole === 'uma_mageshwari' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Uma Mageshwari') && !a.usedAt))}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11.5px] transition-colors ${
                    !(targetDoc?.authorizations?.some(a => (a.signatoryRole === 'uma_mageshwari' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Uma Mageshwari') && !a.usedAt))
                      ? 'text-slate-400 bg-slate-50 cursor-not-allowed border border-slate-200' 
                      : 'text-[#172b4d] hover:bg-[#ebecf0]'
                  }`}
                  title={!(targetDoc?.authorizations?.some(a => (a.signatoryRole === 'uma_mageshwari' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Uma Mageshwari') && !a.usedAt)) ? "Locked: Awaiting Manager Approval or Signature Already Used" : "Place Uma Mageshwari Signature"}
                >
                  {!(targetDoc?.authorizations?.some(a => (a.signatoryRole === 'uma_mageshwari' || a.signatoryRole === 'Authorized Signatory' || a.signatoryName === 'Uma Mageshwari') && !a.usedAt)) ? <Lock size={12} className="text-rose-500" /> : <Pen size={14} className="text-[#0052cc]" />}
                  <span>Uma Mageshwari</span>
                </button>
              )}

              {/* Corporate Seal */}
              {currentRole === 'hr' && (
                <button
                  onClick={addOfficialStamp}
                  className="flex items-center gap-1 px-2.5 py-1 text-[#172b4d] hover:bg-[#ebecf0] rounded-lg font-semibold text-[11.5px] transition-colors"
                  title="Stamp Corporate Seal"
                >
                  <Stamp size={14} className="text-purple-600" />
                  <span>Corporate Seal</span>
                </button>
              )}

              <div className="h-5 w-px bg-[#dfe1e6]" />

              {/* Finish & Save */}
              <button
                onClick={handleDownload}
                className="bg-[#0052cc] hover:bg-[#0065ff] active:bg-[#0747a6] text-white font-bold text-[11.5px] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                title="Finish & Save Document"
              >
                <Download size={14} />
                <span>Finish & Save</span>
              </button>
            </>
          
        </div>
      </div>

      {/* ─── Bottom Right Zoom Controls ─── */}
      <div className="fixed bottom-5 right-5 z-30 flex flex-col items-center bg-white rounded-lg shadow-[0_4px_16px_rgba(9,30,66,0.12)] border border-[#dfe1e6] overflow-hidden text-[#42526e]">
        <button
          onClick={() => setZoom(100)}
          className="p-1.5 hover:bg-[#ebecf0] transition-colors border-b border-[#ebecf0]"
          title="Fit to frame (100%)"
        >
          <Maximize2 size={13} />
        </button>
        <button
          onClick={() => setZoom(z => Math.min(160, z + 10))}
          className="p-1.5 hover:bg-[#ebecf0] transition-colors border-b border-[#ebecf0]"
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>
        <div className="px-1.5 py-0.5 text-[10px] font-bold text-[#172b4d] border-b border-[#ebecf0]">
          {zoom}%
        </div>
        <button
          onClick={() => setZoom(z => Math.max(60, z - 10))}
          className="p-1.5 hover:bg-[#ebecf0] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>
      </div>

      {/* ─── Hand-Draw Signature Modal ─── */}
      {drawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-5 max-w-md w-full border border-[#dfe1e6]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[#172b4d] text-sm">Hand-Draw Digital Signature</h3>
              <button
                onClick={() => setDrawModalOpen(false)}
                className="p-1 hover:bg-[#ebecf0] rounded text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>
            <div className="border-2 border-dashed border-[#dfe1e6] rounded-lg overflow-hidden bg-[#fafbfc] mb-3">
              <canvas
                ref={drawRef}
                width={380}
                height={150}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                className="w-full cursor-crosshair bg-white"
                style={{ touchAction: 'none' }}
              />
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={clearDraw}
                className="flex-1 py-1.5 rounded-md border border-[#dfe1e6] text-xs font-semibold text-[#42526e] hover:bg-[#ebecf0]"
              >
                Clear
              </button>
              <button
                onClick={useDraw}
                className="flex-1 py-1.5 rounded-md bg-[#0052cc] text-white text-xs font-bold hover:bg-[#0065ff] shadow-sm"
              >
                Place Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Crop Signature Modal ─── */}
      {cropModal && (
        <CropModal
          src={cropModal.src}
          onCrop={handleCrop}
          onCancel={() => setCropModal(null)}
        />
      )}
    </div>
  );
};
