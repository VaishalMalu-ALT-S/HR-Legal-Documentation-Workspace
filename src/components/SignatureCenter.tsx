import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Upload, Download, Pen, Move, X, UploadCloud,
  RotateCcw, RotateCw, Crop, Sun, Contrast, Layers,
  Eraser, ZoomIn, ZoomOut, Send, Plus, CheckCircle2,
  Settings, RefreshCw, Eye,
  FolderOpen, Maximize2, Calendar, Stamp, Lock, Unlock,
  Bookmark, FileText, Clock
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
      <div className="bg-white rounded-lg shadow-md p-5 max-w-lg w-full border border-slate-200">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-bold text-brand-900 text-sm">Crop Signature Area</h3>
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
              className="absolute border-2 border-brand-900 bg-brand-900/20 pointer-events-none shadow-sm"
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
            className="flex-1 py-1.5 rounded-md bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 shadow-sm"
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
  // Document state & Draft management
  const [currentDocId, setCurrentDocId] = useState<string | undefined>(preselectedDocId || targetDoc?.id);
  const [initializedDocId, setInitializedDocId] = useState<string | null>(null);
  const [docPages, setDocPages] = useState<string[]>([]);
  const [hasUploadedDoc, setHasUploadedDoc] = useState(false);
  const [docName, setDocName] = useState('Offer_Letter_Vrutika_Prajapati.pdf');
  const [currentPage, setCurrentPage] = useState(0);
  const [docLoading, setDocLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  // Draft & Save Status
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Request Signature dialog state
  const [showReqSigDialog, setShowReqSigDialog] = useState(false);
  const [reqSigSelection, setReqSigSelection] = useState<'siva_kumar' | 'uma_mageshwari' | 'both'>('siva_kumar');
  const [reqSivaEmail, setReqSivaEmail] = useState('');
  const [reqUmaEmail, setReqUmaEmail] = useState('');
  const [reqSigSent, setReqSigSent] = useState(false);
  // Track live signature requests for this document
  const [docSigRequests, setDocSigRequests] = useState<SignatureRequest[]>([]);

  useEffect(() => {
    const docIdToTrack = currentDocId || targetDoc?.id;
    const reload = () => {
      if (docIdToTrack) {
        setDocSigRequests(DatabaseService.getRequestsForDocument(docIdToTrack));
      }
    };
    reload();
    return DatabaseService.subscribe(reload);
  }, [currentDocId, targetDoc?.id]);

  useEffect(() => {
    if (preselectedDocId) {
      setCurrentDocId(preselectedDocId);
    }
  }, [preselectedDocId]);

  useEffect(() => {
    if (!targetDoc) return;
    if (initializedDocId === targetDoc.id) return;

    setInitializedDocId(targetDoc.id);
    setCurrentDocId(targetDoc.id);
    if (targetDoc.companyId) {
      setSelectedCompanyId(targetDoc.companyId);
    }
    if (targetDoc.title) {
      setDocName(targetDoc.title);
    }
    if (targetDoc.updatedAt || targetDoc.createdAt) {
      const d = new Date(targetDoc.updatedAt || targetDoc.createdAt);
      setLastSavedTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    if (targetDoc.variableValues?.uploadedImages) {
      try {
        const parsedPages = JSON.parse(targetDoc.variableValues.uploadedImages);
        if (parsedPages && parsedPages.length > 0) {
          setDocPages(parsedPages);
          setHasUploadedDoc(true);
        }
      } catch (e) {
        console.error("Failed to parse uploaded images", e);
      }
    } else if (targetDoc.variableValues?.pages && (targetDoc.variableValues.isUploaded === 'true' || targetDoc.templateVersionId === 'uploaded')) {
      try {
        const parsedPages = JSON.parse(targetDoc.variableValues.pages);
        if (parsedPages && parsedPages.length > 0) {
          setDocPages(parsedPages);
          setHasUploadedDoc(true);
        }
      } catch (e) {}
    }

    if (targetDoc.variableValues?.sigs) {
      try {
        const parsedSigs = JSON.parse(targetDoc.variableValues.sigs);
        if (Array.isArray(parsedSigs)) {
          setSigs(parsedSigs);
        }
      } catch (e) {}
    }

    if (targetDoc.variableValues?.signatureRequirements) {
      try {
        const parsedReq = JSON.parse(targetDoc.variableValues.signatureRequirements);
        if (parsedReq.signerRole) setReqSigSelection(parsedReq.signerRole);
        if (parsedReq.sivaEmail) setReqSivaEmail(parsedReq.sivaEmail);
        if (parsedReq.umaEmail) setReqUmaEmail(parsedReq.umaEmail);
      } catch (e) {}
    }

    setIsDirty(false);
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

  const updateSig = (id: string, patch: Partial<Sig>) => {
    setIsDirty(true);
    setSigs(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  };

  const selectedSig = sigs.find(s => s.selected);

  /* ── Save Draft Handler ── */
  const handleSaveDraft = async (silent = false): Promise<SmartDocument | null> => {
    try {
      setIsSaving(true);
      setSaveError(null);

      const effectiveTitle = hasUploadedDoc ? docName : (targetDoc?.title || 'Employment Document Draft');
      let category = targetDoc?.category || 'appointment_letter';
      const lower = effectiveTitle.toLowerCase();
      if (lower.includes('asset')) category = 'asset_form';
      else if (lower.includes('contract') || lower.includes('contractor')) category = 'contractor_offer';
      else if (lower.includes('bond')) category = 'bond_agreement';
      else if (lower.includes('acknowledg')) category = 'acknowledgement_form';

      // Capture content from contentEditable if present
      const contentEl = canvasRef.current?.querySelector('[contenteditable]');
      const renderedHtml = contentEl ? contentEl.innerHTML : (targetDoc?.variableValues?.content || '');

      const draftPayload: Partial<SmartDocument> & { title: string } = {
        title: effectiveTitle,
        category: category as any,
        companyId: selectedCompanyId,
        personName: targetDoc?.personName || 'Candidate / Employee',
        personEmail: targetDoc?.personEmail || 'hr@alt-s.com',
        personRole: targetDoc?.personRole || 'Employee',
        templateVersionId: targetDoc?.templateVersionId || (hasUploadedDoc ? 'uploaded' : selectedTemplate),
        templateVersionNumber: '1.0',
        status: 'draft',
        variableValues: {
          ...(targetDoc?.variableValues || {}),
          content: renderedHtml,
          uploadedImages: hasUploadedDoc && docPages.length > 0 ? JSON.stringify(docPages) : (targetDoc?.variableValues?.uploadedImages || ''),
          pages: hasUploadedDoc && docPages.length > 0 ? JSON.stringify(docPages) : (targetDoc?.variableValues?.pages || '[]'),
          isUploaded: hasUploadedDoc ? 'true' : 'false',
          originalFileName: docName,
          sigs: JSON.stringify(sigs),
          selectedCompanyId,
          signatureRequirements: JSON.stringify({
            signerRole: reqSigSelection,
            sivaEmail: reqSivaEmail,
            umaEmail: reqUmaEmail
          })
        },
        generatedAt: targetDoc?.generatedAt || new Date().toISOString(),
        generatedBy: 'HR Admin'
      };

      const saved = await DatabaseService.saveDraft(draftPayload, currentDocId);
      setCurrentDocId(saved.id);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(timeStr);
      setIsDirty(false);

      if (!silent) {
        setSaveFeedback(`Draft saved safely at ${timeStr}`);
        setTimeout(() => setSaveFeedback(null), 3500);
      }
      return saved;
    } catch (err: any) {
      console.error('Failed to save draft:', err);
      setSaveError(err.message || 'Failed to save changes. Please try again.');
      setTimeout(() => setSaveError(null), 5000);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  /* ── Open Request Signature (saves draft first if needed) ── */
  const handleOpenRequestSignature = async () => {
    // If unsaved or new, save draft first so we have a persistent document ID
    if (!currentDocId || isDirty) {
      const saved = await handleSaveDraft(true);
      if (!saved) return;
    }
    setShowReqSigDialog(true);
    setReqSigSent(false);
  };

  // Autosave when isDirty is true and we have content (debounced 3.5 seconds)
  useEffect(() => {
    if (!isDirty || (!hasUploadedDoc && sigs.length === 0 && !targetDoc)) return;
    const timer = setTimeout(() => {
      handleSaveDraft(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, [isDirty, docPages, sigs, selectedCompanyId]);

  // Unsaved changes warning before window close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

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
        setIsDirty(true);
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
        setIsDirty(true);
      } else {
        const src: string = await new Promise((res) => {
          const r = new FileReader();
          r.onload = e => res(e.target!.result as string);
          r.readAsDataURL(file);
        });
        setDocPages([src]);
        setHasUploadedDoc(true);
        setIsDirty(true);
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
    setIsDirty(true);
    if (type === 'signature' && signatoryRole && (currentDocId || targetDoc)) {
      DatabaseService.recordSignaturePlacement(currentDocId || targetDoc!.id, signatoryRole, localStorage.getItem('signhr_auth_name') || 'HR Admin');
    }
    if (type === 'signature') {
      storeSig(src);
      setSavedSigs(getSaved());
    }
    let yPos = 840;
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      const screenCenterY = window.innerHeight / 2;
      yPos = (screenCenterY - rect.top) / scale;
      yPos = Math.max(50, yPos);
    }

    setSigs(prev => [
      ...prev.map(s => ({ ...s, selected: false })),
      {
        id: `sig-${Date.now()}`,
        src,
        originalSrc: src,
        x: 400,
        y: yPos,
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
    try {
      setDocLoading(true);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      if (hasUploadedDoc && docPages.length > 1) {
        // Multi-page uploaded document: render all pages
        for (let i = 0; i < docPages.length; i++) {
          if (i > 0) pdf.addPage('a4', 'p');
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.src = docPages[i];
          });
          pdf.addImage(img, 'PNG', 0, 0, 210, 297);
        }
      } else {
        const c = await html2canvas(canvasRef.current, { scale: 2, useCORS: true });
        pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
      }
      
      pdf.save(`Signed_${docName.replace(/\.[^/.]+$/, "")}.pdf`);
      setSaveFeedback('PDF downloaded successfully.');
      setTimeout(() => setSaveFeedback(null), 3000);
      onSignatureSuccess?.({});
    } catch (err: any) {
      setSaveError(err.message || 'Error generating PDF');
      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setDocLoading(false);
    }
  };

  const handleFinalize = async () => {
    const docId = currentDocId || targetDoc?.id;
    if (!docId) return;
    try {
      const finalized = await DatabaseService.finalizeDocument(docId, 'HR Admin');
      setSaveFeedback(`Document ${finalized.documentNumber} Finalized! Status: Completed.`);
      setTimeout(() => setSaveFeedback(null), 4000);
      onSignatureSuccess?.({});
    } catch (e: any) {
      setSaveError(e.message || 'Failed to finalize document');
      setTimeout(() => setSaveError(null), 4000);
    }
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

    // If there is no uploaded doc and no content, this is an empty document signing session.
    // Instead of showing a fake template, we should prompt them to upload.
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-10 text-center mx-10 my-10">
        <div className="w-16 h-16 bg-brand-100 text-brand-900 rounded-full flex items-center justify-center mb-6">
          <UploadCloud size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Upload a Document to Sign</h3>
        <p className="text-sm text-slate-500 max-w-md mb-8">
          Upload a PDF or Word document that you want to prepare for signing. You can drag and drop fields, signature blocks, and date stamps.
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 bg-brand-900 text-white font-bold rounded-lg hover:bg-brand-800 transition-colors shadow-sm flex items-center gap-2"
        >
          <Upload size={18} />
          Browse Files
        </button>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#f4f5f7] overflow-hidden select-none font-sans">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*,.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
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

      {/* ─── Enterprise Workspace Subheader Bar ─── */}
      <div className="h-12 border-b border-slate-200 px-5 flex items-center justify-between bg-white z-20 shrink-0 shadow-2xs font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center space-x-2 border-r border-slate-200 pr-3 shrink-0">
            <span className="text-xs font-bold text-slate-800 tracking-tight">Signing Portal</span>
          </div>
          
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            HR &amp; Legal
          </span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="text-xs font-bold text-slate-900 truncate max-w-[240px] md:max-w-md">
            {hasUploadedDoc ? docName : (targetDoc?.title || 'Official Document')}
          </span>

          {/* WCAG AA Semantic Status Badge */}
          {(!targetDoc || targetDoc.status === 'draft') ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Draft
            </span>
          ) : targetDoc.status === 'pending_approval' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Signature Requested
            </span>
          ) : targetDoc.status === 'signature_authorized' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Ready for Signing
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
              <CheckCircle2 size={12} className="text-emerald-600" />
              Signed &amp; Sealed
            </span>
          )}

          {/* Last Saved Time Indicator */}
          {lastSavedTime && (
            <span className="text-xs text-slate-400 font-medium hidden lg:flex items-center gap-1 ml-1" title="Last saved time">
              <Clock size={12} className="text-slate-400" />
              {isDirty ? (
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Unsaved changes
                </span>
              ) : (
                <span className="text-slate-500">
                  Saved {lastSavedTime}
                </span>
              )}
            </span>
          )}
        </div>

        {/* 3-Tier Enterprise Action Buttons (Pill shaped like reference share/verify) */}
        <div className="flex items-center gap-2">
          {currentRole === 'hr' && (
            <>
              {/* Secondary Button: Save Draft */}
              <button
                type="button"
                onClick={() => handleSaveDraft(false)}
                disabled={isSaving}
                className="h-8.5 px-3.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
                title="Save current document state as a draft without requesting signatures"
              >
                {isSaving ? (
                  <RefreshCw size={13} className="animate-spin text-blue-600" />
                ) : (
                  <Bookmark size={13} className="text-slate-500" />
                )}
                <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
              </button>

              {/* Primary CTA: Request Signature */}
              <button
                type="button"
                onClick={handleOpenRequestSignature}
                className="h-8.5 px-4 rounded-full bg-[#162A45] hover:bg-[#0F172A] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer"
                title="Send document for signatory approval"
              >
                <Send size={13} />
                <span>Request Signature</span>
              </button>
            </>
          )}

          {/* Secondary Button: Preview */}
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`h-8.5 px-3.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-2xs border transition-all cursor-pointer ${
              isPreviewMode 
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Eye size={13} />
            <span>{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>

          {targetDoc?.status === 'completed' && (
            <span className="h-8.5 px-3.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>Cryptographically Sealed</span>
            </span>
          )}

          {currentRole === 'hr' && targetDoc?.status !== 'completed' && (targetDoc?.status === 'signed' || sigs.length > 0) && (
            <button
              type="button"
              onClick={handleFinalize}
              className="h-8.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
              title="Finalize document and generate cryptographic SHA-256 seal"
            >
              <CheckCircle2 size={14} />
              <span>Finalize &amp; Seal</span>
            </button>
          )}

          {/* Secondary Button: Download PDF */}
          <button
            type="button"
            onClick={handleDownload}
            className="h-8.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-semibold rounded-full shadow-2xs flex items-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Download size={13} />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Floating Save Feedback Toast */}
      {saveFeedback && (
        <div className="fixed top-12 right-6 z-50 bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 size={14} />
          <span>{saveFeedback}</span>
        </div>
      )}
      {saveError && (
        <div className="fixed top-12 right-6 z-50 bg-rose-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
          <X size={14} />
          <span>{saveError}</span>
        </div>
      )}

      {/* ─── Request Signature Dialog ─── */}
      {showReqSigDialog && (currentDocId || targetDoc) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/75">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-700">
                  <Send size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Request Signatures</h3>
                  <p className="text-[11px] text-slate-500">Dispatch document for executive OTP verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReqSigDialog(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-md transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {reqSigSent ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-base">Signature Request Dispatched</p>
                  <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    {reqSigSelection === 'siva_kumar' ? 'Siva Kumar (MD)' :
                     reqSigSelection === 'uma_mageshwari' ? 'Uma Mageshwari (Director)' : 'Both executive signatories'}
                    {' '}can now review and generate an authorization OTP in their portal.
                  </p>
                </div>
                <div className="text-left text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <span className="font-semibold text-slate-800">Next Step:</span> When the signatory approves and shares the single-use OTP, open the <strong className="text-indigo-700 font-semibold">Signature Requests</strong> tab to verify and place the signature.
                </div>
                <button
                  type="button"
                  onClick={() => setShowReqSigDialog(false)}
                  className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-2xs"
                >
                  Close &amp; Continue
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Select Signatories</p>
                  <div className="space-y-2">
                    {[
                      { val: 'siva_kumar', label: 'Siva Kumar', subtitle: 'Managing Director' },
                      { val: 'uma_mageshwari', label: 'Uma Mageshwari', subtitle: 'Director' },
                      { val: 'both', label: 'Both Signatories', subtitle: 'Siva Kumar & Uma Mageshwari' }
                    ].map(opt => (
                      <label
                        key={opt.val}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          reqSigSelection === opt.val
                            ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="signer"
                          value={opt.val}
                          checked={reqSigSelection === opt.val}
                          onChange={() => setReqSigSelection(opt.val as any)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-600"
                        />
                        <div>
                          <p className="font-semibold text-xs text-slate-900">{opt.label}</p>
                          <p className="text-[11px] text-slate-500">{opt.subtitle}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {(reqSigSelection === 'siva_kumar' || reqSigSelection === 'both') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Siva Kumar's Email</label>
                    <input
                      type="email"
                      value={reqSivaEmail}
                      onChange={e => setReqSivaEmail(e.target.value)}
                      placeholder="siva@example.com"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>
                )}
                {(reqSigSelection === 'uma_mageshwari' || reqSigSelection === 'both') && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Uma Mageshwari's Email</label>
                    <input
                      type="email"
                      value={reqUmaEmail}
                      onChange={e => setReqUmaEmail(e.target.value)}
                      placeholder="uma@example.com"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    try {
                      const docIdToRequest = currentDocId || targetDoc?.id;
                      if (!docIdToRequest) {
                        alert("Please save draft before requesting signatures.");
                        return;
                      }
                      if (reqSigSelection === 'siva_kumar' || reqSigSelection === 'both') {
                        if (!reqSivaEmail.trim()) { alert("Please enter Siva Kumar's email."); return; }
                        DatabaseService.createSignatureRequest(docIdToRequest, 'siva_kumar', reqSivaEmail.trim(), 'HR Admin');
                      }
                      if (reqSigSelection === 'uma_mageshwari' || reqSigSelection === 'both') {
                        if (!reqUmaEmail.trim()) { alert("Please enter Uma Mageshwari's email."); return; }
                        DatabaseService.createSignatureRequest(docIdToRequest, 'uma_mageshwari', reqUmaEmail.trim(), 'HR Admin');
                      }
                      setReqSigSent(true);
                    } catch (e) {
                      alert('Error: ' + (e as any).message);
                    }
                  }}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
                >
                  <Send size={14} />
                  Send Request
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── FULLY SCROLLABLE DOCUMENT CANVAS ─── */}
      <div
        id="sig-scroll-container"
        className="flex-1 overflow-y-auto overflow-x-auto flex flex-col items-center py-8 px-4 min-h-0 bg-slate-100/90 custom-scrollbar"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Document A4 Page Container */}
        <div
          ref={canvasRef}
          onMouseMove={onCanvasMove}
          onMouseUp={onCanvasUp}
          onMouseLeave={onCanvasUp}
          className="relative bg-white shadow-[0_4px_24px_rgba(15,23,42,0.08)] border border-slate-200/90 rounded-sm shrink-0 mb-32 transition-transform duration-150"
          style={{
            width: '794px',
            minHeight: '1050px',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {docLoading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center z-30">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2.5" />
              <p className="text-xs font-semibold text-slate-800">Rendering document pages...</p>
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
            <div className="w-full h-full relative select-text overflow-hidden">
              {/* Exact Letterhead Background from Letterhead.pdf */}
              {selectedCompany.letterheadUrl && (
                <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0">
                  <img
                    src={selectedCompany.letterheadUrl}
                    alt={`${selectedCompany.name} Letterhead`}
                    className="w-full h-full object-fill block"
                  />
                </div>
              )}

              <div className={`w-full h-full flex flex-col justify-between relative z-10 ${selectedCompany.letterheadUrl ? 'pt-[175px] pb-[115px] px-[50px]' : 'p-12 text-[#172b4d]'}`}>
                <div>
                  {/* Fallback Letterhead Header only when company does NOT have a letterheadUrl */}
                  {!selectedCompany.letterheadUrl && (
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
                              <p className="font-bold text-[11px] uppercase text-brand-900 border-b-[1px] border-slate-400 pb-[3px] mb-[3px]">{selectedCompany.headerText}</p>
                              <div className="whitespace-pre-line text-slate-800">{selectedCompany.address}</div>
                            </div>
                          </div>
                          
                          {/* Solid Dark Separator Bar matching PDF theme */}
                          <div className="h-[14px] w-full rounded-l-3xl mb-[4px]" style={{ backgroundColor: selectedCompany.themeColor }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="min-h-[500px]">
                    {renderTemplateBody()}
                  </div>
                </div>

                {/* Signature Acceptance Box */}
                <div className="pt-8 pb-4 flex justify-between items-end border-t border-slate-200 mt-8">
                  <div>
                    <p className="font-bold text-[12px] text-slate-800">{approverName}</p>
                    <p className="text-[11px] text-slate-500">{approverTitle} - {selectedCompany.name}</p>
                    <div className="mt-1.5 text-[9.5px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      <span>Verified Corporate Seal</span>
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
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-brand-900 rounded-full cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow pointer-events-auto"
                title="Resize signature"
              />
            </div>
          ))}
        </div>

        {/* ── Signature Adjustment Inspector (Opens beside selected sig) ── */}
        {selectedSig && !isPreviewMode && (
          <div className="fixed top-28 right-6 w-72 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/90 p-4 z-40 space-y-3.5 font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Settings size={15} className="text-slate-700" />
                <span className="font-semibold text-xs text-slate-900">Signature Inspector</span>
              </div>
              <button
                type="button"
                onClick={() => resetSig(selectedSig)}
                className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
                title="Reset effects"
              >
                <RefreshCw size={13} />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRemoveBg(selectedSig)}
                disabled={bgRemoving === selectedSig.id}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedSig.bgRemoved
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {bgRemoving === selectedSig.id ? (
                  <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Eraser size={13} className="text-slate-600" />
                )}
                <span>{selectedSig.bgRemoved ? 'Restore BG' : 'Remove BG'}</span>
              </button>

              <button
                type="button"
                onClick={() => setCropModal({ sigId: selectedSig.id, src: selectedSig.src })}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <Crop size={13} className="text-slate-600" />
                <span>Crop Area</span>
              </button>
            </div>

            {/* Rotation */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span>Rotation</span>
                <span className="font-mono text-slate-800">{selectedSig.rotation}°</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateSig(selectedSig.id, { rotation: selectedSig.rotation - 90 })}
                  className="p-1 border border-slate-300 rounded hover:bg-slate-50 text-slate-600"
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
                  className="flex-1 h-1.5 accent-indigo-600 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => updateSig(selectedSig.id, { rotation: selectedSig.rotation + 90 })}
                  className="p-1 border border-slate-300 rounded hover:bg-slate-50 text-slate-600"
                  title="Rotate +90°"
                >
                  <RotateCw size={12} />
                </button>
              </div>
            </div>

            {/* Brightness */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span className="flex items-center gap-1"><Sun size={11} /> Brightness</span>
                <span className="font-mono text-slate-800">{selectedSig.brightness}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={300}
                value={selectedSig.brightness}
                onChange={e => updateSig(selectedSig.id, { brightness: Number(e.target.value) })}
                className="w-full h-1.5 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span className="flex items-center gap-1"><Contrast size={11} /> Contrast</span>
                <span className="font-mono text-slate-800">{selectedSig.contrast}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={300}
                value={selectedSig.contrast}
                onChange={e => updateSig(selectedSig.id, { contrast: Number(e.target.value) })}
                className="w-full h-1.5 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Opacity */}
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                <span className="flex items-center gap-1"><Layers size={11} /> Ink Opacity</span>
                <span className="font-mono text-slate-800">{selectedSig.opacity}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={selectedSig.opacity}
                onChange={e => updateSig(selectedSig.id, { opacity: Number(e.target.value) })}
                className="w-full h-1.5 accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* ─── Floating Whiteboard Action Palette (Fixed Center Bottom: Growly Pill Style) ─── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center font-sans">
        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(15,23,42,0.12)] border border-slate-200/90 px-4 py-2 flex items-center gap-2.5">
          {/* Hand Move Tool */}
          <button
            type="button"
            onClick={() => setActiveTool('select')}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              activeTool === 'select' ? 'bg-[#162A45] text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Pan / Select Tool"
          >
            <Move size={15} />
          </button>

          <>
            <div className="h-5 w-px bg-slate-200" />

            {/* Signature Status Legend */}
            {currentRole === 'hr' && (
              <span className="font-semibold text-[10px] text-slate-400 uppercase tracking-wider px-1">Signatures:</span>
            )}

            {/* Siva Kumar signature button (HR places after OTP authorization) */}
            {currentRole === 'hr' && (
              <button
                type="button"
                onClick={() => {
                  const isAuth = targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar' && !a.usedAt);
                  if (!isAuth) return;
                  addSig('/sign1.jpg', 'signature', 'siva_kumar');
                }}
                disabled={!(targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar' && !a.usedAt))}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold text-xs transition-all ${
                  !(targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar' && !a.usedAt))
                    ? 'text-slate-400 bg-slate-100/70 cursor-not-allowed border border-slate-200/80 opacity-60' 
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300 shadow-2xs cursor-pointer'
                }`}
                title={!(targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar' && !a.usedAt)) ? "Locked: Awaiting Siva Kumar's OTP authorization" : "Place Siva Kumar Signature"}
              >
                {!(targetDoc?.authorizations?.some(a => a.signatoryRole === 'siva_kumar' && !a.usedAt)) ? (
                  <Lock size={12} className="text-rose-500" />
                ) : (
                  <CheckCircle2 size={13} className="text-emerald-700" />
                )}
                <span>Siva Kumar (MD)</span>
              </button>
            )}

            {/* Uma Mageshwari signature button (HR places after OTP authorization) */}
            {currentRole === 'hr' && (
              <button
                type="button"
                onClick={() => {
                  const isAuth = targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari' && !a.usedAt);
                  if (!isAuth) return;
                  addSig('/sign2.jpg', 'signature', 'uma_mageshwari');
                }}
                disabled={!(targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari' && !a.usedAt))}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold text-xs transition-all ${
                  !(targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari' && !a.usedAt))
                    ? 'text-slate-400 bg-slate-100/70 cursor-not-allowed border border-slate-200/80 opacity-60' 
                    : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300 shadow-2xs cursor-pointer'
                }`}
                title={!(targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari' && !a.usedAt)) ? "Locked: Awaiting Uma Mageshwari's OTP authorization" : "Place Uma Mageshwari Signature"}
              >
                {!(targetDoc?.authorizations?.some(a => a.signatoryRole === 'uma_mageshwari' && !a.usedAt)) ? (
                  <Lock size={12} className="text-rose-500" />
                ) : (
                  <CheckCircle2 size={13} className="text-emerald-700" />
                )}
                <span>Uma Mageshwari</span>
              </button>
            )}

            {/* Corporate Seal */}
            {currentRole === 'hr' && (
              <button
                type="button"
                onClick={addOfficialStamp}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-full font-semibold text-xs transition-all shadow-2xs cursor-pointer"
                title="Stamp Corporate Seal"
              >
                <Stamp size={13} className="text-blue-600" />
                <span>Corporate Seal</span>
              </button>
            )}

            <div className="h-5 w-px bg-slate-200" />

            {/* Finish & Save */}
            <button
              type="button"
              onClick={handleDownload}
              className="bg-[#162A45] hover:bg-[#0F172A] active:bg-[#020617] text-white font-semibold text-xs px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs active:scale-98 transition-all cursor-pointer"
              title="Finish & Save Document"
            >
              <Download size={13} />
              <span>Finish &amp; Download</span>
            </button>
          </>
        </div>
      </div>

      {/* ─── Bottom Right Zoom Controls ─── */}
      <div className="fixed bottom-6 right-6 z-30 flex flex-col items-center bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 overflow-hidden text-slate-600 font-sans">
        <button
          type="button"
          onClick={() => setZoom(100)}
          className="p-1.5 hover:bg-slate-100 transition-colors border-b border-slate-200 text-slate-700"
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
          <div className="bg-white rounded-lg shadow-md p-5 max-w-md w-full border border-[#dfe1e6]">
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
                className="flex-1 py-1.5 rounded-md bg-brand-900 text-white text-xs font-bold hover:bg-brand-800 shadow-sm"
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
