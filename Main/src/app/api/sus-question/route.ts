// app/api/sus-question/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil semua pertanyaan SUS
export async function GET() {
  try {
    const questions = await prisma.sUSQuestion.findMany({
      orderBy: {
        id: "asc"
      }
    });

    return NextResponse.json({
      success: true,
      data: questions,
      count: questions.length
    });
  } catch (error) {
    console.error("Error fetching SUS questions:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pertanyaan SUS" },
      { status: 500 }
    );
  }
}