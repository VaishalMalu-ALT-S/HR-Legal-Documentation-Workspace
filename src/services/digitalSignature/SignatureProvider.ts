import { DSCTokenState, DocumentSignature } from '../../types';

export interface SignatureCertificateInfo {
  holderName: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validUntil: string;
  algorithm: string;
  keyLength: number;
}

export interface SignatureProvider {
  providerId: 'dsc_token' | 'demo_mode' | 'esign';
  providerName: string;

  connect(): Promise<DSCTokenState>;
  disconnect(): Promise<void>;
  getCertificates(): Promise<SignatureCertificateInfo[]>;
  validateCertificate(certSerial: string, pin?: string): Promise<boolean>;
  signDocument(documentId: string, documentHash: string, signatoryName: string, signatoryRole: string, pin?: string): Promise<DocumentSignature>;
  verifySignature(signature: DocumentSignature, documentHash: string): Promise<boolean>;
}
