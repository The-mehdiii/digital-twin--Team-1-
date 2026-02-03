export interface TextChunk {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
}

export interface ChunkOptions {
  chunkSize?: number; // Target size of each chunk in characters
  chunkOverlap?: number; // Overlap between chunks for context continuity
  minChunkSize?: number; // Minimum chunk size to avoid tiny fragments
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  chunkSize: 1000, // ~200-250 words
  chunkOverlap: 200, // ~40-50 words overlap
  minChunkSize: 100, // Minimum 100 chars per chunk
};

/**
 * Split text into overlapping chunks for embedding
 */
export function chunkText(text: string, options: ChunkOptions = {}): TextChunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: TextChunk[] = [];

  if (!text || text.length === 0) {
    return chunks;
  }

  // If text is smaller than chunk size, return as single chunk
  if (text.length <= opts.chunkSize) {
    return [
      {
        content: text,
        index: 0,
        startChar: 0,
        endChar: text.length,
      },
    ];
  }

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    // Calculate end of this chunk
    let endIndex = startIndex + opts.chunkSize;

    // Don't go past the end of text
    if (endIndex >= text.length) {
      endIndex = text.length;
    } else {
      // Try to break at a sentence or paragraph boundary
      endIndex = findBreakPoint(text, startIndex, endIndex, opts.chunkSize);
    }

    const chunkContent = text.slice(startIndex, endIndex).trim();

    // Only add chunk if it meets minimum size
    if (chunkContent.length >= opts.minChunkSize) {
      chunks.push({
        content: chunkContent,
        index: chunkIndex,
        startChar: startIndex,
        endChar: endIndex,
      });
      chunkIndex++;
    }

    // Move start for next chunk (with overlap)
    startIndex = endIndex - opts.chunkOverlap;

    // Don't move backwards
    if (startIndex <= chunks[chunks.length - 1]?.startChar) {
      startIndex = endIndex;
    }

    // Safety check: avoid infinite loop
    if (startIndex >= text.length) break;
  }

  return chunks;
}

/**
 * Find a good break point (sentence/paragraph boundary) near the target end
 */
function findBreakPoint(
  text: string,
  start: number,
  target: number,
  _maxChunkSize: number
): number {
  const searchStart = Math.max(start, target - 200);
  const searchEnd = Math.min(text.length, target + 100);
  const searchRegion = text.slice(searchStart, searchEnd);

  // Priority order for break points:
  // 1. Paragraph break (double newline)
  // 2. Single newline
  // 3. Sentence end (. ! ?)
  // 4. Comma or semicolon
  // 5. Space

  // Look for paragraph break first
  const paragraphBreak = searchRegion.lastIndexOf("\n\n");
  if (paragraphBreak > 0) {
    return searchStart + paragraphBreak + 2;
  }

  // Look for newline
  const newline = searchRegion.lastIndexOf("\n");
  if (newline > 0) {
    return searchStart + newline + 1;
  }

  // Look for sentence end
  const sentenceMatch = searchRegion.match(/[.!?]['"']?\s+/g);
  if (sentenceMatch) {
    const lastSentenceEnd = searchRegion.lastIndexOf(sentenceMatch[sentenceMatch.length - 1]);
    if (lastSentenceEnd > 0) {
      return searchStart + lastSentenceEnd + sentenceMatch[sentenceMatch.length - 1].length;
    }
  }

  // Look for comma/semicolon
  const punctuation = searchRegion.lastIndexOf(", ");
  if (punctuation > 0) {
    return searchStart + punctuation + 2;
  }

  // Fall back to any space
  const space = searchRegion.lastIndexOf(" ");
  if (space > 0) {
    return searchStart + space + 1;
  }

  // Fall back to target
  return target;
}

/**
 * Estimate processing stats for a document
 */
export function estimateChunks(textLength: number, options: ChunkOptions = {}): number {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (textLength <= opts.chunkSize) return 1;

  const effectiveChunkSize = opts.chunkSize - opts.chunkOverlap;
  return Math.ceil(textLength / effectiveChunkSize);
}
