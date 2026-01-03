// app/api/testing/stats/route.ts - PERBAIKI
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Cari task belanja
    const belanjaTask = await prisma.task.findFirst({
      where: {
        namaTask: {
          contains: "Belanja" // Case sensitive search
        }
      }
    });

    // Jika tidak ada, gunakan task pertama
    const taskCondition = belanjaTask 
      ? { taskId: belanjaTask.id }
      : {};

    const [
      totalSessions,
      recentSessions,
      successCount,
      platformCounts
    ] = await Promise.all([
      // Total sessions
      prisma.taskResult.count({
        where: taskCondition
      }),
      
      // Recent sessions (last 24 hours)
      prisma.taskResult.findMany({
        where: {
          ...taskCondition,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        include: {
          responden: {
            include: {
              platform: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 20
      }),
      
      // Success count
      prisma.taskResult.count({
        where: {
          ...taskCondition,
          success: true
        }
      }),
      
      // Platform distribution
      prisma.taskResult.groupBy({
        by: ['respondenId'],
        where: taskCondition,
        _count: {
          id: true
        }
      })
    ]);

    // Hitung platform stats
    const platformStats: Record<string, number> = {};
    for (const result of platformCounts) {
      const responden = await prisma.responden.findUnique({
        where: { id: result.respondenId },
        include: { platform: true }
      });
      if (responden?.platform.name) {
        platformStats[responden.platform.name] = 
          (platformStats[responden.platform.name] || 0) + 1;
      }
    }

    // Calculate metrics
    const successRate = totalSessions > 0 
      ? Math.round((successCount / totalSessions) * 100) 
      : 0;

    const avgDuration = recentSessions.length > 0
      ? Math.round(recentSessions.reduce((sum, s) => sum + s.timeOnTask, 0) / recentSessions.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalSessions,
        activeSessions: recentSessions.filter(s => 
          new Date(s.createdAt).getTime() > Date.now() - 5 * 60 * 1000
        ).length,
        successRate,
        avgDuration,
        platformStats,
        recentSessions: recentSessions.map(s => ({
          id: s.id,
          respondenName: s.responden.nama,
          platform: s.responden.platform.name,
          duration: s.timeOnTask,
          success: s.success,
          time: s.createdAt.toISOString()
        }))
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}