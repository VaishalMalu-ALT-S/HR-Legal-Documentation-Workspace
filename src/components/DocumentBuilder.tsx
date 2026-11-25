import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, List, ListOrdered, Indent, Outdent,
  Palette, Highlighter, Table, Calendar, RotateCcw,
  RotateCw, Download, Printer, Save, FileText, UploadCloud, Check, Plus, FileUp,
  Minus, SlidersHorizontal, Trash2, X, Stamp as StampIcon, PenTool,
  LayoutTemplate, ArrowDown, ArrowUp
, Search, Undo, Redo} from 'lucide-react';
import * as mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { COMPANY_TEMPLATES } from '../data/templates';
import { COMPANIES, CompanyBrand } from '../data/companies';
import { getAltSCorporateStamp } from '../utils/stampGenerator';
import { DatabaseService } from '../services/dbService';
import { DocumentCategory } from '../types';



interface StampItem {
  id: string;
  type: 'signature' | 'stamp' | 'date';
  pageIndex: number;
  src?: string;
  text?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  opacity: number;
}

interface DocumentBuilderProps {
  initialTemplateId?: string;
  initialDocId?: string;
  onSaveSuccess?: () => void;
  onRequestSignatureSuccess?: (docId: string) => void;
}

interface DynamicVariables {
  recipientName: string;
  designation: string;
  refNo: string;
  dateStr: string;
  salaryOrFee: string;
  traineeId: string;
}

