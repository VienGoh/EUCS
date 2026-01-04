// app/api/responden/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil detail responden
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Unwrap params Promise
    const { id } = await params;
    
    // Validasi ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "ID responden tidak valid" },
        { status: 400 }
      );
    }

    const responden = await prisma.responden.findUnique({
      where: { id: parseInt(id) },
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
      { success: false, error: "Gagal mengambil data responden" },
      { status: 500 }
    );
  }
}

// PUT: Update responden
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Unwrap params Promise
    const { id } = await params;
    
    // Validasi ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "ID responden tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validasi data input
    if (!body.nama || !body.platformId) {
      return NextResponse.json(
        { success: false, error: "Data yang diperlukan tidak lengkap" },
        { status: 400 }
      );
    }

    // Cek apakah responden ada
    const existingResponden = await prisma.responden.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingResponden) {
      return NextResponse.json(
        { success: false, error: "Responden tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedResponden = await prisma.responden.update({
      where: { id: parseInt(id) },
      data: {
        nama: body.nama,
        umur: body.umur ? parseInt(body.umur) : undefined,
        jenisKelamin: body.jenisKelamin || undefined,
        platformId: parseInt(body.platformId)
      },
      include: {
        platform: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedResponden,
      message: "Responden berhasil diperbarui"
    });
  } catch (error: any) {
    console.error("Error updating respondent:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Responden tidak ditemukan" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui responden" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus responden
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Unwrap params Promise
    const { id } = await params;
    
    // Validasi ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: "ID responden tidak valid" },
        { status: 400 }
      );
    }

    const respondenId = parseInt(id);
    
    // Cek apakah responden ada
    const existingResponden = await prisma.responden.findUnique({
      where: { id: respondenId }
    });

    if (!existingResponden) {
      return NextResponse.json(
        { success: false, error: "Responden tidak ditemukan" },
        { status: 404 }
      );
    }

    // Hapus data terkait terlebih dahulu
    // Perbaikan: Pastikan nama model sesuai dengan schema.prisma Anda
    // Ganti sUSAnswer dengan nama model yang benar jika berbeda
    
    // Contoh 1: Jika model di schema.prisma adalah "SUSAnswer"
    await prisma.sUSAnswer.deleteMany({
      where: { respondenId: respondenId }
    }).catch(() => {
      // Jika model tidak ditemukan, coba dengan nama lain
      console.log("Model sUSAnswer mungkin tidak ditemukan");
    });

    // Contoh 2: Atau jika model di schema.prisma adalah "SusAnswer"
    try {
      await prisma.sUSAnswer.deleteMany({
        where: { respondenId: respondenId }
      });
    } catch (e) {
      console.log("Model susAnswer mungkin tidak ditemukan");
    }

    // Hapus taskResults
    await prisma.taskResult.deleteMany({
      where: { respondenId: respondenId }
    });

    // Hapus responden
    await prisma.responden.delete({
      where: { id: respondenId }
    });

    return NextResponse.json({
      success: true,
      message: "Responden berhasil dihapus"
    });
  } catch (error: any) {
    console.error("Error deleting respondent:", error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: "Responden tidak ditemukan" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Gagal menghapus responden",
        details: error.message 
      },
      { status: 500 }
    );
  }
}