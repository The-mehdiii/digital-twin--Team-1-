import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteDocument } from "@/lib/documents/processor";

// GET /api/documents/[id] - Get a specific document
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const adminEmail = process.env.ADMIN_EMAIL;
    const { id } = await params;

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

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        chunks: {
          select: {
            id: true,
            chunkIndex: true,
            content: true,
          },
          orderBy: { chunkIndex: "asc" },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Verify ownership
    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const adminEmail = process.env.ADMIN_EMAIL;
    const { id } = await params;

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

    // Verify document exists and user owns it
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete document and vectors
    await deleteDocument(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

// PATCH /api/documents/[id] - Update document metadata
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const adminEmail = process.env.ADMIN_EMAIL;
    const { id } = await params;

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

    const body = await request.json();
    const { title, description } = body;

    // Verify document exists and user owns it
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
      },
      select: {
        id: true,
        filename: true,
        fileType: true,
        fileSize: true,
        title: true,
        description: true,
        status: true,
        chunkCount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}
