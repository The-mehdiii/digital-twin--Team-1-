import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET user preferences
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let preferences = await prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    });

    // Create default preferences if not found
    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: {
          userId: session.user.id,
          theme: "dark",
          sidebarExpanded: true,
          fontSize: "medium",
          personality: "NEUTRAL",
          responseStyle: "BALANCED",
          customPrompt: "",
        },
      });
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

// PUT update user preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { theme, sidebarExpanded, fontSize, personality, responseStyle, customPrompt } = body;

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: session.user.id },
      update: {
        ...(theme !== undefined && { theme }),
        ...(sidebarExpanded !== undefined && { sidebarExpanded }),
        ...(fontSize !== undefined && { fontSize }),
        ...(personality !== undefined && { personality }),
        ...(responseStyle !== undefined && { responseStyle }),
        ...(customPrompt !== undefined && { customPrompt }),
      },
      create: {
        userId: session.user.id,
        theme: theme || "dark",
        sidebarExpanded: sidebarExpanded ?? true,
        fontSize: fontSize || "medium",
        personality: personality || "NEUTRAL",
        responseStyle: responseStyle || "BALANCED",
        customPrompt: customPrompt || "",
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
