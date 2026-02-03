declare module "pdf-parse" {
  export interface PdfParseResult {
    numpages?: number;
    numrender?: number;
    info?: any;
    text?: string;
    metadata?: any;
    version?: string;
  }

  function pdfParse(data: Buffer | Uint8Array | ArrayBuffer | string): Promise<PdfParseResult>;

  export default pdfParse;
}
declare module 'pdf-parse' {
  import { Buffer } from 'buffer';
  interface PDFInfo {
    numpages: number;
    numrender: number;
    info: Record<string, any>;
    metadata: any;
    version: string;
    text: string;
  }
  function pdfParse(buffer: Buffer | Uint8Array, options?: any): Promise<PDFInfo>;
  export = pdfParse;
}
