import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserDocuments } from "@/lib/documents/processor";

// GET /api/documents - List user's documents
export async function GET(_request: NextRequest) {
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

    const documents = await getUserDocuments(session.user.id);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
