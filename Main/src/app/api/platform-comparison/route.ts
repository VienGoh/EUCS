import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      include: {
        responden: {
          include: {
            taskResults: true,
            susAnswers: {
              include: { question: true }
            }
          }
        }
      }
    });

    const platformComparisonData = await Promise.all(
      platforms.map(async (platform) => {
        const responden = platform.responden;
        
        // Hitung SUS score
        const susScores = responden.map(r => {
          const answers = r.susAnswers;
          if (answers.length === 0) return null;
          
          const total = answers.reduce((sum, ans) => {
            const base = ans.question.isPositive ? ans.score - 1 : 5 - ans.score;
            return sum + base;
          }, 0);
          
          return total * 2.5;
        }).filter(score => score !== null) as number[];
        
        const avgSUS = susScores.length > 0 
          ? susScores.reduce((a, b) => a + b, 0) / susScores.length 
          : 0;
        
        // Hitung task metrics
        const taskResults = responden.flatMap(r => r.taskResults);
        const successRate = taskResults.length > 0
          ? (taskResults.filter(tr => tr.success).length / taskResults.length) * 100
          : 0;
        
        const avgTime = taskResults.length > 0
          ? taskResults.reduce((sum, tr) => sum + tr.timeOnTask, 0) / taskResults.length
          : 0;

        return {
          platform: platform.name,
          avgSUS: parseFloat(avgSUS.toFixed(1)),
          successRate: Math.round(successRate),
          avgTime: Math.round(avgTime),
          totalResponden: responden.length
        };
      })
    );

    return NextResponse.json(platformComparisonData);
  } catch (error) {
    console.error("Error fetching platform comparison:", error);
    return NextResponse.json(
      { error: "Failed to fetch platform comparison data" },
      { status: 500 }
    );
  }
}