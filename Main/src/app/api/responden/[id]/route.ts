// app/api/responden/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil detail responden
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const responden = await prisma.responden.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        platform: true,
        taskResults: {
          include: {
            task: true
          }
        },
        susAnswers: {
          include: {
            question: true
          }
        }
      }
    });

    if (!responden) {
      return NextResponse.json(
        { success: false, error: "Responden tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: responden
    });
  } catch (error) {
    console.error("Error fetching respondent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch respondent" },
      { status: 500 }
    );
  }
}

// PUT: Update responden
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updatedResponden = await prisma.responden.update({
      where: { id: parseInt(params.id) },
      data: {
        nama: body.nama,
        umur: parseInt(body.umur),
        jenisKelamin: body.jenisKelamin,
        platformId: parseInt(body.platformId)
      },
      include: {
        platform: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedResponden,
      message: "Responden berhasil diupdate"
    });
  } catch (error) {
    console.error("Error updating respondent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update respondent" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus responden
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Hapus data terkait terlebih dahulu
    await prisma.sUSAnswer.deleteMany({
      where: { respondenId: parseInt(params.id) }
    });

    await prisma.taskResult.deleteMany({
      where: { respondenId: parseInt(params.id) }
    });

    // Hapus responden
    await prisma.responden.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({
      success: true,
      message: "Responden berhasil dihapus"
    });
  } catch (error) {
    console.error("Error deleting respondent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete respondent" },
      { status: 500 }
    );
  }
}