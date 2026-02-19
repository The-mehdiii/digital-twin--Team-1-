import { prisma } from "@/lib/prisma";
import { parseDocument, getFileType } from "./parser";
import { chunkText } from "./chunker";
import { upsertChunks, deleteDocumentVectors } from "@/lib/vector/embedder";
import { VectorMetadata } from "@/lib/vector/client";

/**
 * Process a document: parse → chunk → embed → store
 */
export async function processDocument(
  documentId: string,
  buffer: Buffer,
  filename: string,
  userId: string
): Promise<{ success: boolean; error?: string; chunkCount?: number }> {
  try {
    // Update status to PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "PROCESSING" },
    });

    // 1. Validate file type
    const fileType = getFileType(filename);
    if (!fileType) {
      throw new Error("Unsupported file type");
    }

    // 2. Parse document to extract text
    const parseResult = await parseDocument(buffer, fileType);

    if (!parseResult.text || parseResult.text.length === 0) {
      throw new Error("Could not extract text from document");
    }

    // 3. Chunk the text
    const chunks = chunkText(parseResult.text);

    if (chunks.length === 0) {
      throw new Error("Document produced no valid chunks");
    }

    // 4. Create chunk records in database
    const chunkRecords = await prisma.$transaction(
      chunks.map((chunk, index) =>
        prisma.documentChunk.create({
          data: {
            documentId,
            content: chunk.content,
            chunkIndex: index,
          },
        })
      )
    );

    // 5. Prepare vectors with metadata
    const vectorData = (chunkRecords as { id: string }[]).map((record, index) => ({
      id: record.id,
      content: chunks[index].content,
      metadata: {
        documentId,
        chunkId: record.id,
        chunkIndex: index,
        content: chunks[index].content.slice(0, 500), // Store truncated for display
        filename,
        userId,
      } as VectorMetadata,
    }));

    // 6. Upsert to vector database
    await upsertChunks(vectorData);

    // 7. Update chunk records with vectorIds
    await prisma.$transaction(
      chunkRecords.map((record) =>
        prisma.documentChunk.update({
          where: { id: record.id },
          data: { vectorId: record.id }, // Using same ID for simplicity
        })
      )
    );

    // 8. Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "INDEXED",
        chunkCount: chunks.length,
        pageCount: parseResult.pageCount ?? undefined,
      },
    });

    return { success: true, chunkCount: chunks.length };
  } catch (error) {
    console.error("Document processing error:", error);

    // Update document with error status
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Delete a document and its vectors
 */
export async function deleteDocument(documentId: string): Promise<void> {
  // Get the document to check it exists
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { chunks: true },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  // Delete vectors from Upstash
  if (document.chunks.length > 0) {
    try {
      await deleteDocumentVectors(documentId);
    } catch (error) {
      console.error("Error deleting vectors:", error);
      // Continue with database deletion even if vector deletion fails
    }
  }

  // Delete from database (cascades to chunks)
  await prisma.document.delete({
    where: { id: documentId },
  });
}

/**
 * Get all documents for a user
 */
export async function getUserDocuments(userId: string) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      filename: true,
      fileType: true,
      fileSize: true,
      title: true,
      description: true,
      status: true,
      pageCount: true,
      chunkCount: true,
      errorMessage: true,
      createdAt: true,
    },
  });
}
