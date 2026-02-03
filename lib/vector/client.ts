import { Index } from "@upstash/vector";

// Initialize Upstash Vector client
// You need to set UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN in .env.local
const vectorClient = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export { vectorClient };

// Types for vector operations
export interface VectorMetadata {
  documentId: string;
  chunkId: string;
  chunkIndex: number;
  content: string;
  filename: string;
  userId: string;
  [key: string]: string | number; // Index signature for compatibility with Upstash Dict
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
}
