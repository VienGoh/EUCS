// app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      totalResponden,
      platforms,
      taskResults,
      answers
    ] = await Promise.all([
      prisma.responden.count(),
      prisma.platform.findMany({
        include: {
          responden: true
        }
      }),
      prisma.taskResult.findMany(),
      prisma.sUSAnswer.findMany({
        include: { question: true }
      })
    ]);

    // Hitung success rate
    const totalTask = taskResults.length;
    const successTask = taskResults.filter(r => r.success).length;
    const successRate = totalTask === 0 ? 0 : Math.round((successTask / totalTask) * 100);

    // Hitung SUS score
    const susPerResponden: Record<number, number> = {};
    for (const ans of answers) {
      const base = ans.question.isPositive ? ans.score - 1 : 5 - ans.score;
      susPerResponden[ans.respondenId] = (susPerResponden[ans.respondenId] || 0) + base;
    }
    const susValues = Object.values(susPerResponden).map((total) => total * 2.5);
    const avgSUS = susValues.length === 0 ? 0 : Math.round(susValues.reduce((a, b) => a + b, 0) / susValues.length);

    // Platform distribution
    const platformDistribution = platforms.map(p => ({
      name: p.name,
      jumlah: p.responden.length,
      fill: p.name === "Shopee" ? "#FF6B35" : "#00A8E8"
    }));

    // Gender distribution
    const genderDistribution = await prisma.responden.groupBy({
      by: ['jenisKelamin'],
      _count: {
        id: true
      }
    });

    const genderData = genderDistribution.map(g => ({
      name: g.jenisKelamin,
      value: g._count.id,
      fill: g.jenisKelamin === "Laki-laki" ? "#3B82F6" : "#EC4899"
    }));

    // Task performance
    const tasks = await prisma.task.findMany({
      include: {
        taskResults: {
          select: {
            success: true,
            timeOnTask: true,
            errorCount: true
          }
        }
      }
    });

    const taskPerformance = tasks.map(task => {
      const results = task.taskResults;
      const total = results.length;
      const success = results.filter(r => r.success).length;
      const avgTime = results.reduce((sum, r) => sum + r.timeOnTask, 0) / (total || 1);
      const avgError = results.reduce((sum, r) => sum + r.errorCount, 0) / (total || 1);

      return {
        task: task.namaTask,
        successRate: total === 0 ? 0 : Math.round((success / total) * 100),
        avgTime: Math.round(avgTime),
        avgError: avgError.toFixed(1)
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalResponden,
        successRate,
        avgSUS,
        platformDistribution,
        genderData,
        taskPerformance,
        totalTask,
        successTask
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}