export const DocumentBuilder: React.FC<DocumentBuilderProps> = ({
  initialTemplateId = 'asset_acknowledgment',
  initialDocId,
  onSaveSuccess,
  onRequestSignatureSuccess
}) => {
  const [showNewDocLanding, setShowNewDocLanding] = useState<boolean>(!initialDocId);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [currentBuilderDocId, setCurrentBuilderDocId] = useState<string | undefined>(initialDocId);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  


  // Load from initialDocId if provided
  useEffect(() => {
    if (initialDocId) {
      setCurrentBuilderDocId(initialDocId);
      const doc = DatabaseService.getDocumentById(initialDocId) || DatabaseService.getDocuments().find(d => d.id === initialDocId);
      if (doc && doc.variableValues) {
        setDocumentTitle(doc.title);
        if (doc.companyId) setSelectedCompanyId(doc.companyId);
        if (doc.templateVersionId && doc.templateVersionId !== 'uploaded') setSelectedTemplateId(doc.templateVersionId);
        if (doc.updatedAt) {
          setLastSavedTime(new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        try {
          let loadedPages: string[] | null = null;
          if (doc.variableValues.pages) {
            const parsed = typeof doc.variableValues.pages === 'string'
              ? JSON.parse(doc.variableValues.pages)
              : doc.variableValues.pages;
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedPages = parsed;
            }
          }
          if ((!loadedPages || loadedPages.length === 0) && doc.variableValues.content) {
            const split = doc.variableValues.content.split(/\n?<!-- page-break -->\n?/);
            if (split.length > 0) loadedPages = split;
          }
          if (loadedPages && loadedPages.length > 0) {
            setPages(loadedPages);
          }
          if (doc.variableValues.stamps) {
            const parsedStamps = typeof doc.variableValues.stamps === 'string'
              ? JSON.parse(doc.variableValues.stamps)
              : doc.variableValues.stamps;
            if (Array.isArray(parsedStamps)) setStamps(parsedStamps);
          }
          if (doc.variableValues.variables) {
            const parsedVars = typeof doc.variableValues.variables === 'string'
              ? JSON.parse(doc.variableValues.variables)
              : doc.variableValues.variables;
            if (parsedVars) setVariables(parsedVars);
          }
          // Restore branding config
          if (doc.variableValues.showHeadpad !== undefined) setShowHeadpad(doc.variableValues.showHeadpad === 'true');
          if (doc.variableValues.showFooter !== undefined) setShowFooter(doc.variableValues.showFooter === 'true');
          if (doc.variableValues.fontFamily) setFontFamily(doc.variableValues.fontFamily);
          if (doc.variableValues.fontSize) setFontSize(doc.variableValues.fontSize);
        } catch (e) {
          console.error("Error parsing document data", e);
        }
        setShowNewDocLanding(false); // A doc is open — skip landing screen
        setIsDirty(false);
      }
    }
  }, [initialDocId]);


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

  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('alt_s');
  const selectedCompany = COMPANIES.find(c => c.id === selectedCompanyId) || COMPANIES[0];

  // Current active template
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId);
  const [documentTitle, setDocumentTitle] = useState<string>('Official Document');

  // Multi-page state: array of HTML strings for each A4 page
  const [pages, setPages] = useState<string[]>(['']);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Letterhead options
  const [showHeadpad, setShowHeadpad] = useState<boolean>(true);
  const [showFooter, setShowFooter] = useState<boolean>(true);
  const [headpadOnAllPages, _setHeadpadOnAllPages] = useState<boolean>(false);

  // Formatting state
  const [fontFamily, setFontFamily] = useState<string>("'Calibri', Arial, sans-serif");
  const [fontSize, setFontSize] = useState<string>('11pt');
  const [textColor, setTextColor] = useState<string>('#1e293b');
  const [highlightColor, setHighlightColor] = useState<string>('#ffff00');

  // Zoom
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Signatures / Stamps placed on canvas (with pageIndex)
  const [stamps, setStamps] = useState<StampItem[]>([]);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);

  // Drawing Modal State
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawPos = useRef<{ x: number; y: number } | null>(null);

  // Request Signature Modal State
  const [showRequestSigModal, setShowRequestSigModal] = useState(false);
  const [selectedSigners, setSelectedSigners] = useState<{
    siva: boolean;
    uma: boolean;
    sivaEmail: string;
    umaEmail: string;
  }>({
    siva: true,
    uma: false,
    sivaEmail: 'siva@alt-s.com',
    umaEmail: 'uma@alt-s.com'
  });
  const [isSendingSigRequest, setIsSendingSigRequest] = useState(false);

  // Dynamic Variables Quick-Fill Drawer
  const [showVarDrawer, setShowVarDrawer] = useState(false);
  const [variables, setVariables] = useState<DynamicVariables>({
    recipientName: '',
    designation: '',
    refNo: 'ALTS/DOC/2026/08',
    dateStr: '10-August-2026',
    salaryOrFee: '',
    traineeId: 'TR001'
  });

  // UI Status
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Home' | 'Insert' | 'Layout' | 'View'>('Home');

  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleReplaceAll = () => {
    if (!findText) return;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    let count = 0;
    const newPages = pages.map(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const walk = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
      let n;
      const nodesToReplace = [];
      while ((n = walk.nextNode())) {
        if (n.nodeValue && regex.test(n.nodeValue)) {
          nodesToReplace.push(n);
        }
      }
      nodesToReplace.forEach(node => {
        const matches = node.nodeValue?.match(regex);
        if (matches) count += matches.length;
        if (node.nodeValue) node.nodeValue = node.nodeValue.replace(regex, replaceText);
      });
      return doc.body.innerHTML;
    });
    setPages(newPages);
    setIsDirty(true);
    setStatusMessage(`Replaced ${count} occurrences.`);
    setTimeout(() => setStatusMessage(null), 3500);
  };


  // DOM Refs for multi-page containers and editors
  const pageContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const editorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const docxUploadRef = useRef<HTMLInputElement>(null);

  // Dragging / Moving stamps
  const dragInfo = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  // Template selection handler — only updates pages when user explicitly selects a template or on new doc mount without initialDocId
  const handleSelectTemplate = useCallback((tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = COMPANY_TEMPLATES.find(t => t.id === tplId) ?? COMPANY_TEMPLATES[0];
    const initialPages = tpl.pages && tpl.pages.length > 0 ? [...tpl.pages] : [tpl.content];
    setDocumentTitle(tpl.name);
    setPages(initialPages);
    setActivePageIndex(0);
    setIsDirty(true);

    // Auto-detect pre-filled variables based on template
    if (tpl.id === 'asset_acknowledgment') {
      setVariables({
        recipientName: 'Vaishal Malu',
        designation: 'AI Trainee',
        refNo: 'ALTS/ASSET/2026/01',
        dateStr: '03-July-2026',
        salaryOrFee: 'Hardware Issue',
        traineeId: 'TR001'
      });
    } else if (tpl.id === 'appointment_solution_architect') {
      setVariables({
        recipientName: 'Mr. Lokesh Kumar',
        designation: 'Oracle HRMS/HCM Solution Architect',
        refNo: 'ALTS/DOC/2026/08',
        dateStr: '10-08-2026',
        salaryOrFee: 'INR 24,00,000 (CTC)',
        traineeId: 'EMP-9024'
      });
    } else if (tpl.id === 'contractor_offer') {
      setVariables({
        recipientName: 'Mrs. Vrutika Prajapati',
        designation: 'Oracle Technical Consultant',
        refNo: 'ALTS/SOW/2026/42',
        dateStr: '10th August 2026',
        salaryOrFee: 'INR 1,50,000 / month',
        traineeId: 'CON-008'
      });
    } else if (tpl.id === 'appointment_admin_executive') {
      setVariables({
        recipientName: 'Mrs. Manisha',
        designation: 'Administration Executive',
        refNo: 'ALTS/DOC/2026/08',
        dateStr: '30-07-2026',
        salaryOrFee: 'INR 20,000 / month',
        traineeId: 'EMP-9031'
      });
    } else {
      setVariables({
        recipientName: '[Recipient Name]',
        designation: '[Designation]',
        refNo: 'ALTS/DOC/2026/01',
        dateStr: '03-July-2026',
        salaryOrFee: '[Salary / Fee]',
        traineeId: 'TR001'
      });
    }
  }, []);

  const initialMountDone = useRef(false);
  useEffect(() => {
    if (initialMountDone.current) return;
    initialMountDone.current = true;
    if (!initialDocId) {
      handleSelectTemplate(initialTemplateId || 'asset_acknowledgment');
    }
  }, [initialDocId, initialTemplateId, handleSelectTemplate]);

  // Sync editor content into DOM when pages change
  useEffect(() => {
    pages.forEach((pageHtml, index) => {
      const el = editorRefs.current[index];
      if (el && el.innerHTML !== pageHtml) {
        el.innerHTML = pageHtml;
      }
    });
  }, [pages]);


  // Sync editor innerHTML to pages state
  const handlePageInput = (index: number) => {
    const el = editorRefs.current[index];
    if (el) {
      const newPages = [...pages];
      newPages[index] = el.innerHTML;
      setPages(newPages);
      setIsDirty(true);
    }
  };

  // Rich text command helper
  const execCmd = (command: string, value: string | undefined = undefined) => {
    const activeEl = editorRefs.current[activePageIndex] || editorRefs.current[0];
    if (activeEl) {
      activeEl.focus();
    }
    document.execCommand(command, false, value);
    if (activeEl) {
      handlePageInput(activePageIndex);
    }
  };

  // Font Size change handler
  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    const activeEl = editorRefs.current[activePageIndex] || editorRefs.current[0];
    if (activeEl) {
      activeEl.focus();
      document.execCommand('fontSize', false, '7');
      const fontTags = activeEl.getElementsByTagName('font');
      for (let i = fontTags.length - 1; i >= 0; i--) {
        if (fontTags[i].getAttribute('size') === '7') {
          fontTags[i].removeAttribute('size');
          fontTags[i].style.fontSize = size;
        }
      }
      handlePageInput(activePageIndex);
    }
  };

  // Font Family change handler
  const handleFontFamilyChange = (font: string) => {
    setFontFamily(font);
    execCmd('fontName', font);
  };

  // Text Color change
  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    execCmd('foreColor', color);
  };

  // Highlight color
  const handleHighlightColorChange = (color: string) => {
    setHighlightColor(color);
    execCmd('hiliteColor', color);
  };

  // Insert Table
  const insertTable = () => {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #94a3b8; font-size: 11pt;">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-weight: bold;">Particulars</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: left; font-weight: bold;">Details / Specification</th>
            <th style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right; font-weight: bold;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Item 1</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Description or specification here</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right;">--</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Item 2</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px;">Additional details</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px 10px; text-align: right;">--</td>
          </tr>
        </tbody>
      </table>
      <p><br/></p>
    `;
    execCmd('insertHTML', tableHtml);
  };

  // Insert Date
  const insertCurrentDate = () => {
    const d = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const formatted = `${d.getDate().toString().padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    execCmd('insertText', formatted);
  };

  // ── Multi-Page Operations ──
  const addNewPage = (afterIndex?: number) => {
    const targetIdx = afterIndex !== undefined ? afterIndex + 1 : pages.length;
    const newPages = [...pages];
    const blankPageHtml = `
      <p class="my-2 text-xs text-slate-700 leading-relaxed">
        [Continue typing document content for Page ${targetIdx + 1} here...]
      </p>
    `;
    newPages.splice(targetIdx, 0, blankPageHtml);
    setPages(newPages);
    setActivePageIndex(targetIdx);
    notifyUser(`Page ${targetIdx + 1} added!`);
  };

  const deletePage = (indexToDelete: number) => {
    if (pages.length <= 1) {
      notifyUser('Cannot delete the only page in the document.');
      return;
    }
    const newPages = pages.filter((_, idx) => idx !== indexToDelete);
    // Remove or reassign stamps on that page
    setStamps(prev => prev.filter(s => s.pageIndex !== indexToDelete).map(s => {
      if (s.pageIndex > indexToDelete) {
        return { ...s, pageIndex: s.pageIndex - 1 };
      }
      return s;
    }));
    setPages(newPages);
    setActivePageIndex(Math.max(0, indexToDelete - 1));
    notifyUser(`Page ${indexToDelete + 1} deleted.`);
  };

  const movePage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= pages.length) return;
    const newPages = [...pages];
    const [moved] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, moved);

    // Update stamps pageIndex
    setStamps(prev => prev.map(s => {
      if (s.pageIndex === fromIndex) return { ...s, pageIndex: toIndex };
      if (s.pageIndex === toIndex) return { ...s, pageIndex: fromIndex };
      return s;
    }));

    setPages(newPages);
    setActivePageIndex(toIndex);
  };

  // Split overflow content into a new page
  const splitPageOverflow = (pageIdx: number) => {
    const el = editorRefs.current[pageIdx];
    if (!el) return;

    // Get children
    const children = Array.from(el.children);
    if (children.length <= 2) {
      addNewPage(pageIdx);
      return;
    }

    // Split roughly halfway or last 40%
    const splitPoint = Math.max(1, Math.floor(children.length * 0.6));
    const firstHalfHtml = children.slice(0, splitPoint).map(c => c.outerHTML).join('\n');
    const secondHalfHtml = children.slice(splitPoint).map(c => c.outerHTML).join('\n');

    const newPages = [...pages];
    newPages[pageIdx] = firstHalfHtml;
    newPages.splice(pageIdx + 1, 0, secondHalfHtml || '<p><br/></p>');
    setPages(newPages);
    setActivePageIndex(pageIdx + 1);
    notifyUser(`Page ${pageIdx + 1} content split to Page ${pageIdx + 2}!`);
  };

  // Apply Dynamic Variables to all pages
  const applyDynamicVariables = () => {
    const newPages = pages.map(pageHtml => {
      let updated = pageHtml;
      if (variables.recipientName) {
        updated = updated.replace(/(Vaishal Malu|Lokesh Kumar|Vrutika Prajapati|Raghu|Manisha|\[Recipient Name \/ Designation\]|\[Recipient Name\])/gi, variables.recipientName);
      }
      if (variables.designation) {
        updated = updated.replace(/(Oracle HRMS\/HCM Solution Architect|AI Trainee|Oracle Technical Consultant|Administration Executive|\[Designation\])/gi, variables.designation);
      }
      if (variables.refNo) {
        updated = updated.replace(/(ALTS\/DOC\/\d{4}\/\d+|ALTS\/ASSET\/\d{4}\/\d+|ALTS\/CORP\/\d{4}\/\d+|ALTS\/SOW\/\d{4}\/\d+|Ref No: [^\s<]+)/gi, `Ref No: ${variables.refNo}`);
      }
      if (variables.dateStr) {
        updated = updated.replace(/(03-July-2026|10-08-2026|10th August 2026|30-07-2026|05-September-2026|\[Click to edit date\])/gi, variables.dateStr);
      }
      return updated;
    });

    setPages(newPages);
    setShowVarDrawer(false);
    notifyUser('Dynamic variables updated across all pages!');
  };

  // ── Stamp & Signature Overlay Handlers ──
  const addStampOverlay = useCallback((type: 'signature' | 'stamp' | 'date', src?: string, text?: string) => {
    const uid = `stamp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newStamp: StampItem = {
      id: uid,
      type,
      pageIndex: activePageIndex,
      src,
      text,
      x: 480,
      y: 750,
      w: type === 'stamp' ? 140 : (type === 'date' ? 150 : 160),
      h: type === 'stamp' ? 140 : (type === 'date' ? 50 : 70),
      rotation: 0,
      opacity: 0.95
    };
    setStamps(prev => [...prev, newStamp]);
    setSelectedStampId(newStamp.id);
  }, [activePageIndex]);

  const addOfficialCorporateStamp = () => {
    const stampSvg = getAltSCorporateStamp();
    addStampOverlay('stamp', stampSvg);
    notifyUser(`Corporate Seal added to Page ${activePageIndex + 1}! Drag into position.`);
  };

  const addDateStamp = () => {
    const d = new Date();
    const text = `VERIFIED & SIGNED\n${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    addStampOverlay('date', undefined, text);
    notifyUser(`Date stamp added to Page ${activePageIndex + 1}!`);
  };

  // Signature File Upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) {
        addStampOverlay('signature', ev.target.result as string);
        notifyUser(`Signature uploaded to Page ${activePageIndex + 1}! Drag into position.`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    lastDrawPos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setIsDrawing(true);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastDrawPos.current) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    ctx.strokeStyle = '#002060';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(lastDrawPos.current.x, lastDrawPos.current.y);
    ctx.lineTo(curX, curY);
    ctx.stroke();

    lastDrawPos.current = { x: curX, y: curY };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastDrawPos.current = null;
  };

  const saveDrawnSignature = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    addStampOverlay('signature', dataUrl);
    setDrawModalOpen(false);
    notifyUser(`Handwritten signature added to Page ${activePageIndex + 1}!`);
  };

  // Dragging stamps on canvas
  const handleStampMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedStampId(id);
    const stamp = stamps.find(s => s.id === id);
    if (!stamp) return;

    dragInfo.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: stamp.x,
      origY: stamp.y
    };

    const onMouseMove = (me: MouseEvent) => {
      if (!dragInfo.current) return;
      const dx = me.clientX - dragInfo.current.startX;
      const dy = me.clientY - dragInfo.current.startY;
      setStamps(prev => prev.map(s => s.id === dragInfo.current!.id ? {
        ...s,
        x: Math.max(10, Math.min(640, dragInfo.current!.origX + dx)),
        y: Math.max(10, Math.min(1020, dragInfo.current!.origY + dy))
      } : s));
    };

    const onMouseUp = () => {
      dragInfo.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Resize / Rotate Stamp
  const updateSelectedStamp = (prop: keyof StampItem, value: number | string | undefined) => {
    if (!selectedStampId) return;
    setStamps(prev => prev.map(s => s.id === selectedStampId ? { ...s, [prop]: value } : s));
  };

  const removeSelectedStamp = () => {
    if (!selectedStampId) return;
    setStamps(prev => prev.filter(s => s.id !== selectedStampId));
    setSelectedStampId(null);
  };

  // Status message helper
  const notifyUser = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // ── Multi-Page Export to PDF ──
  
  // ── Universal Document Importer ──
  // Accepts TXT, DOCX, PDF → extracts content → places into editor body with company branding intact
  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    notifyUser(`Importing "${file.name}" into editor...`);

    try {
      let rawHtml = '';
      const ext = file.name.toLowerCase().split('.').pop();

      if (ext === 'txt') {
        // TXT: read text, preserve paragraphs and line breaks
        const text = await file.text();
        rawHtml = text
          .split(/\r?\n/)
          .map(line => line.trim() === '' ? '<p class="mb-1"><br/></p>' : `<p class="mb-3 leading-relaxed">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`)
          .join('');

      } else if (ext === 'pdf') {
        // PDF: extract text via pdfjs and insert as paragraphs
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + pdfjs.version + '/pdf.worker.min.mjs';
        const buf = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buf }).promise;
        const pageTexts: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item: any) => item.str)
            .join(' ')
            .trim();
          if (pageText) pageTexts.push(pageText);
        }
        rawHtml = pageTexts
          .join('\n\n')
          .split(/\n/)
          .map(line => line.trim() === '' ? '<p class="mb-1"><br/></p>' : `<p class="mb-3 leading-relaxed">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>`)
          .join('');
        if (!rawHtml) {
          rawHtml = '<p class="text-slate-500 italic">PDF content extracted. Please review and edit as needed.</p>';
        }

      } else {
        // DOCX/DOC: parse with mammoth, preserve headings/bold/italic/tables
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer }, {
          styleMap: [
            "p[style-name='Heading 1'] => h1.text-xl.font-bold.mb-4.text-slate-900:fresh",
            "p[style-name='Heading 2'] => h2.text-lg.font-bold.mb-3.text-slate-800:fresh",
            "p[style-name='Heading 3'] => h3.text-md.font-bold.mb-2.text-slate-800:fresh",
            "p => p.mb-3.leading-relaxed:fresh",
            "table => table.border-collapse.w-full.border.border-slate-400.my-6.text-sm.align-middle:fresh",
            "tr => tr.border-b.border-slate-300.hover:bg-slate-50:fresh",
            "td => td.border.border-slate-300.px-4.py-3.text-slate-800:fresh",
            "th => th.border.border-slate-400.px-4.py-3.font-bold.bg-slate-100.text-left.text-slate-900:fresh",
            "b => strong.font-bold:fresh",
            "i => em.italic:fresh",
            "u => u:fresh",
            "strike => s:fresh"
          ]
        });
        rawHtml = result.value;
      }
      
      if (rawHtml) {
        // Smart A4 page splitting — content goes INTO editor body, company header/footer stays
        const tempContainer = document.createElement('div');
        tempContainer.style.width = '706px'; // A4 usable width (794 - 2*44 margin)
        tempContainer.style.position = 'absolute';
        tempContainer.style.visibility = 'hidden';
        tempContainer.style.left = '-9999px';
        tempContainer.style.padding = '0';
        tempContainer.style.fontSize = fontSize;
        tempContainer.style.fontFamily = fontFamily;
        document.body.appendChild(tempContainer);

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');
        const nodes = Array.from(doc.body.childNodes);
        
        const newPages: string[] = [];
        const MAX_HEIGHT_PX = 900; // Usable body area (A4 minus header/footer)

        for (const node of nodes) {
          tempContainer.appendChild(node.cloneNode(true));
          if (tempContainer.scrollHeight > MAX_HEIGHT_PX) {
            tempContainer.lastChild?.remove();
            newPages.push(tempContainer.innerHTML);
            tempContainer.innerHTML = '';
            tempContainer.appendChild(node.cloneNode(true));
          }
        }
        if (tempContainer.innerHTML) {
          newPages.push(tempContainer.innerHTML);
        }
        document.body.removeChild(tempContainer);

        // Update document title from filename
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setDocumentTitle(baseName || documentTitle);

        setPages(newPages.length > 0 ? newPages : ['']);
        setActivePageIndex(0);
        setShowNewDocLanding(false);
        setIsDirty(true);
        notifyUser(`"${file.name}" imported into ${newPages.length} page(s) with ${selectedCompany.name} letterhead.`);
      }
    } catch (err) {
      console.error('Error importing document:', err);
      notifyUser('Failed to import document. Please ensure it is a valid .docx, .txt or .pdf file.');
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    notifyUser('Generating multi-page high-resolution PDF...');
    try {
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pageContainerRefs.current[i];
        if (!pageEl) continue;

        // Hide UI helper overlays during capture
        const buttons = pageEl.querySelectorAll('.no-print');
        buttons.forEach(b => (b as HTMLElement).style.display = 'none');

        const canvas = await html2canvas(pageEl, {
          scale: 2.0,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        // Restore UI helpers
        buttons.forEach(b => (b as HTMLElement).style.display = '');

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      pdf.save(`${documentTitle.replace(/\s+/g, '_')}_ALT-S.pdf`);
      notifyUser('Multi-page PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF export error:', err);
      notifyUser('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Save to Local Vault
  const handleSaveToVault = async () => {
    try {
      // Capture live DOM content from editors
      const livePages = pages.map((pageHtml, idx) => {
        const el = editorRefs.current[idx];
        return el ? el.innerHTML : pageHtml;
      });
      setPages(livePages);

      const fullHtml = livePages.join('\n<!-- page-break -->\n');
      
      const docData = {
        title: documentTitle,
        category: (selectedTemplateId === 'asset_acknowledgment' ? 'acknowledgement_form' : 'appointment_letter') as any,
        companyId: selectedCompanyId,
        personName: variables.recipientName || 'Employee / Consultant',
        personEmail: 'hr@alt-s.com',
        personRole: variables.designation || 'Candidate',
        templateVersionId: selectedTemplateId,
        templateVersionNumber: '1.0',
        status: 'draft' as const,
        variableValues: {
          content: fullHtml,
          pages: JSON.stringify(livePages),
          stamps: JSON.stringify(stamps),
          variables: JSON.stringify(variables),
          // Persist branding config so it survives Save → Reopen
          showHeadpad: String(showHeadpad),
          showFooter: String(showFooter),
          fontFamily,
          fontSize
        },
        generatedAt: new Date().toISOString(),
        generatedBy: 'HR Admin',
        approvalWorkflow: {
          id: `wf_${Date.now()}`,
          documentId: `doc_${Date.now()}`,
          currentStepIndex: 0,
          steps: [],
          status: 'in_progress' as const
        }
      };

      const saved = await DatabaseService.saveDraft(docData as any, currentBuilderDocId || initialDocId);
      setCurrentBuilderDocId(saved.id);
      localStorage.setItem('signhr_active_doc_id', saved.id);
      setIsDirty(false);
      const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(t);
      notifyUser(`Draft "${documentTitle}" saved safely!`);
      return saved.id;
    } catch (err: any) {
      console.error('Save error:', err);
      notifyUser('Error saving draft: ' + err.message);
      return null;
    }
  };

  // ── New Document Landing Screen ──
  // Shown when no document is open yet — lets HR choose template or upload
  if (showNewDocLanding && !initialDocId) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 overflow-hidden">
        {/* Top bar */}
        <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-900 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">New Document</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Select a company to apply branding:</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="text-[11px] font-semibold text-slate-700 bg-white border border-slate-300 rounded px-2 py-1 outline-none hover:border-indigo-400 cursor-pointer"
            >
              {COMPANIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-8 gap-8">
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-slate-800 mb-2">Create New Document</h1>
            <p className="text-slate-500 text-sm max-w-md">
              Start from a professional template or import your existing file.
              Your selected company branding — <span className="font-semibold text-brand-900">{selectedCompany.name}</span> — will always be applied.
            </p>
          </div>

          <div className="flex gap-6 flex-wrap justify-center max-w-3xl">
            {/* Create from Template */}
            <button
              onClick={() => {
                handleSelectTemplate(selectedTemplateId || 'asset_acknowledgment');
                setShowNewDocLanding(false);
              }}
              className="flex flex-col items-center gap-4 bg-white border border-slate-200 hover:border-brand-900 hover:shadow-md rounded-lg p-6 w-72 transition-all group cursor-pointer text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 group-hover:bg-brand-900/10 flex items-center justify-center transition-colors">
                <LayoutTemplate className="w-6 h-6 text-brand-900" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm mb-1">Create from Template</p>
                <p className="text-slate-500 text-xs leading-relaxed">Choose from verified enterprise document templates like Offer Letter, Appointment, Asset Form, etc.</p>
              </div>
              <div className="mt-auto w-full flex items-center justify-center gap-1.5 bg-brand-900 text-white text-xs font-semibold px-4 py-2 rounded-md group-hover:bg-brand-800 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                <span>Open Template Editor</span>
              </div>
            </button>

            {/* Upload & Import */}
            <label className="flex flex-col items-center gap-4 bg-white border border-slate-200 hover:border-slate-400 hover:shadow-md rounded-lg p-6 w-72 transition-all group cursor-pointer text-left">
              <div className="w-12 h-12 rounded-lg bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm mb-1">Upload Existing Document</p>
                <p className="text-slate-500 text-xs leading-relaxed">Import a <strong>TXT</strong>, <strong>DOCX</strong>, or <strong>PDF</strong> file. Content is rendered into the editor with corporate letterhead.</p>
              </div>
              <div className="mt-auto w-full flex items-center justify-center gap-1.5 bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-md group-hover:bg-slate-700 transition-colors">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload &amp; Import Content</span>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={async (e) => {
                  setShowNewDocLanding(false);
                  await handleDocxImport(e);
                }}
              />
            </label>
          </div>

          {/* Company branding preview */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm max-w-lg">
            <img
              src={selectedCompany.logoUrl}
              alt={selectedCompany.name}
              className="h-8 object-contain mix-blend-multiply"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">{selectedCompany.name}</span>
              <span className="text-[10px] text-slate-500">{selectedCompany.email} • {selectedCompany.website}</span>
            </div>
            <div className="ml-auto text-[10px] text-slate-400">Branding will be applied automatically</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-hidden font-sans text-slate-800 select-none min-w-0">
      {/* ── Top Bar: Actions ── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs z-20 w-full min-h-[48px] font-sans">
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <div className="flex items-center space-x-1.5 border-r border-slate-200 pr-2.5 mr-1 shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Company:</span>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none hover:border-slate-300 focus:border-indigo-600 cursor-pointer"
            >
              {COMPANIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <LayoutTemplate className="w-3.5 h-3.5 text-brand-900" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Template:</span>
          </div>

          <select
            value={selectedTemplateId}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="text-[11px] font-semibold bg-slate-100 hover:bg-slate-200/70 text-slate-800 rounded px-1.5 py-0.5 border border-slate-300 outline-none cursor-pointer w-24 md:w-32 lg:w-40 xl:w-48 shrink-0 truncate"
            title="Template Selector"
          >
            {COMPANY_TEMPLATES.map(tpl => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name} ({tpl.pages.length} Page{tpl.pages.length > 1 ? 's' : ''})
              </option>
            ))}
          </select>
          
          <div className="w-px h-4 bg-slate-200 mx-0.5 hidden sm:block"></div>
          
          <button
            onClick={() => docxUploadRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-brand-900 text-[11px] font-bold rounded border border-slate-200 shrink-0 disabled:opacity-50"
            title="Import TXT / DOCX / PDF into editor body (letterhead preserved)"
          >
            <UploadCloud size={12} />
            <span>{isImporting ? 'Importing...' : 'Import'}</span>
          </button>

          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="text-[11px] font-bold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 px-1 py-0.5 outline-none w-20 md:w-28 lg:w-36 shrink-0 truncate"
            title="Click to rename document"
          />

          <button
            onClick={() => setShowVarDrawer(!showVarDrawer)}
            className={`flex items-center space-x-1 text-[11px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${
              showVarDrawer ? 'bg-slate-50 border-slate-300 text-brand-900' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 text-brand-900" />
            <span className="hidden lg:inline">Dynamic Fields ({variables.recipientName ? 'Active' : 'Fill'})</span>
            <span className="inline lg:hidden">Fields</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Draft Status Badge */}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Draft
          </span>
          {lastSavedTime && (
            <span className="text-[10px] text-slate-500 font-medium shrink-0 hidden md:inline">
              Saved {lastSavedTime}
            </span>
          )}

          <button
            onClick={async () => {
              await handleSaveToVault();
            }}
            className="flex items-center space-x-1 text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-2 py-1 rounded-md shadow-xs active:scale-95 transition-all shrink-0"
            title="Save Document as Draft"
          >
            <Save className="w-3 h-3 text-slate-600" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => setShowRequestSigModal(true)}
            className="flex items-center space-x-1 text-[11px] font-bold bg-brand-900 hover:bg-brand-800 text-white px-2.5 py-1 rounded-md shadow-xs active:scale-95 transition-all shrink-0 ml-0.5"
            title="Request Signatures from Managing Director or Director"
          >
            <Send className="w-3 h-3 text-white" />
            <span>Request Signature</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1 text-[11px] font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-1.5 py-0.5 rounded active:scale-95 transition-all shrink-0"
            title="Direct Print Document"
          >
            <Printer className="w-3 h-3 text-slate-600" />
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center space-x-1 text-[11px] font-bold bg-brand-900 hover:bg-brand-800 text-white px-2 py-0.5 rounded shadow-sm active:scale-95 transition-all disabled:opacity-50 shrink-0 ml-1"
            title="Export PDF"
          >
            <Download className="w-3 h-3" />
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* ── Dynamic Fields Quick-Fill Drawer (Collapsible) ── */}
      {showVarDrawer && (
        <div className="bg-indigo-900/95 text-white px-3 py-1.5 border-b border-indigo-800 shadow-sm flex items-center justify-between z-20 transition-all text-[11px] animate-in slide-in-from-top duration-150 overflow-x-auto no-scrollbar gap-2 min-w-0">
          <div className="flex items-center gap-2 shrink-0 min-w-0">
            <div className="flex items-center space-x-1 shrink-0">
              <span className="font-bold text-indigo-200">Candidate / Recipient:</span>
              <input type="text" value={variables.recipientName} onChange={e => setVariables({ ...variables, recipientName: e.target.value })} placeholder="e.g. Vaishal Malu" className="bg-indigo-950/80 border border-indigo-700 rounded px-1.5 py-0.5 text-white text-[11px] outline-none focus:border-indigo-400 w-24 md:w-32" />
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <span className="font-bold text-indigo-200">Designation:</span>
              <input type="text" value={variables.designation} onChange={e => setVariables({ ...variables, designation: e.target.value })} placeholder="e.g. Solution Architect" className="bg-indigo-950/80 border border-indigo-700 rounded px-1.5 py-0.5 text-white text-[11px] outline-none focus:border-indigo-400 w-24 md:w-32" />
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <span className="font-bold text-indigo-200">Date:</span>
              <input type="text" value={variables.dateStr} onChange={e => setVariables({ ...variables, dateStr: e.target.value })} placeholder="e.g. 10-08-2026" className="bg-indigo-950/80 border border-indigo-700 rounded px-1.5 py-0.5 text-white text-[11px] outline-none focus:border-indigo-400 w-20" />
            </div>
            <div className="flex items-center space-x-1 shrink-0">
              <span className="font-bold text-indigo-200">Ref No:</span>
              <input type="text" value={variables.refNo} onChange={e => setVariables({ ...variables, refNo: e.target.value })} placeholder="ALTS/DOC/2026/08" className="bg-indigo-950/80 border border-indigo-700 rounded px-1.5 py-0.5 text-white text-[11px] outline-none focus:border-indigo-400 w-24" />
            </div>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <button onClick={applyDynamicVariables} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2 py-1 rounded shadow-sm text-[11px] transition-colors flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span className="hidden sm:inline">Apply to All</span>
            </button>
            <button onClick={() => setShowVarDrawer(false)} className="text-indigo-300 hover:text-white p-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

            {/* ── Word-Style Ribbon Toolbar ── */}
      <div className="bg-white border-b border-slate-300 flex flex-col shadow-sm z-10 w-full select-none">
        
        {/* Ribbon Tabs */}
        <div className="flex items-center px-4 space-x-6 text-[12px] text-slate-600 border-b border-slate-200">
          {['Home', 'Insert', 'Layout', 'View'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-1 py-1.5 -mb-[1px] border-b-2 transition-colors ${activeTab === tab ? 'border-brand-900 text-brand-900 font-semibold' : 'border-transparent hover:border-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Ribbon Content */}
        <div className="px-3 py-2 flex items-center gap-4 text-[11px] text-slate-700 min-h-[50px] bg-slate-50/50">
          
          {activeTab === 'Home' && (
            <>
              
              {/* UNDO/REDO GROUP */}
              <div className="flex flex-col border-r border-slate-300 pr-4 h-full justify-center">
                <div className="flex items-center space-x-1">
                  <button onClick={() => execCmd('undo')} className="p-1 hover:bg-slate-200 rounded text-slate-700" title="Undo (Ctrl+Z)"><Undo className="w-4 h-4" /></button>
                  <button onClick={() => execCmd('redo')} className="p-1 hover:bg-slate-200 rounded text-slate-700" title="Redo (Ctrl+Y)"><Redo className="w-4 h-4" /></button>
                </div>
                <div className="text-[9px] text-slate-400 mt-1 font-semibold text-center w-full">History</div>
              </div>

              {/* FONT GROUP */}
              <div className="flex flex-col border-r border-slate-300 pr-4">
                <div className="flex items-center space-x-1 mb-1">
                  <select value={fontFamily} onChange={(e) => handleFontFamilyChange(e.target.value)} className="border border-slate-300 rounded px-1 py-0.5 bg-white hover:border-slate-400 focus:outline-none focus:border-indigo-500 w-24 truncate">
                    <option value="'Calibri', Arial, sans-serif">Calibri</option>
                    <option value="'Arial', sans-serif">Arial</option>
                    <option value="'Inter', sans-serif">Inter</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Georgia', serif">Georgia</option>
                    <option value="'Courier New', monospace">Courier New</option>
                  </select>

                  <select value={fontSize} onChange={(e) => handleFontSizeChange(e.target.value)} className="border border-slate-300 rounded px-1 py-0.5 bg-white hover:border-slate-400 focus:outline-none focus:border-indigo-500 w-12 truncate">
                    <option value="9pt">9pt</option>
                    <option value="10pt">10pt</option>
                    <option value="11pt">11pt</option>
                    <option value="12pt">12pt</option>
                    <option value="14pt">14pt</option>
                    <option value="16pt">16pt</option>
                    <option value="18pt">18pt</option>
                  </select>

                  <div className="flex items-center border border-slate-300 rounded overflow-hidden">
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => { const cur = parseInt(fontSize) || 11; handleFontSizeChange(`${Math.max(8, cur - 1)}pt`); }} className="p-0.5 hover:bg-slate-200 bg-white"><Minus className="w-2.5 h-2.5" /></button>
                    <div className="w-px h-3 bg-slate-300" />
                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => { const cur = parseInt(fontSize) || 11; handleFontSizeChange(`${Math.max(36, cur + 1)}pt`); }} className="p-0.5 hover:bg-slate-200 bg-white"><Plus className="w-2.5 h-2.5" /></button>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button onClick={() => execCmd('bold')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded font-bold" title="Bold (Ctrl+B)"><Bold className="w-3.5 h-3.5" /></button>
                  <button onClick={() => execCmd('italic')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded italic" title="Italic (Ctrl+I)"><Italic className="w-3.5 h-3.5" /></button>
                  <button onClick={() => execCmd('underline')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded underline" title="Underline (Ctrl+U)"><Underline className="w-3.5 h-3.5" /></button>
                  <button onClick={() => execCmd('strikeThrough')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded line-through" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>
                  
                  <div className="w-px h-3 bg-slate-300 mx-1" />

                  <div className="flex items-center space-x-0.5 px-0.5" title="Text Color">
                    <Palette className="w-3.5 h-3.5 text-slate-500" />
                    <input type="color" value={textColor} onChange={(e) => handleTextColorChange(e.target.value)} className="w-4 h-4 cursor-pointer border-0 bg-transparent p-0" />
                  </div>
                  <div className="flex items-center space-x-0.5 px-0.5" title="Highlight Color">
                    <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                    <input type="color" value={highlightColor} onChange={(e) => handleHighlightColorChange(e.target.value)} className="w-4 h-4 cursor-pointer border-0 bg-transparent p-0" />
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 font-semibold text-center w-full">Font</div>
              </div>

              {/* PARAGRAPH GROUP */}
              <div className="flex flex-col border-r border-slate-300 pr-4">
                <div className="flex items-center space-x-1 mb-1">
                  <button onClick={() => execCmd('insertUnorderedList')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
                  <button onClick={() => execCmd('insertOrderedList')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded" title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></button>
                  <div className="w-px h-3 bg-slate-300 mx-1" />
                  <button onClick={() => execCmd('outdent')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded" title="Decrease Indent"><Outdent className="w-3.5 h-3.5" /></button>
                  <button onClick={() => execCmd('indent')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded" title="Increase Indent"><Indent className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => execCmd('justifyLeft')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded" title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
                  <button onClick={() => execCmd('justifyCenter')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded" title="Center"><AlignCenter className="w-3.5 h-3.5" /></button>
                  <button onClick={() => execCmd('justifyRight')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded" title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
                  <button onClick={() => execCmd('justifyFull')} onMouseDown={(e) => e.preventDefault()} className="p-1 hover:bg-slate-200 rounded" title="Justify"><AlignJustify className="w-3.5 h-3.5" /></button>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 font-semibold text-center w-full">Paragraph</div>
              </div>

              {/* EDITING GROUP */}
              <div className="flex flex-col border-r border-slate-300 pr-4 h-full justify-center pl-4">
                <button onClick={() => setShowFindReplace(!showFindReplace)} className={`flex flex-col items-center p-1 rounded min-w-[48px] ${showFindReplace ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-200'}`} title="Find and Replace (Ctrl+F)">
                  <Search className="w-5 h-5 mb-0.5" />
                  <span>Find</span>
                </button>
                <div className="text-[9px] text-slate-400 mt-1 font-semibold text-center w-full">Editing</div>
              </div>
            </>
          )}

          {activeTab === 'Insert' && (
            <>
              {/* INSERT GROUP */}
              <div className="flex flex-col border-r border-slate-300 pr-4 h-full justify-center">
                <div className="flex items-center space-x-2">
                  <button onClick={insertTable} onMouseDown={(e) => e.preventDefault()} className="flex flex-col items-center p-1 hover:bg-slate-200 rounded min-w-[48px]" title="Insert Table">
                    <Table className="w-5 h-5 text-blue-600 mb-0.5" />
                    <span>Table</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300 mx-1" />
                  <button onClick={() => docxUploadRef.current?.click()} onMouseDown={(e) => e.preventDefault()} className="flex flex-col items-center p-1 hover:bg-slate-200 rounded min-w-[48px]" title="Import Document">
                    <FileUp className="w-5 h-5 text-brand-900 mb-0.5" />
                    <span>Word</span>
                  </button>
                  <div className="w-px h-6 bg-slate-300 mx-1" />
                  <button onClick={() => fileUploadRef.current?.click()} onMouseDown={(e) => e.preventDefault()} className="flex flex-col items-center p-1 hover:bg-slate-200 rounded min-w-[48px]" title="Upload Signature Image">
                    <FileText className="w-5 h-5 text-purple-600 mb-0.5" />
                    <span>Signature</span>
                  </button>
                  <button onClick={addDateStamp} onMouseDown={(e) => e.preventDefault()} className="flex flex-col items-center p-1 hover:bg-slate-200 rounded min-w-[48px]" title="Add Verified Date Stamp Overlay">
                    <Check className="w-5 h-5 text-emerald-600 mb-0.5" />
                    <span>Stamp</span>
                  </button>
                </div>
                <div className="text-[9px] text-slate-400 mt-1 font-semibold text-center w-full">Elements</div>

              </div>
            </>
          )}

          {activeTab === 'Layout' && (
            <>
              {/* PAGE SETUP */}
              <div className="flex flex-col border-r border-slate-300 pr-4 h-full justify-center">
                <div className="flex items-center space-x-4 px-2">
                  <label className="flex items-center space-x-1.5 cursor-pointer hover:bg-slate-200 p-1 rounded">
                    <input type="checkbox" checked={headpadOnAllPages} onChange={(e) => _setHeadpadOnAllPages(e.target.checked)} className="rounded w-3.5 h-3.5 text-brand-900 focus:ring-0 cursor-pointer" />
                    <span>{selectedCompany.name} Letterhead</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer hover:bg-slate-200 p-1 rounded">
                    <input type="checkbox" checked={showFooter} onChange={(e) => setShowFooter(e.target.checked)} className="rounded w-3.5 h-3.5 text-brand-900 focus:ring-0 cursor-pointer" />
                    <span>Official Footer</span>
                  </label>
                </div>
                <div className="text-[9px] text-slate-400 mt-1 font-semibold text-center w-full">Page Setup</div>
              </div>
            </>
          )}

          {activeTab === 'View' && (
            <>
              {/* ZOOM & WINDOW */}
              <div className="flex flex-col border-r border-slate-300 pr-4 h-full justify-center">
                <div className="flex items-center space-x-3 px-2">
                  <div className="flex items-center space-x-1 bg-white px-1.5 py-0.5 rounded border border-slate-300">
                    <button onClick={() => setZoomLevel(prev => Math.max(60, prev - 10))} className="font-bold px-1 hover:bg-slate-100 rounded text-lg leading-none">-</button>
                    <span className="font-mono w-9 text-center text-xs">{zoomLevel}%</span>
                    <button onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))} className="font-bold px-1 hover:bg-slate-100 rounded text-lg leading-none">+</button>
                  </div>
                  <button onClick={() => setZoomLevel(100)} className="px-2 py-1 border border-slate-300 rounded hover:bg-slate-200 bg-white">100%</button>
                </div>
                <div className="text-[9px] text-slate-400 mt-1 font-semibold text-center w-full">Zoom</div>
              </div>

              {/* DANGEROUS ACTIONS */}
              <div className="flex flex-col pr-4 h-full justify-center ml-auto">
                <button onClick={() => {
                  if (confirm('Are you sure you want to completely clear this document? All pages and content will be deleted.')) {
                    setPages(['']);
                    setStamps([]);
                    setActivePageIndex(0);
                    setIsDirty(true);
                  }
                }} onMouseDown={(e) => e.preventDefault()} className="flex items-center space-x-1.5 px-3 py-1.5 hover:bg-red-100 text-red-600 rounded border border-red-200 bg-red-50" title="Clear Entire Document">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span className="font-bold">Clear Document</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>


      {/* ── Find/Replace Floating Panel ── */}
      {showFindReplace && (
        <div className="absolute top-32 right-8 w-72 bg-white rounded-lg shadow-2xl border border-slate-300 z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-slate-100 border-b border-slate-300 px-3 py-2 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5"><Search className="w-3.5 h-3.5"/> Find and Replace</span>
            <button onClick={() => setShowFindReplace(false)} className="text-slate-500 hover:text-slate-800"><X className="w-4 h-4"/></button>
          </div>
          <div className="p-4 space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Find</label>
              <input type="text" value={findText} onChange={e => setFindText(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 focus:border-indigo-500 outline-none" placeholder="Search document..." />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Replace with</label>
              <input type="text" value={replaceText} onChange={e => setReplaceText(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 focus:border-indigo-500 outline-none" placeholder="Replace text..." />
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button onClick={() => (window as any).find(findText)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition-colors">Find Next</button>
              <button onClick={handleReplaceAll} className="px-3 py-1.5 bg-brand-900 hover:bg-brand-800 text-white rounded font-semibold transition-colors">Replace All</button>
            </div>
          </div>
        </div>
      )}

                {/* Document import — TXT, DOCX, PDF → imports content into editor body */}
                <input type="file" ref={docxUploadRef} accept=".pdf,.doc,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={handleDocxImport} className="hidden" />
                {/* Signature image upload */}
                <input ref={fileUploadRef} type="file" accept="image/png, image/jpeg" onChange={handleSignatureUpload} className="hidden" />

{/* ── Status Toast ── */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 bg-brand-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center space-x-2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ── Main Multi-Page A4 Canvas Area ── */}
      <div className="flex-1 overflow-auto p-6 flex flex-col items-center gap-8 bg-[#e8ecf2] min-w-0">
        
        {/* ── Visual Horizontal Ruler ── */}
        <div className="w-[794px] h-6 bg-white border border-slate-300 mb-4 sticky top-0 z-20 shadow-sm flex no-print">
          {/* Left Margin (44px) */}
          <div className="w-[44px] h-full bg-slate-200 border-r border-slate-400"></div>
          {/* Usable Area (706px) with ticks */}
          <div className="flex-1 h-full relative" style={{ backgroundImage: 'linear-gradient(90deg, transparent 95%, #cbd5e1 95%)', backgroundSize: '10px 100%' }}>
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(90deg, transparent 98%, #94a3b8 98%)', backgroundSize: '50px 100%' }}></div>
          </div>
          {/* Right Margin (44px) */}
          <div className="w-[44px] h-full bg-slate-200 border-l border-slate-400"></div>
        </div>

        {pages.map((pageContent, pageIdx) => {
          const isPageActive = activePageIndex === pageIdx;
          const pageStamps = stamps.filter(s => s.pageIndex === pageIdx);

          return (
            <div
              key={pageIdx}
              onClick={() => setActivePageIndex(pageIdx)}
              className={`flex flex-col items-center transition-all ${
                isPageActive ? 'ring-2 ring-indigo-400/50 rounded-sm' : 'opacity-95 hover:opacity-100'
              }`}
            >
              {/* Page Control Bar */}
              <div className="w-[794px] mb-2 flex items-center justify-between text-xs text-slate-500 px-2 no-print">
                <div className="flex items-center space-x-2">
                  <span className="font-bold bg-white text-slate-800 border border-slate-300 px-2.5 py-0.5 rounded shadow-sm inline-flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Page {pageIdx + 1} of {pages.length}</span>
                  </span>
                  {pageIdx === 0 && <span className="text-[11px] text-brand-900 font-medium">Official {selectedCompany.name} Letterhead</span>}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); splitPageOverflow(pageIdx); }}
                    className="flex items-center space-x-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px] shadow-sm"
                    title="Move excess/bottom content to the next page"
                  >
                    <ArrowDown className="w-3 h-3 text-brand-900" />
                    <span>Split Overflow</span>
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); addNewPage(pageIdx); }}
                    className="flex items-center space-x-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px] shadow-sm"
                    title="Insert a blank page directly after this page"
                  >
                    <Plus className="w-3 h-3 text-emerald-600" />
                    <span>Insert Page After</span>
                  </button>

                  {pageIdx > 0 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); movePage(pageIdx, pageIdx - 1); }}
                      className="p-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded"
                      title="Move Page Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                  )}

                  {pageIdx < pages.length - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); movePage(pageIdx, pageIdx + 1); }}
                      className="p-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded"
                      title="Move Page Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  )}

                  {pages.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePage(pageIdx); }}
                      className="p-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded"
                      title="Delete this page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Discrete A4 Page Sheet (794px × 1123px standard A4 ratio) ── */}
              <div
                ref={el => { pageContainerRefs.current[pageIdx] = el; }}
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  
                  fontFamily: fontFamily
                }}
                className="w-[794px] min-h-[1123px] bg-white shadow-2xl border border-slate-300 relative flex flex-col justify-between p-[44px] box-border text-[#1e293b]"
              >
                {/* ── Top Header / Headpad ── */}
                {showHeadpad && (
                  <div>
                    {pageIdx === 0 || headpadOnAllPages ? (
                      /* Page 1: Full Official ALT-S Headpad */
                      <div className="mb-8 w-full flex items-end">
                        {/* Left: Company Logo */}
                        <img
                          src={selectedCompany.logoUrl}
                          alt={`${selectedCompany.name} Logo`}
                          className="max-h-[85px] max-w-[260px] object-contain shrink-0 object-left-bottom -mb-1 mix-blend-multiply"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />

                        {/* Right: Gray Bar with Text Anchored on Top */}
                        <div className="flex-1 h-[18px] rounded-l-lg ml-1 relative" style={{ backgroundColor: selectedCompany.themeColor }}>
                          <div className="absolute right-0 bottom-full text-[10.5px] leading-[1.4] text-slate-800 text-left font-sans border-l-2 border-[color:var(--theme-color)] pl-3 pb-1 w-max pr-1">
                            <p className="font-bold text-[11px] uppercase text-brand-900 border-b-[1.5px] border-[color:var(--theme-color)] pb-[3px] mb-[3px] mt-0">
                              {selectedCompany.headerText.toUpperCase()}
                            </p>
                            <div className="whitespace-pre-line text-slate-800">
                              {selectedCompany.address}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Subsequent Pages: Neat Header Band */
                      <div className="mb-4 pb-2 border-b border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
                        <div className="flex items-center space-x-2">
                          <img src={selectedCompany.logoUrl} alt={selectedCompany.name} className="h-[20px] object-contain" />
                          <span className="font-semibold text-slate-700">{documentTitle}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>Ref: {variables.refNo || `DOC/${new Date().getFullYear()}/01`}</span>
                          <span className="font-bold text-slate-800">Page {pageIdx + 1} of {pages.length}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Document Body Content for this Page ── */}
                <div
                  ref={el => { editorRefs.current[pageIdx] = el; }}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => handlePageInput(pageIdx)}
                  style={{ fontSize: fontSize, "--theme-color": selectedCompany.themeColor } as any}
                  className="flex-1 outline-none text-[#1e293b] leading-normal font-normal min-h-[700px] cursor-text"
                />

                {/* ── Official ALT-S Footer ── */}
                {showFooter && (
                  <div className="mt-6 pt-3 border-t border-slate-300 select-none">
                    <div className="flex items-center justify-between text-[9px] text-slate-600 pb-1">
                      <p>Web: <span className="text-blue-700 font-semibold">{selectedCompany.website}</span> | Email: <span className="text-blue-700 font-semibold">{selectedCompany.email}</span></p>
                      <p className="font-bold text-slate-800">Page {pageIdx + 1} of {pages.length}</p>
                      <p>Phone: {selectedCompany.phone}</p>
                    </div>

                    {/* Official Corporate Identification & Tax Registration Bar */}
                    <div className="text-white px-3 py-1.5 text-[8.5px] flex items-center justify-between rounded-sm mt-1" style={{ backgroundColor: selectedCompany.themeColor }}>
                      <span>{selectedCompany.id === 'alt_s' ? 'CIN: ' : 'CR: '}<strong className="font-mono text-cyan-200">{selectedCompany.cin}</strong></span>
                      <span className="font-semibold tracking-wide">{selectedCompany.headerText.toUpperCase()}</span>
                      <span>{selectedCompany.id === 'alt_s' ? 'GSTIN: ' : 'TRN: '}<strong className="font-mono text-cyan-200">{selectedCompany.gstin}</strong></span>
                    </div>
                  </div>
                )}

                {/* ── Draggable Stamps / Signatures for this Page ── */}
                {pageStamps.map(stamp => {
                  const isSelected = selectedStampId === stamp.id;
                  return (
                    <div
                      key={stamp.id}
                      onMouseDown={(e) => handleStampMouseDown(e, stamp.id)}
                      style={{
                        position: 'absolute',
                        left: `${stamp.x}px`,
                        top: `${stamp.y}px`,
                        width: `${stamp.w}px`,
                        height: `${stamp.h}px`,
                        transform: `rotate(${stamp.rotation}deg)`,
                        opacity: stamp.opacity,
                        cursor: 'grab'
                      }}
                      className={`group select-none ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-1 hover:ring-indigo-300'}`}
                    >
                      {stamp.type === 'date' ? (
                        <div className="w-full h-full border-2 border-dashed border-indigo-800 bg-slate-50/90 text-indigo-950 flex flex-col items-center justify-center p-2 rounded shadow text-center text-[10px] font-bold">
                          {stamp.text?.split('\n').map((line, idx) => (
                            <div key={idx}>{line}</div>
                          ))}
                        </div>
                      ) : (
                        <img
                          src={stamp.src}
                          alt="Stamp"
                          className="w-full h-full object-contain pointer-events-none drop-shadow"
                        />
                      )}

                      {/* Controls on hover / select */}
                      {isSelected && (
                        <div className="absolute -top-7 right-0 flex items-center space-x-1 bg-brand-900 text-white rounded px-1.5 py-0.5 text-[10px] shadow z-30 no-print">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateSelectedStamp('rotation', (stamp.rotation - 15) % 360); }}
                            className="hover:text-cyan-300 p-0.5"
                            title="Rotate Left"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateSelectedStamp('rotation', (stamp.rotation + 15) % 360); }}
                            className="hover:text-cyan-300 p-0.5"
                            title="Rotate Right"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeSelectedStamp(); }}
                            className="hover:text-red-400 p-0.5 ml-1"
                            title="Delete Stamp"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* ── Bottom Page Adder ── */}
        <div className="py-6 flex flex-col items-center gap-3">


          <button
            onClick={() => addNewPage(pages.length - 1)}
            className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-brand-900 font-bold px-5 py-2.5 rounded-lg border-2 border-dashed border-slate-300 shadow-sm hover:shadow active:scale-95 transition-all text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Next A4 Page</span>
          </button>
          <p className="text-[11px] text-slate-500">Document currently contains {pages.length} standard A4 page{pages.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* ── Handwritten Signature Drawing Modal ── */}
      {drawModalOpen && (
        <div className="fixed inset-0 bg-brand-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-[#1a2b49] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PenTool className="w-4 h-4 text-cyan-300" />
                <h3 className="text-sm font-bold">Draw Handwritten Signature (Page {activePageIndex + 1})</h3>
              </div>
              <button onClick={() => setDrawModalOpen(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-xs text-slate-500 mb-3">
                Draw your signature in the box below using your mouse, trackpad, or stylus.
              </p>

              <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50/50 p-1">
                <canvas
                  ref={drawCanvasRef}
                  width={460}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={drawMove}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full h-[180px] bg-white cursor-crosshair rounded"
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    const canvas = drawCanvasRef.current;
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      ctx?.clearRect(0, 0, canvas.width, canvas.height);
                    }
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-red-600 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Pad</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setDrawModalOpen(false)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveDrawnSignature}
                    className="px-4 py-1.5 text-xs font-bold bg-brand-900 hover:bg-brand-800 text-white rounded shadow"
                  >
                    Apply to Page {activePageIndex + 1}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── Request Signatures Modal ── */}
      {showRequestSigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-brand-900" />
                <h3 className="text-base font-bold text-slate-900">Request Signatures</h3>
              </div>
              <button
                onClick={() => setShowRequestSigModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-3 mb-4">
              Select one or both authorized signatories to approve and sign <strong className="text-slate-700">"{documentTitle}"</strong>.
            </p>

            <div className="space-y-4">
              {/* Signer 1: Siva Kumar */}
              <div className={`p-3 rounded-lg border transition-all ${selectedSigners.siva ? 'border-brand-900/40 bg-slate-50' : 'border-slate-200 bg-white'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSigners.siva}
                      onChange={(e) => setSelectedSigners(prev => ({ ...prev, siva: e.target.checked }))}
                      className="rounded border-slate-300 text-brand-900 focus:ring-brand-900"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Siva Kumar</p>
                      <p className="text-[11px] text-slate-500">Managing Director</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Managing Director</span>
                </label>
                {selectedSigners.siva && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Signer Email Address</label>
                    <input
                      type="email"
                      value={selectedSigners.sivaEmail}
                      onChange={(e) => setSelectedSigners(prev => ({ ...prev, sivaEmail: e.target.value }))}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-brand-900"
                      placeholder="siva@alt-s.com"
                    />
                  </div>
                )}
              </div>

              {/* Signer 2: Uma Mageshwari */}
              <div className={`p-3 rounded-lg border transition-all ${selectedSigners.uma ? 'border-brand-900/40 bg-slate-50' : 'border-slate-200 bg-white'}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSigners.uma}
                      onChange={(e) => setSelectedSigners(prev => ({ ...prev, uma: e.target.checked }))}
                      className="rounded border-slate-300 text-brand-900 focus:ring-brand-900"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Uma Mageshwari</p>
                      <p className="text-[11px] text-slate-500">Director</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Director</span>
                </label>
                {selectedSigners.uma && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200">
                    <label className="text-[10px] font-semibold text-slate-500 block mb-1">Signer Email Address</label>
                    <input
                      type="email"
                      value={selectedSigners.umaEmail}
                      onChange={(e) => setSelectedSigners(prev => ({ ...prev, umaEmail: e.target.value }))}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-brand-900"
                      placeholder="uma@alt-s.com"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowRequestSigModal(false)}
                className="text-xs font-semibold px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSendingSigRequest || (!selectedSigners.siva && !selectedSigners.uma)}
                onClick={async () => {
                  try {
                    setIsSendingSigRequest(true);
                    const docId = await handleSaveToVault();
                    if (!docId) {
                      notifyUser('Please ensure document is saved first.');
                      return;
                    }
                    if (selectedSigners.siva) {
                      DatabaseService.createSignatureRequest(
                        docId,
                        'siva_kumar',
                        selectedSigners.sivaEmail || 'siva@alt-s.com',
                        'HR Admin'
                      );
                    }
                    if (selectedSigners.uma) {
                      DatabaseService.createSignatureRequest(
                        docId,
                        'uma_mageshwari',
                        selectedSigners.umaEmail || 'uma@alt-s.com',
                        'HR Admin'
                      );
                    }
                    const names = [selectedSigners.siva ? 'Siva Kumar' : '', selectedSigners.uma ? 'Uma Mageshwari' : ''].filter(Boolean).join(' and ');
                    notifyUser(`Signature request sent to ${names}.`);
                    setShowRequestSigModal(false);
                    if (onRequestSignatureSuccess) onRequestSignatureSuccess(docId);
                  } catch (err: any) {
                    notifyUser(err.message || 'Error sending signature request');
                  } finally {
                    setIsSendingSigRequest(false);
                  }
                }}
                className="text-xs font-bold px-4 py-1.5 rounded bg-brand-900 hover:bg-brand-800 text-white disabled:opacity-50 flex items-center space-x-1.5 shadow-sm"
              >
                <Send className="w-3 h-3" />
                <span>{isSendingSigRequest ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
