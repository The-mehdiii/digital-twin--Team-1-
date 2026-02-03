import { vectorClient, VectorMetadata } from "./client";

/**
 * Upsert document chunks to Upstash Vector
 * Note: Your Upstash index must be configured with an embedding model
 * (e.g., mixedbread-ai/mxbai-embed-large-v1)
 */
export async function upsertChunks(
  chunks: {
    id: string;
    content: string;
    metadata: VectorMetadata;
  }[]
): Promise<void> {
  // Upstash Vector with embedding model configured accepts data directly
  const vectors = chunks.map((chunk) => ({
    id: chunk.id,
    data: chunk.content, // Upstash will auto-embed this text
    metadata: chunk.metadata as Record<string, string | number>,
  }));

  // Batch upsert (Upstash supports up to 1000 at a time)
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await vectorClient.upsert(batch);
  }
}

/**
 * Delete all vectors for a document
 */
export async function deleteDocumentVectors(documentId: string): Promise<void> {
  // Query for all vectors with this documentId and delete them
  // This is a workaround since Upstash doesn't support delete by metadata filter directly
  // We'll need to track vectorIds in our database
  try {
    const results = await vectorClient.query({
      data: "placeholder", // Required for query
      topK: 1000,
      filter: `documentId = '${documentId}'`,
      includeMetadata: true,
    });

    if (results.length > 0) {
      const idsToDelete = results.map((r) => String(r.id));
      await vectorClient.delete(idsToDelete);
    }
  } catch (error) {
    console.error("Error deleting vectors:", error);
    // If filter query fails, we'll rely on the vectorIds stored in our DB
    throw error;
  }
}
