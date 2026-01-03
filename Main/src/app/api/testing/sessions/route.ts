// app/api/testing/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil semua testing sessions
export async function GET(request: NextRequest) {
  try {
    // Cari task ID untuk "Proses Belanja Online"
    const belanjaTask = await prisma.task.findFirst({
      where: {
        OR: [
          { namaTask: { contains: "belanja" } },
          { namaTask: { contains: "Belanja" } },
          { namaTask: { contains: "Beli" } }
        ]
      }
    });

    // Jika tidak ada task belanja, ambil semua task results
    const whereCondition = belanjaTask 
      ? { taskId: belanjaTask.id }
      : {};

    const sessions = await prisma.taskResult.findMany({
      where: whereCondition,
      include: {
        responden: {
          include: {
            platform: true
          }
        },
        task: true
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50
    });

    // Format response
    const formattedSessions = sessions.map(session => {
      // Hitung waktu mulai (diasumsikan waktu mulai adalah createdAt - timeOnTask)
      const startedAt = new Date(
        session.createdAt.getTime() - (session.timeOnTask * 1000)
      );
      
      return {
        id: session.id,
        responden: {
          id: session.responden.id,
          nama: session.responden.nama,
          platform: session.responden.platform
        },
        task: session.task.namaTask,
        startedAt: startedAt.toISOString(),
        endedAt: session.createdAt.toISOString(),
        duration: session.timeOnTask,
        success: session.success,
        timeOnTask: session.timeOnTask,
        errorCount: session.errorCount,
        createdAt: session.createdAt.toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedSessions,
      count: formattedSessions.length,
      message: belanjaTask 
        ? "Testing sessions for shopping task retrieved" 
        : "All task results retrieved"
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch testing sessions",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}