import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const totalRespondents = await prisma.respondent.count();
  const totalSurveys = await prisma.survey.count();
  const completedSurveys = await prisma.survey.count({
    where: { completed: true },
  });

  return NextResponse.json({
    totalRespondents,
    totalSurveys,
    completedSurveys,
    completionRate:
      totalSurveys === 0
        ? 0
        : Math.round((completedSurveys / totalSurveys) * 100),
  });
}
