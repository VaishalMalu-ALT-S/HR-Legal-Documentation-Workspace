import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, Download, Pen, Move, X, Check,
  RotateCcw, RotateCw, Crop, Sun, Contrast, Layers,
  Eraser, FileText, ZoomIn, ZoomOut,
  Settings, RefreshCw, MoreHorizontal,
  FolderOpen, Maximize2, Calendar, Stamp
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as mammoth from 'mammoth';
import { getAltSCorporateStamp } from '../utils/stampGenerator';
import { COMPANY_TEMPLATES, CompanyDocTemplate } from '../data/templates';

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
interface SignatureCenterProps {
  documents?: any[];
  currentRole?: string;
  preselectedDocId?: string;
  onSignatureSuccess?: (doc: any) => void;
  selectedTemplate?: string;
}

export const SignatureCenter: React.FC<SignatureCenterProps> = ({
  onSignatureSuccess,
  selectedTemplate = 'offer_letter',
}) => {
  // Document state
  const [docPages, setDocPages] = useState<string[]>([]);
  const [hasUploadedDoc, setHasUploadedDoc] = useState(false);
  const [docName, setDocName] = useState('Offer_Letter_Vrutika_Prajapati.pdf');
  const [currentPage, setCurrentPage] = useState(0);
  const [docLoading, setDocLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Signatures state
  const [sigs, setSigs] = useState<Sig[]>([]);
  const [savedSigs, setSavedSigs] = useState<string[]>(getSaved);
  const [cropModal, setCropModal] = useState<{ sigId: string; src: string } | null>(null);
  const [bgRemoving, setBgRemoving] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'upload' | 'draw' | 'stamp' | 'date'>('select');

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
    } catch (err: any) {
      setError(`Could not process document: ${err.message}`);
    } finally {
      setDocLoading(false);
    }
  }, []);

  const onDocInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processDoc(f);
  };

  /* ── Add Signature ── */
  const addSig = (src: string, type: 'signature' | 'stamp' | 'date' = 'signature') => {
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
  const renderTemplateBody = () => {
    // Check if selectedTemplate matches any company template ID
    const tpl = COMPANY_TEMPLATES.find(t => t.id === selectedTemplate) ||
      (selectedTemplate === 'employment_agreement' ? COMPANY_TEMPLATES.find(t => t.id === 'appointment_solution_architect') : null) ||
      (selectedTemplate === 'contractor_agreement' ? COMPANY_TEMPLATES.find(t => t.id === 'contractor_offer') : null) ||
      (selectedTemplate === 'nda_policy' ? COMPANY_TEMPLATES.find(t => t.id === 'asset_acknowledgment') : null) ||
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
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-semibold text-[#42526e] hover:bg-[#ebecf0] border border-[#dfe1e6] transition-colors"
            title="Import DOCX, PDF or Image"
          >
            <FolderOpen size={14} className="text-[#0052cc]" />
            <span>Import Doc</span>
          </button>

          <button
            onClick={() => sigInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-semibold text-[#42526e] hover:bg-[#ebecf0] border border-[#dfe1e6] transition-colors"
          >
            <Upload size={14} className="text-emerald-600" />
            <span>Upload Sign</span>
          </button>

          <button
            onClick={() => setDrawModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[12px] font-semibold text-[#42526e] hover:bg-[#ebecf0] border border-[#dfe1e6] transition-colors"
          >
            <Pen size={14} className="text-[#0052cc]" />
            <span>Draw Sign</span>
          </button>

          <button
            onClick={handleDownload}
            className="bg-[#0052cc] hover:bg-[#0065ff] text-white text-[12px] font-semibold px-3 py-1 rounded shadow-xs flex items-center gap-1.5 transition-colors ml-1"
          >
            <Download size={14} />
            <span>Download Signed PDF</span>
          </button>
        </div>
      </div>

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
                <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
                  <div className="w-44">
                    <img src="/altslogo.png" alt="ALT-S Logo" className="w-full h-auto object-contain" />
                  </div>
                  <div className="border border-slate-400 p-2 text-right bg-slate-50 text-[10px] leading-tight">
                    <div className="font-bold text-slate-900 mb-0.5">ALT-S TECHNOLOGY PRIVATE LIMITED</div>
                    <div className="text-slate-600">
                      No. 4, Mullai Street, Thiruvalluvar Nagar,<br />
                      Kamarajnagar, Poonamallee, Tiruvallur,<br />
                      Tamil Nadu - 600071, INDIA
                    </div>
                  </div>
                </div>

                {/* Thick Black Divider Line */}
                <div className="w-full h-3 bg-slate-900 rounded-l-full mt-2 mb-8" />

                {/* Body Content */}
                {renderTemplateBody()}
              </div>

              {/* Signature Acceptance Box */}
              <div className="pt-16 pb-6 flex justify-between items-end border-t border-slate-200 mt-12">
                <div>
                  <p className="font-bold text-[12px] text-slate-800">Authorized Signatory</p>
                  <p className="text-[11px] text-slate-500">ALT-S Technology Pvt Ltd</p>
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
                outline: sig.selected ? '2px solid #0052cc' : 'none',
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
        {selectedSig && (
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

          {/* Import Document */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 text-[#172b4d] hover:bg-[#ebecf0] rounded-lg font-semibold text-[11.5px] transition-colors"
            title="Import DOCX, PDF or Image"
          >
            <FolderOpen size={14} className="text-[#0052cc]" />
            <span>Import Doc</span>
          </button>

          <div className="h-5 w-px bg-[#dfe1e6]" />

          {/* Upload Sign */}
          <button
            onClick={() => sigInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 text-[#172b4d] hover:bg-[#ebecf0] rounded-lg font-semibold text-[11.5px] transition-colors"
            title="Upload Signature Image (PNG/JPG)"
          >
            <Upload size={14} className="text-emerald-600" />
            <span>Upload Sign</span>
          </button>

          {/* Draw Sign */}
          <button
            onClick={() => setDrawModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-[#172b4d] hover:bg-[#ebecf0] rounded-lg font-semibold text-[11.5px] transition-colors"
            title="Hand-Draw Signature"
          >
            <Pen size={14} className="text-[#0052cc]" />
            <span>Draw Sign</span>
          </button>

          {/* Corporate Seal */}
          <button
            onClick={addOfficialStamp}
            className="flex items-center gap-1 px-2.5 py-1 text-[#172b4d] hover:bg-[#ebecf0] rounded-lg font-semibold text-[11.5px] transition-colors"
            title="Stamp ALT-S Corporate Seal"
          >
            <Stamp size={14} className="text-purple-600" />
            <span>Corporate Seal</span>
          </button>

          {/* Date Stamp */}
          <button
            onClick={addDateStamp}
            className="flex items-center gap-1 px-2.5 py-1 text-[#172b4d] hover:bg-[#ebecf0] rounded-lg font-semibold text-[11.5px] transition-colors"
            title="Add Today's Date Stamp"
          >
            <Calendar size={14} className="text-amber-600" />
            <span>Date Stamp</span>
          </button>

          <div className="h-5 w-px bg-[#dfe1e6]" />

          {/* Download Signed PDF */}
          <button
            onClick={handleDownload}
            className="bg-[#0052cc] hover:bg-[#0065ff] active:bg-[#0747a6] text-white font-bold text-[11.5px] px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="Download Signed PDF Document"
          >
            <Download size={14} />
            <span>Download Signed PDF</span>
          </button>
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
