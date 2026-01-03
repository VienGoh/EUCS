import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Total task
  const totalTask = await prisma.taskResult.count();

  const successTask = await prisma.taskResult.count({
    where: { success: true },
  });

  const avgTime = await prisma.taskResult.aggregate({
    _avg: { timeOnTask: true },
  });

  const errorSum = await prisma.taskResult.aggregate({
    _sum: { errorCount: true },
  });

  // Rata-rata SUS
  const susAnswers = await prisma.susAnswer.findMany({
    include: { question: true },
  });

  let susTotal = 0;
  let respondenSet = new Set<number>();

  susAnswers.forEach((a) => {
    respondenSet.add(a.respondenId);
    if (a.question.isPositive) {
      susTotal += a.score - 1;
    } else {
      susTotal += 5 - a.score;
    }
  });

  const avgSUS =
    respondenSet.size > 0
      ? (susTotal / respondenSet.size) * 2.5
      : 0;

  return NextResponse.json({
    successRate: totalTask > 0 ? (successTask / totalTask) * 100 : 0,
    avgTime: avgTime._avg.timeOnTask ?? 0,
    errorRate:
      totalTask > 0 ? (errorSum._sum.errorCount ?? 0) / totalTask : 0,
    avgSUS,
  });
}
