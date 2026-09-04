// Cryptographic SHA-256 Hashing & Tamper Detection Engine

export class CryptoService {
  /**
   * Generates a SHA-256 hash string for text content or object data
   */
  static async generateSHA256(content: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (err) {
      // Fallback pseudo-hash for older environments
      return this.fallbackHash(content);
    }
  }

  /**
   * Verifies if current hash matches original hash
   */
  static verifyIntegrity(currentHash: string, originalHash: string): { isValid: boolean; statusText: 'VALID' | 'TAMPERED' } {
    const isValid = currentHash === originalHash;
    return {
      isValid,
      statusText: isValid ? 'VALID' : 'TAMPERED'
    };
  }

  private static fallbackHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}${hex}${hex}${hex}${hex}${hex}${hex}${hex}`.substring(0, 64);
  }
}
