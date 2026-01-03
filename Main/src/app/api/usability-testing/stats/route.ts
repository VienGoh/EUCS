// app/api/usability-testing/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const platformId = searchParams.get("platformId");

    const whereClause: any = {};
    if (platformId) {
      whereClause.responden = {
        platformId: parseInt(platformId)
      };
    }

    // Data untuk task performance
    const tasks = await prisma.task.findMany({
      include: {
        taskResults: {
          where: whereClause,
          include: {
            responden: {
              include: {
                platform: true
              }
            }
          }
        }
      }
    });

    // Data untuk success rate per platform
    const platformStats = await prisma.platform.findMany({
      include: {
        responden: {
          include: {
            taskResults: {
              include: {
                task: true
              }
            }
          }
        }
      }
    });

    // Format data platform stats
    const platformData = platformStats.map(platform => {
      const allTaskResults = platform.responden.flatMap(r => r.taskResults);
      const totalTasks = allTaskResults.length;
      const successTasks = allTaskResults.filter(r => r.success).length;
      const successRate = totalTasks === 0 ? 0 : Math.round((successTasks / totalTasks) * 100);
      
      // Hitung average time per platform
      const avgTime = allTaskResults.length > 0 
        ? Math.round(allTaskResults.reduce((sum, r) => sum + r.timeOnTask, 0) / allTaskResults.length)
        : 0;

      // Hitung average errors per platform
      const avgErrors = allTaskResults.length > 0 
        ? parseFloat((allTaskResults.reduce((sum, r) => sum + r.errorCount, 0) / allTaskResults.length).toFixed(1))
        : 0;

      return {
        platform: platform.name,
        totalResponden: platform.responden.length,
        totalTasks,
        successTasks,
        successRate,
        avgTime,
        avgErrors,
        color: platform.name === "Shopee" ? "#FF6B35" : "#00A8E8"
      };
    });

    // Format data task performance
    const taskPerformance = tasks.map(task => {
      const results = task.taskResults;
      const total = results.length;
      const success = results.filter(r => r.success).length;
      const avgTime = results.reduce((sum, r) => sum + r.timeOnTask, 0) / (total || 1);
      const avgError = results.reduce((sum, r) => sum + r.errorCount, 0) / (total || 1);

      // Group by platform
      const platformBreakdown = platformStats.map(platform => {
        const platformResults = results.filter(r => 
          r.responden.platformId === platform.id
        );
        const platformTotal = platformResults.length;
        const platformSuccess = platformResults.filter(r => r.success).length;
        const platformSuccessRate = platformTotal === 0 ? 0 : 
          Math.round((platformSuccess / platformTotal) * 100);

        return {
          platform: platform.name,
          total: platformTotal,
          successRate: platformSuccessRate,
          color: platform.name === "Shopee" ? "#FF6B35" : "#00A8E8"
        };
      });

      return {
        taskId: task.id,
        taskName: task.namaTask,
        description: task.deskripsi,
        totalAttempts: total,
        successRate: total === 0 ? 0 : Math.round((success / total) * 100),
        avgTime: Math.round(avgTime),
        avgErrors: parseFloat(avgError.toFixed(1)),
        platformBreakdown
      };
    });

    // Data untuk time distribution
    const timeDistribution = tasks.map(task => {
      const results = task.taskResults;
      const times = results.map(r => r.timeOnTask);
      
      // Kategorikan waktu
      const categories = {
        "Sangat Cepat (< 30s)": times.filter(t => t < 30).length,
        "Cepat (30-60s)": times.filter(t => t >= 30 && t < 60).length,
        "Sedang (60-120s)": times.filter(t => t >= 60 && t < 120).length,
        "Lambat (120-180s)": times.filter(t => t >= 120 && t < 180).length,
        "Sangat Lambat (> 180s)": times.filter(t => t >= 180).length
      };

      return {
        task: task.namaTask,
        ...categories
      };
    });

    // Data untuk error analysis
    const errorAnalysis = tasks.map(task => {
      const results = task.taskResults;
      
      const errorRanges = {
        "0 Error": results.filter(r => r.errorCount === 0).length,
        "1-2 Error": results.filter(r => r.errorCount >= 1 && r.errorCount <= 2).length,
        "3-5 Error": results.filter(r => r.errorCount >= 3 && r.errorCount <= 5).length,
        ">5 Error": results.filter(r => r.errorCount > 5).length
      };

      return {
        task: task.namaTask,
        ...errorRanges
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        platformData,
        taskPerformance,
        timeDistribution,
        errorAnalysis,
        totalTasks: tasks.reduce((sum, task) => sum + task.taskResults.length, 0),
        totalSuccess: tasks.reduce((sum, task) => 
          sum + task.taskResults.filter(r => r.success).length, 0
        ),
        overallSuccessRate: tasks.reduce((sum, task) => {
          const results = task.taskResults;
          const total = results.length;
          const success = results.filter(r => r.success).length;
          return total === 0 ? sum : sum + (success / total);
        }, 0) / tasks.filter(task => task.taskResults.length > 0).length * 100 || 0
      }
    });
  } catch (error) {
    console.error("Error fetching usability testing stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch usability testing statistics" },
      { status: 500 }
    );
  }
}