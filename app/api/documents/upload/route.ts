import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateFile, getFileType } from "@/lib/documents/parser";
import { processDocument } from "@/lib/documents/processor";

// POST /api/documents/upload - Upload a new document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminEmail) {
      return NextResponse.json(
        { error: "Server misconfigured: ADMIN_EMAIL is not set" },
        { status: 500 }
      );
    }

    if (session.user.email !== adminEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file.name, file.size);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const fileType = getFileType(file.name);
    if (!fileType) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    // Create document record with PENDING status
    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        filename: file.name,
        fileType: fileType,
        fileSize: file.size,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        status: "PENDING",
      },
    });

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process document (async - could be moved to background job for large files)
    // For now, we process synchronously
    const result = await processDocument(
      document.id,
      buffer,
      file.name,
      session.user.id
    );

    if (!result.success) {
      return NextResponse.json(
        {
          document: {
            id: document.id,
            status: "FAILED",
            error: result.error,
          },
        },
        { status: 200 } // Return 200 since the upload itself succeeded
      );
    }

    // Fetch updated document
    const updatedDocument = await prisma.document.findUnique({
      where: { id: document.id },
      select: {
        id: true,
        filename: true,
        fileType: true,
        fileSize: true,
        title: true,
        status: true,
        chunkCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ document: updatedDocument }, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
