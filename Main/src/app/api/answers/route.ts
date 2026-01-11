import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { surveyId, answers } = body;

  const data = answers.map((a: any) => ({
    surveyId,
    questionId: a.questionId,
    value: a.value,
  }));

  await prisma.answer.createMany({
    data,
    skipDuplicates: true,
  });

  await prisma.survey.update({
    where: { id: surveyId },
    data: {
      completed: true,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ message: "Jawaban berhasil disimpan" });
}
