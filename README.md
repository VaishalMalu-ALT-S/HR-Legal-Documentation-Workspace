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

## 🔐 Login Credentials & Roles (RBAC)

The application includes preconfigured accounts with Role-Based Access Control:

| Role | User Name | Login Email | Password | Permissions & Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **HR Admin** | HR Administrator | `hr@alt-s.com` | `admin123` *(or any)* | **Full Workspace Access**: Multi-Page Letterhead Editor, Document Builder, Drafts Manager, Signature Center, Request Approvals, Audit Logs |
| **Managing Director** | Siva Kumar | `siva@alt-s.com` | `admin123` *(or any)* | **Executive Review**: Document Approvals & Director Digital Signing Studio |
| **Board Director** | Uma Mageshwari | `uma@alt-s.com` | `admin123` *(or any)* | **Executive Review**: Document Approvals & Director Digital Signing Studio |

> **💡 Quick Sign-In Tip**:
> - On the login screen, click any of the **Demo Accounts (Click to Auto-fill)** buttons to automatically populate the email and password and sign in immediately.
> - For local development, **any non-empty password** is accepted. The system routes the user to the appropriate role based on the email entered (`siva*` for Siva Kumar, `uma*` for Uma Mageshwari, and any other email for HR Admin).

---

## Project Structure & Architecture

```
HR-Legal-Documentation-Workspace/
├── .vscode/                       # IDE editor settings
├── docs/                          # Guides, specifications, & workflows
│   ├── OTP_IMPLEMENTATION.md      # Email OTP workflow documentation
│   └── guides/                    # Deployment & quality guidelines
├── public/                        # Static assets served by Vite
│   ├── altslogo.png               # Official ALT-S corporate logo
│   ├── LinkERP.png                # LinkERP brand logo
│   ├── Sifratech.png              # Sifratech brand logo
│   ├── siva_sig.png               # Digital signature asset for Siva Kumar
│   ├── uma_sig.png                # Digital signature asset for Uma Mageshwari
│   ├── sign1.jpg / sign2.jpg      # Sample uploaded signatures
│   └── favicon.png                # Application favicon
├── resources/                     # Source documents & vector assets
│   ├── branding/                  # Master AI, EPS, SVG, and high-res brand assets
│   └── templates/                 # Reference DOCX & PDF source contracts
├── src/
│   ├── components/                # Modular UI views & modals
│   │   ├── ApprovalWorkflow.tsx   # Multi-tier director approval interface
│   │   ├── AuthScreens.tsx        # Authentication & login screen with quick-fill
│   │   ├── DocumentBuilder.tsx    # Multi-page A4 letterhead editor
│   │   ├── DocumentUploader.tsx   # PDF/DOCX import and parser
│   │   ├── DraftsManager.tsx      # Draft document management
│   │   ├── Header.tsx             # Global application navbar & status
│   │   ├── LegalModals.tsx        # Privacy policy & terms of service
│   │   ├── OtpVerificationModal.tsx # OTP challenge modal
│   │   ├── RoleSwitcher.tsx       # Live role-switching badge
│   │   ├── SecureSharingModal.tsx # Time-bounded link generator
│   │   ├── Sidebar.tsx            # Navigation rail & templates
│   │   ├── SignatureCenter.tsx    # Stamp and digital signature studio
│   │   └── SmartCopilot.tsx       # AI assistant drawer
│   ├── data/
│   │   ├── companies.ts           # Multi-entity configuration (ALT-S, Sifratech, LinkERP)
│   │   ├── seededData.ts          # Default mock employees & templates
│   │   └── templates.ts           # Preloaded corporate contract templates
│   ├── services/
│   │   ├── digitalSignature/      # Pluggable signature providers (DSC, eSign, Demo)
│   │   ├── aiAssistant.ts         # SmartCopilot prompt parser
│   │   ├── cryptoService.ts       # SHA-256 ledger & verification hashes
│   │   ├── dbService.ts           # Reactive database service & local cache
│   │   ├── documentProcessor.ts   # jsPDF & HTML canvas export rendering
│   │   ├── supabaseClient.ts      # Supabase client instantiation
│   │   └── SupabaseSync.ts        # Cloud database synchronization
│   ├── supabase/
│   │   └── schema.sql             # PostgreSQL schema definition
│   ├── types/
│   │   └── index.ts               # Core TypeScript models and interfaces
│   ├── utils/
│   │   └── stampGenerator.ts      # Vector company seal generator
│   ├── App.tsx                    # Root application component
│   ├── main.tsx                   # React 19 application entry point
│   └── index.css                  # Global Tailwind CSS styling
├── .env                           # Environment variables
├── .gitignore                     # Git ignore rules
├── eslint.config.js               # ESLint configuration
├── index.html                     # HTML root template
├── package.json                   # Project metadata & npm scripts
├── postcss.config.js              # PostCSS configuration
├── README.md                      # Project documentation
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite bundler configuration
```

---

## License

Proprietary and Confidential. Copyright (c) 2026 ALT-S Technology Private Limited. All rights reserved.
