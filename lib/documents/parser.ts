import mammoth from "mammoth";
import pdfParse from "pdf-parse";
import JSZip from "jszip";

// pdf-parse v1 has a simple API: pdfParse(buffer) returns { text, numpages }
async function parsePdfBuffer(buffer: Buffer): Promise<{ text: string; pageCount: number }> {
  const result = await pdfParse(buffer);
  return {
    text: result.text,
    pageCount: result.numpages,
  };
}

export type SupportedFileType = "pdf" | "docx" | "pptx" | "txt" | "md";

export interface ParseResult {
  text: string;
  pageCount?: number;
  wordCount: number;
}

/**
 * Detect file type from filename
 */
export function getFileType(filename: string): SupportedFileType | null {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return "pdf";
    case "docx":
      return "docx";
    case "pptx":
      return "pptx";
    case "txt":
      return "txt";
    case "md":
    case "markdown":
      return "md";
    default:
      return null;
  }
}

/**
 * Parse a document and extract text content
 */
export async function parseDocument(
  buffer: Buffer,
  fileType: SupportedFileType
): Promise<ParseResult> {
  let text = "";
  let pageCount: number | undefined;

  switch (fileType) {
    case "pdf": {
      const pdfResult = await parsePdfBuffer(buffer);
      text = pdfResult.text;
      pageCount = pdfResult.pageCount;
      break;
    }

    case "docx":
      const docxResult = await mammoth.extractRawText({ buffer });
      text = docxResult.value;
      break;

    case "pptx": {
      // Extract slide text from PPTX (zip of XML files)
      const zip = await JSZip.loadAsync(buffer);
      const slideFiles = Object.keys(zip.files).filter((p) =>
        p.startsWith("ppt/slides/slide") && p.endsWith(".xml")
      );

      const slideTexts: string[] = [];
      for (const slidePath of slideFiles.sort()) {
        try {
          const content = await zip.files[slidePath].async("string");
          // Extract text inside <a:t> ... </a:t> tags (PowerPoint uses a:t)
          const matches = [...content.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi)];
          const slideText = matches.map((m) => m[1].replace(/\s+/g, " ").trim()).join(" ");
          if (slideText.length > 0) slideTexts.push(slideText);
        } catch (e) {
          // ignore individual slide parse errors
        }
      }

      text = slideTexts.join("\n\n");
      pageCount = slideTexts.length;
      break;
    }

    case "txt":
    case "md":
      text = buffer.toString("utf-8");
      break;

    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }

  // Clean up the text
  text = cleanText(text);

  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;

  return {
    text,
    pageCount,
    wordCount,
  };
}

/**
 * Clean extracted text
 */
function cleanText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove excessive newlines
    .replace(/\n{3,}/g, "\n\n")
    // Remove excessive spaces
    .replace(/[ \t]+/g, " ")
    // Trim lines
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

/**
 * Validate file before processing
 */
export function validateFile(
  filename: string,
  fileSize: number
): { valid: boolean; error?: string } {
  const fileType = getFileType(filename);

  if (!fileType) {
    return {
      valid: false,
      error: "Unsupported file type. Please upload PDF, DOCX, PPTX, TXT, or MD files.",
    };
  }

  // Max file size: 10MB
  const maxSize = 10 * 1024 * 1024;
  if (fileSize > maxSize) {
    return {
      valid: false,
      error: "File too large. Maximum size is 10MB.",
    };
  }

  return { valid: true };
}
