// app/api/platform/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil semua platform
export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      include: {
        _count: {
          select: {
            responden: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: platforms
    });
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch platforms" },
      { status: 500 }
    );
  }
}