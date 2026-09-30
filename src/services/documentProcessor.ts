import mammoth from 'mammoth';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DocumentSignature } from '../types';

export interface GeneratedDocumentResult {
  htmlContent: string;
  variableMap: Record<string, string>;
  detectedVariables: string[];
}

export class DocumentProcessor {
  /**
   * Parses an uploaded DOCX file and extracts raw text/HTML + variable placeholders {{var}}
   */
  static async parseDocxFile(file: File): Promise<{ rawText: string; htmlContent: string; detectedVariables: string[] }> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // Detect {{placeholders}} or words that look like caps variables
    const matches = html.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
    const detectedVariables = Array.from(new Set(matches.map(m => m.replace(/[{}]/g, ''))));

    return {
      rawText: result.value.replace(/<[^>]+>/g, ''),
      htmlContent: html,
      detectedVariables
    };
  }

  /**
   * Replaces all {{variable_name}} in raw template text with actual values
   */
  static interpolateTemplate(templateContent: string, values: Record<string, string>): string {
    let result = templateContent;
    Object.keys(values).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, values[key] || '');
    });
    return result;
  }

  /**
   * Generates a Data URL QR Code for document verification
   */
  static async generateQRCodeDataUrl(verificationUrl: string): Promise<string> {
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        margin: 1,
        width: 120,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      return qrDataUrl;
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      return '';
    }
  }

  /**
   * Renders the complete HTML letterhead preview with Compensation Tables, Signatures, and Verification Footer
   */
  static renderLetterheadHTML(
    title: string,
    interpolatedContent: string,
    values: Record<string, string>,
    signatures: DocumentSignature[] = [],
    documentNumber: string = 'DOC-2026-000124',
    qrDataUrl: string = ''
  ): string {
    const isSifra = interpolatedContent.includes('SIFRA') || values.company_name?.includes('SIFRA');
    const companyName = isSifra ? 'Sifratech Solutions' : 'ALT-S TECHNOLOGY PRIVATE LIMITED';
    const logoUrl = isSifra ? '/Sifratech.png' : '/altslogo.png';
    const companyAddress = isSifra 
      ? 'Sifratech Tech Park, Bangalore, India'
      : 'No. 4, Mullai Street, Thiruvalluvar Nagar,\nKamarajnagar, Poonamallee, Tiruvallur,\nTamil Nadu - 600071, INDIA';

    // Annexure I Compensation Table renderer if placeholders exist
    let formattedContent = interpolatedContent;
    if (formattedContent.includes('[COMPENSATION_TABLE]')) {
      const tableHtml = `
      <div style="margin-top: 20px; margin-bottom: 20px; font-size: 13px;">
        <h4 style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">ANNEXURE – I: REMUNERATION STRUCTURE</h4>
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; border: 1px solid #cbd5e1;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 2px solid #94a3b8;">
              <th style="padding: 8px 12px; border: 1px solid #cbd5e1;">Component</th>
              <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: right;">Monthly (INR)</th>
              <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: right;">Annual (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0;">Basic Pay</td>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${values.basic_monthly || '1,20,000.00'}</td>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${values.basic_annual || '14,40,000.00'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0;">House Rent Allowance (HRA)</td>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${values.hra_monthly || '40,000.00'}</td>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${values.hra_annual || '4,80,000.00'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0;">Special Allowance</td>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${values.special_monthly || '38,200.00'}</td>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${values.special_annual || '4,58,400.00'}</td>
            </tr>
            <tr style="background-color: #f8fafc; font-weight: 600;">
              <td style="padding: 6px 12px; border: 1px solid #cbd5e1;">MONTHLY GROSS</td>
              <td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">₹${values.gross_monthly || '1,98,200.00'}</td>
              <td style="padding: 6px 12px; border: 1px solid #cbd5e1; text-align: right; font-family: monospace;">₹${values.gross_annual || '23,78,400.00'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0;">Firm Contribution to PF</td>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${values.pf_monthly || '1,800.00'}</td>
              <td style="padding: 6px 12px; border: 1px solid #e2e8f0; text-align: right; font-family: monospace;">₹${values.pf_annual || '21,600.00'}</td>
            </tr>
            <tr style="background-color: #e0f2fe; font-weight: 700; color: #0369a1;">
              <td style="padding: 8px 12px; border: 1px solid #93c5fd;">TOTAL COST TO COMPANY (CTC)</td>
              <td style="padding: 8px 12px; border: 1px solid #93c5fd; text-align: right; font-family: monospace;">₹${values.ctc_monthly || '2,00,000.00'}</td>
              <td style="padding: 8px 12px; border: 1px solid #93c5fd; text-align: right; font-family: monospace;">₹${values.ctc_annual || '24,00,000.00'}</td>
            </tr>
          </tbody>
        </table>
      </div>`;
      formattedContent = formattedContent.replace('[COMPENSATION_TABLE]', tableHtml);
    }

    // Convert linebreaks to paragraphs
    const paragraphsHtml = formattedContent.split('\n\n').map(p => `<p style="margin-bottom: 12px; line-height: 1.6; font-size: 13px; color: #334155;">${p.replace(/\n/g, '<br/>')}</p>`).join('');

    // Signatures HTML rendering
    let signatureBlockHtml = '';
    if (signatures.length > 0) {
      signatureBlockHtml = `
      <div style="margin-top: 36px; padding-top: 16px; border-top: 2px dashed #cbd5e1;">
        <h5 style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">Cryptographic Digital Signatures Applied</h5>
        <div style="display: flex; gap: 24px; flex-wrap: wrap;">
          ${signatures.map(sig => `
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; width: 260px; position: relative;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 10px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">DIGITALLY SIGNED</span>
                <span style="font-size: 10px; color: #64748b;">${new Date(sig.signedAt).toLocaleDateString()}</span>
              </div>
              <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0;">${sig.signatoryName}</p>
              <p style="font-size: 11px; color: #475569; margin: 2px 0 8px 0;">${sig.signatoryRole}</p>
              <div style="font-size: 9px; font-family: monospace; color: #64748b; border-t: 1px solid #e2e8f0; padding-top: 6px;">
                Cert: ${sig.certificateIssuer || 'SmartDoc CA'}<br/>
                Serial: ${sig.certificateSerial || 'DEMO-8A9F-341C'}<br/>
                Hash: ${sig.signatureHash.substring(0, 16)}...
              </div>
            </div>
          `).join('')}
        </div>
      </div>`;
    }

    return `
    <div id="pdf-document-paper" class="document-paper" style="background: #ffffff; color: #0f172a; font-family: 'Inter', sans-serif; padding: 40px; box-sizing: border-box;">
      
      <!-- Letterhead Header (Synced from DocumentBuilder) -->
      <div style="margin-bottom: 32px; width: 100%; display: flex; align-items: flex-end;">
        <!-- Left: Company Logo -->
        <img
          src="${logoUrl}"
          alt="${companyName}"
          style="max-height: 85px; max-width: 260px; object-fit: contain; flex-shrink: 0; object-position: left bottom; margin-bottom: -4px; mix-blend-mode: multiply;"
        />

        <!-- Right: Gray Bar with Text Anchored on Top -->
        <div style="flex: 1; height: 18px; background-color: #0a3161; border-top-left-radius: 8px; border-bottom-left-radius: 8px; margin-left: 4px; position: relative;">
          <div style="position: absolute; right: 0; bottom: 100%; font-size: 10.5px; line-height: 1.4; color: #1e293b; text-align: left; font-family: sans-serif; border-left: 2px solid #0a3161; padding-left: 12px; padding-bottom: 4px; width: max-content; padding-right: 4px;">
            <p style="font-weight: bold; font-size: 11px; text-transform: uppercase; color: #0f172a; border-bottom: 1.5px solid #0a3161; padding-bottom: 3px; margin-bottom: 3px; margin-top: 0;">
              ${companyName}
            </p>
            <div style="white-space: pre-line; color: #1e293b;">
              ${companyAddress}
            </div>
          </div>
        </div>
      </div>

      <!-- Document Content Body -->
      <div style="min-height: 650px;">
        ${paragraphsHtml}
      </div>

      <!-- Digital Signatures Section -->
      ${signatureBlockHtml}

      <!-- Verification Footer & QR Code -->
      <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 16px;">
          ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR Code" style="width: 70px; height: 70px; border: 1px solid #cbd5e1; padding: 2px; border-radius: 6px;" />` : ''}
          <div>
            <p style="font-size: 11px; font-weight: 700; color: #0f172a; margin: 0;">DOCUMENT INTEGRITY & AUTHENTICITY VERIFIED</p>
            <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0;">Document ID: <strong>${documentNumber}</strong> | SHA-256 Tamper-Proof Cryptographic Hash Embedded</p>
            <p style="font-size: 9px; color: #0284c7; margin: 2px 0 0 0;">Scan QR code or visit SmartDoc Sign portal to verify original hash & validity.</p>
          </div>
        </div>
        <div style="text-align: right; font-size: 9px; color: #94a3b8;">
          Page 1 of 1<br/>
          SmartDoc Sign Enterprise Platform
        </div>
      </div>

    </div>`;
  }

  /**
   * Downloads a PDF document from an HTML element using html2canvas & jsPDF
   */
  static async exportToPDF(elementId: string, filename: string = 'Document.pdf'): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element #${elementId} not found for PDF export.`);
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; // A4 width mm
    const pageHeight = 297; // A4 height mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
    pdf.save(filename);
  }
}
