import { SignatureProvider, SignatureCertificateInfo } from './SignatureProvider';
import { DSCTokenState, DocumentSignature } from '../../types';
import { CryptoService } from '../cryptoService';

export class DemoSignatureProvider implements SignatureProvider {
  providerId: 'demo_mode' = 'demo_mode';
  providerName = 'Demo Signature Mode';

  async connect(): Promise<DSCTokenState> {
    return {
      isConnected: true,
      holderName: 'Demo Signatory (Authorized)',
      issuer: 'SmartDoc Demo Certificate Authority',
      serialNumber: 'DEMO-9988-7766-5544',
      validUntil: '2028-12-31',
      algorithm: 'SHA-256 / RSA 2048-bit (Simulated)',
      pinValidated: true,
      providerType: 'Generic DSC'
    };
  }

  async disconnect(): Promise<void> {}

  async getCertificates(): Promise<SignatureCertificateInfo[]> {
    return [
      {
        holderName: 'Demo Authorized Signatory',
        issuer: 'SmartDoc Demo CA',
        serialNumber: 'DEMO-9988-7766-5544',
        validFrom: '2024-01-01',
        validUntil: '2028-12-31',
        algorithm: 'SHA-256 RSA',
        keyLength: 2048
      }
    ];
  }

  async validateCertificate(): Promise<boolean> {
    return true;
  }

  async signDocument(
    documentId: string, 
    documentHash: string, 
    signatoryName: string, 
    signatoryRole: string
  ): Promise<DocumentSignature> {
    const rawSignatureStr = `${documentId}:${documentHash}:${signatoryName}:${Date.now()}`;
    const sigHash = await CryptoService.generateSHA256(rawSignatureStr);

    return {
      id: `sig-demo-${Date.now()}`,
      documentId,
      signatoryName: signatoryName || 'Authorized Signatory (Demo)',
      signatoryRole: signatoryRole || 'HR Director',
      signatoryEmail: 'signatory@company.com',
      method: 'demo_mode',
      certificateSerial: 'DEMO-9988-7766-5544',
      certificateIssuer: 'SmartDoc Demo CA',
      algorithm: 'SHA-256 / RSA (Demo)',
      signedAt: new Date().toISOString(),
      signatureHash: sigHash,
      status: 'valid'
    };
  }

  async verifySignature(signature: DocumentSignature, documentHash: string): Promise<boolean> {
    return signature.status === 'valid';
  }
}
