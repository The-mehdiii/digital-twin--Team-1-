import { vectorClient, VectorMetadata, VectorSearchResult } from "./client";

/**
 * Search for relevant document chunks based on a query
 */
export async function searchDocuments(
  query: string,
  userId: string,
  options: {
    topK?: number;
    minScore?: number;
  } = {}
): Promise<VectorSearchResult[]> {
  const { topK = 5, minScore = 0.7 } = options;

  try {
    const results = await vectorClient.query({
      data: query, // Upstash will embed this query text
      topK,
      filter: `userId = '${userId}'`, // Only search user's documents
      includeMetadata: true,
      includeVectors: false,
    });

    // Filter by minimum score and type the results
    return results
      .filter((r) => r.score >= minScore)
      .map((r) => ({
        id: String(r.id),
        score: r.score,
        metadata: (r.metadata || {}) as unknown as VectorMetadata,
      }));
  } catch (error) {
    console.error("Error searching vectors:", error);
    return [];
  }
}

/**
 * Format search results as context for the AI
 */
export function formatContextForAI(results: VectorSearchResult[]): string {
  if (results.length === 0) {
    return "";
  }

  const contextParts = results.map((r, i) => {
    return `[Source ${i + 1}: ${r.metadata.filename}]
${r.metadata.content}`;
  });

  return `Here is relevant information from uploaded documents:

${contextParts.join("\n\n---\n\n")}

Use this context to answer the user's question. Cite sources when using specific information.`;
}
