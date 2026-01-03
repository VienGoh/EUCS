// app/api/task-results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Simpan hasil task dari usability testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validasi input
    if (!body.respondenId || !body.taskId) {
      return NextResponse.json(
        { success: false, error: "respondenId dan taskId diperlukan" },
        { status: 400 }
      );
    }

    // Cari atau buat task "Proses Belanja Online"
    let taskId = body.taskId;
    if (!taskId) {
      const belanjaTask = await prisma.task.findFirst({
        where: {
          namaTask: {
            contains: "Belanja"
          }
        }
      });
      
      if (belanjaTask) {
        taskId = belanjaTask.id;
      } else {
        // Buat task baru jika tidak ada
        const newTask = await prisma.task.create({
          data: {
            namaTask: "Proses Belanja Online",
            deskripsi: "Simulasi proses belanja dari pencarian hingga checkout"
          }
        });
        taskId = newTask.id;
      }
    }

    // Simpan task result
    const taskResult = await prisma.taskResult.create({
      data: {
        respondenId: parseInt(body.respondenId),
        taskId: taskId,
        success: body.success ?? true,
        timeOnTask: body.timeOnTask ?? 0,
        errorCount: body.errorCount ?? 0
      },
      include: {
        responden: true,
        task: true
      }
    });

    return NextResponse.json({
      success: true,
      data: taskResult,
      message: "Hasil task berhasil disimpan"
    });
  } catch (error) {
    console.error("Error saving task result:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Gagal menyimpan hasil task",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// GET: Ambil task results
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const respondenId = searchParams.get("respondenId");
    const taskId = searchParams.get("taskId");

    const whereClause: any = {};
    if (respondenId) whereClause.respondenId = parseInt(respondenId);
    if (taskId) whereClause.taskId = parseInt(taskId);

    const taskResults = await prisma.taskResult.findMany({
      where: whereClause,
      include: {
        responden: true,
        task: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json({
      success: true,
      data: taskResults,
      count: taskResults.length
    });
  } catch (error) {
    console.error("Error fetching task results:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data task results" },
      { status: 500 }
    );
  }
}