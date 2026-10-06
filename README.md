# ALT-S HR & Legal Documentation Workspace

## Overview

ALT-S HR & Legal Documentation Workspace (SmartDocSign) is an enterprise-grade document creation, digital signing, and verification platform designed for ALT-S Technology Private Limited. The application provides a complete lifecycle solution for generating official HR and legal documents, annotating and signing contracts, embedding corporate seals, and verifying document integrity via a cryptographic ledger.

---

## Core Capabilities

### 1. Multi-Page Letterhead Editor

- High-fidelity A4 multi-page document editor with page dimension boundaries (794px x 1123px).
- Dynamic page operations including page insertion, page reordering, page deletion, and overflow splitting.
- Built-in official ALT-S corporate letterhead (Headpad) on primary pages and header bands on subsequent pages.
- Standard corporate footer containing registered address, web and communication details, Corporate Identification Number (CIN: U72900TN2021PTC144887), and Goods and Services Tax Identification Number (GSTIN: 33AAGCA5656P1ZB).
- Rich text formatting tools: typography selection (Calibri, Arial, Inter, Times New Roman, Georgia, Courier New), point size controls, text alignment, structured tables, and color controls.
- Dynamic fields bar for batch updating candidate names, designations, dates, and reference numbers across all pages simultaneously.

### 2. Sign and Stamp Studio

- Multi-format document parser supporting PDF, DOCX (Microsoft Word), and raster image formats.
- Real-time signature drawing canvas with touch and stylus input support.
- Image-based signature upload with client-side transparent background removal and crop tools.
- Visual image adjustment controls including rotation (-180 deg to +180 deg), brightness, contrast, and ink opacity.
- Official ALT-S circular Corporate Seal placement with precise drag-and-drop coordinate tracking.
- Verified timestamp annotation generator.

### 3. Official Preloaded Company Templates

- **Asset Acknowledgment Letter**: Hardware allocation table (Device ID, asset type, accessories) and return policy declaration.
- **Appointment Letter - Solution Architect**: Full-time employment agreement with 4 discrete pages, comprehensive compensation breakdown (Annexure I), and mandatory document submission checklist (Annexure II).
- **Contractor Letter of Offer**: Statement of Work (SOW) agreement featuring monthly professional fee terms, 1% TDS clauses, and Key Result Areas (KRAs).
- **Appointment Letter - Admin Executive**: Executive appointment contract with consolidated monthly pay terms.
- **Blank Letterhead**: Standard template with official letterhead and footer for arbitrary administrative correspondence.

### 4. Secure Document Vault and Cryptographic Verification

- Centralized repository for drafts, pending approvals, and signed agreements.
- SHA-256 cryptographic hash computation for tamper detection and validation.
- Public Verification Portal allowing instant authenticity verification against the stored document ledger.
- Time-bounded secure link generation with configurable expiration and password protection.

---

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Bundler & Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **Iconography**: Lucide React
- **Document Processing**: jsPDF, html2canvas, mammoth.js, pdfjs-dist
- **Cryptography**: Web Crypto API (SHA-256)

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/VaishalMalu-ALT-S/HR-Legal-Documentation-Workspace.git
   cd HR-Legal-Documentation-Workspace
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Start the local development server:

   ```bash
   npm run dev
   ```
4. Build for production:

   ```bash
   npm run build
   ```
5. Preview production build locally:

   ```bash
   npm run preview
   ```

---

## Project Structure

```
├── public/
│   ├── altslogo.png            # Official ALT-S corporate logo
│   └── favicon.png             # Application favicon
├── src/
│   ├── components/
│   │   ├── DocumentBuilder.tsx     # Multi-page A4 letterhead editor
│   │   ├── SignatureCenter.tsx     # Sign and stamp studio
│   │   ├── DocumentVault.tsx       # Document repository and management
│   │   ├── DocumentVerification.tsx # Public verification portal
│   │   ├── Header.tsx              # Navigation bar and app switcher
│   │   ├── Sidebar.tsx             # Workspace navigation and template selector
│   │   └── SecureSharingModal.tsx  # Secure link generation
│   ├── data/
│   │   └── templates.ts            # Official company document templates
│   ├── services/
│   │   ├── dbService.ts            # Local database service and persistence
│   │   ├── cryptoService.ts        # Cryptographic hash generation and verification
│   │   └── documentProcessor.ts    # PDF and HTML rendering utilities
│   ├── utils/
│   │   └── stampGenerator.ts       # ALT-S corporate seal SVG generator
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces and type definitions
│   ├── App.tsx                     # Main application container
│   ├── main.tsx                    # Application entry point
│   └── index.css                   # Global styles and Tailwind imports
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## License

Proprietary and Confidential. Copyright (c) 2026 ALT-S Technology Private Limited. All rights reserved.
